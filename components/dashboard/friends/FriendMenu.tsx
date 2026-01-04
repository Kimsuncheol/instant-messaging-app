"use client";

import React from "react";
import {
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  PersonRemove as RemoveIcon,
} from "@mui/icons-material";

interface FriendMenuProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  isFavourited: boolean;
  onFavouriteToggle: () => void;
  onRemoveFriend: () => void;
}

export const FriendMenu: React.FC<FriendMenuProps> = ({
  anchorEl,
  open,
  onClose,
  isFavourited,
  onFavouriteToggle,
  onRemoveFriend,
}) => {
  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      PaperProps={{
        sx: {
          bgcolor: "#233138",
          color: "#E9EDEF",
          minWidth: 180,
        },
      }}
    >
      <MenuItem 
        onClick={onFavouriteToggle} 
        sx={{ py: 1.5, "&:hover": { bgcolor: "#182229" } }}
      >
        <ListItemIcon>
          {isFavourited ? (
            <StarIcon sx={{ color: "#FFD700" }} />
          ) : (
            <StarBorderIcon sx={{ color: "#AEBAC1" }} />
          )}
        </ListItemIcon>
        <ListItemText>
          {isFavourited ? "Remove from Favourites" : "Add to Favourites"}
        </ListItemText>
      </MenuItem>
      <MenuItem 
        onClick={onRemoveFriend} 
        sx={{ py: 1.5, "&:hover": { bgcolor: "#182229" } }}
      >
        <ListItemIcon>
          <RemoveIcon sx={{ color: "#F15C6D" }} />
        </ListItemIcon>
        <ListItemText>Remove Friend</ListItemText>
      </MenuItem>
    </Menu>
  );
};
