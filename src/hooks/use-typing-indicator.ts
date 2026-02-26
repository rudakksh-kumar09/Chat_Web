"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useEffect, useRef, useCallback } from "react";

/**
 * Custom hook to manage typing indicators
 * 
 * Usage:
 * const { startTyping, stopTyping } = useTypingIndicator(conversationId, userId);
 * 
 * Call startTyping() when user types
 * Will auto-send updates every second while typing
 * Call stopTyping() when done
 */
export function useTypingIndicator(
  conversationId: Id<"conversations"> | undefined,
  userId: Id<"users"> | undefined
) {
  const setTyping = useMutation(api.typing.setTyping);
  const stopTypingMutation = useMutation(api.typing.stopTyping);
  
  const isTypingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startTyping = useCallback(() => {
    if (!conversationId || !userId) return;

    isTypingRef.current = true;

    // Send immediately
    setTyping({ conversationId, userId });

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Send update every second while typing
    intervalRef.current = setInterval(() => {
      if (isTypingRef.current) {
        setTyping({ conversationId, userId });
      }
    }, 1000);
  }, [conversationId, userId, setTyping]);

  const stopTyping = useCallback(() => {
    if (!conversationId || !userId) return;

    isTypingRef.current = false;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    stopTypingMutation({ conversationId, userId });
  }, [conversationId, userId, stopTypingMutation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTyping();
    };
  }, [stopTyping]);

  return { startTyping, stopTyping };
}
