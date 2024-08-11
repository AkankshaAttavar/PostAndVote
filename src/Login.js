import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IDKitWidget } from '@worldcoin/idkit';
import Lottie from 'lottie-react';
import animationData from './Animation - 1723336678386.json';  // Make sure this path is correct
import './Login.css';

const Login = ({ onLogin }) => {
    const navigate = useNavigate();

    const handleSuccess = (verificationResponse) => {
        console.log("Verification successful:", verificationResponse);
        onLogin();  // Mark the user as authenticated
        navigate('/');  // Redirect to the home page after successful verification
    };

    return (
        <div className="login-container">
            {/* Add the project name here */}
            <h1 className="project-title">POST AND VOTE</h1>

            {/* Lottie Animation */}
            <Lottie
                animationData={animationData}
                loop={true}
                style={{ width: 200, height: 200 }} // Adjust the size as needed
            />

            <h2>Login with World ID</h2>
            <IDKitWidget
                app_id="app_staging_8bb2ed46dc2807be35a01c46339faeab"
                action="anonymous-voting" // Replace with your action ID
                signal="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" // Replace with a specific signal like a user's address
                onSuccess={handleSuccess}
                verification_level="orb" // Orb is the only verification level supported on-chain
            >
                {({ open }) => <button onClick={open}>Verify with World ID</button>}
            </IDKitWidget>
        </div>
    );
};

export default Login;
