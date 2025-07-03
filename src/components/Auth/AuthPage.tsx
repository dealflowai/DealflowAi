
import React, { useState } from 'react';
import { SignIn, SignUp, useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, TrendingUp, Brain, Users, Zap, Star, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AuthPage = () => {
  const { isSignedIn, isLoaded } = useUser();
  const [showPlans, setShowPlans] = useState(false);

  // Redirect to dashboard if already signed in
  if (isLoaded && isSignedIn) {
    return <Navigate to="/" replace />;
  }

  const plans = [
    {
      name: "Starter Pro",
      price: 149,
      originalPrice: 199,
      description: "Perfect for new investors",
      features: [
        "1,000 AI-powered leads/month",
        "Advanced profit calculator",
        "5,000 SMS credits",
        "Email & chat support",
        "Basic buyer network access"
      ],
      popular: false,
      gradient: "from-gray-500 to-gray-700"
    },
    {
      name: "Growth Elite",
      price: 399,
      originalPrice: 499,
      description: "For serious wholesalers",
      features: [
        "5,000 AI-powered leads/month",
        "Unlimited profit analysis",
        "15,000 SMS credits",
        "Priority support & training",
        "Full buyer network access",
        "AI call assistant",
        "Contract automation"
      ],
      popular: true,
      gradient: "from-emerald-500 to-blue-600"
    },
    {
      name: "Enterprise Max",
      price: 799,
      originalPrice: 999,
      description: "For real estate teams",
      features: [
        "Unlimited AI leads",
        "White-label platform",
        "Unlimited SMS & calls",
        "Dedicated account manager",
        "Custom AI training",
        "API access",
        "Advanced analytics suite"
      ],
      popular: false,
      gradient: "from-purple-500 to-pink-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center space-x-3 mb-6"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-xl shadow-lg flex items-center justify-center">
              <TrendingUp className="text-white" size={28} strokeWidth={3} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                dealflow.ai
              </h1>
              <span className="text-sm text-gray-600 font-medium">AI-Powered Real Estate Wholesaling</span>
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto"
          >
            Join thousands of investors using AI to automate their deal flow and close more profitable deals
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Auth Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin" className="text-base">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-base">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
                    <CardDescription className="text-gray-600">
                      Sign in to access your AI-powered deal flow dashboard
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SignIn 
                      fallbackRedirectUrl="/"
                      appearance={{
                        elements: {
                          formButtonPrimary: 
                            "bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-200",
                          card: "shadow-none border-0 bg-transparent",
                          headerTitle: "hidden",
                          headerSubtitle: "hidden",
                          formFieldInput: "rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500",
                          formFieldLabel: "text-gray-700 font-medium",
                          dividerLine: "bg-gray-200",
                          dividerText: "text-gray-500",
                          socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 rounded-lg",
                          footer: "hidden"
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="signup">
                <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-xl">
                  <CardHeader className="text-center pb-6">
                    <CardTitle className="text-2xl font-bold text-gray-900">Get Started Today</CardTitle>
                    <CardDescription className="text-gray-600">
                      Create your account and start finding profitable deals with AI
                    </CardDescription>
                    <Badge className="bg-emerald-100 text-emerald-700 w-fit mx-auto mt-2">
                      14-Day Free Trial
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <SignUp 
                      fallbackRedirectUrl="/"
                      appearance={{
                        elements: {
                          formButtonPrimary: 
                            "bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-medium py-3 px-6 rounded-lg shadow-lg transition-all duration-200",
                          card: "shadow-none border-0 bg-transparent",
                          headerTitle: "hidden",
                          headerSubtitle: "hidden",
                          formFieldInput: "rounded-lg border-gray-200 focus:border-emerald-500 focus:ring-emerald-500",
                          formFieldLabel: "text-gray-700 font-medium",
                          dividerLine: "bg-gray-200",
                          dividerText: "text-gray-500",
                          socialButtonsBlockButton: "border-gray-200 hover:bg-gray-50 rounded-lg",
                          footer: "hidden"
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Plans Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h2>
              <p className="text-gray-600 mb-6">Start with a 14-day free trial, then choose the plan that fits your business</p>
            </div>

            <div className="space-y-4">
              {plans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="relative"
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-6 z-10">
                      <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-3 py-1">
                        <Star className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <Card className={`${plan.popular ? 'ring-2 ring-emerald-500 shadow-2xl' : 'shadow-lg'} bg-white/90 backdrop-blur-xl border-0 overflow-hidden`}>
                    <div className={`bg-gradient-to-r ${plan.gradient} p-4 text-white`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{plan.name}</h3>
                          <p className="text-white/80 text-sm">{plan.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-baseline">
                            <span className="text-2xl font-bold">${plan.price}</span>
                            <span className="text-white/80 text-sm ml-1">/mo</span>
                          </div>
                          {plan.originalPrice > plan.price && (
                            <span className="text-sm line-through text-white/60">
                              ${plan.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <ul className="space-y-2 mb-4">
                        {plan.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <CheckCircle className="text-emerald-500 mt-0.5 mr-2 flex-shrink-0" size={14} />
                            <span className="text-gray-600">{feature}</span>
                          </li>
                        ))}
                        {plan.features.length > 3 && (
                          <li className="text-sm text-gray-500">
                            +{plan.features.length - 3} more features
                          </li>
                        )}
                      </ul>
                      
                      <Button
                        className={`w-full text-sm ${
                          plan.popular
                            ? 'bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                        }`}
                        onClick={() => setShowPlans(!showPlans)}
                      >
                        {plan.popular ? 'Get Started' : 'Select Plan'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Features Highlight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-gray-200"
            >
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <Brain className="text-emerald-500 mr-2" size={20} />
                Why Choose dealflow.ai?
              </h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-start">
                  <Zap className="text-blue-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span className="text-gray-600">AI processes 2M+ data points daily</span>
                </div>
                <div className="flex items-start">
                  <Users className="text-purple-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span className="text-gray-600">12,000+ verified cash buyers</span>
                </div>
                <div className="flex items-start">
                  <TrendingUp className="text-emerald-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span className="text-gray-600">96.3% deal accuracy rate</span>
                </div>
              </div>
            </motion.div>

            {/* Guarantee */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="text-center text-sm text-gray-500 border-t border-gray-200 pt-4"
            >
              <div className="flex items-center justify-center space-x-4">
                <span>✓ 14-day free trial</span>
                <span>✓ No setup fees</span>
                <span>✓ Cancel anytime</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
