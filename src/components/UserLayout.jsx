import React, { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import ZenztoreNav from "./ZenztoreNav";


const UserLayout = () => {

  const navigate = useNavigate();

   useEffect(()=>
  {

    navigate('/user/profile')
    
  },[])


  return (
    <>
    <ZenztoreNav/>
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg">
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold text-gray-800">User Dashboard</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-4">
            <li>
              <NavLink
                to="profile"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg ${
                    isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-200"
                  }`
                }
              >
                Profile Information
              </NavLink>
            </li>
            <li>
              <NavLink
                to="address"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg ${
                    isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-200"
                  }`
                }
              >
                Manage Address
              </NavLink>
            </li>
            <li>
              <NavLink
                to="orders"
                className={({ isActive }) =>
                  `block px-4 py-2 rounded-lg ${
                    isActive ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-200"
                  }`
                }
              >
                Orders
              </NavLink>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 mt-20">
        <Outlet /> {/* Render the nested routes here */}
      </main>
    </div>
    </>
  );
};

export default UserLayout;
