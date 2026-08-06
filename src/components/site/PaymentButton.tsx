import { Lock } from "lucide-react";

import { getPaymentLink } from "@/config/payment-links";
import { cn } from "@/lib/utils";

interface PaymentButtonProps {
  /** Catalog slug used to resolve the PayFast LIVE payment link. */
  slug: string;
  /** Accessible product name, used in the aria-label. */
  name: string;
  label?: string;
  className?: string;
}

/**
 * Buy Now button that opens the service's PayFast LIVE hosted payment page.
 * Renders nothing when the slug has no mapped payment link.
 */
export function PaymentButton({ slug, name, label = "Buy Now", className }: PaymentButtonProps) {
  const href = getPaymentLink(slug);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Buy Now — ${name} (secure PayFast payment)`}
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-full",
        "bg-[#F59E0B] px-4 text-sm font-bold text-white shadow-lg shadow-[#F59E0B]/20",
        "transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#D97706] hover:shadow-xl",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F59E0B]",
        className,
      )}
    >
      <Lock aria-hidden className="h-4 w-4" /> {label}
    </a>
  );
}
