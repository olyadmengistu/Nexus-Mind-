
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const user: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        avatar: firebaseUser.photoURL || 'https://via.placeholder.com/40',
        reputation: 0,
      };

      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[1000px] flex flex-col lg:flex-row items-center lg:items-start lg:justify-between gap-8 mt-8">
        
        {/* Left Branding */}
        <div className="flex-1 text-center lg:text-left pt-16">
          <h1 className="text-[#1877F2] text-6xl font-bold mb-4 tracking-tighter">NexusMind</h1>
          <p className="text-2xl font-medium leading-tight max-w-[500px]">
            Every problem has a solver. Connect with experts to share and tackle challenges together.
          </p>
        </div>

        {/* Right Form */}
        <div className="w-full max-w-[400px] pt-16">
          <div className="bg-white p-4 shadow-xl rounded-xl">
            <form onSubmit={handleMockLogin} className="space-y-4">
              <input 
                type="text" 
                placeholder="Email address or phone number" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-[17px]"
              />
              <input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 text-[17px]"
              />
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#1877F2] hover:bg-blue-600 text-white font-bold py-3 rounded-lg text-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
              <div className="text-center">
                <a href="#" className="text-blue-500 text-sm hover:underline">Forgotten password?</a>
              </div>
              <hr />
              <div className="text-center pt-2 pb-1">
                <button 
                  type="button"
                  onClick={() => navigate('/signup')}
                  className="bg-[#42B72A] hover:bg-[#36a420] text-white font-bold px-4 py-3 rounded-lg text-[17px] transition-colors"
                >
                  Create New Account
                </button>
              </div>
            </form>
          </div>
          <p className="text-center mt-6 text-sm">
            <b>Create a Page</b> for a celebrity, brand or business.
          </p>
        </div>
      </div>

      <footer className="mt-auto py-10 w-full max-w-[1000px] text-gray-500 text-xs">
        <div className="flex flex-wrap gap-x-4 gap-y-2 mb-2">
          <span>English (UK)</span>
          <span>Hausa</span>
          <span>Afaan Oromoo</span>
          <span>Amharic</span>
          <span>العربية</span>
          <span>Français (France)</span>
        </div>
        <hr className="my-2" />
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          <span>Sign Up</span>
          <span>Log In</span>
          <span>Messenger</span>
          <span>Facebook Lite</span>
          <span>Video</span>
          <span>Places</span>
          <span>Games</span>
          <span>Marketplace</span>
          <span>Connect</span>
          <span>Solve</span>
          <span>Grow</span>
          <span>Instagram</span>
        </div>
        <p className="mt-4">Connect.Solve.Grow © 2024</p>
      </footer>
    </div>
  );
};

export default Login;
