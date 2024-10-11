import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authenticateUser } from './api';
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
        <div className="container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit(handleLogin)} className="form">
                <input
                    type="email"
                    {...register('email', {
                        required: 'Email is required',
                        pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                            message: 'Enter a valid email'
                        }
                    })}
                    placeholder="Email"
                    className="input"
                />
                {errors.email && <p className="error-message">{errors.email.message}</p>}

                <input
                    type="password"
                    {...register('pin', {
                        required: 'PIN is required',
                        pattern: {
                            value: /^\d{4}$/,
                            message: 'PIN must be a 4-digit number'
                        }
                    })}
                    placeholder="PIN"
                    className="input"
                />
                {errors.pin && <p className="error-message">{errors.pin.message}</p>}

                <div className="button-container">
                    <button type="submit" className="button">Login</button>
                    <button type="button" onClick={() => navigate(-1)} className="back-button">Back</button>
                </div>
            </form>
        </div>
    )
}

  export default Login;