import React, { useState } from 'react';
import AddressAddModal from '../modals/AddressAddModal'; // Modal component

const ManageAddress = () => {
  const [addresses, setAddresses] = useState([
    // Initial list of addresses (for demonstration)
    { id: 1, name: 'John Doe', number: '1234567890', address: '123 Main St', city: 'New York', state: 'NY', pincode: '10001' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Save new address (add it to the list)
  const handleSaveAddress = (newAddress) => {
    setAddresses([...addresses, { id: Date.now(), ...newAddress }]);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Manage Your Addresses</h2>

      <button
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        onClick={openModal}
      >
        Add New Address
      </button>

      <div className="mt-6 space-y-4">
        {addresses.map((address) => (
          <div key={address.id} className="flex justify-between items-center p-4 bg-gray-100 rounded-lg shadow-sm">
            <div>
              <p className="font-semibold">{address.name}</p>
              <p>{address.number}</p>
              <p>{address.address}</p>
              <p>{address.city}, {address.state} - {address.pincode}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Address Add Modal */}
      <AddressAddModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveAddress}
      />
    </div>
  );
};

export default ManageAddress;
