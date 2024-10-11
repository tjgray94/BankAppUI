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
}