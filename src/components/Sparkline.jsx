import React from 'react';

const colorMap = {
  red: '#dc2626',
  orange: '#ea580c',
  yellow: '#ca8a04',
  green: '#16a34a',
  blue: '#2563eb',
  purple: '#7c3aed',
  pink: '#ec4899',
};

export function Sparkline({ data = [], color = 'blue', height = 30 }) {
  if (!data || data.length === 0) {
    return <div style={{ height, backgroundColor: '#f3f4f6', borderRadius: '6px' }} />;
  }

  const max = Math.max(...data, 1);
  const width = 100 / data.length;
  const chartColor = colorMap[color] || colorMap.blue;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${data.length * 12} ${height}`}
      style={{ display: 'block' }}
    >
      {data.map((value, i) => {
        const barHeight = (value / max) * (height - 2);
        const x = i * 12 + 2;
        const y = height - barHeight - 1;

        return (
          <g key={i}>
            {/* Bar */}
            <rect
              x={x}
              y={y}
              width="8"
              height={barHeight}
              fill={chartColor}
              opacity={value > 0 ? 0.9 : 0.2}
              rx="2"
            />
          </g>
        );
      })}
    </svg>
  );
}