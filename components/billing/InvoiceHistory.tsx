"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Box,
  Stack,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Download as DownloadIcon,
  OpenInNew as OpenIcon,
  Receipt as ReceiptIcon,
} from "@mui/icons-material";
import { Invoice } from "@/types/billing";
import { formatPrice } from "@/lib/billingService";

interface InvoiceHistoryProps {
  invoices: Invoice[];
  loading?: boolean;
}

const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({
  invoices,
  loading = false,
}) => {
  const theme = useTheme();

  const getStatusColor = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return theme.palette.success.main;
      case "pending":
        return theme.palette.warning.main;
      case "failed":
        return theme.palette.error.main;
      default:
        return theme.palette.text.secondary;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (invoices.length === 0 && !loading) {
    return (
      <Box
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <ReceiptIcon sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
        <Typography variant="h6" color="text.secondary">
          No invoices yet
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Your invoice history will appear here
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight={600}>
        Invoice History
      </Typography>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ borderRadius: 2 }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                sx={{
                  "&:hover": {
                    bgcolor: alpha(theme.palette.action.hover, 0.5),
                  },
                }}
              >
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(invoice.createdAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{invoice.description}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    {formatPrice(invoice.amount, invoice.currency)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={
                      invoice.status.charAt(0).toUpperCase() +
                      invoice.status.slice(1)
                    }
                    size="small"
                    sx={{
                      bgcolor: alpha(getStatusColor(invoice.status), 0.1),
                      color: getStatusColor(invoice.status),
                      fontWeight: 500,
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 0.5,
                    }}
                  >
                    {invoice.invoiceUrl && (
                      <IconButton
                        size="small"
                        onClick={() =>
                          window.open(invoice.invoiceUrl, "_blank")
                        }
                        title="View Invoice"
                      >
                        <OpenIcon fontSize="small" />
                      </IconButton>
                    )}
                    {invoice.invoicePdfUrl && (
                      <IconButton
                        size="small"
                        onClick={() =>
                          window.open(invoice.invoicePdfUrl, "_blank")
                        }
                        title="Download PDF"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );
};

export default InvoiceHistory;
