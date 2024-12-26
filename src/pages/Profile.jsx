import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';

const Profile = () => {
  const token = localStorage.getItem('usertoken') || localStorage.getItem('authToken');

  const [userdata, setUserData] = useState({
    username: '',
    email: '',
    phonenumber: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const userData = await axiosClient.post('/userprofile', { token });
      console.log('User data:', userData.data.user);
      setUserData(userData.data.user);
    } catch (error) {
      console.log('Error fetching user data:', error);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveUser = async () => {
    try {
      const updatedUser = await axiosClient.post('/editprofile', { token, ...userdata });
      console.log('Updated user data:', updatedUser.data.user);
      setUserData(updatedUser.data.user);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.log('Error saving user data:', error);
      toast.error('other user with this email or username already exists');
    }
  };

  const handleCancelEdit = () => {
    fetchUserData();
    setIsEditing(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangePassword = async () => {

    const allData = { token, ...passwords }

    try {
      const passwordresponse = await axiosClient.post('/changepassword', allData);


      console.log('passwordresponse:', passwordresponse);


      setIsPasswordModalOpen(false);
      toast.success('Password changed successfully');
    } catch (error) {
      console.log('Error changing password:', error);
      console.log(error.response);
      if (error.response.data.password == "google") {
        toast.error("google users cant change the password")
      }
      else if (error.response.data.password == false) {
        toast.error("old password is wrong")
      }
      else {
        toast.error('Failed to change password');
      }


    }
  };

  const handleCancelPasswordChange = () => {
    setIsPasswordModalOpen(false);
    setPasswords({ oldPassword: '', newPassword: '' });
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Username:</label>
          {isEditing ? (
            <input
              type="text"
              name="username"
              value={userdata.username}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <h2 className="text-xl">{userdata.username}</h2>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Email:</label>
          {isEditing ? (
            <input
              type="email"
              name="email"
              value={userdata.email}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <h2 className="text-xl">{userdata.email}</h2>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Phone Number:</label>
          {isEditing ? (
            <input
              type="text"
              name="phonenumber"
              value={userdata.phonenumber}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
          ) : (
            <h2 className="text-xl">{userdata.phonenumber}</h2>
          )}
        </div>

        {isEditing ? (
          <div className="flex space-x-4">
            <button onClick={handleSaveUser} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Save
            </button>
            <button onClick={handleCancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={handleEditToggle} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Edit Profile
          </button>
        )}
      </div>
      <div>
        <button onClick={() => setIsPasswordModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Change Password
        </button>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6  mt-6">
        <h3 className="text-2xl font-bold mb-4">FAQs</h3>
        <div className="mb-4">
          <p className="font-semibold">What happens when I update my email address (or mobile number)?</p>
          <p>Your login email ID (or mobile number) changes, likewise. You'll receive all your account-related communication on your updated email address (or mobile number).</p>
        </div>
        <div className="mb-4">
          <p className="font-semibold">When will my account be updated with the new email address (or mobile number)?</p>
          <p>It happens as soon as you confirm the verification code sent to your email (or mobile) and save the changes.</p>
        </div>
        <div className="mb-4">
          <p className="font-semibold">What happens to my existing account when I update my email address (or mobile number)?</p>
          <p>Updating your email address (or mobile number) doesn't invalidate your account. Your account remains fully functional. You'll continue seeing your order history, saved information, and personal details.</p>
        </div>
        <div className="mb-4">
          <p className="font-semibold">Does my Seller account get affected when I update my email address?</p>
          <p>Any changes will reflect in your Seller account also, as per the 'single sign-on' policy.</p>
        </div>
      </div>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold mb-4">Change Password</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Old Password:</label>
              <input
                type="password"
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">New Password:</label>
              <input
                type="password"
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="flex space-x-4">
              <button onClick={handleChangePassword} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Save
              </button>
              <button onClick={handleCancelPasswordChange} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
