import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { getStatusLabel } from '@/services/api';

interface LoanStatsChartProps {
  data: {
    status: string;
    count: number;
  }[];
  type?: 'bar' | 'pie';
}

const COLORS = [
  'hsl(var(--accent))',
  'hsl(210, 80%, 60%)',
  'hsl(45, 90%, 55%)',
  'hsl(280, 70%, 60%)',
  'hsl(145, 70%, 45%)',
  'hsl(0, 70%, 55%)',
  'hsl(200, 80%, 50%)'
];

export const LoanStatsChart: React.FC<LoanStatsChartProps> = ({ data, type = 'bar' }) => {
  const chartData = data.map(d => ({
    ...d,
    name: getStatusLabel(d.status),
    value: d.count
  }));

  if (type === 'pie') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis 
          dataKey="name" 
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px'
          }}
        />
        <Bar 
          dataKey="value" 
          fill="hsl(var(--accent))" 
          radius={[4, 4, 0, 0]}
          name="Dossiers"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default LoanStatsChart;
