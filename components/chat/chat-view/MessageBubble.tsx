"use client";

import React from "react";
import { Box, Typography, Tooltip } from "@mui/material";
import {
  Done as SingleCheckIcon,
  DoneAll as DoubleCheckIcon,
  Reply as ForwardedIcon,
  Call as CallIcon,
  Videocam as VideoIcon,
  PhoneMissed as MissedCallIcon,
  AccessTime as PendingIcon,
  CheckCircle as SelectedIcon,
  RadioButtonUnchecked as UnselectedIcon,
} from "@mui/icons-material";
import { Message } from "@/lib/chatService";
import { useDateFormat } from "@/context/DateFormatContext";
import { PollMessage } from "./PollMessage";
import { EventMessage } from "./EventMessage";
import { LocationMessage } from "./LocationMessage";
import { ContactMessage } from "./ContactMessage";
import { MemoMessage } from "./MemoMessage";
import { MemoData } from "@/components/modals/MemoModal";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  totalParticipants?: number;
  onLongPress?: (message: Message, e?: React.MouseEvent) => void;
  onClick?: (message: Message) => void;
  onPollVote?: (messageId: string, optionId: string) => void;
  onEventRSVP?: (
    messageId: string,
    status: "going" | "maybe" | "declined"
  ) => void;
  currentUserId?: string;
  searchTerm?: string;
  isCurrentMatch?: boolean;
  // Selection mode props
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (messageId: string) => void;
  // Memo action handlers
  onMemoEdit?: (memo: MemoData, messageId: string) => void;
  onMemoDelete?: (messageId: string) => void;
  onMemoForward?: (memo: MemoData) => void;
}

// Read status types for clarity
type ReadStatusType = "sending" | "sent" | "delivered" | "read";

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  totalParticipants = 2,
  onLongPress,
  onClick,
  onPollVote,
  onEventRSVP,
  currentUserId,
  searchTerm = "",
  isCurrentMatch = false,
  selectionMode = false,
  isSelected = false,
  onToggleSelect,
  onMemoEdit,
  onMemoDelete,
  onMemoForward,
}) => {
  const { formatTime } = useDateFormat();

  const handleContextMenu = (e: React.MouseEvent) => {
    if (selectionMode) {
      e.preventDefault();
      onToggleSelect?.(message.id);
      return;
    }
    e.preventDefault();
    onLongPress?.(message, e);
  };

  const handleClick = () => {
    if (selectionMode) {
      onToggleSelect?.(message.id);
      return;
    }
    onClick?.(message);
  };

  // Determine read status for own messages with enhanced logic
  const getReadStatus = (): {
    icon: React.ReactNode;
    tooltip: string;
  } | null => {
    if (!isOwn) return null;

    const readCount = message.readBy?.length || 0;
    const otherParticipants = totalParticipants - 1; // Exclude sender
    const isReadByAll = readCount >= totalParticipants;
    const isReadBySome = readCount > 1 && readCount < totalParticipants;

    // Determine status type
    let status: ReadStatusType;
    if (!message.createdAt) {
      status = "sending";
    } else if (isReadByAll) {
      status = "read";
    } else if (isReadBySome || readCount > 1) {
      status = "delivered";
    } else {
      status = "sent";
    }

    // Return appropriate icon and tooltip
    switch (status) {
      case "sending":
        return {
          icon: (
            <PendingIcon
              sx={{
                fontSize: "0.875rem",
                color: "rgba(255,255,255,0.4)",
                animation: "pulse 1.5s infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 0.4 },
                  "50%": { opacity: 0.8 },
                },
              }}
            />
          ),
          tooltip: "Sending...",
        };
      case "sent":
        return {
          icon: (
            <SingleCheckIcon
              sx={{ fontSize: "1rem", color: "rgba(255,255,255,0.5)" }}
            />
          ),
          tooltip: "Sent",
        };
      case "delivered":
        return {
          icon: (
            <DoubleCheckIcon
              sx={{ fontSize: "1rem", color: "rgba(255,255,255,0.5)" }}
            />
          ),
          tooltip: `Delivered${
            otherParticipants > 1
              ? ` to ${readCount - 1}/${otherParticipants}`
              : ""
          }`,
        };
      case "read":
        return {
          icon: <DoubleCheckIcon sx={{ fontSize: "1rem", color: "#53BDEB" }} />,
          tooltip:
            otherParticipants > 1
              ? `Read by all ${otherParticipants} members`
              : "Read",
        };
      default:
        return null;
    }
  };

  // Get reactions display
  const getReactionsDisplay = () => {
    if (!message.reactions || Object.keys(message.reactions).length === 0)
      return null;

    return (
      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          mt: 0.5,
          flexWrap: "wrap",
        }}
      >
        {Object.entries(message.reactions).map(([emoji, users]) => (
          <Box
            key={emoji}
            sx={{
              bgcolor: "rgba(255,255,255,0.1)",
              borderRadius: "12px",
              px: 0.75,
              py: 0.25,
              fontSize: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <span>{emoji}</span>
            {users.length > 1 && (
              <span style={{ color: "rgba(255,255,255,0.7)" }}>
                {users.length}
              </span>
            )}
          </Box>
        ))}
      </Box>
    );
  };

  // Highlight text function
  const renderText = (text: string) => {
    if (!searchTerm.trim()) return text;

    const parts = text.split(new RegExp(`(${searchTerm})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span
          key={index}
          style={{
            backgroundColor: isCurrentMatch ? "#FFD700" : "#FFFF00", // Gold for current, Yellow for others
            color: "#000",
            borderRadius: "2px",
            padding: "0 2px",
            fontWeight: isCurrentMatch ? "bold" : "normal",
          }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Handle call notification messages
  if (message.callData) {
    const { type: callType, status } = message.callData;
    const isMissedOrDeclined = status === "missed" || status === "declined";
    const iconColor = isMissedOrDeclined ? "#F15C6D" : "#00A884";

    const CallIconComponent = isMissedOrDeclined
      ? MissedCallIcon
      : callType === "video"
      ? VideoIcon
      : CallIcon;

    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 1,
          px: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            bgcolor: "rgba(255,255,255,0.05)",
            borderRadius: "16px",
            px: 2,
            py: 1,
          }}
        >
          <CallIconComponent sx={{ fontSize: "1.25rem", color: iconColor }} />
          <Typography
            sx={{
              color: isMissedOrDeclined ? "#F15C6D" : "#E9EDEF",
              fontSize: "0.875rem",
            }}
          >
            {message.text.replace("📞 ", "")}
          </Typography>
          <Typography
            sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}
          >
            {formatTime(message.createdAt)}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Handle deleted messages
  if (message.deleted) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: isOwn ? "flex-end" : "flex-start",
          mb: 0.5,
        }}
      >
        <Typography
          sx={{
            color: "rgba(255,255,255,0.2)",
            fontSize: "0.875rem",
            fontStyle: "italic",
            px: 1.5,
            py: 0.75,
          }}
        >
          This message was deleted
        </Typography>
      </Box>
    );
  }

  // Handle poll messages
  if (message.poll && currentUserId) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: isOwn ? "flex-end" : "flex-start",
          mb: 0.5,
        }}
      >
        <Box>
          <PollMessage
            poll={message.poll}
            currentUserId={currentUserId}
            onVote={(optionId) => onPollVote?.(message.id, optionId)}
          />
          <Typography
            sx={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.6875rem",
              textAlign: isOwn ? "right" : "left",
              mt: 0.5,
              px: 1,
            }}
          >
            {formatTime(message.createdAt)}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Handle event messages
  if (message.event && currentUserId) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: isOwn ? "flex-end" : "flex-start",
          mb: 0.5,
        }}
      >
        <Box>
          <EventMessage
            event={message.event}
            currentUserId={currentUserId}
            onRSVP={(status) => onEventRSVP?.(message.id, status)}
          />
          <Typography
            sx={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.6875rem",
              textAlign: isOwn ? "right" : "left",
              mt: 0.5,
              px: 1,
            }}
          >
            {formatTime(message.createdAt)}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Handle location messages
  if (message.location) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: isOwn ? "flex-end" : "flex-start",
          mb: 0.5,
        }}
      >
        <Box>
          <LocationMessage location={message.location} />
          <Typography
            sx={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.6875rem",
              textAlign: isOwn ? "right" : "left",
              mt: 0.5,
              px: 1,
            }}
          >
            {formatTime(message.createdAt)}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Handle contact messages
  if (message.contact) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: isOwn ? "flex-end" : "flex-start",
          mb: 0.5,
        }}
      >
        <Box>
          <ContactMessage contact={message.contact} />
          <Typography
            sx={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.6875rem",
              textAlign: isOwn ? "right" : "left",
              mt: 0.5,
              px: 1,
            }}
          >
            {formatTime(message.createdAt)}
          </Typography>
        </Box>
      </Box>
    );
  }

  // Handle memo messages
  if (message.memo) {
    return (
      <Box
        data-testid="message-bubble"
        sx={{
          display: "flex",
          justifyContent: isOwn ? "flex-end" : "flex-start",
          mb: 0.5,
        }}
      >
        <MemoMessage
          memo={message.memo}
          messageId={message.id}
          isOwn={isOwn}
          createdAt={message.createdAt}
          editedAt={message.editedAt}
          onEdit={
            isOwn && onMemoEdit
              ? (memo) => onMemoEdit(memo, message.id)
              : undefined
          }
          onDelete={
            isOwn && onMemoDelete ? () => onMemoDelete(message.id) : undefined
          }
          onForward={
            onMemoForward ? () => onMemoForward(message.memo!) : undefined
          }
        />
      </Box>
    );
  }

  return (
    <Box
      data-testid="message-bubble"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: isOwn ? "flex-end" : "flex-start",
        mb: 0.5,
        gap: 1,
      }}
    >
      {/* Selection checkbox - shown on left for all messages in selection mode */}
      {selectionMode && !isOwn && (
        <Box
          onClick={handleClick}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          {isSelected ? (
            <SelectedIcon sx={{ color: "#00A884", fontSize: "1.25rem" }} />
          ) : (
            <UnselectedIcon sx={{ color: "#8696A0", fontSize: "1.25rem" }} />
          )}
        </Box>
      )}

      <Box
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        sx={{
          maxWidth: selectionMode ? "60%" : "65%",
          px: 1.5,
          py: 0.75,
          borderRadius: isOwn ? "8px 8px 0 8px" : "8px 8px 8px 0",
          bgcolor: isOwn ? "#005C4B" : "#202C33",
          position: "relative",
          cursor: onLongPress || onClick ? "pointer" : "default",
          "&:hover": onLongPress || onClick ? { opacity: 0.9 } : {},
          border: isCurrentMatch ? "2px solid #00A884" : "none", // Extra visual cue for current match
          transition: "all 0.3s ease",
        }}
      >
        {/* Forwarded indicator */}
        {message.forwardedFrom && (
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}
          >
            <ForwardedIcon
              sx={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.5)" }}
            />
            <Typography
              sx={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.75rem",
                fontStyle: "italic",
              }}
            >
              Forwarded
            </Typography>
          </Box>
        )}

        <Typography
          sx={{
            color: "#E9EDEF",
            fontSize: "0.9375rem",
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
          }}
        >
          {renderText(message.text)}
        </Typography>

        {/* Reactions */}
        {getReactionsDisplay()}

        {/* Time, edited, and read status */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: 0.5,
            mt: 0.25,
          }}
        >
          {message.editedAt && (
            <Typography
              sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6875rem" }}
            >
              edited
            </Typography>
          )}
          <Typography
            sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.6875rem" }}
          >
            {formatTime(message.createdAt)}
          </Typography>
          {(() => {
            const status = getReadStatus();
            if (!status) return null;
            return (
              <Tooltip title={status.tooltip} arrow placement="top">
                <Box
                  component="span"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  {status.icon}
                </Box>
              </Tooltip>
            );
          })()}
        </Box>
      </Box>

      {/* Selection checkbox - shown on right for own messages in selection mode */}
      {selectionMode && isOwn && (
        <Box
          onClick={handleClick}
          sx={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          {isSelected ? (
            <SelectedIcon sx={{ color: "#00A884", fontSize: "1.25rem" }} />
          ) : (
            <UnselectedIcon sx={{ color: "#8696A0", fontSize: "1.25rem" }} />
          )}
        </Box>
      )}
    </Box>
  );
};
