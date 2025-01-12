


import React, { useState } from 'react';

const AddressAddModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    number: '',
    address: '',
    pincode: '',
    city: '',
    state: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    let isValid = true;
    let newErrors = {};

    // Validate Name
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters long.';
      isValid = false;
    }

    // Validate Mobile Number
    if (!formData.number || !/^\d{10}$/.test(formData.number)) {
      newErrors.number = 'Mobile number must be 10 digits.';
      isValid = false;
    }

    // Validate Address
    if (!formData.address) {
      newErrors.address = 'Address is required.';
      isValid = false;
    }

    // Validate City
    if (!formData.city) {
      newErrors.city = 'City is required.';
      isValid = false;
    }

    // Validate State
    if (!formData.state) {
      newErrors.state = 'State is required.';
      isValid = false;
    }

    // Validate Pincode
    if (!formData.pincode || !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Pincode must be a 6-digit number.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      // If form is valid, call the onSave function from the parent
      onSave(formData);
      onClose(); // Close the modal after saving
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h3 className="text-lg font-semibold mb-4">Add New Address</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.name ? 'border-red-500' : ''}`}
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-gray-700">Mobile Number</label>
              <input
                type="text"
                name="number"
                value={formData.number}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.number ? 'border-red-500' : ''}`}
              />
              {errors.number && <p className="text-sm text-red-500">{errors.number}</p>}
            </div>

            <div>
              <label className="block text-gray-700">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.address ? 'border-red-500' : ''}`}
              />
              {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
            </div>

            <div>
              <label className="block text-gray-700">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.city ? 'border-red-500' : ''}`}
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-gray-700">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.state ? 'border-red-500' : ''}`}
              />
              {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-gray-700">Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                className={`w-full p-2 border rounded-lg ${errors.pincode ? 'border-red-500' : ''}`}
              />
              {errors.pincode && <p className="text-sm text-red-500">{errors.pincode}</p>}
            </div>

            <div className="flex justify-end space-x-4 mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save Address
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressAddModal;

