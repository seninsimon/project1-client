import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { CiUser } from "react-icons/ci";
import { FaShoppingCart } from "react-icons/fa";

const ZenCatNav = () => {
    const [userlog, setUserLog] = useState(false);
    const [searchQuery, setSearchQuery] = useState(""); 
    const [searchResults, setSearchResults] = useState([]); 
    const navigate = useNavigate();

    useEffect(() => {
        const blockfun = async () => {
            let token;
            const tok1 = localStorage.getItem("usertoken");
            const tok2 = localStorage.getItem("authToken");
            if (tok1) {
                token = tok1;
            } else if (tok2) {
                token = tok2;
            }

            const response = await axiosClient.post('/blockuser', token);
            const id = response.data.idData.id;

            const respose2 = await axiosClient.post('/blockedId', { id });
            if (respose2.data.message.isBlocked) {
                setUserLog(!userlog);
                localStorage.removeItem("authToken");
                localStorage.removeItem("usertoken");
            }
        }
        blockfun();
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("usertoken");
        const token1 = localStorage.getItem("authToken");
        if (token || token1) {
            setUserLog(!userlog);
        }
    }, []);

    const handleOut = () => {
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
        if (userlog) {
            navigate("/login");
        }
    };

    const handleCart = () => {
        let token;
        const tok1 = localStorage.getItem('usertoken');
        const tok2 = localStorage.getItem('authToken');
        if (tok1) {
            token = tok1;
        } else if (tok2) {
            token = tok2;
        }

        if (!token) {
            navigate('/login');
        } else {
            navigate('/cart');
        }
    }

    // Function to handle search
    const handleSearch = async (event) => {
        setSearchQuery(event.target.value);
        try {
            const response = await axiosClient.get(`/search?q=${event.target.value}`);
            setSearchResults(response.data); // Assuming the response contains an array of products
        } catch (error) {
            console.error("Search Error: ", error);
        }
    };

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
                        value={searchQuery} // Bind search query to input value
                        onChange={handleSearch} // Trigger search on change
                        placeholder="Search for products, brands, and more"
                        className="w-full px-4 py-2 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-300"
                    />
                    {searchQuery && searchResults.length > 0 && (
                        <div className="absolute bg-white shadow-lg w-full mt-1">
                            <ul>
                                {searchResults.map((result) => (
                                    <li key={result._id} className="px-4 py-2 hover:bg-gray-200">
                                        <Link to={`/product/${result._id}`}>{result.productName}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
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
                        <Link to="/user">
                            <CiUser size={35} className="border rounded-lg text-gray-500" />
                        </Link>
                    </div>
                    <button
                        className="relative cursor-pointer"
                        onClick={handleCart}
                    >
                        <FaShoppingCart size={30} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default ZenCatNav;
