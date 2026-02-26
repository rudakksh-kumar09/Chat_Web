"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateGroupDialogProps {
  currentUserId: Id<"users">;
}

/**
 * Create Group Dialog Component
 * 
 * Features:
 * - Select multiple users to add to group
 * - Set group name
 * - Minimum 2 members (plus creator)
 */
export function CreateGroupDialog({ currentUserId }: CreateGroupDialogProps) {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Id<"users">[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();

  const users = useQuery(api.users.listUsers, {
    currentUserId,
  });

  const createGroup = useMutation(api.conversations.createGroup);

  const toggleUser = (userId: Id<"users">) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreate = async () => {
    if (selectedUserIds.length < 1 || !groupName.trim()) return;

    setIsCreating(true);
    try {
      const conversationId = await createGroup({
        name: groupName,
        memberIds: selectedUserIds,
        creatorId: currentUserId,
      });

      // Reset and close
      setGroupName("");
      setSelectedUserIds([]);
      setOpen(false);

      // Navigate to the new group
      router.push(`/conversations/${conversationId}`);
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const canCreate = groupName.trim().length > 0 && selectedUserIds.length >= 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          New Group
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Group Chat</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group Name Input */}
          <div>
            <label className="text-sm font-medium">Group Name</label>
            <Input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name..."
              className="mt-1"
            />
          </div>

          {/* Member Selection */}
          <div>
            <label className="text-sm font-medium">
              Add Members ({selectedUserIds.length} selected)
            </label>
            <ScrollArea className="mt-2 h-64 rounded-md border">
              <div className="p-2 space-y-1">
                {users?.map((user) => {
                  const isSelected = selectedUserIds.includes(user._id);

                  return (
                    <button
                      key={user._id}
                      onClick={() => toggleUser(user._id)}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg p-2 transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.imageUrl} alt={user.name} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        {user.isOnline && (
                          <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
                        )}
                      </div>

                      <div className="flex-1 text-left">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs opacity-70">{user.email}</p>
                      </div>

                      {isSelected && <Check className="h-4 w-4" />}
                    </button>
                  );
                })}

                {users?.length === 0 && (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    No users available
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!canCreate || isCreating}
            >
              {isCreating ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
