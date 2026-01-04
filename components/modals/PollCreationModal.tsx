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
  FormControlLabel,
  Checkbox,
  Fade,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Close as CloseIcon,
  Poll as PollIcon,
  DragIndicator as DragIcon,
} from "@mui/icons-material";
import { Poll, PollOption } from "@/lib/chatService";

interface PollCreationModalProps {
  open: boolean;
  onClose: () => void;
  onCreatePoll: (poll: Omit<Poll, "id" | "createdAt" | "totalVotes">) => void;
  userId: string;
}

export const PollCreationModal: React.FC<PollCreationModalProps> = ({
  open,
  onClose,
  onCreatePoll,
  userId,
}) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [errors, setErrors] = useState<{ question?: string; options?: string }>({});

  const handleAddOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const validate = (): boolean => {
    const newErrors: { question?: string; options?: string } = {};

    if (!question.trim()) {
      newErrors.question = "Question is required";
    } else if (question.length > 200) {
      newErrors.question = "Question must be 200 characters or less";
    }

    const validOptions = options.filter(opt => opt.trim());
    if (validOptions.length < 2) {
      newErrors.options = "At least 2 options are required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;

    const validOptions = options.filter(opt => opt.trim());
    const pollOptions: Omit<PollOption, "votes">[] = validOptions.map((text, index) => ({
      id: `option_${Date.now()}_${index}`,
      text: text.trim(),
    }));

    const poll: Omit<Poll, "id" | "createdAt" | "totalVotes"> = {
      question: question.trim(),
      options: pollOptions.map(opt => ({ ...opt, votes: [] })),
      createdBy: userId,
      allowMultipleVotes,
      expiresAt: undefined,
    };

    onCreatePoll(poll);
    handleClose();
  };

  const handleClose = () => {
    setQuestion("");
    setOptions(["", ""]);
    setAllowMultipleVotes(false);
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
              bgcolor: "rgba(0,168,132,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PollIcon sx={{ color: "#00A884", fontSize: "1.5rem" }} />
          </Box>
          <Typography sx={{ fontSize: "1.25rem", fontWeight: 600 }}>
            Create Poll
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
        {/* Question Input */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ color: "#8696A0", mb: 1, fontSize: "0.875rem", fontWeight: 500 }}>
            Question *
          </Typography>
          <TextField
            fullWidth
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            error={!!errors.question}
            helperText={errors.question || `${question.length}/200 characters`}
            placeholder="What would you like to ask?"
            autoFocus
            multiline
            maxRows={3}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2A3942",
                borderRadius: "8px",
                "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                "&:hover fieldset": { borderColor: "rgba(0,168,132,0.3)" },
                "&.Mui-focused fieldset": { borderColor: "#00A884" },
                "& input, & textarea": {
                  color: "#E9EDEF",
                  fontSize: "0.9375rem",
                },
              },
              "& .MuiFormHelperText-root": {
                color: errors.question ? "#F15C6D" : "#667781",
                fontSize: "0.75rem",
              },
            }}
          />
        </Box>

        {/* Options */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ color: "#8696A0", mb: 1.5, fontSize: "0.875rem", fontWeight: 500 }}>
            Options *
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {options.map((option, index) => (
              <Fade in key={index} timeout={300}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <DragIcon sx={{ color: "#667781", fontSize: "1.25rem", cursor: "move" }} />
                  <TextField
                    fullWidth
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: "#202C33",
                        borderRadius: "8px",
                        "& fieldset": { borderColor: "rgba(255,255,255,0.08)" },
                        "&:hover fieldset": { borderColor: "rgba(0,168,132,0.2)" },
                        "&.Mui-focused fieldset": { borderColor: "#00A884" },
                        "& input": {
                          color: "#E9EDEF",
                          fontSize: "0.9375rem",
                          py: 1.25,
                        },
                      },
                    }}
                  />
                  {options.length > 2 && (
                    <IconButton
                      onClick={() => handleRemoveOption(index)}
                      sx={{
                        color: "#F15C6D",
                        "&:hover": { bgcolor: "rgba(241,92,109,0.1)" },
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </Fade>
            ))}
          </Box>

          {errors.options && (
            <Typography sx={{ color: "#F15C6D", fontSize: "0.75rem", mt: 1, ml: 5 }}>
              {errors.options}
            </Typography>
          )}

          {/* Add Option Button */}
          {options.length < 10 && (
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddOption}
              fullWidth
              sx={{
                mt: 1.5,
                color: "#00A884",
                borderColor: "rgba(0,168,132,0.3)",
                border: "1px dashed rgba(0,168,132,0.3)",
                textTransform: "none",
                py: 1,
                borderRadius: "8px",
                "&:hover": {
                  borderColor: "#00A884",
                  bgcolor: "rgba(0,168,132,0.05)",
                },
              }}
            >
              Add Option ({options.length}/10)
            </Button>
          )}
        </Box>

        {/* Settings */}
        <Box
          sx={{
            bgcolor: "#1A2329",
            borderRadius: "8px",
            p: 2,
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={allowMultipleVotes}
                onChange={(e) => setAllowMultipleVotes(e.target.checked)}
                sx={{
                  color: "#8696A0",
                  "&.Mui-checked": { color: "#00A884" },
                }}
              />
            }
            label={
              <Box>
                <Typography sx={{ color: "#E9EDEF", fontSize: "0.9375rem", fontWeight: 500 }}>
                  Allow multiple choices
                </Typography>
                <Typography sx={{ color: "#667781", fontSize: "0.75rem" }}>
                  Let people vote for more than one option
                </Typography>
              </Box>
            }
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
            bgcolor: "#00A884",
            color: "#111B21",
            textTransform: "none",
            px: 3,
            fontWeight: 600,
            borderRadius: "8px",
            "&:hover": {
              bgcolor: "#06CF9C",
              boxShadow: "0 4px 12px rgba(0,168,132,0.3)",
            },
          }}
        >
          Create Poll
        </Button>
      </DialogActions>
    </Dialog>
  );
};
