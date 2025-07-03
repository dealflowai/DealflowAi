
import React from 'react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">DF</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  dealflow.ai
                </h1>
              </div>
              <CardTitle className="text-xl">Welcome to dealflow.ai</CardTitle>
              <CardDescription>
                AI-powered real estate wholesaling platform. Sign in to access your dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SignInButton fallbackRedirectUrl="/">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700">
                  Sign In
                </Button>
              </SignInButton>
              <SignUpButton fallbackRedirectUrl="/">
                <Button variant="outline" className="w-full">
                  Sign Up
                </Button>
              </SignUpButton>
            </CardContent>
          </Card>
        </div>
      </SignedOut>
    </>
  );
};

export default AuthWrapper;
