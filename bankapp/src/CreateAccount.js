import React, { useState } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createUser } from './api';
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
            accountType: 'both',
            checkingBalance: 0,
            savingsBalance: 0
        }
    })

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
        <div className="container">
            <h2>Create a New Account</h2>
            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="form">
                    <FormInput 
                        name="firstName" 
                        label="First Name:" 
                        type="text" 
                        validation={{
                            required: 'First name is required',
                            minLength: { value: 2, message: 'First name must be at least 2 characters' },
                            pattern: { value: /^[a-zA-Z]+$/, message: 'Only letters are allowed' }
                        }}
                    />
                    <FormInput 
                        name="lastName" 
                        label="Last Name:" 
                        type="text" 
                        validation={{
                            required: 'Last name is required',
                            minLength: { value: 2, message: 'Last name must be at least 2 characters' },
                            pattern: { value: /^[a-zA-Z]+$/, message: 'Only letters are allowed' }
                        }}
                    />
                    <FormInput 
                        name="email" 
                        label="Email:" 
                        type="email" 
                        validation={{
                            required: 'Email is required',
                            pattern: { 
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, 
                            message: 'Enter a valid email address' 
                            }
                        }}
                    />
                    <FormInput 
                        name="password" 
                        label="Password:" 
                        type="password" 
                        validation={{
                            required: 'Password is required',
                            minLength: { value: 8, message: 'Password must be at least 8 characters' }
                        }}
                    />
                    <FormInput 
                        name="pin" 
                        label="PIN:" 
                        type="number" 
                        validation={{
                            required: 'PIN is required',
                            minLength: { value: 4, message: 'PIN must be exactly 4 digits' },
                            maxLength: { value: 4, message: 'PIN must be exactly 4 digits' },
                            pattern: { value: /^\d{4}$/, message: 'PIN must contain only numbers' }
                        }}
                    />

                    <label>Account Type</label>
                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                value="checking"
                                {...methods.register('accountType')}
                            />
                            Checking
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="savings"
                                {...methods.register('accountType')}
                            />
                            Savings
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="both"
                                {...methods.register('accountType')}
                            />
                            Both
                        </label>
                    </div>

                    {(methods.watch('accountType') === 'checking' || methods.watch('accountType') === 'both') && (
                        <FormInput 
                        name="checkingBalance" 
                        label="Starting Checking Balance:" 
                        type="number" 
                        validation={{
                            required: { value: true, message: 'Starting balance is required' },
                            min: { value: 0, message: 'Balance must be at least 0' }
                        }}
                        />
                    )}
                    {(methods.watch('accountType') === 'savings' || methods.watch('accountType') === 'both') && (
                        <FormInput 
                        name="savingsBalance" 
                        label="Starting Savings Balance:" 
                        type="number" 
                        validation={{
                            required: { value: true, message: 'Starting balance is required' },
                            min: { value: 0, message: 'Balance must be at least 0' }
                        }}
                        />
                    )}

                    <div className="button-container">
                        <button type="submit" className="button">Create Account</button>
                        <button type="button" onClick={() => navigate(-1)} className="back-button">Back</button>
                    </div>
                </form>
            </FormProvider>
        </div>
    )
}

export default CreateAccount;