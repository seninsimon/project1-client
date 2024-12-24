import React, { useState } from 'react';
import { signupThunk } from '../features/auth/signupSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import './Signup.css';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Signup = () => {
    const [signupData, setSignupData] = useState({
        username: '',
        email: '',
        password: '',
        phonenumber: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading } = useSelector((state) => state.signup);

    const validateForm = () => {
        const newErrors = {};

        // Username validation
        if (!signupData.username.trim()) {
            newErrors.username = 'Username is required.';
        }

        if (signupData.username.length < 3) {
            newErrors.username = 'Username must contain 3 charecters.';
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!signupData.email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!emailRegex.test(signupData.email)) {
            newErrors.email = 'Enter a valid email address.';
        }

        // Phone number validation
        const phoneRegex = /^[0-9]{10}$/;
        if (!signupData.phonenumber.trim()) {
            newErrors.phonenumber = 'Phone number is required.';
        } else if (!phoneRegex.test(signupData.phonenumber)) {
            newErrors.phonenumber = 'Enter a valid 10-digit phone number.';
        }

        // Password validation
        if (!signupData.password) {
            newErrors.password = 'Password is required.';
        } else if (signupData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters long.';
        }

        // Confirm password validation
        if (!signupData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password.';
        } else if (signupData.password !== signupData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSignUp = (e) => {
        e.preventDefault();
        if (validateForm()) {
            dispatch(signupThunk(signupData))
                .unwrap()
                .then(() => {
                    navigate('/login');
                })
                .catch(() => {
                    toast.error('user already exists')
                });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupData({ ...signupData, [name]: value });
    };

    return (
        <>
            <Navbar />
            <motion.div 
                className="signup-container"
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <form className="signup-form" onSubmit={handleSignUp} noValidate >
                    <h2>Create Account</h2>

                    {/* Username */}
                    {errors.username && <p className="error-message">{errors.username}</p>}
                    <label htmlFor="username" className="signup-label">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter your username"
                        onChange={handleChange}
                    />


                    {/* Email */}
                    {errors.email && <p className="error-message">{errors.email}</p>}
                    <label htmlFor="email" className="signup-label">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="Enter your email"
                        onChange={handleChange}
                        required ={false}
                    />


                    {/* Phone Number */}
                    {errors.phonenumber && <p className="error-message">{errors.phonenumber}</p>}
                    <label htmlFor="phonenumber" className="signup-label">Phone Number</label>
                    <input
                        type="text"
                        id="phonenumber"
                        name="phonenumber"
                        placeholder="Enter your phone number"
                        onChange={handleChange}
                    />


                    {/* Password */}
                    {errors.password && <p className="error-message">{errors.password}</p>}
                    <label htmlFor="password" className="signup-label">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter your password"
                        onChange={handleChange}
                    />


                    {/* Confirm Password */}
                    {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
                    <label htmlFor="confirmPassword" className="signup-label">Confirm Password</label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Re-enter your password"
                        onChange={handleChange}
                    />


                    {/* Submit Button */}
                    <button type="submit">
                        {loading ? "Signing up..." : "Sign up"}
                    </button>
                </form>
            </motion.div>
        </>
    );
};

export default Signup;

