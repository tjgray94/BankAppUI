import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
    return (
        <div className="home-container">
            <h1>Welcome to BankApp!</h1>
            <p>Your trusted partner in banking.</p>

            <div className="home-buttons">
                <Link to="/create-account">
                    <button className="home-button">Create Account</button>
                </Link>
                <Link to="/login">
                    <button className="home-button">Login</button>
                </Link>
            </div>
        </div>
    )
}

export default Home;