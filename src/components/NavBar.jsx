import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavBar.css';

const NavBar = () => {
  const slaves = ['SL1', 'SL2', 'SL3', 'SL4'];
  return (
    <nav className="navbar">
      <ul className="nav-list">
        {slaves.map(slave => (
          <li key={slave}>
            <NavLink
              to={`/${slave.toLowerCase()}`}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              {slave}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavBar;