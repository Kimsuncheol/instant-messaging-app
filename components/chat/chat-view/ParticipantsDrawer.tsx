"use client";

import React, { useState } from "react";
import { Drawer, Box, Typography, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Chat, leaveGroupChat, addParticipantsToGroup } from "@/lib/chatService";
import { UserProfile } from "@/lib/userService";
import { UserProfileModal } from "@/components/modals/UserProfileModal";
import { useAuth } from "@/context/AuthContext";
import { useChatStore } from "@/store/chatStore";
import { MediaGallery } from "./MediaGallery";
import { GroupInfoHeader } from "./GroupInfoHeader";
import { ParticipantsList } from "./ParticipantsList";
import { LeaveGroupButton } from "./LeaveGroupButton";
import { LeaveGroupDialog } from "./LeaveGroupDialog";
import { AddParticipantsButton } from "./AddParticipantsButton";
import { AddParticipantsModal } from "./AddParticipantsModal";

interface ParticipantsDrawerProps {
  open: boolean;
  onClose: () => void;
  chat: Chat | null;
  participants: UserProfile[];
}

export const ParticipantsDrawer: React.FC<ParticipantsDrawerProps> = ({
  open,
  onClose,
  chat,
  participants,
}) => {
  const { user } = useAuth();
  const isGroup = chat?.type === "group";

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [addParticipantsModalOpen, setAddParticipantsModalOpen] = useState(false);

  const setSelectedChatId = useChatStore((state) => state.setSelectedChatId);

  const handleParticipantClick = (userId: string) => {
    setSelectedUserId(userId);
    setProfileModalOpen(true);
  };

  const handleAddParticipants = async (userIds: string[]) => {
    if (!chat || !user) return;

    await addParticipantsToGroup(chat.id, userIds, user.uid);
  };

  const handleLeaveGroup = async () => {
    if (!chat || !user) return;

    setIsLeaving(true);
    try {
      await leaveGroupChat(chat.id, user.uid);
      setLeaveDialogOpen(false);
      setSelectedChatId(null); // Clear selected chat
      onClose(); // Close drawer
    } catch (error: unknown) {
      console.error("Error leaving group:", error);
      alert(error instanceof Error ? error.message : "Failed to leave group");
    } finally {
      setIsLeaving(false);
    }
  };

  const shouldShowLeaveButton =
    isGroup && chat && user && chat.groupCreatorId !== user.uid;

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          "& .MuiDrawer-paper": {
            width: { xs: "100%", sm: 400 },
            bgcolor: "#0B141A",
            borderLeft: "1px solid #2A3942",
          },
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 2,
            bgcolor: "#202C33",
            borderBottom: "1px solid #2A3942",
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: "#E9EDEF", fontWeight: 500, fontSize: "1.125rem" }}
          >
            {isGroup ? "Group Info" : "Chat Info"}
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#AEBAC1" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Group Info Header */}
        {isGroup && chat && <GroupInfoHeader chat={chat} />}

        {/* Participants List */}
        <ParticipantsList
          participants={participants}
          currentUserId={user?.uid}
          isOpen={open}
          onParticipantClick={handleParticipantClick}
        />

        {/* Media Gallery */}
        {chat && <MediaGallery chatId={chat.id} />}

        {/* Add Participants Button - Only for group chats */}
        {isGroup && chat && (
          <AddParticipantsButton
            onClick={() => setAddParticipantsModalOpen(true)}
          />
        )}

        {/* Leave Group Button */}
        {shouldShowLeaveButton && (
          <LeaveGroupButton onClick={() => setLeaveDialogOpen(true)} />
        )}
      </Drawer>

      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfileModal
          open={profileModalOpen}
          onClose={() => {
            setProfileModalOpen(false);
            setSelectedUserId(null);
          }}
          userId={selectedUserId}
        />
      )}

      {/* Leave Confirmation Dialog */}
      <LeaveGroupDialog
        open={leaveDialogOpen}
        groupName={chat?.groupName || "this group"}
        isLeaving={isLeaving}
        onClose={() => setLeaveDialogOpen(false)}
        onConfirm={handleLeaveGroup}
      />

      {/* Add Participants Modal */}
      {chat && (
        <AddParticipantsModal
          open={addParticipantsModalOpen}
          onClose={() => setAddParticipantsModalOpen(false)}
          onAdd={handleAddParticipants}
          currentParticipantIds={chat.participants}
        />
      )}
    </>
  );
};
