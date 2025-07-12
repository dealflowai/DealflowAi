import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Building2 } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: string;
  currentPlan?: string;
}

const PLAN_FEATURES = {
  starter: [
    '25 monthly tokens (never expire)',
    'Basic AI discovery',
    'Email support',
    '1 user included',
    'Basic analytics overview',
    '5 contract templates',
  ],
  pro: [
    '50 monthly tokens + 100 starter credits',
    'Advanced AI buyer discovery',
    'Unlimited deal analysis',
    'Priority support',
    'Advanced CRM features',
    'API access',
    'Full analytics dashboard',
    'Manual AI outreach campaigns',
    'Voice/text AI agents',
    'E-signature support',
  ],
  agency: [
    'Everything in Pro',
    '3-5 user accounts',
    'Full outreach campaigns',
    'Custom templates',
    'Dedicated account manager',
    'Team management & role routing',
    'Full analytics & predictions',
    'White-label branding option',
    'Unlimited tokens for team',
  ],
};

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  feature,
  currentPlan = 'free',
}) => {
  const { subscriptionTier } = useSubscription();

  const handleUpgrade = (plan: string) => {
    // This would trigger the Stripe checkout
    console.log(`Upgrading to ${plan}`);
    onClose();
  };

  const isPlanActive = (plan: string) => {
    return subscriptionTier?.toLowerCase() === plan.toLowerCase();
  };

  const shouldShowPlan = (plan: string) => {
    const planHierarchy = ['free', 'starter', 'pro', 'agency'];
    const currentIndex = planHierarchy.indexOf(currentPlan.toLowerCase());
    const planIndex = planHierarchy.indexOf(plan.toLowerCase());
    return planIndex > currentIndex;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">
            {feature ? `Upgrade to Access ${feature}` : 'Choose Your Plan'}
          </DialogTitle>
          <DialogDescription>
            {feature 
              ? `You've reached your plan limit. Upgrade to unlock ${feature} and more features.`
              : 'Unlock more features and higher limits with a paid plan.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {/* Starter Plan */}
          {shouldShowPlan('starter') && (
            <div className="relative border rounded-lg p-6 space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h3 className="text-xl font-semibold">Free</h3>
                </div>
                <div className="text-3xl font-bold">Free</div>
                <p className="text-sm text-muted-foreground">25 monthly tokens (never expire)</p>
              </div>
              
              <ul className="space-y-2 text-sm">
                {PLAN_FEATURES.starter.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handleUpgrade('starter')}
                className="w-full"
                variant={isPlanActive('starter') ? 'outline' : 'default'}
                disabled={isPlanActive('starter')}
              >
                {isPlanActive('starter') ? 'Current Plan' : 'Get Started Free'}
              </Button>
            </div>
          )}

          {/* Pro Plan */}
          {shouldShowPlan('pro') && (
            <div className="relative border-2 border-primary rounded-lg p-6 space-y-4">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                Most Popular
              </Badge>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="h-5 w-5 text-blue-500" />
                  <h3 className="text-xl font-semibold">Pro</h3>
                </div>
                <div className="text-3xl font-bold">$49<span className="text-sm font-normal">/mo</span></div>
                <p className="text-sm text-muted-foreground">50 monthly tokens + 100 starter credits</p>
              </div>
              
              <ul className="space-y-2 text-sm">
                {PLAN_FEATURES.pro.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handleUpgrade('pro')}
                className="w-full"
                variant={isPlanActive('pro') ? 'outline' : 'default'}
                disabled={isPlanActive('pro')}
              >
                {isPlanActive('pro') ? 'Current Plan' : 'Upgrade to Pro'}
              </Button>
            </div>
          )}

          {/* Agency Plan */}
          {shouldShowPlan('agency') && (
            <div className="relative border rounded-lg p-6 space-y-4 bg-gradient-to-br from-purple-50 to-blue-50">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-purple-600" />
                  <h3 className="text-xl font-semibold">Agency</h3>
                </div>
                <div className="text-3xl font-bold">$299<span className="text-sm font-normal">/mo</span></div>
                <p className="text-sm text-muted-foreground">Complete solution for teams</p>
              </div>
              
              <ul className="space-y-2 text-sm">
                {PLAN_FEATURES.agency.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                onClick={() => handleUpgrade('agency')}
                className="w-full"
                variant={isPlanActive('agency') ? 'outline' : 'default'}
                disabled={isPlanActive('agency')}
              >
                {isPlanActive('agency') ? 'Current Plan' : 'Upgrade to Agency'}
              </Button>
            </div>
          )}
        </div>

        <div className="text-center mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            All plans are free to start. No credit card required.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};