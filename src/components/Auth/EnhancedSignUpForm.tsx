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
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// Simple signup schema with relaxed password requirements
const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['buyer', 'wholesaler', 'real_estate_agent', 'other'], {
    required_error: 'Please select your role'
  }),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  consent: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and privacy policy'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpData = z.infer<typeof signUpSchema>;

interface EnhancedSignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export const EnhancedSignUpForm: React.FC<EnhancedSignUpFormProps> = ({ onSuccess, onSwitchToSignIn }) => {
  const { signUp, setActive } = useSignUp();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const form = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange'
  });

  const handleSignup = async (data: SignUpData) => {
    if (!signUp) return;
    
    setIsLoading(true);
    
    try {
      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        await createUserProfile(result.createdUserId!, data);
        
        toast({
          title: "Account Created!",
          description: "Welcome to DealFlow AI!",
        });
        
        onSuccess?.();
      } else {
        toast({
          title: "Almost There!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = "An error occurred during signup. Please try again.";
      
      if (error.errors && error.errors.length > 0) {
        const firstError = error.errors[0];
        
        switch (firstError.code) {
          case 'form_identifier_exists':
            errorMessage = "An account with this email already exists. Please sign in instead.";
            break;
          case 'form_password_pwned':
            errorMessage = "This password has been found in a data breach. Please choose a different password.";
            break;
          default:
            errorMessage = firstError.longMessage || firstError.message || errorMessage;
        }
      }
      
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createUserProfile = async (clerkUserId: string, userData: SignUpData) => {
    try {
      const profileData = {
        clerk_id: clerkUserId,
        email: userData.email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone: userData.phone,
        user_role: userData.role,
        role: 'user',
        has_completed_onboarding: true,
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
      }
    } catch (error) {
      console.error('Profile creation error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Create Your Account</CardTitle>
        <CardDescription>
          Join thousands of investors finding profitable deals with AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                {...form.register('firstName')}
                className="mt-1"
                placeholder="John"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.firstName.message}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                {...form.register('lastName')}
                className="mt-1"
                placeholder="Doe"
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              className="mt-1"
              placeholder="john@example.com"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...form.register('password')}
                className="mt-1 pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                {...form.register('confirmPassword')}
                className="mt-1 pr-10"
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              {...form.register('phone')}
              className="mt-1"
              placeholder="+1 (555) 123-4567"
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="role">Your Role</Label>
            <Select onValueChange={(value) => form.setValue('role', value as any)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">Real Estate Buyer/Investor</SelectItem>
                <SelectItem value="wholesaler">Wholesaler</SelectItem>
                <SelectItem value="real_estate_agent">Real Estate Agent</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.role && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.role.message}</p>
            )}
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="consent"
              {...form.register('consent')}
              className="mt-1"
            />
            <div className="text-sm">
              <Label htmlFor="consent" className="text-sm leading-5">
                I agree to the{" "}
                <Link to="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </Label>
              {form.formState.errors.consent && (
                <p className="text-destructive mt-1">{form.formState.errors.consent.message}</p>
              )}
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
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
            <button
              type="button"
              onClick={onSwitchToSignIn}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};