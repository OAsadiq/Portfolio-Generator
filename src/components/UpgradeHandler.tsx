/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const UpgradeHandler = () => {
  const { user } = useAuth();
  const hasTriggeredUpgrade = useRef(false);

  useEffect(() => {
    const triggerUpgrade = async () => {
      // Only run once and only if user is logged in
      if (!user || hasTriggeredUpgrade.current) return;

      // Check if there's a pending upgrade
      const pendingUpgrade = sessionStorage.getItem('pendingUpgrade');
      if (pendingUpgrade !== 'true') return;

      // Mark as triggered to prevent double-execution
      hasTriggeredUpgrade.current = true;
      
      // Clear the flag immediately
      sessionStorage.removeItem('pendingUpgrade');

      try {
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/stripe/actions`;
        const priceId = import.meta.env.VITE_STRIPE_PRICE_ID_PRO;
        
        if (!priceId) {
          throw new Error('Stripe Price ID is not configured');
        }
        
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: 'create-checkout-session',
            priceId: priceId,
            userId: user.id,
            userEmail: user.email,
          }),
        });

        console.log('🔵 Response status:', res.status);

        if (!res.ok) {
          const errorText = await res.text();
          let errorMessage = "Failed to start checkout";
          
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          
          throw new Error(errorMessage);
        }

        const data = await res.json();

        if (data.url) {
          console.log('✅ Redirecting to Stripe checkout');
          window.location.href = data.url;
        } else {
          throw new Error("No checkout URL returned");
        }
      } catch (err: any) {
        console.error("Auto-upgrade error:", err);
        // Let the normal upgrade button handle it with error display
      }
    };

    triggerUpgrade();
  }, [user]);

  return null; // This component doesn't render anything
};

export default UpgradeHandler;