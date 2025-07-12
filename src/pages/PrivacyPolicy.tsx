import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Eye, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Privacy Policy</h1>
              </div>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>dealflow.ai Privacy Policy</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            <div className="space-y-8">
              
              <section>
                <h2 className="text-xl font-semibold mb-4">1. Introduction</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  At dealflow.ai, we are committed to protecting your privacy and ensuring the security of your personal information. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our 
                  AI-powered real estate wholesaling platform.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">2. Information We Collect</h2>
                
                <h3 className="text-lg font-medium mb-3 mt-6">Personal Information</h3>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Name and contact information (email, phone, address)</li>
                  <li>Professional information (company, license numbers, experience level)</li>
                  <li>Financial information (budget ranges, investment criteria)</li>
                  <li>Authentication data (password, security questions)</li>
                </ul>

                <h3 className="text-lg font-medium mb-3 mt-6">Usage Information</h3>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Platform usage patterns and preferences</li>
                  <li>Search queries and filter selections</li>
                  <li>Communication logs and interaction history</li>
                  <li>Device information and browser details</li>
                </ul>

                <h3 className="text-lg font-medium mb-3 mt-6">Real Estate Data</h3>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Property information and transaction details</li>
                  <li>Buyer and seller profiles and preferences</li>
                  <li>Market analysis and deal scoring data</li>
                  <li>Contract documents and legal agreements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">3. How We Use Your Information</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We use the collected information for the following purposes:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Providing and maintaining our AI-powered platform services</li>
                  <li>Personalizing your experience and improving our algorithms</li>
                  <li>Facilitating connections between buyers and sellers</li>
                  <li>Generating AI-powered insights and recommendations</li>
                  <li>Processing payments and managing your token balance</li>
                  <li>Communicating with you about platform updates and opportunities</li>
                  <li>Ensuring platform security and preventing fraud</li>
                  <li>Complying with legal obligations and regulatory requirements</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">4. AI and Machine Learning</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Our platform uses artificial intelligence and machine learning technologies:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>AI algorithms analyze your data to provide personalized recommendations</li>
                  <li>Machine learning models continuously improve based on user interactions</li>
                  <li>Automated systems process and score property deals</li>
                  <li>AI-powered communication tools facilitate buyer-seller interactions</li>
                  <li>Data is anonymized and aggregated for model training purposes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">5. Information Sharing and Disclosure</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We may share your information in the following circumstances:
                </p>

                <h3 className="text-lg font-medium mb-3 mt-6">With Your Consent</h3>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Sharing contact information with potential buyers or sellers</li>
                  <li>Facilitating introductions and deal negotiations</li>
                  <li>Participating in our marketplace features</li>
                </ul>

                <h3 className="text-lg font-medium mb-3 mt-6">Service Providers</h3>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Cloud hosting and infrastructure providers</li>
                  <li>Payment processing and financial services</li>
                  <li>AI and machine learning service providers</li>
                  <li>Communication and email service providers</li>
                </ul>

                <h3 className="text-lg font-medium mb-3 mt-6">Legal Requirements</h3>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Compliance with legal obligations and court orders</li>
                  <li>Protecting our rights and preventing fraud</li>
                  <li>Responding to government requests and investigations</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">6. Data Security</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We implement comprehensive security measures to protect your information:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>End-to-end encryption for sensitive data transmission</li>
                  <li>Secure cloud infrastructure with regular security audits</li>
                  <li>Multi-factor authentication and access controls</li>
                  <li>Regular security training for our team members</li>
                  <li>Incident response procedures and monitoring systems</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">7. Data Retention</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We retain your information for as long as necessary to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Provide you with our services and support</li>
                  <li>Comply with legal obligations and regulatory requirements</li>
                  <li>Resolve disputes and enforce our agreements</li>
                  <li>Improve our AI algorithms and platform features</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                  You may request deletion of your personal information, subject to certain legal and operational limitations.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">8. Your Privacy Rights</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li><strong>Access:</strong> Request copies of your personal information</li>
                  <li><strong>Rectification:</strong> Request correction of inaccurate information</li>
                  <li><strong>Erasure:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                  <li><strong>Restriction:</strong> Request limitation of processing activities</li>
                  <li><strong>Objection:</strong> Object to certain types of data processing</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">9. Cookies and Tracking Technologies</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze platform usage and performance</li>
                  <li>Provide personalized content and recommendations</li>
                  <li>Improve our AI algorithms and user experience</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                  You can control cookie settings through your browser preferences.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">10. Third-Party Services</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Our platform integrates with third-party services including:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Payment processors (Stripe) for secure transactions</li>
                  <li>Authentication providers (Clerk) for secure login</li>
                  <li>AI services (OpenAI) for content generation</li>
                  <li>Communication platforms for messaging and calls</li>
                  <li>Analytics tools for platform improvement</li>
                </ul>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mt-4">
                  These services have their own privacy policies and data handling practices.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">11. International Data Transfers</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Your information may be transferred to and processed in countries other than your own. 
                  We ensure appropriate safeguards are in place to protect your information in accordance 
                  with applicable data protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">12. Children's Privacy</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Our Service is not intended for children under 18 years of age. We do not knowingly 
                  collect personal information from children under 18. If you become aware that a child 
                  has provided us with personal information, please contact us immediately.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">13. Changes to Privacy Policy</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We may update this Privacy Policy from time to time. We will notify you of significant 
                  changes via email or through our platform. Your continued use of the Service after 
                  such modifications constitutes acceptance of the updated Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">14. Contact Us</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Privacy Officer:</strong> privacy@dealflow.ai<br/>
                    <strong>Data Protection Officer:</strong> dpo@dealflow.ai<br/>
                    <strong>Address:</strong> dealflow.ai Privacy Department<br/>
                    123 Business Avenue<br/>
                    Suite 100<br/>
                    City, State 12345
                  </p>
                </div>
              </section>

              <section className="border-t pt-6">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Lock className="w-4 h-4" />
                  <span>This document is effective as of the date listed above and supersedes all prior versions.</span>
                </div>
              </section>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;