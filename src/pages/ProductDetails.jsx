import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosClient from '../api/axiosClient';
import ZenztoreNav from '../components/ZenztoreNav';
import './ProductDetails.css';
import { toast } from 'react-toastify';
import CategoryNav from '../components/CategoryNav';
import { productService, homepageService, cartService } from './apiservices/ProductDetailsService';


const ProductDetails = () => {
    const navigate = useNavigate();
    const { id } = useParams();

    const [product, setProducts] = useState({
        productName: '',
        sku: '',
        modelName: '',
        price: '',
        quantity: '',
        description: '',
        brand: '',
        categoryName: '',
        imageUrls: [],

        rating: 4.2,  // Dummy rating
        categoryId: ""
    });


    const [discount, setDiscount] = useState({
        value: 0,
        type: null
    })

    const [productDiscount, setProductDiscount] = useState({
        value: 0,
        type: null
    })

    const [reviews, setReviews] = useState([
        { name: "John Doe", comment: "Excellent product!", rating: 5 },
        { name: "Jane Smith", comment: "Good quality, fast delivery.", rating: 4 },
        { name: "Mark Lee", comment: "Decent for the price.", rating: 3 },
    ]);

    const [image, setImage] = useState("");
    const [zoomedImagePos, setZoomedImagePos] = useState({ top: 0, left: 0 });






    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const data = await productService.fetchProductDetails(id);
                setProducts(data);
            } catch (error) {
                navigate('*'); // Navigate to the error page if an error occurs
            }
        };

        fetchProduct();
    }, [id, navigate]);

    useEffect(() => {
        fetchOfferData()
        fetchProductOffer()
    }, [])

    const [categoryProduct, setCategoryProduct] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const products = await homepageService.fetchHomepageProducts();
                setCategoryProduct(products);
            } catch (error) {
                console.error('Error fetching homepage products:', error);
            }
        };
        fetchProducts();
    }, []);




    const fetchOfferData = async () => {
        try {
            const offerresponse = await axiosClient.post(`/offerforcategory/${id}`);
            console.log("Category offer response:", offerresponse);
            setDiscount({
                value: offerresponse.data.categoryDiscount?.value || 0,
                type: offerresponse.data.categoryDiscount?.type || null,
            });
        } catch (error) {
            console.error("Error fetching category discount:", error);
        }
    };

    const fetchProductOffer = async () => {
        try {
            const offerresponse = await axiosClient.get(`/productoffer/${id}`);
            console.log("Product offer response:", offerresponse);
            setProductDiscount({
                value: offerresponse.data.productOffer?.value || 0,
                type: offerresponse.data.productOffer?.type || null,
            });
        } catch (error) {
            console.error("Error fetching product discount:", error);
        }
    };




    const categoryFilter = categoryProduct.filter((pro) => {
        return pro.categoryId?._id === product.categoryId;
    });

    const handleRecProduct = (id) => {
        navigate(`/product/${id}`);
    };

    // Add to cart function
    const addToCart = async () => {
        console.log("addToCart");

        let token
        const tok1 = localStorage.getItem("usertoken");
        const tok2 = localStorage.getItem("authToken");
        if (tok1) {
            token = tok1
        }
        else if (tok2) {
            token = tok2
        }

        if (!token) {
            console.log("No token, redirecting...");
            navigate("/login"); // Navigate to login page if no token
            return;
        }

        try {
            const response = await cartService.addToCart(id, token);
            console.log("Add to cart response:", response);
            toast.success("Product added to cart");
        } catch (error) {
            console.error("Error in add to cart:", error);
            toast.success("product already added")
        }
    };

    const handleImage = (img) => {
        setImage(img);
    };

    const handleMouseMove = (e) => {
        const imageElement = e.target;
        const { offsetX, offsetY } = e.nativeEvent;
        const { width, height } = imageElement.getBoundingClientRect();

        const posX = (offsetX / width) * 100;
        const posY = (offsetY / height) * 100;

        setZoomedImagePos({ top: posY, left: posX });
    };

    // Framer Motion Variants
    const fadeIn = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
    };

    const staggerContainer = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 },
        },
    };

    const zoomEffect = {
        hidden: { scale: 0.9, opacity: 0 },
        visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
    };

    const reviewFade = {
        hidden: { opacity: 0, x: -50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.6 } },
    };

    const finalPrice = () => {
        const productDiscountPrice = productDiscount?.type === 'flat'
            ? product.price - productDiscount.value
            : product.price - (product.price * productDiscount.value) / 100;

        const categoryDiscountPrice = discount?.type === 'flat'
            ? product.price - discount.value
            : product.price - (product.price * discount.value) / 100;

        const bestPrice = Math.min(productDiscountPrice, categoryDiscountPrice);

        return Math.max(0, isFinite(bestPrice) ? bestPrice : product.price); // Ensure price doesn't go negative
    };


    useEffect(() => {
        const fetchProductDetailsAndOffers = async () => {
            try {
                const data = await productService.fetchProductDetails(id);
                setProducts(data);
    
                // Fetch product-specific offer
                const productOfferResponse = await axiosClient.get(`/productoffer/${id}`);
                setProductDiscount({
                    value: productOfferResponse.data.productOffer?.value || 0,
                    type: productOfferResponse.data.productOffer?.type || null,
                });
    
                // Fetch category-specific offer
                const categoryOfferResponse = await axiosClient.post(`/offerforcategory/${id}`);
                setDiscount({
                    value: categoryOfferResponse.data.categoryDiscount?.value || 0,
                    type: categoryOfferResponse.data.categoryDiscount?.type || null,
                });
            } catch (error) {
                console.error("Error fetching product details or offers:", error);
                navigate('*'); // Navigate to error page
            }
        };
    
        fetchProductDetailsAndOffers();
    }, [id, navigate]);
    


    return (
        <>
            <ZenztoreNav />
            <div className=''>

                <CategoryNav />

                {/* Breadcrumb */}
                <motion.div
                    className="w-4/5 mx-auto mt-6 border text-gray-600"
                    variants={fadeIn}
                    initial="hidden"
                    animate="visible"
                >
                    <nav className="text-sm">
                        <ol className="flex space-x-2">
                            <li>
                                <Link to="/" className="hover:text-orange-500 ">Home</Link>
                            </li>
                            <li>&gt;</li>
                            <li>
                                <p className="hover:text-orange-500 cursor-pointer" onClick={() => navigate(`/category/${product.categoryName}`)}  >  {product.categoryName} </p>
                            </li>
                            <li>&gt;</li>
                            <li className="text-gray-500">{product.productName}</li>
                        </ol>
                    </nav>
                </motion.div>

                {/* Product Details Section */}
                <motion.div
                    className="w-4/5 mx-auto bg-gray-50 rounded-2xl py-10 mt-6 flex justify-around media-query-product-details"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Left Section with Thumbnails */}
                    <motion.div className="flex space-x-6" variants={fadeIn}>
                        <div className="flex flex-col space-y-4 disableimg">
                            {product.imageUrls.length > 0 ? product.imageUrls.map((img, index) => (
                                <motion.img
                                    key={index}
                                    className="w-24 h-24 object-cover rounded-md border-2 border-gray-300 cursor-pointer hover:scale-105 transition-transform duration-300"
                                    onClick={() => handleImage(img)}
                                    src={img}
                                    alt={`Product Thumbnail ${index + 1}`}
                                    variants={zoomEffect}
                                />
                            )) : <div>No images available</div>}
                        </div>

                        {/* Main Image with Zoom Effect */}
                        <div className="flex-shrink-0 relative min-w-max">
                            <motion.img
                                src={image || product.imageUrls[0] || '/placeholder-image.jpg'}
                                className="w-96 h-96 object-contain border rounded-md shadow-lg"
                                alt="Product Main"
                                onMouseMove={handleMouseMove}
                                onMouseLeave={() => setZoomedImagePos({ top: 0, left: 0 })}
                                variants={zoomEffect}
                                initial="hidden"
                                animate="visible"
                            />

                            {/* Zoomed Image */}
                            <div
                                className="absolute top-0 left-0 border bg-gray-800 bg-opacity-50 rounded-md"
                                style={{
                                    backgroundImage: `url(${image || product.imageUrls[0]})`,
                                    backgroundSize: '200%',
                                    backgroundPosition: `${zoomedImagePos.left}% ${zoomedImagePos.top}%`,
                                    display: zoomedImagePos.top > 0 && zoomedImagePos.left > 0 ? 'block' : 'none',
                                    zIndex: 10,
                                    left: '110%',
                                    top: '0',
                                    width: '500px',
                                    height: '500px',
                                    borderRadius: '8px',
                                }}
                            />
                        </div>
                    </motion.div>

                    {/* Product Info */}
                    <motion.div className="mt-10 min-w-max" variants={fadeIn}>
                        <h2 className="text-3xl font-semibold text-gray-800">{product.productName}</h2>
                        <p className="mt-2 text-xl text-gray-600"><span className="font-bold">{product.brand}</span></p>
                        <p className="mt-4 text-lg text-gray-700 w-96">{product.description}</p>
                        <div className="mt-6 flex items-center space-x-4">
                            <span className="text-2xl font-semibold text-green-600">
                                ₹{finalPrice()}
                                <span className="text-base text-gray-600 line-through ml-5">
                                    ₹{product.price} {/* Show original price only if discount is applied */}
                                </span>
                            </span>

                            <span className="text-xl text-gray-500">{product.quantity >= 1 ? <p>Stock quantity: <span className='text-green-500'>{product.quantity}</span></p> : <span className='text-red-800'>Out of stock</span>}</span>
                        </div>
                        <div className="mt-8 flex items-center space-x-4">
                            {
                                product.quantity >= 1 ? (
                                    <a href="/cart">
                                        <button
                                            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                                            onClick={addToCart}
                                        >
                                            Add to Cart
                                        </button>
                                    </a>
                                ) : (
                                    <button className="px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed" disabled>
                                        Add to Cart
                                    </button>
                                )
                            }



                        </div>
                        <button
                            className="px-6 py-3 mt-5 bg-slate-300 border text-black rounded-lg hover:bg-blue-600 transition-colors"
                            onClick={() => console.log("Open Review Modal")}
                        >
                            Rate Product
                        </button>
                    </motion.div>
                </motion.div>

                {/* Recommended Products */}
                <div>
                    <h1 className='text-center font-sans text-3xl p-10'>Recommended Products</h1>
                    <motion.div
                        className='w-full flex justify-center gap-10 flex-wrap'
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0, scale: 0.95 },
                            visible: { opacity: 1, scale: 1, transition: { staggerChildren: 0.2 } },
                        }}
                    >
                        {categoryFilter.map((img) => (
                            <motion.div
                                key={img._id}
                                className='cursor-pointer'
                                onClick={() => handleRecProduct(img._id)}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                                }}
                            >
                                <div className="border w-72 flex flex-col items-center justify-center rounded-lg shadow-lg p-4">
                                    {/* Product Image */}
                                    <motion.img
                                        src={img.imageUrls[0]}
                                        alt={img.productName}
                                        className="w-48 h-48 object-cover rounded-md"
                                        whileHover={{
                                            scale: 1.1,
                                            transition: { duration: 0.3 },
                                        }}
                                    />
                                    {/* Product Details */}
                                    <div className="text-center mt-4">
                                        {/* Product Name */}
                                        <h2 className="text-xl font-semibold text-gray-800">{img.productName}</h2>
                                        {/* Product Price */}
                                        <span className="text-lg font-semibold text-green-600 mt-2 block">₹{img.price}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Ratings & Reviews */}
                <div className="w-full flex flex-col items-center mt-10 p-48">
                    <motion.h1
                        className="text-3xl text-center mb-6"
                        variants={fadeIn}
                        initial="hidden"
                        animate="visible"
                    >
                        Ratings & Reviews
                    </motion.h1>
                    <motion.div
                        className="w-full max-w-4xl space-y-6 flex flex-col items-center"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        {reviews.map((review, index) => (
                            <motion.div
                                key={index}
                                className="p-4 border rounded-lg shadow-sm bg-white w-full"
                                variants={reviewFade}
                            >
                                <div className="flex items-center space-x-4 mb-2">
                                    <p className="text-lg font-bold text-gray-900">{review.name}</p>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <span
                                                key={i}
                                                className={`text-lg ${i < review.rating ? "text-yellow-500" : "text-gray-300"}`}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-700 text-sm">{review.comment}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </>
    );
};

export default ProductDetails;
















