import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { updateAccount, transferFunds } from './api';
import './Account.css';

const Account = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [amount, setAmount] = useState('');
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [destinationIndex, setDestinationIndex] = useState(1);
  const [showTransactionPrompt, setShowTransactionPrompt] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
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

    fetchAccounts();
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
      setSourceIndex(0);
      setDestinationIndex(1);
    }
  };

  const handleFunctionSelection = (func) => {
    if (selectedFunction !== func) {
      setSelectedFunction(func);
      if (func === 'transfer') {
        if (accounts.length > 1) {
          setSourceIndex(0);
          setDestinationIndex(1);
        }
      }
    }
  };

  const handleContinue = () => {
    setShowTransactionPrompt(false); // Hide the prompt
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
      }
    } else {
      if (selectedAccount !== null || selectedFunction !== null) {
        setSelectedAccount(null);
        setSelectedFunction(null);
        setSourceIndex(0);
        setDestinationIndex(1);
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

  const handleTransfer = async () => {
    const transferAmount = parseFloat(amount);
    if (!isNaN(transferAmount) && transferAmount > 0) {
      if (accounts.length > 1) {
        const sourceAccount = accounts[sourceIndex];
        const destinationAccount = accounts[destinationIndex];
        if (transferAmount <= sourceAccount.balance) {
          setAmount('');
          try {
            await transferFunds(userId, sourceAccount.accountId, destinationAccount.accountId, transferAmount);
            setAccounts(prevAccounts =>
              prevAccounts.map(acc =>
                acc.accountId === sourceAccount.accountId
                  ? { ...acc, balance: acc.balance - transferAmount }
                  : acc.accountId === destinationAccount.accountId
                  ? { ...acc, balance: acc.balance + transferAmount }
                  : acc
              )
            );
            if (selectedAccount && (selectedAccount.accountId === sourceAccount.accountId || selectedAccount.accountId === destinationAccount.accountId)) {
              setSelectedAccount(prevAccount =>
                prevAccount.accountId === sourceAccount.accountId
                  ? { ...prevAccount, balance: prevAccount.balance - transferAmount }
                  : prevAccount.accountId === destinationAccount.accountId
                  ? { ...prevAccount, balance: prevAccount.balance + transferAmount }
                  : prevAccount
              );
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
        alert('Please select both source and destination accounts.');
      }
    } else {
      alert('Please enter a valid amount.');
    }
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

  return (
    <div className="container">
      <h2>Account Overview</h2>
        {accounts && accounts.length > 0 ? (
          <>
          {!selectedAccount ? (
            <div className="buttonContainer">
              {accounts.map((account, index) => (
                <button
                  key={account.accountNumber || index}
                  onClick={() => handleAccountSelection(account)}
                  className="button"
                >
                  {account.accountType === 'CHECKING' ? 'View Checking' : 'View Savings'}
                </button>
              ))}
              <button onClick={handleLogout} className="button">
                Logout
              </button>
            </div>
          ) : (
            <>
              <div className="balance">
                <h3>Balance: ${selectedAccount.balance.toFixed(2)}</h3>
              </div>

              {/* Conditionally show bank function buttons or input box */}
              {!selectedFunction ? (
                <div className="buttonContainer">
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
                    <div className="slider-container">
                      <label>
                        <input
                          type="range"
                          min="0"
                          max={accounts.length - 1}
                          value={sourceIndex}
                          onChange={(e) => {
                            const newSourceIndex = parseInt(e.target.value, 10);
                            setSourceIndex(newSourceIndex);
                            if (newSourceIndex === destinationIndex) {
                              setDestinationIndex((newSourceIndex + 1) % accounts.length);
                            }
                          }}
                          className="slider"
                        />
                        <div className="slider-labels">
                          <span>{accounts[sourceIndex]?.accountType === 'CHECKING' ? 'Checking' : 'Savings'}</span>
                          <span>{accounts[destinationIndex]?.accountType === 'CHECKING' ? 'Checking' : 'Savings'}</span>
                        </div>
                      </label>
                    </div>
                  )}
                  <div className="buttonContainer">
                    {selectedFunction === 'deposit' && (
                      <button onClick={handleDeposit} className="button">Confirm Deposit</button>
                    )}
                    {selectedFunction === 'withdraw' && (
                      <button onClick={handleWithdraw} className="button">Confirm Withdraw</button>
                    )}
                    {selectedFunction === 'transfer' && (
                      <button onClick={handleTransfer} className="button">Confirm Transfer</button>
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