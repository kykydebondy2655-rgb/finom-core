import { ArrowRight, Phone, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ABVariantCTAProps {
  variant: string;
  onClick: () => void;
  disabled?: boolean;
}

/**
 * A/B Test Variants for the CTA Button
 */
export const ABVariantCTA = ({ variant, onClick, disabled }: ABVariantCTAProps) => {
  switch (variant) {
    case 'variant_a':
      return (
        <Button
          onClick={onClick}
          disabled={disabled}
          size="lg"
          className="w-full bg-white text-primary hover:bg-white/90 font-semibold text-lg py-6 group"
        >
          <FileText className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
          Demander mon étude gratuite
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      );
    case 'variant_b':
      return (
        <Button
          onClick={onClick}
          disabled={disabled}
          size="lg"
          className="w-full bg-green-500 text-white hover:bg-green-600 font-semibold text-lg py-6 shadow-lg shadow-green-500/25 group"
        >
          <Phone className="w-5 h-5 mr-2 group-hover:animate-pulse" />
          Parler à un conseiller
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      );
    default:
      return (
        <Button
          onClick={onClick}
          disabled={disabled}
          size="lg"
          className="w-full bg-white text-primary hover:bg-white/90 font-semibold text-lg py-6"
        >
          Être recontacté
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      );
  }
};

export default ABVariantCTA;
