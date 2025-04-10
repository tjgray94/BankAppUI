import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, TextField, Box, FormControl, RadioGroup, FormControlLabel, Radio, Stack } from '@mui/material';
import axios from 'axios';
import TransactionHistory from './TransactionHistory';
import { updateAccount, transferFunds, getTransactionsByAccountId, submitTransaction } from './api';
import './Account.css';

const Account = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [amount, setAmount] = useState('');
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [sourceAccountType, setSourceAccountType] = useState(null);
  const [destinationAccountType, setDestinationAccountType] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showTransactionPrompt, setShowTransactionPrompt] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!userId) {
        console.error('No userId found in local storage.');
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5001/api/users/${userId}/accounts`);
        setAccounts(response.data);
      } catch (error) {
        console.error('Error fetching accounts:', error);
      }
    };

    if (userId) {
      fetchAccounts();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedAccount) {
      const fetchAccountBalance = async () => {
        try {
          const response = await axios.get(`http://localhost:5001/api/users/${userId}/accounts/${selectedAccount.accountId}`);
          setSelectedAccount(response.data);
        } catch (error) {
          console.error('Error fetching account balance:', error);
        }
      };

      fetchAccountBalance();
    }
  }, [selectedAccount?.accountId, userId]);

  const handleLogout = () => {
    setShowMessage(true);
    setTimeout(() => {
      navigate('/');
    }, 5000);
  }

  const handleAccountSelection = (account) => {
    if (selectedAccount !== account) {
      setSelectedAccount(account);
      setAmount('')
      setSelectedFunction(null);
      setShowHistory(false);
    }
  };

  const handleFunctionSelection = (func) => {
    if (selectedFunction !== func) {
      setSelectedFunction(func);
      setShowHistory(false);
    }
  };

  const handleContinue = () => {
    setShowTransactionPrompt(false);
  };

  const handleNo = () => {
    setShowMessage(true); // Display the logout message
    setShowTransactionPrompt(false); // Hide the transaction prompt
    setTimeout(() => {
      navigate('/');
    }, 5000);
  };

  const handleBack = (fromFunctionPage) => {
    if (fromFunctionPage) {
      if (selectedFunction !== null || amount !== '') {
        setSelectedFunction(null);
        setAmount('');
        setShowHistory(false);
      }
    } else {
      if (selectedAccount !== null || selectedFunction !== null) {
        setSelectedAccount(null);
        setSelectedFunction(null);
        setShowHistory(false);
      }
    }
  };

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

  // Handling transfer selection
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

  const handleTransactionHistory = async () => {
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
      setShowHistory(true);
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      alert('Failed to fetch transaction history.');
    }
  };

  const handleBackFromHistory = () => {
    setShowHistory(false);
  };

  if (showTransactionPrompt) {
    return (
      <Box textAlign="center" mt={8}>
        <Typography variant="h6" gutterBottom>Would you like to make another transaction?</Typography>
        <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
          <Button variant="contained" onClick={handleContinue}>Yes</Button>
          <Button variant="outlined" color="secondary" onClick={handleNo}>No</Button>
        </Stack>
      </Box>
    );
  }

  if (showMessage) {
    return (
      <Box textAlign="center" mt={8}>
        <Typography variant="h5" color="success.main" fontWeight="bold">
          Thank you for banking with BankApp
        </Typography>
      </Box>
    );
  }

  if (showHistory) {
    return (
      <div className="transactionHistoryScreen">
        <TransactionHistory transactions={transactions} handleBackFromHistory={handleBackFromHistory} />
      </div>
    );
  }

  return (
    <div className="container">
      <Typography variant="h4">Account Overview</Typography>
      {accounts && accounts.length > 0 ? (
        <>
        {!selectedAccount ? (
          <Stack spacing={2} mt={2}>
            {accounts.map((account, index) => (
              <Button type="button" variant="contained" fullWidth key={account.accountNumber || index} onClick={() => handleAccountSelection(account)}>
                {account.accountType === 'CHECKING' ? 'Checking' : 'Savings'}
              </Button>
            ))}
            <Button type="button" variant="contained" fullWidth onClick={handleTransactionHistory}>History</Button>
            <Button type="button" variant="outlined" fullWidth onClick={handleLogout}>Logout</Button>
          </Stack>
        ) : (
          <>
          <Typography variant="h6">Balance: ${selectedAccount.balance.toFixed(2)}</Typography>

          {!selectedFunction ? (
            <Stack spacing={2} mt={2}>
              <Button type="button" variant="contained" fullWidth onClick={() => handleFunctionSelection('deposit')}>Deposit</Button>
              <Button type="button" variant="contained" fullWidth onClick={() => handleFunctionSelection('withdraw')}>Withdraw</Button>
              {accounts.length > 1 && (
                <Button type="button" variant="contained" fullWidth onClick={() => handleFunctionSelection('transfer')}>Transfer</Button>
              )}
              <Button type="button" variant="outlined" fullWidth onClick={() => handleBack(false)}>Back</Button>
            </Stack>
          ) : (
            <div className="form">
              <TextField type="number" value={amount} fullWidth margin="normal"
                onChange={(e) => setAmount(e.target.value)}
                label={`Enter amount to ${selectedFunction}`}
              />
              {selectedFunction === 'transfer' && (
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
              )}
              <Stack spacing={2} mt={2}>
                {selectedFunction === 'deposit' && (
                  <Button type="button" variant="contained" fullWidth onClick={handleDeposit} disabled={!amount}>Confirm Deposit</Button>
                )}
                {selectedFunction === 'withdraw' && (
                  <Button type="button" variant="contained" fullWidth onClick={handleWithdraw} disabled={!amount}>Confirm Withdraw</Button>
                )}
                {selectedFunction === 'transfer' && (
                  <Button type="button" variant="contained" fullWidth onClick={handleTransfer} disabled={!amount || !sourceAccountType || !destinationAccountType}>Confirm Transfer</Button>
                )}
                <Button type="button" variant="outlined" fullWidth onClick={() => handleBack(true)}>Back</Button>
              </Stack>
            </div>
          )}
          </>
        )}
        </>
      ) : (
        <Typography>No accounts found.</Typography>
      )}
    </div>
  );
};

export default Account;