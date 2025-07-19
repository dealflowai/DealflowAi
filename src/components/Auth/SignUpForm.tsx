import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSignUp } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Loader2, Star, Eye, EyeOff, Shield, AlertTriangle, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authSecurity } from '@/utils/authSecurity';
import { Alert, AlertDescription } from '@/components/ui/alert';

const signUpSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, apostrophes, and hyphens'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, apostrophes, and hyphens'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(254, 'Email must be less than 254 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
  confirmPassword: z.string(),
  selectedPlan: z.string().min(1, 'Please select a plan'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and privacy policy'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const plans = [
  {
    id: 'starter',
    name: "Entry / Free",
    price: 0,
    originalPrice: 0,
    description: "25 tokens included (never expire), no credit card required",
    features: [
      "25 tokens included (never expire)",
      "Basic AI discovery",
      "Email support",
      "1 user included"
    ],
    popular: false,
  },
  {
    id: 'pro',
    name: "Core Plan", 
    price: 49,
    originalPrice: 0,
    description: "$49/month recurring with 100 monthly tokens (reset each month)",
    features: [
      "100 monthly tokens (reset each month)",
      "Advanced AI buyer discovery",
      "Unlimited deal analysis",
      "Priority support", 
      "Advanced CRM features",
      "API access"
    ],
    popular: true,
  },
  {
    id: 'agency',
    name: "Agency",
    price: 299,
    originalPrice: 0,
    description: "$299/month includes 1,500 tokens + 5 seats",
    features: [
      "1,500 tokens included monthly",
      "5 user seats included",
      "Extra seats $30/month",
      "Full outreach campaigns",
      "Custom templates",
      "Dedicated account manager"
    ],
    popular: false,
  }
];

interface SignUpFormProps {
  onSuccess?: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess }) => {
  const { signUp, setActive } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<any>(null);
  const [emailValidation, setEmailValidation] = useState<any>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<any>(null);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      selectedPlan: 'pro',
      agreeToTerms: false
    },
    mode: 'onChange'
  });

  const watchedPlan = watch('selectedPlan');
  const watchedPassword = watch('password');
  const watchedEmail = watch('email');

  // Real-time password validation
  useEffect(() => {
    if (watchedPassword) {
      const validation = authSecurity.validatePassword(watchedPassword);
      setPasswordValidation(validation);
    } else {
      setPasswordValidation(null);
    }
  }, [watchedPassword]);

  // Real-time email validation
  useEffect(() => {
    if (watchedEmail) {
      const validation = authSecurity.validateEmail(watchedEmail);
      setEmailValidation(validation);
    } else {
      setEmailValidation(null);
    }
  }, [watchedEmail]);

  const onSubmit = async (data: SignUpFormData) => {
    if (!signUp) return;

    // Check rate limiting
    const userIdentifier = data.email;
    const rateLimitCheck = authSecurity.checkRateLimit(userIdentifier);
    
    if (!rateLimitCheck.allowed) {
      const blockedMessage = rateLimitCheck.blockedUntil 
        ? `Too many attempts. Please try again after ${rateLimitCheck.blockedUntil.toLocaleTimeString()}`
        : 'Too many attempts. Please try again later.';
      
      toast({
        title: "Rate Limited",
        description: blockedMessage,
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setRateLimitInfo(rateLimitCheck);

    try {
      // Final validation before submission
      const finalPasswordValidation = authSecurity.validatePassword(data.password);
      const finalEmailValidation = authSecurity.validateEmail(data.email);

      if (!finalPasswordValidation.isValid) {
        toast({
          title: "Password Security Issue",
          description: finalPasswordValidation.errors[0],
          variant: "destructive"
        });
        authSecurity.recordAttempt(userIdentifier, false);
        setIsLoading(false);
        return;
      }

      if (!finalEmailValidation.isValid) {
        toast({
          title: "Email Validation Issue", 
          description: finalEmailValidation.errors[0],
          variant: "destructive"
        });
        authSecurity.recordAttempt(userIdentifier, false);
        setIsLoading(false);
        return;
      }

      // Sanitize input data
      const sanitizedData = {
        ...data,
        firstName: authSecurity.sanitizeInput(data.firstName),
        lastName: authSecurity.sanitizeInput(data.lastName),
        email: data.email.toLowerCase().trim()
      };

      // Create user with Clerk
      const result = await signUp.create({
        emailAddress: sanitizedData.email,
        password: sanitizedData.password,
        firstName: sanitizedData.firstName,
        lastName: sanitizedData.lastName,
        unsafeMetadata: {
          securityVerified: true,
          createdAt: new Date().toISOString()
        }
      });

      if (result.status === 'complete') {
        // Set the session active
        await setActive({ session: result.createdSessionId });

        // Store additional profile data in Supabase
        const { error } = await supabase
          .from('profiles')
          .upsert({
            clerk_id: result.createdUserId!,
            email: sanitizedData.email,
            first_name: sanitizedData.firstName,
            last_name: sanitizedData.lastName,
            selected_plan: sanitizedData.selectedPlan,
            role: 'user',
            security_verified: true,
            created_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error saving profile:', error);
          toast({
            title: "Profile Error",
            description: "Account created but profile data couldn't be saved. Please contact support.",
            variant: "destructive"
          });
        } else {
          // Record successful attempt
          authSecurity.recordAttempt(userIdentifier, true);
          
          toast({
            title: "Welcome to DealFlow AI!",
            description: "Your account has been created successfully.",
          });
          onSuccess?.();
        }
      } else if (result.status === 'missing_requirements') {
        // Handle email verification if needed
        toast({
          title: "Email Verification Required",
          description: "Please check your email for a verification link.",
        });
        
        try {
          await signUp.prepareEmailAddressVerification({
            strategy: 'email_code'
          });
        } catch (verificationError) {
          console.error('Email verification setup error:', verificationError);
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      // Record failed attempt
      authSecurity.recordAttempt(userIdentifier, false);
      
      let errorMessage = "Something went wrong. Please try again.";
      let errorTitle = "Sign Up Failed";
      
      if (error.errors && error.errors.length > 0) {
        const firstError = error.errors[0];
        
        switch (firstError.code) {
          case 'form_identifier_exists':
            errorTitle = "Account Already Exists";
            errorMessage = "An account with this email already exists. Please sign in instead.";
            break;
          case 'form_password_pwned':
            errorTitle = "Weak Password";
            errorMessage = "This password has been found in a data breach. Please choose a different password.";
            break;
          case 'captcha_invalid':
          case 'captcha_failed':
            errorTitle = "Verification Failed";
            errorMessage = "Security verification failed. Please try again.";
            break;
          case 'too_many_requests':
            errorTitle = "Too Many Attempts";
            errorMessage = "Please wait a few minutes before trying again.";
            break;
          default:
            errorMessage = firstError.longMessage || firstError.message || errorMessage;
        }
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

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setValue('selectedPlan', planId);
  };

  const selectedPlanData = plans.find(p => p.id === watchedPlan);

  // Password strength indicator component
  const PasswordStrengthIndicator = () => {
    if (!passwordValidation) return null;
    
    const strengthColors = {
      weak: 'bg-destructive',
      medium: 'bg-yellow-500',
      strong: 'bg-blue-500', 
      very_strong: 'bg-green-500'
    };
    
    const strengthWidth = {
      weak: 'w-1/4',
      medium: 'w-2/4', 
      strong: 'w-3/4',
      very_strong: 'w-full'
    };

    return (
      <div className="mt-2 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-300 ${strengthColors[passwordValidation.strength]} ${strengthWidth[passwordValidation.strength]}`} />
          </div>
          <span className="text-xs font-medium capitalize">{passwordValidation.strength.replace('_', ' ')}</span>
        </div>
        
        {passwordValidation.errors.length > 0 && (
          <div className="space-y-1">
            {passwordValidation.errors.map((error, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-destructive">
                <X className="w-3 h-3" />
                {error}
              </div>
            ))}
          </div>
        )}
        
        {passwordValidation.suggestions.length > 0 && (
          <div className="space-y-1">
            {passwordValidation.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-center gap-2 text-xs text-yellow-600">
                <AlertTriangle className="w-3 h-3" />
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Create Your Account</h2>
        </div>
        <p className="text-muted-foreground">Join thousands of successful wholesalers with secure signup</p>
      </div>

      {/* Security Status */}
      {rateLimitInfo && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            {rateLimitInfo.attemptsRemaining > 0
              ? `${rateLimitInfo.attemptsRemaining} attempts remaining`
              : 'Security monitoring active'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Plan Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Choose Your Plan</Label>
        <div className="grid gap-3">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`cursor-pointer transition-all ${
                watchedPlan === plan.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              } ${plan.popular ? 'border-primary/30' : ''}`}
              onClick={() => handlePlanSelect(plan.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{plan.name}</h3>
                      {plan.popular && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          <Star className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{plan.description}</p>
                     <div className="flex items-baseline gap-2">
                       {plan.price === 0 ? (
                         <span className="text-2xl font-bold">Free</span>
                       ) : (
                         <>
                           <span className="text-2xl font-bold">${plan.price}</span>
                           <span className="text-sm text-muted-foreground">/mo</span>
                         </>
                       )}
                     </div>
                  </div>
                  <div className="ml-4">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      watchedPlan === plan.id 
                        ? 'bg-primary border-primary' 
                        : 'border-muted-foreground'
                    }`}>
                      {watchedPlan === plan.id && (
                        <CheckCircle className="w-4 h-4 text-primary-foreground" />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {errors.selectedPlan && (
          <p className="text-sm text-destructive">{errors.selectedPlan.message}</p>
        )}
      </div>

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              {...register('firstName')}
              className="mt-1"
              placeholder="Enter first name"
            />
            {errors.firstName && (
              <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              {...register('lastName')}
              className="mt-1"
              placeholder="Enter last name"
            />
            {errors.lastName && (
              <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            className="mt-1"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
          )}
          {emailValidation && emailValidation.suggestions.length > 0 && (
            <div className="mt-1 space-y-1">
              {emailValidation.suggestions.map((suggestion, index) => (
                <p key={index} className="text-xs text-yellow-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {suggestion}
                </p>
              ))}
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              {...register('password')}
              className="mt-1 pr-10"
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
          )}
          <PasswordStrengthIndicator />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              {...register('confirmPassword')}
              className="mt-1 pr-10"
              placeholder="Confirm your password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-destructive mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="agreeToTerms"
            {...register('agreeToTerms')}
            className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
          />
          <Label htmlFor="agreeToTerms" className="text-sm">
            I agree to the{" "}
            <Link to="/terms" className="underline hover:text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </Link>
          </Label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-sm text-destructive">{errors.agreeToTerms.message}</p>
        )}

        <Button 
          type="submit" 
          className="w-full h-12 text-base font-semibold"
          disabled={isLoading || (passwordValidation && !passwordValidation.isValid) || (emailValidation && !emailValidation.isValid)}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Secure Account...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              {`Create Secure Account - ${selectedPlanData?.name}`}
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Shield className="w-3 h-3" />
          <span>Your data is protected with enterprise-grade security</span>
        </div>
        <p>
          Protected by advanced security measures including rate limiting, 
          input sanitization, and secure password validation.
        </p>
      </div>
    </div>
  );
};