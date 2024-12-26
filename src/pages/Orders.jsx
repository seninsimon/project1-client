import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('usertoken') || localStorage.getItem('authToken');
      const response = await axiosClient.post('/fetchorders', { token });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    }
  };

  const handleCancelOrder = async () => {
    try {
      const token = localStorage.getItem('usertoken') || localStorage.getItem('authToken');
      await axiosClient.post('/cancelorder', { token, orderId: orderToCancel });
      setOrders((prevOrders) => prevOrders.map((order) =>
        order._id === orderToCancel ? { ...order, status: 'Cancelled' } : order
      ));
      toast.success('Order canceled successfully');
      setIsConfirmModalOpen(false);
      setOrderToCancel(null);
    } catch (error) {
      console.error('Error canceling order:', error);
      toast.error('Failed to cancel order');
    }
  };

  const openConfirmModal = (orderId) => {
    setOrderToCancel(orderId);
    setIsConfirmModalOpen(true);
  };

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setOrderToCancel(null);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-center text-gray-500">You have no orders yet.</p>
      ) : (
        orders.reverse().map((order) => (
          <div key={order._id} className="bg-white shadow-lg rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Order ID: {order._id}</h3>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded ${
                  order.status === 'Delivered'
                    ? 'bg-green-100 text-green-800'
                    : order.status === 'Cancelled'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {order.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">
              Order Date: {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="text-lg font-semibold mb-2">Total Amount: ₹{
              
              order.totalPrice > 5000 ? `${(order.totalPrice * 0.9).toFixed(2)}` : order.totalPrice
              
              }</p>
            <p className="text-sm text-gray-500 mb-4">Payment Method: {order.paymentMethod}</p>
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-2">Items:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {order.products.map((product) => (
                  <div
                    key={product._id}
                    className="border p-2 rounded-lg flex items-center space-x-4"
                  >
                    <img
                      src={product.image}
                      alt={product.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="text-lg font-medium">{product.productName}</p>
                      <p>quantity : {product.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <button
                onClick={() => openConfirmModal(order._id)}
                className={`px-4 py-2 rounded ${
                  order.status === 'Cancelled' || order.status === 'Delivered'
                    ? 'bg-gray-500 text-white cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
                disabled={order.status === 'Cancelled' || order.status === 'Delivered'}
              >
                {order.status === 'Cancelled' ? 'Order Cancelled' : 'Cancel Order'}
              </button>

            </div>
          </div>
        ))
      )}

      {isConfirmModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Confirm Cancel</h2>
            <p>Are you sure you want to cancel this order?</p>
            <div className="flex space-x-4 mt-4">
              <button onClick={handleCancelOrder} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                Yes, Cancel
              </button>
              <button onClick={closeConfirmModal} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
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
