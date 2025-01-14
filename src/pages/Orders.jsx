
import React, { useEffect, useState } from "react";
import { fetchOrders, cancelOrder } from './apiservices/OrdersService';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Swal from "sweetalert2";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [paginatedOrders, setPaginatedOrders] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [quantityToCancel, setQuantityToCancel] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const [totalPrice , setTotalPrice] = useState(0)
  const [paymentmethod , setpaymentmethod] = useState("")

  const navigate = useNavigate();
  const token = localStorage.getItem("usertoken") || localStorage.getItem("authToken");

  useEffect(() => {
    fetchUserOrders();
  }, []);

  // Fetch orders
  const fetchUserOrders = async () => {
    try {
      const token = localStorage.getItem("usertoken") || localStorage.getItem("authToken");
      const orders = await fetchOrders(token);
      console.log("orders :::", orders);

      setOrders(orders);
      setPaginatedOrders(orders.slice(0, ordersPerPage)); // Set initial page data
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    }
  };

  // Handle order cancellation
  const handleCancelOrder = async (totprice) => {
    console.log("total price :",totprice);
    
    try {
      const token = localStorage.getItem("usertoken") || localStorage.getItem("authToken");
      await cancelOrder(token, orderToCancel, quantityToCancel , totprice , paymentmethod );

      // Update orders and paginatedOrders states
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderToCancel ? { ...order, status: "Cancelled" } : order
        )
      );
      setPaginatedOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderToCancel ? { ...order, status: "Cancelled" } : order
        )
      );

      toast.success("Order canceled successfully");
      closeConfirmModal();
    } catch (error) {
      console.error("Error canceling order:", error);
      toast.error("Failed to cancel order");
    }
  };

 


  // Open confirmation modal
  const openConfirmModal = (orderId, quantity , totalprice , paymentmehtod) => {
    setOrderToCancel(orderId);
    setQuantityToCancel(quantity);
    setTotalPrice(totalprice)
    setpaymentmethod(paymentmehtod)
    setIsConfirmModalOpen(true);
  };

  // Close confirmation modal
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setOrderToCancel(null);
    setQuantityToCancel(0);
  };

  // Navigate to product detail page
  // Update handleProductReturn function
const handleProductReturn = async (productid, orderid) => {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to return this product?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, return it!",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        const response = await axiosClient.post('/returnproductid', { productid, orderid });
        console.log(response);
        fetchUserOrders(); // Refresh orders after returning the product

        Swal.fire("Returned!", "The product has been successfully returned.", "success");
      } catch (error) {
        console.error("Error returning product:", error);

        Swal.fire("Error!", "Something went wrong while returning the product.", "error");
      }
    }
  });
};


  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    const startIndex = (pageNumber - 1) * ordersPerPage;
    const newOrders = orders.slice(startIndex, startIndex + ordersPerPage);
    setPaginatedOrders(newOrders);
  };

  // Calculate total pages
  const totalPages = Math.ceil(orders.length / ordersPerPage);





  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-500">You have no orders yet.</p>
      ) : (
        paginatedOrders.map((order) => (
          <div
            key={order._id}
            className="bg-white shadow-lg rounded-lg p-6 mb-6 border hover:shadow-xl transition-shadow duration-300"
          >
            {/* Main Content */}
            <div className="flex flex-col lg:flex-row">

              {/* Left Section: Delivery Address */}
              <div className="  bg-gray-100 p-4 rounded-lg mr-6 mb-6 lg:mb-0 min-w-64 max-w-64">
                <h3 className="text-lg font-bold mb-2 text-gray-700">Delivery Address</h3>
                <div className="text-gray-600">
                  <p><span className="font-semibold text-gray-800">Name:</span> {order.address?.fullName || "senin simon"}</p>
                  <p><span className="font-semibold text-gray-800">Address:</span> {order.address?.address ||
                    "chiriyankandath house, perinchery"},
                    {order.address?.city || "thrissur"}</p>
                  <p><span className="font-semibold text-gray-800">State:</span> {order.address?.state || "kerala"}</p>
                  <p><span className="font-semibold text-gray-800">Pincode:</span> {order.address?.pincode || 680306}</p>
                  <p><span className="font-semibold text-gray-800">Phone:</span> {order.address?.phoneNumber || 6238951920}</p>
                </div>
              </div>

              {/* Right Section: Order Details */}
              <div className="flex-1">
                {/* Order ID and Status */}
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-700">Order ID: {order._id.slice(-5)}</h3>
                  <span
                    className={`px-3 py-1 text-sm font-semibold rounded ${order.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "Cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                      }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Order Information */}
                <p className="text-sm text-gray-500 mb-2">
                  <span className="font-semibold text-gray-700">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <p className="text-lg font-semibold mb-2">
                  <span className="font-semibold text-gray-700">Total Amount:</span> ₹
                  {order.totalPrice}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  <span className="font-semibold text-gray-700">Payment Method:</span> {order.paymentMethod}
                </p>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="text-lg font-semibold mb-2 text-gray-700">Items:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    
                    {order.products.map((product) => (
                      <div
                        key={product._id}
                        className="border p-4 rounded-lg flex items-center space-x-4 bg-gray-50 hover:shadow-md"
                      >
                        <img
                          src={product.image}
                          alt={product.productName}
                          className="w-16 h-16 object-cover rounded cursor-pointer"
                          onClick={()=>navigate(`/product/${product.productId._id}`)}
                        />
                        {console.log(product)
                        }
                        <div className="flex flex-col">
                          <p className="text-lg font-medium text-gray-700">{product.productName}</p>
                          <p className="text-gray-500">Quantity: {product.quantity}</p>
                          {/* Show "Return this product" button only if order is delivered and product is not returned */}
                          {order.status === "Delivered" && !product.isProductReturned && (
                            <button
                              onClick={() => {
                               
                                handleProductReturn(product.productId._id, order._id);
                              }}
                              className="mt-2 py-1 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                            >
                              Return this product
                            </button>
                          )}
                          {/* Show disabled button if the product has already been returned */}
                          {product.isProductReturned && (
                            <button
                              disabled
                              className="mt-2 py-1 px-4 bg-gray-300 text-gray-500 cursor-not-allowed rounded-lg"
                            >
                              Product Returned
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>




                {/* Action Button */}
                <div className="flex justify-start">
                  <button
                    onClick={() =>
                      openConfirmModal(
                        
                        order._id,
                        order.products.reduce((acc, product) => acc + product.quantity, 0),
                        order.totalPrice,
                        order.paymentMethod

                        
                      )
                    }
                    className={`px-4 py-2 rounded text-sm font-semibold ${order.status === "Cancelled" || order.status === "Delivered"
                      ? "bg-gray-400 text-gray-100 cursor-not-allowed"
                      : "bg-red-500 text-white hover:bg-red-600"
                      }`}
                    disabled={order.status === "Cancelled" || order.status === "Delivered"}
                  >
                    {order.status === "Cancelled" ? "Order Cancelled" : "Cancel Order"}
                  </button>
                  <div>





                  </div>
                </div>
              </div>
            </div>
          </div>

        ))
      )}

      {/* Pagination Controls */}
      <div className="flex justify-center space-x-4 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 rounded ${currentPage === index + 1 ? "bg-blue-600 text-white" : "bg-gray-300"}`}
          >
            {index + 1}
          </button>
        ))}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>

      {isConfirmModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Confirm Cancel</h2>
            <p>Are you sure you want to cancel this order?</p>
            <div className="flex space-x-4 mt-4">
              <button
                onClick={()=>handleCancelOrder(totalPrice)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Yes, Cancel
              </button>
              <button
                onClick={closeConfirmModal}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;

