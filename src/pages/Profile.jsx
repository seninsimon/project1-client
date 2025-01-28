import React, { useEffect, useState } from 'react';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

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
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
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
    const { phonenumber } = userdata;

 
    if (phonenumber.length !== 10) {
      toast.error('Phone number must be 10 digits');
      return;
    }

    // Use SweetAlert2 for confirmation
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to save the changes to your profile?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, save it!',
      cancelButtonText: 'No, cancel'
    });

    if (result.isConfirmed) {
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

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChangePassword = async () => {
    const { newPassword, confirmPassword, oldPassword } = passwords;

    // Password length validation
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }

    // Use SweetAlert2 for confirmation
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to change your password?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it!',
      cancelButtonText: 'No, cancel'
    });

    if (result.isConfirmed) {
      const allData = { token, oldPassword, newPassword };

      try {
        const passwordresponse = await axiosClient.post('/changepassword', allData);
        console.log('passwordresponse:', passwordresponse);

        setIsPasswordModalOpen(false);
        toast.success('Password changed successfully');
      } catch (error) {
        console.log('Error changing password:', error);
        if (error.response.data.password === 'google') {
          toast.error('Google users can\'t change the password');
        } else if (error.response.data.password === false) {
          toast.error('Old password is wrong');
        } else {
          toast.error('Failed to change password');
        }
      }
    }
  };

  const handleCancelPasswordChange = () => {
    setIsPasswordModalOpen(false);
    setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
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
          <h2 className="text-xl">{userdata.email}</h2>
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
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
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
            <div className="mb-4 relative">
              <label className="block text-gray-700 font-bold mb-2">Old Password:</label>
              <input
                type={showPasswords.oldPassword ? "text" : "password"}
                name="oldPassword"
                value={passwords.oldPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 border rounded"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("oldPassword")}
                className="absolute right-2 top-10 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.oldPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="mb-4 relative">
              <label className="block text-gray-700 font-bold mb-2">New Password:</label>
              <input
                type={showPasswords.newPassword ? "text" : "password"}
                name="newPassword"
                value={passwords.newPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 border rounded"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("newPassword")}
                className="absolute right-2 top-10 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.newPassword ? "🙈" : "👁️"}
              </button>
            </div>
            <div className="mb-4 relative">
              <label className="block text-gray-700 font-bold mb-2">Confirm New Password:</label>
              <input
                type={showPasswords.confirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={passwords.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full p-2 border rounded"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility("confirmPassword")}
                className="absolute right-2 top-10 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.confirmPassword ? "🙈" : "👁️"}
              </button>
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

