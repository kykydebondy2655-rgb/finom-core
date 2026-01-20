import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import PageLayout from '@/components/layout/PageLayout';
import Card from '@/components/finom/Card';
import Button from '@/components/finom/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { supabase } from '@/integrations/supabase/client';
import logger from '@/lib/logger';
import { MessageCircle, Send, User, Clock, ChevronLeft, Search, RefreshCw } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
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

interface ConversationSummary {
  user_id: string;
  client_name: string;
  client_email: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

const AdminSupport: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      // Get all support messages grouped by user
      const { data: allMessages, error } = await supabase
        .from('support_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique user IDs
      const userIds = [...new Set((allMessages || []).map(m => m.user_id))];
      
      // Fetch user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Build conversation summaries
      const summaries: ConversationSummary[] = userIds.map(userId => {
        const userMessages = (allMessages || []).filter(m => m.user_id === userId);
        const profile = profiles?.find(p => p.id === userId);
        const unreadCount = userMessages.filter(m => 
          m.sender_type === 'client' && !m.read
        ).length;
        
        const lastMsg = userMessages[0];
        
        return {
          user_id: userId,
          client_name: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Client' : 'Client inconnu',
          client_email: profile?.email || '',
          last_message: lastMsg?.message || '',
          last_message_at: lastMsg?.created_at || '',
          unread_count: unreadCount
        };
      });

      // Sort by last message date and unread count
      summaries.sort((a, b) => {
        if (a.unread_count > 0 && b.unread_count === 0) return -1;
        if (b.unread_count > 0 && a.unread_count === 0) return 1;
        return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime();
      });

      setConversations(summaries);
    } catch (err) {
      logger.logError('Error fetching support conversations', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for a specific user
  const fetchMessages = useCallback(async (userId: string) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const typedMessages = (data || []).map(msg => ({
        ...msg,
        sender_type: msg.sender_type as 'client' | 'agent' | 'admin'
      }));
      
      setMessages(typedMessages);

      // Mark client messages as read
      const unreadIds = typedMessages
        .filter(m => m.sender_type === 'client' && !m.read)
        .map(m => m.id);
      
      if (unreadIds.length > 0) {
        await supabase
          .from('support_messages')
          .update({ read: true })
          .in('id', unreadIds);
        
        // Update conversation list
        setConversations(prev => prev.map(c => 
          c.user_id === userId ? { ...c, unread_count: 0 } : c
        ));
      }
    } catch (err) {
      logger.logError('Error fetching messages for user', err);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages when user is selected
  useEffect(() => {
    if (selectedUserId) {
      fetchMessages(selectedUserId);
    }
  }, [selectedUserId, fetchMessages]);

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-support')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
        },
        (payload) => {
          const newMsg = payload.new as SupportMessage;
          
          // Update messages if viewing this conversation
          if (selectedUserId === newMsg.user_id) {
            setMessages(prev => [...prev, {
              ...newMsg,
              sender_type: newMsg.sender_type as 'client' | 'agent' | 'admin'
            }]);
          }
          
          // Refresh conversations list for new messages from clients
          if (newMsg.sender_type === 'client') {
            fetchConversations();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedUserId, fetchConversations]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUserId || !user?.id || sending) return;

    setSending(true);
    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      const { error } = await supabase.from('support_messages').insert({
        user_id: selectedUserId,
        agent_id: user.id,
        message: messageText,
        sender_type: user.role === 'admin' ? 'admin' : 'agent',
      });

      if (error) throw error;
    } catch (err) {
      logger.logError('Error sending support response', err);
      setNewMessage(messageText);
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

  const filteredConversations = conversations.filter(c => 
    c.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.client_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConversation = conversations.find(c => c.user_id === selectedUserId);

  if (loading) {
    return <PageLayout showAnimatedBackground={false}><LoadingSpinner fullPage message="Chargement..." /></PageLayout>;
  }

  return (
    <PageLayout showAnimatedBackground={false}>
      <div className="admin-support-page">
        <div className="page-header">
          <div className="container">
            <h1>Support Client</h1>
            <p>Gérez les conversations avec vos clients</p>
          </div>
        </div>

        <div className="container">
          <div className="support-layout">
            {/* Conversations List */}
            <Card className="conversations-panel" padding="none">
              <div className="panel-header">
                <h3>Conversations</h3>
                <button 
                  className="refresh-btn"
                  onClick={() => fetchConversations()}
                  title="Actualiser"
                >
                  <RefreshCw size={16} />
                </button>
              </div>
              
              <div className="search-box">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="conversations-list">
                {filteredConversations.length === 0 ? (
                  <div className="empty-conversations">
                    <MessageCircle size={32} />
                    <p>Aucune conversation</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.user_id}
                      className={`conversation-item ${selectedUserId === conv.user_id ? 'active' : ''} ${conv.unread_count > 0 ? 'unread' : ''}`}
                      onClick={() => setSelectedUserId(conv.user_id)}
                    >
                      <div className="conv-avatar">
                        <User size={20} />
                      </div>
                      <div className="conv-info">
                        <div className="conv-header">
                          <span className="conv-name">{conv.client_name}</span>
                          {conv.unread_count > 0 && (
                            <span className="unread-badge">{conv.unread_count}</span>
                          )}
                        </div>
                        <p className="conv-email">{conv.client_email}</p>
                        <p className="conv-preview">{conv.last_message.substring(0, 50)}{conv.last_message.length > 50 ? '...' : ''}</p>
                        <span className="conv-time">
                          <Clock size={12} />
                          {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>

            {/* Messages Panel */}
            <Card className="messages-panel" padding="none">
              {!selectedUserId ? (
                <div className="no-selection">
                  <MessageCircle size={48} />
                  <h3>Sélectionnez une conversation</h3>
                  <p>Choisissez un client dans la liste pour voir ses messages</p>
                </div>
              ) : (
                <>
                  <div className="messages-header">
                    <button 
                      className="back-btn mobile-only"
                      onClick={() => setSelectedUserId(null)}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="selected-client">
                      <div className="client-avatar">
                        <User size={20} />
                      </div>
                      <div>
                        <h4>{selectedConversation?.client_name}</h4>
                        <span>{selectedConversation?.client_email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="messages-container">
                    {loadingMessages ? (
                      <div className="loading-messages">
                        <LoadingSpinner message="Chargement des messages..." />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="empty-messages">
                        <p>Aucun message dans cette conversation</p>
                      </div>
                    ) : (
                      <div className="messages-list">
                        {messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`message-item ${msg.sender_type === 'client' ? 'received' : 'sent'}`}
                          >
                            <div className="message-bubble">
                              {msg.sender_type !== 'client' && (
                                <span className="sender-label">
                                  {msg.sender_type === 'admin' ? 'Admin' : 'Conseiller'}
                                </span>
                              )}
                              <p>{msg.message}</p>
                              <span className="message-time">
                                {format(new Date(msg.created_at), 'dd/MM HH:mm', { locale: fr })}
                              </span>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>

                  <div className="message-input-container">
                    <textarea
                      placeholder="Écrivez votre réponse..."
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
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        .admin-support-page {
          min-height: 100vh;
          padding-bottom: 2rem;
        }

        .support-layout {
          display: grid;
          grid-template-columns: 350px 1fr;
          gap: 1.5rem;
          height: calc(100vh - 200px);
          min-height: 600px;
        }

        /* Conversations Panel */
        .conversations-panel {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid hsl(var(--border));
        }

        .panel-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .refresh-btn {
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          color: hsl(var(--muted-foreground));
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background: hsl(var(--muted));
          color: hsl(var(--foreground));
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid hsl(var(--border));
          color: hsl(var(--muted-foreground));
        }

        .search-box input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.875rem;
          background: transparent;
          color: hsl(var(--foreground));
        }

        .conversations-list {
          flex: 1;
          overflow-y: auto;
        }

        .conversation-item {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid hsl(var(--border));
          cursor: pointer;
          transition: background 0.2s;
        }

        .conversation-item:hover {
          background: hsl(var(--muted) / 0.5);
        }

        .conversation-item.active {
          background: hsl(var(--primary) / 0.1);
          border-left: 3px solid hsl(var(--primary));
        }

        .conversation-item.unread {
          background: hsl(var(--primary) / 0.05);
        }

        .conv-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: hsl(var(--muted));
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .conv-info {
          flex: 1;
          min-width: 0;
        }

        .conv-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.125rem;
        }

        .conv-name {
          font-weight: 600;
          font-size: 0.875rem;
        }

        .unread-badge {
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          font-size: 0.7rem;
          font-weight: 600;
          padding: 0.125rem 0.5rem;
          border-radius: 1rem;
        }

        .conv-email {
          font-size: 0.75rem;
          color: hsl(var(--muted-foreground));
          margin: 0 0 0.25rem;
        }

        .conv-preview {
          font-size: 0.8rem;
          color: hsl(var(--muted-foreground));
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .conv-time {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.7rem;
          color: hsl(var(--muted-foreground));
          margin-top: 0.25rem;
        }

        .empty-conversations {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: hsl(var(--muted-foreground));
          text-align: center;
        }

        .empty-conversations p {
          margin: 0.5rem 0 0;
        }

        /* Messages Panel */
        .messages-panel {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .no-selection {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: hsl(var(--muted-foreground));
          text-align: center;
          padding: 2rem;
        }

        .no-selection h3 {
          margin: 1rem 0 0.5rem;
          color: hsl(var(--foreground));
        }

        .no-selection p {
          margin: 0;
        }

        .messages-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid hsl(var(--border));
        }

        .back-btn {
          display: none;
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          color: hsl(var(--muted-foreground));
        }

        .selected-client {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .client-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .selected-client h4 {
          margin: 0;
          font-size: 0.9rem;
        }

        .selected-client span {
          font-size: 0.8rem;
          color: hsl(var(--muted-foreground));
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
        }

        .loading-messages,
        .empty-messages {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: hsl(var(--muted-foreground));
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
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
          font-size: 0.7rem;
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
          font-size: 0.65rem;
          opacity: 0.7;
          margin-top: 0.25rem;
          text-align: right;
        }

        .message-input-container {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
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
          align-self: flex-end;
        }

        /* Mobile */
        @media (max-width: 768px) {
          .support-layout {
            grid-template-columns: 1fr;
          }

          .conversations-panel {
            display: ${selectedUserId ? 'none' : 'flex'};
          }

          .messages-panel {
            display: ${selectedUserId ? 'flex' : 'none'};
          }

          .back-btn.mobile-only {
            display: block;
          }

          .message-bubble {
            max-width: 85%;
          }
        }
      `}</style>
    </PageLayout>
  );
};

export default AdminSupport;
