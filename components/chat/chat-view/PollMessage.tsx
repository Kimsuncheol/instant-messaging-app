"use client";

import React from "react";
import { Box, Typography, LinearProgress, Button } from "@mui/material";
import { Poll, calculatePollResults } from "@/lib/chatService";
import { CheckCircle as CheckIcon } from "@mui/icons-material";

interface PollMessageProps {
  poll: Poll;
  currentUserId: string;
  onVote: (optionId: string) => void;
}

export const PollMessage: React.FC<PollMessageProps> = ({
  poll,
  currentUserId,
  onVote,
}) => {
  const results = calculatePollResults(poll);
  const userHasVoted = results.some(r => r.hasUserVoted(currentUserId));
  const canVote = poll.allowMultipleVotes || !userHasVoted;

  return (
    <Box
      sx={{
        bgcolor: "#1F2C34",
        borderRadius: "12px",
        p: 2,
        border: "1px solid #2A3942",
        maxWidth: "400px",
      }}
    >
      {/* Question */}
      <Typography
        sx={{
          color: "#E9EDEF",
          fontSize: "1rem",
          fontWeight: 600,
          mb: 2,
        }}
      >
        📊 {poll.question}
      </Typography>

      {/* Options */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {results.map((result) => {
          const hasUserVoted = result.hasUserVoted(currentUserId);
          const showResults = poll.totalVotes > 0;

          return (
            <Box key={result.optionId}>
              <Button
                fullWidth
                onClick={() => canVote && onVote(result.optionId)}
                disabled={!canVote}
                sx={{
                  position: "relative",
                  overflow: "hidden",
                  border: hasUserVoted ? "2px solid #00A884" : "1px solid #2A3942",
                  bgcolor: hasUserVoted ? "rgba(0,168,132,0.1)" : "#2A3942",
                  color: "#E9EDEF",
                  py: 1.5,
                  px: 2,
                  borderRadius: "8px",
                  textTransform: "none",
                  justifyContent: "flex-start",
                  "&:hover": canVote ? {
                    bgcolor: hasUserVoted ? "rgba(0,168,132,0.15)" : "#374248",
                    borderColor: hasUserVoted ? "#00A884" : "#3E5360",
                  } : {},
                  "&.Mui-disabled": {
                    color: "#E9EDEF",
                    opacity: 1,
                  },
                }}
              >
                {/* Background bar */}
                {showResults && (
                  <LinearProgress
                    variant="determinate"
                    value={result.percentage}
                    sx={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "100%",
                      height: "100%",
                      bgcolor: "transparent",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: hasUserVoted ? "rgba(0,168,132,0.2)" : "rgba(255,255,255,0.05)",
                        transition: "transform 0.5s ease-in-out",
                      },
                    }}
                  />
                )}

                {/* Content */}
                <Box
                  sx={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {hasUserVoted && (
                      <CheckIcon sx={{ fontSize: "1.25rem", color: "#00A884" }} />
                    )}
                    <Typography sx={{ fontSize: "0.9375rem" }}>
                      {result.text}
                    </Typography>
                  </Box>

                  {showResults && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography sx={{ fontSize: "0.875rem", color: "#8696A0" }}>
                        {result.voteCount}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          color: hasUserVoted ? "#00A884" : "#8696A0",
                        }}
                      >
                        {result.percentage.toFixed(0)}%
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Button>
            </Box>
          );
        })}
      </Box>

      {/* Footer */}
      <Typography
        sx={{
          color: "#8696A0",
          fontSize: "0.75rem",
          mt: 2,
          textAlign: "center",
        }}
      >
        {poll.totalVotes === 0
          ? "No votes yet"
          : `${poll.totalVotes} ${poll.totalVotes === 1 ? "vote" : "votes"}${
              poll.allowMultipleVotes ? " · Multiple choices allowed" : ""
            }`}
      </Typography>
    </Box>
  );
};
