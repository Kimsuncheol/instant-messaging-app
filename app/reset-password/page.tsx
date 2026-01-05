"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Link as MuiLink,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Clear as ClearIcon } from "@mui/icons-material";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to send reset email");
      } else {
        setError("Failed to send reset email");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#0B141A",
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 400,
          width: "100%",
          p: 4,
          bgcolor: "#111B21",
          color: "#E9EDEF",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 1,
            fontWeight: 600,
            color: "#00A884",
            textAlign: "center",
          }}
        >
          Reset Password
        </Typography>
        <Typography
          sx={{
            mb: 3,
            color: "#8696A0",
            textAlign: "center",
          }}
        >
          Enter your email to receive a password reset link
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Password reset email sent! Check your inbox.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            disabled={success}
            InputProps={{
              endAdornment: email && !success && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setEmail("")}
                    edge="end"
                    size="small"
                    sx={{ color: "#8696A0" }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2A3942",
                "& fieldset": { borderColor: "#2A3942" },
                "& input": { color: "#E9EDEF" },
              },
              "& .MuiInputLabel-root": { color: "#8696A0" },
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            disabled={loading || success}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              bgcolor: "#00A884",
              "&:hover": { bgcolor: "#008f70" },
              "&:disabled": { bgcolor: "#2A3942" },
            }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ color: "#8696A0", fontSize: "0.875rem" }}>
              Remember your password?{" "}
              <MuiLink
                component={Link}
                href="/login"
                sx={{ color: "#00A884", textDecoration: "none" }}
              >
                Log in
              </MuiLink>
            </Typography>
            <Typography sx={{ color: "#8696A0", fontSize: "0.875rem", mt: 1 }}>
              Don&apos;t have an account?{" "}
              <MuiLink
                component={Link}
                href="/signup"
                sx={{ color: "#00A884", textDecoration: "none" }}
              >
                Sign up
              </MuiLink>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
