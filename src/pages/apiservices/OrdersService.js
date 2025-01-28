import axiosClient from "../../api/axiosClient";






// Fetch user orders
export const fetchOrders = async (token) => {
  const response = await axiosClient.post("/fetchorders", { token });
  return response.data.orders; // Return only the orders
};



// Cancel an order
export const cancelOrder = async (token, orderId, quantity , totalprice , paymentmethod , cancelReason) => {
  const response = await axiosClient.post("/cancelorder", {
    token,
    orderId,
    quantity,
    totalprice,
    paymentmethod,
    cancelReason
  });
  return response.data; 
};
