
import React from 'react';
import { PhoneVerificationWrapper } from './PhoneVerificationWrapper';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  // Skip phone verification for now - only use email verification
  return <>{children}</>;
};

export default AuthWrapper;
