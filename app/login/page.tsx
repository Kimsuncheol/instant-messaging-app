"use client";

import { useEffect, useState } from "react";
import { signInWithGoogle, signInWithEmail } from "@/lib/authService";
import { useAuth } from "@/context/AuthContext";

import { useRouter } from "next/navigation";
import { Box, Container } from "@mui/material";
import { LoadingScreen } from "@/components/shared/LoadingScreen";
import { LoginBackground } from "@/components/auth/LoginBackground";
import { LoginBranding } from "@/components/auth/LoginBranding";
import { LoginCard } from "@/components/auth/LoginCard";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !loading) {
      router.push("/");
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in with Google.";
      setError(errorMessage);
    }
  };

  const handleEmailLogin = async (email: string, pass: string) => {
    try {
      await signInWithEmail(email, pass);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in with email.";
      setError(errorMessage);
    }
  };


  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Box 
      component="main"
      sx={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      <LoginBackground />
      
      <Container maxWidth="xs" sx={{ zIndex: 10 }}>
        <LoginBranding />
        <LoginCard 
          onGoogleLogin={handleGoogleLogin} 
          onEmailLogin={handleEmailLogin} 
          error={error} 
        />
      </Container>

    </Box>
  );
}


