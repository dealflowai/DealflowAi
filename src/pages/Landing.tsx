
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart3, 
  Users, 
  FileText, 
  Zap, 
  TrendingUp, 
  Shield,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Smart Buyer Matching',
    description: 'AI-powered algorithms match your deals with the most qualified buyers in your network.'
  },
  {
    icon: BarChart3,
    title: 'Deal Analysis',
    description: 'Comprehensive property analysis with market comps, repair estimates, and profit calculations.'
  },
  {
    icon: FileText,
    title: 'Contract Generation',
    description: 'Automatically generate purchase agreements, assignment contracts, and closing documents.'
  },
  {
    icon: Zap,
    title: 'Workflow Automation',
    description: 'Streamline your wholesaling process from lead to close with intelligent automation.'
  },
  {
    icon: TrendingUp,
    title: 'Performance Analytics',
    description: 'Track your deals, conversion rates, and ROI with detailed analytics and reporting.'
  },
  {
    icon: Shield,
    title: 'Secure & Compliant',
    description: 'Bank-level security with full compliance for real estate transactions and data protection.'
  }
];

const stats = [
  { value: '10,000+', label: 'Deals Closed' },
  { value: '500+', label: 'Active Wholesalers' },
  { value: '95%', label: 'Success Rate' },
  { value: '$50M+', label: 'Transaction Volume' }
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">DF</span>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
              dealflow.ai
            </h1>
          </div>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            AI-Powered Real Estate Wholesaling
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Automate your wholesaling business with intelligent buyer matching, deal analysis, 
            and contract generation. Close more deals with less effort.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 px-8">
                Start Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="px-8">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Everything You Need to Scale</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform handles every aspect of your wholesaling business,
              from lead generation to closing.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-teal-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Wholesaling Business?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of successful wholesalers who are using AI to scale their operations 
            and increase their profits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-6 text-blue-100">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              <span>14-day free trial</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DF</span>
                </div>
                <h3 className="text-xl font-bold">dealflow.ai</h3>
              </div>
              <p className="text-gray-400">
                The future of real estate wholesaling, powered by artificial intelligence.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Deal Analysis</li>
                <li>Buyer Matching</li>
                <li>Contract Generation</li>
                <li>Analytics</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Contact</li>
                <li>Blog</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Community</li>
                <li>Status</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 dealflow.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
