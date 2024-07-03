import React, { useState } from 'react';
import Browse from './components/Browse';
import MyAccount from './components/MyAccount';
import History from './components/History';
import './App.css'; 

const App = () => {
  const [page, setPage] = useState('browse');
  const [account, setAccount] = useState(null);

  const handleLogin = async (event) => {
    event.preventDefault();
    const accountAddress = event.target.elements.account.value;
    setAccount(accountAddress);
  };

  return (
    <div className="app">
      <div className="sidebar">
        <h2>Rental Service</h2>
        <ul>
          <li>
            <button onClick={() => setPage('browse')}>Browse</button>
          </li>
          <li>
            <button onClick={() => setPage('account')}>My Account</button>
          </li>
          <li>
            <button onClick={() => setPage('history')}>History</button>
          </li>
        </ul>
      </div>
      <div className="content">
        {page === 'browse' && <Browse />}
        {page === 'account' && account && <MyAccount account={account} />}
        {page === 'history' && <History />}
        {page === 'account' && !account && (
          <form onSubmit={handleLogin} className="login-form">
            <input type="text" name="account" placeholder="Enter your account address" />
            <button type="submit">Login</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default App;
