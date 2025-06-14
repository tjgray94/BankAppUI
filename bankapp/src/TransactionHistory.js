import React, { useEffect, useState } from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Button, Typography, Box, Stack, Divider } from '@mui/material';
import { getTransactionsByAccountId } from './api';
import { keyframes } from '@emotion/react';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to { 
    opacity: 1
  }
`;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const TransactionHistory = ({ userId, accounts, handleBackFromHistory }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchAllTransactions = async () => {
      try {
        const transactionPromises = accounts.map(account =>
          getTransactionsByAccountId(account.accountId).then(transactions =>
            transactions.map(transaction => ({
              ...transaction,
              accountType: account.accountType,
              timestamp: transaction.timestamp,
              sourceAccount: transaction.sourceAccount || account.accountType,
              destinationAccount: transaction.destinationAccount || account.accountType,
            }))
          )
        );

        const allTransactions = await Promise.all(transactionPromises);
        const formattedTransactions = allTransactions.flat();
        setTransactions(formattedTransactions);
      } catch (error) {
        console.error('Error fetching transaction history:', error);
      }
    };

    if (accounts.length > 0 && userId) {
      fetchAllTransactions();
    }
  }, [accounts, userId]);

  // Sorts transactions in descending order (most recent first)
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <Paper elevation={0} className="card" sx={{ 
      animation: `${fadeIn} 0.8s ease-out forwards`,
      maxWidth: '600px',
      width: '100%'
    }}>
      <Box className="card-header">
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Transaction History
        </Typography>
      </Box>
      
      <Box className="card-content">
        <TableContainer component={Paper} elevation={0} sx={{ 
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid #e0e0e0',
          mb: 3,
          width: '100%'
        }}>
          {transactions.length > 0 ? (
            <Table sx={{ tableLayout: 'fixed' }}>
              <TableHead sx={{ backgroundColor: 'rgba(46, 125, 50, 0.1)' }}>
                <TableRow>
                  <TableCell width="30%" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>Date & Time</TableCell>
                  <TableCell width="20%" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>Type</TableCell>
                  <TableCell width="50%" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>Description</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedTransactions.map((transaction, index) => (
                  <TableRow 
                    key={index}
                    sx={{ 
                      '&:nth-of-type(odd)': { backgroundColor: 'rgba(200, 230, 201, 0.1)' },
                      '&:hover': { backgroundColor: 'rgba(200, 230, 201, 0.2)' }
                    }}
                  >
                    <TableCell>{formatDate(transaction.timestamp)}</TableCell>
                    <TableCell>
                      <Box sx={{ 
                        display: 'inline-block',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        backgroundColor: transaction.type === 'DEPOSIT' 
                          ? 'rgba(46, 125, 50, 0.1)' 
                          : transaction.type === 'WITHDRAW' 
                            ? 'rgba(211, 47, 47, 0.1)' 
                            : 'rgba(33, 150, 243, 0.1)',
                        color: transaction.type === 'DEPOSIT' 
                          ? '#2e7d32' 
                          : transaction.type === 'WITHDRAW' 
                            ? '#d32f2f' 
                            : '#2196f3'
                      }}>
                        {transaction.type}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>
                      {transaction.type === 'TRANSFER'
                        ? <><strong>${transaction.amount}</strong> from {transaction.sourceAccount} to {transaction.destinationAccount}</>
                        : <><strong>${transaction.amount}</strong> {transaction.type === 'DEPOSIT' ? 'to' : 'from'} {transaction.sourceAccount}</>
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography variant="body1" align="center" p={3}>No transactions available</Typography>
          )}
        </TableContainer>
        
        <Button 
          variant="outlined" 
          fullWidth 
          className="button-secondary"
          onClick={handleBackFromHistory}
        >
          Back to Accounts
        </Button>
      </Box>
    </Paper>
  );
}

export default TransactionHistory;