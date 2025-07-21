'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // 1. Import our Supabase client

export default function InfluenceForm() {
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false); // State for loading feedback

    // 2. Create the submission handler function
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault(); // Stop the page from reloading on submit

        if (content.trim().length === 0) {
            alert('Cannot save an empty influence.');
            return;
        }

        setIsLoading(true);

        const { error } = await supabase
            .from('influences')      // The table to insert into
            .insert([{ content: content }]); // The data to insert

        setIsLoading(false);

        if (error) {
            console.error('Error inserting data:', error);
            alert('Failed to save influence: ' + error.message);
        } else {
            console.log('Successfully saved influence!');
            setContent(''); // Clear the textarea on success
        }
    };

    return (
        // 3. Attach the handler to the form's onSubmit event
        <form className="w-full max-w-lg" onSubmit={handleSubmit}>
            <textarea
                name="content"
                rows={5}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                placeholder="What influenced you today? A link, a quote, a conversation, a thought..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isLoading} // Disable textarea while saving
            />
            <button
                type="submit"
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-neutral-600"
                disabled={isLoading} // Disable button while saving
            >
                {isLoading ? 'Saving...' : 'Save Influence'}
            </button>
        </form>
    );
}