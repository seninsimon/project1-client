import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';

const ManageAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('usertoken') || localStorage.getItem('authToken');
      const response = await axiosClient.post('/fetchaddresses', { token });
      setAddresses(response.data.addresses);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleDeleteAddress = async (id) => {
    console.log("id",id);
    
    try {
      const token = localStorage.getItem('usertoken') || localStorage.getItem('authToken');
      await axiosClient.post('/deleteaddress', { token, addressId: id });
      setAddresses((prevAddresses) => prevAddresses.filter((address) => address._id !== id));
      toast.success('Address deleted successfully');
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  const handleEditAddress = (address) => {

    console.log("edit address",address);
    
    setSelectedAddress(address);
    setIsModalOpen(true);


  };

  const handleAddAddress = () => {
    setSelectedAddress({
      fullName: '',
      phoneNumber: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    });
    setIsModalOpen(true);
    
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async () => {
    try {
      const token = localStorage.getItem('usertoken') || localStorage.getItem('authToken');
      if (selectedAddress._id) {
        await axiosClient.post('/editaddress', { token, ...selectedAddress });
        setAddresses((prevAddresses) =>
          prevAddresses.map((address) =>
            address._id === selectedAddress._id ? selectedAddress : address
          )
        );
        toast.success('Address updated successfully');
      } else {
        const response = await axiosClient.post('/addnewaddress', { token, ...selectedAddress });
        setAddresses((prevAddresses) => [...prevAddresses, response.data.address]);
        toast.success('Address added successfully');
      }
      setIsModalOpen(false);
      fetchAddresses()
    } catch (error) {
      console.error('Error saving address:', error);
      console.log("error.response",error.response);
      
      if(error.response.data.success == false)
      {
        toast.error('cannot add more than 3 addresses');
      }
      else{
        toast.error('Failed to save address');
      }

      
    }
  };

  const handleCancelEdit = () => {
    setIsModalOpen(false);
    setSelectedAddress(null);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Addresses</h1>
      <button
        onClick={handleAddAddress}
        className="mb-6 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Add Address
      </button>
      {addresses.map((address) => (
        <div key={address?._id} className="bg-white shadow-md rounded-lg w-96 p-6 mb-6 relative">
          <button
            onClick={() => handleDeleteAddress(address?._id)}
            className="absolute   text-4xl top-2 right-10 text-red-500 hover:text-red-700"
          >
            x
          </button>
          <button
            onClick={() => handleEditAddress(address)}
            className="absolute bottom-7 rounded-lg  bg-orange-300  border p-2 right-7 text-black hover:text-orange-600"
          >
            Edit
          </button>
          <h3 className="text-xl font-bold mb-2">Name: {address?.fullName || 'N/A'}</h3>


          <p className="text-lg mb-2">Phone: {address?.phoneNumber}</p>
          <p className="text-lg mb-2">Address: {address?.address}</p>
          <p className="text-lg mb-2">City: {address?.city}</p>
          <p className="text-lg mb-2">State: {address?.state}</p>
          <p className="text-lg mb-2">Pincode: {address?.pincode}</p>
        </div>
      ))}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">{selectedAddress._id ? 'Edit Address' : 'Add Address'}</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Name:</label>
              <input
                type="text"
                name="fullName"
                value={selectedAddress.fullName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Phone:</label>
              <input
                type="text"
                name="phoneNumber"
                value={selectedAddress.phoneNumber}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Address:</label>
              <input
                type="text"
                name="address"
                value={selectedAddress.address}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">City:</label>
              <input
                type="text"
                name="city"
                value={selectedAddress.city}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">State:</label>
              <input
                type="text"
                name="state"
                value={selectedAddress.state}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Pincode:</label>
              <input
                type="text"
                name="pincode"
                value={selectedAddress.pincode}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex space-x-4">
              <button onClick={handleSaveAddress} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Save
              </button>
              <button onClick={handleCancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAddress;