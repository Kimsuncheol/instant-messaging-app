"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { 
  Dialog, 
  Box, 
  IconButton, 
  CircularProgress, 
  Button, 
  Typography, 
  Fab 
} from "@mui/material";
import { 
  Close as CloseIcon, 
  Cameraswitch as SwitchCameraIcon, 
  Check as SendIcon,
  Refresh as RetakeIcon,
  Warning as WarningIcon
} from "@mui/icons-material";

interface CameraModalProps {
  open: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ open, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Check for multiple cameras
  useEffect(() => {
    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      } catch (err) {
        console.error("Error checking cameras:", err);
      }
    };
    
    if (open) {
      checkCameras();
    }
  }, [open]);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Unable to access camera. Please check permissions.");
    } finally {
      setLoading(false);
    }
  }, [facingMode, stream]);

  // Initial load effect
  useEffect(() => {
    if (open && !capturedImage) {
      startCamera();
    } else {
      // Cleanup when closed
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [open, capturedImage, startCamera, stream]);

  const handleClose = () => {
    setCapturedImage(null);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    onClose();
  };

  const handleSwitchCamera = () => {
    setFacingMode(prev => prev === "user" ? "environment" : "user");
    // Effect dependent on facingMode, or call startCamera manually depending on implementation
    // Since startCamera is in dependency of useEffect[facingMode] if we added it, but here we call it manually
    setStream(null); // Force restart via effect or manual
    setTimeout(() => startCamera(), 100);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw frame
      const context = canvas.getContext('2d');
      if (context) {
        // Mirror if user facing
        if (facingMode === 'user') {
          context.translate(canvas.width, 0);
          context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get data URL for preview
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        
        // Stop stream to save battery/processing
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
          setStream(null);
        }
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    // Camera will restart automatically due to useEffect dependence on capturedImage being null
  };

  const handleSend = () => {
    if (capturedImage) {
      // Convert base64 to File
      fetch(capturedImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `camera_${Date.now()}.jpg`, { type: "image/jpeg" });
          onCapture(file);
          handleClose();
        });
    }
  };

  return (
    <Dialog 
      fullScreen 
      open={open} 
      onClose={handleClose}
      sx={{ 
        '& .MuiDialog-paper': { 
          bgcolor: 'black',
          backgroundImage: 'none'
        } 
      }}
    >
      <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Actions */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            p: 2, 
            zIndex: 10,
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <IconButton onClick={handleClose} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.3)' }}>
            <CloseIcon />
          </IconButton>
          
          {hasMultipleCameras && !capturedImage && (
            <IconButton onClick={handleSwitchCamera} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.3)' }}>
              <SwitchCameraIcon />
            </IconButton>
          )}
        </Box>

        {/* Content Area */}
        <Box 
          sx={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            overflow: 'hidden',
            bgcolor: '#000'
          }}
        >
          {error ? (
            <Box sx={{ textAlign: 'center', color: 'white', p: 3 }}>
              <WarningIcon sx={{ fontSize: 48, color: '#f44336', mb: 2 }} />
              <Typography>{error}</Typography>
              <Button onClick={() => startCamera()} sx={{ mt: 2 }} variant="outlined" color="inherit">
                Retry
              </Button>
            </Box>
          ) : capturedImage ? (
            <img 
              src={capturedImage} 
              alt="Captured" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          ) : (
            <>
              {loading && <CircularProgress sx={{ position: 'absolute', color: 'white' }} />}
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted // Muted needed for autoplay on many mobile browsers
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' 
                }} 
              />
            </>
          )}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </Box>

        {/* Footer Controls */}
        <Box 
          sx={{ 
            position: 'absolute', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            height: 120, // ensure enough hit area
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            paddingBottom: 4,
            background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
          }}
        >
          {capturedImage ? (
            <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <Fab 
                color="inherit" // turns white/grey
                onClick={handleRetake}
                sx={{ bgcolor: '#455A64', color: 'white', '&:hover': { bgcolor: '#37474F' } }}
              >
                <RetakeIcon />
              </Fab>
              
              <Fab 
                color="primary" 
                onClick={handleSend}
                sx={{ 
                  width: 72, 
                  height: 72, 
                  bgcolor: '#00A884', 
                  '&:hover': { bgcolor: '#008f6f' }
                }}
              >
                <SendIcon sx={{ fontSize: 32 }} />
              </Fab>
            </Box>
          ) : (
            !error && !loading && (
              <IconButton 
                onClick={takePhoto}
                sx={{ 
                  width: 80, 
                  height: 80, 
                  border: '4px solid white', 
                  p: 0,
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    right: 4,
                    bottom: 4,
                    bgcolor: 'white',
                    borderRadius: '50%',
                    opacity: 0.8
                  },
                  '&:active': {
                    transform: 'scale(0.95)'
                  }
                }}
              />
            )
          )}
        </Box>

      </Box>
    </Dialog>
  );
};
