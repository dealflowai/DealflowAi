import React, { useState } from 'react';
import { useSignUp } from '@clerk/clerk-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Eye, EyeOff } from 'lucide-react';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  role: z.string().default('investor')
});

type SignUpData = z.infer<typeof signUpSchema>;

interface SimpleSignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export const SimpleSignUpForm: React.FC<SimpleSignUpFormProps> = ({ onSuccess, onSwitchToSignIn }) => {
  const { signUp, setActive } = useSignUp();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<SignUpData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'investor'
    }
  });

  // Create user profile in our database
  const createUserProfile = async (clerkUserId: string, data: SignUpData) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          clerk_id: clerkUserId,
          email: data.email,
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          user_role: data.role,
          role: 'user',
          has_completed_onboarding: false,
          consent_given: true,
          plan_tokens: 25,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // Initialize user tokens
      await supabase.rpc('reset_monthly_tokens', {
        p_user_id: clerkUserId
      });

      return true;
    } catch (error) {
      console.error('Profile creation error:', error);
      return false;
    }
  };

  // Handle signup
  const handleSignUp = async (data: SignUpData) => {
    if (!signUp) return;
    
    setIsLoading(true);
    
    try {
      console.log('Creating account for:', data.email);
      
      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      console.log('Signup result:', result.status);

      if (result.status === 'missing_requirements') {
        // Email verification needed
        await signUp.prepareEmailAddressVerification({
          strategy: 'email_code'
        });
        
        setUserData(data);
        setCurrentStep(2);
        
        toast({
          title: "Check Your Email",
          description: "We sent you a verification code.",
        });
        
      } else if (result.status === 'complete') {
        // Account created successfully
        await setActive({ session: result.createdSessionId });
        
        // Create profile
        const profileCreated = await createUserProfile(result.createdUserId!, data);
        
        if (profileCreated) {
          toast({
            title: "Account Created!",
            description: "Welcome to DealFlow AI!",
          });
          
          if (onSuccess) {
            onSuccess();
          }
        } else {
          toast({
            title: "Account Created",
            description: "Please complete your profile setup.",
          });
        }
      }
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let message = "Failed to create account.";
      
      if (error.errors?.[0]) {
        switch (error.errors[0].code) {
          case 'form_identifier_exists':
            message = "An account with this email already exists.";
            break;
          case 'form_password_pwned':
            message = "Please choose a more secure password.";
            break;
          default:
            message = error.errors[0].message || message;
        }
      }
      
      toast({
        title: "Signup Failed",
        description: message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email verification
  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp || !userData) return;
    
    setIsLoading(true);
    
    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        
        // Create profile
        const profileCreated = await createUserProfile(result.createdUserId!, userData);
        
        toast({
          title: "Email Verified!",
          description: "Your account is ready.",
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: "Invalid code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 1: Signup form
  if (currentStep === 1) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Create Your Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSignUp)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          {...field} 
                          type={showPassword ? "text" : "password"} 
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={onSwitchToSignIn}
                  className="text-sm"
                >
                  Already have an account? Sign in
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Email verification
  if (currentStep === 2) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Verify Your Email</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerification} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              We sent a verification code to {userData?.email}
            </p>
            
            <div>
              <label htmlFor="code" className="block text-sm font-medium mb-2">
                Verification Code
              </label>
              <Input
                id="code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  return null;
};