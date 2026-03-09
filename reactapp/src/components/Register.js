import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password.length < 1) {
      setError('Password is too short.');
      return;
    }
    const registrationResult = await register(username, email, password);
    if (registrationResult.success) {
      if (registrationResult.autoLoginFailed) {
        setMessage('Registration successful! However, auto-login failed. Please try logging in manually.');
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setMessage('Registration and login successful! Redirecting...');
        navigate('/');
      }
    } else {
      setError('Registration failed. User might already exist or data is invalid.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Illustration à gauche */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-sky-400 to-blue-600 relative overflow-hidden">
        {/* Image d'avion en plein écran */}
        <img
          src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2074&q=80"
          alt="Modern airplane flying above clouds"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Overlay gradient pour le texte */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

        {/* Contenu texte */}
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <h3 className="text-4xl font-bold mb-4 leading-tight">
            Envolez-vous vers<br />
            <span className="text-sky-300">vos rêves</span>
          </h3>
          <p className="text-xl text-white/90 mb-6 leading-relaxed">
            Découvrez des destinations extraordinaires et créez des souvenirs qui dureront toute une vie
          </p>
        </div>

        {/* Éléments décoratifs flottants */}
        <div className="absolute top-20 right-20 w-4 h-4 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-32 w-2 h-2 bg-sky-300/50 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-white/20 rounded-full animate-pulse delay-1000"></div>
      </div>
      {/* Formulaire à droite */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 py-12 bg-[#fffaf3]">
        <h2 className="text-2xl font-bold mb-2 text-center">Create your account</h2>
        <p className="text-center text-gray-500 mb-6">Sign up to get started!</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username (Name)</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="********"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          {message && <div className="text-green-600 text-sm">{message}</div>}
          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded font-semibold hover:bg-gray-800 transition"
          >
            Register
          </button>
        </form>
        <p className="text-center text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-black font-semibold hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;