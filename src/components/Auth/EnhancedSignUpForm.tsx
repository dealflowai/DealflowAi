import React, { useState } from 'react';
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
import { CheckCircle, Loader2, Star, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';

// Enhanced signup schema with stronger validation
const basicSignUpSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must be less than 100 characters')
    .toLowerCase(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  role: z.enum(['buyer', 'wholesaler', 'real_estate_agent', 'other'], {
    required_error: 'Please select your role'
  }),
  phone: z.string()
    .optional()
    .refine((val) => {
      if (!val) return true;
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      return phoneRegex.test(val.replace(/[\s\-\(\)\.]/g, ''));
    }, 'Please enter a valid phone number'),
});

// Step 2-4: Onboarding schemas based on role
const buyerOnboardingSchema = z.object({
  budgetMin: z.number().min(0).optional(),
  budgetMax: z.number().min(0).optional(),
  preferredMarkets: z.array(z.string()).optional(),
  propertyTypes: z.array(z.string()).optional(),
  roiTarget: z.number().min(0).max(100).optional(),
  financingType: z.string().optional(),
  timelineToClose: z.string().optional(),
  companyName: z.string().optional(),
});

const wholesalerOnboardingSchema = z.object({
  primaryMarkets: z.array(z.string()).optional(),
  dealTypes: z.array(z.string()).optional(),
  monthlyDealVolume: z.string().optional(),
  companyName: z.string().optional(),
});

const agentOnboardingSchema = z.object({
  licenseNumber: z.string().optional(),
  brokerageName: z.string().optional(),
  marketsServed: z.array(z.string()).optional(),
  typicalClients: z.array(z.string()).optional(),
});

const consentSchema = z.object({
  consent: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and privacy policy'
  })
});

type BasicSignUpData = z.infer<typeof basicSignUpSchema>;
type BuyerOnboardingData = z.infer<typeof buyerOnboardingSchema>;
type WholesalerOnboardingData = z.infer<typeof wholesalerOnboardingSchema>;
type AgentOnboardingData = z.infer<typeof agentOnboardingSchema>;
type ConsentData = z.infer<typeof consentSchema>;

interface EnhancedSignUpFormProps {
  onSuccess?: () => void;
}

export const EnhancedSignUpForm: React.FC<EnhancedSignUpFormProps> = ({ onSuccess }) => {
  const { signUp, setActive } = useSignUp();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<any>({});
  const { toast } = useToast();

  // Step 1: Basic signup form
  const basicForm = useForm<BasicSignUpData>({
    resolver: zodResolver(basicSignUpSchema),
  });

  // Step 2-4: Role-specific onboarding forms
  const buyerForm = useForm<BuyerOnboardingData>({
    resolver: zodResolver(buyerOnboardingSchema),
  });

  const wholesalerForm = useForm<WholesalerOnboardingData>({
    resolver: zodResolver(wholesalerOnboardingSchema),
  });

  const agentForm = useForm<AgentOnboardingData>({
    resolver: zodResolver(agentOnboardingSchema),
  });

  const consentForm = useForm<ConsentData>({
    resolver: zodResolver(consentSchema),
  });

  const handleBasicSubmit = async (data: BasicSignUpData) => {
    if (!signUp) {
      toast({
        title: "Service Unavailable",
        description: "Authentication service is not available. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Enhanced email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Enhanced password validation
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(data.password)) {
        toast({
          title: "Weak Password",
          description: "Password must contain at least 8 characters with uppercase, lowercase, number, and special character.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Sanitize input data
      const sanitizedData = {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: data.role,
        phone: data.phone?.trim()
      };

      // Create user with Clerk - with proper email redirect
      const signUpAttempt = await signUp.create({
        emailAddress: sanitizedData.email,
        password: sanitizedData.password,
      });

      let result = signUpAttempt;

      // Handle email verification requirement
      if (signUpAttempt.status === 'missing_requirements') {
        console.log('Missing requirements:', signUpAttempt.missingFields);
        
        // Try to prepare email verification with proper redirect
        if (signUpAttempt.missingFields?.includes('email_address')) {
          try {
            await signUp.prepareEmailAddressVerification({
              strategy: 'email_code'
            });
            
            toast({
              title: "Check Your Email",
              description: "We've sent you a verification code. Please check your email (including spam folder) and enter the code below.",
            });
            
            // Show verification step instead of failing
            setCurrentStep(1.5); // Add verification step
            setUserData({ email: sanitizedData.email });
            setIsLoading(false);
            return;
          } catch (emailError) {
            console.error('Email verification preparation failed:', emailError);
            
            // If email verification fails, try to continue without it for development
            toast({
              title: "Email Verification Issue",
              description: "There's an issue with email verification. Please contact support or try again later.",
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }
        }
      }

      // If the initial create was successful but not complete, try to update with additional details
      if (signUpAttempt.createdUserId && signUpAttempt.status !== 'complete') {
        try {
          const updateResult = await signUp.update({
            firstName: sanitizedData.firstName,
            lastName: sanitizedData.lastName,
            unsafeMetadata: {
              role: sanitizedData.role,
              phone: sanitizedData.phone,
              signupTimestamp: new Date().toISOString()
            }
          });
          
          result = updateResult;
        } catch (updateError) {
          console.warn('Could not update user details:', updateError);
          // Continue with basic account - don't fail the signup
        }
      }

      // Handle the final result
      if (result.status === 'complete' && result.createdSessionId) {
        // Set the session active
        await setActive({ 
          session: result.createdSessionId,
          beforeEmit: () => {
            console.log('Setting active session for user:', result.createdUserId);
          }
        });

        // Store profile data in Supabase
        const profileData = {
          clerk_id: result.createdUserId!,
          email: sanitizedData.email,
          first_name: sanitizedData.firstName,
          last_name: sanitizedData.lastName,
          phone: sanitizedData.phone || null,
          user_role: sanitizedData.role,
          onboarding_step: 2,
          role: 'user',
          created_at: new Date().toISOString(),
          has_completed_onboarding: false
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profileData, {
            onConflict: 'clerk_id'
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          
          toast({
            title: "Profile Setup Warning",
            description: "Account created successfully, but additional setup is needed. You can complete this later.",
            variant: "destructive"
          });
          
          // Continue with the flow anyway
          setUserData({ ...sanitizedData, clerkId: result.createdUserId });
          setCurrentStep(2);
        } else {
          // Success - proceed to next step
          toast({
            title: "Account Created!",
            description: "Welcome to dealflow.ai. Let's customize your experience.",
          });
          
          setUserData({ ...sanitizedData, clerkId: result.createdUserId });
          setCurrentStep(2);
        }
      } else if (result.status === 'missing_requirements') {
        // Handle specific missing requirements
        toast({
          title: "Additional Information Required",
          description: "Please check your email for verification instructions.",
        });
        setIsLoading(false);
      } else {
        // Handle other statuses
        toast({
          title: "Verification Required",
          description: "Please check your email for verification instructions.",
        });
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Comprehensive sign up error:', error);
      
      // Enhanced error handling with specific messages
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
            errorTitle = "Insecure Password";
            errorMessage = "This password has been found in data breaches. Please choose a different password.";
            break;
          case 'form_password_too_common':
            errorTitle = "Common Password";
            errorMessage = "This password is too common. Please choose a more unique password.";
            break;
          case 'form_username_invalid':
            errorTitle = "Invalid Email";
            errorMessage = "Please enter a valid email address.";
            break;
          default:
            errorMessage = firstError.longMessage || firstError.message || errorMessage;
        }
      } else if (error.message) {
        errorMessage = error.message;
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

  const handleOnboardingSubmit = async (data: any) => {
    if (!userData.clerkId) {
      toast({
        title: "Session Error",
        description: "Your session has expired. Please start over.",
        variant: "destructive"
      });
      setCurrentStep(1);
      return;
    }

    setIsLoading(true);
    try {
      // Sanitize and validate onboarding data
      const sanitizedOnboardingData = Object.keys(data).reduce((acc, key) => {
        const value = data[key];
        if (value !== null && value !== undefined) {
          // Handle arrays
          if (Array.isArray(value)) {
            acc[key] = value.filter(item => item && item.trim && item.trim().length > 0);
          }
          // Handle strings
          else if (typeof value === 'string') {
            acc[key] = value.trim();
          }
          // Handle numbers and booleans
          else {
            acc[key] = value;
          }
        }
        return acc;
      }, {} as any);

      const updateData = {
        ...sanitizedOnboardingData,
        onboarding_step: currentStep + 1,
        onboarding_completed: currentStep >= 3,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('clerk_id', userData.clerkId);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Update Failed",
          description: "Could not save your information. Please try again.",
          variant: "destructive"
        });
      } else {
        setUserData({ ...userData, ...sanitizedOnboardingData });
        
        if (currentStep >= 3) {
          toast({
            title: "Welcome to dealflow.ai!",
            description: "Your account setup is complete. Let's get started!",
          });
          onSuccess?.();
        } else {
          setCurrentStep(currentStep + 1);
        }
      }
    } catch (error) {
      console.error('Onboarding update error:', error);
      toast({
        title: "Update Failed",
        description: "Something went wrong while saving your information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            step <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>
            {step < currentStep ? <Check className="w-4 h-4" /> : step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 ${
              step < currentStep ? 'bg-primary' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Create Your Free Account</CardTitle>
        <CardDescription>Join thousands of successful real estate professionals</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={basicForm.handleSubmit(handleBasicSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <div className="grid grid-cols-2 gap-4 mt-1">
              <Input
                {...basicForm.register('firstName')}
                placeholder="First name"
              />
              <Input
                {...basicForm.register('lastName')}
                placeholder="Last name"
              />
            </div>
            {(basicForm.formState.errors.firstName || basicForm.formState.errors.lastName) && (
              <p className="text-sm text-destructive mt-1">
                {basicForm.formState.errors.firstName?.message || basicForm.formState.errors.lastName?.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              type="email"
              {...basicForm.register('email')}
              className="mt-1"
              placeholder="your@email.com"
            />
            {basicForm.formState.errors.email && (
              <p className="text-sm text-destructive mt-1">{basicForm.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              {...basicForm.register('password')}
              className="mt-1"
              placeholder="Create a secure password"
            />
            <div className="mt-2 text-xs text-muted-foreground space-y-1">
              <p>Password must contain:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>At least 8 characters</li>
                <li>One uppercase letter (A-Z)</li>
                <li>One lowercase letter (a-z)</li>
                <li>One number (0-9)</li>
                <li>One special character (@$!%*?&)</li>
              </ul>
            </div>
            {basicForm.formState.errors.password && (
              <p className="text-sm text-destructive mt-1">{basicForm.formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select onValueChange={(value) => basicForm.setValue('role', value as any)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">Buyer</SelectItem>
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
            <Label htmlFor="phone">Phone Number (Optional)</Label>
            <Input
              type="tel"
              {...basicForm.register('phone')}
              className="mt-1"
              placeholder="(555) 123-4567"
            />
            {basicForm.formState.errors.phone && (
              <p className="text-sm text-destructive mt-1">{basicForm.formState.errors.phone.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );

  const renderBuyerOnboarding = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Let's customize your buying criteria</CardTitle>
        <CardDescription>Help us find the perfect deals for you</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={buyerForm.handleSubmit(handleOnboardingSubmit)} className="space-y-6">
          <div>
            <Label>Budget Range</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <Label className="text-sm text-muted-foreground">Min Budget</Label>
                <Input
                  type="number"
                  placeholder="$50,000"
                  onChange={(e) => buyerForm.setValue('budgetMin', parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Max Budget</Label>
                <Input
                  type="number"
                  placeholder="$500,000"
                  onChange={(e) => buyerForm.setValue('budgetMax', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Property Types</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {['Single Family', 'Multi Family', 'Vacant Land', 'Commercial'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={type}
                    onCheckedChange={(checked) => {
                      const current = buyerForm.getValues('propertyTypes') || [];
                      if (checked) {
                        buyerForm.setValue('propertyTypes', [...current, type]);
                      } else {
                        buyerForm.setValue('propertyTypes', current.filter(t => t !== type));
                      }
                    }}
                  />
                  <Label htmlFor={type} className="text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Financing Type</Label>
            <Select onValueChange={(value) => buyerForm.setValue('financingType', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select financing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="hard_money">Hard Money</SelectItem>
                <SelectItem value="conventional">Conventional</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Timeline to Close</Label>
            <Select onValueChange={(value) => buyerForm.setValue('timelineToClose', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7_days">7 days</SelectItem>
                <SelectItem value="14_days">14 days</SelectItem>
                <SelectItem value="30_days">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Company Name (Optional)</Label>
            <Input
              {...buyerForm.register('companyName')}
              className="mt-2"
              placeholder="Your company name"
            />
          </div>

          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setCurrentStep(1)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderWholesalerOnboarding = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Tell us about your wholesaling activity</CardTitle>
        <CardDescription>Help us optimize your deal flow</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={wholesalerForm.handleSubmit(handleOnboardingSubmit)} className="space-y-6">
          <div>
            <Label>Deal Types</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {['Assignment', 'Fix & Flip', 'Buy & Hold', 'Land'].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox 
                    id={type}
                    onCheckedChange={(checked) => {
                      const current = wholesalerForm.getValues('dealTypes') || [];
                      if (checked) {
                        wholesalerForm.setValue('dealTypes', [...current, type]);
                      } else {
                        wholesalerForm.setValue('dealTypes', current.filter(t => t !== type));
                      }
                    }}
                  />
                  <Label htmlFor={type} className="text-sm">{type}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Monthly Deal Volume</Label>
            <Select onValueChange={(value) => wholesalerForm.setValue('monthlyDealVolume', value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select volume" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-2">1-2 deals</SelectItem>
                <SelectItem value="3-5">3-5 deals</SelectItem>
                <SelectItem value="6-10">6-10 deals</SelectItem>
                <SelectItem value="10+">10+ deals</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Company / LLC Name</Label>
            <Input
              {...wholesalerForm.register('companyName')}
              className="mt-2"
              placeholder="Your company name"
            />
          </div>

          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setCurrentStep(1)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderAgentOnboarding = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Brokerage & Market Info</CardTitle>
        <CardDescription>Tell us about your real estate practice</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={agentForm.handleSubmit(handleOnboardingSubmit)} className="space-y-6">
          <div>
            <Label>License Number</Label>
            <Input
              {...agentForm.register('licenseNumber')}
              className="mt-2"
              placeholder="Your license number"
            />
          </div>

          <div>
            <Label>Brokerage Name</Label>
            <Input
              {...agentForm.register('brokerageName')}
              className="mt-2"
              placeholder="Your brokerage"
            />
          </div>

          <div>
            <Label>Typical Clients</Label>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {['Retail Buyers', 'Investors', 'Institutional', 'First-time Buyers'].map((client) => (
                <div key={client} className="flex items-center space-x-2">
                  <Checkbox 
                    id={client}
                    onCheckedChange={(checked) => {
                      const current = agentForm.getValues('typicalClients') || [];
                      if (checked) {
                        agentForm.setValue('typicalClients', [...current, client]);
                      } else {
                        agentForm.setValue('typicalClients', current.filter(c => c !== client));
                      }
                    }}
                  />
                  <Label htmlFor={client} className="text-sm">{client}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setCurrentStep(1)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderConsentStep = () => (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>You're All Set!</CardTitle>
        <CardDescription>Just one final step to complete your registration</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={consentForm.handleSubmit((data) => handleOnboardingSubmit({ consent_given: data.consent }))} className="space-y-6">
          <div className="flex items-start space-x-2">
            <Checkbox 
              id="consent"
              onCheckedChange={(checked) => consentForm.setValue('consent', !!checked)}
            />
            <Label htmlFor="consent" className="text-sm leading-relaxed">
              I agree to the <span className="text-primary cursor-pointer hover:underline">Terms of Service</span> and{' '}
              <span className="text-primary cursor-pointer hover:underline">Privacy Policy</span> and consent to receive communication via email, phone, and SMS.
            </Label>
          </div>
          {consentForm.formState.errors.consent && (
            <p className="text-sm text-destructive">{consentForm.formState.errors.consent.message}</p>
          )}

          <div className="flex gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                'Enter My Dashboard'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );

  const renderEmailVerification = () => {
    const [verificationCode, setVerificationCode] = useState('');

    const handleVerificationSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!signUp) return;
      
      setIsLoading(true);
      try {
        const result = await signUp.attemptEmailAddressVerification({
          code: verificationCode,
        });

        if (result.status === 'complete' && result.createdSessionId) {
          await setActive({ session: result.createdSessionId });
          
          toast({
            title: "Email Verified!",
            description: "Your account has been created successfully.",
          });
          
          // Continue with profile creation
          setCurrentStep(2);
        }
      } catch (error: any) {
        console.error('Verification error:', error);
        toast({
          title: "Verification Failed",
          description: "Invalid code. Please check your email and try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a verification code to {userData.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerificationSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Verification Code</Label>
              <Input
                type="text"
                id="code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="mt-1 text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading || verificationCode.length < 6}
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
            
            <div className="text-center text-sm text-muted-foreground">
              Didn't receive the code? Check your spam folder or{' '}
              <Button
                type="button"
                variant="link"
                className="p-0 h-auto text-primary"
                onClick={() => {
                  signUp?.prepareEmailAddressVerification({ strategy: 'email_code' });
                  toast({
                    title: "Code Resent",
                    description: "We've sent you a new verification code.",
                  });
                }}
              >
                resend code
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 1.5:
        return renderEmailVerification();
      case 2:
        if (userData.role === 'buyer') return renderBuyerOnboarding();
        if (userData.role === 'wholesaler') return renderWholesalerOnboarding();
        if (userData.role === 'real_estate_agent') return renderAgentOnboarding();
        return renderConsentStep();
      case 3:
        return renderConsentStep();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {renderStepIndicator()}
      {renderCurrentStep()}
      
      <div className="text-center text-sm text-muted-foreground mt-6">
        Already have an account?{' '}
        <span className="text-primary cursor-pointer hover:underline">Sign in</span>
      </div>
    </div>
  );
};