import React, { useState, useEffect } from 'react';
import * as FaIcons from 'react-icons/fa'
import * as AiIcons from 'react-icons/ai'
import { Link } from 'react-router-dom'
import { SidebarData } from './SidebarData'
import './Navbar.css'
import { IconContext } from 'react-icons'
import { useNavigate } from 'react-router-dom'
import mmlogo from '../assets/icon-transparent.png'
import Button from '@mui/material/Button'
import LogoutIcon from '@mui/icons-material/Logout'

function Navbar({ showSidebar: initialShowSidebar }) {
    let navigate = useNavigate();
    
    const handleLogout = () => {
        sessionStorage.removeItem('Auth Token');
        navigate('/');
    }
    
    // Initialize sidebar state with the initialShowSidebar prop
    const [sidebar, setSidebar] = useState(initialShowSidebar);

    // Use an effect to update the sidebar state if the initialShowSidebar prop changes
    useEffect(() => {
        setSidebar(initialShowSidebar);
    }, [initialShowSidebar]);

    return (
        <>
            <div className="navbar">
            </div>

            <IconContext.Provider value={{color: '#fff'}}>
                <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
            <ul className='nav-menu-items'>
                <img src={ mmlogo } style={{ paddingLeft: '45px'}} alt="music matters logo"/>
                <h1 className="mmtitle" style={{ textAlign: "center", paddingLeft: "0px", paddingRight: "16px" }}>Music Matters Bookings</h1>
                
                {SidebarData.map((item, index) => {
                    return (
                        <li key={index} className={item.cName}>
                            <Link to={item.path}>
                                {item.icon}
                                <span>{item.title}</span>
                            </Link>
                            
                        </li>
                    )
                } )}
                <div className="sidebar-footer" style={{ paddingBottom: '50px', paddingLeft: '20px'}}>
            <Button 
                    variant="contained"
                    size="large"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}>Log Out
                </Button>
                </div>
            </ul>
        </nav>
        
        </IconContext.Provider>
    </>
  )
}

export default Navbar

