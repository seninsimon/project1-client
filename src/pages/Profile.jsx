import React, { useState } from 'react';
import ProfileModal from '../modals/ProfileModal';

const Profile = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [formData, setFormData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '1234567890',
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Open the modal
  const openModal = () => setIsModalOpen(true);

  // Close the modal
  const closeModal = () => setIsModalOpen(false);

  // Handle form submission (you can later add backend integration)
  const handleSaveChanges = (e) => {
    e.preventDefault();
    // Here you can send `formData` to the backend
    console.log(formData);
    closeModal(); // Close modal after saving
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Profile Information</h2>

      <div className="space-y-2">
        <p><strong>Full Name:</strong> {formData.fullName}</p>
        <p><strong>Email:</strong> {formData.email}</p>
        <p><strong>Phone Number:</strong> {formData.phoneNumber}</p>
      </div>

      <button
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        onClick={openModal}
      >
        Edit User Information
      </button>

      {/* Modal Component */}
      <ProfileModal isOpen={isModalOpen} onClose={closeModal}>
        <h3 className="text-lg font-semibold mb-4">Edit Profile</h3>
        <form onSubmit={handleSaveChanges}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg"
                required
              />
            </div>

            <div className="flex justify-end space-x-4 mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </ProfileModal>
      <div className="mt-6 p-4 bg-gray-100 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold mb-3">FAQs</h3>
        <div className="space-y-4">
          <div>
            <p className="font-medium text-gray-700">What happens when I update my email address (or mobile number)?</p>
            <p className="text-gray-600">Your login email id (or mobile number) changes, likewise. You'll receive all your account related communication on your updated email address (or mobile number).</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">When will my account be updated with the new email address (or mobile number)?</p>
            <p className="text-gray-600">It happens as soon as you confirm the verification code sent to your email (or mobile) and save the changes.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">What happens to my existing account when I update my email address (or mobile number)?</p>
            <p className="text-gray-600">Updating your email address (or mobile number) doesn't invalidate your account. Your account remains fully functional. You'll continue seeing your Order history, saved information, and personal details.</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Does my Seller account get affected when I update my email address?</p>
            <p className="text-gray-600">Flipkart has a 'single sign-on' policy. Any changes will reflect in your Seller account also.</p>
          </div>
        </div>
      </div>
      
    </div>

    
  );
};

export default Profile;
