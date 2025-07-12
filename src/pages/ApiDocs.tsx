import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Code, Key, Book, Play, Copy, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const ApiDocs = () => {
  const [copiedCode, setCopiedCode] = useState('');

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    });
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/api/buyers',
      description: 'Retrieve all buyers in your CRM',
      response: '{ "buyers": [...], "count": 150 }'
    },
    {
      method: 'POST',
      path: '/api/buyers',
      description: 'Add a new buyer to your CRM',
      response: '{ "buyer": {...}, "id": "uuid" }'
    },
    {
      method: 'POST',
      path: '/api/deals/analyze',
      description: 'Analyze a deal with AI',
      response: '{ "score": 8.5, "analysis": {...} }'
    },
    {
      method: 'POST',
      path: '/api/contracts/generate',
      description: 'Generate a contract using AI',
      response: '{ "contract": "...", "id": "uuid" }'
    }
  ];

  const codeExamples = {
    javascript: `// Initialize DealFlow AI client
const client = new DealFlowAI({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Analyze a deal
const analysis = await client.deals.analyze({
  address: '123 Main St, Austin TX',
  price: 150000,
  arv: 200000,
  repairs: 25000
});

console.log(analysis.score); // 8.5`,

    python: `import dealflow

# Initialize client
client = dealflow.Client(api_key='your-api-key')

# Analyze a deal
analysis = client.deals.analyze({
    'address': '123 Main St, Austin TX',
    'price': 150000,
    'arv': 200000,
    'repairs': 25000
})

print(analysis.score)  # 8.5`,

    curl: `curl -X POST https://api.dealflowai.com/v1/deals/analyze \\
  -H "Authorization: Bearer your-api-key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "address": "123 Main St, Austin TX",
    "price": 150000,
    "arv": 200000,
    "repairs": 25000
  }'`
  };

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
              API Documentation
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 leading-relaxed mb-8"
          >
            Integrate DealFlow AI's powerful features into your applications with our RESTful API
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center space-x-4"
          >
            <Badge className="bg-emerald-100 text-emerald-700">REST API</Badge>
            <Badge className="bg-blue-100 text-blue-700">JSON</Badge>
            <Badge className="bg-purple-100 text-purple-700">Real-time</Badge>
          </motion.div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Getting Started</h2>
            <p className="text-lg text-gray-600">Everything you need to start integrating with DealFlow AI</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <Key className="text-white" size={24} />
                  </div>
                  <CardTitle>1. Get Your API Key</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Generate your API key from the DealFlow AI dashboard to authenticate your requests.
                  </p>
                  <Button variant="outline" size="sm">
                    Generate Key
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <Book className="text-white" size={24} />
                  </div>
                  <CardTitle>2. Read the Docs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Explore our comprehensive API documentation with examples and best practices.
                  </p>
                  <Button variant="outline" size="sm">
                    View Docs
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                    <Play className="text-white" size={24} />
                  </div>
                  <CardTitle>3. Start Building</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Make your first API call and start integrating AI-powered features into your app.
                  </p>
                  <Button variant="outline" size="sm">
                    Try It Out
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Code Examples</h2>
            <p className="text-lg text-gray-600">Get started quickly with these examples</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="javascript" className="w-full">
                  <TabsList className="mb-6">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                  </TabsList>
                  
                  {Object.entries(codeExamples).map(([lang, code]) => (
                    <TabsContent key={lang} value={lang}>
                      <div className="relative">
                        <pre className="bg-gray-900 text-gray-100 rounded-lg p-6 overflow-x-auto">
                          <code>{code}</code>
                        </pre>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-4 right-4 text-gray-400 hover:text-white"
                          onClick={() => copyToClipboard(code, lang)}
                        >
                          {copiedCode === lang ? (
                            <CheckCircle size={16} className="text-green-400" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </Button>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900">API Endpoints</h2>
            <p className="text-lg text-gray-600">Core endpoints for your integration</p>
          </motion.div>

          <div className="space-y-4">
            {endpoints.map((endpoint, index) => (
              <motion.div
                key={`${endpoint.method}-${endpoint.path}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 + index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge 
                            className={`${
                              endpoint.method === 'GET' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {endpoint.method}
                          </Badge>
                          <code className="text-lg font-mono text-gray-800">{endpoint.path}</code>
                        </div>
                        <p className="text-gray-600">{endpoint.description}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        <div className="font-mono bg-gray-100 rounded px-3 py-2">
                          {endpoint.response}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Need Help with Integration?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Our developer support team is here to help you succeed
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4">
                  Contact Support
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

export default ApiDocs;