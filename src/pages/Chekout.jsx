
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import ZenztoreNav from '../components/ZenztoreNav';
import { toast } from 'react-toastify';

const Checkout = () => {
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [newAddress, setNewAddress] = useState({
        fullName: '',
        phoneNumber: '',
        address: '',
        city: '',
        pincode: '',
        state: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('online_payment');
    const [errors, setErrors] = useState({});
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [finalPrice, setFinalPrice] = useState(0);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [coupons, setCoupons] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const { totalPrice, cartItems } = location.state;

    useEffect(() => {
        const confirmtoken = localStorage.getItem("orderconfirmed")
        if (confirmtoken) {
            navigate('/')
        }
    }, [navigate])

    const fetchAddresses = async () => {
        try {
            const token = localStorage.getItem('usertoken') || localStorage.getItem('authToken');
            const response = await axiosClient.post('/fetchaddresses', { token });
            setAddresses(response.data.addresses);
        } catch (error) {
            console.error('Error fetching addresses:', error);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    useEffect(() => {
        setFinalPrice(totalPrice - discount);
    }, [totalPrice, discount]);

    const handlePincodeChange = async (e) => {
        const pincode = e.target.value;
        setNewAddress((prev) => ({ ...prev, pincode }));

        if (pincode.length === 6) {
            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
                const data = await response.json();
                if (data[0].Status === 'Success') {
                    const { District, State } = data[0].PostOffice[0];
                    setNewAddress((prev) => ({ ...prev, city: District, state: State }));
                }
            } catch (error) {
                console.error('Error fetching city/state from pincode:', error);
            }
        }
    };

    const handleAddAddress = async () => {
        const validationErrors = {};

        if (newAddress.fullName.length < 3) {
            validationErrors.fullName = 'Full Name must be at least 3 characters.';
        }

        if (!/^\d{10}$/.test(newAddress.phoneNumber)) {
            validationErrors.phoneNumber = 'Phone number must be 10 digits.';
        }

        if (!newAddress.address || !newAddress.city || !newAddress.state || !newAddress.pincode) {
            validationErrors.address = 'All fields must be filled.';
        }

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const token = localStorage.getItem('usertoken') || localStorage.getItem('authToken');
            const response = await axiosClient.post('/addaddress', { token, newAddress });

            setAddresses((prev) => [...prev, response.data.address]);
            setNewAddress({
                fullName: '',
                phoneNumber: '',
                address: '',
                city: '',
                pincode: '',
                state: ''
            });
            setErrors({});
        } catch (error) {
            console.error('Error adding new address:', error);
            if (error.response.data.success === false) {
                toast.error('Cannot add more than 3 addresses.');
            } else if (error.response.data.success === "invalid") {
                toast.error('All details should be provided.');
            }
        }
    };

    const handlePaymentChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    // Updated handleConfirmOrder with coupon logic
    const handleConfirmOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please select an address.');
            return;
        }

        const token = localStorage.getItem('usertoken') || localStorage.getItem('authToken');
        const orderData = {
            token,
            cartItems,
            totalPrice: finalPrice,
            addressId: selectedAddress,
            paymentMethod,
            appliedCoupon: selectedCoupon ? selectedCoupon.code : null,


        };

        if (paymentMethod === 'online_payment') {


            const retrydata = {
                token,
                cartItems,
                totalPrice: finalPrice,
                addressId: selectedAddress,
                paymentMethod,
                appliedCoupon: selectedCoupon ? selectedCoupon.code : null,
                status: "payment_pending"
            }



            try {
                const amount = (finalPrice + 50) * 100;
                const { data } = await axiosClient.post('/create-razorpay-order', { amount });

                if (!window.Razorpay) {
                    toast.error('Payment gateway not available.');
                    return;
                }

                const options = {
                    key: data.key,
                    amount,
                    currency: 'INR',
                    name: 'Zenztore',
                    description: 'Order Payment',
                    order_id: data.orderId,
                    handler: async function (response) {
                        const paymentData = {
                            ...orderData,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                        };

                        try {
                            const confirmResponse = await axiosClient.post('/confirm-razorpay-payment', paymentData);
                            localStorage.setItem('orderconfirmed', confirmResponse.data.message);
                            navigate('/ordersuccessfull');
                        } catch (error) {

                            console.error('Payment confirmation failed:', error);
                            toast.error('Payment confirmation failed. Please contact support.');
                        }
                    },
                    prefill: {
                        name: newAddress.fullName,
                        email: 'example@example.com',
                        contact: newAddress.phoneNumber,
                    },
                    theme: {
                        color: '#3399cc',
                    },
                };

                const razorpay = new window.Razorpay(options);


                razorpay.on('payment.failed', async function (response) {
                    console.error('Payment failed:', response);

                    const failureData = {
                        ...retrydata,
                        error: {
                            code: response.error.code,
                            description: response.error.description,
                            source: response.error.source,
                            step: response.error.step,
                            reason: response.error.reason,
                        },
                    };

                    try {
                        // Post the failure data to the backend
                        const confirmResponse = await axiosClient.post('/confirm-razorpay-payment', failureData);

                        toast.error('Payment failed. Details recorded.');

                    } catch (error) {
                        console.error('Failed to record payment failure:', error);
                        toast.error('Payment failed. Unable to record failure details.');

                    }
                });
                razorpay.open();



            } catch (error) {
                console.error('Error during online payment:', error);
                toast.error('Payment failed. Please try again.');

            }

        }
        
        else if (paymentMethod === 'wallet')
        {
           try {

            const response = await axiosClient.post('/orderconfirm', orderData);
            console.log("wallet purchace",orderData)
            console.log("wallet response", response);
            
            localStorage.setItem("orderconfirmed", response.data.message);
            navigate('/ordersuccessfull');
            
           } catch (error) {
            console.error('Error confirming order:', error);
                toast.error('Order confirmation failed due to insufficient balance.');
           }
        }
        
        
        
        else {
            try {
                const response = await axiosClient.post('/orderconfirm', orderData);
                localStorage.setItem("orderconfirmed", response.data.message);
                navigate('/ordersuccessfull');

            } catch (error) {
                console.error('Error confirming order:', error);
                toast.error('Order confirmation failed.');
            }
        }
    };

    useEffect(() => {
        fetchCoupons()
    }, [])

    const fetchCoupons = async () => {
        try {
            const response = await axiosClient.get("/fetchcoupons")
            setCoupons(response.data.coupons)
        } catch (error) {
            console.log(error);
        }
    }

    // Updated coupon handling functions
    const handleApplyCoupon = async () => {
        if (!couponCode) {
            toast.error('Please enter a coupon code.');
            return;
        }

        try {
            const response = await axiosClient.post('/couponapply', { couponCode, totalPrice });

            if (response.data.success) {
                setSelectedCoupon({
                    code: couponCode.toUpperCase(),
                    discount: response.data.discount
                });
                setDiscount(response.data.discount);
                toast.success('Coupon selected successfully!');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            toast.error(error.response?.data?.message || 'Failed to apply coupon.');
        }
    };

    const handleRemoveCoupon = () => {
        setSelectedCoupon(null);
        setCouponCode('');
        setDiscount(0);
        toast.success('Coupon removed successfully!');
    };

    const indianStates = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
        "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
        "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
        "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
        "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
        "Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
    ];

    return (
        <>
            <ZenztoreNav />
            <div className="bg-gray-100 min-h-screen py-8 mt-16">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl font-semibold text-gray-800 mb-6">Checkout</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white shadow-lg rounded-lg p-6 space-y-4">
                            {/* Address Selection Section */}
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Select Address:</h2>
                                <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                    {addresses.length > 0 ? (
                                        addresses.map((address) => (
                                            <div
                                                key={address._id}
                                                onClick={() => setSelectedAddress(address._id)}
                                                className={`border p-4 rounded-lg shadow-sm cursor-pointer transition duration-300 ${selectedAddress === address._id
                                                    ? 'border-blue-600 bg-blue-50'
                                                    : 'border-gray-300'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-gray-800">
                                                        {address.fullName}
                                                    </p>
                                                    {selectedAddress === address._id && (
                                                        <span className="text-blue-600 font-semibold">Selected</span>
                                                    )}
                                                </div>
                                                <p className="text-gray-600 text-sm mt-1">
                                                    {address.address}, {address.city}, {address.state} -{' '}
                                                    {address.pincode}
                                                </p>
                                                <p className="text-gray-600 text-sm mt-1">
                                                    Phone: {address.phoneNumber}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-600">No addresses found. Please add a new address.</p>
                                    )}
                                </div>
                            </div>

                            {/* Manage Addresses Button */}
                            <div className="flex justify-center items-center py-4">
                                <a href="/user/address">
                                    <button className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 hover:shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400">
                                        Manage Addresses
                                    </button>
                                </a>
                            </div>

                            {/* Add New Address Form */}
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Add New Address:</h2>
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={newAddress.fullName}
                                        onChange={(e) => setNewAddress((prev) => ({ ...prev, fullName: e.target.value }))}
                                        placeholder="Full Name"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    />
                                    {errors.fullName && <p className="text-red-600 text-sm">{errors.fullName}</p>}

                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        value={newAddress.phoneNumber}
                                        onChange={(e) => setNewAddress((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                                        placeholder="Phone Number"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    />
                                    {errors.phoneNumber && <p className="text-red-600 text-sm">{errors.phoneNumber}</p>}

                                    <textarea
                                        name="address"
                                        value={newAddress.address}
                                        onChange={(e) => setNewAddress((prev) => ({ ...prev, address: e.target.value }))}
                                        placeholder="Address"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                        rows="3"
                                    />
                                    {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}

                                    <input
                                        type="text"
                                        name="pincode"
                                        value={newAddress.pincode}
                                        onChange={handlePincodeChange}
                                        placeholder="Pincode"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    />

                                    <input
                                        type="text"
                                        name="city"
                                        value={newAddress.city}
                                        readOnly
                                        placeholder="City"
                                        className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
                                    />

                                    <select
                                        name="state"
                                        value={newAddress.state}
                                        onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value }))}
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="" disabled>Select State</option>
                                        {indianStates.map((state) => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleAddAddress}
                                        className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg"
                                    >
                                        Add Address
                                    </button>
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Payment Method:</h2>

                                {/* Cash on Delivery Option */}
                                <label className="flex items-center space-x-2 mb-2">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash_on_delivery"
                                        checked={paymentMethod === 'cash_on_delivery'}
                                        onChange={handlePaymentChange}
                                        disabled={finalPrice > 1000}  // Disable if final price is greater than ₹1000
                                    />
                                    <span>Cash on Delivery</span>
                                </label>

                                {/* Conditional message if final price is greater than ₹1000 */}
                                {finalPrice > 1000 && (
                                    <p className="text-sm text-red-600">
                                        Cash on Delivery is not available for orders above ₹1000
                                    </p>
                                )}

                                {/* Online Payment Option */}
                                <label className="flex items-center space-x-2 mb-2">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="online_payment"
                                        checked={paymentMethod === 'online_payment'}
                                        onChange={handlePaymentChange}
                                    />
                                    <span>Online Payment</span>
                                </label>

                                {/* Wallet Option */}
                                <label className="flex items-center space-x-2 mb-2">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="wallet"
                                        checked={paymentMethod === 'wallet'}
                                        onChange={handlePaymentChange}
                                    />
                                    <span>Wallet</span>
                                </label>
                            </div>


                            {/* Updated Apply Coupon Section */}
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Apply Coupon:</h2>
                                <div className="space-y-2">
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                            placeholder="Enter coupon code"
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            disabled={selectedCoupon !== null}
                                        />
                                        {!selectedCoupon ? (
                                            <button
                                                onClick={handleApplyCoupon}
                                                className="px-4 py-2 rounded-lg text-white bg-blue-500 hover:bg-blue-600"
                                            >
                                                Apply
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleRemoveCoupon}
                                                className="px-4 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                    {selectedCoupon && (
                                        <div className="text-sm text-green-600">
                                            Coupon {selectedCoupon.code} selected! Discount: ₹{selectedCoupon.discount}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div className="border-t pt-4 space-y-2">
                                {discount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <p className="text-lg font-semibold text-gray-800">Discount:</p>
                                        <p className="text-lg font-semibold text-green-600">-₹{discount}</p>
                                    </div>
                                )}
                                <p className="text-lg font-semibold text-gray-800">Delivery charge : 50/- </p>

                                <div className="flex justify-between items-center">

                                    <p className="text-lg font-semibold text-gray-800">Final Price:</p>
                                    <p className="text-lg font-semibold text-green-600">₹{finalPrice + 50}</p>
                                </div>
                            </div>

                            {/* Confirm Order Button */}
                            <button
                                onClick={handleConfirmOrder}
                                disabled={!selectedAddress}
                                className="w-full py-2 px-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-400 transition duration-300 disabled:opacity-50"
                            >
                                Confirm Order
                            </button>
                        </div>

                        {/* Cart Summary Section */}
                        <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
                            <h2 className="text-2xl font-semibold border-b pb-4 text-gray-800">Cart Summary</h2>
                            <ul className="space-y-4 divide-y divide-gray-200">
                                {cartItems.map((item) => (
                                    <li key={item.id} className="flex justify-between items-center py-4">
                                        <div className="flex items-center space-x-4">
                                            <img
                                                className="w-16 h-16 object-cover rounded-md"
                                                src={item.productId.imageUrls[0]}
                                                alt={item.productId.productName}
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">{item.productId.productName}</p>
                                                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className="text-lg font-semibold text-gray-800">Total Price:</p>
                                    <p className="text-lg font-semibold text-green-600">₹{totalPrice}</p>
                                </div>
                            </div>

                            {/* Available Coupons Section */}
                            {totalPrice > 1500 ?
                            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Available Coupons:</h3>
                            <ul className="space-y-2">
                                {coupons.map((cop) => (
                                    <li
                                        key={cop.code}
                                        className="flex justify-between items-center p-3 bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <span className="font-medium text-gray-700">{cop.code}</span>
                                        <span className="font-medium text-gray-700">discount : ₹{cop.discount}</span>
                                    </li>
                                ))}
                            </ul>
                        </div> : <p className="text-gray-700">Coupons are available for purchases over ₹1500.</p>

                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Checkout;


