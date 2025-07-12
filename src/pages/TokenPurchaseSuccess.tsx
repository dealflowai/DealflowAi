import { useEffect } from 'react';
import { useTokens } from '@/contexts/TokenContext';
import { toast } from '@/hooks/use-toast';

export default function TokenPurchaseSuccess() {
  const { refreshTokenBalance } = useTokens();

  useEffect(() => {
    // Refresh token balance
    refreshTokenBalance();
    
    // Set success flag for modal to close
    localStorage.setItem('token_purchase_success', 'true');
    
    // Show success message
    toast({
      title: "Tokens Added Successfully!",
      description: "Your tokens have been added to your account.",
    });

    // Redirect to dashboard after a short delay
    setTimeout(() => {
      window.close(); // Close the payment window
    }, 2000);
  }, [refreshTokenBalance]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
        <p className="text-gray-600">Your tokens have been added to your account.</p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-sm text-gray-500">Redirecting...</p>
      </div>
    </div>
  );
}