"use client";

import React, { useState } from "react";
import { Drawer, Box, Typography, IconButton, Collapse } from "@mui/material";
import {
  Close as CloseIcon,
  KeyboardArrowDown,
  KeyboardArrowRight,
} from "@mui/icons-material";
import {
  Chat,
  leaveGroupChat,
  deleteChat,
  addParticipantsToGroup,
  convertDmToGroup,
} from "@/lib/chatService";
import { UserProfile } from "@/lib/userService";
import { UserProfileModal } from "@/components/modals/UserProfileModal";
import { useAuth } from "@/context/AuthContext";
import { useChatStore } from "@/store/chatStore";
import { MediaGallery } from "./MediaGallery";
import { GroupInfoHeader } from "./GroupInfoHeader";
import { ParticipantsList } from "./ParticipantsList";
import { LeaveButton } from "./LeaveButton";
import { LeaveGroupDialog } from "./LeaveGroupDialog";
import { AddParticipantsButton } from "./AddParticipantsButton";
import { AddParticipantsModal } from "./AddParticipantsModal";
import { AddParticipantsPanel } from "./AddParticipantsPanel";
import { useDevice } from "@/context/DeviceContext";

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
  const [addParticipantsModalOpen, setAddParticipantsModalOpen] =
    useState(false);
  const [showAddParticipantsPanel, setShowAddParticipantsPanel] =
    useState(false);
  const [participantsOpen, setParticipantsOpen] = useState(true);
  const [mediaOpen, setMediaOpen] = useState(false);
  const { deviceInfo } = useDevice();

  const setSelectedChatId = useChatStore((state) => state.setSelectedChatId);

  const handleParticipantClick = (userId: string) => {
    setSelectedUserId(userId);
    setProfileModalOpen(true);
  };

  const handleAddParticipants = async (userIds: string[]) => {
    if (!chat || !user) return;

    if (chat.type === "private") {
      // Convert DM to group
      const newGroupId = await convertDmToGroup(chat.id, userIds, user.uid);
      setSelectedChatId(newGroupId);
      setShowAddParticipantsPanel(false);
      onClose();
    } else {
      // Add to existing group
      await addParticipantsToGroup(chat.id, userIds, user.uid);
      setShowAddParticipantsPanel(false);
      setAddParticipantsModalOpen(false);
      onClose();
    }
  };

  const handleAddParticipantsClick = () => {
    if (deviceInfo.isMobile) {
      setShowAddParticipantsPanel(true);
    } else {
      setAddParticipantsModalOpen(true);
    }
  };

  const handleLeaveGroup = async () => {
    if (!chat || !user) return;

    setIsLeaving(true);
    try {
      if (isGroup) {
        await leaveGroupChat(chat.id, user.uid);
      } else {
        await deleteChat(chat.id);
      }
      setLeaveDialogOpen(false);
      setSelectedChatId(null); // Clear selected chat
      onClose(); // Close drawer
    } catch (error: unknown) {
      console.error("Error leaving/deleting chat:", error);
      alert(
        error instanceof Error ? error.message : "Failed to leave/delete chat"
      );
    } finally {
      setIsLeaving(false);
    }
  };

  // const shouldShowLeaveButton =
  //   isGroup && chat && user && chat.groupCreatorId !== user.uid;

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

        {/* Collapsible Participants Section */}
        <Box sx={{ borderBottom: "1px solid #2A3942" }}>
          <Box
            onClick={() => setParticipantsOpen(!participantsOpen)}
            sx={{
              px: 2,
              py: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" },
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: "#8696A0", fontWeight: 500 }}
            >
              {participants.length}{" "}
              {participants.length === 1 ? "PARTICIPANT" : "PARTICIPANTS"}
            </Typography>
            {participantsOpen ? (
              <KeyboardArrowDown sx={{ color: "#8696A0" }} />
            ) : (
              <KeyboardArrowRight sx={{ color: "#8696A0" }} />
            )}
          </Box>
          <Collapse in={participantsOpen}>
            <ParticipantsList
              participants={participants}
              currentUserId={user?.uid}
              isOpen={open}
              onParticipantClick={handleParticipantClick}
            />
          </Collapse>
        </Box>

        {/* Collapsible Media Section */}
        {chat && (
          <Box sx={{ borderBottom: "1px solid #2A3942" }}>
            <Box
              onClick={() => setMediaOpen(!mediaOpen)}
              sx={{
                px: 2,
                py: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: "#8696A0", fontWeight: 500 }}
              >
                SHARED MEDIA
              </Typography>
              {mediaOpen ? (
                <KeyboardArrowDown sx={{ color: "#8696A0" }} />
              ) : (
                <KeyboardArrowRight sx={{ color: "#8696A0" }} />
              )}
            </Box>
            <Collapse in={mediaOpen}>
              <Box sx={{ maxHeight: 400, overflowY: "auto" }}>
                <MediaGallery chatId={chat.id} />
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Add Participants Button - For all chats (DM will convert to group) */}
        {chat && <AddParticipantsButton onClick={handleAddParticipantsClick} />}

        {/* Leave/Delete Button */}
        {chat && user && (chat.groupCreatorId !== user.uid || !isGroup) && (
          <LeaveButton
            onClick={() => setLeaveDialogOpen(true)}
            isGroup={isGroup}
          />
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

      {/* Add Participants Modal (Desktop) */}
      {chat && !deviceInfo.isMobile && (
        <AddParticipantsModal
          open={addParticipantsModalOpen}
          onClose={() => setAddParticipantsModalOpen(false)}
          onAdd={handleAddParticipants}
          currentParticipantIds={chat.participants}
        />
      )}

      {/* Add Participants Panel (Mobile) */}
      {chat && deviceInfo.isMobile && showAddParticipantsPanel && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1400,
            bgcolor: "#111B21",
          }}
        >
          <AddParticipantsPanel
            currentParticipantIds={chat.participants}
            onAdd={handleAddParticipants}
            onClose={() => setShowAddParticipantsPanel(false)}
          />
        </Box>
      )}
    </>
  );
};
