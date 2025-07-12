import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, CheckCircle, Star, ArrowRight, Play, Target, Zap, TrendingUp, Shield, Users, Phone, Mail, Menu, X, Sparkles, BarChart3, Globe, Rocket, Brain, DollarSign, Clock, Award, MessageSquare, MapPin, Gem, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
    label: 'AI Features',
    href: '#features'
  }, {
    label: 'Marketplace',
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
                <TrendingUp className="text-white" size={20} strokeWidth={3} />
              </div>
            </motion.div>
            <div className="flex flex-col">
              <motion.span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent" whileHover={{
              scale: 1.05
            }}>
                DealFlow AI
              </motion.span>
              <span className="text-xs text-gray-500 font-medium">AI-Powered Wholesaling</span>
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
            <motion.div whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <Link to="/auth">
                <Button size="sm" className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow-md font-medium text-base">
                  Get Started Free
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
                  <Button className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 text-base">
                    Get Started Free
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
              #1 AI-Powered Wholesaling Platform
            </Badge>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-gray-900 via-emerald-700 to-blue-700 bg-clip-text text-transparent">Find Your Next
          </span>
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">Million Dollar Deal</span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Find buyers first, then reverse-engineer deals to match their demand. Our AI automates the entire wholesaling process - from buyer discovery to contract assignment.
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <motion.div whileHover={{
            scale: 1.05
          }} whileTap={{
            scale: 0.95
          }}>
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white px-12 py-4 text-lg rounded-full shadow-2xl">
                  Get Started Free
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
                <AnimatedCounter end={300000} suffix="+" />
              </div>
              <div className="text-gray-600">Active Wholesalers</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                $<AnimatedCounter end={15} />B+
              </div>
              <div className="text-gray-600">Market Size</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                <AnimatedCounter end={10000} suffix="+" />
              </div>
              <div className="text-gray-600">Deals by 2028</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                <AnimatedCounter end={50000} suffix="+" />
              </div>
              <div className="text-gray-600">Target Users</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2 rounded-full mb-6">
              <Brain className="mr-2" size={16} />
              Core AI Features
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              End-to-End Automation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI handles every step of wholesaling - from buyer discovery to deal assignment
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[{
            icon: Users,
            title: 'AI Buyer Engine',
            description: 'Scrapes and enriches buyer data from multiple sources. AI voice + SMS/email qualification to build your buyer network automatically.',
            stats: 'Auto Qualification'
          }, {
            icon: Target,
            title: 'Reverse Wholesaling System',
            description: 'Based on buyer demand, our system finds matching seller leads. GPT analyzes deals with comps, calculations, and LOI generation.',
            stats: 'Demand-Driven'
          }, {
            icon: Brain,
            title: 'GPT Deal Analyzer',
            description: 'Advanced AI analyzes every deal with market comps, repair estimates, and profit calculations. Auto-generates contracts and LOIs.',
            stats: 'Smart Analysis'
          }, {
            icon: MessageSquare,
            title: 'Assignment Matchmaker',
            description: 'Matches deals to best buyers via AI filters. Sends deal packages with automated follow-up and conversion tracking.',
            stats: 'Perfect Matching'
          }, {
            icon: BarChart3,
            title: 'CRM Dashboard',
            description: 'Complete visibility into sellers, buyers, deals, and status tracking. Manage your entire pipeline from one interface.',
            stats: 'Full Control'
          }, {
            icon: Globe,
            title: 'Marketplace Integration',
            description: 'Post buyer needs and assign deals for fees. Access shared buyer pool and network effects with other wholesalers.',
            stats: 'Network Effects'
          }].map((feature, index) => <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/70 backdrop-blur-xl">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <Badge className="bg-emerald-100 text-emerald-700 w-fit">
                    {feature.stats}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </section>

      {/* Market Analysis Section */}
      

      {/* Target Customers Section */}
      {/* Marketplace Section */}
      <section id="marketplace" className="py-32 bg-gradient-to-br from-emerald-50 via-white to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div initial={{
            opacity: 0,
            y: 50
          }} whileInView={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8
          }} className="text-center mb-20">
            <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2 rounded-full mb-6">
              <Globe className="mr-2" size={16} />
              AI Marketplace
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Connected Dealer Network
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Join thousands of wholesalers sharing deals, buyers, and opportunities. Our AI marketplace creates perfect matches across the entire network.
            </p>
          </motion.div>

          {/* Marketplace Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {[{
              icon: Globe,
              title: "Shared Buyer Network",
              description: "Access 50,000+ verified cash buyers across all markets. Our AI matches your deals to buyers nationwide automatically.",
              benefit: "10x more buyers than working alone"
            }, {
              icon: Zap,
              title: "Deal Broadcasting",
              description: "Instantly share deals with the network. AI identifies the best wholesalers for each property based on their buyer lists.",
              benefit: "Sell deals 5x faster"
            }, {
              icon: DollarSign,
              title: "Assignment Fees",
              description: "Earn fees by assigning deals to other wholesalers when you can't close them. Turn every lead into revenue.",
              benefit: "Zero wasted opportunities"
            }, {
              icon: Target,
              title: "Buyer Posting",
              description: "Post your buyers' criteria to receive matching deals from the network. Let other wholesalers feed you perfect opportunities.",
              benefit: "Passive deal flow"
            }, {
              icon: BarChart3,
              title: "Network Analytics",
              description: "See which markets are hot, what buyers are paying, and trend data across the entire network.",
              benefit: "Market intelligence edge"
            }, {
              icon: Shield,
              title: "Verified Network",
              description: "All participants are verified wholesalers and buyers. No tire-kickers or fake leads in our marketplace.",
              benefit: "Quality assured"
            }].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 backdrop-blur-xl">
                  <CardHeader className="pb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                    <div className="inline-flex items-center px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {feature.benefit}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Network Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-3xl p-12 text-white text-center mb-20"
          >
            <h3 className="text-3xl font-bold mb-8">Marketplace Economics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="text-5xl font-bold mb-2">3%</div>
                <div className="text-white/80">Platform Fee on Deals</div>
                <div className="text-sm text-white/60 mt-2">Only when you profit</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">
                  $<AnimatedCounter end={2.3} />M
                </div>
                <div className="text-white/80">Assignment Fees This Month</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">
                  <AnimatedCounter end={94} suffix="%" />
                </div>
                <div className="text-white/80">Keep 97% of Every Deal</div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 gap-8">
              <div>
                <div className="text-3xl font-bold mb-2">
                  <AnimatedCounter end={847} />
                </div>
                <div className="text-white/80">Deals Shared Today</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">
                  <AnimatedCounter end={127} />
                </div>
                <div className="text-white/80">Markets Connected</div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-white/90 text-lg">
                <strong>No hidden fees.</strong> We only succeed when you do.
              </p>
            </div>
          </motion.div>

          {/* Fee Structure Explanation */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white rounded-3xl p-8 shadow-xl border border-emerald-100 mb-20"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Simple, Fair Pricing</h3>
              <p className="text-gray-600">Our marketplace only takes a small percentage when deals close successfully</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-emerald-50 rounded-2xl">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Assignment Fees</h4>
                <p className="text-gray-600 text-sm">3% when you assign deals to other wholesalers</p>
              </div>
              <div className="text-center p-6 bg-blue-50 rounded-2xl">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Deal Profits</h4>
                <p className="text-gray-600 text-sm">3% on successful deal closings through the network</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-2xl">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">No Monthly Fees</h4>
                <p className="text-gray-600 text-sm">Use the marketplace free - pay only on successful transactions</p>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{
          opacity: 0,
          y: 50
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }}>
            <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2 rounded-full mb-8">
              <Play className="mr-2" size={16} />
              Live Demo
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              See Reverse Wholesaling in Action
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
              Watch how our AI finds buyers first, then reverse-engineers profitable deals to match their exact criteria.
            </p>
            
            <motion.div className="relative max-w-4xl mx-auto" whileHover={{
            scale: 1.02
          }} transition={{
            duration: 0.3
          }}>
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <motion.button whileHover={{
                  scale: 1.1
                }} whileTap={{
                  scale: 0.9
                }} className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-full flex items-center justify-center shadow-2xl">
                    <Play size={32} className="text-white ml-1" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 50
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} className="text-center mb-20">
            <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2 rounded-full mb-6">
              <Gem className="mr-2" size={16} />
              Token-Based Pricing
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Pay Only For What You Use
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
              Start with 25 free non-expiring tokens, upgrade to Core for $49/month with 100 monthly tokens.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Trial Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -10 }}
              className="relative"
            >
              <Card className="h-full shadow-xl bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-gray-500 to-gray-700 text-white p-8">
                  <CardTitle className="text-2xl font-bold mb-2">Entry / Free</CardTitle>
                  <p className="text-white/80 mb-4">Get started with non-expiring tokens</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold">25</span>
                    <span className="text-white/80">free tokens</span>
                  </div>
                  <div className="text-sm text-white/70 mt-2">No credit card • Tokens never expire</div>
                </CardHeader>
                
                <CardContent className="p-8">
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">25 non-expiring tokens included</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">Test all AI features</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">No credit card required</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">Basic support</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">Full CRM access</span>
                    </li>
                  </ul>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/auth">
                      <Button className="w-full py-4 text-lg rounded-full bg-gray-100 hover:bg-gray-200 text-gray-900">
                        Get Started Free
                      </Button>
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pro Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -10 }}
              className="relative"
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2">
                  Most Popular
                </Badge>
              </div>
              
              <Card className="h-full ring-2 ring-emerald-500 shadow-2xl bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-emerald-500 to-blue-600 text-white p-8">
                  <CardTitle className="text-2xl font-bold mb-2">Core Plan</CardTitle>
                  <p className="text-white/80 mb-4">Perfect for active wholesalers</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold">$49</span>
                    <span className="text-white/80">/month</span>
                  </div>
                  <div className="text-sm text-white/70 mt-2">100 tokens included every month</div>
                </CardHeader>
                
                <CardContent className="p-8">
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">100 tokens included every month</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">Full AI buyer discovery</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">Deal analysis & contracts</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">Priority support</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">Tokens never expire</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">Buy extra token packs anytime</span>
                    </li>
                  </ul>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link to="/auth">
                      <Button className="w-full py-4 text-lg rounded-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white">
                        Get Core Plan
                      </Button>
                    </Link>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Agency/Custom Plan */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -10 }}
              className="relative"
            >
              <Card className="h-full shadow-xl bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-8">
                  <CardTitle className="text-2xl font-bold mb-2">Agency</CardTitle>
                  <p className="text-white/80 mb-4">Team solution with 5 seats</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold">$299</span>
                    <span className="text-white/80">/month</span>
                  </div>
                  <div className="text-sm text-white/70 mt-2">1,500 tokens + 5 seats • Extra seats $30/mo</div>
                </CardHeader>
                
                <CardContent className="p-8">
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">1,500 tokens included monthly</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">5 user seats included</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">Extra seats available at $30/month</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">White-label options</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">Dedicated account manager</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="text-emerald-500 mt-0.5" size={16} />
                      <span className="text-gray-600">Custom integrations & API</span>
                    </li>
                  </ul>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button 
                      className="w-full py-4 text-lg rounded-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                      onClick={() => {
                        window.open('mailto:sales@dealflow.ai?subject=Agency Plan Inquiry&body=Hi! I\'m interested in learning more about the Agency plan for my team. Please contact me to discuss custom pricing and features.', '_blank');
                      }}
                    >
                      Get Agency Plan
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          
          {/* Token Usage Guide */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center px-6 py-3 bg-emerald-50 border border-emerald-200 rounded-full mb-8">
              <Gem className="w-5 h-5 text-emerald-600 mr-2" />
              <span className="text-emerald-700 font-medium">
                Token Guide: AI Discovery (5 tokens) • Deal Analysis (3 tokens) • Contract Generation (2 tokens)
              </span>
            </div>
            
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Tokens never expire and work across all AI features. Get 25 monthly tokens free, or upgrade to Pro for 50 monthly tokens plus 100 starter credits.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section id="testimonials" className="py-32 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8 }} 
            className="text-center mb-20"
          >
            <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2 rounded-full mb-6">
              <Star className="mr-2" size={16} />
              Success Stories
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Real Results from Real Wholesalers
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how our AI-powered platform is transforming wholesaling careers across America
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[
              {
                name: "Marcus Rodriguez",
                title: "Solo Wholesaler",
                location: "Phoenix, AZ",
                result: "$180K profit in 6 months",
                story: "I was struggling to find quality buyers in my market. DealFlow AI's AI discovered 127 active cash buyers I never knew existed. Now I close 3-4 deals monthly instead of hoping for 1.",
                beforeAfter: "From 1 deal every 3 months → 4 deals monthly",
                avatar: "photo-1486312338219-ce68d2c6f44d"
              },
              {
                name: "Sarah Chen", 
                title: "Real Estate Coach",
                location: "Atlanta, GA",
                result: "Students averaging $85K/year",
                story: "My coaching students were burning out on cold calling. The AI qualification system automated 80% of their outreach. Now they focus on closing deals, not chasing leads.",
                beforeAfter: "Students went from 15% to 67% close rate",
                avatar: "photo-1649972904349-6e44c42644a7"
              },
              {
                name: "David Thompson",
                title: "Veteran Wholesaler", 
                location: "Dallas, TX",
                result: "$450K revenue increase",
                story: "After 8 years wholesaling the old way, I was skeptical about AI. But the reverse engineering approach doubled my deal flow. The contracts auto-generate perfectly every time.",
                beforeAfter: "Went from $300K to $750K annual revenue",
                avatar: "photo-1519389950473-47ba0277781c"
              },
              {
                name: "Jennifer Walsh",
                title: "Part-Time Wholesaler",
                location: "Tampa, FL", 
                result: "$95K profit in 4 months",
                story: "Working nights and weekends, I needed maximum efficiency. The AI handles buyer qualification while I sleep. I'm doing more deals part-time than others do full-time.",
                beforeAfter: "From side hustle to $2K+ weekly profit",
                avatar: "photo-1581091226825-a6a2a5aee158"
              },
              {
                name: "Robert Kim",
                title: "New Wholesaler",
                location: "Denver, CO",
                result: "First deal in 3 weeks",
                story: "Complete beginner to my first $15K assignment fee in 21 days. The AI taught me buyer preferences I wouldn't have learned in months of trial and error.",
                beforeAfter: "Zero experience → $15K first deal",
                avatar: "photo-1486312338219-ce68d2c6f44d"
              },
              {
                name: "Lisa Anderson", 
                title: "Team Leader",
                location: "Houston, TX",
                result: "300% team productivity boost",
                story: "Managing 4 acquisitions specialists was chaos. Now the AI handles all buyer matching and contract prep. My team focuses purely on negotiations and relationships.",
                beforeAfter: "From 12 to 36 deals monthly as a team",
                avatar: "photo-1649972904349-6e44c42644a7"
              }
            ].map((story, index) => (
              <motion.div
                key={story.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="relative"
              >
                <Card className="h-full bg-white rounded-3xl shadow-xl border-0 overflow-hidden">
                  <CardHeader className="p-8 pb-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center overflow-hidden">
                        <img 
                          src={`https://images.unsplash.com/${story.avatar}?w=64&h=64&fit=crop&crop=face`}
                          alt={story.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{story.name}</h3>
                        <p className="text-emerald-600 font-medium">{story.title}</p>
                        <p className="text-gray-500 text-sm flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {story.location}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-4 mb-6">
                      <div className="text-2xl font-bold text-emerald-600 mb-1">
                        {story.result}
                      </div>
                      <div className="text-sm text-gray-600">
                        {story.beforeAfter}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-8 pt-0">
                    <blockquote className="text-gray-600 leading-relaxed italic">
                      "{story.story}"
                    </blockquote>
                    
                    <div className="flex items-center justify-center mt-6">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Results Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gradient-to-r from-emerald-600 to-blue-600 rounded-3xl p-12 text-white text-center"
          >
            <h3 className="text-3xl font-bold mb-8">Platform Results Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <div className="text-4xl font-bold mb-2">
                  <AnimatedCounter end={67} suffix="%" />
                </div>
                <div className="text-white/80">Average Close Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">
                  <AnimatedCounter end={340} suffix="%" />
                </div>
                <div className="text-white/80">Revenue Increase</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">
                  <AnimatedCounter end={21} />
                </div>
                <div className="text-white/80">Avg Days to First Deal</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">
                  $<AnimatedCounter end={127} />K
                </div>
                <div className="text-white/80">Average Annual Profit</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-32 bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{
          opacity: 0,
          y: 50
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }} className="text-center mb-20">
            <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-2 rounded-full mb-6">
              <MessageSquare className="mr-2" size={16} />
              FAQ
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about reverse wholesaling with AI
            </p>
          </motion.div>
          
          <motion.div initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }}>
            <Accordion type="single" collapsible className="space-y-4">
              {[{
              question: "What makes reverse wholesaling different?",
              answer: "Traditional wholesaling finds sellers first, then looks for buyers. We flip this - our AI finds qualified buyers first, learns their exact criteria, then reverse-engineers deals to match their demand. This dramatically increases your close rate."
            }, {
              question: "How does the AI buyer discovery work?",
              answer: "Our AI scrapes buyer data from multiple sources (Propwire, LinkedIn, Google, etc.), enriches profiles with asset preferences and budgets, then uses voice + SMS/email to qualify their interest automatically."
            }, {
              question: "Do I need my own buyers list to start?",
              answer: "No! The platform includes access to our shared buyer network. You can also import your existing list to reach both audiences simultaneously through our AI matching system."
            }, {
              question: "What markets does this work in?",
              answer: "We cover all major U.S. markets. Our AI pulls data from public records, MLS, and other sources to analyze deals nationwide, from major metros to smaller markets."
            }, {
              question: "How accurate is the deal analysis?",
              answer: "Our GPT-powered analyzer considers 500+ variables including market comps, repair estimates, holding costs, and buyer demand patterns. It generates accurate profit projections and auto-creates contracts."
            }, {
              question: "Can this replace my existing tools?",
              answer: "Yes - DealFlow AI is designed as an all-in-one platform. It combines the best features of PropStream (data), BatchLeads (CRM), and DealMachine (lead sourcing) with advanced AI automation they don't offer."
            }].map((faq, index) => <AccordionItem key={index} value={`item-${index}`} className="bg-white rounded-2xl px-6 border-0 shadow-md">
                  <AccordionTrigger className="text-left font-semibold text-gray-900 hover:no-underline py-6">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-gray-600 leading-relaxed pb-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>)}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-emerald-600 via-emerald-700 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{
          opacity: 0,
          y: 50
        }} whileInView={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8
        }}>
            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              Ready to Reverse Engineer Success?
            </h2>
            <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90">
              Join the future of wholesaling. Find buyers first, then let AI create the perfect deals for them.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <motion.div whileHover={{
              scale: 1.05
            }} whileTap={{
              scale: 0.95
            }}>
                <Link to="/auth">
                  <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-12 py-4 text-lg rounded-full font-bold">
                    Get Started Free
                    <ArrowRight className="ml-2" size={20} />
                  </Button>
                </Link>
              </motion.div>
            </div>
            
            <div className="mt-12 flex items-center justify-center space-x-8 text-white/80">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Tokens never expire</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-white" size={16} strokeWidth={3} />
                </div>
                <h3 className="text-xl font-bold">DealFlow AI</h3>
              </div>
              <p className="text-gray-400 mb-4">
                The first AI-powered reverse wholesaling platform. Find buyers first, then reverse-engineer profitable deals.
              </p>
              <p className="text-sm text-gray-500">
                Mission: Empower real estate investors with AI automation and buyer-first deal sourcing.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/buyers" className="hover:text-white transition-colors">AI Buyer Engine</Link></li>
                <li><Link to="/analyzer" className="hover:text-white transition-colors">Deal Analyzer</Link></li>
                <li><Link to="/contracts" className="hover:text-white transition-colors">Contract Generator</Link></li>
                <li><Link to="/analytics" className="hover:text-white transition-colors">CRM Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/api-docs" className="hover:text-white transition-colors">API Documentation</Link></li>
                <li><Link to="/community" className="hover:text-white transition-colors">Community</Link></li>
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} DealFlow AI. All rights reserved. | Reverse engineer your success.</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Landing;