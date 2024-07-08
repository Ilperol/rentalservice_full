import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

const Login = ({ setAccount }) => {
  const [address, setAddress] = useState('');
  const history = useHistory();

  const handleSubmit = (e) => {
    e.preventDefault();
    setAccount(address);
    history.push('/');
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Address: </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
