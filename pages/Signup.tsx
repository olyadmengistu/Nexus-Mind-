import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');
  const [year, setYear] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName || !lastName || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const displayName = `${firstName} ${lastName}`;
      
      await updateProfile(user, {
        displayName: displayName,
        photoURL: photoPreview || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.uid
      });
      
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[500px] bg-white p-8 shadow-xl rounded-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-[#1877F2] text-4xl font-bold mb-2 tracking-tighter">NexusMind</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">Create a new account</h2>
          <p className="text-sm text-gray-600">It's free and always will be.</p>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Profile Photo Section */}
        <div className="flex flex-col items-center mb-6">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoChange}
            accept="image/*"
            className="hidden"
          />
          <div
            onClick={handlePhotoClick}
            className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors border-2 border-dashed border-gray-400 overflow-hidden"
          >
            {photoPreview ? (
              <img src={photoPreview} alt="Profile preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl text-gray-500">+</span>
            )}
          </div>
          <p
            onClick={handlePhotoClick}
            className="text-[#1877F2] text-sm font-medium mt-2 cursor-pointer hover:underline"
          >
            {photoPreview ? 'Change Profile Photo' : 'Add Profile Photo'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name Fields */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[17px]"
            />
            <input
              type="text"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[17px]"
            />
          </div>

          {/* Email Field */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[17px]"
          />

          {/* Password Field */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[17px]"
          />

          {/* Birthday Section */}
          <div>
            <label className="text-sm text-gray-600 font-medium mb-2 block">Birthday</label>
            <div className="flex gap-2">
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[17px] bg-white"
              >
                <option value="">Month</option>
                <option value="January">January</option>
                <option value="February">February</option>
                <option value="March">March</option>
                <option value="April">April</option>
                <option value="May">May</option>
                <option value="June">June</option>
                <option value="July">July</option>
                <option value="August">August</option>
                <option value="September">September</option>
                <option value="October">October</option>
                <option value="November">November</option>
                <option value="December">December</option>
              </select>
              <select
                value={day}
                onChange={(e) => setDay(e.target.value)}
                className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[17px] bg-white"
              >
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="flex-1 border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[17px] bg-white"
              >
                <option value="">Year</option>
                {Array.from({ length: 100 }, (_, i) => (
                  <option key={2024 - i} value={2024 - i}>{2024 - i}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#42B72A] hover:bg-[#36a420] text-white font-bold py-3 rounded-lg text-[17px] transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/login')}
            className="text-[#1877F2] text-sm hover:underline"
          >
            Already have an account?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Signup;
