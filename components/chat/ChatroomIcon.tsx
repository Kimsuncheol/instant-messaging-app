import React from "react";
import {
  Folder as FolderIcon,
  Star as StarIcon,
  Bookmark as BookmarkIcon,
  Favorite as HeartIcon,
  Lightbulb as LightbulbIcon,
} from "@mui/icons-material";
import { IconShape } from "@/lib/memoChatroomService";

interface ChatroomIconProps {
  shape?: IconShape;
  color?: string;
  sx?: React.CSSProperties;
}

export const ChatroomIcon: React.FC<ChatroomIconProps> = ({
  shape = "folder",
  color = "#FFA726",
  sx,
}) => {
  const iconProps = { sx: { color, ...sx } };

  switch (shape) {
    case "star":
      return <StarIcon {...iconProps} />;
    case "bookmark":
      return <BookmarkIcon {...iconProps} />;
    case "heart":
      return <HeartIcon {...iconProps} />;
    case "lightbulb":
      return <LightbulbIcon {...iconProps} />;
    case "folder":
    default:
      return <FolderIcon {...iconProps} />;
  }
};
