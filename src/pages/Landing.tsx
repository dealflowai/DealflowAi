import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle, Star, ArrowRight, Play, Target, Zap, TrendingUp, Shield, Users, Phone, Mail, Menu, X, Sparkles, BarChart3, Globe, Rocket, Brain, DollarSign, Clock, Award, MessageSquare, MapPin, Building, Search, Database, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

// Animation variants
const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};
const itemVariants = {
  hidden: {
    y: 20,
    opacity: 0
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      damping: 20,
      stiffness: 100
    }
  }
};

// Optimized Particle System
const OptimizedParticleSystem: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const particles: Array<{
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }> = [];
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    const initParticles = () => {
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 1,
          speedY: (Math.random() - 0.5) * 1,
          opacity: Math.random() * 0.5 + 0.2
        });
      }
    };
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.y > canvas.height) particle.y = 0;
        if (particle.y < 0) particle.y = canvas.height;
        ctx.save();
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    resizeCanvas();
    initParticles();
    animate();
    window.addEventListener('resize', resizeCanvas);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-30" style={{
    zIndex: 1
  }} />;
};

// Counter Animation Component
const AnimatedCounter: React.FC<{
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}> = ({
  end,
  duration = 2,
  prefix = "",
  suffix = ""
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, {
    once: true
  });
  useEffect(() => {
    if (!isInView) return;
    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration]);
  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
};

// Enhanced Navigation with scroll highlighting
const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Check which section is currently in view
      const sections = ['hero', 'features', 'marketplace', 'demo', 'pricing', 'testimonials', 'faq'];
      const scrollPosition = window.scrollY + 100;
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const offsetTop = element.offsetTop;
          const offsetHeight = element.offsetHeight;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navItems = [{
    label: 'Property Data',
    href: '#features'
  }, {
    label: 'Lead Discovery',
    href: '#marketplace'
  }, {
    label: 'Demo',
    href: '#demo'
  }, {
    label: 'Pricing',
    href: '#pricing'
  }, {
    label: 'Success Stories',
    href: '#testimonials'
  }, {
    label: 'FAQ',
    href: '#faq'
  }];
  return <motion.header initial={{
    y: -100,
    opacity: 0
  }} animate={{
    y: 0,
    opacity: 1
  }} transition={{
    duration: 0.6,
    ease: "easeOut"
  }} className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg' : 'bg-white/10 backdrop-blur-md'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div whileHover={{
          scale: 1.05
        }} className="flex items-center space-x-3">
            <motion.div className="relative w-10 h-10" whileHover={{
            scale: 1.1
          }} transition={{
            duration: 0.2
          }}>
              <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 rounded-xl shadow-lg flex items-center justify-center">
                <Building className="text-white" size={20} strokeWidth={3} />
              </div>
            </motion.div>
            <div className="flex flex-col">
              <motion.span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent" whileHover={{
              scale: 1.05
            }}>
                PropFlow
              </motion.span>
              <span className="text-xs text-gray-500 font-medium">Real Estate Intelligence</span>
            </div>
          </motion.div>
          
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item, index) => {
            const sectionId = item.href.substring(1);
            const isActive = activeSection === sectionId;
            return <motion.a key={item.label} href={item.href} className={`relative font-medium text-base transition-colors duration-300 px-4 py-2 rounded-lg ${isActive ? 'text-emerald-600 bg-emerald-50' : scrolled ? 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50' : 'text-gray-800 hover:text-emerald-600 hover:bg-white/20'}`} whileHover={{
              y: -1
            }} initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: index * 0.1
            }}>
                  {item.label}
                  {isActive && <motion.div layoutId="activeSection" className="absolute inset-0 bg-emerald-100 rounded-lg -z-10" initial={false} transition={{
                type: "spring",
                bounce: 0.2,
                duration: 0.6
              }} />}
                </motion.a>;
          })}
          </nav>
          
          <div className="hidden md:flex items-center space-x-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className={`${scrolled ? "text-gray-700 hover:bg-gray-100" : "text-gray-800 hover:bg-white/20"} font-medium text-base`}>
                Sign In
              </Button>
            </Link>
            <motion.div whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow-md font-medium text-base">
                  Start Free Trial
                </Button>
              </Link>
            </motion.div>
          </div>
          
          <button className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-800 hover:bg-white/20'}`} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isOpen && <motion.div initial={{
        opacity: 0,
        height: 0
      }} animate={{
        opacity: 1,
        height: 'auto'
      }} exit={{
        opacity: 0,
        height: 0
      }} className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200">
            <div className="px-4 py-6 space-y-3">
              {navItems.map(item => <a key={item.label} href={item.href} className="block text-gray-700 hover:text-emerald-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors text-base" onClick={() => setIsOpen(false)}>
                  {item.label}
                </a>)}
              <div className="pt-4 space-y-3 border-t border-gray-200">
                <Link to="/auth">
                  <Button variant="ghost" className="w-full justify-start text-base">Sign In</Button>
                </Link>
                <Link to="/auth">
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-base">
                    Start Free Trial
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>}
      </AnimatePresence>
    </motion.header>;
};

// Hero Section with optimized animations
const HeroSection: React.FC = () => {
  const {
    scrollY
  } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  return <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50" />
      <OptimizedParticleSystem />
      
      <motion.div style={{
      y,
      opacity
    }} className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          <motion.div variants={itemVariants}>
            <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="mr-2" size={16} />
              #1 Real Estate Investment Platform
            </Badge>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-emerald-700 to-blue-700 bg-clip-text text-transparent">Discover Hidden
          </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">Investment Opportunities</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Access nationwide off-market properties, pre-foreclosures, vacant land, cash sales, and auction opportunities. Advanced filtering by location, property type, equity, and ownership status - updated daily.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <motion.div whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-12 py-4 text-lg rounded-full shadow-2xl">
                  Start Free 14-Day Trial
                  <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
            </motion.div>
            
            <motion.div whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <Button variant="outline" size="lg" className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg rounded-full" onClick={() => document.getElementById('demo')?.scrollIntoView({
              behavior: 'smooth'
            })}>
                <Play className="mr-2" size={20} />
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="flex items-center justify-center space-x-8 pt-12 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckCircle className="text-emerald-500 mr-2" size={16} />
              No Credit Card Required
            </div>
            <div className="flex items-center">
              <CheckCircle className="text-emerald-500 mr-2" size={16} />
              Setup in 5 Minutes
            </div>
            <div className="flex items-center">
              <CheckCircle className="text-emerald-500 mr-2" size={16} />
              Cancel Anytime
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
      
      <motion.div className="absolute bottom-8 left-1/2 transform -translate-x-1/2" animate={{
      y: [0, 10, 0]
    }} transition={{
      duration: 2,
      repeat: Infinity
    }}>
        <ChevronDown size={32} className="text-emerald-500" />
      </motion.div>
    </section>;
};

const Landing = () => {
  return <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      
      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                <AnimatedCounter end={50000} suffix="+" />
              </div>
              <div className="text-gray-600">Properties Daily</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                <AnimatedCounter end={3100} suffix="+" />
              </div>
              <div className="text-gray-600">US Counties</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                <AnimatedCounter end={95} suffix="%" />
              </div>
              <div className="text-gray-600">Lead Accuracy</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                <AnimatedCounter end={24} suffix="h" />
              </div>
              <div className="text-gray-600">Update Frequency</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2 rounded-full mb-6">
              <Database className="mr-2" size={16} />
              Property Intelligence Platform
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Investment Lead Discovery
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive property data aggregation with advanced filtering for serious real estate investors
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[{
            icon: MapPin,
            title: 'Nationwide Property Data',
            description: 'Access off-market properties, pre-foreclosures, vacant land, estate sales, cash sales, and auction opportunities across all 50 states.',
            stats: 'Real-time Updates'
          }, {
            icon: Search,
            title: 'Advanced Filtering System',
            description: 'Filter by location (state, county, city), property type, ownership status, equity levels, price ranges, and property condition.',
            stats: 'Precision Targeting'
          }, {
            icon: Brain,
            title: 'AI Lead Qualification',
            description: 'Machine learning algorithms analyze property details, ownership info, sale history, and market comparables to score investment potential.',
            stats: 'Smart Analysis'
          }, {
            icon: Users,
            title: 'Owner Contact Discovery',
            description: 'Comprehensive owner information including contact details, mailing addresses, ownership history, and motivation indicators.',
            stats: 'Direct Outreach'
          }, {
            icon: BarChart3,
            title: 'Lead Management CRM',
            description: 'Track leads with custom tags, saved searches, follow-up reminders, and detailed property analytics in one centralized dashboard.',
            stats: 'Complete Pipeline'
          }, {
            icon: Globe,
            title: 'Export & Integration',
            description: 'Export leads to Google Sheets, CSV files, or integrate directly with popular CRM systems like Podio, REI Network, and HubSpot.',
            stats: 'Seamless Workflow'
          }].map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/70 backdrop-blur-xl">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <Badge variant="outline" className="w-fit text-xs text-emerald-600 border-emerald-300">
                    {feature.stats}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Property Types Section */}
      <section id="marketplace" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2 rounded-full mb-6">
              <Building className="mr-2" size={16} />
              Investment Opportunities
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Property Types We Track
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access the most comprehensive database of investment-grade properties updated daily
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Pre-Foreclosures',
                description: 'Properties in financial distress before auction',
                count: '15,000+',
                icon: Shield
              },
              {
                title: 'Vacant Land',
                description: 'Undeveloped lots and acreage nationwide',
                count: '25,000+',
                icon: Globe
              },
              {
                title: 'Cash Sales',
                description: 'Recently sold all-cash properties',
                count: '8,000+',
                icon: DollarSign
              },
              {
                title: 'Estate Sales',
                description: 'Properties from estate liquidations',
                count: '5,000+',
                icon: Award
              },
              {
                title: 'Absentee Owners',
                description: 'Out-of-state property owners',
                count: '30,000+',
                icon: MapPin
              },
              {
                title: 'High Equity',
                description: 'Properties with 50%+ equity',
                count: '20,000+',
                icon: TrendingUp
              },
              {
                title: 'Auctions',
                description: 'Upcoming courthouse auctions',
                count: '3,000+',
                icon: Clock
              },
              {
                title: 'Off-Market',
                description: 'Not listed on MLS',
                count: '40,000+',
                icon: Eye
              }
            ].map((type, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <type.icon className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                  <CardTitle className="text-lg">{type.title}</CardTitle>
                  <Badge className="bg-emerald-100 text-emerald-800">{type.count}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{type.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Find Your Next Deal?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of real estate investors who are using PropFlow to discover hidden opportunities and build wealth through real estate.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 text-lg">
                Start Free Trial
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <div className="flex items-center text-sm opacity-90">
              <CheckCircle className="mr-2" size={16} />
              14-day free trial • No credit card required
            </div>
          </div>
        </div>
      </section>
    </div>;
};

export default Landing;