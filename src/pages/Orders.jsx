import React, { useEffect, useState } from "react";
import { fetchOrders, cancelOrder } from './apiservices/OrdersService';
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";



const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [paginatedOrders, setPaginatedOrders] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);
  const [productToReturn, setProductToReturn] = useState(null);
  const [quantityToCancel, setQuantityToCancel] = useState(0);
  const [cancelReason, setCancelReason] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 12;
  const [totalPrice, setTotalPrice] = useState(0)
  const [paymentmethod, setpaymentmethod] = useState("")

  const navigate = useNavigate();
  const token = localStorage.getItem("usertoken") || localStorage.getItem("authToken");

  useEffect(() => {
    fetchUserOrders();
  }, []);

 
  const fetchUserOrders = async () => {
    try {
      const token = localStorage.getItem("usertoken") || localStorage.getItem("authToken");
      const orders = await fetchOrders(token);
      console.log("super orders :",orders);
      

      // Calculate discounts for each order
      const ordersWithDiscount = orders.map((order) => {
        const totalProductPrices = order.products.reduce(
          (acc, product) => acc + product.price * product.quantity,
          0
        );
        const discount = totalProductPrices - order.totalPrice;
        return { ...order, discount };
      });



      setOrders(ordersWithDiscount);
      setPaginatedOrders(ordersWithDiscount.slice(0, ordersPerPage)); // Set initial page data
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders");
    }
  };


  // Handle order cancellation
  const handleCancelOrder = async (totprice) => {
    if (!cancelReason.trim()) {
      toast.error("Please provide a reason for cancellation.");
      return;
    }

    console.log("total price :", totprice);

    try {
      const token = localStorage.getItem("usertoken") || localStorage.getItem("authToken");
      await cancelOrder(token, orderToCancel, quantityToCancel, totprice, paymentmethod, cancelReason);

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
  const openConfirmModal = (orderId, quantity, totalprice, paymentmehtod) => {
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
    setCancelReason(""); // Reset cancel reason
  };

  // Open return modal
  const openReturnModal = (productId, orderId) => {
    setProductToReturn({ productId, orderId });
    setIsReturnModalOpen(true);
  };

  // Close return modal
  const closeReturnModal = () => {
    setIsReturnModalOpen(false);
    setProductToReturn(null);
    setReturnReason(""); // Reset return reason
  };

  // Navigate to product detail page
  // Update handleProductReturn function
  const handleProductReturn = async () => {
    if (!returnReason.trim()) {
      toast.error("Please provide a reason for return.");
      return;
    }

    try {
      const response = await axiosClient.post('/returnproductid', { productid: productToReturn.productId, orderid: productToReturn.orderId, reason: returnReason });
      console.log(response);
      fetchUserOrders(); // Refresh orders after returning the product

      Swal.fire("Returned!", "The product has been successfully returned.", "success");
      closeReturnModal();
    } catch (error) {
      console.error("Error returning product:", error);

      Swal.fire("Error!", "Something went wrong while returning the product.", "error");
    }
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

  const generateInvoice = (order) => {
    const doc = new jsPDF();

    // Set up the document with a clean, modern font
    doc.setFont('Helvetica', '', 12);

    // Header Section: Company Name and Invoice Title
    doc.setFontSize(24);
    doc.text("Zenztore", 14, 20); // Company Name
    doc.setFontSize(18);
    doc.text("Invoice", 14, 30); // Title

    // Order Information Section
    doc.setFontSize(12);
    doc.text(`Order ID: ${order._id.slice(-5)}`, 14, 40);
    doc.text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 50);
    doc.text(`Customer Name: ${order.address?.fullName || "Senin Simon"}`, 14, 60);
    doc.text(`Address: ${order.address?.address || "Chiriyankandath House, Perinchery"}`, 14, 70);
    doc.text(`City: ${order.address?.city || "Thrissur"}, State: ${order.address?.state || "Kerala"}`, 14, 80);
    doc.text(`Pincode: ${order.address?.pincode || 680306}`, 14, 90);
    doc.text(`Phone: ${order.address?.phoneNumber || 6238951920}`, 14, 100);
    doc.text(`Payment Method: ${order.paymentMethod}`, 14, 110);

    // Add a horizontal line for separation
    doc.setLineWidth(0.5);
    doc.line(14, 120, 200, 120);

    // Table for Order Items (no extra design)
    const tableData = order.products.map((product) => [
      product.productName,
      product.quantity,
      `${product.price.toFixed(2)}`,
      `${(product.quantity * product.price).toFixed(2)}`,
    ]);

    // Add Table (without any styling)
    doc.autoTable({
      startY: 130,
      head: [["Product Name", "Quantity", "Price ", "Total "]],
      body: tableData,
      styles: {
        fontSize: 12,
        cellPadding: 8,
      },
      margin: { top: 130, left: 14, right: 14 },
    });

    // Add Total Price Section
    const finalY = doc.previousAutoTable.finalY;
    doc.text(`Total Discount: ${ order.discount > 0 ? order.discount : 0}/-`, 14, finalY + 10);
    doc.text(`Shipping charge: ${50}/-`, 14, finalY + 15);
    doc.text(`Final Amount: ${order.totalPrice + 50}/-`, 14, finalY + 20);
    

    // Footer Section with Contact Info and Thank You
    doc.setFontSize(10);
    doc.text("Thank you for shopping with Zenztore!", 14, finalY + 30);
    doc.text("Contact us: support@zenztore.com | Phone: 1234567890", 14, finalY + 40);

    // Save the PDF
    doc.save(`Invoice_${order._id.slice(-5)}.pdf`);
  };


  const retryPayment = async (order) => {
    const { _id, totalPrice, address, products } = order;
    console.log(order);
    
  
    const retryData = {
      token,
      cartItems: products.map((product) => ({
        productId: product.productId._id,
        quantity: product.quantity,
        price: product.price,
      })),
      totalPrice,
      addressId: address._id,
      paymentMethod: "online_payment",
      appliedCoupon: order.appliedCoupon || null,
      status: "payment_pending",
      orderID : _id
    };

    console.log(retryData);
    
  
    try {
      const amount = (totalPrice + 50) * 100; // Razorpay requires amount in paisa
      const { data } = await axiosClient.post("/create-razorpay-order", { amount });
  
      if (!window.Razorpay) {
        toast.error("Payment gateway not available.");
        return;
      }
  
      const options = {
        key: data.key,
        amount,
        currency: "INR",
        name: "Zenztore",
        description: "Retry Order Payment",
        order_id: data.orderId,
        handler: async function (response) {
          const paymentData = {
            ...retryData,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
          };
  
          try {
            const confirmResponse = await axiosClient.post(
              "/confirm-razorpay-payment-update",
              paymentData
            );
            localStorage.setItem("orderconfirmed", confirmResponse.data.message);
            toast.success("Payment successful. Order confirmed.");
            fetchUserOrders(); // Refresh orders after successful payment
          } catch (error) {
            console.error("Payment confirmation failed:", error);
            toast.error("Payment confirmation failed. Please contact support.");
          }
        },
        prefill: {
          name: address.fullName || "Customer Name",
          email: "example@example.com", // Replace with user email if available
          contact: address.phoneNumber || "1234567890",
        },
        theme: {
          color: "#3399cc",
        },
      };
  
      const razorpay = new window.Razorpay(options);
  
      razorpay.on("payment.failed", async function (response) {
        console.error("Payment failed:", response);
  
        const failureData = {
          ...retryData,
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
          await axiosClient.post("/confirm-razorpay-payment", failureData);
          toast.error("Payment failed. Details recorded.");
        } catch (error) {
          console.error("Failed to record payment failure:", error);
          toast.error("Payment failed. Unable to record failure details.");
        }
      });
  
      razorpay.open();
    } catch (error) {
      console.error("Error during retry payment:", error);
      toast.error("Retry payment failed. Please try again.");
    }
  };
  






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
          <div className="bg-gray-100 p-4 rounded-lg mr-6 mb-6 lg:mb-0 min-w-64 max-w-64">
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
                    : order.status === "payment_pending"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
              >
                {order.status.replace("_", " ")}
              </span>
            </div>

            {/* Order Information */}
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-semibold text-gray-700">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-semibold text-gray-700">Total Amount:</span> ₹
              {order.totalPrice + order?.discount}
            </p>
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-semibold text-gray-700">Total Discount:</span> ₹
              {order.discount > 0 ? order.discount : 0}
            </p>
            <p className="text-sm text-gray-500 mb-2">
              <span className="font-semibold text-gray-700">Delivery Charge:</span> ₹
              {50}
            </p>
            <p className="text-lg font-semibold mb-2">
              <span className="font-semibold text-gray-700">Final Amount:</span> ₹
              {order.totalPrice + 50}
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-semibold text-gray-700">Payment Method:</span> {order.paymentMethod}
            </p>

            {/* Retry Payment Button (Shown Only When Status is payment_pending) */}
            {order.status === "payment_pending" && (
              <button
                onClick={() => retryPayment(order)}
                className="mt-2 py-1 px-4 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                
                
                Retry Payment
              </button>
            )}

            {/* Invoice Button (Shown Only When Delivered) */}
            {order.status === "Delivered" && (
              <button
                onClick={() => generateInvoice(order)}
                className="mt-2 py-1 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Download Invoice
              </button>
            )}

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
                      onClick={() => navigate(`/product/${product.productId._id}`)}
                    />
                    <div className="flex flex-col">
                      <p className="text-lg font-medium text-gray-700">{product.productName}</p>
                      <p className="text-gray-500">Quantity: {product.quantity}</p>
                      <p className="text-gray-500">Price: {product.price * product.quantity}</p>

                      {/* Show "Return this product" button only if order is delivered and product is not returned */}
                      {order.status === "Delivered" && !product.isProductReturned && (
                        <button
                          onClick={() => openReturnModal(product.productId._id, order._id)}
                          className="mt-2 py-1 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          Return this product
                        </button>
                      )}

                      {/* Show disabled button if the product has already been returned */}
                      {product.isProductReturned &&  (
                        <button
                          disabled
                          className="mt-2 py-1 px-4 bg-gray-300 text-gray-500 cursor-not-allowed rounded-lg"
                        >
                          {product.returning ? "product returned" : "product return requested"} 
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
        <textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="provide reason to cancel"
          className="w-full p-2 mt-2 border rounded"
        />
        <div className="flex space-x-4 mt-4">
          <button
            onClick={() => handleCancelOrder(totalPrice)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            disabled={!cancelReason.trim()}
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

  {isReturnModalOpen && (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Confirm Return</h2>
        <p>Are you sure you want to return this product?</p>
        <textarea
          value={returnReason}
          onChange={(e) => setReturnReason(e.target.value)}
          placeholder="Provide reason to return this product"
          className="w-full p-2 mt-2 border rounded"
        />
        <div className="flex space-x-4 mt-4">
          <button
            onClick={handleProductReturn}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            disabled={!returnReason.trim()}
          >
            Yes, Return
          </button>
          <button
            onClick={closeReturnModal}
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

