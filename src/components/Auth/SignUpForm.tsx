import React, { useState } from 'react';
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
import { CheckCircle, Loader2, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  selectedPlan: z.string().min(1, 'Please select a plan'),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const plans = [
  {
    id: 'starter',
    name: "Entry / Free",
    price: 0,
    originalPrice: 0,
    description: "25 non-expiring tokens, no credit card required",
    features: [
      "25 non-expiring tokens included",
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
    description: "$49/month recurring with 100 tokens every month",
    features: [
      "100 tokens included every month",
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
      selectedPlan: 'pro'
    }
  });

  const watchedPlan = watch('selectedPlan');

  const onSubmit = async (data: SignUpFormData) => {
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

        // Store additional profile data in Supabase
        const { error } = await supabase
          .from('profiles')
          .upsert({
            clerk_id: result.createdUserId!,
            email: data.email,
            first_name: data.firstName,
            last_name: data.lastName,
            selected_plan: data.selectedPlan,
            role: 'user'
          });

        if (error) {
          console.error('Error saving profile:', error);
          toast({
            title: "Profile Error",
            description: "Account created but profile data couldn't be saved. Please contact support.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Welcome to DealFlow AI!",
            description: "Your account has been created successfully.",
          });
          onSuccess?.();
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

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setValue('selectedPlan', planId);
  };

  const selectedPlanData = plans.find(p => p.id === watchedPlan);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Create Your Account</h2>
        <p className="text-muted-foreground">Join thousands of successful wholesalers</p>
      </div>

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
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            className="mt-1"
            placeholder="Create a password"
          />
          {errors.password && (
            <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
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
            `Get Started Free - ${selectedPlanData?.name}`
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        By signing up, you agree to our{" "}
        <Link to="/terms" className="underline hover:text-primary">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="underline hover:text-primary">
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
};