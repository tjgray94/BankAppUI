import React, { useState } from 'react';
import { Button, Stack, TextField } from '@mui/material';

const Deposit = ({ userId, selectedAccount, updateAccount, submitTransaction, setSelectedAccount, setShowTransactionPrompt }) => {
  const [amount, setAmount] = useState('');

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);

    if (!isNaN(depositAmount) && depositAmount > 0) {
      const updatedBalance = selectedAccount.balance + depositAmount;
      setAmount('');

      try {
        await updateAccount(userId, selectedAccount.accountId, { balance: updatedBalance });

        setSelectedAccount(prev => ({ ...prev, balance: updatedBalance }));

        const transactionData = {
          type: 'DEPOSIT',
          sourceAccount: selectedAccount.accountType, // This represents where the money is coming from
          destinationAccount: selectedAccount.accountType, // As a deposit, this can also be the same account
          amount: depositAmount,
          timestamp: new Date().toISOString()
        };

        console.log("Transaction Data Being Sent:", transactionData);

        await submitTransaction(selectedAccount.accountId, transactionData);

        alert('Deposit successful!');
        setShowTransactionPrompt(true);
      } catch (error) {
        console.error('Error updating account:', error);
        alert('Error updating account. Please try again.');
      }
    } else {
      alert('Please enter a valid amount.');
    }
  };

  return (
    <div className="container">
      <Stack spacing={2} mt={2} className="form">
        <TextField type="number" value={amount} fullWidth margin="normal" 
          onChange={(e) => setAmount(e.target.value)} label={'Enter deposit amount'}
        />
        <Button type="button" variant="contained" fullWidth onClick={handleDeposit} disabled={!amount}>Confirm Deposit</Button>
      </Stack>
    </div>
  )
}

export default Deposit;