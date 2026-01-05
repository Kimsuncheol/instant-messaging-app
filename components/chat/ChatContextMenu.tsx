"use client";

import React from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  ExitToApp as LeaveIcon,
  Edit as EditIcon,
  PushPin as PinIcon,
  PushPinOutlined as UnpinIcon,
  NotificationsOff as MuteIcon,
  Notifications as UnmuteIcon,
  DoneAll as MarkReadIcon,
  Delete as DeleteIcon,
  Call as CallIcon,
  Videocam as VideoIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
} from "@mui/icons-material";
import {
  Chat,
  isPinned,
  isMuted,
  isFavorited,
  pinChat,
  unpinChat,
  muteChat,
  unmuteChat,
  favoriteChat,
  unfavoriteChat,
  markMessagesAsRead,
  leaveChat,
  deleteChat,
} from "@/lib/chatService";

interface ChatContextMenuProps {
  chat: Chat | null;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  userId: string;
  onRenameClick?: () => void;
  onLeaveSuccess?: () => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
}

export const ChatContextMenu: React.FC<ChatContextMenuProps> = ({
  chat,
  anchorPosition,
  onClose,
  userId,
  onRenameClick,
  onLeaveSuccess,
  onVoiceCall,
  onVideoCall,
}) => {
  if (!chat) return null;

  const pinned = isPinned(chat, userId);
  const muted = isMuted(chat, userId);
  const favorited = isFavorited(chat, userId);
  const isGroup = chat.type === "group";

  const handlePin = async () => {
    try {
      if (pinned) {
        await unpinChat(chat.id, userId);
      } else {
        await pinChat(chat.id, userId);
      }
    } catch (error) {
      console.error("Error toggling pin:", error);
    }
    onClose();
  };

  const handleMute = async () => {
    try {
      if (muted) {
        await unmuteChat(chat.id, userId);
      } else {
        await muteChat(chat.id, userId);
      }
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
    onClose();
  };

  const handleFavorite = async () => {
    try {
      if (favorited) {
        await unfavoriteChat(chat.id, userId);
      } else {
        await favoriteChat(chat.id, userId);
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
    onClose();
  };

  const handleMarkAsRead = async () => {
    try {
      await markMessagesAsRead(chat.id, userId);
    } catch (error) {
      console.error("Error marking as read:", error);
    }
    onClose();
  };

  const handleLeave = async () => {
    if (!isGroup) {
      try {
        await deleteChat(chat.id);
        onLeaveSuccess?.();
      } catch (error) {
        console.error("Error deleting chat:", error);
      }
    } else {
      try {
        await leaveChat(chat.id, userId);
        onLeaveSuccess?.();
      } catch (error) {
        console.error("Error leaving group:", error);
      }
    }
    onClose();
  };

  const handleRename = () => {
    onRenameClick?.();
    onClose();
  };

  return (
    <Menu
      open={Boolean(anchorPosition)}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition || undefined}
      PaperProps={{
        sx: {
          bgcolor: "#233138",
          color: "#E9EDEF",
          minWidth: 200,
          "& .MuiMenuItem-root": {
            py: 1.5,
            "&:hover": {
              bgcolor: "#182229",
            },
          },
        },
      }}
    >
      <MenuItem onClick={handlePin}>
        <ListItemIcon>
          {pinned ? (
            <UnpinIcon sx={{ color: "#AEBAC1" }} />
          ) : (
            <PinIcon sx={{ color: "#AEBAC1" }} />
          )}
        </ListItemIcon>
        <ListItemText>{pinned ? "Unpin" : "Pin"}</ListItemText>
      </MenuItem>

      <MenuItem onClick={handleMute}>
        <ListItemIcon>
          {muted ? (
            <UnmuteIcon sx={{ color: "#AEBAC1" }} />
          ) : (
            <MuteIcon sx={{ color: "#AEBAC1" }} />
          )}
        </ListItemIcon>
        <ListItemText>{muted ? "Unmute" : "Mute"}</ListItemText>
      </MenuItem>

      <MenuItem onClick={handleFavorite}>
        <ListItemIcon>
          {favorited ? (
            <StarIcon sx={{ color: "#FFC107" }} />
          ) : (
            <StarBorderIcon sx={{ color: "#AEBAC1" }} />
          )}
        </ListItemIcon>
        <ListItemText>
          {favorited ? "Remove from Favourites" : "Add to Favourites"}
        </ListItemText>
      </MenuItem>

      <MenuItem onClick={handleMarkAsRead}>
        <ListItemIcon>
          <MarkReadIcon sx={{ color: "#00A884" }} />
        </ListItemIcon>
        <ListItemText>Mark as read</ListItemText>
      </MenuItem>

      {/* Call options for private chats */}
      {!isGroup && (
        <MenuItem
          onClick={() => {
            onVoiceCall?.();
            onClose();
          }}
        >
          <ListItemIcon>
            <CallIcon sx={{ color: "#00A884" }} />
          </ListItemIcon>
          <ListItemText>Voice Call</ListItemText>
        </MenuItem>
      )}

      {!isGroup && (
        <MenuItem
          onClick={() => {
            onVideoCall?.();
            onClose();
          }}
        >
          <ListItemIcon>
            <VideoIcon sx={{ color: "#00A884" }} />
          </ListItemIcon>
          <ListItemText>Video Call</ListItemText>
        </MenuItem>
      )}

      <Divider sx={{ bgcolor: "#2A3942" }} />

      {isGroup && (
        <MenuItem onClick={handleRename}>
          <ListItemIcon>
            <EditIcon sx={{ color: "#AEBAC1" }} />
          </ListItemIcon>
          <ListItemText>Rename group</ListItemText>
        </MenuItem>
      )}

      <MenuItem onClick={handleLeave}>
        <ListItemIcon>
          {isGroup ? (
            <LeaveIcon sx={{ color: "#F15C6D" }} />
          ) : (
            <DeleteIcon sx={{ color: "#F15C6D" }} />
          )}
        </ListItemIcon>
        <ListItemText sx={{ color: "#F15C6D" }}>
          {isGroup ? "Leave group" : "Delete chat"}
        </ListItemText>
      </MenuItem>
    </Menu>
  );
};
