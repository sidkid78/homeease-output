
'use client';

import { Button } from '@/components/ui/button';
import { createCheckoutSession } from '@/lib/actions/payments';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

interface CheckoutButtonProps {
  leadId: string;
  priceInCents: number;
  contractorId: string;
  buttonText?: string;
}

/**
 * A client component for initiating a Stripe Checkout session.
 * Displays a button that, when clicked, calls a server action to create a checkout session
 * and redirects the user to the Stripe Checkout page.
 */
export function CheckoutButton({
  leadId,
  priceInCents,
  contractorId,
  buttonText = 'Purchase Lead',
}: CheckoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    const result = await createCheckoutSession({
      leadId,
      priceInCents,
      contractorId,
    });

    if (result.success && result.url) {
      router.push(result.url);
    } else {
      toast.error(result.error || 'Failed to initiate checkout. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <Button onClick={handleCheckout} disabled={isLoading}>
      {isLoading ? 'Processing...' : buttonText}
    </Button>
  );
}
