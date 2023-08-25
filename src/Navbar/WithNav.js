import React from 'react';
import Navbar from './Navbar.js';
import { Outlet } from 'react-router';

export default () => {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}
