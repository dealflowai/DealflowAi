
import React from 'react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper = ({ children }: AuthWrapperProps) => {
  return <>{children}</>;
};

export default AuthWrapper;
