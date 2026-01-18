
import React from 'react';
import { Member, Relation, RelationType } from '../types';

interface TreeVisualizerProps {
  members: Member[];
  relations: Relation[];
  onNodeClick?: (id: string) => void;
}

const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ members, relations, onNodeClick }) => {
  const nodeWidth = 160;
  const nodeHeight = 70;
  const levelHeight = 160;
  const horizontalSpacing = 200;

  // Simple layout logic: group by generation
  const generations: Record<number, Member[]> = {};
  members.forEach(m => {
    if (!generations[m.generationLevel]) generations[m.generationLevel] = [];
    generations[m.generationLevel].push(m);
  });

  const memberPositions = new Map<string, { x: number, y: number }>();

  Object.entries(generations).forEach(([level, mbs]) => {
    const l = parseInt(level);
    mbs.forEach((m, idx) => {
      const x = (idx - (mbs.length - 1) / 2) * horizontalSpacing + 400;
      const y = l * levelHeight + 50;
      memberPositions.set(m.id, { x, y });
    });
  });

  return (
    <div className="overflow-auto border rounded-2xl bg-slate-50 shadow-inner p-4" style={{ height: '600px' }}>
      <svg width="1200" height="1200" viewBox="0 0 1200 1200" className="cursor-grab active:cursor-grabbing">
        <defs>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Lines */}
        {relations.map(rel => {
          const start = memberPositions.get(rel.fromId);
          const end = memberPositions.get(rel.toId);
          if (!start || !end) return null;

          return (
            <line
              key={rel.id}
              x1={start.x + nodeWidth / 2}
              y1={start.y + nodeHeight / 2}
              x2={end.x + nodeWidth / 2}
              y2={end.y + nodeHeight / 2}
              stroke={rel.type === RelationType.SPOUSE ? "#f472b6" : "#cbd5e1"}
              strokeWidth={rel.type === RelationType.SPOUSE ? 4 : 2}
              strokeDasharray={rel.type === RelationType.SPOUSE ? "6,4" : "0"}
            />
          );
        })}

        {/* Nodes */}
        {members.map(member => {
          const pos = memberPositions.get(member.id);
          if (!pos) return null;

          return (
            <g 
              key={member.id} 
              transform={`translate(${pos.x}, ${pos.y})`}
              className="group cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={() => onNodeClick?.(member.id)}
              filter="url(#shadow)"
            >
              <rect
                width={nodeWidth}
                height={nodeHeight}
                rx="12"
                fill="white"
                stroke={member.gender === 'MALE' ? '#3b82f6' : '#ec4899'}
                strokeWidth="2"
              />
              
              {/* Photo placeholder/Avatar */}
              <circle 
                cx="35" 
                cy={nodeHeight / 2} 
                r="22" 
                fill="#f8fafc" 
                stroke="#e2e8f0" 
                strokeWidth="1" 
              />
              {member.photoUri && (
                <image 
                  href={member.photoUri} 
                  x="15" 
                  y={nodeHeight / 2 - 20} 
                  width="40" 
                  height="40" 
                  clipPath="circle(20px at 20px 20px)"
                />
              )}

              <text
                x="65"
                y={nodeHeight / 2 - 2}
                className="font-bold text-sm fill-gray-800"
                dominantBaseline="middle"
              >
                {member.name.length > 12 ? member.name.substring(0, 10) + '...' : member.name}
              </text>
              <text
                x="65"
                y={nodeHeight / 2 + 15}
                className="text-[10px] fill-gray-400 font-medium uppercase tracking-wider"
                dominantBaseline="middle"
              >
                {member.generationLevel} पुस्ता • {member.gender === 'MALE' ? 'पुरुष' : 'महिला'}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default TreeVisualizer;
