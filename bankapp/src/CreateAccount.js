import React from 'react';
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createUser } from './api';
import { Button, Typography, Paper, Box, Radio, RadioGroup, FormControl, FormControlLabel, FormLabel, Grid2, Container, Divider } from '@mui/material';
import { keyframes } from '@emotion/react';
import './CreateAccount.css';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to { 
    opacity: 1
  }
`;

const FormInput = ({ name, label, type, validation }) => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div className="form-field">
      <label>{label}</label>
      <input {...register(name, validation)} type={type} className="input" />
      {errors[name] && <span className="error">{errors[name].message}</span>}
    </div>
  );
}

function CreateAccount() {
  const navigate = useNavigate();
  const methods = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      pin: '',
      accountType: '',
      checkingBalance: 0,
      savingsBalance: 0
    }
  })
  const accountType = methods.watch('accountType');

  const onSubmit = async (data) => {
    console.log("Submitting data:", JSON.stringify(data, null, 2));
    try {
      const response = await createUser({
        ...data,
        accountType: data.accountType,
        checkingBalance: data.checkingBalance || 0,
        savingsBalance: data.savingsBalance || 0
      });
      alert('Account created successfully!');
      console.log('User created:', response.data);
      if (response.status === 201) {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  }

  return (
    <Box className="create-account-container">
      <Paper elevation={0} className="card" sx={{ animation: `${fadeIn} 0.8s ease-out forwards` }}>
        <Box className="card-header">
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 600,
              fontSize: { xs: '1.8rem', md: '2.2rem' }
            }}
          >
            Create a New Account
          </Typography>
        </Box>

        <Box className="card-content">
          <FormProvider {...methods}>
            <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
              
              <Grid2 container spacing={2}>
                <Grid2 item xs={12} sm={6}>
                  <FormInput name="firstName" label="First Name" type="text"
                    validation={{
                      required: 'First name is required',
                      minLength: { value: 2, message: 'First name must be at least 2 characters' },
                      pattern: { value: /^[a-zA-Z]+$/, message: 'Only letters are allowed' }
                    }}
                  />
                </Grid2>

                <Grid2 item xs={12} sm={6}>
                  <FormInput name="lastName" label="Last Name" type="text"
                    validation={{
                      required: 'Last name is required',
                      minLength: { value: 2, message: 'Last name must be at least 2 characters' },
                      pattern: { value: /^[a-zA-Z]+$/, message: 'Only letters are allowed' }
                    }}
                  />
                </Grid2>

                <Grid2 item xs={12}>
                  <FormInput name="email" label="Email" type="email"
                    validation={{
                      required: 'Email is required',
                      pattern: { 
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 
                        message: 'Enter a valid email address' 
                      }
                    }}
                  />
                </Grid2>

                <Grid2 item xs={12} sm={6}>
                  <FormInput name="password" label="Password" type="password"
                    validation={{
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Password must be at least 8 characters' }
                    }}
                  />
                </Grid2>

                <Grid2 item xs={12} sm={6}>
                  <FormInput name="pin" label="PIN" type="password"
                    validation={{
                      required: 'PIN is required',
                      minLength: { value: 4, message: 'PIN must be exactly 4 digits' },
                      maxLength: { value: 4, message: 'PIN must be exactly 4 digits' },
                      pattern: { value: /^\d{4}$/, message: 'PIN must contain only numbers' }
                    }}
                  />
                </Grid2>

                <Grid2 item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid2>

                <Grid2 item xs={12}>
                  <Box className="account-type-section">
                    <FormControl component="fieldset" fullWidth>
                      <FormLabel component="legend" sx={{ mb: 1, fontWeight: 500 }}>Account Type</FormLabel>
                      <Controller name="accountType" control={methods.control} defaultValue=""
                        rules={{ required: 'Please select an account type' }}
                        render={({ field, fieldState }) => (
                          <>
                            <RadioGroup row {...field} sx={{ justifyContent: 'center', gap: 2, mb: 1 }}>
                              <FormControlLabel value="checking" control={<Radio sx={{ color: '#2e7d32', '&.Mui-checked': { color: '#2e7d32' } }} />} label="Checking" />
                              <FormControlLabel value="savings" control={<Radio sx={{ color: '#2e7d32', '&.Mui-checked': { color: '#2e7d32' } }} />} label="Savings" />
                              <FormControlLabel value="both" control={<Radio sx={{ color: '#2e7d32', '&.Mui-checked': { color: '#2e7d32' } }} />} label="Both" />
                            </RadioGroup>
                            {fieldState.error && <span className="error">{fieldState.error.message}</span>}
                          </>
                        )}
                      />
                    </FormControl>
                  </Box>
                </Grid2>

                {accountType && (
                  <Grid2 item xs={12}>
                    <Box className="balance-section">
                      <Grid2 container spacing={2}>
                        {(accountType === 'checking' || accountType === 'both') && (
                          <Grid2 item xs={12} sm={accountType === 'both' ? 6 : 12}>
                            <FormInput name="checkingBalance" label="Starting Checking Balance" type="number" 
                              validation={{
                                required: { value: true, message: 'Starting balance is required' },
                                min: { value: 0, message: 'Balance must be at least 0' }
                              }}
                            />
                          </Grid2>
                        )}

                        {(accountType === 'savings' || accountType === 'both') && (
                          <Grid2 item xs={12} sm={accountType === 'both' ? 6 : 12}>
                            <FormInput name="savingsBalance" label="Starting Savings Balance" type="number" 
                              validation={{
                                required: { value: true, message: 'Starting balance is required' },
                                min: { value: 0, message: 'Balance must be at least 0' }
                              }}
                            />
                          </Grid2>
                        )}
                      </Grid2>
                    </Box>
                  </Grid2>
                )}

                <Grid2 item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Button type="submit" variant="contained" fullWidth className="button-primary">
                      Create Account
                    </Button>
                    <Button variant="outlined" onClick={() => navigate(-1)} fullWidth className="button-secondary">
                      Back
                    </Button>
                  </Box>
                </Grid2>
              </Grid2>          
            </form>
          </FormProvider>
        </Box>
      </Paper>
    </Box>
  )
}

export default CreateAccount;