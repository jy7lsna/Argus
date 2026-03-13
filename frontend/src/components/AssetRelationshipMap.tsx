import { useRef, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface Asset {
    id: string | number;
    name: string;
    type: string;
    riskLevel: string;
    riskScore: number;
}

interface RelationshipMapProps {
    domain: string;
    assets: Asset[];
}

const AssetRelationshipMap = ({ domain, assets }: RelationshipMapProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const graphData = useMemo(() => {
        // Create root node (the domain)
        const nodes = [
            { 
                id: 'root', 
                name: domain, 
                val: 40, 
                color: '#8b5cf6', // Primary color
                type: 'Target Domain',
                level: 0
            }
        ];

        const links: { source: string; target: string }[] = [];

        // Add assets as children
        assets.forEach((asset, idx) => {
            const nodeId = `asset-${asset.id || idx}`;
            
            // Determine color based on risk level
            let color = '#3b82f6'; // Default blue (Low/Info)
            if (asset.riskLevel === 'Critical') color = '#ef4444';
            else if (asset.riskLevel === 'High') color = '#f97316';
            else if (asset.riskLevel === 'Medium') color = '#eab308';

            nodes.push({
                id: nodeId,
                name: asset.name,
                val: 15 + (asset.riskScore / 10), // Size proportional to risk
                color: color,
                type: asset.type,
                level: 1
            });

            links.push({
                source: 'root',
                target: nodeId
            });
        });

        return { nodes, links };
    }, [domain, assets]);

    return (
        <div ref={containerRef} className="w-full h-[500px] glass rounded-[40px] overflow-hidden relative border border-white/5">
            <div className="absolute top-8 left-8 z-10">
                <h3 className="text-xl font-bold">Relationship Map</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-black mt-1">Force-Directed Infrastructure Trace</p>
            </div>
            
            <div className="absolute bottom-8 right-8 z-10 flex flex-col gap-2 glass p-4 rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-risk-critical"></div>
                    <span className="text-[10px] text-white/60 font-bold uppercase">Critical Risk</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-risk-high"></div>
                    <span className="text-[10px] text-white/60 font-bold uppercase">High Risk</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(139,92,246,0.5)]"></div>
                    <span className="text-[10px] text-white/60 font-bold uppercase">Target Domain</span>
                </div>
            </div>

            <ForceGraph2D
                graphData={graphData}
                backgroundColor="rgba(0,0,0,0)"
                nodeLabel={(node: any) => `
                    <div class="bg-black/90 border border-white/10 p-3 rounded-xl backdrop-blur-xl shadow-2xl">
                        <div class="text-[10px] text-white/40 font-black uppercase tracking-widest mb-1">${node.type}</div>
                        <div class="text-sm font-bold text-white">${node.name}</div>
                    </div>
                `}
                nodeRelSize={1}
                linkColor={() => 'rgba(255,255,255,0.05)'}
                linkDirectionalParticles={2}
                linkDirectionalParticleSpeed={0.005}
                linkDirectionalParticleWidth={2}
                linkDirectionalParticleColor={() => '#8b5cf6'}
                nodeCanvasObject={(node: any, ctx, globalScale) => {
                    const label = node.name;
                    const fontSize = 12 / globalScale;
                    ctx.font = `${fontSize}px Inter, sans-serif`;
                    
                    // Node Circle
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, node.val / 2, 0, 2 * Math.PI, false);
                    ctx.fillStyle = node.color;
                    ctx.fill();

                    // Glow effect
                    if (node.id === 'root' || node.val > 20) {
                        ctx.shadowColor = node.color;
                        ctx.shadowBlur = 15;
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }

                    // Label shadow for readability
                    const textWidth = ctx.measureText(label).width;
                    const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                    // Only show labels at certain zoom or for root
                    if (globalScale > 1.5 || node.id === 'root') {
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
                        ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y + (node.val / 2) + 2, bckgDimensions[0], bckgDimensions[1]);
                        
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillStyle = 'white';
                        ctx.fillText(label, node.x, node.y + (node.val / 2) + 2 + bckgDimensions[1] / 2);
                    }
                }}
            />
        </div>
    );
};

export default AssetRelationshipMap;
