"use client";

import React, { useState } from "react";
import { ChatSearchBar } from "./ChatSearchBar";
import { ChatListDefaultHeader } from "./ChatListDefaultHeader";

interface ChatPanelHeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  totalMatches: number;
}

export const ChatPanelHeader: React.FC<ChatPanelHeaderProps> = ({
  searchTerm,
  onSearchChange,
  totalMatches,
}) => {
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearchClick = () => {
    setSearchOpen(true);
  };

  const handleSearchClose = () => {
    setSearchOpen(false);
    onSearchChange(""); // Clear search term when closing
  };

  return (
    <>
      {searchOpen ? (
        // Render ChatSearchBar when search is open
        <ChatSearchBar
          searchTerm={searchTerm}
          onSearch={onSearchChange}
          currentMatchIndex={0}
          totalMatches={totalMatches}
          onNext={() => {}}
          onPrev={() => {}}
          onClose={handleSearchClose}
        />
      ) : (
        // Render extracted header component when search is closed
        <ChatListDefaultHeader onSearchClick={handleSearchClick} />
      )}
    </>
  );
};

