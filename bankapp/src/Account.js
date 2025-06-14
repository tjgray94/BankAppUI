import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Box, Stack, Paper, Divider } from '@mui/material';
import axios from 'axios';
import TransactionHistory from './TransactionHistory';
import { updateAccount, submitTransaction } from './api';
import Deposit from './Deposit';
import Withdraw from './Withdraw';
import Transfer from './Transfer';
import { keyframes } from '@emotion/react';
import './Account.css';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to { 
    opacity: 1
  }
`;

const Account = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [amount, setAmount] = useState('');
  const [selectedFunction, setSelectedFunction] = useState(null);
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

  const handleTransactionHistory = () => {
    setShowHistory(true);
  }

  const handleBackFromHistory = () => {
    setShowHistory(false);
  };

  if (showTransactionPrompt) {
    return (
      <Box className="account-container">
        <Box className="transaction-prompt">
          <Typography variant="h6" gutterBottom>Would you like to make another transaction?</Typography>
          <Stack direction="row" spacing={2} justifyContent="center" mt={3}>
            <Button variant="contained" className="button-primary" onClick={handleContinue}>Yes</Button>
            <Button variant="outlined" className="button-secondary" onClick={handleNo}>No</Button>
          </Stack>
        </Box>
      </Box>
    );
  }

  if (showMessage) {
    return (
      <Box className="account-container">
        <Paper elevation={0} className="card" sx={{ animation: `${fadeIn} 0.8s ease-out forwards` }}>
          <Box className="card-header">
            <Typography variant="h4" sx={{ fontWeight: 600 }}>
              Thank You
            </Typography>
          </Box>
          <Box className="card-content message-container">
            <Typography variant="h6" color="success.main" fontWeight="500">
              Thank you for banking with BankApp
            </Typography>
          </Box>
        </Paper>
      </Box>
    );
  }

  if (showHistory) {
    return (
      <div className="account-container">
        <TransactionHistory userId={userId} accounts={accounts} handleBackFromHistory={handleBackFromHistory} />
      </div>
    );
  }

  return (
    <Box className="account-container">
      <Paper elevation={0} className="card" sx={{ animation: `${fadeIn} 0.8s ease-out forwards` }}>
        <Box className="card-header">
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            {!selectedAccount ? 'Account Overview' : 
              `${selectedAccount.accountType === 'CHECKING' ? 'Checking' : 'Savings'} Account`}
          </Typography>
        </Box>
        
        <Box className="card-content">
          {accounts && accounts.length > 0 ? (
            <>
              {!selectedAccount ? (
                <Stack spacing={2}>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Select an account to manage:
                  </Typography>
                  
                  {accounts.map((account, index) => (
                    <Button 
                      key={account.accountNumber || index} 
                      variant="contained" 
                      fullWidth 
                      className="button-primary"
                      onClick={() => handleAccountSelection(account)}
                    >
                      {account.accountType === 'CHECKING' ? 'Checking' : 'Savings'} Account
                    </Button>
                  ))}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Button 
                    variant="contained" 
                    fullWidth 
                    className="button-primary"
                    onClick={handleTransactionHistory}
                  >
                    Transaction History
                  </Button>
                  
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    className="button-secondary"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </Stack>
              ) : (
                <>
                  <Box className="balance-display">
                    <Typography variant="h6" fontWeight="500">
                      Current Balance
                    </Typography>
                    <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                      ${selectedAccount.balance.toFixed(2)}
                    </Typography>
                  </Box>

                  {!selectedFunction ? (
                    <Stack spacing={2}>
                      <Button 
                        variant="contained" 
                        fullWidth 
                        className="button-primary"
                        onClick={() => setSelectedFunction('deposit')}
                      >
                        Deposit
                      </Button>
                      
                      <Button 
                        variant="contained" 
                        fullWidth 
                        className="button-primary"
                        onClick={() => setSelectedFunction('withdraw')}
                      >
                        Withdraw
                      </Button>
                      
                      {accounts.length > 1 && (
                        <Button 
                          variant="contained" 
                          fullWidth 
                          className="button-primary"
                          onClick={() => setSelectedFunction('transfer')}
                        >
                          Transfer
                        </Button>
                      )}
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        className="button-secondary"
                        onClick={() => handleBack(false)}
                      >
                        Back
                      </Button>
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      {selectedFunction === 'deposit' && selectedAccount && (
                        <Deposit 
                          userId={userId} 
                          selectedAccount={selectedAccount} 
                          updateAccount={updateAccount} 
                          submitTransaction={submitTransaction} 
                          setSelectedAccount={setSelectedAccount} 
                          setShowTransactionPrompt={setShowTransactionPrompt}
                        />
                      )}
                      
                      {selectedFunction === 'withdraw' && selectedAccount && (
                        <Withdraw 
                          userId={userId} 
                          selectedAccount={selectedAccount} 
                          updateAccount={updateAccount} 
                          submitTransaction={submitTransaction} 
                          setSelectedAccount={setSelectedAccount} 
                          setShowTransactionPrompt={setShowTransactionPrompt}
                        />
                      )}
                      
                      {selectedFunction === 'transfer' && selectedAccount && (
                        <Transfer 
                          userId={userId} 
                          accounts={accounts} 
                          selectedAccount={selectedAccount} 
                          setAccounts={setAccounts} 
                          updateAccount={updateAccount} 
                          submitTransaction={submitTransaction} 
                          setSelectedAccount={setSelectedAccount} 
                          setShowTransactionPrompt={setShowTransactionPrompt}
                        />
                      )}
                      
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        className="button-secondary"
                        onClick={() => handleBack(true)}
                      >
                        Back
                      </Button>
                    </Stack>
                  )}
                </>
              )}
            </>
          ) : (
            <Typography>No accounts found.</Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Account;