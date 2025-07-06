
import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation } from '@tanstack/react-query';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';
import { toast } from 'sonner';

const OnboardingTour = () => {
  const { user } = useUser();
  const [runTour, setRunTour] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ['profile-onboarding', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('has_completed_onboarding')
        .eq('clerk_id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user?.id,
  });

  const completeOnboardingMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('profiles')
        .update({ has_completed_onboarding: true })
        .eq('clerk_id', user?.id || '');
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Welcome! Onboarding completed successfully.');
    },
  });

  useEffect(() => {
    if (profile && !profile.has_completed_onboarding) {
      setRunTour(true);
    }
  }, [profile]);

  const steps: Step[] = [
    {
      target: '[data-testid="buyers-nav"]',
      content: 'Start by importing or discovering your buyers. This is where you manage your investor network.',
      title: 'Import/Discover Buyers',
      placement: 'bottom',
    },
    {
      target: '[data-testid="ai-discovery"]',
      content: 'Use AI to discover potential buyers based on your criteria and market analysis.',
      title: 'Run AI Discovery',
      placement: 'bottom',
    },
    {
      target: '[data-testid="deals-nav"]',
      content: 'Analyze your first deal here. Add property details and get AI-powered insights.',
      title: 'Analyze First Deal',
      placement: 'bottom',
    },
    {
      target: '[data-testid="contracts-nav"]',
      content: 'Generate and send contracts with e-signature capabilities to close deals faster.',
      title: 'Send Contract',
      placement: 'bottom',
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRunTour(false);
      completeOnboardingMutation.mutate();
    }
  };

  if (!profile || profile.has_completed_onboarding) {
    return null;
  }

  return (
    <Joyride
      steps={steps}
      run={runTour}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#3b82f6',
          textColor: '#374151',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(0, 0, 0, 0.4)',
          arrowColor: '#ffffff',
          zIndex: 1000,
        },
        buttonNext: {
          backgroundColor: '#3b82f6',
          color: '#ffffff',
        },
        buttonBack: {
          color: '#6b7280',
        },
      }}
    />
  );
};

export default OnboardingTour;
