import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Phone, ShieldCheck } from 'lucide-react';
import { PhoneVerificationStep } from './PhoneVerificationStep';

interface PhoneVerificationWrapperProps {
  children: React.ReactNode;
}

export const PhoneVerificationWrapper: React.FC<PhoneVerificationWrapperProps> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [showVerification, setShowVerification] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [userPhone, setUserPhone] = useState<string>('');

  useEffect(() => {
    if (isLoaded && user) {
      // Check if user has a verified phone number
      const phoneNumbers = user.phoneNumbers || [];
      const verifiedPhone = phoneNumbers.find(phone => 
        phone.verification?.status === 'verified'
      );
      
      setIsPhoneVerified(!!verifiedPhone);
      
      // Get phone number from user metadata or phone numbers
      const phone = verifiedPhone?.phoneNumber || 
                   user.unsafeMetadata?.phone as string || 
                   user.publicMetadata?.phone as string || '';
      
      setUserPhone(phone);
    }
  }, [user, isLoaded]);

  // Don't render anything while loading
  if (!isLoaded) {
    return null;
  }

  // If no user, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If phone is already verified, render children
  if (isPhoneVerified) {
    return <>{children}</>;
  }

  // If verification modal is open
  if (showVerification && userPhone) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <PhoneVerificationStep
          phoneNumber={userPhone}
          onSuccess={() => {
            setIsPhoneVerified(true);
            setShowVerification(false);
          }}
          onBack={() => setShowVerification(false)}
        />
      </div>
    );
  }

  // Show phone verification required screen
  return (
    <div className="min-h-screen bg-background">
      {/* Header notification bar */}
      <div className="bg-destructive text-destructive-foreground p-3">
        <div className="max-w-4xl mx-auto flex items-center justify-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">
            Phone verification required to access your account
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center min-h-[calc(100vh-60px)] p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-xl">Phone Verification Required</CardTitle>
            <CardDescription className="text-center">
              For your security and to access all features, you need to verify your phone number.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="text-center space-y-2">
                <Badge variant="outline" className="mb-2">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Account Restricted
                </Badge>
                <h4 className="font-semibold text-sm">Limited Access</h4>
                <p className="text-xs text-muted-foreground">
                  You currently have limited access to your account. Complete phone verification to unlock:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                  <li>• Full dashboard access</li>
                  <li>• Lead generation tools</li>
                  <li>• AI-powered features</li>
                  <li>• CRM functionality</li>
                  <li>• Deal analysis</li>
                </ul>
              </div>
            </div>

            {userPhone ? (
              <Button 
                onClick={() => setShowVerification(true)}
                className="w-full"
              >
                <Phone className="w-4 h-4 mr-2" />
                Verify Phone Number
              </Button>
            ) : (
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  No phone number found in your account. Please contact support to add a phone number.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Phone verification helps protect your account and enables all platform features.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};