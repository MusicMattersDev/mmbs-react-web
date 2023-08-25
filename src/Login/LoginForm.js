import * as React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button'
import Logo from '../assets/icon-transparent.png'
import './LoginForm.css'

export default function LoginForm({ setPassword, setEmail, handleAction }) {
    return (
        <div className="loginPage">
            <center>
                <div className="heading-container">
                        <h1>
                            Music Matters Booking System
                        </h1>
                        <h1>
                            Login Portal
                        </h1>
                        <div className="loginImg">
                            <img src={ Logo } />
                        </div>
                </div>

            <Box
                component="form"
                sx={{
                    '& > :not(style)': { m: 1, width: '30ch' },
                }}
                noValidate
                autoComplete="on"
            >
                <div>
                    <TextField
                        fullWidth
                        id="email"
                        label="Email" 
                        variant="outlined" 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <TextField
                        fullWidth
                        id="password" 
                        label="Password" 
                        variant="outlined" 
                        type="password"
                        margin="dense"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </Box>
            
            <div>
                <Button
                    variant="contained"
                    size="large"
                    onClick={ handleAction }>Login
                </Button>
            </div>

            </center>
        </div>
    );
}