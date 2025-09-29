import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ProgressChartProps {
  data: any[];
  dataKey: string;
  nameKey: string;
  title?: string;
  color?: string;
  height?: number;
  className?: string;
  innerRadius?: number;
  outerRadius?: number;
}

export default function ProgressChart({ 
  data, 
  dataKey, 
  nameKey, 
  title, 
  color = '#3b82f6', 
  height = 200,
  className = '',
  innerRadius = 60,
  outerRadius = 80
}: ProgressChartProps) {
  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-foreground">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          barSize={10}
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            label={{ position: "insideStart", fill: "#fff" }}
            background
            dataKey={dataKey}
            fill={color}
            stroke={color}
            strokeWidth={2}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
