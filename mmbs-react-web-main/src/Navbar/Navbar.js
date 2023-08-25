import React , {useState} from 'react'
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

function Navbar() {

  let navigate = useNavigate();
    const handleLogout = () => {
        sessionStorage.removeItem('Auth Token');
        navigate('/')
    }
  const [sidebar, setSidebar] = useState(true)
  
  const showSidebar = () => setSidebar(!sidebar);

  return (
    <>
        <div className="navbar">
        </div>

        <IconContext.Provider value={{color: '#fff'}}>
        <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
            <ul className='nav-menu-items'>
                <img src={ mmlogo } alt="music matters logo"/>
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
                <div className="sidebar-footer">
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

