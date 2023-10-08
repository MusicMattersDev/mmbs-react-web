import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import mmlogo from '../assets/icon-transparent.png'
const Home = () => {
 
    return (
        <div className='home'>
          <center>
            <h1>Welcome to Music Matters Booking System</h1>
            <p>-R10.8.23</p>
            <img src={ mmlogo } width="200" height="200"/>
          </center>
        </div>
    )
  }
  
export default Home;