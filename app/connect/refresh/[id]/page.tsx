"use client";

import { useParams } from "next/navigation";
import { useState } from "react";

export default function Refresh() {
  const params = useParams();
  const connectedAccountId = params.id as string;
  const [accountLinkCreatePending, setAccountLinkCreatePending] =
    useState(false);
  const [error, setError] = useState(false);
}
