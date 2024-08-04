import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './Signup.css';
import img from './Images/Signup.jpeg';
import useLocalStorage from 'use-local-storage';
import { useUserCreateMutation } from './redux/features/auth/authApiSlice';
import Modal from './Modal'; 
import { useUserCreateMutation } from '../src/redux/features/auth/authApiSlice';
import { ContinueWithGoogle } from './components/ContinueWithGoogle';

function Signup() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal
  const navigate = useNavigate(); // Updated to navigate

  const validatePassword = (password, confirmPassword) => {
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one digit.';
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Password must contain at least one special character.';
    }
    return '';
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });

    if (id === 'password' || id === 'confirmPassword') {
      const errorMessage = validatePassword(
        id === 'password' ? value : formData.password,
        id === 'confirmPassword' ? value : formData.confirmPassword
      );
      document.getElementById('password').setCustomValidity(errorMessage);
      document.getElementById('confirmPassword').setCustomValidity(errorMessage);
    }
  };

  const [userCreate] = useUserCreateMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const passwordError = validatePassword(formData.password, formData.confirmPassword);
    if (passwordError) {
      document.getElementById('password').setCustomValidity(passwordError);
      document.getElementById('confirmPassword').setCustomValidity(passwordError);
      return;
    }

    document.getElementById('password').setCustomValidity('');
    document.getElementById('confirmPassword').setCustomValidity('');

    setIsModalOpen(true); // Show modal when form is submitted

    try {
      await userCreate({
        first_name: formData.firstname,
        last_name: formData.lastname,
        email: formData.email,
        password: formData.password,
        re_password: formData.confirmPassword
      }).unwrap();
      navigate('/Success');
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close modal function
  };

  const generateState = () => {
    return btoa(crypto.getRandomValues(new Uint32Array(1)).toString());
  };

  const handleGoogleSuccess = async ({ code, state }) => {
    try {
      const storedState = sessionStorage.getItem('oauth_state');
  
      if (!code || !state) {
        throw new Error('Authorization code or state not found');
      }
  
      if (state !== storedState) {
        throw new Error('State parameter does not match');
      }
  
      const url = 'http://localhost:8000/api/o/google-oauth2/';
  
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, state }) // Send the authorization code and state to your backend
      });
  
      const data = await res.json();
      console.log('Backend response:', data);
  
      if (data.success) {
        navigate('/');
      } else {
        // Handle error response from backend
        setError(data.message || 'An error occurred');
      }
    } catch (error) {
      console.error('Error during Google Sign-In:', error);
      // Handle client-side error
      setError('An error occurred during Google Sign-In');
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google Sign-In Error:', error);
    setError('Google Sign-In failed. Please try again.');
  };

  const [isDark] = useLocalStorage("isDark", false);

  const initiateGoogleSignIn = () => {
    const state = generateState();
    sessionStorage.setItem('oauth_state', state);
  
    const clientId = 'YOUR_CLIENT_ID'; // Replace with your actual client ID
    const redirectUri = 'http://localhost:3000/auth/google'; 
    const scope = 'profile email';
    const responseType = 'code';
  
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=${responseType}&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
  
    window.location.href = googleAuthUrl; 
  };

  return (
    <GoogleOAuthProvider clientId='YOUR_CLIENT_ID'> {/* Replace with your actual client ID */}
      <div className='Logindiv' data-theme={isDark ? "dark" : "light"}>
        <div className="LoginContainer">
          <div className="image-container">
            <img loading="lazy" src={img} alt="Signup" className="Signup-img" />
            <div className="overlay">
              <div className="login-section">
                <div className="question">Have An Account?</div>
                <Link to="/login" className="login-button">
                  LOG IN
                </Link>
              </div>
            </div>
          </div>
          <div className="Signupcolumn-2">
            <form className="Auth" onSubmit={handleSubmit}>
              <h2 className="signup-title">Sign Up</h2>
              <div className='GSect'>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="First Name"
                    id="firstname"
                    className="form-input"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Last Name"
                    id="lastname"
                    className="form-input"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Email"
                    id="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    id="password"
                    className="form-input"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    id="confirmPassword"
                    className="form-input"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="show-password-container">
                  <input
                    type="checkbox"
                    id="showPassword"
                    checked={showPassword}
                    onChange={() => setShowPassword(prev => !prev)}
                  />
                  <label htmlFor="showPassword">Show Password</label>
                </div>
                <button type="submit" className="signup-button">
                  SIGN UP
                </button>
              </div>
            </form>
            <div className="OR">OR</div>
            <div className="SigninWithGoogle">
              <ContinueWithGoogle/>
            </div>
            <div className='Signup2'>Have an account?<span className='SignupSpan'><Link to="/Login"> Login here</Link></span></div>
          </div>
        </div>
        <Modal isOpen={isModalOpen} onClose={closeModal} /> {/* Add Modal component */}
      </div>
    </GoogleOAuthProvider>
  );
}

export default Signup;
