'use client';

import ReflectionOrb from './components/ReflectionOrb';
import InfluenceList, { InfluenceListRef } from './components/InfluenceList';
import { useState, useRef } from 'react';
import { generateReflectionAction } from './actions';
import { FocusProvider, useFocus } from './context/FocusContext';
import { motion, AnimatePresence } from 'framer-motion';

// We've moved the main content into its own component to use the context
function AppContent() {
  const { focusedId, setFocusedId } = useFocus();
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const influenceListRef = useRef<InfluenceListRef>(null);

  const handleGenerateClick = async () => {
    setIsGenerating(true);
    setSummary('');
    const result = await generateReflectionAction();
    if (result.error) {
      setSummary(result.error);
    } else if (result.summary) {
      setSummary(result.summary);
    }
    setIsGenerating(false);
  };

  const handleInfluenceAdded = () => {
    // Refresh the influence list when a new influence is added via the orb
    influenceListRef.current?.refreshData();
  };

  return (
    <>
      <AnimatePresence>
        {focusedId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFocusedId(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-10"
          />
        )}
      </AnimatePresence>

      <main className="flex min-h-screen flex-col items-center p-12 sm:p-24 bg-neutral-950 text-white relative z-0">
        <motion.h1
          className="text-4xl font-thin mb-16 bg-gradient-to-r from-neutral-200 to-neutral-400 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          moodring
        </motion.h1>

        {/* The Reflection Orb - Primary Interaction */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        >
          <ReflectionOrb onInfluenceAdded={handleInfluenceAdded} />
        </motion.div>

        {/* Weekly Reflection - Secondary Action */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
        >
          <button
            onClick={handleGenerateClick}
            disabled={isGenerating}
            className="px-6 py-3 bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-300 text-sm font-light rounded-full border border-neutral-700/50 transition-all duration-300 backdrop-blur-sm"
          >
            {isGenerating ? 'Reflecting...' : 'Generate Weekly Reflection'}
          </button>

          <AnimatePresence>
            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 max-w-lg"
              >
                <div className="p-4 bg-neutral-900/60 backdrop-blur-sm rounded-2xl border border-neutral-800/50">
                  <p className="text-neutral-300 text-sm leading-relaxed italic">
                    {summary}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <InfluenceList ref={influenceListRef} />
      </main>
    </>
  );
}

// The main export wraps the app in the provider
export default function Home() {
  return (
    <FocusProvider>
      <AppContent />
    </FocusProvider>
  );
}