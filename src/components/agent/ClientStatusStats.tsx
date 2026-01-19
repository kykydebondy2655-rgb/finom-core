import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CLIENT_STATUSES } from './ClientStatusSelect';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { Profile } from '@/services/api';

interface ClientStatusStatsProps {
  clients: Array<{ client?: Profile }>;
}

const ClientStatusStats: React.FC<ClientStatusStatsProps> = ({ clients }) => {
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    
    // Initialize all statuses with 0
    CLIENT_STATUSES.forEach(status => {
      counts[status.value] = 0;
    });
    
    // Count clients by status
    clients.forEach(assignment => {
      const status = assignment.client?.pipeline_stage || 'nouveau';
      // Find matching status or use nouveau as default
      const matchedStatus = CLIENT_STATUSES.find(s => s.value === status);
      if (matchedStatus) {
        counts[matchedStatus.value]++;
      } else {
        counts['nouveau']++;
      }
    });
    
    return counts;
  }, [clients]);

  const chartData = useMemo(() => {
    return CLIENT_STATUSES
      .map(status => ({
        name: status.label,
        value: statusCounts[status.value],
        color: status.color,
        statusValue: status.value,
      }))
      .filter(item => item.value > 0);
  }, [statusCounts]);

  const totalClients = clients.length;

  return (
    <div className="status-stats-panel">
      <h3 className="stats-title">Répartition par statut</h3>
      
      {totalClients === 0 ? (
        <p className="empty-text">Aucun client assigné</p>
      ) : (
        <>
          {/* Chart */}
          <div className="stats-chart">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${value} client${value > 1 ? 's' : ''}`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-center-label">
              <span className="chart-total">{totalClients}</span>
              <span className="chart-total-label">clients</span>
            </div>
          </div>

          {/* Status bars */}
          <div className="status-bars">
            {CLIENT_STATUSES.map((status, index) => {
              const count = statusCounts[status.value];
              const percentage = totalClients > 0 ? (count / totalClients) * 100 : 0;
              
              return (
                <motion.div
                  key={status.value}
                  className="status-bar-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="status-bar-header">
                    <span className="status-bar-label">
                      <span
                        className="status-dot"
                        style={{ backgroundColor: status.color }}
                      />
                      {status.label}
                    </span>
                    <span className="status-bar-count">{count}</span>
                  </div>
                  <div className="status-bar-track">
                    <motion.div
                      className="status-bar-fill"
                      style={{ backgroundColor: status.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default ClientStatusStats;
