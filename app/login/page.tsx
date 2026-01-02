"use client";

import { useEffect, useState } from "react";
import { signInWithGoogle, signInWithEmail } from "@/lib/authService";
import { useAuth } from "@/context/AuthContext";

import { useRouter } from "next/navigation";
import { Box, Container, Typography } from "@mui/material";
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
        
        <Box sx={{ mt: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2" sx={{ color: '#8696A0' }}>
            New to WhatsApp?{' '}
            <span 
              onClick={() => router.push('/signup')}
              style={{ 
                color: '#00A884', 
                cursor: 'pointer', 
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Sign up
            </span>
          </Typography>
          
          <Typography variant="body2" sx={{ color: '#8696A0' }}>
            Forgot your password?{' '}
            <span 
              onClick={() => router.push('/reset-password')}
              style={{ 
                color: '#00A884', 
                cursor: 'pointer', 
                fontWeight: 600,
                textDecoration: 'none'
              }}
            >
              Reset Password
            </span>
          </Typography>
        </Box>
      </Container>

    </Box>
  );
}


