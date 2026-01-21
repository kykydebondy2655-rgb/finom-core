import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const FAQ_RESPONSES: Record<string, string> = {
  'taux': 'Nos taux actuels varient entre 3,00% et 3,89% selon votre profil et la durée du prêt. Utilisez notre simulateur pour obtenir une estimation personnalisée !',
  'apport': 'Un apport de 10% à 20% du prix du bien est généralement recommandé. Un apport plus élevé peut vous permettre d\'obtenir un meilleur taux.',
  'délai': 'Le délai moyen pour obtenir une réponse de principe est de 24 à 48h. Le déblocage des fonds intervient généralement sous 2 à 3 semaines après accord.',
  'documents': 'Les documents généralement requis sont : pièce d\'identité, justificatifs de revenus (3 derniers bulletins), avis d\'imposition, relevés bancaires.',
  'assurance': 'L\'assurance emprunteur est incluse dans notre estimation. Le taux est de 0,31% du capital emprunté par an.',
  'simulation': 'Vous pouvez simuler votre crédit directement sur cette page ! Ajustez les paramètres et cliquez sur "Être recontacté" pour un accompagnement personnalisé.',
  'contact': 'Vous pouvez nous joindre par email à contact@pret-finom.co ou par téléphone au 01 87 68 08 90 (du lundi au vendredi, 9h-18h).',
};

const DEFAULT_RESPONSES = [
  'Merci pour votre message ! Un conseiller vous répondra bientôt. En attendant, n\'hésitez pas à utiliser notre simulateur.',
  'Je comprends votre question. Pour une réponse personnalisée, je vous invite à remplir le formulaire de contact.',
  'Bonne question ! Pour plus de détails, un conseiller peut vous rappeler. Souhaitez-vous être recontacté ?',
];

const QUICK_QUESTIONS = [
  'Quels sont vos taux ?',
  'Quel apport minimum ?',
  'Délai de réponse ?',
  'Documents nécessaires ?',
];

const LandingChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Bonjour ! 👋 Je suis l\'assistant FINOM. Comment puis-je vous aider avec votre projet immobilier ?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const findResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    for (const [keyword, response] of Object.entries(FAQ_RESPONSES)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }
    
    // Return a random default response
    return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const botResponse: Message = {
      id: crypto.randomUUID(),
      content: findResponse(userMessage.content),
      sender: 'bot',
      timestamp: new Date(),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botResponse]);
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => handleSend(), 100);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow"
            >
              <MessageCircle className="w-6 h-6" />
            </Button>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)]"
          >
            <Card className="shadow-2xl border-0 overflow-hidden">
              {/* Header */}
              <CardHeader className="bg-primary text-primary-foreground p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Assistant FINOM</CardTitle>
                      <p className="text-xs opacity-80">En ligne • Répond en 1 min</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-primary-foreground hover:bg-white/20"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="p-0">
                <ScrollArea className="h-[300px] p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-2 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.sender === 'bot' && (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-muted rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        {message.sender === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                    
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-2 items-center"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Quick Questions */}
                {messages.length <= 2 && (
                  <div className="px-4 pb-2">
                    <p className="text-xs text-muted-foreground mb-2">Questions fréquentes :</p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_QUESTIONS.map((question) => (
                        <button
                          key={question}
                          onClick={() => handleQuickQuestion(question)}
                          className="text-xs bg-muted hover:bg-muted/80 px-3 py-1.5 rounded-full transition-colors"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      ref={inputRef}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Écrivez votre message..."
                      className="flex-1"
                      disabled={isTyping}
                    />
                    <Button type="submit" size="icon" disabled={!inputValue.trim() || isTyping}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingChatWidget;
