"use client";

import React, { useState } from "react";
import { Box, Typography, IconButton, Collapse } from "@mui/material";
import {
  Note as NoteIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
} from "@mui/icons-material";
import { MemoData } from "@/components/modals/MemoModal";
import { MemoActionsMenu } from "@/components/memo/MemoActionsMenu";

interface MemoMessageProps {
  memo: MemoData;
  messageId?: string;
  isOwn?: boolean;
  onEdit?: (memo: MemoData) => void;
  onDelete?: (messageId: string) => void;
  onForward?: (memo: MemoData) => void;
  onReaction?: (emoji: string) => void;
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
}) => {
  const { title, content } = memo;
  const [expanded, setExpanded] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const isLong = content.length > MAX_PREVIEW_LENGTH;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ top: e.clientY, left: e.clientX });
  };

  const handleCloseMenu = () => {
    setMenuPosition(null);
  };

  return (
    <>
      <Box
        onContextMenu={handleContextMenu}
        sx={{
          width: 280,
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "#1F2C34",
          border: "1px solid #FFA726",
          cursor: "context-menu",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            p: 1.5,
            bgcolor: "rgba(255,167,38,0.15)",
            borderBottom: "1px solid #2A3942",
          }}
        >
          <NoteIcon sx={{ color: "#FFA726", fontSize: 20 }} />
          <Typography
            variant="subtitle2"
            sx={{
              color: "#E9EDEF",
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {title}
          </Typography>
          {isLong && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
              sx={{ color: "#8696A0" }}
            >
              {expanded ? <CollapseIcon /> : <ExpandIcon />}
            </IconButton>
          )}
        </Box>

        {/* Content */}
        <Box sx={{ p: 1.5 }}>
          <Collapse in={expanded || !isLong} collapsedSize={isLong ? 60 : undefined}>
            <Typography
              variant="body2"
              sx={{
                color: "#D1D7DB",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {content}
            </Typography>
          </Collapse>
          
          {isLong && !expanded && (
            <Typography
              variant="caption"
              onClick={() => setExpanded(true)}
              sx={{
                color: "#FFA726",
                cursor: "pointer",
                display: "block",
                mt: 0.5,
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Read more...
            </Typography>
          )}
        </Box>
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
