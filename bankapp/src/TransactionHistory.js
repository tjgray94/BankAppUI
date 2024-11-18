import React from 'react';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper, Button } from '@mui/material';
import './TransactionHistory.css';

const TransactionHistory = ({ transactions, handleBackFromHistory }) => {
    // Sorts transactions in descending order (most recent first)
    const sortedTransactions = transactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return (
        <TableContainer component={Paper} className="history-section" style={{ maxWidth: '90%', margin: '0 auto' }}>
            <div className="history-header">
                <h3>Transaction History</h3>
                <Button onClick={handleBackFromHistory} variant="contained" color="primary" className="backButton">
                    Back
                </Button>
            </div>
            {transactions.length > 0 ? (
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell>Description</TableCell>
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
                                        : `$${transaction.amount} ${transaction.type === 'DEPOSIT' ? 'to' : 'from'} ${transaction.sourceAccount}`}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <p>No transactions available</p>
            )}
        </TableContainer>
    );
}

export default TransactionHistory;