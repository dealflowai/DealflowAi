import React, { useState } from 'react';
import { useSignUp } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Phone, RotateCcw, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PhoneVerificationStepProps {
  phoneNumber: string;
  onSuccess: () => void;
  onBack: () => void;
}

export const PhoneVerificationStep: React.FC<PhoneVerificationStepProps> = ({
  phoneNumber,
  onSuccess,
  onBack
}) => {
  const { signUp } = useSignUp();
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const { toast } = useToast();

  // Initialize phone verification
  React.useEffect(() => {
    if (!hasInitialized && signUp) {
      setIsLoading(true);
      signUp.preparePhoneNumberVerification({ strategy: 'phone_code' })
        .then(() => {
          setHasInitialized(true);
          toast({
            title: "Verification Code Sent",
            description: `We've sent a 6-digit code to ${phoneNumber}`,
          });
        })
        .catch((error) => {
          console.error('Phone verification preparation error:', error);
          toast({
            title: "SMS Error",
            description: "Failed to send verification code. Please try again.",
            variant: "destructive"
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [signUp, phoneNumber, hasInitialized, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp || !verificationCode.trim()) return;

    setIsLoading(true);
    try {
      const cleanCode = verificationCode.trim().replace(/\s/g, '');
      
      if (cleanCode.length !== 6) {
        toast({
          title: "Invalid Code",
          description: "Please enter a valid 6-digit verification code.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const result = await signUp.attemptPhoneNumberVerification({
        code: cleanCode,
      });

      if (result.verifications?.phoneNumber?.status === 'verified') {
        toast({
          title: "Phone Verified!",
          description: "Your phone number has been successfully verified.",
        });
        onSuccess();
      } else {
        toast({
          title: "Verification Failed",
          description: "Invalid verification code. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Phone verification error:', error);
      
      let errorMessage = "Verification failed. Please try again.";
      
      if (error.errors && error.errors.length > 0) {
        const firstError = error.errors[0];
        if (firstError.code === 'form_code_incorrect') {
          errorMessage = "Invalid verification code. Please check your phone and try again.";
        } else if (firstError.code === 'verification_expired') {
          errorMessage = "Verification code has expired. Please request a new one.";
        }
      }
      
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setVerificationCode('');
    }
  };

  const handleResendCode = async () => {
    if (!signUp) return;

    setIsResending(true);
    try {
      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
      toast({
        title: "Code Resent",
        description: `A new verification code has been sent to ${phoneNumber}`,
      });
    } catch (error) {
      console.error('Resend error:', error);
      toast({
        title: "Resend Failed",
        description: "Failed to resend verification code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsResending(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Phone className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Verify Your Phone Number</CardTitle>
        <CardDescription>
          Enter the 6-digit code we sent to{' '}
          <span className="font-semibold">{formatPhoneNumber(phoneNumber)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="verificationCode">Verification Code</Label>
            <Input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
              }}
              className="mt-1 text-center text-lg tracking-widest"
              placeholder="000000"
              maxLength={6}
              autoComplete="one-time-code"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the 6-digit code from your text message
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Phone Number
                </>
              )}
            </Button>

            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isLoading}
                className="flex-1"
              >
                Back
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleResendCode}
                disabled={isResending || isLoading}
                className="flex-1"
              >
                {isResending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Resend Code
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <Badge variant="outline" className="mb-2">
              <Phone className="w-3 h-3 mr-1" />
              Security Required
            </Badge>
            <p className="text-xs text-muted-foreground">
              Phone verification is required to access all features and ensure account security.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};