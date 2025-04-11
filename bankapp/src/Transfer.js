import React, { useState } from 'react';
import { transferFunds } from './api';
import { Button, Stack, TextField, FormControl, RadioGroup, FormControlLabel, Radio } from '@mui/material';

const Transfer = ({ userId, accounts, selectedAccount, setAccounts, updateAccount, submitTransaction, setSelectedAccount, setShowTransactionPrompt }) => {
  const [amount, setAmount] = useState('');
  const [sourceAccountType, setSourceAccountType] = useState(null);
  const [destinationAccountType, setDestinationAccountType] = useState(null);

  const handleTransferDirection = (direction) => {
    if (direction === 'checkingToSavings') {
      setSourceAccountType('CHECKING');
      setDestinationAccountType('SAVINGS');
    } else if (direction === 'savingsToChecking') {
      setSourceAccountType('SAVINGS');
      setDestinationAccountType('CHECKING');
    }
  };

  const handleTransfer = async () => {
    const transferAmount = parseFloat(amount);

    if (!isNaN(transferAmount) && transferAmount > 0 && sourceAccountType && destinationAccountType) {
      const sourceAccount = accounts.find(account => account.accountType === sourceAccountType);
      const destinationAccount = accounts.find(account => account.accountType === destinationAccountType);

      if (sourceAccount && destinationAccount && transferAmount <= sourceAccount.balance) {
        setAmount('');

        try {
          // Log the transfer transaction data for debugging
          console.log("Transfer Transaction data:", {
            type: 'TRANSFER',
            sourceAccount: sourceAccount.accountType,
            destinationAccount: destinationAccount.accountType,
            amount: transferAmount,
            timestamp: new Date().toISOString()
          });

          // Transfer funds (logic for updating the backend)
          await transferFunds(userId, sourceAccount.accountId, destinationAccount.accountId, transferAmount);

          // Prepare transaction data for the source account
          const transactionData = {
            type: 'TRANSFER',
            sourceAccount: sourceAccount.accountType,
            destinationAccount: destinationAccount.accountType,
            amount: transferAmount,
            timestamp: new Date().toISOString(),
          };
        
          // Submit transaction for source account
          await submitTransaction(sourceAccount.accountId, transactionData);

          // Update account balances in the frontend
          setAccounts(prevAccounts =>
            prevAccounts.map(acc =>
              acc.accountId === sourceAccount.accountId
                ? { ...acc, balance: acc.balance - transferAmount }
                : acc.accountId === destinationAccount.accountId
                ? { ...acc, balance: acc.balance + transferAmount }
                : acc
            )
          );

          // Update selected account balance if applicable
          if (selectedAccount) {
            if (selectedAccount.accountId === sourceAccount.accountId) {
                setSelectedAccount(prevAccount => ({
                    ...prevAccount,
                    balance: prevAccount.balance - transferAmount, // Deduct from selected source
                }));
            } else if (selectedAccount.accountId === destinationAccount.accountId) {
                setSelectedAccount(prevAccount => ({
                    ...prevAccount,
                    balance: prevAccount.balance + transferAmount, // Add to selected destination
                }));
            }
          }

          alert('Transfer successful!');
          setShowTransactionPrompt(true);
        } catch (error) {
          console.error('Error updating accounts:', error);
          alert('Error updating accounts. Please try again.');
        }
      } else {
        alert('Insufficient balance in source account.');
      }
    } else {
      alert('Please enter a valid amount.');
    }
  };

  return (
    <div className="container">
      <FormControl component="fieldset" margin="normal">
        <RadioGroup name="transferDirection" onChange={(e) => handleTransferDirection(e.target.value)}
          value={sourceAccountType === 'CHECKING' && destinationAccountType === 'SAVINGS'
            ? 'checkingToSavings'
            : sourceAccountType === 'SAVINGS' && destinationAccountType === 'CHECKING'
            ? 'savingsToChecking' : ''
          }
          >
          <FormControlLabel value="checkingToSavings" control={<Radio />} label="Checking to Savings" />
          <FormControlLabel value="savingsToChecking" control={<Radio />} label="Savings to Checking" />
        </RadioGroup>
      </FormControl>

      <Stack spacing={2} mt={2} className="form">
        <TextField type="number" value={amount} fullWidth margin="normal" 
          onChange={(e) => setAmount(e.target.value)} label="Enter transfer amount"
        />
        <Button type="button" variant="contained" fullWidth onClick={handleTransfer} disabled={!amount}>Confirm Transfer</Button>
      </Stack>
    </div>
  )
}

export default Transfer;