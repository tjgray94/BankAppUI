import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authenticateUser } from './api';
import { Button, TextField, Typography, Paper, Box, Stack, Alert } from '@mui/material';
import { keyframes } from '@emotion/react';
import './Login.css';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to { 
    opacity: 1
  }
`;

const fadeSlideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (data) => {
    const { email, pin } = data;
    setLoginError('');

    try {
      const response = await authenticateUser({ email, pin });
      if (response.data.authenticated) {
        console.log('User authenticated', response.data);
        localStorage.setItem('userId', response.data.userId);
        navigate('/account');
      } else {
        console.error('Authentication failed');
        setLoginError('Invalid email or PIN. Please try again.');
      }
    } catch (error) {
      console.error('Error during authentication:', error);
      setLoginError('Error during authentication. Please try again.');
    }
  };

  return (
    <Box className="login-container">
      <Paper elevation={0} className="card" sx={{ animation: `${fadeIn} 0.8s ease-out forwards` }}>
        <Box className="card-header">
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            Login to BankApp
          </Typography>
        </Box>

        <Box className="card-content">
          <form onSubmit={handleSubmit(handleLogin)} noValidate>
            <Stack spacing={3} sx={{ animation: `${fadeSlideUp} 0.8s ease-out forwards` }}>
              {loginError && (
                <Alert severity="error" sx={{ animation: `${fadeIn} 0.5s ease-out forwards` }}>
                  {loginError}
                </Alert>
              )}
              
              <TextField 
                fullWidth 
                label="Email" 
                variant="outlined" 
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: 'Enter a valid email'
                  }
                })}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#2e7d32',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#2e7d32',
                  }
                }}
              />

              <TextField 
                fullWidth 
                label="PIN" 
                variant="outlined" 
                type="password"
                {...register('pin', {
                  required: 'PIN is required',
                  pattern: {
                    value: /^\d{4}$/,
                    message: 'PIN must be a 4-digit number'
                  }
                })}
                error={!!errors.pin}
                helperText={errors.pin?.message}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#2e7d32',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#2e7d32',
                  }
                }}
              />

              <Box display="flex" gap={2} mt={2}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  fullWidth
                  className="button-primary"
                >
                  Login 
                </Button>
                <Button 
                  type="button" 
                  onClick={() => navigate(-1)} 
                  variant="outlined" 
                  fullWidth
                  className="button-secondary"
                >
                  Back
                </Button>
              </Box>
            </Stack>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};

export default Login;