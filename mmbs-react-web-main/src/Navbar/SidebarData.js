import React from 'react'
import * as FaIcons from 'react-icons/fa'
import * as AiIcons from 'react-icons/ai'
//import * as IoIcons from 'react-icons/io'

export const SidebarData = [
    {
        title: 'Home',
        path: '/home',
        icon: <AiIcons.AiFillHome />,
        cName: 'nav-text'
    },
    {
        title: 'Venues',
        path: '/venues',
        icon: <FaIcons.FaBuilding />,
        cName: 'nav-text'
    },
    {
        title: 'Clients',
        path: '/clients',
        icon: <FaIcons.FaUser />,
        cName: 'nav-text'
    },
    {
        title: 'Documents',
        path: '/documents',
        icon: <FaIcons.FaFolder />,
        cName: 'nav-text'
    },
    // {
    //     title: 'Emails',
    //     path: '/emails',
    //     icon: <FaIcons.FaEnvelope />,
    //     cName: 'nav-text'
    // },
];