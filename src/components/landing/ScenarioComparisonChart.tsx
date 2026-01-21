import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown } from 'lucide-react';

interface ScenarioData {
  id: string;
  label: string;
  monthlyPayment: number;
  totalInterest: number;
  loanAmount: number;
}

interface ScenarioComparisonChartProps {
  currentScenario: ScenarioData | null;
  scenarios: ScenarioData[];
  formatCurrency: (value: number) => string;
}

const ScenarioComparisonChart = ({ 
  currentScenario, 
  scenarios, 
  formatCurrency 
}: ScenarioComparisonChartProps) => {
  const chartData = useMemo(() => {
    const data: { name: string; mensualité: number; coûtTotal: number; fill: string }[] = [];
    
    if (currentScenario) {
      data.push({
        name: 'Actuel',
        mensualité: currentScenario.monthlyPayment,
        coûtTotal: currentScenario.totalInterest,
        fill: 'hsl(var(--primary))'
      });
    }
    
    scenarios.forEach((scenario, index) => {
      data.push({
        name: scenario.label,
        mensualité: scenario.monthlyPayment,
        coûtTotal: scenario.totalInterest,
        fill: index === 0 ? 'hsl(var(--accent))' : index === 1 ? 'hsl(var(--muted-foreground))' : 'hsl(var(--secondary))'
      });
    });
    
    return data;
  }, [currentScenario, scenarios]);

  if (chartData.length < 2) {
    return null;
  }

  // Find the best scenario (lowest total cost)
  const bestScenario = chartData.reduce((best, current) => 
    current.coûtTotal < best.coûtTotal ? current : best
  );

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry.name === 'mensualité' ? 'Mensualité' : 'Coût du crédit'}: {' '}
              <span className="font-medium text-foreground">
                {formatCurrency(entry.value)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="mt-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            Comparaison visuelle
          </CardTitle>
          {bestScenario && (
            <p className="text-sm text-muted-foreground">
              💡 <span className="font-medium text-primary">{bestScenario.name}</span> offre le meilleur coût total
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Monthly Payment Chart */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-4">Mensualités (€/mois)</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/50" />
                    <XAxis 
                      type="number" 
                      tickFormatter={(value) => `${Math.round(value)}€`}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={80}
                      className="text-muted-foreground"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="mensualité" 
                      radius={[0, 4, 4, 0]}
                      animationDuration={800}
                      animationBegin={200}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Total Cost Chart */}
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-4">Coût total du crédit (€)</p>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border/50" />
                    <XAxis 
                      type="number" 
                      tickFormatter={(value) => `${Math.round(value / 1000)}k€`}
                      className="text-muted-foreground"
                    />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={80}
                      className="text-muted-foreground"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="coûtTotal" 
                      radius={[0, 4, 4, 0]}
                      animationDuration={800}
                      animationBegin={400}
                    >
                      {chartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.name === bestScenario.name ? 'hsl(142 76% 36%)' : entry.fill} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Savings Summary */}
          {currentScenario && scenarios.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 pt-6 border-t"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {scenarios.map((scenario) => {
                  const monthlySaving = currentScenario.monthlyPayment - scenario.monthlyPayment;
                  const totalSaving = currentScenario.totalInterest - scenario.totalInterest;
                  return (
                    <div key={scenario.id} className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{scenario.label} vs Actuel</p>
                      <p className={`text-sm font-semibold ${monthlySaving > 0 ? 'text-green-600' : monthlySaving < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {monthlySaving > 0 ? '−' : monthlySaving < 0 ? '+' : ''}{formatCurrency(Math.abs(monthlySaving))}/mois
                      </p>
                      <p className={`text-xs ${totalSaving > 0 ? 'text-green-600' : totalSaving < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {totalSaving > 0 ? '−' : totalSaving < 0 ? '+' : ''}{formatCurrency(Math.abs(totalSaving))} au total
                      </p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ScenarioComparisonChart;
