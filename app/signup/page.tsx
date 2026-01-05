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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Visibility, VisibilityOff, Language as LanguageIcon } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useTranslations } from "next-intl";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { locale, setLocale } = useLocale();
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Strict Validation
    if (!email || !password || !displayName || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Password must contain at least one special character");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      // Update display name in Auth
      if (user) {
        await updateProfile(user, {
          displayName,
        });

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: displayName,
          photoURL: user.photoURL || "",
          phoneNumber: phoneNumber || "",
          createdAt: serverTimestamp(),
        });
      }

      // Redirect to login page
      router.push("/login");
    } catch (err: unknown) {
      if (err instanceof Error) {
        // Firebase specific error mapping could go here
        setError(err.message || "Failed to create account");
      } else {
        setError("Failed to create account");
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
          Create Account
        </Typography>
        <Typography
          sx={{
            mb: 3,
            color: "#8696A0",
            textAlign: "center",
          }}
        >
          Sign up to start chatting
        </Typography>

        {/* Language Selector */}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel sx={{ color: "#8696A0" }}>Language</InputLabel>
          <Select
            value={locale}
            onChange={(e) => setLocale(e.target.value as any)}
            label="Language"
            startAdornment={
              <LanguageIcon sx={{ color: "#8696A0", mr: 1 }} />
            }
            sx={{
              bgcolor: "#2A3942",
              color: "#E9EDEF",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#2A3942",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#00A884",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#00A884",
              },
              "& .MuiSvgIcon-root": {
                color: "#8696A0",
              },
            }}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="ko">한국어</MenuItem>
            <MenuItem value="es">Español</MenuItem>
            <MenuItem value="fr">Français</MenuItem>
            <MenuItem value="zh">中文</MenuItem>
            <MenuItem value="ja">日本語</MenuItem>
            <MenuItem value="hi">हिन्दी</MenuItem>
            <MenuItem value="de">Deutsch</MenuItem>
            <MenuItem value="it">Italiano</MenuItem>
            <MenuItem value="ru">Русский</MenuItem>
          </Select>
        </FormControl>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            margin="normal"
            required
            autoFocus
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2A3942",
                "& fieldset": { borderColor: "#2A3942" },
                "& input": { color: "#E9EDEF" },
              },
              "& .MuiInputLabel-root": { color: "#8696A0" },
            }}
          />

          <TextField
            fullWidth
            label="Phone Number (Optional)"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            margin="normal"
            placeholder="+1 234 567 8900"
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2A3942",
                "& fieldset": { borderColor: "#2A3942" },
                "& input": { color: "#E9EDEF" },
              },
              "& .MuiInputLabel-root": { color: "#8696A0" },
            }}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: "#2A3942",
                "& fieldset": { borderColor: "#2A3942" },
                "& input": { color: "#E9EDEF" },
              },
              "& .MuiInputLabel-root": { color: "#8696A0" },
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: "#8696A0" }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
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

          {/* Password Validation Hints */}
          <Box sx={{ mt: 1, mb: 1, px: 1 }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: password.length >= 6 ? "#00A884" : "#8696A0",
                transition: "color 0.2s",
              }}
            >
              {password.length >= 6 ? "✓" : "•"} At least 6 characters
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: /[0-9]/.test(password) ? "#00A884" : "#8696A0",
                transition: "color 0.2s",
              }}
            >
              {/[0-9]/.test(password) ? "✓" : "•"} At least one number
            </Typography>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: /[^A-Za-z0-9]/.test(password) ? "#00A884" : "#8696A0",
                transition: "color 0.2s",
              }}
            >
              {/[^A-Za-z0-9]/.test(password) ? "✓" : "•"} At least one special character
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
            required
            error={password !== confirmPassword && confirmPassword.length > 0}
            helperText={
              password !== confirmPassword && confirmPassword.length > 0
                ? "Passwords do not match"
                : ""
            }
             FormHelperTextProps={{ sx: { color: "#F15C6D" } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    sx={{ color: "#8696A0" }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              bgcolor: "#00A884",
              "&:hover": { bgcolor: "#008f70" },
              "&:disabled": { bgcolor: "#2A3942" },
            }}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </Button>

          <Box sx={{ textAlign: "center" }}>
            <Typography sx={{ color: "#8696A0", fontSize: "0.875rem" }}>
              Already have an account?{" "}
              <MuiLink
                component={Link}
                href="/login"
                sx={{ color: "#00A884", textDecoration: "none" }}
              >
                Log in
              </MuiLink>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
