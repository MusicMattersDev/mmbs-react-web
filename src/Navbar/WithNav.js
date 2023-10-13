import React from 'react';
import Navbar from './Navbar.js';
import { Outlet } from 'react-router';

function WithNav({ showSidebar }) {
  return (
      <div className="main-layout">
          <Navbar showSidebar={showSidebar} />
          <div className="content">
              <Outlet />
          </div>
      </div>
  );
}

export default WithNav;