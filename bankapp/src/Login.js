import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authenticateUser } from './api';
import { Button, TextField, Typography, Paper, Box, Stack } from '@mui/material';
import './Login.css';

const Login = () => {
	const { register, handleSubmit, formState: { errors } } = useForm();
	const navigate = useNavigate();

	const handleLogin = async (data) => {
		const { email, pin } = data;

		try {
			const response = await authenticateUser({ email, pin });
			if (response.data.authenticated) {
				console.log('User authenticated', response.data);
				localStorage.setItem('userId', response.data.userId);
				navigate('/account');
			} else {
				console.error('Authentication failed');
				alert('Invalid email or PIN');
			}
		} catch (error) {
			console.error('Error during authentication:', error);
			alert('Error during authentication. Please try again.');
		}
	};

	return (
		<div className="login-container">
      <Paper elevation={4} className="login-paper">
        <Typography variant="h5" align="center" gutterBottom>Bank App Login</Typography>

        <form onSubmit={handleSubmit(handleLogin)} noValidate>
          <Stack spacing={2}>
            <TextField fullWidth label="Email" variant="outlined" type="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                  message: 'Enter a valid email'
                }
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField fullWidth label="PIN" variant="outlined" type="password"
              {...register('pin', {
                required: 'PIN is required',
                pattern: {
                  value: /^\d{4}$/,
                  message: 'PIN must be a 4-digit number'
                }
              })}
              error={!!errors.pin}
              helperText={errors.pin?.message}
            />

            <Box display="flex" gap={2}>
              <Button type="submit" variant="contained" fullWidth
                sx={{backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20'}}}
              >
                Login 
              </Button>
              <Button type="button" onClick={() => navigate(-1)} variant="outlined" fullWidth
                sx={{color: '#2E7D32', borderColor: '#2E7D32', '&:hover': {borderColor: '#1B5E20', color: '#1B5E20'}}}  
              >
                Back
              </Button>
            </Box>
          </Stack>
        </form>
      </Paper>	
		</div>
	)
}

export default Login;