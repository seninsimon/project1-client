// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { otpThunk } from '../features/auth/otpSlice';
// import { loginThunk } from '../features/auth/loginSlice';
// import { useNavigate } from 'react-router-dom';
// import './Otp.css';
// import Navbar from '../components/Navbar';

// const Otp = () => {
//     const [otpData, setOtpData] = useState('');

//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const { user , loading } = useSelector((state) => state.login);

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         dispatch(otpThunk(otpData))
//             .unwrap()
//             .then(() => {
//                 navigate('/zenztore');
//             });
//     };

//     useEffect(() => {
//         if (!user) {
//             navigate('/login');
//         }
//     }, [user]);

//     const handleResendOtp = (e) => {
//         e.preventDefault();
//         if (user) {
//             dispatch(loginThunk(user));
//         }
//     };

//     return (
//         <>
//         <Navbar/>
//         <div className="otp-container">
//             <form className="otp-form">
//                 <h2>Verify OTP</h2>

//                 <label htmlFor="otp" className="otp-label">Enter OTP</label>
//                 <input
//                     type="text"
//                     id="otp"
//                     name="otp"
//                     placeholder="Enter your OTP"
//                     onChange={(e) => setOtpData(e.target.value)}
//                 />

//                 <button type="submit" onClick={handleSubmit} className="otp-button">Verify</button>
//                 <button type="button" onClick={handleResendOtp} className="resend-button">
//                     {
//                         loading ? "Resending Otp" : "Resend Otp"
//                     }
//                 </button>
//             </form>
//         </div>
//         </>
//     );
// };

// export default Otp;


import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { otpThunk } from '../features/auth/otpSlice';
import { loginThunk } from '../features/auth/loginSlice';
import { useNavigate } from 'react-router-dom';
import './Otp.css';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';

const Otp = () => {
    const [otpData, setOtpData] = useState('');
    const [timeLeft, setTimeLeft] = useState(120); // Set the OTP validity duration in seconds
    const [isExpired, setIsExpired] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, loading } = useSelector((state) => state.login);

    useEffect(() => {
        // Redirect to login if the user is not authenticated
        if (!user) {
            navigate('/login');
        }

        const token = localStorage.getItem("usertoken")
        if(token)
        {
            navigate('/')
        }
 
    }, [user]);

    // Countdown timer logic
    useEffect(() => {
        if (timeLeft <= 0) {
            setIsExpired(true);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prevTime) => prevTime - 1);
        }, 1000);

        return () => clearInterval(timer); // Cleanup the timer on component unmount
    }, [timeLeft]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isExpired) {
            alert("The OTP has expired. Please request a new one.");
            return;
        }

        dispatch(otpThunk(otpData))
            .unwrap()
            .then(() => {
                navigate('/zenztore');
            }).catch(()=>
            {
                toast.error("wrong otp")
            })
    };

    const handleResendOtp = (e) => {
        e.preventDefault();
        setTimeLeft(120); // Reset the timer
        setIsExpired(false);

        if (user) {
            dispatch(loginThunk(user)); // Resend OTP logic
        }
    };

    // Format the remaining time into minutes and seconds
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds}`;
    };

    return (
        <>
            <Navbar />
            <div className="otp-container">
                <form className="otp-form">
                    <h2>Verify OTP</h2>

                    <label htmlFor="otp" className="otp-label">Enter OTP</label>
                    <input
                        type="text"
                        id="otp"
                        name="otp"
                        placeholder="Enter your OTP"
                        onChange={(e) => setOtpData(e.target.value)}
                        disabled={isExpired} // Disable input if OTP is expired
                    />

                    <p className="timer">
                        {isExpired ? (
                            <span className="text-red-500">OTP expired! Please resend.</span>
                        ) : (
                            `Time left: ${formatTime(timeLeft)}`
                        )}
                    </p>

                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="otp-button"
                        disabled={isExpired} // Disable button if OTP is expired
                    >
                        Verify
                    </button>
                    <button
                        type="button"
                        onClick={handleResendOtp}
                        className="resend-button"
                        disabled={!isExpired && loading} // Allow resend only if OTP is expired
                    >
                        {loading ? "Resending OTP" : "Resend OTP"}
                    </button>
                </form>
            </div>
        </>
    );
};

export default Otp;
