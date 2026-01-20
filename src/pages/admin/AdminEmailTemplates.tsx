import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Edit2, Save, X, Eye, Code, Plus, Trash2, 
  Check, AlertCircle, RefreshCw, Search, ChevronDown
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import PageLayout from '@/components/layout/PageLayout';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  html_content: string;
  description: string | null;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const AdminEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'preview' | 'code'>('preview');
  const [editForm, setEditForm] = useState({
    subject: '',
    html_content: '',
    description: '',
    is_active: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Cast variables from JSONB to string array
      const typedData = (data || []).map(t => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables as string[] : []
      }));
      
      setTemplates(typedData);
    } catch (error) {
      logger.error('Error fetching templates:', error);
      toast.error('Erreur lors du chargement des templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditForm({
      subject: template.subject,
      html_content: template.html_content,
      description: template.description || '',
      is_active: template.is_active,
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('email_templates')
        .update({
          subject: editForm.subject,
          html_content: editForm.html_content,
          description: editForm.description,
          is_active: editForm.is_active,
        })
        .eq('id', selectedTemplate.id);

      if (error) throw error;

      toast.success('Template sauvegardé');
      setIsEditing(false);
      fetchTemplates();
      
      // Update selected template locally
      setSelectedTemplate({
        ...selectedTemplate,
        ...editForm,
      });
    } catch (error) {
      logger.error('Error saving template:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (template: EmailTemplate) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: !template.is_active })
        .eq('id', template.id);

      if (error) throw error;

      toast.success(template.is_active ? 'Template désactivé' : 'Template activé');
      fetchTemplates();
    } catch (error) {
      logger.error('Error toggling template:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTemplateIcon = (name: string) => {
    const icons: Record<string, string> = {
      welcome: '👋',
      loanSubmitted: '📝',
      loanApproved: '✅',
      loanRejected: '❌',
      documentRequest: '📄',
      documentValidated: '✓',
      documentRejected: '⚠️',
      appointmentReminder: '📅',
      passwordReset: '🔐',
      accountOpening: '🏦',
    };
    return icons[name] || '📧';
  };

  const renderVariablePreview = (content: string) => {
    return content.replace(/\{\{(\w+)\}\}/g, '<span class="bg-primary/20 text-primary px-1 rounded">{{$1}}</span>');
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-pink-50/20 py-8">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-pink-600 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Templates Email</h1>
                <p className="text-muted-foreground">Personnalisez les emails envoyés aux clients</p>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Template List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="pb-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y max-h-[600px] overflow-y-auto">
                    {loading ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                        Chargement...
                      </div>
                    ) : filteredTemplates.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        Aucun template trouvé
                      </div>
                    ) : (
                      filteredTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleSelectTemplate(template)}
                          className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                            selectedTemplate?.id === template.id ? 'bg-primary/5 border-l-2 border-primary' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{getTemplateIcon(template.name)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{template.name}</span>
                                {!template.is_active && (
                                  <Badge variant="secondary" className="text-xs">Inactif</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {template.description || template.subject}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Template Editor */}
            <div className="lg:col-span-2">
              {selectedTemplate ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getTemplateIcon(selectedTemplate.name)}</span>
                        <div>
                          <CardTitle>{selectedTemplate.name}</CardTitle>
                          <CardDescription>{selectedTemplate.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={selectedTemplate.is_active}
                          onCheckedChange={() => handleToggleActive(selectedTemplate)}
                        />
                        {isEditing ? (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                              <X className="w-4 h-4 mr-1" />
                              Annuler
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={saving}>
                              <Save className="w-4 h-4 mr-1" />
                              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit2 className="w-4 h-4 mr-1" />
                            Modifier
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Subject */}
                    <div>
                      <Label>Sujet de l'email</Label>
                      {isEditing ? (
                        <Input
                          value={editForm.subject}
                          onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                          className="mt-1"
                        />
                      ) : (
                        <p className="mt-1 p-3 bg-muted rounded-lg">{selectedTemplate.subject}</p>
                      )}
                    </div>

                    {/* Variables */}
                    <div>
                      <Label>Variables disponibles</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedTemplate.variables.map((v) => (
                          <Badge key={v} variant="outline" className="font-mono">
                            {`{{${v}}}`}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Contenu HTML</Label>
                        <div className="flex gap-1 bg-muted rounded-lg p-1">
                          <Button
                            variant={previewMode === 'preview' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setPreviewMode('preview')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Aperçu
                          </Button>
                          <Button
                            variant={previewMode === 'code' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setPreviewMode('code')}
                          >
                            <Code className="w-4 h-4 mr-1" />
                            Code
                          </Button>
                        </div>
                      </div>

                      {isEditing ? (
                        <Textarea
                          value={editForm.html_content}
                          onChange={(e) => setEditForm({ ...editForm, html_content: e.target.value })}
                          className="min-h-[300px] font-mono text-sm"
                        />
                      ) : previewMode === 'code' ? (
                        <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-sm font-mono max-h-[400px]">
                          {selectedTemplate.html_content}
                        </pre>
                      ) : (
                        <div 
                          className="p-4 bg-white border rounded-lg min-h-[200px]"
                          dangerouslySetInnerHTML={{ 
                            __html: renderVariablePreview(selectedTemplate.html_content) 
                          }}
                        />
                      )}
                    </div>

                    {/* Description */}
                    {isEditing && (
                      <div>
                        <Label>Description (interne)</Label>
                        <Input
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          placeholder="Description pour l'équipe..."
                          className="mt-1"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center min-h-[400px]">
                  <div className="text-center text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Sélectionnez un template pour l'éditer</p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default AdminEmailTemplates;
