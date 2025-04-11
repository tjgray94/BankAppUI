import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Box, Stack } from '@mui/material';
import axios from 'axios';
import TransactionHistory from './TransactionHistory';
import { updateAccount, getTransactionsByAccountId, submitTransaction } from './api';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Transfer from './Transfer';
import './Account.css';

const Account = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [amount, setAmount] = useState('');
  const [selectedFunction, setSelectedFunction] = useState(null);
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
              <Button type="button" variant="contained" fullWidth onClick={() => setSelectedFunction('deposit')}>Deposit</Button>
              <Button type="button" variant="contained" fullWidth onClick={() => setSelectedFunction('withdraw')}>Withdraw</Button>
              {accounts.length > 1 && (
                <Button type="button" variant="contained" fullWidth onClick={() => setSelectedFunction('transfer')}>Transfer</Button>
              )}
              <Button type="button" variant="outlined" fullWidth onClick={() => handleBack(false)}>Back</Button>
            </Stack>
          ) : (
            <Stack spacing={2} mt={2}>
              {selectedFunction === 'deposit' && selectedAccount && (
                <Deposit userId={userId} selectedAccount={selectedAccount} updateAccount={updateAccount} 
                  submitTransaction={submitTransaction} setSelectedAccount={setSelectedAccount} setShowTransactionPrompt={setShowTransactionPrompt}
                />
              )}
              {selectedFunction === 'withdraw' && selectedAccount && (
                <Withdraw userId={userId} selectedAccount={selectedAccount} updateAccount={updateAccount} 
                  submitTransaction={submitTransaction} setSelectedAccount={setSelectedAccount} setShowTransactionPrompt={setShowTransactionPrompt}
                />
              )}
              {selectedFunction === 'transfer' && selectedAccount && (
                <Transfer userId={userId} accounts={accounts} selectedAccount={selectedAccount} setAccounts={setAccounts} updateAccount={updateAccount} 
                  submitTransaction={submitTransaction} setSelectedAccount={setSelectedAccount} setShowTransactionPrompt={setShowTransactionPrompt}
                />
              )}
              <Button type="button" variant="outlined" fullWidth onClick={() => handleBack(true)}>Back</Button>
            </Stack>
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