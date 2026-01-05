import React from 'react';
import { Box, IconButton, InputBase, Typography } from '@mui/material';
import { 
  KeyboardArrowUp as UpIcon, 
  KeyboardArrowDown as DownIcon, 
  Close as CloseIcon,
  Search as SearchIcon
} from '@mui/icons-material';

interface ChatSearchBarProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  currentMatchIndex: number;
  totalMatches: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export const ChatSearchBar: React.FC<ChatSearchBarProps> = ({
  searchTerm,
  onSearch,
  currentMatchIndex,
  totalMatches,
  onNext,
  onPrev,
  onClose,
}) => {
  return (
    <Box
      sx={{
        height: 60,
        bgcolor: '#202C33',
        display: 'flex',
        alignItems: 'center',
        px: 2,
        borderBottom: '1px solid #2A3942',
        width: '100%',
      }}
    >
      <Box
        sx={{
          flex: 1,
          bgcolor: '#2A3942',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          mr: 2,
          height: 36,
        }}
      >
        <SearchIcon sx={{ color: '#8696A0', fontSize: 20, mr: 1 }} />
        <InputBase
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearch(e.target.value)}
          autoFocus
          fullWidth
          sx={{
            color: '#E9EDEF',
            fontSize: '0.9375rem',
            '& ::placeholder': {
              color: '#8696A0',
              opacity: 1,
            },
          }}
        />
        {totalMatches > 0 && (
          <Typography sx={{ color: '#8696A0', fontSize: '0.8125rem', ml: 1, whiteSpace: 'nowrap' }}>
            {currentMatchIndex + 1} of {totalMatches}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton 
          onClick={onPrev} 
          disabled={totalMatches === 0}
          size="small"
          sx={{ color: '#AEBAC1', mr: 0.5 }}
        >
          <UpIcon />
        </IconButton>
        <IconButton 
          onClick={onNext} 
          disabled={totalMatches === 0}
          size="small"
          sx={{ color: '#AEBAC1', mr: 1.5 }}
        >
          <DownIcon />
        </IconButton>
        <IconButton onClick={onClose} sx={{ color: '#AEBAC1' }}>
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>
  );
};
