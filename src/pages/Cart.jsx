import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import ZenztoreNav from '../components/ZenztoreNav';

const Cart = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]); // State to store cart items
    const [token, setToken] = useState("");
    const [totalPrice, setTotalPrice] = useState(0);
    const [discount, setDiscount] = useState(0); // State to store discount
    const tok = localStorage.getItem('usertoken') || localStorage.getItem('authToken')

    useEffect(() => {
        let token;
        const tok1 = localStorage.getItem('usertoken');
        const tok2 = localStorage.getItem('authToken');
        if (tok1) {
            token = tok1;
            setToken(token);
        } else if (tok2) {
            token = tok2;
            setToken(token);
        }
        if (!token) {
            navigate('/login'); // Redirect if not logged in
        } else {
            fetchCartDetails(token); // Fetch cart details
        }

        // Retrieve discount from localStorage
        const storedDiscount = localStorage.getItem('cartDiscount');
        if (storedDiscount) {
            setDiscount(JSON.parse(storedDiscount)); // Set discount from localStorage
        }
    }, [navigate]);

    useEffect(() => {
        const calculateTotalPrice = () => {
            let price = cartItems.reduce((acc, item) => acc + item.productId.price * item.quantity, 0);
            price -= discount; // Apply discount to total price
            setTotalPrice(price);
        };

        calculateTotalPrice();
    }, [cartItems, discount]);

    const fetchCartDetails = async (token) => {
        try {
            const response = await axiosClient.post('/cart', { token });
            console.log("response again : ", response);

            const cartData = response.data.cartData[0]?.items || [];
            setCartItems(cartData);

            // Calculate discount
            let discountValue = 0;
            cartData.forEach(item => {
                const categoryDiscount = item.productId.categoryId?.discount;
                if (categoryDiscount) {
                    const { type, value } = categoryDiscount;
                    if (type === "flat") {
                        discountValue += value * item.quantity; // Flat discount
                    } else if (type === "percentage") {
                        discountValue += (value / 100) * item.productId.price * item.quantity; // Percentage discount
                    }
                }
            });

            setDiscount(discountValue); // Update discount state
            localStorage.setItem('cartDiscount', JSON.stringify(discountValue)); // Persist discount in localStorage
        } catch (error) {
            console.error('Error fetching cart details:', error);
        }
    };

    const handleIncrement = async (id, quantity, token) => {
        try {
            console.log("Product ID:", id);
            console.log("Quantity:", quantity);
            console.log("Token:", token);

            if (quantity > 2) return;

            const newQuantity = quantity + 1;
            const quantityResponse = await axiosClient.post('/cartincrement', { token, quantity: newQuantity, id });
            console.log(quantityResponse);

            fetchCartDetails(tok)

            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.productId._id === id ? { ...item, quantity: newQuantity } : item
                )
            );

           
        } catch (error) {
            console.error('Error incrementing cart item quantity:', error);
        }
    };

    const handleDecrement = async (id, quantity, token) => {
        try {
            console.log("Product ID:", id);
            console.log("Quantity:", quantity);
            console.log("Token:", token);

            if (quantity <= 1) {
                return;
            }

            const newQuantity = quantity - 1;
            const quantityResponse = await axiosClient.post('/cartdecrement', { token, quantity: newQuantity, id });
            console.log(quantityResponse);

            fetchCartDetails(tok)

            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.productId._id === id ? { ...item, quantity: newQuantity } : item
                )
            );
        } catch (error) {
            console.error('Error decrementing cart item quantity:', error);
        }
    };

    const handleRemove = async (id, token) => {
        try {
            console.log("Product ID:", id);
            console.log("Token:", token);

            const removeResponse = await axiosClient.post('/productremove', { token, id });
            console.log(removeResponse);

            setCartItems((prevItems) => prevItems.filter((item) => item.productId._id !== id));
        } catch (error) {
            console.error('Error removing item from cart:', error);
        }
    };

    const handleCheckOut = async () => {
        try {
            localStorage.removeItem('orderconfirmed');
            const token = localStorage.getItem('usertoken') || localStorage.getItem('authToken');
            if (!token) {
                navigate('/login'); // Redirect if not logged in
                return;
            }

            const checkoutData = {
                items: cartItems,
                totalPrice,
            };

            const allData = { token, checkoutData };
            console.log("checkoutData", checkoutData);

            const checkoutresponse = await axiosClient.post('/checkout', allData);
            console.log("checkoutresponse", checkoutresponse);

            navigate('/checkout', { state: { cartItems, totalPrice } });
        } catch (error) {
            console.error('Error initiating checkout:', error);
        }
    };

    return (
        <>
            <ZenztoreNav />
            <div className="bg-gray-100 min-h-screen py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-semibold text-gray-800 mb-6">Your Cart</h1>
                    {cartItems.length > 0 ? (
                        <>
                            <div className="space-y-6">
                                {cartItems.map((item) => (
                                    <div key={item._id} className="flex items-center justify-between bg-white shadow-lg rounded-lg p-4">
                                        <div className="flex items-center space-x-6">
                                            <img
                                                className="h-32 w-32 object-cover rounded-md"
                                                src={item.productId.imageUrls[0]}
                                                alt={item.productId.productName}
                                            />
                                            <div className="flex flex-col">
                                                <h2 className="text-xl font-medium text-gray-900">{item.productId.productName}</h2>
                                                <p className="text-sm text-gray-600">{item.productId.description.slice(0, 70)}...</p>
                                                <p className="text-lg font-semibold text-gray-800">₹{item.productId.price}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-center space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    className="bg-gray-200 px-4 py-1 rounded-md hover:bg-gray-300 text-xl font-bold"
                                                    onClick={() => handleDecrement(item.productId._id, item.quantity, token)}
                                                >
                                                    −
                                                </button>
                                                <p className="text-gray-700 text-lg">{item.quantity}</p>
                                                <button
                                                    className="bg-gray-200 px-4 py-1 rounded-md hover:bg-gray-300 text-xl font-bold"
                                                    onClick={() => handleIncrement(item.productId._id, item.quantity, token)}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            <button className="text-red-600 hover:text-red-800 font-medium text-sm"
                                                onClick={() => handleRemove(item.productId._id, token)}
                                            >Remove</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 p-6 bg-white shadow-lg rounded-lg space-y-6">
                                <div className="flex justify-between items-center">
                                    <p className="text-lg font-semibold">Price:</p>
                                    <p className="text-lg font-semibold">₹{totalPrice + discount}</p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <p className="text-lg font-semibold">Discount:</p>
                                    <p className="text-lg font-semibold text-red-600">-₹{discount}</p>
                                </div>

                                <div className="flex justify-between items-center">
                                    <p className="text-lg font-semibold">Total Amount:</p>
                                    <p className="text-lg font-semibold text-green-600">₹{totalPrice}</p>
                                </div>

                                <button className="w-full py-2 px-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-400 transition duration-300"
                                    onClick={handleCheckOut}>
                                    Checkout
                                </button>
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-gray-500">Your cart is empty. Add items to your cart!</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default Cart;
