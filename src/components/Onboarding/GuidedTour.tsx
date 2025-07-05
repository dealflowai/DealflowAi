
import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

interface GuidedTourProps {
  isOpen: boolean;
  onComplete: () => void;
}

const tourSteps: Step[] = [
  {
    target: '[data-tour="buyers-cta"]',
    content: 'Start by importing or discovering qualified cash buyers for your deals.',
    title: 'Step 1: Import or Discover Buyers',
    placement: 'bottom',
  },
  {
    target: '[data-tour="ai-discovery"]',
    content: 'Use our AI-powered discovery tools to find new buyers automatically.',
    title: 'Step 2: Run First AI Discovery',
    placement: 'bottom',
  },
  {
    target: '[data-tour="deal-analyzer"]',
    content: 'Analyze your first deal to get AI-powered insights and recommendations.',
    title: 'Step 3: Analyze First Deal',
    placement: 'bottom',
  },
  {
    target: '[data-tour="contracts"]',
    content: 'Generate contracts and LOIs with our AI-powered contract generator.',
    title: 'Step 4: Send Contract/LOI',
    placement: 'bottom',
  },
];

const GuidedTour = ({ isOpen, onComplete }: GuidedTourProps) => {
  const { user } = useUser();
  const [run, setRun] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRun(true);
    }
  }, [isOpen]);

  const handleJoyrideCallback = async (data: CallBackProps) => {
    const { status } = data;
    
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      setRun(false);
      
      // Store completion flag in localStorage and Supabase
      localStorage.setItem('hasCompletedOnboard', 'true');
      
      if (user?.id) {
        await supabase
          .from('profiles')
          .upsert(
            { clerk_id: user.id, has_completed_onboarding: true },
            { onConflict: 'clerk_id' }
          );
      }
      
      onComplete();
    }
  };

  return (
    <Joyride
      steps={tourSteps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: 'hsl(160 50% 45%)',
          textColor: 'hsl(222.2 84% 4.9%)',
          backgroundColor: 'white',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
        },
        tooltip: {
          borderRadius: '12px',
          padding: '16px',
        },
        tooltipTitle: {
          fontSize: '18px',
          fontWeight: '600',
          marginBottom: '8px',
        },
        tooltipContent: {
          fontSize: '14px',
          lineHeight: '1.5',
        },
        buttonNext: {
          backgroundColor: 'hsl(160 50% 45%)',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '500',
        },
        buttonBack: {
          color: 'hsl(160 50% 45%)',
          fontSize: '14px',
          fontWeight: '500',
        },
        buttonSkip: {
          color: 'hsl(215.4 16.3% 46.9%)',
          fontSize: '14px',
        },
      }}
    />
  );
};

export default GuidedTour;
