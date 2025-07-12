import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService = () => {
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
                <Scale className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Terms of Service</h1>
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
              <FileText className="w-5 h-5" />
              <span>dealflow.ai Terms of Service</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="prose prose-gray dark:prose-invert max-w-none">
            <div className="space-y-8">
              
              <section>
                <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  By accessing and using dealflow.ai ("Service"), you accept and agree to be bound by the terms and provision of this agreement. 
                  If you do not agree to abide by the above, please do not use this service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  dealflow.ai is an AI-powered real estate wholesaling platform that provides:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>AI-powered buyer discovery and qualification</li>
                  <li>Deal analysis and scoring algorithms</li>
                  <li>Automated contract generation</li>
                  <li>CRM and communication tools</li>
                  <li>Marketplace for buyers and sellers</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">3. User Accounts</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  To access certain features of the Service, you must register for an account. You agree to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and update your account information</li>
                  <li>Keep your password secure and confidential</li>
                  <li>Accept responsibility for all activities under your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">4. Token System and Payments</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Our Service operates on a token-based system:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>New users receive free tokens upon registration</li>
                  <li>AI features consume tokens based on usage</li>
                  <li>Additional tokens can be purchased through our platform</li>
                  <li>Tokens are non-refundable and do not expire</li>
                  <li>Pricing is subject to change with reasonable notice</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">5. Acceptable Use</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  You agree not to use the Service to:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon intellectual property rights</li>
                  <li>Transmit spam, malware, or harmful content</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Use the Service for fraudulent or deceptive practices</li>
                  <li>Scrape or extract data without permission</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">6. Intellectual Property</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  The Service and its original content, features, and functionality are owned by dealflow.ai and are protected by 
                  international copyright, trademark, patent, trade secret, and other intellectual property laws.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">7. AI-Generated Content</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Our AI features generate content including but not limited to property analyses, buyer profiles, and contracts:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>AI-generated content is provided for informational purposes only</li>
                  <li>You should review and verify all AI-generated content before use</li>
                  <li>We do not guarantee the accuracy or completeness of AI outputs</li>
                  <li>Legal documents should be reviewed by qualified professionals</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">8. Data and Privacy</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, 
                  to understand our practices regarding the collection and use of your information.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">9. Disclaimers</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DISCLAIM:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Any warranties regarding investment returns or success</li>
                  <li>Accuracy of property valuations or market analyses</li>
                  <li>Completeness or reliability of buyer/seller information</li>
                  <li>Uninterrupted or error-free service operation</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">10. Limitation of Liability</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  In no event shall dealflow.ai be liable for any indirect, incidental, special, consequential, or punitive damages, 
                  including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your 
                  use of the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">11. Real Estate Compliance</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  Users are responsible for ensuring compliance with all applicable real estate laws and regulations:
                </p>
                <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                  <li>Licensing requirements in their jurisdiction</li>
                  <li>Disclosure obligations to buyers and sellers</li>
                  <li>Anti-money laundering and financial regulations</li>
                  <li>Fair housing and anti-discrimination laws</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">12. Termination</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We may terminate or suspend your account and access to the Service immediately, without prior notice, 
                  for conduct that we believe violates these Terms or is harmful to other users or the Service.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">13. Changes to Terms</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  We reserve the right to modify these terms at any time. We will notify users of significant changes 
                  via email or through the Service. Continued use after changes constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">14. Governing Law</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws of the State of Delaware, 
                  without regard to its conflict of law provisions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">15. Contact Information</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us at:
                </p>
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Email:</strong> legal@dealflow.ai<br/>
                    <strong>Address:</strong> dealflow.ai Legal Department<br/>
                    123 Business Avenue<br/>
                    Suite 100<br/>
                    City, State 12345
                  </p>
                </div>
              </section>

            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;