import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, Zap, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-white" size={20} strokeWidth={3} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                DealFlow AI
              </span>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-emerald-500 to-blue-600">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6"
          >
            <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              About DealFlow AI
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 leading-relaxed mb-8"
          >
            We're revolutionizing real estate wholesaling with AI-powered automation, 
            helping investors find buyers first and reverse-engineer profitable deals.
          </motion.p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                To democratize real estate investing by providing AI-powered tools that automate 
                the entire wholesaling process, from buyer discovery to contract assignment.
              </p>
              <p className="text-lg text-gray-600">
                We believe in the power of reverse wholesaling - finding qualified buyers first, 
                then sourcing deals that match their specific criteria.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-emerald-100 to-blue-100 rounded-2xl p-8"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">300K+</div>
                  <div className="text-gray-600">Active Wholesalers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">$15B+</div>
                  <div className="text-gray-600">Market Size</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-600">AI-First</div>
                  <div className="text-gray-600">Approach</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">2024</div>
                  <div className="text-gray-600">Founded</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Our Values</h2>
            <p className="text-lg text-gray-600">The principles that drive everything we do</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Target,
                title: "Results-Driven",
                description: "Every feature is designed to deliver measurable ROI for our users"
              },
              {
                icon: Zap,
                title: "Innovation",
                description: "Leveraging cutting-edge AI to solve real-world problems"
              },
              {
                icon: Users,
                title: "Community",
                description: "Building a supportive ecosystem of successful wholesalers"
              },
              {
                icon: TrendingUp,
                title: "Growth",
                description: "Empowering our users to scale their businesses efficiently"
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <value.icon className="text-white" size={24} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Wholesaling Business?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of investors who are already using AI to automate their deal flow
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-full">
                Get Started Free
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 DealFlow AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default About;