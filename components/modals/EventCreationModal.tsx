"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  Fade,
  Divider,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Close as CloseIcon,
  Event as EventIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { Event } from "@/lib/chatService";
import { Timestamp } from "firebase/firestore";

interface EventCreationModalProps {
  open: boolean;
  onClose: () => void;
  onCreateEvent: (event: Omit<Event, "id">) => void;
  userId: string;
}

export const EventCreationModal: React.FC<EventCreationModalProps> = ({
  open,
  onClose,
  onCreateEvent,
  userId,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState(() => 
    new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)
  );
  const [allDay, setAllDay] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; startDate?: string }>({});

  const validate = (): boolean => {
    const newErrors: { title?: string; startDate?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Event title is required";
    }

    if (!startDate) {
      newErrors.startDate = "Start time is required";
    }

    if (!allDay && endDate && new Date(startDate) > new Date(endDate)) {
      newErrors.startDate = "Start time cannot be after end time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;

    const event: Omit<Event, "id"> = {
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      startTime: Timestamp.fromDate(new Date(startDate)),
      endTime: endDate ? Timestamp.fromDate(new Date(endDate)) : undefined,
      allDay,
      createdBy: userId,
      createdAt: Timestamp.now(),
      attendees: [],
    };

    onCreateEvent(event);
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setLocation("");
    setStartDate(new Date().toISOString().slice(0, 16));
    setEndDate(new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16));
    setAllDay(false);
    setErrors({});
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      PaperProps={{
        sx: {
          bgcolor: "#111B21",
          color: "#E9EDEF",
          borderRadius: "12px",
          backgroundImage: "linear-gradient(145deg, #111B21 0%, #0D1418 100%)",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2.5,
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              bgcolor: "rgba(0,191,165,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <EventIcon sx={{ color: "#00BFA5", fontSize: "1.5rem" }} />
          </Box>
          <Typography component="span" sx={{ fontSize: "1.25rem", fontWeight: 600 }}>
            Create Event
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          sx={{
            color: "#8696A0",
            "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      <DialogContent sx={{ p: 2.5 }}>
        {/* Title Input */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ color: "#8696A0", mb: 1, fontSize: "0.875rem", fontWeight: 500 }}>
            Event Title *
          </Typography>
          <TextField
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            placeholder="Event Name"
            autoFocus
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2A3942",
                borderRadius: "8px",
                "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                "&:hover fieldset": { borderColor: "rgba(0,191,165,0.3)" },
                "&.Mui-focused fieldset": { borderColor: "#00BFA5" },
                "& input": {
                  color: "#E9EDEF",
                  fontSize: "0.9375rem",
                },
              },
              "& .MuiFormHelperText-root": {
                color: errors.title ? "#F15C6D" : "#667781",
              },
            }}
          />
        </Box>

        {/* Date & Time */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ color: "#8696A0", fontSize: "0.875rem", fontWeight: 500 }}>
              Date & Time
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={allDay}
                  onChange={(e) => setAllDay(e.target.checked)}
                  color="secondary"
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#00BFA5",
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#00BFA5",
                    },
                  }}
                />
              }
              label={<Typography sx={{ fontSize: "0.75rem", color: "#8696A0" }}>All Day</Typography>}
            />
          </Box>
          
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            <TextField
              type="datetime-local"
              fullWidth
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              error={!!errors.startDate}
              helperText={errors.startDate}
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#2A3942",
                  borderRadius: "8px",
                  "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                  "& input": { color: "#E9EDEF" },
                  "& ::-webkit-calendar-picker-indicator": { filter: "invert(1)" }
                },
              }}
            />
            {!allDay && (
              <TextField
                type="datetime-local"
                fullWidth
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "#2A3942",
                    borderRadius: "8px",
                    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                    "& input": { color: "#E9EDEF" },
                    "& ::-webkit-calendar-picker-indicator": { filter: "invert(1)" }
                  },
                }}
              />
            )}
          </Box>
        </Box>

        {/* Location */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ color: "#8696A0", mb: 1, fontSize: "0.875rem", fontWeight: 500 }}>
            Location
          </Typography>
          <TextField
            fullWidth
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Add Location"
            InputProps={{
              startAdornment: <LocationIcon sx={{ color: "#8696A0", mr: 1, fontSize: 20 }} />,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2A3942",
                borderRadius: "8px",
                "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                "&.Mui-focused fieldset": { borderColor: "#00BFA5" },
                "& input": { color: "#E9EDEF" },
              },
            }}
          />
        </Box>

        {/* Description */}
        <Box>
          <Typography sx={{ color: "#8696A0", mb: 1, fontSize: "0.875rem", fontWeight: 500 }}>
            Description
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add Description"
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2A3942",
                borderRadius: "8px",
                "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                "&.Mui-focused fieldset": { borderColor: "#00BFA5" },
                "& input, & textarea": { color: "#E9EDEF" },
              },
            }}
          />
        </Box>

      </DialogContent>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

      <DialogActions sx={{ px: 2.5, py: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          sx={{
            color: "#8696A0",
            textTransform: "none",
            px: 2.5,
            "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          sx={{
            bgcolor: "#00BFA5",
            color: "#111B21",
            textTransform: "none",
            px: 3,
            fontWeight: 600,
            borderRadius: "8px",
            "&:hover": {
              bgcolor: "#00A891",
              boxShadow: "0 4px 12px rgba(0,191,165,0.3)",
            },
          }}
        >
          Create Event
        </Button>
      </DialogActions>
    </Dialog>
  );
};
