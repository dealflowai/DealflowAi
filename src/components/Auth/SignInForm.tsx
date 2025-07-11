import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSignIn } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Enhanced signin schema with better validation
const signInSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must be less than 100 characters')
    .toLowerCase(),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password is too long'),
});

type SignInFormData = z.infer<typeof signInSchema>;

interface SignInFormProps {
  onSuccess?: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSuccess }) => {
  const { signIn, setActive } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    if (!signIn) {
      toast({
        title: "Service Unavailable",
        description: "Authentication service is not available. Please try again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Sanitize input data
      const sanitizedData = {
        email: data.email.toLowerCase().trim(),
        password: data.password
      };

      // Enhanced email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(sanitizedData.email)) {
        toast({
          title: "Invalid Email",
          description: "Please enter a valid email address.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      const result = await signIn.create({
        identifier: sanitizedData.email,
        password: sanitizedData.password,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ 
          session: result.createdSessionId,
          beforeEmit: () => {
            console.log('User signed in successfully');
          }
        });
        
        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
        
        onSuccess?.();
      } else if (result.status === 'needs_identifier') {
        toast({
          title: "Account Not Found",
          description: "No account found with this email address. Please check your email or sign up.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sign In Failed",
          description: "Unable to complete sign in. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('Comprehensive sign in error:', error);
      
      // Enhanced error handling with specific messages
      let errorMessage = "Invalid email or password. Please try again.";
      let errorTitle = "Sign In Failed";
      
      if (error.errors && error.errors.length > 0) {
        const firstError = error.errors[0];
        
        switch (firstError.code) {
          case 'form_identifier_not_found':
            errorTitle = "Account Not Found";
            errorMessage = "No account found with this email address. Please check your email or sign up.";
            break;
          case 'form_password_incorrect':
            errorTitle = "Incorrect Password";
            errorMessage = "The password you entered is incorrect. Please try again.";
            break;
          case 'too_many_requests':
            errorTitle = "Too Many Attempts";
            errorMessage = "Too many sign-in attempts. Please wait a few minutes before trying again.";
            break;
          case 'session_exists':
            errorTitle = "Already Signed In";
            errorMessage = "You are already signed in. Redirecting to dashboard.";
            onSuccess?.();
            return;
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

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Welcome Back</h2>
        <p className="text-muted-foreground">Sign in to access your AI-powered deal flow dashboard</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            placeholder="Enter your password"
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
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="text-center">
        <button 
          type="button" 
          className="text-sm text-primary hover:underline"
          onClick={() => {
            toast({
              title: "Password Reset",
              description: "Please contact support to reset your password.",
            });
          }}
        >
          Forgot your password?
        </button>
      </div>
    </div>
  );
};