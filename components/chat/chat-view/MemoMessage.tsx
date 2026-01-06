"use client";

import React, { useState } from "react";
import { Box, Typography, Collapse } from "@mui/material";
import { Note as NoteIcon } from "@mui/icons-material";
import { Timestamp } from "firebase/firestore";
import { MemoData } from "@/components/modals/MemoModal";
import { MemoActionsMenu } from "@/components/memo/MemoActionsMenu";
import { useDateFormat } from "@/context/DateFormatContext";

interface MemoMessageProps {
  memo: MemoData;
  messageId?: string;
  isOwn?: boolean;
  onEdit?: (memo: MemoData) => void;
  onDelete?: (messageId: string) => void;
  onForward?: (memo: MemoData) => void;
  onReaction?: (emoji: string) => void;
  createdAt?: Timestamp;
  editedAt?: Timestamp;
}

const MAX_PREVIEW_LENGTH = 150;

export const MemoMessage: React.FC<MemoMessageProps> = ({
  memo,
  messageId,
  isOwn = false,
  onEdit,
  onDelete,
  onForward,
  onReaction,
  createdAt,
  editedAt,
}) => {
  const { formatTime } = useDateFormat();
  const { title, content } = memo;
  const [expanded, setExpanded] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const isLong = content.length > MAX_PREVIEW_LENGTH;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ top: e.clientY, left: e.clientX });
  };

  const handleCloseMenu = () => {
    setMenuPosition(null);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <>
      <Box
        onContextMenu={handleContextMenu}
        sx={{
          maxWidth: "65%",
          minWidth: 200,
          px: 1.5,
          py: 0.75,
          borderRadius: isOwn ? "8px 8px 0 8px" : "8px 8px 8px 0",
          bgcolor: isOwn ? "#005C4B" : "#202C33",
          cursor: "context-menu",
          "&:hover": { opacity: 0.95 },
        }}
      >
        {/* Memo header with icon */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            mb: 0.5,
          }}
        >
          <NoteIcon
            sx={{
              fontSize: 14,
              color: isOwn ? "#00A884" : "#FFA726",
            }}
          />
          <Typography
            sx={{
              color: isOwn ? "#00A884" : "#FFA726",
              fontSize: "0.75rem",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Memo
          </Typography>
        </Box>

        {/* Title */}
        <Typography
          sx={{
            color: "#E9EDEF",
            fontWeight: 600,
            fontSize: "0.9375rem",
            wordBreak: "break-word",
            mb: 0.5,
          }}
        >
          {title}
        </Typography>

        {/* Content */}
        <Collapse
          in={expanded || !isLong}
          collapsedSize={isLong ? 48 : undefined}
          timeout={200}
        >
          <Typography
            sx={{
              color: "#D1D7DB",
              fontSize: "0.875rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.4,
            }}
          >
            {content}
          </Typography>
        </Collapse>

        {/* Read more/less link */}
        {isLong && (
          <Typography
            component="span"
            onClick={handleToggleExpand}
            sx={{
              color: isOwn ? "#53BDEB" : "#53BDEB",
              fontSize: "0.8125rem",
              cursor: "pointer",
              display: "inline-block",
              mt: 0.5,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            {expanded ? "Show less" : "Read more"}
          </Typography>
        )}

        {/* Timestamp and edited indicator */}
        {createdAt && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 0.5,
              mt: 0.5,
            }}
          >
            {editedAt && (
              <Typography
                sx={{ color: "rgba(255,255,255,0.4)", fontSize: "0.6875rem" }}
              >
                edited
              </Typography>
            )}
            <Typography
              sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.6875rem" }}
            >
              {formatTime(createdAt)}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Context Menu */}
      <MemoActionsMenu
        memo={memo}
        messageId={messageId}
        anchorPosition={menuPosition}
        onClose={handleCloseMenu}
        onEdit={isOwn ? onEdit : undefined}
        onDelete={isOwn ? onDelete : undefined}
        onForward={onForward}
        onReaction={onReaction}
      />
    </>
  );
};
