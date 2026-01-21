import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  FlaskConical, 
  TrendingUp, 
  Users, 
  Target,
  ArrowUpRight,
  RefreshCw,
  Calendar,
  Filter
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';
import { AB_EXPERIMENTS } from '@/hooks/useABTesting';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface ExperimentStats {
  experimentId: string;
  experimentName: string;
  variants: {
    variantId: string;
    variantName: string;
    assignments: number;
    conversions: number;
    conversionRate: number;
  }[];
  totalAssignments: number;
  totalConversions: number;
  overallConversionRate: number;
  winningVariant: string | null;
  confidenceLevel: number;
}

interface ABLogEntry {
  action: string;
  entity_id: string;
  metadata: {
    experiment_id?: string;
    experiment_name?: string;
    variant_id?: string;
    variant_name?: string;
    conversion_type?: string;
    session_id?: string;
    timestamp?: string;
  };
  created_at: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

const AdminABTesting = () => {
  const navigate = useNavigate();
  const { isAdmin, loading: rolesLoading } = useUserRoles();
  const [experimentStats, setExperimentStats] = useState<ExperimentStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedExperiment, setSelectedExperiment] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7d');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  useEffect(() => {
    if (!rolesLoading && !isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, rolesLoading, navigate]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      // Calculate date filter
      let startDate = new Date();
      switch (dateRange) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'all':
          startDate = new Date('2020-01-01');
          break;
      }

      // Fetch A/B testing logs
      const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('entity_type', 'ab_testing')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process logs into stats
      const statsMap: Record<string, ExperimentStats> = {};

      (logs as ABLogEntry[] || []).forEach((log) => {
        const experimentId = log.metadata?.experiment_id;
        if (!experimentId) return;

        if (!statsMap[experimentId]) {
          statsMap[experimentId] = {
            experimentId,
            experimentName: log.metadata?.experiment_name || experimentId,
            variants: [],
            totalAssignments: 0,
            totalConversions: 0,
            overallConversionRate: 0,
            winningVariant: null,
            confidenceLevel: 0,
          };
        }

        const variantId = log.metadata?.variant_id || 'unknown';
        let variant = statsMap[experimentId].variants.find((v) => v.variantId === variantId);
        
        if (!variant) {
          variant = {
            variantId,
            variantName: log.metadata?.variant_name || variantId,
            assignments: 0,
            conversions: 0,
            conversionRate: 0,
          };
          statsMap[experimentId].variants.push(variant);
        }

        if (log.action === 'ab_assignment') {
          variant.assignments++;
          statsMap[experimentId].totalAssignments++;
        } else if (log.action === 'ab_conversion') {
          variant.conversions++;
          statsMap[experimentId].totalConversions++;
        }
      });

      // Calculate conversion rates and find winners
      Object.values(statsMap).forEach((stat) => {
        stat.variants.forEach((variant) => {
          variant.conversionRate = variant.assignments > 0 
            ? (variant.conversions / variant.assignments) * 100 
            : 0;
        });

        stat.overallConversionRate = stat.totalAssignments > 0
          ? (stat.totalConversions / stat.totalAssignments) * 100
          : 0;

        // Find winning variant (highest conversion rate with sufficient sample)
        const eligibleVariants = stat.variants.filter((v) => v.assignments >= 10);
        if (eligibleVariants.length > 0) {
          const winner = eligibleVariants.reduce((a, b) => 
            a.conversionRate > b.conversionRate ? a : b
          );
          stat.winningVariant = winner.variantId;
          
          // Simplified confidence calculation
          const sampleSize = stat.totalAssignments;
          stat.confidenceLevel = Math.min(95, Math.floor(50 + (sampleSize / 20)));
        }
      });

      setExperimentStats(Object.values(statsMap));
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to fetch A/B stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  const filteredStats = useMemo(() => {
    if (selectedExperiment === 'all') return experimentStats;
    return experimentStats.filter((s) => s.experimentId === selectedExperiment);
  }, [experimentStats, selectedExperiment]);

  const totalStats = useMemo(() => ({
    experiments: Object.keys(AB_EXPERIMENTS).length,
    activeExperiments: Object.values(AB_EXPERIMENTS).filter((e) => e.isActive).length,
    totalAssignments: experimentStats.reduce((sum, s) => sum + s.totalAssignments, 0),
    totalConversions: experimentStats.reduce((sum, s) => sum + s.totalConversions, 0),
  }), [experimentStats]);

  if (rolesLoading || !isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FlaskConical className="w-8 h-8 text-primary" />
            A/B Testing Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Analysez les performances de vos expériences et optimisez les conversions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 heures</SelectItem>
              <SelectItem value="7d">7 jours</SelectItem>
              <SelectItem value="30d">30 jours</SelectItem>
              <SelectItem value="all">Tout</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchStats} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <FlaskConical className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.activeExperiments}</p>
                <p className="text-sm text-muted-foreground">Expériences actives</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.totalAssignments.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Visiteurs assignés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStats.totalConversions.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Conversions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {totalStats.totalAssignments > 0 
                    ? ((totalStats.totalConversions / totalStats.totalAssignments) * 100).toFixed(1) 
                    : '0'}%
                </p>
                <p className="text-sm text-muted-foreground">Taux global</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Experiment Filter */}
      <div className="flex items-center gap-4 mb-6">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={selectedExperiment} onValueChange={setSelectedExperiment}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrer par expérience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les expériences</SelectItem>
            {Object.values(AB_EXPERIMENTS).map((exp) => (
              <SelectItem key={exp.id} value={exp.id}>
                {exp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Experiments Grid */}
      <div className="grid gap-6">
        {filteredStats.length === 0 ? (
          <Card className="p-12 text-center">
            <FlaskConical className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Aucune donnée disponible
            </h3>
            <p className="text-sm text-muted-foreground">
              Les données d'A/B testing apparaîtront ici une fois que des visiteurs auront été assignés.
            </p>
          </Card>
        ) : (
          filteredStats.map((stat) => (
            <ExperimentCard key={stat.experimentId} stat={stat} />
          ))
        )}
      </div>

      {/* Configured Experiments */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Expériences configurées
          </CardTitle>
          <CardDescription>
            Liste des expériences A/B définies dans le système
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.values(AB_EXPERIMENTS).map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{exp.name}</h4>
                    <Badge variant={exp.isActive ? 'default' : 'secondary'}>
                      {exp.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{exp.variants.length} variantes</p>
                  <p className="text-xs text-muted-foreground">
                    {exp.variants.map((v) => `${v.name} (${v.weight}%)`).join(', ')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center mt-6">
        Dernière actualisation: {lastRefresh.toLocaleTimeString('fr-FR')}
      </p>
    </div>
  );
};

// Experiment Card Component
const ExperimentCard = ({ stat }: { stat: ExperimentStats }) => {
  const chartData = stat.variants.map((v) => ({
    name: v.variantName,
    assignments: v.assignments,
    conversions: v.conversions,
    rate: v.conversionRate,
  }));

  const pieData = stat.variants.map((v) => ({
    name: v.variantName,
    value: v.assignments,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {stat.experimentName}
                {stat.winningVariant && stat.confidenceLevel >= 80 && (
                  <Badge variant="default" className="bg-green-500">
                    Gagnant identifié
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {stat.totalAssignments} visiteurs • {stat.totalConversions} conversions
              </CardDescription>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {stat.overallConversionRate.toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground">Taux de conversion</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="variants">
            <TabsList className="mb-4">
              <TabsTrigger value="variants">Variantes</TabsTrigger>
              <TabsTrigger value="chart">Graphique</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
            </TabsList>

            <TabsContent value="variants">
              <div className="space-y-4">
                {stat.variants.map((variant, index) => (
                  <div
                    key={variant.variantId}
                    className={`p-4 border rounded-lg ${
                      stat.winningVariant === variant.variantId 
                        ? 'border-green-500 bg-green-500/5' 
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{variant.variantName}</span>
                        {stat.winningVariant === variant.variantId && (
                          <Badge variant="outline" className="text-green-600 border-green-500">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            Meilleur
                          </Badge>
                        )}
                      </div>
                      <span className="text-lg font-bold">
                        {variant.conversionRate.toFixed(1)}%
                      </span>
                    </div>
                    <Progress 
                      value={variant.conversionRate} 
                      className="h-2 mb-2"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{variant.assignments} assignés</span>
                      <span>{variant.conversions} conversions</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="chart">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        name === 'rate' ? `${value.toFixed(1)}%` : value,
                        name === 'rate' ? 'Taux' : name === 'assignments' ? 'Assignés' : 'Conversions'
                      ]}
                    />
                    <Bar dataKey="assignments" fill="hsl(var(--muted-foreground))" name="Assignés" />
                    <Bar dataKey="conversions" fill="hsl(var(--primary))" name="Conversions" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="distribution">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>

          {stat.confidenceLevel > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Niveau de confiance</span>
                <span className={`font-medium ${stat.confidenceLevel >= 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {stat.confidenceLevel}%
                </span>
              </div>
              <Progress value={stat.confidenceLevel} className="h-1 mt-2" />
              {stat.confidenceLevel < 80 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Collectez plus de données pour atteindre un niveau de confiance statistique de 80%+
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminABTesting;
