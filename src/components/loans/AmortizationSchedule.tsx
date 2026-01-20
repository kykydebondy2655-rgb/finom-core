import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Download, Table as TableIcon, BarChart3 } from 'lucide-react';
import Button from '@/components/finom/Button';
import { formatCurrency } from '@/services/api';

interface AmortizationScheduleProps {
  loanAmount: number;
  interestRate: number; // Annual rate in percentage
  durationMonths: number;
  monthlyPayment: number;
  insuranceRate?: number; // Annual insurance rate in percentage
}

interface ScheduleRow {
  month: number;
  year: number;
  payment: number;
  principal: number;
  interest: number;
  insurance: number;
  balance: number;
  totalPaid: number;
  totalInterest: number;
}

const AmortizationSchedule: React.FC<AmortizationScheduleProps> = ({
  loanAmount,
  interestRate,
  durationMonths,
  monthlyPayment,
  insuranceRate = 0.31
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [showYearly, setShowYearly] = useState(true);

  const schedule = useMemo(() => {
    const monthlyRate = interestRate / 100 / 12;
    const monthlyInsurance = (loanAmount * (insuranceRate / 100)) / 12;
    const creditPayment = monthlyPayment - monthlyInsurance;
    
    let balance = loanAmount;
    let totalPaid = 0;
    let totalInterest = 0;
    const rows: ScheduleRow[] = [];

    for (let month = 1; month <= durationMonths; month++) {
      const interest = balance * monthlyRate;
      const principal = Math.min(creditPayment - interest, balance);
      balance = Math.max(0, balance - principal);
      totalPaid += monthlyPayment;
      totalInterest += interest;

      rows.push({
        month,
        year: Math.ceil(month / 12),
        payment: monthlyPayment,
        principal,
        interest,
        insurance: monthlyInsurance,
        balance,
        totalPaid,
        totalInterest
      });
    }

    return rows;
  }, [loanAmount, interestRate, durationMonths, monthlyPayment, insuranceRate]);

  // Aggregate by year for chart
  const yearlyData = useMemo(() => {
    const years: { [key: number]: { principal: number; interest: number; insurance: number; balance: number } } = {};
    
    schedule.forEach(row => {
      if (!years[row.year]) {
        years[row.year] = { principal: 0, interest: 0, insurance: 0, balance: 0 };
      }
      years[row.year].principal += row.principal;
      years[row.year].interest += row.interest;
      years[row.year].insurance += row.insurance;
      years[row.year].balance = row.balance;
    });

    return Object.entries(years).map(([year, data]) => ({
      year: `An ${year}`,
      principal: Math.round(data.principal),
      interest: Math.round(data.interest),
      insurance: Math.round(data.insurance),
      balance: Math.round(data.balance)
    }));
  }, [schedule]);

  const totalInterest = schedule[schedule.length - 1]?.totalInterest || 0;
  const totalInsurance = (loanAmount * (insuranceRate / 100) / 12) * durationMonths;
  const totalCost = loanAmount + totalInterest + totalInsurance;

  const exportCSV = () => {
    const headers = ['Mois', 'Année', 'Mensualité', 'Capital', 'Intérêts', 'Assurance', 'Capital restant'];
    const rows = schedule.map(row => [
      row.month,
      row.year,
      row.payment.toFixed(2),
      row.principal.toFixed(2),
      row.interest.toFixed(2),
      row.insurance.toFixed(2),
      row.balance.toFixed(2)
    ]);

    const csv = [headers, ...rows].map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'echeancier.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <p className="text-xs text-muted-foreground">Capital emprunté</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(loanAmount)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <p className="text-xs text-muted-foreground">Total intérêts</p>
          <p className="text-lg font-semibold text-primary">{formatCurrency(totalInterest)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <p className="text-xs text-muted-foreground">Total assurance</p>
          <p className="text-lg font-semibold text-accent">{formatCurrency(totalInsurance)}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <p className="text-xs text-muted-foreground">Coût total</p>
          <p className="text-lg font-semibold text-foreground">{formatCurrency(totalCost)}</p>
        </motion.div>
      </div>

      {/* View controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('chart')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
              viewMode === 'chart' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Graphique
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
              viewMode === 'table' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <TableIcon className="w-4 h-4" />
            Tableau
          </button>
        </div>

        <Button variant="ghost" size="sm" onClick={exportCSV}>
          <Download className="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
      </div>

      {/* Chart view */}
      {viewMode === 'chart' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="h-80"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={yearlyData}>
              <defs>
                <linearGradient id="colorPrincipal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="year" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(v) => `${(v/1000).toFixed(0)}k`}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="principal" 
                name="Capital" 
                stroke="hsl(var(--primary))" 
                fill="url(#colorPrincipal)"
                strokeWidth={2}
              />
              <Area 
                type="monotone" 
                dataKey="interest" 
                name="Intérêts" 
                stroke="hsl(var(--accent))" 
                fill="url(#colorInterest)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Table view */}
      {viewMode === 'table' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="overflow-x-auto"
        >
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setShowYearly(true)}
              className={`px-3 py-1 rounded-full text-sm ${
                showYearly ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              Par année
            </button>
            <button
              onClick={() => setShowYearly(false)}
              className={`px-3 py-1 rounded-full text-sm ${
                !showYearly ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
              }`}
            >
              Par mois
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">{showYearly ? 'Année' : 'Mois'}</th>
                  <th className="text-right p-3 font-medium">Capital</th>
                  <th className="text-right p-3 font-medium">Intérêts</th>
                  <th className="text-right p-3 font-medium">Assurance</th>
                  <th className="text-right p-3 font-medium">Reste dû</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {showYearly ? (
                  yearlyData.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/50">
                      <td className="p-3">{row.year}</td>
                      <td className="p-3 text-right">{formatCurrency(row.principal)}</td>
                      <td className="p-3 text-right text-primary">{formatCurrency(row.interest)}</td>
                      <td className="p-3 text-right text-accent">{formatCurrency(row.insurance)}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))
                ) : (
                  schedule.slice(0, 60).map((row) => (
                    <tr key={row.month} className="hover:bg-muted/50">
                      <td className="p-3">Mois {row.month}</td>
                      <td className="p-3 text-right">{formatCurrency(row.principal)}</td>
                      <td className="p-3 text-right text-primary">{formatCurrency(row.interest)}</td>
                      <td className="p-3 text-right text-accent">{formatCurrency(row.insurance)}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(row.balance)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {!showYearly && schedule.length > 60 && (
              <div className="p-3 text-center text-sm text-muted-foreground bg-muted">
                Affichage limité aux 60 premiers mois. Exportez le CSV pour voir tout l'échéancier.
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AmortizationSchedule;
