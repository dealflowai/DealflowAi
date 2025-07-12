import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSignUp, useSignIn } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, ArrowLeft, ArrowRight, Check, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

// Step 1: Basic signup schema
const basicSignUpSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  confirmPassword: z.string(),
  role: z.enum(['buyer', 'wholesaler', 'real_estate_agent', 'other'], {
    required_error: 'Please select your role'
  }),
  phone: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .regex(/^[\+]?[\d\s\(\)\-]{10,}$/, 'Please enter a valid phone number'),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and privacy policy'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Onboarding schemas
const onboardingSchema = z.object({
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  preferredMarkets: z.array(z.string()).optional(),
  propertyTypes: z.array(z.string()).optional(),
  experience: z.string().optional(),
  notes: z.string().optional(),
});

type BasicSignUpData = z.infer<typeof basicSignUpSchema>;
type OnboardingData = z.infer<typeof onboardingSchema>;

interface EnhancedSignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export const EnhancedSignUpForm: React.FC<EnhancedSignUpFormProps> = ({ onSuccess, onSwitchToSignIn }) => {
  const { signUp, setActive } = useSignUp();
  const { signIn } = useSignIn();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  // Basic signup form
  const basicForm = useForm<BasicSignUpData>({
    resolver: zodResolver(basicSignUpSchema),
    mode: 'onChange'
  });

  // Onboarding form
  const onboardingForm = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
  });

  // Password requirements checker
  const checkPasswordRequirements = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password)
    };
  };

  const passwordRequirements = checkPasswordRequirements(password);
  const allRequirementsMet = Object.values(passwordRequirements).every(Boolean);

  // Handle Google OAuth signup
  const handleGoogleSignup = async () => {
    if (!signUp) return;
    
    setIsLoading(true);
    
    try {
      await signUp.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/auth-callback",
        redirectUrlComplete: "/"
      });
    } catch (error: any) {
      console.error('Google signup error:', error);
      toast({
        title: "Google Signup Failed",
        description: "Unable to sign up with Google. Please try email signup instead.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Step 1: Handle initial signup
  const handleBasicSignup = async (data: BasicSignUpData) => {
    if (!signUp) return;
    
    setIsLoading(true);
    
    try {
      console.log('Starting signup process...');
      
      // Try creating account with email/password
      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      });

      console.log('Signup result:', result);

      if (result.status === 'missing_requirements') {
        console.log('Email verification required');
        
        // Prepare email verification
        await signUp.prepareEmailAddressVerification({
          strategy: 'email_code'
        });
        
        setUserData(data);
        setCurrentStep(1.5);
        
        toast({
          title: "Check Your Email",
          description: "We've sent you a verification code. Please check your email and enter the code below.",
        });
      } else if (result.status === 'complete' && result.createdSessionId) {
        console.log('Signup completed immediately');
        await setActive({ session: result.createdSessionId });
        await createUserProfile(result.createdUserId!, data);
        
        setUserData({ ...data, clerkId: result.createdUserId });
        setCurrentStep(2);
        
        toast({
          title: "Account Created!",
          description: "Welcome! Let's customize your experience.",
        });
      } else {
        console.log('Unexpected signup status:', result.status);
        toast({
          title: "Setup Required",
          description: "Please complete the verification process.",
          variant: "default"
        });
      }
    } catch (error: any) {
      console.error('Signup error details:', error);
      
      let errorMessage = "Please try again or use Google signup below.";
      let errorTitle = "Signup Failed";
      
      if (error.errors && error.errors.length > 0) {
        const firstError = error.errors[0];
        console.log('First error:', firstError);
        
        switch (firstError.code) {
          case 'form_identifier_exists':
            errorTitle = "Account Already Exists";
            errorMessage = "An account with this email already exists. Please sign in instead.";
            break;
          case 'form_password_pwned':
            errorTitle = "Password Not Secure";
            errorMessage = "Please choose a different, more secure password.";
            break;
          case 'form_password_validation_failed':
            errorTitle = "Password Requirements";
            errorMessage = "Password must be at least 8 characters with uppercase, lowercase, number, and special character.";
            break;
          case 'captcha_invalid':
          case 'captcha_failed':
          case 'captcha_unavailable':
            errorTitle = "CAPTCHA Issue";
            errorMessage = "CAPTCHA failed to load. Please try Google signup or refresh the page and try again.";
            break;
          default:
            errorMessage = firstError.longMessage || firstError.message || errorMessage;
        }
      } else if (error.message?.toLowerCase().includes('captcha')) {
        errorTitle = "CAPTCHA Problem";
        errorMessage = "CAPTCHA verification failed. Try disabling browser extensions or use Google signup.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle email verification
  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUp) return;
    
    setIsLoading(true);
    
    try {
      const cleanCode = verificationCode.trim().replace(/\s/g, '');
      
      if (!cleanCode || cleanCode.length !== 6) {
        toast({
          title: "Invalid Code",
          description: "Please enter the 6-digit verification code from your email.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      console.log('Attempting verification with code:', cleanCode);
      
      const result = await signUp.attemptEmailAddressVerification({
        code: cleanCode,
      });

      console.log('Verification result:', result);
      
      if (result.status === 'complete' && result.createdSessionId) {
        console.log('Verification successful, setting session');
        await setActive({ session: result.createdSessionId });
        await createUserProfile(result.createdUserId!, userData);
        
        setUserData({ ...userData, clerkId: result.createdUserId });
        setCurrentStep(2);
        
        toast({
          title: "Email Verified!",
          description: "Welcome! Let's set up your preferences.",
        });
      } else {
        console.log('Verification incomplete, attempting to complete signup');
        // Additional step might be needed
        try {
          const completionResult = await signUp.update({
            firstName: userData.firstName,
            lastName: userData.lastName,
          });
          
          if (completionResult.status === 'complete' && completionResult.createdSessionId) {
            await setActive({ session: completionResult.createdSessionId });
            await createUserProfile(completionResult.createdUserId!, userData);
            
            setUserData({ ...userData, clerkId: completionResult.createdUserId });
            setCurrentStep(2);
            
            toast({
              title: "Account Verified!",
              description: "Welcome! Let's set up your preferences.",
            });
          } else {
            console.log('Still not complete after update, proceeding anyway');
            setCurrentStep(2);
          }
        } catch (completionError) {
          console.error('Completion error:', completionError);
          // Even if completion fails, proceed if verification was successful
          setCurrentStep(2);
        }
      }
      
      setVerificationCode('');
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationCode('');
      
      let errorMessage = "Invalid verification code. Please check your email and try again.";
      
      if (error.errors && error.errors.length > 0) {
        const firstError = error.errors[0];
        console.log('Verification error details:', firstError);
        
        switch (firstError.code) {
          case 'form_code_incorrect':
            errorMessage = "The verification code is incorrect. Please check your email and try again.";
            break;
          case 'form_code_expired':
            errorMessage = "The verification code has expired. Please request a new one.";
            break;
          default:
            errorMessage = firstError.longMessage || firstError.message || errorMessage;
        }
      }
      
      toast({
        title: "Verification Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle onboarding completion
  const handleOnboardingSubmit = async (data: OnboardingData) => {
    if (!userData.clerkId) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          budget_min: data.budgetMin,
          budget_max: data.budgetMax,
          preferred_markets: data.preferredMarkets,
          property_types: data.propertyTypes,
          monthly_deal_volume: data.experience,
          notes: data.notes,
          has_completed_onboarding: true
        })
        .eq('clerk_id', userData.clerkId);

      if (error) throw error;

      toast({
        title: "Setup Complete!",
        description: "Welcome to DealFlow AI! You're all set.",
      });
      
      setCurrentStep(3); // Move to completion screen
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: "Update Failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to create user profile with all data
  const createUserProfile = async (clerkUserId: string, userData: BasicSignUpData) => {
    try {
      const profileData = {
        clerk_id: clerkUserId,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        user_role: userData.role,
        role: 'user',
        onboarding_step: 2,
        has_completed_onboarding: false,
        consent_given: true,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'clerk_id'
        });

      if (error) {
        console.error('Profile creation error:', error);
      } else {
        console.log('Profile created successfully');
      }
    } catch (error) {
      console.error('Profile creation error:', error);
    }
  };

  // Step progress indicator
  const renderProgressIndicator = () => {
    const steps = [
      { number: 1, title: "Account", description: "Basic information" },
      { number: 2, title: "Preferences", description: "Your investment focus" },
    ];

    const displayStep = currentStep === 1.5 ? 1 : currentStep;

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                step.number <= displayStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step.number < displayStep ? <Check className="w-5 h-5" /> : step.number}
              </div>
              <div className="text-center mt-2">
                <div className="text-sm font-medium">{step.title}</div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-16 h-1 mx-4 ${
                step.number < displayStep ? 'bg-primary' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Step 1: Basic signup form
  if (currentStep === 1) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Create Your Account</CardTitle>
          <CardDescription>
            Join thousands of investors finding profitable deals with AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderProgressIndicator()}
          
          {/* Google Signup Button */}
          <div className="mb-6">
            <Button 
              type="button"
              variant="outline" 
              className="w-full h-12 text-base font-medium"
              onClick={handleGoogleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing up...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>
          </div>
          
          <form onSubmit={basicForm.handleSubmit(handleBasicSignup)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  {...basicForm.register('firstName')}
                  className="mt-1"
                  placeholder="John"
                />
                {basicForm.formState.errors.firstName && (
                  <p className="text-sm text-destructive mt-1">{basicForm.formState.errors.firstName.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  {...basicForm.register('lastName')}
                  className="mt-1"
                  placeholder="Doe"
                />
                {basicForm.formState.errors.lastName && (
                  <p className="text-sm text-destructive mt-1">{basicForm.formState.errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...basicForm.register('email')}
                className="mt-1"
                placeholder="john@example.com"
              />
              {basicForm.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">{basicForm.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...basicForm.register('password', {
                    onChange: (e) => setPassword(e.target.value)
                  })}
                  className="mt-1 pr-10"
                  placeholder="Create a secure password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              
              {password && (
                <div className="mt-2 text-xs space-y-1">
                  <p className="text-muted-foreground">Password requirements:</p>
                  <div className="grid grid-cols-1 gap-1">
                    <div className={`flex items-center gap-2 ${passwordRequirements.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                      {passwordRequirements.length ? '✓' : '○'} At least 8 characters
                    </div>
                    <div className={`flex items-center gap-2 ${passwordRequirements.uppercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                      {passwordRequirements.uppercase ? '✓' : '○'} One uppercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${passwordRequirements.lowercase ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                      {passwordRequirements.lowercase ? '✓' : '○'} One lowercase letter
                    </div>
                    <div className={`flex items-center gap-2 ${passwordRequirements.number ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                      {passwordRequirements.number ? '✓' : '○'} One number
                    </div>
                    <div className={`flex items-center gap-2 ${passwordRequirements.special ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                      {passwordRequirements.special ? '✓' : '○'} One special character
                    </div>
                  </div>
                </div>
              )}
              
              {basicForm.formState.errors.password && (
                <p className="text-sm text-destructive mt-1">{basicForm.formState.errors.password.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  {...basicForm.register('confirmPassword')}
                  className="mt-1 pr-10"
                  placeholder="Re-enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {basicForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive mt-1">{basicForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="role">Your Role</Label>
              <Select 
                onValueChange={(value) => {
                  basicForm.setValue('role', value as any);
                  basicForm.trigger('role');
                }}
                {...basicForm.register('role')}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Real Estate Investor/Buyer</SelectItem>
                  <SelectItem value="wholesaler">Wholesaler</SelectItem>
                  <SelectItem value="real_estate_agent">Real Estate Agent</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {basicForm.formState.errors.role && (
                <p className="text-sm text-destructive mt-1">{basicForm.formState.errors.role.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                {...basicForm.register('phone')}
                className="mt-1"
                placeholder="+1 (555) 123-4567"
              />
              {basicForm.formState.errors.phone && (
                <p className="text-sm text-destructive mt-1">{basicForm.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="consent"
                onCheckedChange={(checked) => {
                  basicForm.setValue('consent', !!checked);
                  basicForm.trigger('consent');
                }}
                {...basicForm.register('consent')}
              />
              <div className="flex-1">
                <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
                  I agree to the{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>{" "}
                  and consent to receive communication via email, phone, and SMS.
                </Label>
                {basicForm.formState.errors.consent && (
                  <p className="text-sm text-destructive mt-1">{basicForm.formState.errors.consent.message}</p>
                )}
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading || !basicForm.formState.isValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{" "}
            <button 
              type="button"
              className="text-primary hover:underline font-medium"
              onClick={() => onSwitchToSignIn?.()}
            >
              Sign in here
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 1.5: Email verification
  if (currentStep === 1.5) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to {userData.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <div>
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="mt-1 text-center text-lg tracking-widest"
                placeholder="123456"
                maxLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground mt-4">
            Didn't receive the code?{" "}
            <button 
              type="button"
              className="text-primary hover:underline"
              onClick={async () => {
                try {
                  await signUp?.prepareEmailAddressVerification({
                    strategy: 'email_code'
                  });
                  toast({
                    title: "Code Resent",
                    description: "We've sent you a new verification code.",
                  });
                } catch (error) {
                  toast({
                    title: "Failed to Resend",
                    description: "Please try again in a moment.",
                    variant: "destructive"
                  });
                }
              }}
            >
              Resend code
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 2: Onboarding
  if (currentStep === 2) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Customize Your Experience</CardTitle>
          <CardDescription>
            Help us tailor DealFlow AI to your investment strategy
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderProgressIndicator()}
          
          <form onSubmit={onboardingForm.handleSubmit(handleOnboardingSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budgetMin">Min Budget ($)</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  {...onboardingForm.register('budgetMin', { valueAsNumber: true })}
                  className="mt-1"
                  placeholder="50000"
                />
              </div>
              
              <div>
                <Label htmlFor="budgetMax">Max Budget ($)</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  {...onboardingForm.register('budgetMax', { valueAsNumber: true })}
                  className="mt-1"
                  placeholder="500000"
                />
              </div>
            </div>

            <div>
              <Label>Preferred Markets (Optional)</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {['Atlanta', 'Dallas', 'Phoenix', 'Tampa', 'Charlotte', 'Austin'].map((market) => (
                  <div key={market} className="flex items-center space-x-2">
                    <Checkbox
                      id={`market-${market}`}
                      onCheckedChange={(checked) => {
                        const currentMarkets = onboardingForm.getValues('preferredMarkets') || [];
                        if (checked) {
                          onboardingForm.setValue('preferredMarkets', [...currentMarkets, market]);
                        } else {
                          onboardingForm.setValue('preferredMarkets', currentMarkets.filter(m => m !== market));
                        }
                      }}
                    />
                    <Label htmlFor={`market-${market}`} className="text-sm font-normal">
                      {market}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Property Types (Optional)</Label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {['Single Family', 'Duplex', 'Multi-Family', 'Townhouse', 'Condo', 'Land'].map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${type}`}
                      onCheckedChange={(checked) => {
                        const currentTypes = onboardingForm.getValues('propertyTypes') || [];
                        if (checked) {
                          onboardingForm.setValue('propertyTypes', [...currentTypes, type]);
                        } else {
                          onboardingForm.setValue('propertyTypes', currentTypes.filter(t => t !== type));
                        }
                      }}
                    />
                    <Label htmlFor={`type-${type}`} className="text-sm font-normal">
                      {type}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="experience">Experience Level</Label>
              <Select onValueChange={(value) => onboardingForm.setValue('experience', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (0-5 deals)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (5-20 deals)</SelectItem>
                  <SelectItem value="experienced">Experienced (20+ deals)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                {...onboardingForm.register('notes')}
                className="mt-1"
                placeholder="Tell us about your investment goals or specific requirements..."
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button 
                type="button"
                variant="outline"
                onClick={async () => {
                  // Mark onboarding as complete even if skipped
                  if (userData.clerkId) {
                    try {
                      await supabase
                        .from('profiles')
                        .update({ has_completed_onboarding: true })
                        .eq('clerk_id', userData.clerkId);
                    } catch (error) {
                      console.error('Profile update error:', error);
                    }
                  }
                  setCurrentStep(3);
                }}
                className="flex-1"
              >
                Skip For Now
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Complete Setup
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // Step 3: Completion screen
  if (currentStep === 3) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="text-2xl">Welcome to DealFlow AI!</CardTitle>
          <CardDescription>
            Your account is ready. Let's explore the platform and see what you can accomplish.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Account created and verified</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Profile customized</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Ready to start finding deals</span>
            </div>
          </div>
          
          <Button 
            onClick={() => {
              localStorage.setItem('hasCompletedOnboard', 'true');
              localStorage.setItem('showWelcomeTour', 'true');
              onSuccess?.();
            }}
            className="w-full"
          >
            Continue to Dashboard
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }


  return null;
};