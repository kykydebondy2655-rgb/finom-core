import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowUp, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingCTAButtonProps {
  onContactClick: () => void;
}

const FloatingCTAButton = ({ onContactClick }: FloatingCTAButtonProps) => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { scrollY } = useScroll();
  
  const opacity = useTransform(scrollY, [0, 300], [0, 1]);
  const scale = useTransform(scrollY, [0, 300], [0.8, 1]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
        style={{ opacity, scale }}
      >
        <AnimatePresence>
          {isExpanded && (
            <>
              {/* Phone Button */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
                transition={{ delay: 0.1 }}
              >
                <Button
                  size="lg"
                  className="rounded-full shadow-lg gap-2 bg-green-500 hover:bg-green-600"
                  asChild
                >
                  <a href="tel:+33123456789">
                    <Phone className="w-5 h-5" />
                    <span className="hidden sm:inline">Appeler</span>
                  </a>
                </Button>
              </motion.div>

              {/* Contact Form Button */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.8 }}
              >
                <Button
                  size="lg"
                  onClick={onContactClick}
                  className="rounded-full shadow-lg gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">Être recontacté</span>
                </Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: isExpanded 
              ? '0 0 0 0 rgba(var(--primary), 0)' 
              : ['0 0 0 0 rgba(var(--primary), 0.4)', '0 0 0 20px rgba(var(--primary), 0)', '0 0 0 0 rgba(var(--primary), 0.4)']
          }}
          transition={{
            boxShadow: { duration: 2, repeat: Infinity }
          }}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <MessageCircle className="w-6 h-6" />
          </motion.div>

          {/* Notification Badge */}
          {!isExpanded && (
            <motion.span
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              1
            </motion.span>
          )}
        </motion.button>
      </motion.div>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-muted border border-border shadow-lg flex items-center justify-center hover:bg-muted/80 transition-colors"
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp className="w-5 h-5 text-foreground" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingCTAButton;
