'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

interface ReflectionOrbProps {
    onInfluenceAdded?: () => void;
}

type Mood = 'neutral' | 'warm' | 'cool';

export default function ReflectionOrb({ onInfluenceAdded }: ReflectionOrbProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentMood, setCurrentMood] = useState<Mood>('neutral');
    const [showTextInput, setShowTextInput] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [isClient, setIsClient] = useState(false);

    // Speech API state
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [speechSupported, setSpeechSupported] = useState(false);
    const [showTranscript, setShowTranscript] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const transcriptRef = useRef<string>('');
    const isManualStopRef = useRef<boolean>(false);
    // Note: No timeoutRef needed, since all timeouts are removed

    // Type guard for browser SpeechRecognition
    const getSpeechRecognition = () => {
        if (typeof window !== 'undefined') {
            return (
                (window as any).webkitSpeechRecognition ||
                (window as any).SpeechRecognition ||
                null
            );
        }
        return null;
    };

    // Ensure client-side rendering to avoid hydration mismatch
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Initialize Speech Recognition once on client
    useEffect(() => {
        if (!isClient) return;

        console.log('🔧 Initializing Speech Recognition...');

        const SpeechRecognition = getSpeechRecognition();

        if (SpeechRecognition) {
            console.log('✅ Speech Recognition API available:', SpeechRecognition.name);
            setSpeechSupported(true);

            const recognition = new SpeechRecognition();
            recognition.continuous = true;             // Now true for unlimited listening (until user stops)
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            recognition.maxAlternatives = 1;

            console.log('⚙️ Recognition configured:', {
                continuous: recognition.continuous,
                interimResults: recognition.interimResults,
                lang: recognition.lang,
                maxAlternatives: recognition.maxAlternatives
            });

            recognition.onstart = () => {
                setIsListening(true);
                console.log('🎤 Speech recognition started at:', new Date().toISOString());

                navigator.mediaDevices?.getUserMedia({ audio: true })
                    .then(() => console.log('✅ Microphone access confirmed'))
                    .catch(err => console.log('❌ Microphone access issue:', err));
            };

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                const currentTranscript = finalTranscript || interimTranscript;
                setTranscript(currentTranscript);
                transcriptRef.current = currentTranscript;
            };

            recognition.onend = () => {
                console.log('🛑 Speech recognition ended at:', new Date().toISOString());
                setIsListening(false);
                setShowTranscript(false);

                if (transcriptRef.current.trim() && !isManualStopRef.current) {
                    handleSaveInfluence(transcriptRef.current);
                }
                isManualStopRef.current = false;
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('❌ Speech recognition error:', event.error);
                setIsListening(false);
                setShowTranscript(false);

                switch (event.error) {
                    case 'not-allowed':
                    case 'service-not-allowed':
                        setSpeechSupported(false);
                        setShowTextInput(true);
                        break;
                    case 'audio-capture':
                    case 'network':
                        setShowTextInput(true);
                        break;
                    default:
                        // Ignore, voice remains enabled
                        break;
                }
            };

            // Set up audio/speech events for debugging
            recognition.onaudiostart = () => console.log('🔊 Audio capture started');
            recognition.onaudioend = () => console.log('🔇 Audio capture ended');
            recognition.onsoundstart = () => console.log('👂 Sound detected');
            recognition.onsoundend = () => console.log('🤫 Sound ended');
            recognition.onspeechstart = () => console.log('🗣️ Speech started');
            recognition.onspeechend = () => console.log('😶 Speech ended');
            recognition.onnomatch = () => console.log('❓ No speech match found');

            // Store the recognition instance in ref
            recognitionRef.current = recognition;
            console.log('✅ Speech Recognition instance stored in ref');
        } else {
            setSpeechSupported(false);
            console.log('❌ Speech recognition not supported in this browser');
        }

        // Cleanup on unmount
        return () => {
            recognitionRef.current?.abort();
        };
    }, [isClient]);

    // Handle saving influence to database
    const handleSaveInfluence = async (content: string) => {
        if (!content.trim()) return;

        setIsProcessing(true);
        try {
            const { data, error } = await supabase
                .from('influences')
                .insert([{ content: content.trim() }])
                .select();

            if (error) throw error;

            // Reset states
            setTranscript('');
            setTextInput('');
            setShowTextInput(false);
            setShowTranscript(false);

            // Notify parent component to refresh the list
            if (onInfluenceAdded) {
                onInfluenceAdded();
            }
        } catch (error) {
            console.error('Error saving influence:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // Auto-save transcript when listening stops
    useEffect(() => {
        if (!isListening && transcript.trim() && !isProcessing) {
            const timer = setTimeout(() => {
                handleSaveInfluence(transcript);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isListening, transcript, isProcessing, handleSaveInfluence]);

    // Start listening using the persistent recognitionRef
    const startListening = () => {
        console.log('🚀 Attempting to start speech recognition...');
        console.log('📊 Current state:', {
            isListening,
            hasRecognition: !!recognitionRef.current,
            speechSupported
        });

        if (!isListening && recognitionRef.current && speechSupported) {
            try {
                console.log('🔄 Resetting state and starting...');

                setTranscript('');
                transcriptRef.current = '';
                isManualStopRef.current = false;
                setShowTranscript(true);

                console.log('🎯 Starting recognition...');
                recognitionRef.current.start();
            } catch (err) {
                console.error('💥 Error starting speech recognition:', err);
                setSpeechSupported(false);
                setShowTextInput(true);
            }
        } else {
            console.log('⚠️ Cannot start - conditions not met:', {
                isListening,
                hasRecognition: !!recognitionRef.current,
                speechSupported
            });
        }
    };

    // Stop listening using the persistent recognitionRef
    const stopListening = () => {
        if (isListening && recognitionRef.current) {
            try {
                isManualStopRef.current = true;
                recognitionRef.current.stop();
            } catch (err) {
                console.error('Stop error:', err);
            }
        }
    };

    // Handle orb click/tap
    const handleOrbInteraction = (e: React.PointerEvent) => {
        e.preventDefault();

        if (!isClient || !speechSupported) {
            setShowTextInput(true);
            return;
        }

        if (isListening) {
            console.log('🛑 User clicked while listening - stopping...');
            stopListening();
        } else {
            console.log('▶️ User clicked to start listening');
            startListening();
        }
    };

    // Handle text form submission
    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (textInput.trim()) {
            handleSaveInfluence(textInput);
        }
    };

    // Dynamic mood based on state
    useEffect(() => {
        if (isListening) {
            setCurrentMood('warm');
        } else if (isProcessing) {
            setCurrentMood('cool');
        } else {
            setCurrentMood('neutral');
        }
    }, [isListening, isProcessing]);

    // Tailwind color and glow generators
    const getMoodGradient = (mood: Mood) => {
        switch (mood) {
            case 'warm': return 'from-orange-400 to-red-500';
            case 'cool': return 'from-blue-400 to-purple-500';
            default: return 'from-neutral-300 to-neutral-500';
        }
    };

    const getGlowColor = (mood: Mood) => {
        switch (mood) {
            case 'warm': return 'shadow-2xl shadow-orange-500/20';
            case 'cool': return 'shadow-2xl shadow-blue-500/20';
            default: return 'shadow-2xl shadow-neutral-500/10';
        }
    };

    return (
        <div className="flex flex-col items-center space-y-8">
            {/* The Orb */}
            <div className="relative">
                <motion.div
                    className={`w-32 h-32 rounded-full bg-gradient-to-br ${getMoodGradient(currentMood)} ${getGlowColor(currentMood)} cursor-pointer select-none flex items-center justify-center`}
                    animate={{
                        scale: isListening ? [1, 1.1, 1] : isProcessing ? [1, 0.95, 1] : 1,
                        opacity: isListening || isProcessing ? 0.9 : 0.7
                    }}
                    transition={{
                        duration: isListening ? 2 : 1,
                        repeat: isListening ? Infinity : 0,
                        ease: "easeInOut"
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onPointerDown={handleOrbInteraction}
                >
                    {/* Inner orb content */}
                    <motion.div
                        className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center"
                        animate={{
                            scale: isListening ? [1, 1.2, 1] : 1,
                            opacity: isListening ? [0.3, 0.7, 0.3] : 0.4
                        }}
                        transition={{
                            duration: 1.5,
                            repeat: isListening ? Infinity : 0,
                            ease: "easeInOut"
                        }}
                    >
                        <motion.div
                            className="w-8 h-8 rounded-full bg-white/30"
                            animate={{
                                scale: isListening ? [1, 0.8, 1] : 1
                            }}
                            transition={{
                                duration: 1,
                                repeat: isListening ? Infinity : 0,
                                ease: "easeInOut"
                            }}
                        />
                    </motion.div>
                </motion.div>

                {/* Ripple effect when listening */}
                <AnimatePresence>
                    {isListening && (
                        <motion.div
                            className="absolute inset-0 rounded-full border-2 border-white/30"
                            initial={{ scale: 1, opacity: 0.6 }}
                            animate={{ scale: 2, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeOut"
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Status Text */}
            <motion.p
                className={`text-sm font-light tracking-wide text-center ${isListening ? 'text-orange-300 font-medium' : 'text-neutral-400'}`}
                animate={{
                    opacity: isListening || isProcessing ? 1 : 0.6,
                    scale: isListening ? [1, 1.05, 1] : 1
                }}
                transition={{
                    scale: {
                        duration: 1.5,
                        repeat: isListening ? Infinity : 0,
                        ease: "easeInOut"
                    }
                }}
            >
                {!isClient ? 'Tap to add your influence' :
                    !speechSupported ? 'Tap to type your influence' :
                        isListening ? '🎤 Listening... Tap to stop' :
                            isProcessing ? 'Saving...' :
                                'Tap to speak your influence'}
            </motion.p>

            {/* Manual fallback button for text input */}
            {isClient && speechSupported && !isListening && !isProcessing && !showTextInput && (
                <motion.button
                    onClick={() => setShowTextInput(true)}
                    className="text-neutral-500 text-xs hover:text-neutral-400 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    whileHover={{ opacity: 1 }}
                >
                    Or tap here to type instead
                </motion.button>
            )}

            {/* Speech retry button when speech is still supported */}
            {isClient && speechSupported && !isListening && !isProcessing && showTextInput && (
                <motion.button
                    onClick={() => {
                        setShowTextInput(false);
                        startListening();
                    }}
                    className="text-orange-500 text-xs hover:text-orange-400 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    whileHover={{ opacity: 1 }}
                >
                    🎤 Try speech recognition again
                </motion.button>
            )}

            {/* Live Transcript Display */}
            <AnimatePresence>
                {showTranscript && transcript && (
                    <motion.div
                        className="max-w-md p-4 bg-neutral-800/30 rounded-lg border border-neutral-700/50 backdrop-blur-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <p className="text-neutral-300 text-sm italic">&quot;{transcript}&quot;</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Text Input Form */}
            <AnimatePresence>
                {showTextInput && (
                    <motion.div
                        className="w-full max-w-md"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <form onSubmit={handleTextSubmit} className="space-y-3">
                            <textarea
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="Type your influence here..."
                                className="w-full h-24 p-3 bg-neutral-800/50 border border-neutral-700/50 rounded-lg text-neutral-300 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 resize-none"
                                autoFocus
                            />
                            <div className="flex space-x-3">
                                <button
                                    type="submit"
                                    disabled={isProcessing || !textInput.trim()}
                                    className="flex-1 px-4 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-300 text-sm font-light rounded-full border border-neutral-700/50 transition-all duration-300 backdrop-blur-sm disabled:opacity-50"
                                >
                                    {isProcessing ? 'Saving...' : 'Save Influence'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTextInput(false);
                                        setTextInput('');
                                    }}
                                    className="px-4 py-2 bg-neutral-900/50 hover:bg-neutral-800/50 text-neutral-400 text-sm font-light rounded-full border border-neutral-700/50 transition-all duration-300 backdrop-blur-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Debug info for speech recognition */}
            {process.env.NODE_ENV === 'development' && isClient && (
                <div className="text-xs text-neutral-600 text-center">
                    <p>Speech supported: {speechSupported ? 'Yes' : 'No'}</p>
                    <p>Listening: {isListening ? 'Yes' : 'No'}</p>
                    {transcript && <p>Transcript: "{transcript}"</p>}
                </div>
            )}
        </div>
    );
}

// Type declarations for Speech Recognition
declare global {
    interface Window {
        webkitSpeechRecognition: any;
        SpeechRecognition: any;
    }
}
