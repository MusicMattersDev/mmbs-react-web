import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import mmlogo from '../assets/icon-transparent.png'
const Home = () => {
  return (
      <div className='home' style={styles.container}>
          <div style={styles.content}>
              <img src={ mmlogo } alt="Music Matters Logo" style={styles.logo} />
              <h1 style={styles.title}>Welcome to Music Matters Booking System</h1>
              <p style={styles.subtitle}>-R10.8.23</p>
          </div>
      </div>
  )
}

const styles = {
  container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: "#f4f4f4",
      minHeight: "100vh",
      padding: "2em 0",
  },
  content: {
      textAlign: 'center',
      maxWidth: '90%',
  },
  logo: {
      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      width: "200px",
      height: "200px",
      maxWidth: '100%',
      margin: '1em auto'
  },
  title: {
      color: "#333",
      marginTop: "1em",
      fontSize: '1.5em',
      wordWrap: 'break-word'
  },
  subtitle: {
      color: "#777",
      marginTop: "0.5em",
      fontSize: '1em'
  }
}

export default Home;