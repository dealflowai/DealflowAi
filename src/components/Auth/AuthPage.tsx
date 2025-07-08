
import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Brain, Zap, Shield, Target, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { SignUpForm } from './SignUpForm';
import { SignInForm } from './SignInForm';

const AuthPage = () => {
  const { isSignedIn, isLoaded } = useUser();

  // Redirect to dashboard if already signed in
  if (isLoaded && isSignedIn) {
    return <Navigate to="/" replace />;
  }


  const benefits = [
    { icon: Brain, title: "AI-Powered Intelligence", desc: "Advanced ML algorithms find hidden opportunities" },
    { icon: Zap, title: "Lightning Fast Results", desc: "Get qualified leads in under 5 minutes" },
    { icon: Shield, title: "Verified Data Quality", desc: "96.3% accuracy rate on all lead data" },
    { icon: Target, title: "Precision Targeting", desc: "Match deals to perfect buyers automatically" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/90 to-primary/80 text-primary-foreground">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-4xl mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-xl rounded-2xl shadow-2xl flex items-center justify-center">
                <TrendingUp className="text-white" size={32} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-4xl font-bold">dealflow.ai</h1>
                <p className="text-lg text-white/90 font-medium">AI-Powered Real Estate Wholesaling</p>
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Close More Deals with AI Automation
            </h2>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
              Join 12,000+ investors using our AI to automate deal flow, qualify buyers, and close profitable wholesale deals faster than ever.
            </p>
            <div className="grid grid-cols-3 gap-6 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold">12K+</div>
                <div className="text-white/80 text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">$450M+</div>
                <div className="text-white/80 text-sm">Deals Closed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">96.3%</div>
                <div className="text-white/80 text-sm">Success Rate</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <Badge className="mb-4">
              <Clock className="w-4 h-4 mr-2" />
              14-Day Free Trial • No Credit Card Required
            </Badge>
          </div>

          <Tabs defaultValue="signup" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="signup">Start Free Trial</TabsTrigger>
              <TabsTrigger value="signin">Sign In</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signup">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-6">
                  <SignUpForm onSuccess={() => window.location.href = '/'} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="signin">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-6">
                  <SignInForm onSuccess={() => window.location.href = '/'} />
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
              <div key={index} className="flex items-start space-x-3 p-4 bg-card rounded-xl border">
                <benefit.icon className="text-primary mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-semibold text-card-foreground text-sm">{benefit.title}</h4>
                  <p className="text-muted-foreground text-xs">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Guarantee */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-6 bg-muted/50 rounded-2xl border"
          >
            <div className="text-center">
              <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
              <h4 className="font-bold text-foreground mb-2">Money-Back Guarantee</h4>
              <p className="text-muted-foreground text-sm">
                Not satisfied? Get a full refund within 30 days, no questions asked.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
