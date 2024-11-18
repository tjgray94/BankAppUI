import axios from 'axios';

const API_BASE_URL = 'http://localhost:5001/api';

export const authenticateUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/login`, credentials);
        return response;
    } catch (error) {
        console.error('Error during authentication:', error);
        throw error;
    }
}

export const getUserById = (userId) => {
    return axios.get(`${API_BASE_URL}/users/${userId}`);
};

export const createUser = (userData) => {
    return axios.post(`${API_BASE_URL}/users`, userData);
};

export const updateAccount = async (userId, accountId, accountData) => {
    return axios.put(`${API_BASE_URL}/users/${userId}/accounts/${accountId}`, accountData);
};

export const transferFunds = async (userId, sourceAccountId, destinationAccountId, amount) => {
    return axios.post(`${API_BASE_URL}/users/${userId}/transfer`, {
        sourceAccountId,
        destinationAccountId,
        amount,
    });
};

export const submitTransaction = async (accountId, transactionData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/accounts/${accountId}/transactions`, {
            type: transactionData.type,
            amount: transactionData.amount,
            sourceAccount: transactionData.sourceAccount,
            destinationAccount: transactionData.destinationAccount,
            timestamp: transactionData.timestamp
        });
        return response.data;
    } catch (error) {
        console.error('Error submitting transaction:', error);
        throw error;
    }
};

export const getTransactionsByAccountId = async (accountId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/accounts/${accountId}/transactions`);
        return response.data;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
};