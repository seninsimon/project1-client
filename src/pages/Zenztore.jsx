import React, { useEffect, useState ,useRef  } from 'react';
import { motion } from 'framer-motion';
import ZenztoreNav from '../components/ZenztoreNav';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import CategoryNav from '../components/CategoryNav';

const Zenztore = () => {
    const [products, setProducts] = useState([]);


    useEffect(() => {
        
        fetchProducts();
    }, []);


    

    const fetchProducts = async () => {
        try {
            const response = await axiosClient.get('/homepage');
            console.log("home page :",response.data.allProducts);
            
            if (response.data.success) {
                setProducts(response.data.allProducts);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const navigate = useNavigate();

    const handleProductClick = (id) => {
        navigate(`/product/${id}`);
    };

    const section1 = useRef(null)

    const scrollToSection = (sectionRef) => {
        sectionRef.current.scrollIntoView({ behavior: "smooth" });
    };




    // Animation variants for Framer Motion
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
    };

    const productVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    };

    const heroTextVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay: 0.2 } },
    };

    const heroButtonVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: 0.4 } },
    };

    return (
        <div className="bg-slate-100">
            <ZenztoreNav />
            <CategoryNav  />

            {/* Hero Section */}
            <div className="relative w-full h-screen">
                {/* Video Background */}
                <div className="absolute inset-0">
                    <video
                        src="/ryzen.mp4"
                        loop
                        autoPlay
                        muted
                        className="w-full h-full object-cover"
                    ></video>
                </div>

                {/* Content Above Video */}
                <div className="absolute inset-0 flex flex-col items-center justify-end text-center text-white bg-black bg-opacity-40 pb-48">
                    <motion.h2
                        variants={heroTextVariants}
                        initial="hidden"
                        animate="visible"
                        className="text-5xl mb-4"
                    >
                        Explore the best products at unbeatable prices
                    </motion.h2>
                    <motion.button
                        variants={heroButtonVariants}
                        initial="hidden"
                        animate="visible"
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        onClick={()=>scrollToSection(section1)}
                    >
                        Shop Now
                    </motion.button>
                </div>
            </div>

            {/* Products Section */}
            <motion.div
                className="container mx-auto p-24"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                ref={section1}
            >
                <h2 className="text-3xl font-bold mb-6 text-center ">
                Best Sellers</h2>
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                    variants={containerVariants}
                >
                    {products.map((product) => (
                        <motion.div
                            key={product._id}
                            className="bg-white rounded-lg shadow-lg flex flex-col justify-center items-center overflow-hidden hover:shadow-xl transform hover:scale-105 transition duration-300 cursor-pointer"
                            variants={productVariants}
                            onClick={() => handleProductClick(product._id)}
                        >
                            {/* Product Image */}
                            <div className="w-full h-60 flex justify-center items-center bg-gray-100">
                                <img
                                    src={product.imageUrls[0]}
                                    alt={product.productName}
                                    className="max-h-full max-w-full object-contain"
                                />
                            </div>
                            {/* Product Details */}
                            <div className="p-4 text-center">
                                <h2 className="text-xl font-semibold text-gray-800">
                                    {product.productName}
                                </h2>
                                <span className="text-lg font-semibold text-gray-800 mt-2 block">
                                ₹{product.price}  
                                </span>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

            </motion.div>
        </div>
    );
};

export default Zenztore;
