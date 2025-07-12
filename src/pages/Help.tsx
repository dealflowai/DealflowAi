import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Search, Book, MessageSquare, Video, FileText, HelpCircle, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Link } from 'react-router-dom';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const helpCategories = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Learn the basics of using DealFlow AI",
      articles: 12
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      articles: 8
    },
    {
      icon: FileText,
      title: "API Documentation",
      description: "Technical documentation for developers",
      articles: 25
    },
    {
      icon: MessageSquare,
      title: "Best Practices",
      description: "Tips from successful wholesalers",
      articles: 15
    }
  ];

  const faqs = [
    {
      question: "How does the AI buyer matching work?",
      answer: "Our AI analyzes buyer preferences, budget, location, and past purchase history to match them with relevant deals. The system gets smarter over time as it learns from successful matches."
    },
    {
      question: "Can I import my existing buyer list?",
      answer: "Yes! You can easily import your existing contacts via CSV upload. Our system will automatically enrich the data with additional information and scoring."
    },
    {
      question: "What types of contracts can the AI generate?",
      answer: "DealFlow AI can generate purchase agreements, assignment contracts, LOIs, and other standard wholesaling documents. All contracts are customizable and comply with local regulations."
    },
    {
      question: "How accurate is the deal analyzer?",
      answer: "Our deal analyzer has a 94% accuracy rate in predicting profitable deals. It uses machine learning models trained on thousands of successful transactions."
    },
    {
      question: "Is there a mobile app available?",
      answer: "Currently, DealFlow AI is available as a responsive web application that works great on mobile devices. A native mobile app is in development for 2024."
    },
    {
      question: "How does pricing work?",
      answer: "We use a token-based system where each AI action (like analyzing a deal or sending outreach) costs tokens. You can purchase token packages or subscribe to monthly plans with included tokens."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              Help Center
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 leading-relaxed mb-8"
          >
            Find answers, learn best practices, and get the most out of DealFlow AI
          </motion.p>
          
          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                placeholder="Search for help articles, guides, and FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-4 text-lg rounded-full border-2"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Browse by Category</h2>
            <p className="text-lg text-gray-600">Find the help you need quickly</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {helpCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <category.icon className="text-white" size={24} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{category.title}</h3>
                    <p className="text-gray-600 mb-2">{category.description}</p>
                    <p className="text-sm text-emerald-600 font-medium">{category.articles} articles</p>
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-auto mt-2 group-hover:text-emerald-600 transition-colors" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Quick answers to common questions</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardContent className="p-6">
                <Accordion type="single" collapsible className="w-full">
                  {filteredFaqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center">
                          <HelpCircle className="mr-3 text-emerald-600 flex-shrink-0" size={18} />
                          {faq.question}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="ml-9 text-gray-600">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Still Need Help?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Our support team is standing by to help you succeed
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4">
                  Contact Support
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4">
                Schedule a Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} DealFlow AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Help;