"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Custom hook for smart auto-scroll behavior
 * 
 * Features:
 * - Auto-scroll to bottom when new messages arrive
 * - Detect if user has scrolled up
 * - Show "New Messages" button when user is scrolled up
 * - Smooth scroll to bottom on button click
 * 
 * Usage:
 * const { scrollRef, shouldAutoScroll, scrollToBottom, showScrollButton } = useAutoScroll(messages);
 */
export function useAutoScroll<T>(dependencies: T[]) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback((smooth = true) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
    setShouldAutoScroll(true);
    setShowScrollButton(false);
  }, []);

  // Auto-scroll when new messages arrive (if user hasn't scrolled up)
  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom(false);
    } else {
      setShowScrollButton(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  // Detect user scroll
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    setShouldAutoScroll(isNearBottom);
    setShowScrollButton(!isNearBottom);
  }, []);

  useEffect(() => {
    const div = scrollRef.current;
    if (!div) return;

    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return {
    scrollRef,
    shouldAutoScroll,
    scrollToBottom,
    showScrollButton,
  };
}
