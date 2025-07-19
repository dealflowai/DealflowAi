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
  onSwitchToSignUp?: () => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onSuccess, onSwitchToSignUp }) => {
  const { signIn, setActive } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const [resetMode, setResetMode] = useState<'request' | 'verify' | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  // Schema for password reset
  const resetSchema = z.object({
    code: z.string().min(6, 'Code must be at least 6 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
  }).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  type ResetFormData = z.infer<typeof resetSchema>;

  // Form for password reset
  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema)
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

  const handlePasswordReset = async (email: string) => {
    if (!signIn) return;
    
    setIsLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      
      setResetEmail(email);
      setResetMode('verify');
      toast({
        title: "Reset Email Sent",
        description: "Check your email for the reset code.",
      });
    } catch (error: any) {
      let errorMessage = "Failed to send reset email. Please try again.";
      
      if (error.errors && error.errors.length > 0) {
        const firstError = error.errors[0];
        if (firstError.code === 'form_identifier_not_found') {
          errorMessage = "No account found with this email address.";
        } else {
          errorMessage = firstError.longMessage || firstError.message || errorMessage;
        }
      }
      
      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCompletion = async (data: ResetFormData) => {
    if (!signIn) return;
    
    setIsLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: data.code,
        password: data.password,
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        toast({
          title: "Password Reset Successful",
          description: "Your password has been reset and you're now signed in.",
        });
        setResetMode(null);
        onSuccess?.();
      }
    } catch (error: any) {
      let errorMessage = "Failed to reset password. Please try again.";
      
      if (error.errors && error.errors.length > 0) {
        const firstError = error.errors[0];
        errorMessage = firstError.longMessage || firstError.message || errorMessage;
      }
      
      toast({
        title: "Reset Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (resetMode === 'verify') {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Reset Your Password</h2>
          <p className="text-muted-foreground">Enter the code sent to {resetEmail} and your new password</p>
        </div>

        <form onSubmit={resetForm.handleSubmit(handleResetCompletion)} className="space-y-4">
          <div>
            <Label htmlFor="reset-code">Reset Code</Label>
            <Input
              id="reset-code"
              type="text"
              {...resetForm.register('code')}
              className="mt-1"
              placeholder="Enter the 6-digit code"
            />
            {resetForm.formState.errors.code && (
              <p className="text-sm text-destructive mt-1">{resetForm.formState.errors.code.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              {...resetForm.register('password')}
              className="mt-1"
              placeholder="Enter your new password"
            />
            {resetForm.formState.errors.password && (
              <p className="text-sm text-destructive mt-1">{resetForm.formState.errors.password.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              {...resetForm.register('confirmPassword')}
              className="mt-1"
              placeholder="Confirm your new password"
            />
            {resetForm.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive mt-1">{resetForm.formState.errors.confirmPassword.message}</p>
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
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>

        <div className="text-center">
          <button 
            type="button" 
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={() => {
              setResetMode(null);
              resetForm.reset();
            }}
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

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

      <div className="text-center space-y-3">
        <button 
          type="button" 
          className="text-sm text-primary hover:underline"
          onClick={async () => {
            const email = prompt("Enter your email address to reset your password:");
            if (email) {
              await handlePasswordReset(email);
            }
          }}
        >
          Forgot your password?
        </button>
        
        <div className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <button 
            type="button"
            className="text-primary hover:underline font-medium"
            onClick={() => onSwitchToSignUp?.()}
          >
            Sign up here
          </button>
        </div>
      </div>
    </div>
  );
};