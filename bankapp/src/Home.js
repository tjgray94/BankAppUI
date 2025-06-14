import React from 'react';
import { Button, Typography, Box, Stack, Paper, Avatar, Container } from '@mui/material';
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
    <Box className="home-container">
      <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box className="logo-container">
          <Avatar 
            alt="BankApp Logo" 
            src="/bankapp_icon.png"
            className="logo"
            sx={{ 
              width: 120, 
              height: 120, 
              animation: `${fadeIn} 1.5s ease-out forwards` 
            }}
          />
        </Box>

        <Paper elevation={0} className="card">
          <Box className="card-header">
            <Typography 
              variant="h3" 
              align="center"
              sx={{ 
                fontWeight: 600, 
                animation: `${fadeSlideDown} 1s ease-out forwards`,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Welcome to BankApp
            </Typography>
          </Box>
          
          <Box className="card-content">
            <Typography 
              variant="h6" 
              align="center" 
              color="text.secondary"
              sx={{ 
                animation: `${fadeSlideUp} 1s ease-out 0.4s forwards`, 
                opacity: 0,
                mb: 4,
                fontWeight: 400
              }}
            >
              Your trusted partner for secure and efficient banking
            </Typography>

            <Stack 
              spacing={3} 
              direction={{ xs: 'column', sm: 'row' }} 
              justifyContent="center" 
              mt={3}
              sx={{ animation: `${fadeIn} 1s ease-out 0.8s forwards`, opacity: 0 }}
            >
              <Button 
                variant="contained" 
                component={Link} 
                to="/create-account"
                size="large"
                className="button-primary"
                fullWidth
              >
                Create Account
              </Button>
              <Button 
                variant="outlined" 
                component={Link} 
                to="/login"
                size="large"
                className="button-secondary"
                fullWidth
              >
                Login
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Home;