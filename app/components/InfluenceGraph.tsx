'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ForceGraph3D from 'react-force-graph-3d';

// Define the shape of our data
type Influence = {
    id: number;
    content: string;
};
type Link = {
    source_id: number;
    target_id: number;
};

export default function InfluenceGraph() {
    const [influences, setInfluences] = useState<Influence[]>([]);
    const [links, setLinks] = useState<Link[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [influencesRes, linksRes] = await Promise.all([
                supabase.from('influences').select('id, content'),
                supabase.from('influence_links').select('source_id, target_id'),
            ]);

            if (influencesRes.data) setInfluences(influencesRes.data);
            if (linksRes.data) setLinks(linksRes.data);
            setLoading(false);
        };

        fetchData();
    }, []);

    // 1. Prepare data for the graph library
    const graphData = useMemo(() => {
        if (influences.length === 0) {
            return { nodes: [], links: [] };
        }
        return {
            nodes: influences.map(inf => ({
                id: inf.id,
                name: inf.content,
            })),
            links: links.map(link => ({
                source: link.source_id,
                target: link.target_id,
            })),
        };
    }, [influences, links]);

    if (loading) {
        return <p className="text-center text-neutral-400">Loading graph data...</p>;
    }

    // 2. Render the new 3D graph component
    return (
        <div className="w-full max-w-4xl h-[600px] my-4 rounded-lg">
            <ForceGraph3D
                graphData={graphData}
                nodeLabel="name"
                nodeAutoColorBy="id"
                linkSource="source"
                linkTarget="target"
                linkWidth={0.5}
                linkColor={() => 'rgba(255, 255, 255, 0.3)'}
                backgroundColor="rgba(0,0,0,0)"
            />
        </div>
    );
}