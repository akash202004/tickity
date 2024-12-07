"use client";

import { AccountStatus } from "@/actions/getStripeConnectAcccountStatus";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function SellerDashboard() {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [accountLinkCreatePending, setAccountLinkCreatePending] =
    useState(false);
  const [error, setError] = useState(false);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(
    null
  );
  const router = useRouter();
  const { user } = useUser();
  const stripeConnectId = useQuery(api.users.getUserStripeConnectId, {
    userId: user?.id || "",
  });
  const isReadyToAcceptPayments =
    accountStatus?.isActive && accountStatus?.payoutsEnabled;

  return <div>hi</div>;
}

export default SellerDashboard;
