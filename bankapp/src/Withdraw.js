import React, { useState } from 'react';
import { Button, Stack, TextField } from '@mui/material';

const Withdraw = ({ userId, selectedAccount, updateAccount, submitTransaction, setSelectedAccount, setShowTransactionPrompt }) => {
  const [amount, setAmount] = useState('');

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    if (!isNaN(withdrawAmount) && withdrawAmount > 0) {
      if (withdrawAmount <= selectedAccount.balance) {
        const updatedBalance = selectedAccount.balance - withdrawAmount;
        setAmount('');
        try {
          await updateAccount(userId, selectedAccount.accountId, { balance: updatedBalance });
          setSelectedAccount(prev => ({ ...prev, balance: updatedBalance }));

          const transactionData = {
            type: 'WITHDRAW',
            sourceAccount: selectedAccount.accountType, // This represents where the money is coming from
            destinationAccount: selectedAccount.accountType, // As a deposit, this can also be the same account
            amount: withdrawAmount,
            timestamp: new Date().toISOString()
          };

          await submitTransaction(selectedAccount.accountId, transactionData);

          alert('Withdrawal successful!');
          setShowTransactionPrompt(true);
      } catch (error) {
          console.error('Error updating account:', error);
          alert('Error updating account. Please try again.');
      }
      } else {
        alert('Insufficient balance.');
      }
    } else {
      alert('Please enter a valid amount.');
    }
  };

  return (
    <div className="container">
      <Stack spacing={2} mt={2} className="form">
        <TextField type="number" value={amount} fullWidth margin="normal" 
          onChange={(e) => setAmount(e.target.value)} label={'Enter withdraw amount'}
        />
        <Button type="button" variant="contained" fullWidth onClick={handleWithdraw} disabled={!amount}>Confirm Withdraw</Button>
      </Stack>
    </div>
  )
}

export default Withdraw;