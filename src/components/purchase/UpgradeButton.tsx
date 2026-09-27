"use client";

import { useAuth } from "@/components/auth/AuthProvider";

interface UpgradeButtonProps {
  children?: React.ReactNode;
  className?: string;
}

/**
 * Starts Polar checkout when signed in, otherwise opens the sign-in dialog
 * (the purchase can be completed right after).
 */
export function UpgradeButton({ children, className }: UpgradeButtonProps) {
  const { entitlement, startUpgrade, openSignIn } = useAuth();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        if (entitlement.entitled) {
          startUpgrade();
        } else if (entitlement.authenticated) {
          startUpgrade();
        } else {
          openSignIn();
        }
      }}
    >
      {children ?? "Get Lifetime Access"}
    </button>
  );
}
