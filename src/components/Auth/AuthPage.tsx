
import React, { useState } from 'react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, TrendingUp, Brain, Users, Zap, Star, ArrowRight, Shield, Rocket, Target, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPage = () => {
  const { isSignedIn, isLoaded } = useUser();
  const [selectedPlan, setSelectedPlan] = useState('growth');

  // Redirect to dashboard if already signed in
  if (isLoaded && isSignedIn) {
    return <Navigate to="/" replace />;
  }

  const plans = [
    {
      id: 'starter',
      name: "Starter Pro",
      price: 149,
      originalPrice: 199,
      savings: 25,
      description: "Perfect for new wholesalers",
      badge: "Most Popular for Beginners",
      features: [
        "1,000 AI-powered leads/month",
        "Advanced profit calculator",
        "5,000 SMS credits included",
        "Email & chat support",
        "Basic buyer network access",
        "Deal analyzer with comps",
        "Contract templates"
      ],
      popular: false,
      color: "from-blue-500 to-cyan-600",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      id: 'growth',
      name: "Growth Elite",
      price: 399,
      originalPrice: 499,
      savings: 20,
      description: "For serious real estate pros",
      badge: "Best Value",
      features: [
        "5,000 AI-powered leads/month",
        "Unlimited profit analysis",
        "15,000 SMS credits included",
        "Priority support & training",
        "Full buyer network access",
        "AI call assistant",
        "Contract automation",
        "Advanced market analytics",
        "White-label reports"
      ],
      popular: true,
      color: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      id: 'enterprise',
      name: "Enterprise Max",
      price: 799,
      originalPrice: 999,
      savings: 20,
      description: "For real estate teams & agencies",
      badge: "Enterprise Solution",
      features: [
        "Unlimited AI leads & analysis",
        "White-label platform access",
        "Unlimited SMS & voice calls",
        "Dedicated account manager",
        "Custom AI model training",
        "Full API access",
        "Advanced analytics suite",
        "Team collaboration tools",
        "Custom integrations"
      ],
      popular: false,
      color: "from-purple-500 to-indigo-600",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const benefits = [
    { icon: Brain, title: "AI-Powered Intelligence", desc: "Advanced ML algorithms find hidden opportunities" },
    { icon: Zap, title: "Lightning Fast Results", desc: "Get qualified leads in under 5 minutes" },
    { icon: Shield, title: "Verified Data Quality", desc: "96.3% accuracy rate on all lead data" },
    { icon: Target, title: "Precision Targeting", desc: "Match deals to perfect buyers automatically" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl flex items-center justify-center">
                <TrendingUp className="text-white" size={36} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-5xl font-bold">dealflow.ai</h1>
                <p className="text-xl text-white/90 font-medium">AI-Powered Real Estate Wholesaling</p>
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Close More Deals with AI Automation
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
              Join 12,000+ investors using our AI to automate deal flow, qualify buyers, and close profitable wholesale deals faster than ever.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold">12K+</div>
                <div className="text-white/80">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">$450M+</div>
                <div className="text-white/80">Deals Closed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">96.3%</div>
                <div className="text-white/80">Success Rate</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Auth Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="order-2 lg:order-1"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Get Started Today</h3>
              <p className="text-gray-600 text-lg">Join thousands of successful wholesalers</p>
              <Badge className="bg-emerald-100 text-emerald-700 px-4 py-2 mt-3">
                <Clock className="w-4 h-4 mr-2" />
                14-Day Free Trial • No Credit Card Required
              </Badge>
            </div>

            <Tabs defaultValue="signup" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
                <TabsTrigger value="signup" className="text-base font-medium">Start Free Trial</TabsTrigger>
                <TabsTrigger value="signin" className="text-base font-medium">Sign In</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signup">
                <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-bold text-gray-900">Create Your Account</CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      Start your 14-day free trial and begin closing deals with AI
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <SignUp 
                      fallbackRedirectUrl="/"
                      appearance={{
                        elements: {
                          formButtonPrimary: 
                            "bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105",
                          card: "shadow-none border-0 bg-transparent",
                          headerTitle: "hidden",
                          headerSubtitle: "hidden",
                          formFieldInput: "rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 h-12 text-base",
                          formFieldLabel: "text-gray-700 font-semibold text-base",
                          dividerLine: "bg-gray-200",
                          dividerText: "text-gray-500 font-medium",
                          socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 rounded-xl h-12 font-medium",
                          footer: "hidden"
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="signin">
                <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-xl">
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
                    <CardDescription className="text-gray-600 text-base">
                      Sign in to access your AI-powered deal flow dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-8">
                    <SignIn 
                      fallbackRedirectUrl="/"
                      appearance={{
                        elements: {
                          formButtonPrimary: 
                            "bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105",
                          card: "shadow-none border-0 bg-transparent",
                          headerTitle: "hidden",
                          headerSubtitle: "hidden",
                          formFieldInput: "rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 h-12 text-base",
                          formFieldLabel: "text-gray-700 font-semibold text-base",
                          dividerLine: "bg-gray-200",
                          dividerText: "text-gray-500 font-medium",
                          socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 rounded-xl h-12 font-medium",
                          footer: "hidden"
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 grid grid-cols-2 gap-4"
            >
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-gray-100">
                  <benefit.icon className="text-emerald-500 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{benefit.title}</h4>
                    <p className="text-gray-600 text-xs">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Pricing Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="order-1 lg:order-2"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Choose Your Plan</h3>
              <p className="text-gray-600 text-lg">All plans include 14-day free trial</p>
            </div>

            <div className="space-y-6">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="relative cursor-pointer"
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-6 z-10">
                      <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-4 py-2 shadow-lg">
                        <Star className="w-4 h-4 mr-2" />
                        {plan.badge}
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={`${
                    plan.popular ? 'ring-2 ring-emerald-500 shadow-2xl' : 'shadow-xl hover:shadow-2xl'
                  } ${
                    selectedPlan === plan.id ? 'ring-2 ring-blue-500' : ''
                  } bg-white/95 backdrop-blur-xl border-0 overflow-hidden transition-all duration-300`}>
                    
                    <div className={`bg-gradient-to-r ${plan.color} p-6 text-white relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold">{plan.name}</h3>
                            <p className="text-white/90 text-sm font-medium">{plan.description}</p>
                          </div>
                          {!plan.popular && (
                            <Badge className="bg-white/20 text-white px-3 py-1 text-xs">
                              {plan.badge}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-baseline space-x-2">
                          <span className="text-4xl font-bold">${plan.price}</span>
                          <span className="text-white/80">/mo</span>
                          {plan.originalPrice > plan.price && (
                            <div className="flex flex-col">
                              <span className="text-sm line-through text-white/60">
                                ${plan.originalPrice}
                              </span>
                              <Badge className="bg-white/20 text-white text-xs px-2 py-1">
                                Save {plan.savings}%
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="text-emerald-500 mt-1 mr-3 flex-shrink-0" size={16} />
                            <span className="text-gray-700 font-medium">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button
                        className={`w-full h-12 text-base font-semibold rounded-xl transition-all duration-300 ${
                          plan.popular
                            ? 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                            : selectedPlan === plan.id
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        }`}
                      >
                        {selectedPlan === plan.id ? 'Selected Plan' : 'Start Free Trial'}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Guarantee */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-200"
            >
              <div className="text-center">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">Money-Back Guarantee</h4>
                <p className="text-gray-600 text-sm">
                  Not satisfied? Get a full refund within 30 days, no questions asked.
                </p>
                <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    14-day free trial
                  </span>
                  <span className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    No setup fees
                  </span>
                  <span className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                    Cancel anytime
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
