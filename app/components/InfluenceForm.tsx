'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function InfluenceForm() {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (content.trim().length === 0) {
            alert('Cannot save an empty influence.');
            return;
        }
        setIsLoading(true);
        const { error } = await supabase.from('influences').insert([{ content }]);
        setIsLoading(false);
        if (error) {
            alert('Failed to save influence: ' + error.message);
        } else {
            setContent('');
            // We need a way to refetch the list, which we'll address later
            window.location.reload();
        }
    };

    return (
        <form className="w-full max-w-lg" onSubmit={handleSubmit}>
            <textarea
                name="content"
                rows={5}
                className="w-full p-4 rounded-xl shadow-neu-inset bg-neu-bg text-neutral-700 placeholder-neutral-500 focus:outline-none"
                placeholder="What influenced you today? A link, a quote, a conversation, a thought..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading}
            />
            <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-6 p-4 rounded-xl shadow-neu-outset bg-neu-bg text-blue-700 font-bold transition-all active:shadow-neu-inset disabled:opacity-70"
            >
                {isLoading ? 'Saving...' : 'Save Influence'}
            </button>
        </form>
    );
}