import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from '@/components/animations';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import logger from '@/lib/logger';
import { MessageCircle, Send, ArrowLeft, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SupportMessage {
  id: string;
  user_id: string;
  agent_id: string | null;
  message: string;
  sender_type: 'client' | 'agent' | 'admin';
  read: boolean;
  created_at: string;
}

const Support = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Cast the sender_type to the correct type
      const typedMessages = (data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'client' | 'agent' | 'admin'
      }));
      
      setMessages(typedMessages);
      
      // Mark received messages as read
      const unreadIds = typedMessages
        .filter(m => m.sender_type !== 'client' && !m.read)
        .map(m => m.id);
      
      if (unreadIds.length > 0) {
        await supabase
          .from('support_messages')
          .update({ read: true })
          .in('id', unreadIds);
      }
    } catch (err) {
      logger.logError('Error fetching support messages', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user?.id) return;

    fetchMessages();

    const channel = supabase
      .channel(`support-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newMsg = payload.new as SupportMessage;
          setMessages(prev => [...prev, {
            ...newMsg,
            sender_type: newMsg.sender_type as 'client' | 'agent' | 'admin'
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, fetchMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!newMessage.trim() || !user?.id || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase.from('support_messages').insert({
        user_id: user.id,
        message: messageText,
        sender_type: 'client',
      });

      if (error) throw error;
    } catch (err) {
      logger.logError('Error sending support message', err);
      setNewMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <PageLayout showAnimatedBackground={false}>
        <div className="support-page">
          <div className="page-header">
            <div className="page-header-content">
              <Skeleton className="h-10 w-64 mb-4" />
              <Skeleton className="h-5 w-96" />
            </div>
          </div>
          <div className="container">
            <Card padding="xl">
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </Card>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showAnimatedBackground={false}>
      <div className="support-page">
        {/* Page Header */}
        <motion.div
          className="page-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="page-header-content">
            <button
              onClick={() => navigate('/dashboard')}
              className="back-link"
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                color: 'var(--muted-foreground)',
                marginBottom: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              <ArrowLeft size={16} />
              Retour au dashboard
            </button>
            <h1>Support FINOM</h1>
            <p>Notre équipe est là pour vous aider. Posez vos questions et recevez une réponse rapidement.</p>
          </div>
        </motion.div>

        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="support-card" padding="xl">
              <div className="support-header">
                <Headphones size={24} />
                <div>
                  <h2>Canal de support</h2>
                  <p className="support-status">
                    <span className="status-dot online"></span>
                    Équipe disponible
                  </p>
                </div>
              </div>

              <div className="messages-container">
                {messages.length === 0 ? (
                  <div className="empty-messages">
                    <MessageCircle size={48} className="empty-icon" />
                    <h3>Bienvenue sur le support FINOM</h3>
                    <p>Envoyez-nous un message et nous vous répondrons dans les plus brefs délais.</p>
                  </div>
                ) : (
                  <div className="messages-list">
                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        className={`message-item ${msg.sender_type === 'client' ? 'sent' : 'received'}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div className="message-bubble">
                          {msg.sender_type !== 'client' && (
                            <span className="sender-label">
                              {msg.sender_type === 'admin' ? 'Admin FINOM' : 'Conseiller'}
                            </span>
                          )}
                          <p>{msg.message}</p>
                          <span className="message-time">
                            {formatDistanceToNow(new Date(msg.created_at), { 
                              addSuffix: true, 
                              locale: fr 
                            })}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="message-input-container">
                <textarea
                  placeholder="Écrivez votre message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sending}
                  rows={2}
                />
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSend}
                  disabled={sending || !newMessage.trim()}
                  className="send-button"
                >
                  <Send size={18} />
                  {sending ? 'Envoi...' : 'Envoyer'}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>

      <style>{`
        .support-page {
          min-height: 100vh;
          padding-bottom: 2rem;
        }

        .support-card {
          max-width: 800px;
          margin: 0 auto;
        }

        .support-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid hsl(var(--border));
          margin-bottom: 1.5rem;
        }

        .support-header h2 {
          margin: 0;
          font-size: 1.125rem;
        }

        .support-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: hsl(var(--muted-foreground));
          margin: 0;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: hsl(var(--muted));
        }

        .status-dot.online {
          background: hsl(142 71% 45%);
          box-shadow: 0 0 8px hsl(142 71% 45% / 0.5);
        }

        .messages-container {
          min-height: 400px;
          max-height: 500px;
          overflow-y: auto;
          padding: 1rem 0;
        }

        .empty-messages {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          text-align: center;
          color: hsl(var(--muted-foreground));
        }

        .empty-messages .empty-icon {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-messages h3 {
          margin: 0 0 0.5rem;
          color: hsl(var(--foreground));
        }

        .empty-messages p {
          margin: 0;
          max-width: 300px;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message-item {
          display: flex;
        }

        .message-item.sent {
          justify-content: flex-end;
        }

        .message-item.received {
          justify-content: flex-start;
        }

        .message-bubble {
          max-width: 70%;
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          position: relative;
        }

        .message-item.sent .message-bubble {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border-bottom-right-radius: 0.25rem;
        }

        .message-item.received .message-bubble {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
          border-bottom-left-radius: 0.25rem;
        }

        .sender-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          opacity: 0.8;
          margin-bottom: 0.25rem;
        }

        .message-bubble p {
          margin: 0;
          word-wrap: break-word;
        }

        .message-time {
          display: block;
          font-size: 0.7rem;
          opacity: 0.7;
          margin-top: 0.25rem;
          text-align: right;
        }

        .message-input-container {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid hsl(var(--border));
        }

        .message-input-container textarea {
          flex: 1;
          resize: none;
          padding: 0.75rem 1rem;
          border: 1px solid hsl(var(--border));
          border-radius: 0.5rem;
          font-family: inherit;
          font-size: 0.875rem;
          background: hsl(var(--background));
          color: hsl(var(--foreground));
        }

        .message-input-container textarea:focus {
          outline: none;
          border-color: hsl(var(--primary));
        }

        .send-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          align-self: flex-end;
        }

        @media (max-width: 640px) {
          .message-bubble {
            max-width: 85%;
          }

          .message-input-container {
            flex-direction: column;
          }

          .send-button {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </PageLayout>
  );
};

export default Support;
