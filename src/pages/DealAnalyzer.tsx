
import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calculator, Upload, Zap, CheckCircle, TrendingUp, Home, DollarSign } from 'lucide-react';

const DealAnalyzer = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 3000);
  };

  const analysisResult = {
    score: 8.5,
    arv: 185000,
    maxOffer: 45000,
    estimatedRepairs: 35000,
    recommendation: 'Strong Deal - Recommend Pursuit',
    roi: 127,
    comps: [
      { address: '456 Oak St', price: 180000, sqft: 1200, distance: '0.3 miles' },
      { address: '789 Pine Ave', price: 190000, sqft: 1300, distance: '0.5 miles' },
      { address: '321 Elm Dr', price: 175000, sqft: 1150, distance: '0.7 miles' },
    ]
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Deal Analyzer</h1>
            <p className="text-gray-600 mt-1">AI-powered analysis to evaluate investment opportunities</p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">3 analyses remaining</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Property Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Address</label>
                <Input placeholder="123 Main Street, City, State, ZIP" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asking Price</label>
                  <Input placeholder="$0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Square Footage</label>
                  <Input placeholder="0 sqft" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <Input placeholder="0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                  <Input placeholder="0" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select property type</option>
                  <option value="sfh">Single Family Home</option>
                  <option value="condo">Condo</option>
                  <option value="duplex">Duplex</option>
                  <option value="multifamily">Multifamily</option>
                  <option value="land">Land</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
                <Textarea 
                  placeholder="Any additional details about the property, condition, seller motivation, etc." 
                  rows={3}
                />
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 font-medium">Upload Property Photos</p>
                <p className="text-xs text-gray-500 mt-1">Drag & drop or click to upload</p>
                <Button variant="outline" size="sm" className="mt-3">
                  Choose Files
                </Button>
              </div>

              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Calculator className="w-4 h-4 mr-2" />
                    Analyze Deal
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="space-y-6">
            {!analysisComplete ? (
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <Calculator className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Analyze</h3>
                <p className="text-gray-600">Fill out the property details and click "Analyze Deal" to get your AI-powered investment analysis.</p>
              </div>
            ) : (
              <>
                {/* Score Card */}
                <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Deal Score</h3>
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div className="text-4xl font-bold mb-2">{analysisResult.score}/10</div>
                  <p className="text-blue-100">{analysisResult.recommendation}</p>
                </div>

                {/* Key Metrics */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Home className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700">ARV</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">${analysisResult.arv.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-gray-700">Max Offer</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">${analysisResult.maxOffer.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calculator className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium text-gray-700">Repair Estimate</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">${analysisResult.estimatedRepairs.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-medium text-gray-700">Potential ROI</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{analysisResult.roi}%</p>
                    </div>
                  </div>
                </div>

                {/* Comparable Properties */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparable Properties</h3>
                  <div className="space-y-3">
                    {analysisResult.comps.map((comp, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{comp.address}</p>
                          <p className="text-sm text-gray-600">{comp.sqft} sqft • {comp.distance}</p>
                        </div>
                        <p className="font-semibold text-gray-900">${comp.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800">
                    Find Buyers
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Generate Contract
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DealAnalyzer;
