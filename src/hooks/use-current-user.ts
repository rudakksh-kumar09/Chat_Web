"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useRef, useState } from "react";

/**
 * Custom hook to get current user from Convex
 * Also handles presence heartbeat and auto-creates user if not synced
 */
export function useCurrentUser() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  const hasAttemptedSync = useRef(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  
  const convexUser = useQuery(
    api.users.getCurrentUser,
    clerkUser ? { clerkId: clerkUser.id } : "skip"
  );

  const upsertUser = useMutation(api.users.upsertUser);
  const heartbeat = useMutation(api.presence.heartbeat);
  const setOffline = useMutation(api.presence.setOffline);

  // Auto-create user if Clerk user exists but Convex user doesn't
  useEffect(() => {
    if (clerkUser && convexUser === null && !hasAttemptedSync.current) {
      // User is authenticated in Clerk but not in Convex database
      // Create/update the user record
      hasAttemptedSync.current = true;
      setIsCreatingUser(true);
      
      console.log("🔄 Attempting to create/sync user in Convex...", {
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        name: clerkUser.fullName ?? clerkUser.username,
      });
      
      upsertUser({
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress ?? "",
        name: clerkUser.fullName ?? clerkUser.username ?? "User",
        imageUrl: clerkUser.imageUrl,
      }).then((result) => {
        console.log("✅ User synced successfully:", result);
        setIsCreatingUser(false);
      }).catch((error) => {
        console.error("❌ Failed to sync user with Convex:", error);
        hasAttemptedSync.current = false; // Allow retry
        setIsCreatingUser(false);
      });
    }
    // Reset sync flag when clerk user changes
    if (!clerkUser) {
      hasAttemptedSync.current = false;
      setIsCreatingUser(false);
    }
  }, [clerkUser, convexUser, upsertUser]);

  // Send heartbeat every 30 seconds
  useEffect(() => {
    if (!convexUser?._id) return;

    // Initial heartbeat
    heartbeat({ userId: convexUser._id });

    // Set up interval
    const interval = setInterval(() => {
      heartbeat({ userId: convexUser._id });
    }, 30000); // 30 seconds

    // Set offline on unmount/page close
    const handleBeforeUnload = () => {
      setOffline({ userId: convexUser._id });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      setOffline({ userId: convexUser._id });
    };
  }, [convexUser?._id, heartbeat, setOffline]);

  const returnValue = {
    convexUser,
    clerkUser,
    isLoading: !isClerkLoaded || isCreatingUser || (isClerkLoaded && !!clerkUser && !convexUser),
  };
  
  console.log("📊 useCurrentUser return:", {
    hasClerkUser: !!clerkUser,
    hasConvexUser: !!convexUser,
    convexUserValue: convexUser,
    isLoading: returnValue.isLoading,
    isCreatingUser,
    isClerkLoaded,
  });
  
  return returnValue;
}
