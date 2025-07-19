
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Send, Clock, CheckCircle, AlertCircle, Mail, FileText } from 'lucide-react';

interface ESignatureWorkflowProps {
  contracts: any[];
  onStatusUpdate: (contractId: string, status: string) => void;
}

const ESignatureWorkflow = ({ contracts, onStatusUpdate }: ESignatureWorkflowProps) => {
  const [sending, setSending] = useState<string | null>(null);
  const { toast } = useToast();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <FileText className="w-4 h-4" />;
      case 'sent':
        return <Send className="w-4 h-4" />;
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'signed':
        return <CheckCircle className="w-4 h-4" />;
      case 'executed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'signed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'executed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSignatureProgress = (status: string) => {
    switch (status) {
      case 'draft':
        return 0;
      case 'sent':
        return 25;
      case 'pending':
        return 50;
      case 'signed':
        return 75;
      case 'executed':
        return 100;
      default:
        return 0;
    }
  };

  const handleSendForSignature = async (contractId: string, contract: any) => {
    if (!contract.buyer_email && !contract.seller_email) {
      toast({
        title: "Missing Email Addresses",
        description: "Buyer or seller email is required to send for signature.",
        variant: "destructive"
      });
      return;
    }

    setSending(contractId);
    
    try {
      // Simulate sending for signature
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onStatusUpdate(contractId, 'sent');
      
      toast({
        title: "Contract Sent",
        description: `Contract sent to ${contract.buyer_email || contract.seller_email} for signature.`,
      });

      // Simulate status progression
      setTimeout(() => {
        onStatusUpdate(contractId, 'pending');
      }, 3000);
      
      setTimeout(() => {
        onStatusUpdate(contractId, 'signed');
      }, 8000);
      
    } catch (error) {
      toast({
        title: "Send Failed",
        description: "Failed to send contract for signature.",
        variant: "destructive"
      });
    } finally {
      setSending(null);
    }
  };

  const contractsForSignature = contracts.filter(c => c.status?.toLowerCase() !== 'executed');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="w-5 h-5 text-green-600" />
          <span>E-Signature Workflow</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {contractsForSignature.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No contracts ready for signature</p>
          </div>
        ) : (
          <div className="space-y-4">
            {contractsForSignature.map((contract) => (
              <div key={contract.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{contract.title}</h3>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <span>{contract.template_type}</span>
                      <span>•</span>
                      <span>${contract.purchase_price?.toLocaleString() || 'N/A'}</span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(contract.status)}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(contract.status)}
                      <span className="capitalize">{contract.status}</span>
                    </div>
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Signature Progress</span>
                    <span>{getSignatureProgress(contract.status)}%</span>
                  </div>
                  <Progress value={getSignatureProgress(contract.status)} className="h-2" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Buyer:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {contract.buyer_name || 'Not specified'}
                    </span>
                    {contract.buyer_email && (
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Mail className="w-3 h-3 mr-1" />
                        {contract.buyer_email}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-500">Seller:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {contract.seller_name || 'Not specified'}
                    </span>
                    {contract.seller_email && (
                      <div className="text-xs text-gray-500 flex items-center mt-1">
                        <Mail className="w-3 h-3 mr-1" />
                        {contract.seller_email}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex space-x-2">
                  {contract.status === 'draft' && (
                    <Button
                      onClick={() => handleSendForSignature(contract.id, contract)}
                      disabled={sending === contract.id}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {sending === contract.id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 mr-1" />
                          Send for Signature
                        </>
                      )}
                    </Button>
                  )}
                  
                  {contract.status === 'sent' && (
                    <Button
                      onClick={() => onStatusUpdate(contract.id, 'pending')}
                      size="sm"
                      variant="outline"
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      Mark as Pending
                    </Button>
                  )}
                  
                  {contract.status === 'signed' && (
                    <Button
                      onClick={() => onStatusUpdate(contract.id, 'executed')}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Mark as Executed
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ESignatureWorkflow;
