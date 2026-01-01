"use client";

import React from 'react';
import { Badge, Tooltip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { UserPresence } from '@/lib/presenceService';

// WhatsApp-style green online indicator
const StyledBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#25D366',
    color: '#25D366',
    boxShadow: '0 0 0 2px #111B21',
    width: 12,
    height: 12,
    borderRadius: '50%',
  },
}));

interface ActiveStatusBadgeProps {
  children: React.ReactNode;
  presence?: UserPresence | null;
  showDot?: boolean;
}

export const ActiveStatusBadge: React.FC<ActiveStatusBadgeProps> = ({ 
  children, 
  presence,
  showDot = true 
}) => {
  const isOnline = presence?.state === 'online';
  
  if (!isOnline || !showDot) {
    return <>{children}</>;
  }

  return (
    <Tooltip title="Online" arrow placement="top">
      <StyledBadge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
      >
        {children}
      </StyledBadge>
    </Tooltip>
  );
};
