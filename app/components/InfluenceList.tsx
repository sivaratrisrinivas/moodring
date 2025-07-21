'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

// Define the shape of our data objects
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

export default function InfluenceList() {
    const [influences, setInfluences] = useState<Influence[]>([]);
    const [links, setLinks] = useState<Link[]>([]); // 1. New state for our links
    const [loading, setLoading] = useState(true);
    const [linkingInfluence, setLinkingInfluence] = useState<Influence | null>(null);
    const [isLinking, setIsLinking] = useState(false);

    // 2. We'll create a single function to fetch all data
    const fetchData = async () => {
        setLoading(true);
        const [influencesRes, linksRes] = await Promise.all([
            supabase.from('influences').select('*').order('created_at', { ascending: false }),
            supabase.from('influence_links').select('*'),
        ]);

        if (influencesRes.error) console.error('Error fetching influences:', influencesRes.error);
        else if (influencesRes.data) setInfluences(influencesRes.data);

        if (linksRes.error) console.error('Error fetching links:', linksRes.error);
        else if (linksRes.data) setLinks(linksRes.data);

        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateLink = async (targetId: number) => {
        if (!linkingInfluence) return;
        setIsLinking(true);
        const { error } = await supabase.from('influence_links').insert({
            source_id: linkingInfluence.id,
            target_id: targetId,
        });
        if (error) {
            alert('Failed to create link: ' + error.message);
        } else {
            await fetchData(); // 3. Refetch data after creating a link to show it immediately
        }
        setIsLinking(false);
        setLinkingInfluence(null);
    };

    if (loading) {
        return <p className="mt-4 text-neutral-400">Loading influences...</p>;
    }

    return (
        <div className="w-full max-w-lg mt-12">
            <ol className="relative border-l border-neutral-700">
                {influences.map((influence) => {
                    // 4. Find the links for this specific influence
                    const outgoingLinks = links.filter((link) => link.source_id === influence.id);
                    const incomingLinks = links.filter((link) => link.target_id === influence.id);

                    return (
                        <li key={influence.id} className="mb-10 ml-6">
                            <span className="absolute flex items-center justify-center w-3 h-3 bg-blue-500 rounded-full -left-1.5 ring-4 ring-blue-500/20"></span>
                            <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                                <p className="text-neutral-200 whitespace-pre-wrap">{influence.content}</p>

                                {/* 5. New section to display the links */}
                                {(outgoingLinks.length > 0 || incomingLinks.length > 0) && (
                                    <div className="mt-3 pt-3 border-t border-neutral-800 space-y-2">
                                        {outgoingLinks.map((link) => {
                                            const target = influences.find((inf) => inf.id === link.target_id);
                                            return (
                                                <div key={link.id} className="text-xs">
                                                    <span className="text-neutral-500">→ Leads to: </span>
                                                    <span className="text-neutral-300 italic">"{target?.content}"</span>
                                                </div>
                                            );
                                        })}
                                        {incomingLinks.map((link) => {
                                            const source = influences.find((inf) => inf.id === link.source_id);
                                            return (
                                                <div key={link.id} className="text-xs">
                                                    <span className="text-neutral-500">← From: </span>
                                                    <span className="text-neutral-300 italic">"{source?.content}"</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                <div className="flex justify-between items-center mt-4">
                                    <p className="text-xs text-neutral-500">{new Date(influence.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                                    <button onClick={() => setLinkingInfluence(influence)} className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                        Link Influence
                                    </button>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ol>
            {/* ... The Modal JSX remains the same ... */}
            {linkingInfluence && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
                    <div className="bg-neutral-900 p-6 rounded-lg w-full max-w-md border border-neutral-700">
                        <h3 className="text-lg font-bold mb-2">Link from:</h3>
                        <p className="mb-4 p-2 bg-neutral-800 rounded-md text-sm">"{linkingInfluence.content}"</p>
                        <h3 className="text-lg font-bold mb-4">Link to:</h3>
                        <div className="max-h-60 overflow-y-auto">
                            {influences
                                .filter((target) => target.id !== linkingInfluence.id)
                                .map((targetInfluence) => (
                                    <button
                                        key={targetInfluence.id}
                                        onClick={() => handleCreateLink(targetInfluence.id)}
                                        disabled={isLinking}
                                        className="w-full text-left p-3 mb-2 bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors disabled:opacity-50"
                                    >
                                        {targetInfluence.content}
                                    </button>
                                ))}
                        </div>
                        <button
                            onClick={() => setLinkingInfluence(null)}
                            disabled={isLinking}
                            className="mt-4 w-full text-center text-sm text-neutral-400 hover:text-white"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}