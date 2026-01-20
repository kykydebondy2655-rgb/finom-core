import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/finom/Toast';
import Button from '@/components/finom/Button';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, Trash2, Edit3, Save, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import logger from '@/lib/logger';

interface ClientNote {
  id: string;
  note: string;
  created_at: string;
  updated_at: string;
  agent_id: string;
  agent?: {
    first_name: string | null;
    last_name: string | null;
  };
}

interface ClientNotesPanelProps {
  clientId: string;
}

const ClientNotesPanel: React.FC<ClientNotesPanelProps> = ({ clientId }) => {
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (clientId) loadNotes();
  }, [clientId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('client_notes')
        .select(`
          id,
          note,
          created_at,
          updated_at,
          agent_id,
          agent:profiles!client_notes_agent_id_fkey(first_name, last_name)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes((data as unknown as ClientNote[]) || []);
    } catch (err) {
      logger.logError('Error loading notes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('client_notes')
        .insert({
          client_id: clientId,
          agent_id: user.id,
          note: newNote.trim(),
        });

      if (error) throw error;

      toast.success('Note ajoutée');
      setNewNote('');
      loadNotes();
    } catch (err) {
      logger.logError('Error adding note', err);
      toast.error('Erreur lors de l\'ajout de la note');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!editText.trim()) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('client_notes')
        .update({ note: editText.trim() })
        .eq('id', noteId);

      if (error) throw error;

      toast.success('Note modifiée');
      setEditingId(null);
      setEditText('');
      loadNotes();
    } catch (err) {
      logger.logError('Error updating note', err);
      toast.error('Erreur lors de la modification');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm('Supprimer cette note ?')) return;

    try {
      const { error } = await supabase
        .from('client_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      toast.success('Note supprimée');
      loadNotes();
    } catch (err) {
      logger.logError('Error deleting note', err);
      toast.error('Erreur lors de la suppression');
    }
  };

  const startEdit = (note: ClientNote) => {
    setEditingId(note.id);
    setEditText(note.note);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  return (
    <div className="client-notes-panel">
      <div className="notes-header">
        <h3><StickyNote size={18} className="inline mr-2" />Notes internes</h3>
      </div>

      {/* Add new note */}
      <div className="new-note-form">
        <Textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Ajouter une note interne..."
          className="min-h-[80px]"
        />
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddNote}
          disabled={!newNote.trim() || saving}
        >
          {saving ? 'Enregistrement...' : 'Ajouter'}
        </Button>
      </div>

      {/* Notes list */}
      <div className="notes-list">
        {loading ? (
          <p className="empty-text">Chargement...</p>
        ) : notes.length === 0 ? (
          <p className="empty-text">Aucune note</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="note-item">
              {editingId === note.id ? (
                <div className="note-edit-form">
                  <Textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="min-h-[60px]"
                  />
                  <div className="note-edit-actions">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleUpdateNote(note.id)}
                      disabled={saving}
                    >
                      <Save size={14} /> Enregistrer
                    </Button>
                    <Button variant="ghost" size="sm" onClick={cancelEdit}>
                      <X size={14} /> Annuler
                    </Button>
                  </div>
                </div>
              ) : (
              <>
                  <p className="note-content">{note.note}</p>
                  <div className="note-meta">
                    <span className="note-author">
                      {note.agent?.first_name} {note.agent?.last_name}
                    </span>
                    <span className="note-date">
                      {formatDistanceToNow(new Date(note.created_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                    {/* Show if note was edited */}
                    {note.updated_at && note.updated_at !== note.created_at && (
                      <span className="note-edited text-xs text-muted-foreground italic">
                        (modifié {formatDistanceToNow(new Date(note.updated_at), {
                          addSuffix: true,
                          locale: fr,
                        })})
                      </span>
                    )}
                    {note.agent_id === user?.id && (
                      <div className="note-actions">
                        <button
                          className="note-action-btn"
                          onClick={() => startEdit(note)}
                          title="Modifier"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          className="note-action-btn delete"
                          onClick={() => handleDeleteNote(note.id)}
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClientNotesPanel;
