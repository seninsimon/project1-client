import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { CiUser } from "react-icons/ci";
import { FaShoppingCart } from "react-icons/fa";



const ZenztoreNav = () => {
    const [userlog, setUserLog] = useState(false);




    useEffect(() => {
        const blockfun = async () => {

            let token;
            const tok1 = localStorage.getItem("usertoken");
            const tok2 = localStorage.getItem("authToken");
            if (tok1) {
                token = tok1
            } else if (tok2) {
                token = tok2
            }


            const response = await axiosClient.post('/blockuser', token)
            console.log("user id  :", response.data.idData.id);
            const id = response.data.idData.id


            const respose2 = await axiosClient.post('/blockedId', { id })
            console.log("respose2 ", respose2.data.message.isBlocked)
            if (respose2.data.message.isBlocked) {
                setUserLog(!userlog)
                localStorage.removeItem("authToken") || localStorage.removeItem("usertoken")
            }






        }
        blockfun()

    }, [])

    useEffect(() => {
        const token = localStorage.getItem("usertoken");
        const token1 = localStorage.getItem("authToken");
        if (token || token1) {
            setUserLog(!userlog);
        }
    }, []);

    const navigate = useNavigate();

    const   handleOut = () => {
        const token = localStorage.getItem("usertoken");
        const token1 = localStorage.getItem("authToken");
        if (token) {
            localStorage.removeItem("usertoken");
        } else if (token1) {
            localStorage.removeItem("authToken");
        } else {
            navigate("/login");
        }
        setUserLog(!userlog);
        if(userlog)
        {
            navigate("/login");
        }
    };

    const [token , setToken] = useState("")


    const handleCart = ()=>
    {
        let token
        const tok1 = localStorage.getItem('usertoken');
        const tok2 = localStorage.getItem('authToken')
        if (tok1) {
            token = tok1
            setToken(token)
        }
        else if (tok2) {
            token = tok2
            setToken(token)
        }
        
        if (!token) {
            navigate('/login'); // Redirect if not logged in
        } else {
            navigate('/cart');
        }
    }

    

    return (
        <nav className="bg-orange-400 text-white shadow-lg fixed top-0 w-full z-10">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center cursor-pointer">
                    <a href="/zenztore">
                        <div className="bg-white text-orange-500 font-extrabold text-2xl px-3 py-1 rounded-lg shadow-md">
                            Z
                        </div>
                    </a>
                </div>

                {/* Search Bar */}
                <div className="flex-grow mx-6">
                    <input
                        type="text"
                        placeholder="Search for products, brands, and more"
                        className="w-full px-4 py-2 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                </div>

                {/* Links and Buttons */}
                <div className="flex items-center space-x-6">
                    <button
                        onClick={handleOut}
                        className="bg-white text-orange-500 font-bold px-6 py-2 rounded-full shadow-md hover:bg-gray-100 transition duration-300"
                    >
                        {userlog ? "Logout" : "Login"}
                    </button>

                    <div className="relative cursor-pointer">
                        <Link to="/user" ><CiUser size={35} className="border rounded-lg text-gray-500" /></Link>


                    </div>
                    <button className="relative cursor-pointer" 
                    onClick={handleCart}
                    >
                        
                        <FaShoppingCart size={30} ></FaShoppingCart>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default ZenztoreNav;
