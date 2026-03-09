import React, { useState } from 'react';
import axios from 'axios';

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        const response = await axios.post(
              'http://localhost:8000/connnect/login',
              new URLSearchParams({
                  email: email,
                  password: password,
          }),
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true, // facultatif si tu veux envoyer les cookies (utile pour sessions)
          }
        );

    };

    return (
        <div>
            <h2>Connexion</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label>Mot de passe:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {message && <p style={{ color: 'green' }}>{message}</p>}
                <button type="submit">Se connecter</button>
            </form>
        </div>
    );
};

export default SignIn;
