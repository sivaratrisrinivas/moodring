'use client';

import { motion } from 'framer-motion';
import { useFocus } from '../context/FocusContext';

// Define the shape of our data objects that the card will receive
type Influence = {
    id: number;
    created_at: string;
    content: string;
};
type Link = {
    id: number;
    source_id: number;
    target_id: number;
};

// Define the props for our component
interface InfluenceCardProps {
    influence: Influence;
    links: Link[];
    allInfluences: Influence[];
    onAnalyze: (id: number) => void;
    onLink: (influence: Influence) => void;
    isAnalyzing: boolean;
    analysisText?: string;
    onDelete: (id: number) => void;
}

export default function InfluenceCard({
    influence,
    links,
    allInfluences,
    onAnalyze,
    onLink,
    isAnalyzing,
    analysisText,
    onDelete,
}: InfluenceCardProps) {
    const { focusedId, setFocusedId } = useFocus();
    const isFocused = focusedId === influence.id;

    const outgoingLinks = links.filter((link) => link.source_id === influence.id);
    const incomingLinks = links.filter((link) => link.target_id === influence.id);

    return (
        <motion.li
            className="mb-10 ml-6 z-0"
            animate={{
                scale: isFocused ? 1.05 : 1,
                zIndex: isFocused ? 20 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            layout
        >
            <span className="absolute flex items-center justify-center w-3 h-3 bg-neutral-700 rounded-full -left-1.5 ring-4 ring-neutral-800/40"></span>
            <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 space-y-3">
                <p className="text-neutral-200 whitespace-pre-wrap">{influence.content}</p>

                {(outgoingLinks.length > 0 || incomingLinks.length > 0) && (
                    <div className="pt-3 border-t border-neutral-800 space-y-2">
                        {outgoingLinks.map((link) => {
                            const target = allInfluences.find((inf) => inf.id === link.target_id);
                            return (<div key={link.id} className="text-xs"> <span className="text-neutral-500">→ Leads to: </span> <span className="text-neutral-300 italic">"{target?.content}"</span> </div>);
                        })}
                        {incomingLinks.map((link) => {
                            const source = allInfluences.find((inf) => inf.id === link.source_id);
                            return (<div key={link.id} className="text-xs"> <span className="text-neutral-500">← From: </span> <span className="text-neutral-300 italic">"{source?.content}"</span> </div>);
                        })}
                    </div>
                )}

                {isAnalyzing && <p className="text-sm italic text-purple-400">Analyzing...</p>}
                {analysisText && !isAnalyzing && (
                    <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-md text-sm">
                        <p className="text-purple-200 whitespace-pre-wrap">{analysisText}</p>
                    </div>
                )}

                <div className="flex justify-between items-center pt-3 border-t border-neutral-800">
                    <p
                        className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-400"
                        onClick={() => setFocusedId(influence.id)}
                    >
                        {new Date(influence.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </p>
                    <div className="flex items-center space-x-3">
                        <button
                            type="button"
                            onClick={() => onAnalyze(influence.id)}
                            disabled={isAnalyzing}
                            className="px-3 py-1.5 bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-300 text-xs font-light rounded-full border border-neutral-700/50 transition-all duration-300 backdrop-blur-sm disabled:opacity-50 cursor-pointer"
                        >
                            {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                        </button>
                        <button
                            type="button"
                            onClick={() => onLink(influence)}
                            className="px-3 py-1.5 bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-300 text-xs font-light rounded-full border border-neutral-700/50 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                        >
                            Link
                        </button>
                        <button
                            type="button"
                            onClick={() => onDelete(influence.id)}
                            className="px-3 py-1.5 bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-300 text-xs font-light rounded-full border border-neutral-700/50 transition-all duration-300 backdrop-blur-sm cursor-pointer"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </motion.li>
    );
}