import React from 'react';
import { Button, Typography, Box, Stack, Paper, Avatar } from '@mui/material';
import { Link } from 'react-router-dom';
import { keyframes } from '@emotion/react';
import './Home.css';

const fadeSlideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to { 
    opacity: 1
  }
`;

function Home() {
	return (
    <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100vh"
      sx={{ background: 'linear-gradient(135deg, #e0f7fa, #80deea, #26c6da)' }}
    >
      <Avatar alt="BankApp Logo" src="/bankapp_icon.png"
        sx={{ width: 100, height: 100, marginBottom: 3, animation: `${fadeIn} 2s ease-out forwards` }}
      />

      <Paper elevation={3} sx={{ p: 6, textAlign: 'center', minWidth: 300 }}>
        <Typography variant="h3" gutterBottom sx={{animation: `${fadeSlideDown} 1s ease-out forwards`}}>Welcome to BankApp!</Typography>
        <Typography variant="subtitle1" gutterBottom sx={{animation: `${fadeSlideUp} 1s ease-out 0.4s forwards`, opacity: 0}}>Your trusted partner in banking.</Typography>

        <Stack spacing={2} direction="row" justifyContent="center" mt={4}>
          <Button variant="contained" component={Link} to="/create-account"
            sx={{ backgroundColor: '#007BFF', '&:hover': { backgroundColor: '#0056b3' } }}
          >
            Create Account
          </Button>
          <Button variant="outlined" component={Link} to="/login"
            sx={{ color: '#007BFF', borderColor: '#007BFF', '&:hover': { color: '#0056b3', borderColor: '#0056b3' }, opacity: 0, animation: `${fadeIn} 1s ease-out 1s forwards` }}
          >
            Login
          </Button>
        </Stack>
      </Paper>
    </Box>
	)
}

export default Home;