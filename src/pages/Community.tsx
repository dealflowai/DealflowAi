import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, MessageSquare, Award, Calendar, BookOpen, Video, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const Community = () => {
  const communityChannels = [
    {
      icon: MessageSquare,
      title: "Discord Server",
      description: "Join 5,000+ wholesalers sharing deals, tips, and strategies",
      members: "5.2K members",
      link: "#",
      featured: true
    },
    {
      icon: Video,
      title: "Weekly Webinars", 
      description: "Live training sessions with successful wholesalers",
      members: "Every Tuesday",
      link: "#"
    },
    {
      icon: BookOpen,
      title: "Knowledge Base",
      description: "Comprehensive guides and best practices",
      members: "100+ articles",
      link: "#"
    },
    {
      icon: Users,
      title: "Local Meetups",
      description: "Connect with wholesalers in your area",
      members: "25 cities",
      link: "#"
    }
  ];

  const events = [
    {
      date: "Dec 15",
      title: "AI Deal Analysis Masterclass",
      type: "Webinar",
      time: "2:00 PM EST"
    },
    {
      date: "Dec 18",
      title: "Building Buyer Networks",
      type: "Workshop",
      time: "7:00 PM EST"
    },
    {
      date: "Dec 22",
      title: "Year-End Success Stories",
      type: "Panel",
      time: "1:00 PM EST"
    }
  ];

  const successStories = [
    {
      name: "Marcus Johnson",
      location: "Atlanta, GA",
      achievement: "Closed 47 deals in 6 months using DealFlow AI",
      revenue: "$280K profit",
      quote: "The AI buyer matching changed everything for my business"
    },
    {
      name: "Sarah Chen",
      location: "Austin, TX", 
      achievement: "Built a network of 200+ qualified buyers",
      revenue: "$150K profit",
      quote: "I found buyers I never would have discovered manually"
    },
    {
      name: "David Martinez",
      location: "Phoenix, AZ",
      achievement: "Automated 80% of his wholesaling workflow",
      revenue: "$95K profit",
      quote: "More deals, less time. That's the power of AI automation"
    }
  ];

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
              Join the Community
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 leading-relaxed mb-8"
          >
            Connect with thousands of successful wholesalers, share strategies, 
            and learn from the best in the business.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center space-x-6 text-sm text-gray-500"
          >
            <div className="flex items-center">
              <Users className="text-emerald-500 mr-2" size={16} />
              12,000+ Members
            </div>
            <div className="flex items-center">
              <MessageSquare className="text-blue-500 mr-2" size={16} />
              24/7 Active Discussion
            </div>
            <div className="flex items-center">
              <Award className="text-purple-500 mr-2" size={16} />
              Expert Mentorship
            </div>
          </motion.div>
        </div>
      </section>

      {/* Community Channels */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Ways to Connect</h2>
            <p className="text-lg text-gray-600">Multiple ways to engage with our community</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {communityChannels.map((channel, index) => (
              <motion.div
                key={channel.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className={`h-full hover:shadow-lg transition-shadow cursor-pointer group ${channel.featured ? 'ring-2 ring-emerald-200' : ''}`}>
                  <CardContent className="p-6 text-center">
                    {channel.featured && (
                      <Badge className="mb-4 bg-emerald-100 text-emerald-700">Most Popular</Badge>
                    )}
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <channel.icon className="text-white" size={24} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{channel.title}</h3>
                    <p className="text-gray-600 mb-4">{channel.description}</p>
                    <p className="text-sm text-emerald-600 font-medium mb-4">{channel.members}</p>
                    <Button variant="outline" size="sm" className="group-hover:bg-emerald-50">
                      <ExternalLink className="mr-2" size={14} />
                      Join Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Upcoming Events</h2>
            <p className="text-lg text-gray-600">Don't miss these valuable learning opportunities</p>
          </motion.div>

          <div className="space-y-4">
            {events.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg flex flex-col items-center justify-center text-white">
                          <Calendar className="mb-1" size={16} />
                          <span className="text-xs font-bold">{event.date}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <Badge variant="outline">{event.type}</Badge>
                            <span>{event.time}</span>
                          </div>
                        </div>
                      </div>
                      <Button className="bg-gradient-to-r from-emerald-500 to-blue-600">
                        Register
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Community Success Stories</h2>
            <p className="text-lg text-gray-600">Real results from real people in our community</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <motion.div
                key={story.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {story.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{story.name}</CardTitle>
                        <p className="text-sm text-gray-600">{story.location}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold text-emerald-600 text-lg">{story.revenue}</p>
                        <p className="text-gray-600">{story.achievement}</p>
                      </div>
                      <blockquote className="text-gray-700 italic border-l-4 border-emerald-200 pl-4">
                        "{story.quote}"
                      </blockquote>
                    </div>
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
            transition={{ delay: 0.9 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Join the Community?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Start your journey with DealFlow AI and connect with thousands of successful wholesalers
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4">
                  Get Started Free
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-4">
                Join Discord
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

export default Community;