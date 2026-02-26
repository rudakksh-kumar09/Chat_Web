"use client";

import { useState, FormEvent, KeyboardEvent } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, AlertCircle, RefreshCw } from "lucide-react";
import { useTypingIndicator } from "@/hooks/use-typing-indicator";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  conversationId: Id<"conversations">;
  currentUserId: Id<"users">;
}

/**
 * Message Input Component
 * 
 * Features:
 * - Text input with send button
 * - Send on Enter (Shift+Enter for new line)
 * - Trigger typing indicator while typing
 * - Stop typing indicator on send or blur
 * - Disable while sending
 */
export function MessageInput({ conversationId, currentUserId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);

  const sendMessage = useMutation(api.messages.sendMessage);
  const { startTyping, stopTyping } = useTypingIndicator(conversationId, currentUserId);

  const sendMessageWithRetry = async (messageText: string, retryCount = 0) => {
    const maxRetries = 2;
    
    try {
      await sendMessage({
        conversationId,
        senderId: currentUserId,
        body: messageText,
      });
      
      setError(null);
      setFailedMessage(null);
      return true;
    } catch (err) {
      console.error("Failed to send message:", err);
      
      if (retryCount < maxRetries) {
        // Automatic retry after 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
        return sendMessageWithRetry(messageText, retryCount + 1);
      } else {
        // Max retries exceeded
        setError("Failed to send message");
        setFailedMessage(messageText);
        return false;
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSending) return;

    setIsSending(true);
    setError(null);
    stopTyping();

    const success = await sendMessageWithRetry(trimmedMessage);

    if (success) {
      setMessage("");
    }
    
    setIsSending(false);
  };

  const handleRetry = async () => {
    if (!failedMessage) return;
    
    setIsSending(true);
    setError(null);
    
    const success = await sendMessageWithRetry(failedMessage);
    
    if (success) {
      setMessage("");
    }
    
    setIsSending(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (value: string) => {
    setMessage(value);
    
    if (value.trim().length > 0) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  return (
    <div className="border-t">
      {/* Error message with retry */}
      {error && failedMessage && (
        <div className="flex items-center justify-between gap-2 bg-destructive/10 px-4 py-2 text-sm">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>{error}: &quot;{failedMessage}&quot;</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={isSending}
            className="h-7 gap-1"
          >
            <RefreshCw className={cn("h-3 w-3", isSending && "animate-spin")} />
            Retry
          </Button>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4">
        <Input
          value={message}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={stopTyping}
          placeholder="Type a message..."
          disabled={isSending}
          className="flex-1"
          autoComplete="off"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || isSending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
