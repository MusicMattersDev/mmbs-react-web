import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './Navbar/Navbar.js'
import './App.css';
import Home from './pages/Home';
import Venues from './pages/Venues';
import Clients from './pages/Clients';
import Documents from './pages/Documents';
import Calendar from './pages/Calendar.js';
import LoginForm from './Login/LoginForm.js';
import WithNav from './Navbar/WithNav';
import WithoutNav from './Navbar/WithoutNav';
import { useState, useEffect } from 'react';
import { app } from './firebase-config';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('')

  let navigate = useNavigate();
  const handleAction = (id) => {
    const authentication = getAuth();
    if (id === 1) {
      signInWithEmailAndPassword(authentication, email, password)
        .then((response) => {
          navigate('/home')
          sessionStorage.setItem('Auth Token', response._tokenResponse.refreshToken)
        })
        .catch((error) => {
          if(error.code === 'auth/wrong-password'){
            toast.error('Invalid password, please try again.');
          }
          if(error.code === 'auth/user-not-found'){
            toast.error('User not found, please try again.');
          }
        })
    }
  }

  return (
    
    <>
      <ToastContainer />
      <Routes>
        <Route element={<WithoutNav />}>
          <Route 
            path='/' 
            element={
            <LoginForm
              title="Login"
              setEmail={setEmail}
              setPassword={setPassword}
              handleAction={() => handleAction(1)}
            />} />
          <Route
          path="*"
          element={
            <main style={{ padding: "1rem "}}>
              <p>There's nothing here!</p>
            </main>
          }
          />
        </Route>
        <Route path="venues/:venue" element={<Calendar showSidebar={showSidebar} setShowSidebar={setShowSidebar} />} />
        
        <Route path="/" element={<WithNav showSidebar={showSidebar} />}>
          <Route path='/home' element={<Home />} />
          <Route path='/venues' element={<Venues />} />
          <Route path="venues/:venue" element={<Calendar setShowSidebar={setShowSidebar} />} />

          <Route path='/clients' element={<Clients />} />
          <Route path='/documents' element={<Documents />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
