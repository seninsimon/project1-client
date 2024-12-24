import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginThunk } from '../features/auth/loginSlice';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import './Login.css';
import Navbar from '../components/Navbar';
import { googleLoginThunk } from '../features/auth/googleAuthSlice';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Login = () => {
  const [loginData, setLoginData] = useState({
    identifier: '',
    password: '',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.login)


  useEffect(() => {

    let token
    const tok1 = localStorage.getItem("usertoken")
    const tok2= localStorage.getItem("authToken")

    if(tok1)
    {
      token = tok1
    }
    else if(tok2)
    {
      token = tok2
    }

    if (token) {
      navigate('/zenztore')
    }
    

  }, [])





  const handleLogin = (e) => {
    e.preventDefault();
    dispatch(loginThunk(loginData))
      .unwrap()
      .then(() => {
        navigate('/verifyotp');
      })
      .catch((error) => {
        console.log(error);
        
        if (error.success == false) {
          toast.error("user login denied by admin")
        }
        else if (error.success == "passwordInvalid") {
          toast.error("wrong credentials")
        }
        else if (error.success == "!userexist") {
          toast.error("enter valid username and password")
        }
        
      }

      )
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const credentials = response.credential;

      dispatch(googleLoginThunk(credentials))
        .unwrap()
        .then((response) => {
          if (response.success && response.gusertoken) {
            localStorage.setItem("authToken", response.gusertoken);
            navigate("/zenztore");
          } else {
            console.log("Authentication failed:", response.message);
          }
        })
        .catch((error) => {
          console.log("Google authentication error:", error)
          toast.error("you have beed blocked by admin")

        });
    } catch (error) {
      console.error("Error handling Google success:", error);
    }
  };



  const handleGoogleError = (error) => {
    console.log(error);
  };

  const handleNewUserRedirect = () => {
    navigate('/signup');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  return (
    <>
      <Navbar />
      <div className="login-container">
        <motion.form 
          className="login-form"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Login</h2>

          <label htmlFor="identifier" className="login-label">Username or Email</label>
          <input
            type="text"
            id="identifier"
            name="identifier"
            placeholder="Enter username or email"
            onChange={handleChange}
          />

          <label htmlFor="password" className="login-label">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            onChange={handleChange}
          />

          <button type="submit" onClick={handleLogin} className="login-button">
            {

              loading ? "Signing in..." : "Sign in"

            }
          </button>

          <div className="google-login">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black" // Customize the theme
              width="300px" // Ensure it takes full width
            />
          </div>

          <div className="new-user-section">
            <p style={{ color: "blue" }} >New user? <button type="button" onClick={handleNewUserRedirect} className="signup-link">Create an account</button></p>
          </div>

        </motion.form>

      </div>
    </>
  );
};

export default Login;