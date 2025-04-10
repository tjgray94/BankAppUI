import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Button, Typography, Box, Stack, Divider } from '@mui/material';

const TransactionHistory = ({ transactions, handleBackFromHistory }) => {
  // Sorts transactions in descending order (most recent first)
  const sortedTransactions = transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <Box sx={{ maxWidth: '90%', margin: '2rem auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" gutterBottom>Transaction History</Typography>
        <Button onClick={handleBackFromHistory} variant="outlined">Back</Button>
      </Stack>

      <Divider sx={{ mb: 2 }} />

      <TableContainer component={Paper} elevation={3}>
        {transactions.length > 0 ? (
          <Table>
            <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
              <TableRow>
                <TableCell><strong>Timestamp</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedTransactions.map((transaction, index) => (
                <TableRow key={index}>
                  <TableCell>{transaction.timestamp}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>
                    {transaction.type === 'TRANSFER'
                      ? `$${transaction.amount} from ${transaction.sourceAccount} to ${transaction.destinationAccount}`
                      : `$${transaction.amount} ${transaction.type === 'DEPOSIT' ? 'to' : 'from'} ${transaction.sourceAccount}`
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body1" align="center" p={2}>No transactions available</Typography>
        )}
      </TableContainer>
    </Box>
  );
}

export default TransactionHistory;