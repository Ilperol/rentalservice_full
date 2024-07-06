
import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Rental service</h2>
      <ul>
        <li><Link to="/browse">Browse</Link></li>
        <li><Link to="/my-account">My Account</Link></li>
      </ul>
    </div>
  );
};

export default Sidebar;
