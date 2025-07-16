
import React from 'react';
import { PhoneVerificationWrapper } from './PhoneVerificationWrapper';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  return (
    <PhoneVerificationWrapper>
      {children}
    </PhoneVerificationWrapper>
  );
};

export default AuthWrapper;
