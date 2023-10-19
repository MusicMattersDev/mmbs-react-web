import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Logo from '../assets/icon-transparent.png';
import './LoginForm.css';
import './LoginPage.css';

export default function LoginForm({ setPassword, setEmail, handleAction }) {
    return (
        <div className="loginPage">
            <div className="loginContainer">
                <div className="logoContainer">
                    <img src={ Logo } alt="Music Matters Logo" />
                </div>
                <h1>Music Matters</h1>
                
                <Box
                    component="form"
                    className="formContainer"
                    noValidate
                    autoComplete="off"
                >
                    <TextField
                        fullWidth
                        id="email"
                        label="Email" 
                        variant="standard" 
                        onChange={(e) => setEmail(e.target.value)}
                        className="inputField"
                    />
                    <TextField
                        fullWidth
                        id="password" 
                        label="Password" 
                        variant="standard" 
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        className="inputField"
                    />
                   <Button
                         variant="contained"
                            size="large"
                            onClick={ handleAction }
                            className="loginButton"
                            style={{ marginTop: '20px' }}  // Inline style for top padding
                                >
                                Login
                    </Button>
                </Box>
            </div>
        </div>
    );
}