"use client";

import React from "react";
import { Box, Typography, Button, Divider, Tooltip } from "@mui/material";
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Help as MaybeIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { Event } from "@/lib/chatService";

interface EventMessageProps {
  event: Event;
  currentUserId: string;
  onRSVP: (status: 'going' | 'maybe' | 'declined') => void;
}

export const EventMessage: React.FC<EventMessageProps> = ({
  event,
  currentUserId,
  onRSVP,
}) => {
  const startDate = event.startTime.toDate();
  const endDate = event.endTime?.toDate();
  
  // Format date parts
  const month = startDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const day = startDate.getDate();
  const timeStr = startDate.toLocaleTimeString("en-US", { 
    hour: "numeric", 
    minute: "2-digit",
    hour12: true 
  });
  
  // Calculate attendee counts
  const attendees = event.attendees || [];
  const goingCount = attendees.filter(a => a.status === 'going').length;
  const maybeCount = attendees.filter(a => a.status === 'maybe').length;
  const declinedCount = attendees.filter(a => a.status === 'declined').length;
  
  // Get current user's status
  const userStatus = attendees.find(a => a.userId === currentUserId)?.status;

  return (
    <Box sx={{ minWidth: 280, maxWidth: 320 }}>
      {/* Event Header Card */}
      <Box sx={{ display: "flex", bgcolor: "#1A2329", borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
        {/* Date Column */}
        <Box 
          sx={{ 
            bgcolor: "#00BFA5", 
            width: 70, 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            justifyContent: "center",
            p: 1.5,
            color: "#111B21"
          }}
        >
          <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>
            {month}
          </Typography>
          <Typography sx={{ fontSize: "1.75rem", fontWeight: 700, lineHeight: 1 }}>
            {day}
          </Typography>
        </Box>
        
        {/* Title & Time */}
        <Box sx={{ p: 1.5, flex: 1 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 600, 
              color: "#E9EDEF", 
              lineHeight: 1.2,
              mb: 0.5 
            }}
          >
            {event.title}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#8696A0" }}>
            <TimeIcon sx={{ fontSize: 16 }} />
            <Typography variant="caption">
              {event.allDay ? "All Day" : timeStr}
              {endDate && !event.allDay && ` - ${endDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 1.5, bgcolor: "rgba(0,0,0,0.2)" }}>
        {/* Location */}
        {event.location && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, color: "#E9EDEF" }}>
            <LocationIcon sx={{ fontSize: 18, color: "#8696A0" }} />
            <Typography variant="body2" noWrap>
              {event.location}
            </Typography>
          </Box>
        )}

        {/* Description */}
        {event.description && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: "#8696A0", 
              mb: 2, 
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden"
            }}
          >
            {event.description}
          </Typography>
        )}

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 1.5 }} />

        {/* RSVP Buttons */}
        <Typography variant="caption" sx={{ color: "#8696A0", mb: 1, display: "block" }}>
          Your Response:
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
          <Tooltip title="Going">
            <Button 
              fullWidth
              size="small"
              onClick={() => onRSVP('going')}
              variant={userStatus === 'going' ? "contained" : "outlined"}
              color="success"
              sx={{ 
                minWidth: 0,
                bgcolor: userStatus === 'going' ? "#00A884" : "transparent",
                borderColor: userStatus === 'going' ? "#00A884" : "rgba(255,255,255,0.1)",
                color: userStatus === 'going' ? "#111B21" : "#E9EDEF",
                "&:hover": {
                  bgcolor: userStatus === 'going' ? "#008f6f" : "rgba(255,255,255,0.05)",
                  borderColor: userStatus === 'going' ? "#008f6f" : "rgba(255,255,255,0.2)",
                }
              }}
            >
              <CheckIcon fontSize="small" />
            </Button>
          </Tooltip>
          
          <Tooltip title="Maybe">
            <Button 
              fullWidth
              size="small"
              onClick={() => onRSVP('maybe')}
              variant={userStatus === 'maybe' ? "contained" : "outlined"}
              color="warning"
              sx={{ 
                minWidth: 0,
                bgcolor: userStatus === 'maybe' ? "#FFBC22" : "transparent",
                borderColor: userStatus === 'maybe' ? "#FFBC22" : "rgba(255,255,255,0.1)",
                color: userStatus === 'maybe' ? "#111B21" : "#E9EDEF",
                "&:hover": {
                  bgcolor: userStatus === 'maybe' ? "#e5a81e" : "rgba(255,255,255,0.05)",
                  borderColor: userStatus === 'maybe' ? "#e5a81e" : "rgba(255,255,255,0.2)",
                }
              }}
            >
              <MaybeIcon fontSize="small" />
            </Button>
          </Tooltip>
          
          <Tooltip title="Can't Go">
            <Button 
              fullWidth
              size="small"
              onClick={() => onRSVP('declined')}
              variant={userStatus === 'declined' ? "contained" : "outlined"}
              color="error"
              sx={{ 
                minWidth: 0,
                bgcolor: userStatus === 'declined' ? "#F15C6D" : "transparent",
                borderColor: userStatus === 'declined' ? "#F15C6D" : "rgba(255,255,255,0.1)",
                color: userStatus === 'declined' ? "#111B21" : "#E9EDEF",
                "&:hover": {
                  bgcolor: userStatus === 'declined' ? "#d94f5f" : "rgba(255,255,255,0.05)",
                  borderColor: userStatus === 'declined' ? "#d94f5f" : "rgba(255,255,255,0.2)",
                }
              }}
            >
              <CancelIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Box>

        {/* Attendee Summary */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" sx={{ color: "#00A884" }}>
            {goingCount} Going
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            {maybeCount > 0 && (
              <Typography variant="caption" sx={{ color: "#FFBC22" }}>
                {maybeCount} Maybe
              </Typography>
            )}
            {declinedCount > 0 && (
              <Typography variant="caption" sx={{ color: "#F15C6D" }}>
                {declinedCount} Can't
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      
      {/* Footer */}
      <Box 
        sx={{ 
          p: 1, 
          bgcolor: "#1A2329",
          borderTop: "1px solid rgba(255,255,255,0.08)", 
          borderRadius: "0 0 12px 12px",
          textAlign: "center"
        }}
      >
        <Typography variant="caption" sx={{ color: "#8696A0", fontWeight: 500 }}>
          View Details
        </Typography>
      </Box>
    </Box>
  );
};
