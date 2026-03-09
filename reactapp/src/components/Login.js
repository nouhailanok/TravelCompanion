import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom'; // Add useLocation

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [remember, setRemember] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation(); // Get location object

    const from = location.state?.from?.pathname || "/";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Veuillez remplir tous les champs.');
            return;
        }
        const success = await login(email, password);
        if (success) {
            navigate(from, { replace: true }); // Navigate to the 'from' location
        } else {
            setError('Login failed. Please check your email and password.');
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
                <div className="max-w-md mx-auto w-full">
                    <h2 className="text-3xl font-bold mb-3 text-center text-gray-800">Welcome to your Travel Companion</h2>
                    <p className="text-center text-gray-500 mb-8">Welcome back! Please enter your details.</p>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Email</label>
                            <input
                                type="email"
                                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                placeholder="Enter your email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-gray-700">Password</label>
                            <input
                                type="password"
                                className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                                <div className="text-red-700 text-sm font-medium">{error}</div>
                            </div>
                        )}
                        <button
                            type="submit"
                            className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold text-lg hover:bg-gray-700 transition-colors shadow-lg"
                        >
                            Continue
                        </button>
                    </form>
                    <p className="text-center text-gray-600 mt-8">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-gray-800 font-bold hover:underline">Register</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;