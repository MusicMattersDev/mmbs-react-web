import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import mmlogo from '../assets/icon-transparent.png'

export default function Home() {

  let navigate = useNavigate();
    useEffect(() => {
      let authToken = sessionStorage.getItem('Auth Token')

      if (authToken) {
          navigate('/home')
      }

      if (!authToken) {
          navigate('/')
      }
  }, [])

  return (
    <div className='content'>
      <div className='home'>
        <center>
          <h1>Welcome to Music Matters Booking System!</h1>
          <img src={ mmlogo } width="200" height="200"/>
        </center>
      </div>
    </div>
  )
}

