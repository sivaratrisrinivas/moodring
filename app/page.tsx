'use client';

import InfluenceForm from './components/InfluenceForm';
import InfluenceList from './components/InfluenceList';
import { useState } from 'react';
import { generateReflectionAction } from './actions';

export default function Home() {
  const [summary, setSummary] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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

  return (
    <main className="flex min-h-screen flex-col items-center p-12 sm:p-24 bg-neutral-950 text-white">
      <h1 className="text-5xl font-extrabold mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        moodring
      </h1>

      <div className="w-full max-w-lg mb-12 p-4 border border-neutral-800 rounded-lg text-center">
        <button
          onClick={handleGenerateClick}
          disabled={isGenerating}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-neutral-600"
        >
          {isGenerating ? 'Generating Reflection...' : 'Generate My Weekly Reflection'}
        </button>
        {summary && (
          <p className="mt-4 text-left text-neutral-300 bg-neutral-900 p-3 rounded-md italic">
            {summary}
          </p>
        )}
      </div>

      <InfluenceForm />
      <InfluenceList />
    </main>
  );
}