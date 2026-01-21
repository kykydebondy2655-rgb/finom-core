import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Calculator, FileCheck, Users, Home, CheckCircle2, ArrowRight } from 'lucide-react';
import processVideo from '@/assets/process-digital-video.mp4';
import processImage from '@/assets/process-digital.jpg';

interface Step {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  duration: string;
}

const steps: Step[] = [
  {
    icon: Calculator,
    title: "Simulation en ligne",
    description: "Estimez votre capacité d'emprunt en quelques clics avec notre simulateur intelligent.",
    duration: "2 min"
  },
  {
    icon: FileCheck,
    title: "Constitution du dossier",
    description: "Téléchargez vos documents en toute sécurité. Notre équipe vérifie et optimise votre dossier.",
    duration: "24-48h"
  },
  {
    icon: Users,
    title: "Négociation bancaire",
    description: "Nous négocions les meilleures conditions auprès de nos 100+ banques partenaires.",
    duration: "5-7 jours"
  },
  {
    icon: Home,
    title: "Offre de prêt",
    description: "Recevez votre offre de prêt au meilleur taux. Signature chez le notaire.",
    duration: "30 jours"
  }
];

const AnimatedProcessSteps = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState(0);
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section ref={containerRef} className="py-20 bg-gradient-to-b from-background to-muted/30 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <CheckCircle2 className="w-4 h-4" />
            Processus Simple
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            4 étapes vers votre crédit
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Un accompagnement personnalisé de A à Z
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Animated Video/Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {/* Video with fallback */}
              <video
                autoPlay
                muted
                loop
                playsInline
                onCanPlay={() => setVideoLoaded(true)}
                className={`w-full aspect-[4/3] object-cover transition-opacity duration-500 ${
                  videoLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <source src={processVideo} type="video/mp4" />
              </video>
              
              <img
                src={processImage}
                alt="Processus digital"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                  videoLoaded ? 'opacity-0' : 'opacity-100'
                }`}
              />

              {/* Overlay with current step info */}
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/50 to-transparent"
              >
                <div className="flex items-center gap-3 text-white">
                  <div className="p-2 rounded-lg bg-primary">
                    {(() => {
                      const IconComponent = steps[activeStep].icon;
                      return <IconComponent className="w-5 h-5" />;
                    })()}
                  </div>
                  <div>
                    <p className="font-semibold">{steps[activeStep].title}</p>
                    <p className="text-sm text-white/70">{steps[activeStep].duration}</p>
                  </div>
                </div>
              </motion.div>

              {/* Animated Border */}
              <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-primary/50"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(var(--primary), 0.1)',
                    '0 0 40px rgba(var(--primary), 0.2)',
                    '0 0 20px rgba(var(--primary), 0.1)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            {/* Floating decorative elements */}
            <motion.div
              className="absolute -top-6 -left-6 w-24 h-24 rounded-2xl bg-primary/10"
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full bg-accent/20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
          </motion.div>

          {/* Right: Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                onMouseEnter={() => setActiveStep(index)}
                className={`relative p-6 rounded-xl cursor-pointer transition-all duration-300 ${
                  activeStep === index 
                    ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]' 
                    : 'bg-card hover:bg-muted border border-border/50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Step Number */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                    activeStep === index 
                      ? 'bg-white text-primary' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{step.title}</h3>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        activeStep === index 
                          ? 'bg-white/20' 
                          : 'bg-muted'
                      }`}>
                        {step.duration}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      activeStep === index 
                        ? 'text-primary-foreground/80' 
                        : 'text-muted-foreground'
                    }`}>
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <motion.div
                    animate={{ x: activeStep === index ? [0, 5, 0] : 0 }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className={activeStep === index ? 'text-white' : 'text-muted-foreground'}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </div>

                {/* Progress line between steps */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[2.25rem] top-full h-4 w-0.5 bg-border" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnimatedProcessSteps;
