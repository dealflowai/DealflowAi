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

// Step 1: Basic signup schema
const basicSignUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['buyer', 'wholesaler', 'real_estate_agent', 'other'], {
    required_error: 'Please select your role'
  }),
  phone: z.string().optional(),
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
    if (!signUp) return;

    setIsLoading(true);
    try {
      // Create user with Clerk
      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (result.status === 'complete') {
        // Set the session active
        await setActive({ session: result.createdSessionId });

        // Store basic profile data
        const { error } = await supabase
          .from('profiles')
          .upsert({
            clerk_id: result.createdUserId!,
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            user_role: data.role,
            onboarding_step: 2,
            role: 'user'
          });

        if (error) {
          console.error('Error saving profile:', error);
          toast({
            title: "Profile Error",
            description: "Account created but profile data couldn't be saved.",
            variant: "destructive"
          });
        } else {
          setUserData({ ...data, clerkId: result.createdUserId });
          setCurrentStep(2);
        }
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Sign Up Failed",
        description: error.errors?.[0]?.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          onboarding_step: currentStep + 1,
          onboarding_completed: currentStep === 4
        })
        .eq('clerk_id', userData.clerkId);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Update Failed",
          description: "Could not save your information. Please try again.",
          variant: "destructive"
        });
      } else {
        setUserData({ ...userData, ...data });
        if (currentStep === 4) {
          toast({
            title: "Welcome to dealflow.ai!",
            description: "Your account setup is complete.",
          });
          onSuccess?.();
        } else {
          setCurrentStep(currentStep + 1);
        }
      }
    } catch (error) {
      console.error('Update error:', error);
      toast({
        title: "Update Failed",
        description: "Something went wrong. Please try again.",
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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
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