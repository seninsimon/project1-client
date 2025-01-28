import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import ZenztoreNav from '../components/ZenztoreNav';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import CategoryNav from '../components/CategoryNav';
import { toast } from 'react-toastify';

const Zenztore = () => {
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1); // Track the current page
    const [totalPages, setTotalPages] = useState(1); // Track total pages
    const [isLoading, setIsLoading] = useState(false); // Track loading state

    const navigate = useNavigate();
    const section1 = useRef(null);

    useEffect(() => {
        fetchProducts(page); // Fetch products for the current page
    }, [page]);

    const fetchProducts = async (currentPage) => {
        setIsLoading(true);
        try {
            const response = await axiosClient.get('/homepage', {
                params: { page: currentPage, limit: 8 } // Send pagination parameters
            });

            if (response.data.success) {
                setProducts((prevProducts) => [...prevProducts, ...response.data.allProducts]); // Append new products
                setTotalPages(response.data.totalPages); // Update total pages
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleProductClick = (id) => {
        navigate(`/product/${id}`);
    };

    const scrollToSection = (sectionRef) => {
        sectionRef.current.scrollIntoView({ behavior: "smooth" });
    };

    const handleLoadMore = () => {
        if (page < totalPages) {
            setPage((prevPage) => prevPage + 1);
        }
    };

    const addToWishlist = async (productId) => {
        try {

            const token = localStorage.getItem("usertoken") || localStorage.getItem("authToken");
            if (!token) {
                navigate("/login")
            }
            const wishlistdata = { productId, token }
            await axiosClient.post(`/wishlist`, wishlistdata);
            toast.success("Product added to wishlist");
        } catch (error) {
            
               
                if(error.status == 400)
                {
                    toast.success("Product is already in the wishlist.")
                }
                else
                {
                    toast.error("login to add to the wishlist")
                }
                 
                
        
            
            console.error("Error adding product to wishlist:", error);
        }
    };

    return (
        <div className="bg-slate-100">
            <ZenztoreNav />
            <CategoryNav />

            {/* Hero Section */}
            <div className="relative w-full h-screen">
                <div className="absolute inset-0">
                    <video
                        src="/ryzen.mp4"
                        loop
                        autoPlay
                        muted
                        className="w-full h-full object-cover"
                    ></video>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-end text-center text-white bg-black bg-opacity-40 pb-48">
                    <motion.h2
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } }}
                        className="text-5xl mb-4"
                    >
                        Explore the best products at unbeatable prices
                    </motion.h2>
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1, transition: { duration: 0.8, delay: 0.4 } }}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        onClick={() => scrollToSection(section1)}
                    >
                        Shop Now
                    </motion.button>
                </div>
            </div>

            {/* Products Section */}
            <div className="container mx-auto p-24" ref={section1}>
                <h2 className="text-3xl font-bold mb-6 text-center">Our Products</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <motion.div
                            key={product._id}
                            className="bg-white rounded-lg shadow-lg flex flex-col justify-center items-center overflow-hidden hover:shadow-xl transform hover:scale-105 transition duration-300 cursor-pointer relative"
                            onClick={() => handleProductClick(product._id)}
                        >
                            <div className="absolute top-2 right-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent triggering the product details
                                        addToWishlist(product._id);
                                    }}
                                    className="absolute top-4 right-1 text-gray-500 hover:text-red-500 transition-colors "
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.657l1.318-1.339a4.5 4.5 0 016.364 0 4.5 4.5 0 010 6.364L12 21.657l-7.682-7.975a4.5 4.5 0 010-6.364z"
                                        />
                                    </svg>
                                </button>
                            </div>
                            <div className="w-full h-60 flex justify-center items-center bg-gray-100">
                                <img
                                    src={product.imageUrls[0]}
                                    alt={product.productName}
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>
                            <div className="p-4 text-center">
                                <h2 className="text-xl font-semibold text-gray-800">{product.productName}</h2>
                                <span className="text-lg font-semibold text-gray-800 mt-2 block">
                                    ₹{product.price}
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </div>
                {page < totalPages && (
                    <div className="flex justify-center mt-8">
                        <button
                            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                            onClick={handleLoadMore}
                            disabled={isLoading}
                        >
                            {isLoading ? "Loading..." : "Load More"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Zenztore;
