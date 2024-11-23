import { useUser } from "@clerk/nextjs";
import React from "react";

function SyncUserWithConvex() {
  const { user } = useUser();

  // update user

  return <div>SyncUserWithConvex</div>;
}

export default SyncUserWithConvex;
