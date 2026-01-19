import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityChartProps {
  data: {
    date: string;
    count: number;
  }[];
  type?: 'line' | 'area';
  title?: string;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ 
  data, 
  type = 'area',
  title 
}) => {
  const chartData = data.map(d => ({
    ...d,
    formattedDate: format(new Date(d.date), 'dd MMM', { locale: fr })
  }));

  const ChartComponent = type === 'area' ? AreaChart : LineChart;

  return (
    <div className="activity-chart">
      {title && <h4 className="chart-title">{title}</h4>}
      <ResponsiveContainer width="100%" height={250}>
        <ChartComponent data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="formattedDate" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))' }}
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            labelFormatter={(label) => `Date: ${label}`}
          />
          {type === 'area' ? (
            <Area
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorActivity)"
              name="Activité"
            />
          ) : (
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--accent))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--accent))' }}
              name="Activité"
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
