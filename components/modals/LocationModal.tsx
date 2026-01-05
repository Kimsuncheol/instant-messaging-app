"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Close as CloseIcon,
  MyLocation as MyLocationIcon,
  LocationOn as LocationIcon,
  Send as SendIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationModalProps {
  open: boolean;
  onClose: () => void;
  onSend: (location: LocationData) => void;
}

const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "250px",
  borderRadius: "8px",
};

const defaultCenter = {
  lat: 37.5665,
  lng: 126.978,
};

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
  ],
};

export const LocationModal: React.FC<LocationModalProps> = ({
  open,
  onClose,
  onSend,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [mapCenter, setMapCenter] = useState(defaultCenter);
  const [manualAddress, setManualAddress] = useState("");
  
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const handleGetCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);
        setMapCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError("Location permission denied.");
            break;
          case err.POSITION_UNAVAILABLE:
            setError("Location unavailable.");
            break;
          case err.TIMEOUT:
            setError("Location request timed out.");
            break;
          default:
            setError("An error occurred.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLocation: LocationData = {
        latitude: e.latLng.lat(),
        longitude: e.latLng.lng(),
      };
      setLocation(newLocation);
    }
  }, []);

  const handleMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setLocation({
        latitude: e.latLng.lat(),
        longitude: e.latLng.lng(),
      });
    }
  }, []);

  const onPlaceSelected = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry?.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setLocation({ latitude: lat, longitude: lng, address: place.formatted_address });
        setMapCenter({ lat, lng });
        setManualAddress(place.formatted_address || "");
      }
    }
  }, []);

  const handleSend = () => {
    if (location) {
      onSend({
        ...location,
        address: manualAddress || location.address || undefined,
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setLocation(null);
    setError(null);
    setManualAddress("");
    onClose();
  };

  if (loadError) {
    return (
      <Dialog open={open} onClose={handleClose}>
        <DialogContent>
          <Typography color="error">Failed to load Google Maps</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "#1F2C34",
          color: "white",
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #2A3942",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LocationIcon sx={{ color: "#00A884" }} />
          <Typography variant="h6">Share Location</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "#8696A0" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {/* Search Box */}
        {isLoaded && (
          <Autocomplete
            onLoad={(autocomplete) => {
              autocompleteRef.current = autocomplete;
            }}
            onPlaceChanged={onPlaceSelected}
          >
            <TextField
              fullWidth
              placeholder="Search for a location..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: "#8696A0", mr: 1 }} />,
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#2A3942",
                  color: "white",
                  "& fieldset": { borderColor: "#2A3942" },
                  "&:hover fieldset": { borderColor: "#00A884" },
                },
              }}
            />
          </Autocomplete>
        )}

        {/* Get Current Location Button */}
        <Button
          fullWidth
          variant="outlined"
          onClick={handleGetCurrentLocation}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MyLocationIcon />}
          sx={{
            color: "#00A884",
            borderColor: "#00A884",
            "&:hover": { borderColor: "#00A884", bgcolor: "rgba(0,168,132,0.1)" },
            mb: 2,
          }}
        >
          {loading ? "Getting Location..." : "Use Current Location"}
        </Button>

        {/* Error Message */}
        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 2, textAlign: "center" }}>
            {error}
          </Typography>
        )}

        {/* Interactive Map */}
        {isLoaded ? (
          <Box sx={{ mb: 2, borderRadius: 2, overflow: "hidden" }}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={location ? 15 : 12}
              center={location ? { lat: location.latitude, lng: location.longitude } : mapCenter}
              onClick={handleMapClick}
              options={mapOptions}
            >
              {location && (
                <Marker
                  position={{ lat: location.latitude, lng: location.longitude }}
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                />
              )}
            </GoogleMap>
            {location && (
              <Typography variant="caption" sx={{ color: "#8696A0", display: "block", mt: 1, textAlign: "center" }}>
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </Typography>
            )}
          </Box>
        ) : (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#00A884" }} />
          </Box>
        )}

        <Divider sx={{ my: 2, borderColor: "#2A3942" }} />

        {/* Note Input */}
        <TextField
          fullWidth
          label="Add a note (optional)"
          placeholder="e.g., Meet me here!"
          value={manualAddress}
          onChange={(e) => setManualAddress(e.target.value)}
          variant="outlined"
          sx={{
            "& .MuiOutlinedInput-root": {
              color: "white",
              "& fieldset": { borderColor: "#2A3942" },
              "&:hover fieldset": { borderColor: "#00A884" },
              "&.Mui-focused fieldset": { borderColor: "#00A884" },
            },
            "& .MuiInputLabel-root": { color: "#8696A0" },
          }}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: "1px solid #2A3942" }}>
        <Button onClick={handleClose} sx={{ color: "#8696A0" }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSend}
          disabled={!location}
          startIcon={<SendIcon />}
          sx={{
            bgcolor: "#00A884",
            "&:hover": { bgcolor: "#008f6f" },
            "&:disabled": { bgcolor: "#2A3942", color: "#8696A0" },
          }}
        >
          Send Location
        </Button>
      </DialogActions>
    </Dialog>
  );
};
