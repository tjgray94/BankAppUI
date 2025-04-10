import React from 'react';
import { useForm, FormProvider, useFormContext, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createUser } from './api';
import { Button, Typography, Paper, Box, Stack, Radio, RadioGroup, FormControl, FormControlLabel, FormLabel, Grid2 } from '@mui/material';
import './CreateAccount.css';

const FormInput = ({ name, label, type, validation }) => {
  const { register, formState: { errors } } = useFormContext();
  return (
    <div>
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
    <Paper elevation={4} sx={{ padding: 4, maxWidth: 600, mx: 'auto', borderRadius: 2 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Create a New Account
      </Typography>

      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
          
          <Grid2 container spacing={2}>
            <Grid2 item xs={12}>
              <FormInput name="firstName" label="First Name: " type="text"
                validation={{
                  required: 'First name is required',
                  minLength: { value: 2, message: 'First name must be at least 2 characters' },
                  pattern: { value: /^[a-zA-Z]+$/, message: 'Only letters are allowed' }
                }}
              />
            </Grid2>

            <Grid2 item xs={12}>
              <FormInput name="lastName" label="Last Name: " type="text"
                validation={{
                  required: 'Last name is required',
                  minLength: { value: 2, message: 'Last name must be at least 2 characters' },
                  pattern: { value: /^[a-zA-Z]+$/, message: 'Only letters are allowed' }
                }}
              />
            </Grid2>

            <Grid2 item xs={12}>
              <FormInput name="email" label="Email: " type="email"
                validation={{
                  required: 'Email is required',
                  pattern: { 
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 
                    message: 'Enter a valid email address' 
                  }
                }}
              />
            </Grid2>

            <Grid2 item xs={12}>
              <FormInput name="password" label="Password: " type="password"
                validation={{
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                }}
              />
            </Grid2>

            <Grid2 item xs={12}>
              <FormInput name="pin" label="PIN: " type="password"
                validation={{
                  required: 'PIN is required',
                  minLength: { value: 4, message: 'PIN must be exactly 4 digits' },
                  maxLength: { value: 4, message: 'PIN must be exactly 4 digits' },
                  pattern: { value: /^\d{4}$/, message: 'PIN must contain only numbers' }
                }}
              />
            </Grid2>

            <Grid2 item xs={12}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Account Type</FormLabel>
                <Controller name="accountType" control={methods.control} defaultValue=""
                  rules={{ required: 'Please select an account type' }}
                  render={({ field }) => (
                    <RadioGroup row {...field}>
                      <FormControlLabel value="checking" control={<Radio />} label="Checking" />
                      <FormControlLabel value="savings" control={<Radio />} label="Savings" />
                      <FormControlLabel value="both" control={<Radio />} label="Both" />
                    </RadioGroup>
                  )}
                />
              </FormControl>
            </Grid2>

            {(accountType === 'checking' || accountType === 'both') && (
              <Grid2 item xs={12}>
                <FormInput name="checkingBalance" label="Starting Checking Balance:" type="number" 
                  validation={{
                    required: { value: true, message: 'Starting balance is required' },
                    min: { value: 0, message: 'Balance must be at least 0' }
                  }}
                />
              </Grid2>
            )}

            {(accountType === 'savings' || accountType === 'both') && (
              <Grid2 item xs={12}>
                <FormInput name="savingsBalance" label="Starting Savings Balance:" type="number" 
                  validation={{
                    required: { value: true, message: 'Starting balance is required' },
                    min: { value: 0, message: 'Balance must be at least 0' }
                  }}
                />
              </Grid2>
            )}

            <Grid2 item xs={12}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button type="submit" variant="contained" fullWidth
                  sx={{ backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20' } }}
                >
                  Create Account
                </Button>
                <Button variant="outlined" onClick={() => navigate(-1)} fullWidth
                  sx={{color: '#2E7D32', borderColor: '#2E7D32', '&:hover': { color: '#1B5E20', borderColor: '#1B5E20' }}}
                >
                  Back
                </Button>
              </Box>
            </Grid2>
          </Grid2>          
        </form>
      </FormProvider>
    </Paper>
  )
}

export default CreateAccount;