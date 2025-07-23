'use client';

import { useCallback, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { analyzeConnectionsAction } from '../actions';
import InfluenceCard from './InfluenceCard';

export interface Influence {
    id: number;
    created_at: string;
    content: string;
}

export interface Link {
    id: number;
    source_id: number;
    target_id: number;
}

export interface InfluenceListRef {
    refreshData: () => void;
}

const InfluenceList = forwardRef<InfluenceListRef, object>((_props, ref) => {
    const [influences, setInfluences] = useState<Influence[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [loading, setLoading] = useState(true);
    const [linkingInfluence, setLinkingInfluence] = useState<Influence | null>(null);
    const [isLinking, setIsLinking] = useState(false);
    const [analyses, setAnalyses] = useState<Record<number, string>>({});
    const [analyzingId, setAnalyzingId] = useState<number | null>(null);

    const fetchData = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreateLink = useCallback(
        async (targetId: number) => {
            if (!linkingInfluence) return;
            setIsLinking(true);
            const { error } = await supabase
                .from('influence_links')
                .insert({ source_id: linkingInfluence.id, target_id: targetId });
            if (error) {
                alert(`Failed to create link: ${error.message}`);
            } else {
                await fetchData();
            }
            setIsLinking(false);
            setLinkingInfluence(null);
        },
        [fetchData, linkingInfluence]
    );

    const handleAnalysisClick = useCallback(async (influenceId: number) => {
        setAnalyzingId(influenceId);
        try {
            const result = await analyzeConnectionsAction(influenceId);
            if (result.error) {
                setAnalyses((prev) => ({
                    ...prev,
                    [influenceId]: result.error,
                }));
            } else if (result.analysis) {
                setAnalyses((prev) => ({
                    ...prev,
                    [influenceId]: result.analysis,
                }));
            }
        } catch (error) {
            console.error('Analysis error:', error);
            setAnalyses((prev) => ({
                ...prev,
                [influenceId]: 'Failed to analyze connections. Please try again.',
            }));
        } finally {
            setAnalyzingId(null);
        }
    }, []);

    const handleDelete = useCallback(
        async (id: number) => {
            if (!window.confirm('Are you sure you want to delete this influence?')) return;
            const { error } = await supabase.from('influences').delete().eq('id', id);
            if (error) alert(`Failed to delete: ${error.message}`);
            else fetchData();
        },
        [fetchData]
    );

    useImperativeHandle(
        ref,
        () => ({
            refreshData: fetchData,
        }),
        [fetchData]
    );

    if (loading) {
        return <p className="mt-4 text-neutral-400">Loading influences...</p>;
    }

    return (
        <div className="w-full max-w-lg mt-12">
            <ol className="relative border-l border-neutral-700">
                {influences.map((influence) => (
                    <InfluenceCard
                        key={influence.id}
                        influence={influence}
                        links={links}
                        allInfluences={influences}
                        onAnalyze={handleAnalysisClick}
                        onLink={setLinkingInfluence}
                        onDelete={handleDelete}
                        isAnalyzing={analyzingId === influence.id}
                        analysisText={analyses[influence.id]}
                    />
                ))}
            </ol>

            {linkingInfluence && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-[9999] p-4">
                    <div className="bg-neutral-900/90 backdrop-blur-sm p-6 rounded-2xl w-full max-w-md border border-neutral-800/50">
                        <h3 className="text-lg font-light mb-2 text-neutral-200">Link from:</h3>
                        <p className="mb-4 p-3 bg-neutral-800/50 rounded-xl text-sm text-neutral-300 leading-relaxed">
                            &quot;{linkingInfluence.content}&quot;
                        </p>
                        <h3 className="text-lg font-light mb-4 text-neutral-200">Link to:</h3>
                        <div className="max-h-60 overflow-y-auto space-y-2">
                            {influences
                                .filter((target) => target.id !== linkingInfluence.id)
                                .map((targetInfluence) => (
                                    <button
                                        key={targetInfluence.id}
                                        onClick={() => handleCreateLink(targetInfluence.id)}
                                        disabled={isLinking}
                                        className="w-full text-left p-3 bg-neutral-800/50 hover:bg-neutral-700/50 rounded-xl transition-all duration-300 backdrop-blur-sm disabled:opacity-50 text-neutral-300 text-sm leading-relaxed"
                                    >
                                        &quot;{targetInfluence.content}&quot;
                                    </button>
                                ))}
                        </div>
                        <button
                            onClick={() => setLinkingInfluence(null)}
                            disabled={isLinking}
                            className="mt-6 w-full px-4 py-2 bg-neutral-800/50 hover:bg-neutral-700/50 text-neutral-300 text-sm font-light rounded-full border border-neutral-700/50 transition-all duration-300 backdrop-blur-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});

InfluenceList.displayName = 'InfluenceList';

export default InfluenceList;
