"use client";

import React, { useState } from "react";
import { Box, IconButton, Typography, Slide, Paper } from "@mui/material";
import {
  Image as GalleryIcon,
  CameraAlt as CameraIcon,
  LocationOn as LocationIcon,
  Person as ContactIcon,
  InsertDriveFile as DocumentIcon,
  Headphones as AudioIcon,
  Poll as PollIcon,
  Event as EventIcon,
  Close as CloseIcon,
  Note as MemoIcon,
  Call as CallIcon,
  Videocam as VideoIcon,
  AutoAwesome as AiSummaryIcon,
} from "@mui/icons-material";

export type AttachmentType =
  | "gallery"
  | "camera"
  | "location"
  | "contact"
  | "document"
  | "audio"
  | "poll"
  | "event"
  | "memo"
  | "voice_call"
  | "video_call"
  | "capture";

interface AttachmentOption {
  type: AttachmentType;
  icon: React.ReactNode;
  label: string;
  color: string;
}

const attachmentOptions: AttachmentOption[] = [
  {
    type: "voice_call",
    icon: <CallIcon />,
    label: "Voice Call",
    color: "#00A884",
  },
  {
    type: "video_call",
    icon: <VideoIcon />,
    label: "Video Call",
    color: "#00A884",
  },
  {
    type: "capture",
    icon: <AiSummaryIcon />,
    label: "Capture",
    color: "#4CAF50",
  },
  {
    type: "gallery",
    icon: <GalleryIcon />,
    label: "Gallery",
    color: "#7F66FF",
  },
  { type: "camera", icon: <CameraIcon />, label: "Camera", color: "#FF6B9C" },
  {
    type: "location",
    icon: <LocationIcon />,
    label: "Location",
    color: "#00A884",
  },
  {
    type: "contact",
    icon: <ContactIcon />,
    label: "Contact",
    color: "#53BDEB",
  },
  {
    type: "document",
    icon: <DocumentIcon />,
    label: "Document",
    color: "#5157AE",
  },
  { type: "audio", icon: <AudioIcon />, label: "Audio", color: "#F5A623" },
  { type: "poll", icon: <PollIcon />, label: "Poll", color: "#FF6B6B" },
  { type: "event", icon: <EventIcon />, label: "Event", color: "#00BFA5" },
  { type: "memo", icon: <MemoIcon />, label: "Memo", color: "#FFA726" },
];

// Pagination constants
const ITEMS_PER_PAGE = 12; // 4 columns x 3 rows
const COLUMNS = 4;

interface AttachmentPanelProps {
  open: boolean;
  onClose: () => void;
  onSelect: (type: AttachmentType) => void;
}

export const AttachmentPanel: React.FC<AttachmentPanelProps> = ({
  open,
  onClose,
  onSelect,
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  // Calculate total pages
  const totalPages = Math.ceil(attachmentOptions.length / ITEMS_PER_PAGE);

  // Get current page items
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const currentItems = attachmentOptions.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const handleSelect = (type: AttachmentType) => {
    onSelect(type);
    onClose();
    setCurrentPage(0); // Reset to first page on close
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: AttachmentType) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(type);
    }
  };

  const handleSwipe = (direction: "left" | "right") => {
    if (direction === "left" && currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "right" && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Touch handling for swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > 50) {
      // Minimum swipe distance
      handleSwipe(diff > 0 ? "left" : "right");
    }
    setTouchStart(null);
  };

  if (!open) return null;

  return (
    <Slide direction="up" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: "absolute",
          bottom: "100%",
          left: 0,
          right: 0,
          bgcolor: "#1F2C33",
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          overflow: "hidden",
          mb: 0.5,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 2,
            py: 1.5,
            borderBottom: "1px solid #2A3942",
          }}
        >
          <Typography
            sx={{ color: "#E9EDEF", fontWeight: 500, fontSize: "0.9375rem" }}
          >
            Share
          </Typography>
          <IconButton
            onClick={() => {
              onClose();
              setCurrentPage(0);
            }}
            size="small"
            sx={{ color: "#8696A0" }}
            aria-label="Close attachment panel"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Attachment Grid */}
        <Box
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
            gap: 2,
            p: 3,
            minHeight: 240, // Fixed height for consistency
          }}
          role="menu"
          aria-label="Attachment options"
        >
          {currentItems.map((option) => (
            <Box
              key={option.type}
              onClick={() => handleSelect(option.type)}
              onKeyDown={(e) => handleKeyDown(e, option.type)}
              tabIndex={0}
              role="menuitem"
              aria-label={option.label}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                transition: "transform 0.15s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                },
                "&:focus": {
                  outline: "none",
                  "& .icon-container": {
                    boxShadow: `0 0 0 3px ${option.color}40`,
                  },
                },
              }}
            >
              <Box
                className="icon-container"
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  bgcolor: option.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  mb: 1,
                  transition: "box-shadow 0.15s ease, transform 0.15s ease",
                  "& .MuiSvgIcon-root": {
                    fontSize: "1.5rem",
                  },
                }}
              >
                {option.icon}
              </Box>
              <Typography
                sx={{
                  color: "#8696A0",
                  fontSize: "0.75rem",
                  textAlign: "center",
                }}
              >
                {option.label}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Pagination Dots */}
        {totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 0.75,
              pb: 2,
            }}
          >
            {Array.from({ length: totalPages }).map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentPage(index)}
                sx={{
                  width: currentPage === index ? 8 : 6,
                  height: currentPage === index ? 8 : 6,
                  borderRadius: "50%",
                  bgcolor: currentPage === index ? "#00A884" : "#8696A0",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: currentPage === index ? "#00A884" : "#A0AEB7",
                    transform: "scale(1.2)",
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Paper>
    </Slide>
  );
};
