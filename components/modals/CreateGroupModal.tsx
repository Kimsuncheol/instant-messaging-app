"use client";

import React, { useState, useEffect } from "react";
import { Dialog, Box, Button, CircularProgress } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { subscribeToFriends, Friend } from "@/lib/friendService";
import { getUserById, UserProfile } from "@/lib/userService";
import { createGroup } from "@/lib/groupService";
import { useChatStore } from "@/store/chatStore";
import { CreateGroupHeader } from "./create-group/CreateGroupHeader";
import { CreateGroupDetails } from "./create-group/CreateGroupDetails";
import { CreateGroupMembers } from "./create-group/CreateGroupMembers";

interface CreateGroupModalProps {
  open: boolean;
  onClose: () => void;
}

type Step = "details" | "members";

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  open,
  onClose,
}) => {
  const { user: currentUser } = useAuth();
  const setSelectedChatId = useChatStore((state) => state.setSelectedChatId);
  
  const [step, setStep] = useState<Step>("details");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendProfiles, setFriendProfiles] = useState<Record<string, UserProfile>>({});
  const [creating, setCreating] = useState(false);

  // Subscribe to friends list
  useEffect(() => {
    if (!currentUser) return;
    return subscribeToFriends(currentUser.uid, setFriends);
  }, [currentUser]);

  // Load friend profiles
  useEffect(() => {
    const loadProfiles = async () => {
      const profiles: Record<string, UserProfile> = {};
      await Promise.all(
        friends.map(async (friend) => {
          const profile = await getUserById(friend.odUserId);
          if (profile) profiles[friend.odUserId] = profile;
        })
      );
      setFriendProfiles(profiles);
    };

    if (friends.length > 0) {
      loadProfiles();
    }
  }, [friends]);

  const handleToggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleNext = () => {
    if (step === "details" && name.trim()) {
      setStep("members");
    }
  };

  const handleBack = () => {
    if (step === "members") {
      setStep("details");
    }
  };

  const handleCreate = async () => {
    if (!currentUser || !name.trim() || selectedMembers.length === 0) return;

    setCreating(true);
    try {
      const chatId = await createGroup(
        name.trim(),
        currentUser.uid,
        selectedMembers,
        description.trim() || undefined
      );
      setSelectedChatId(chatId);
      handleClose();
    } catch (error) {
      console.error("Error creating group:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setStep("details");
    setName("");
    setDescription("");
    setSelectedMembers([]);
    onClose();
  };

  const canProceed = step === "details" ? name.trim().length > 0 : selectedMembers.length > 0;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          bgcolor: "#111B21",
          color: "#E9EDEF",
          width: "100%",
          maxWidth: 450,
          borderRadius: 2,
          overflow: "hidden",
        },
      }}
    >
      <CreateGroupHeader 
        onClose={handleClose} 
        step={step}
        onBack={handleBack}
      />

      <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minHeight: 400 }}>
        {step === "details" ? (
          <CreateGroupDetails
            name={name}
            onNameChange={setName}
            description={description}
            onDescriptionChange={setDescription}
          />
        ) : (
          <CreateGroupMembers
            friends={friends}
            friendProfiles={friendProfiles}
            selectedMembers={selectedMembers}
            onToggleMember={handleToggleMember}
          />
        )}
      </Box>

      {/* Action Button */}
      <Box sx={{ p: 2, borderTop: "1px solid #2A3942", bgcolor: "#202C33" }}>
        <Button
          fullWidth
          variant="contained"
          onClick={step === "details" ? handleNext : handleCreate}
          disabled={!canProceed || creating}
          sx={{
            bgcolor: "#00A884",
            color: "#111B21",
            textTransform: "none",
            fontWeight: 600,
            py: 1.25,
            "&:hover": { bgcolor: "#00BF96" },
            "&:disabled": { bgcolor: "#2A3942", color: "#8696A0" },
          }}
        >
          {creating ? (
            <CircularProgress size={24} sx={{ color: "#111B21" }} />
          ) : step === "details" ? (
            "Next"
          ) : (
            `Create Group (${selectedMembers.length} members)`
          )}
        </Button>
      </Box>
    </Dialog>
  );
};
