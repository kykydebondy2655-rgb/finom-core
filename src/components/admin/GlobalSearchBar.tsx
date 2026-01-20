import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, FileText, UserCheck, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'client' | 'loan' | 'agent';
  title: string;
  subtitle: string;
}

const GlobalSearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const searchTerm = `%${query.toLowerCase()}%`;
        
        // Search in parallel
        const [clientsRes, loansRes, agentsRes] = await Promise.all([
          // Search clients (role = client only)
          supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
            .limit(5),
          // Search loans by ID prefix
          supabase
            .from('loan_applications')
            .select('id, amount, status, user_id')
            .ilike('id', searchTerm)
            .limit(5),
          // Search agents
          supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'agent')
        ]);

        const searchResults: SearchResult[] = [];

        // Get agent user IDs for filtering
        const agentIds = new Set(agentsRes.data?.map(a => a.user_id) || []);

        // Process clients (exclude agents and admins)
        if (clientsRes.data) {
          const adminRes = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'admin');
          const adminIds = new Set(adminRes.data?.map(a => a.user_id) || []);

          clientsRes.data
            .filter(c => !agentIds.has(c.id) && !adminIds.has(c.id))
            .forEach(client => {
              searchResults.push({
                id: client.id,
                type: 'client',
                title: `${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Client',
                subtitle: client.email || 'Pas d\'email',
              });
            });
        }

        // Process loans
        if (loansRes.data) {
          loansRes.data.forEach(loan => {
            searchResults.push({
              id: loan.id,
              type: 'loan',
              title: `Dossier #${loan.id.slice(0, 8)}`,
              subtitle: `${(loan.amount || 0).toLocaleString('fr-FR')} € - ${loan.status || 'pending'}`,
            });
          });
        }

        // Search agents by name
        if (agentsRes.data && agentsRes.data.length > 0) {
          const agentProfiles = await supabase
            .from('profiles')
            .select('id, first_name, last_name, email')
            .in('id', agentsRes.data.map(a => a.user_id))
            .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
            .limit(3);

          if (agentProfiles.data) {
            agentProfiles.data.forEach(agent => {
              searchResults.push({
                id: agent.id,
                type: 'agent',
                title: `${agent.first_name || ''} ${agent.last_name || ''}`.trim() || 'Agent',
                subtitle: agent.email || 'Pas d\'email',
              });
            });
          }
        }

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    
    switch (result.type) {
      case 'client':
        navigate(`/admin/clients/${result.id}`);
        break;
      case 'loan':
        navigate(`/loans/${result.id}`);
        break;
      case 'agent':
        navigate('/admin/agents');
        break;
    }
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return <User size={16} className="text-blue-500" />;
      case 'loan':
        return <FileText size={16} className="text-green-500" />;
      case 'agent':
        return <UserCheck size={16} className="text-purple-500" />;
    }
  };

  const getTypeLabel = (type: SearchResult['type']) => {
    switch (type) {
      case 'client':
        return 'Client';
      case 'loan':
        return 'Dossier';
      case 'agent':
        return 'Agent';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Rechercher clients, dossiers, agents..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10 h-10 bg-background border-border"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Aucun résultat pour "{query}"
            </div>
          ) : (
            <div className="py-1">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2 text-left",
                    "hover:bg-accent transition-colors"
                  )}
                >
                  <div className="flex-shrink-0">{getIcon(result.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{result.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                  </div>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {getTypeLabel(result.type)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;
