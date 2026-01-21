import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ArrowUp, Phone, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface FloatingCTAButtonProps {
  onContactClick: () => void;
}

const FloatingCTAButton = ({ onContactClick }: FloatingCTAButtonProps) => {
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { scrollY } = useScroll();
  const isMobile = useIsMobile();
  
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

  // Close expanded menu when scrolling on mobile
  useEffect(() => {
    if (!isMobile) return;
    
    const handleScroll = () => {
      if (isExpanded) setIsExpanded(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobile, isExpanded]);

  return (
    <>
      {/* Floating Action Button */}
      <motion.div
        className={`fixed z-40 flex flex-col items-end gap-2 md:gap-3 ${
          isMobile 
            ? 'bottom-20 right-3' 
            : 'bottom-6 right-6'
        }`}
        style={{ 
          opacity, 
          scale,
          paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0)' : 0
        }}
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
                  size={isMobile ? "default" : "lg"}
                  className="rounded-full shadow-lg gap-2 bg-green-500 hover:bg-green-600"
                  asChild
                >
                  <a href="tel:+33123456789">
                    <Phone className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                    {!isMobile && <span>Appeler</span>}
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
                  size={isMobile ? "default" : "lg"}
                  onClick={onContactClick}
                  className="rounded-full shadow-lg gap-2"
                >
                  <MessageCircle className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                  {!isMobile && <span>Être recontacté</span>}
                </Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center ${
            isMobile ? 'w-12 h-12' : 'w-14 h-14'
          }`}
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
            <MessageCircle className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
          </motion.div>

          {/* Notification Badge */}
          {!isExpanded && (
            <motion.span
              className={`absolute bg-red-500 rounded-full text-white flex items-center justify-center ${
                isMobile ? '-top-0.5 -right-0.5 w-4 h-4 text-[10px]' : '-top-1 -right-1 w-5 h-5 text-xs'
              }`}
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
            className={`fixed z-40 rounded-full bg-muted border border-border shadow-lg flex items-center justify-center hover:bg-muted/80 transition-colors ${
              isMobile 
                ? 'bottom-20 left-3 w-10 h-10' 
                : 'bottom-6 left-6 w-12 h-12'
            }`}
            style={{
              paddingBottom: isMobile ? 'env(safe-area-inset-bottom, 0)' : 0
            }}
            whileHover={{ y: -3 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp className={isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingCTAButton;
