"use client";

import { createTheme } from "@mui/material/styles";

// WhatsApp color palette
const whatsappColors = {
  // Primary teal/green
  tealGreen: "#00A884",
  tealGreenDark: "#008069",
  lightGreen: "#25D366",
  
  // Dark mode backgrounds
  panelBg: "#111B21",
  panelBgDeep: "#0B141A",
  conversationBg: "#0B141A",
  headerBg: "#202C33",
  
  // Message bubbles
  outgoingBubble: "#005C4B",
  incomingBubble: "#202C33",
  
  // Text colors
  primaryText: "#E9EDEF",
  secondaryText: "#8696A0",
  
  // Borders & dividers
  border: "#2A3942",
  divider: "#2A3942",
  
  // Hover states
  hoverBg: "#2A3942",
  activeBg: "#2A3942",
  
  // Input
  inputBg: "#2A3942",
  searchBg: "#111B21",
};

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: whatsappColors.tealGreen,
      dark: whatsappColors.tealGreenDark,
      light: whatsappColors.lightGreen,
    },
    secondary: {
      main: whatsappColors.secondaryText,
    },
    background: {
      default: whatsappColors.conversationBg,
      paper: whatsappColors.panelBg,
    },
    text: {
      primary: whatsappColors.primaryText,
      secondary: whatsappColors.secondaryText,
    },
    divider: whatsappColors.divider,
  },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", Helvetica, "Lucida Grande", Arial, sans-serif',
    h5: {
      fontWeight: 500,
      fontSize: "1.1rem",
    },
    h6: {
      fontWeight: 500,
      fontSize: "1rem",
    },
    body1: {
      fontSize: "0.9375rem",
    },
    body2: {
      fontSize: "0.8125rem",
    },
    caption: {
      fontSize: "0.6875rem",
      color: whatsappColors.secondaryText,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 500,
        },
        contained: {
          backgroundColor: whatsappColors.tealGreen,
          "&:hover": {
            backgroundColor: whatsappColors.tealGreenDark,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: whatsappColors.panelBg,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: whatsappColors.panelBg,
          borderRight: `1px solid ${whatsappColors.border}`,
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: whatsappColors.hoverBg,
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: whatsappColors.hoverBg,
          },
          "&.Mui-selected": {
            backgroundColor: whatsappColors.activeBg,
            "&:hover": {
              backgroundColor: whatsappColors.activeBg,
            },
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: whatsappColors.inputBg,
            borderRadius: 8,
            "& fieldset": {
              border: "none",
            },
            "&:hover fieldset": {
              border: "none",
            },
            "&.Mui-focused fieldset": {
              border: "none",
            },
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: whatsappColors.secondaryText,
          "&:hover": {
            backgroundColor: whatsappColors.hoverBg,
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: whatsappColors.headerBg,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: whatsappColors.divider,
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          },
        },
      },
    },
  },
});

export default theme;
export { whatsappColors };
