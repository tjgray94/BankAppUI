import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <p>Would you like to make another transaction?</p>
        <button onClick={handleContinue} className="button">
          Yes
        </button>
        <button onClick={handleNo} className="button">
          No
        </button>
      </div>
    );
  }

  if (showMessage) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', fontSize: '24px', color: 'green' }}>
        Thank you for banking with BankApp
      </div>
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
      <h2>Account Overview</h2>
        {accounts && accounts.length > 0 ? (
          <>
          {!selectedAccount ? (
            <div className="buttonContainer">
              <div className="accountButtons">
                {accounts.map((account, index) => (
                  <button
                    key={account.accountNumber || index}
                    onClick={() => handleAccountSelection(account)}
                    className="button"
                  >
                    {account.accountType === 'CHECKING' ? 'Checking' : 'Savings'}
                  </button>
                ))}
                <button onClick={handleTransactionHistory} className="button">History</button>
              </div>
              <button onClick={handleLogout} className="button logoutButton">Logout</button>
            </div>
          ) : (
            <>
              <div className="balance">
                <h3>Balance: ${selectedAccount.balance.toFixed(2)}</h3>
              </div>

              {!selectedFunction ? (
                <div className="buttonContainerTwo">
                  <button onClick={() => handleFunctionSelection('deposit')} className="button">Deposit</button>
                  <button onClick={() => handleFunctionSelection('withdraw')} className="button">Withdraw</button>
                  {accounts.length > 1 && (
                    <button onClick={() => handleFunctionSelection('transfer')} className="button">Transfer</button>
                  )}
                  <button onClick={() => handleBack(false)} className="backButton">Back</button>
                </div>
              ) : (
                <div className="form">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Enter amount to ${selectedFunction}`}
                    className="input"
                  />
                  {selectedFunction === 'transfer' && (
                    <div className="radio-container">
                      <label>
                        <input
                          type="radio"
                          name="transferDirection"
                          value="checkingToSavings"
                          checked={sourceAccountType === 'CHECKING' && destinationAccountType === 'SAVINGS'}
                          onChange={() => handleTransferDirection('checkingToSavings')}
                          className="radio-button"
                        />
                        Checking to Savings
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="transferDirection"
                          value="savingsToChecking"
                          checked={sourceAccountType === 'SAVINGS' && destinationAccountType === 'CHECKING'} 
                          onChange={() => handleTransferDirection('savingsToChecking')}
                          className="radio-button"
                        />
                        Savings to Checking
                      </label>
                    </div>
                  )}
                  <div className="buttonContainer">
                    {selectedFunction === 'deposit' && (
                      <button onClick={handleDeposit} className="button" disabled={!amount}>Confirm Deposit</button>
                    )}
                    {selectedFunction === 'withdraw' && (
                      <button onClick={handleWithdraw} className="button" disabled={!amount}>Confirm Withdraw</button>
                    )}
                    {selectedFunction === 'transfer' && (
                      <button onClick={handleTransfer} className="button" disabled={!amount || !sourceAccountType || !destinationAccountType}>Confirm Transfer</button>
                    )}
                    <button onClick={() => handleBack(true)} className="backButton">Back</button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <p>Loading account details...</p>
      )}
    </div>
  );
};

export default Account;