import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Star, ArrowRight, Settings, Zap, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

const Pricing = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ subscribed: false });
  const [loading, setLoading] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for success/cancel parameters
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast({
        title: "Payment Successful!",
        description: "Your subscription has been activated. Welcome to dealflow.ai!",
      });
      // Clear the URL parameters
      navigate('/pricing', { replace: true });
    } else if (searchParams.get('canceled') === 'true') {
      toast({
        title: "Payment Canceled",
        description: "Your payment was canceled. You can try again anytime.",
        variant: "destructive",
      });
      // Clear the URL parameters
      navigate('/pricing', { replace: true });
    }
  }, [searchParams, toast, navigate]);

  const checkSubscription = async () => {
    try {
      setCheckingSubscription(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscriptionStatus(data);
    } catch (error: any) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
    } finally {
      setCheckingSubscription(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  const handleSubscribe = async (plan: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan }
      });
      
      if (error) throw error;
      
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Error",
        description: "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error", 
        description: "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Starter",
      price: 79,
      period: "/mo",
      description: "Solo wholesaler or coach's student",
      features: [
        "Import buyers and analyze deals",
        "Basic AI discovery",
        "Email support",
        "1 user included",
        "Basic CRM features"
      ],
      popular: false,
      gradient: "from-blue-500 to-blue-700",
      planId: "starter"
    },
    {
      name: "Pro",
      price: 199,
      period: "/mo", 
      description: "Mid-level wholesaler doing 2+ deals/month",
      features: [
        "Advanced AI buyer discovery",
        "Unlimited deal analysis",
        "Priority support",
        "Advanced CRM features",
        "API access",
        "Deal automation"
      ],
      popular: true,
      gradient: "from-emerald-500 to-blue-600",
      planId: "pro"
    },
    {
      name: "Agency",
      price: 499,
      period: "/mo",
      description: "3–5 users + full outreach campaigns, templates",
      features: [
        "Everything in Pro",
        "3-5 user accounts",
        "Full outreach campaigns",
        "Custom templates",
        "Dedicated account manager",
        "White-label options"
      ],
      popular: false,
      gradient: "from-purple-500 to-pink-600",
      planId: "agency"
    }
  ];

  if (checkingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2 rounded-full mb-6">
            <Star className="mr-2" size={16} />
            Choose Your Plan
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Start Your Wholesaling Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Begin with a 14-day free trial, then choose the perfect plan for your business
          </p>
        </motion.div>

        {/* Subscription Status */}
        {subscriptionStatus.subscribed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <Card className="bg-gradient-to-r from-emerald-100 to-blue-100 border-emerald-200">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mr-3" />
                  <h3 className="text-2xl font-bold text-emerald-800">
                    Active Subscription: {subscriptionStatus.subscription_tier}
                  </h3>
                </div>
                <p className="text-emerald-700 mb-4">
                  Your subscription is active and will renew on{' '}
                  {subscriptionStatus.subscription_end && 
                    new Date(subscriptionStatus.subscription_end).toLocaleDateString()
                  }
                </p>
                <Button 
                  onClick={handleManageSubscription}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Settings className="mr-2" size={16} />
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Free Trial Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-xl font-bold text-blue-800">14-Day Free Trial</h3>
              </div>
              <p className="text-blue-700">
                Import limited buyers • Test AI discovery • Analyze 1 deal • Basic support
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const isCurrentPlan = subscriptionStatus.subscribed && 
              subscriptionStatus.subscription_tier?.toLowerCase() === plan.name.toLowerCase();
            
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-2">
                      Current Plan
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full ${plan.popular || isCurrentPlan ? 'ring-2 ring-emerald-500 shadow-2xl' : 'shadow-xl'} bg-white rounded-3xl overflow-hidden`}>
                  <CardHeader className={`bg-gradient-to-r ${plan.gradient} text-white p-8`}>
                    <CardTitle className="text-2xl font-bold mb-2">{plan.name}</CardTitle>
                    <p className="text-white/80 mb-4">{plan.description}</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-white/80">{plan.period}</span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button 
                        className={`w-full py-4 text-lg rounded-full ${
                          isCurrentPlan 
                            ? 'bg-emerald-100 text-emerald-700 cursor-default' 
                            : plan.popular 
                              ? 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        }`}
                        onClick={() => !isCurrentPlan && handleSubscribe(plan.planId)}
                        disabled={loading || isCurrentPlan}
                      >
                        {isCurrentPlan ? 'Current Plan' : 'Start Free Trial'}
                        {!isCurrentPlan && <ArrowRight className="ml-2" size={20} />}
                      </Button>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Features Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mt-20 text-center"
        >
          <h2 className="text-3xl font-bold mb-8">What You Get With Every Plan</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Buyer Discovery</h3>
              <p className="text-gray-600">Find and qualify cash buyers automatically with our AI engine</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Deal Analysis</h3>
              <p className="text-gray-600">Analyze deals with 500+ variables for accurate profit projections</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2">Automation</h3>
              <p className="text-gray-600">Automate outreach, follow-ups, and contract generation</p>
            </div>
          </div>
        </motion.div>

        {/* Refresh Button */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-12"
        >
          <Button 
            variant="outline" 
            onClick={checkSubscription}
            disabled={checkingSubscription}
          >
            {checkingSubscription ? 'Checking...' : 'Refresh Subscription Status'}
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default Pricing;