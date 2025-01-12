

// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import axiosClient from '../api/axiosClient';
// import ZenztoreNav from '../components/ZenztoreNav';
// import { toast } from 'react-toastify';

// const Checkout = () => {
//     const [addresses, setAddresses] = useState([]);
//     const [selectedAddress, setSelectedAddress] = useState('');
//     const [newAddress, setNewAddress] = useState({
//         fullName: '',
//         phoneNumber: '',
//         address: '',
//         city: '',
//         pincode: '',
//         state: ''
//     });
//     const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
//     const [errors, setErrors] = useState({});
//     const navigate = useNavigate();
//     const location = useLocation();

//     const { totalPrice, cartItems } = location.state;
//     console.log("cart items and discount : ", cartItems);

//     useEffect(() => {
//         const confirmtoken = localStorage.getItem("orderconfirmed")
//         if (confirmtoken) {
//             navigate('/')
//         }
//     })

//     const fetchAddresses = async () => {
//         try {
//             const token = localStorage.getItem('usertoken') || localStorage.getItem('authToken');
//             const response = await axiosClient.post('/fetchaddresses', { token });
//             setAddresses(response.data.addresses);
//         } catch (error) {
//             console.error('Error fetching addresses:', error);
//         }
//     };

//     useEffect(() => {
//         fetchAddresses();
//     }, []);

//     const handlePincodeChange = async (e) => {
//         const pincode = e.target.value;
//         setNewAddress((prev) => ({ ...prev, pincode }));

//         if (pincode.length === 6) {
//             try {
//                 const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
//                 const data = await response.json();
//                 if (data[0].Status === 'Success') {
//                     const { District, State } = data[0].PostOffice[0];
//                     setNewAddress((prev) => ({ ...prev, city: District, state: State }));
//                 }
//             } catch (error) {
//                 console.error('Error fetching city/state from pincode:', error);
//             }
//         }
//     };

//     const handleAddAddress = async () => {
//         const validationErrors = {};

//         // Validate full name
//         if (newAddress.fullName.length < 3) {
//             validationErrors.fullName = 'Full Name must be at least 3 characters.';
//         }

//         // Validate phone number
//         if (!/^\d{10}$/.test(newAddress.phoneNumber)) {
//             validationErrors.phoneNumber = 'Phone number must be 10 digits.';
//         }

//         // Validate other required fields
//         if (!newAddress.address || !newAddress.city || !newAddress.state || !newAddress.pincode) {
//             validationErrors.address = 'All fields must be filled.';
//         }

//         if (Object.keys(validationErrors).length > 0) {
//             setErrors(validationErrors);
//             return;
//         }

//         try {
//             const token = localStorage.getItem('usertoken') || localStorage.getItem('authToken');
//             const response = await axiosClient.post('/addaddress', { token, newAddress });

//             setAddresses((prev) => [...prev, response.data.address]);
//             setNewAddress({
//                 fullName: '',
//                 phoneNumber: '',
//                 address: '',
//                 city: '',
//                 pincode: '',
//                 state: ''
//             });
//             setErrors({});
//         } catch (error) {
//             console.error('Error adding new address:', error);
//             if (error.response.data.success === false) {
//                 toast.error('Cannot add more than 3 addresses.');
//             } else if (error.response.data.success === "invalid") {
//                 toast.error('All details should be provided.');
//             }
//         }
//     };

//     const handlePaymentChange = (e) => {
//         setPaymentMethod(e.target.value);
//     };

//     // const handleConfirmOrder = async () => {
//     //     try {
//     //         const token = localStorage.getItem('usertoken') || localStorage.getItem('authToken');
//     //         const allData = {
//     //             token, cartItems, totalPrice,
//     //             addressId: selectedAddress, paymentMethod
//     //         };
//     //         const response = await axiosClient.post('/orderconfirm', allData);
//     //         localStorage.setItem("orderconfirmed", response.data.message);
//     //         navigate('/ordersuccessfull');
//     //     } catch (error) {
//     //         console.error('Error confirming order:', error);
//     //     }
//     // };




//     const handleConfirmOrder = async () => {
//         if (!selectedAddress) {
//             toast.error('Please select an address.');
//             return;
//         }

//         const token = localStorage.getItem('usertoken') || localStorage.getItem('authToken');

//         if (paymentMethod === 'online_payment') {
//             try {
//                 const amount = totalPrice * 100

//                 const { data } = await axiosClient.post('/create-razorpay-order', { amount });

//                 console.log("data key", data);
                

//                 if (!window.Razorpay) {
//                     toast.error('Payment gateway not available.');
//                     return;
//                 }

//                 const options = {
//                     key: data.key,
//                     amount,
//                     currency: 'INR',
//                     name: 'Zenztore',
//                     description: 'Order Payment',
//                     order_id: data.orderId,
//                     handler: async function (response) {
//                         const paymentData = {
//                             razorpayPaymentId: response.razorpay_payment_id,
//                             razorpayOrderId: response.razorpay_order_id,
//                             razorpaySignature: response.razorpay_signature,
//                             token,
//                             cartItems,
//                             totalPrice,
//                             addressId: selectedAddress,
//                             paymentMethod
//                         };

//                         try {
//                             const confirmResponse = await axiosClient.post('/confirm-razorpay-payment', paymentData);
//                             localStorage.setItem('orderconfirmed', confirmResponse.data.message);
//                             navigate('/ordersuccessfull');
//                         } catch (error) {
//                             console.error('Payment confirmation failed:', error);
//                             toast.error('Payment confirmation failed. Please contact support.');
//                         }
//                     },
//                     prefill: {
//                         name: newAddress.fullName,
//                         email: 'example@example.com',
//                         contact: newAddress.phoneNumber,
//                     },
//                     theme: {
//                         color: '#3399cc',
//                     },
//                 };

//                 const razorpay = new window.Razorpay(options);
//                 razorpay.open();
//             } catch (error) {
//                 console.error('Error during online payment:', error);
//                 toast.error('Payment failed. Please try again.');
//             }
//         } else {
//             try {
//                 const allData = {
//                     token,
//                     cartItems,
//                     totalPrice,
//                     addressId: selectedAddress,
//                     paymentMethod,
//                 };
//                 const response = await axiosClient.post('/orderconfirm', allData);
//                 localStorage.setItem('orderconfirmed', response.data.message);
//                 navigate('/ordersuccessfull');
//             } catch (error) {
//                 console.error('Error confirming order:', error);
//                 toast.error('Order confirmation failed.');
//             }
//         }
//     };











//     const indianStates = [
//         "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
//         "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
//         "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
//         "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
//         "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
//         "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
//         "Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
//     ];

//     return (
//         <>
//             <ZenztoreNav />
//             <div className="bg-gray-100 min-h-screen py-8 mt-16">
//                 <div className="max-w-7xl mx-auto px-4">
//                     <h1 className="text-3xl font-semibold text-gray-800 mb-6">Checkout</h1>
//                     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                         <div className="lg:col-span-2 bg-white shadow-lg rounded-lg p-6 space-y-4">
//                             <div>
//                                 <h2 className="text-lg font-semibold mb-2">Select Address:</h2>
//                                 <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
//                                     {addresses.length > 0 ? (
//                                         addresses.map((address) => (
//                                             <div
//                                                 key={address._id}
//                                                 onClick={() => setSelectedAddress(address._id)}
//                                                 className={`border p-4 rounded-lg shadow-sm cursor-pointer transition duration-300 ${selectedAddress === address._id
//                                                     ? 'border-blue-600 bg-blue-50'
//                                                     : 'border-gray-300'
//                                                     }`}
//                                             >
//                                                 <div className="flex items-center justify-between">
//                                                     <p className="font-semibold text-gray-800">
//                                                         {address.fullName}
//                                                     </p>
//                                                     {selectedAddress === address._id && (
//                                                         <span className="text-blue-600 font-semibold">Selected</span>
//                                                     )}
//                                                 </div>
//                                                 <p className="text-gray-600 text-sm mt-1">
//                                                     {address.address}, {address.city}, {address.state} -{' '}
//                                                     {address.pincode}
//                                                 </p>
//                                                 <p className="text-gray-600 text-sm mt-1">
//                                                     Phone: {address.phoneNumber}
//                                                 </p>
//                                             </div>
//                                         ))
//                                     ) : (
//                                         <p className="text-gray-600">No addresses found. Please add a new address.</p>
//                                     )}
//                                 </div>
//                             </div>

//                             <div className="flex justify-center items-center py-4">
//                                 <a href="/user/address">
//                                     <button className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 hover:shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400">
//                                         Manage Addresses
//                                     </button>
//                                 </a>
//                             </div>

//                             <div>
//                                 <h2 className="text-lg font-semibold mb-2">Add New Address:</h2>
//                                 <div className="space-y-2">
//                                     <input
//                                         type="text"
//                                         name="fullName"
//                                         value={newAddress.fullName}
//                                         onChange={(e) => setNewAddress((prev) => ({ ...prev, fullName: e.target.value }))}
//                                         placeholder="Full Name"
//                                         className="w-full p-2 border border-gray-300 rounded-lg"
//                                     />
//                                     {errors.fullName && <p className="text-red-600 text-sm">{errors.fullName}</p>}

//                                     <input
//                                         type="text"
//                                         name="phoneNumber"
//                                         value={newAddress.phoneNumber}
//                                         onChange={(e) => setNewAddress((prev) => ({ ...prev, phoneNumber: e.target.value }))}
//                                         placeholder="Phone Number"
//                                         className="w-full p-2 border border-gray-300 rounded-lg"
//                                     />
//                                     {errors.phoneNumber && <p className="text-red-600 text-sm">{errors.phoneNumber}</p>}

//                                     <textarea
//                                         name="address"
//                                         value={newAddress.address}
//                                         onChange={(e) => setNewAddress((prev) => ({ ...prev, address: e.target.value }))}
//                                         placeholder="Address"
//                                         className="w-full p-2 border border-gray-300 rounded-lg"
//                                         rows="3"
//                                     />
//                                     {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}

//                                     <input
//                                         type="text"
//                                         name="pincode"
//                                         value={newAddress.pincode}
//                                         onChange={handlePincodeChange}
//                                         placeholder="Pincode"
//                                         className="w-full p-2 border border-gray-300 rounded-lg"
//                                     />

//                                     <input
//                                         type="text"
//                                         name="city"
//                                         value={newAddress.city}
//                                         readOnly
//                                         placeholder="City"
//                                         className="w-full p-2 border border-gray-300 rounded-lg bg-gray-100"
//                                     />

//                                     <select
//                                         name="state"
//                                         value={newAddress.state}
//                                         onChange={(e) => setNewAddress((prev) => ({ ...prev, state: e.target.value }))}
//                                         className="w-full p-2 border border-gray-300 rounded-lg"
//                                     >
//                                         <option value="" disabled>Select State</option>
//                                         {indianStates.map((state) => (
//                                             <option key={state} value={state}>{state}</option>
//                                         ))}
//                                     </select>
//                                     <button
//                                         onClick={handleAddAddress}
//                                         className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg"
//                                     >
//                                         Add Address
//                                     </button>
//                                 </div>
//                             </div>

//                             <div>
//                                 <h2 className="text-lg font-semibold mb-2">Payment Method:</h2>
//                                 <label className="flex items-center space-x-2 mb-2">
//                                     <input
//                                         type="radio"
//                                         name="paymentMethod"
//                                         value="cash_on_delivery"
//                                         checked={paymentMethod === 'cash_on_delivery'}
//                                         onChange={handlePaymentChange}
//                                     />
//                                     <span>Cash on Delivery</span>
//                                 </label>
//                                 <label className="flex items-center space-x-2 mb-2">
//                                     <input
//                                         type="radio"
//                                         name="paymentMethod"
//                                         value="online_payment"
//                                         checked={paymentMethod === 'online_payment'}
//                                         onChange={handlePaymentChange}
//                                     />
//                                     <span>online payment</span>
//                                 </label>
//                             </div>

//                             <button
//                                 onClick={handleConfirmOrder}
//                                 disabled={!selectedAddress}
//                                 className="w-full py-2 px-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-400 transition duration-300 disabled:opacity-50"
//                             >
//                                 Confirm Order
//                             </button>
//                         </div>

//                         <div className="bg-white shadow-lg rounded-lg p-6 space-y-6">
//                             <h2 className="text-2xl font-semibold border-b pb-4 text-gray-800">Cart Summary</h2>
//                             <ul className="space-y-4 divide-y divide-gray-200">
//                                 {cartItems.map((item) => (
//                                     <li key={item.id} className="flex justify-between items-center py-4">
//                                         <div className="flex items-center space-x-4">
//                                             <img
//                                                 className="w-16 h-16 object-cover rounded-md"
//                                                 src={item.productId.imageUrls[0]}
//                                                 alt={item.productId.productName}
//                                             />
//                                             <div>
//                                                 <p className="font-medium text-gray-900">{item.productId.productName}</p>
//                                                 <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
//                                             </div>
//                                         </div>
                                       
//                                     </li>
//                                 ))}
//                             </ul>
//                             <div className="border-t pt-4 space-y-2">
                                
//                                 <div className="flex justify-between items-center">
//                                     <p className="text-lg font-semibold text-gray-800">Total Price:</p>
//                                     <p className="text-lg font-semibold text-green-600">₹{totalPrice}</p>
//                                 </div>
//                             </div>
//                         </div>

//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Checkout;


// src/components/Checkout.js
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
    const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
    const [errors, setErrors] = useState({});
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [finalPrice, setFinalPrice] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();

    const { totalPrice, cartItems } = location.state;
    console.log("cart items and discount : ", cartItems);

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

        // Validate full name
        if (newAddress.fullName.length < 3) {
            validationErrors.fullName = 'Full Name must be at least 3 characters.';
        }

        // Validate phone number
        if (!/^\d{10}$/.test(newAddress.phoneNumber)) {
            validationErrors.phoneNumber = 'Phone number must be 10 digits.';
        }

        // Validate other required fields
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

    const handleConfirmOrder = async () => {
        if (!selectedAddress) {
            toast.error('Please select an address.');
            return;
        }

        const token = localStorage.getItem('usertoken') || localStorage.getItem('authToken');

        if (paymentMethod === 'online_payment') {
            try {
                const amount = finalPrice * 100 // Razorpay expects amount in paise

                const { data } = await axiosClient.post('/create-razorpay-order', { amount });

                console.log("data key", data);


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
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature,
                            token,
                            cartItems,
                            totalPrice: finalPrice,
                            addressId: selectedAddress,
                            paymentMethod,
                            appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
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
                razorpay.open();
            } catch (error) {
                console.error('Error during online payment:', error);
                toast.error('Payment failed. Please try again.');
            }
        } else {
            try {
                const allData = {
                    token,
                    cartItems,
                    totalPrice: finalPrice,
                    addressId: selectedAddress,
                    paymentMethod,
                    appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
                };
                const response = await axiosClient.post('/orderconfirm', allData);
                localStorage.setItem("orderconfirmed", response.data.message);
                navigate('/ordersuccessfull');
            } catch (error) {
                console.error('Error confirming order:', error);
                toast.error('Order confirmation failed.');
            }
        }
    };

    // **Handle Apply Coupon**
    const handleApplyCoupon = async () => {
        if (!couponCode) {
            toast.error('Please enter a coupon code.');
            return;
        }

    

        try {
            const response = await axiosClient.post('/couponapply', { couponCode, totalPrice });

            if (response.data.success) {
                setDiscount(response.data.discount);
                setFinalPrice(response.data.discountedPrice);
                setAppliedCoupon({ code: couponCode.toUpperCase() });
                toast.success('Coupon applied successfully!');
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Error applying coupon:', error);
            toast.error(error.response?.data?.message || 'Failed to apply coupon.');
        }
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
                        {/* **Address and Payment Section** */}
                        <div className="lg:col-span-2 bg-white shadow-lg rounded-lg p-6 space-y-4">
                            {/* **Select Address** */}
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

                            {/* **Manage Addresses Button** */}
                            <div className="flex justify-center items-center py-4">
                                <a href="/user/address">
                                    <button className="px-6 py-3 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 hover:shadow-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-400">
                                        Manage Addresses
                                    </button>
                                </a>
                            </div>

                            {/* **Add New Address Form** */}
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

                            {/* **Payment Method Selection** */}
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Payment Method:</h2>
                                <label className="flex items-center space-x-2 mb-2">
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value="cash_on_delivery"
                                        checked={paymentMethod === 'cash_on_delivery'}
                                        onChange={handlePaymentChange}
                                    />
                                    <span>Cash on Delivery</span>
                                </label>
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
                            </div>

                            {/* **Apply Coupon Section** */}
                            <div>
                                <h2 className="text-lg font-semibold mb-2">Apply Coupon:</h2>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="Enter coupon code"
                                        className="w-full p-2 border border-gray-300 rounded-lg"
                                    />
                                    <button
                                        onClick={handleApplyCoupon}
                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>

                            {/* **Price Summary** */}
                            <div className="border-t pt-4 space-y-2">
                                {discount > 0 && (
                                    <div className="flex justify-between items-center">
                                        <p className="text-lg font-semibold text-gray-800">Discount:</p>
                                        <p className="text-lg font-semibold text-green-600">-₹{discount}</p>
                                    </div>
                                )}
                                <div className="flex justify-between items-center">
                                    <p className="text-lg font-semibold text-gray-800">Final Price:</p>
                                    <p className="text-lg font-semibold text-green-600">₹{finalPrice}</p>
                                </div>
                            </div>

                            {/* **Confirm Order Button** */}
                            <button
                                onClick={handleConfirmOrder}
                                disabled={!selectedAddress}
                                className="w-full py-2 px-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-400 transition duration-300 disabled:opacity-50"
                            >
                                Confirm Order
                            </button>
                        </div>

                        {/* **Cart Summary Section** */}
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
                                        {/* Additional item details can go here */}
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className="text-lg font-semibold text-gray-800">Total Price:</p>
                                    <p className="text-lg font-semibold text-green-600">₹{totalPrice}</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
};

export default Checkout;


