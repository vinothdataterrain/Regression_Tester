import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useUserLogoutMutation } from "../services/login.api.services";
import { logout } from "../utils/constant";
import { useSelector, useDispatch } from "react-redux";
import { setUserdata, resetUserdata } from "../features/userSlice";
import { jwtDecode } from "jwt-decode";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [userLogout] = useUserLogoutMutation();

  const user = useSelector((state) => state.UserInfo.user);

  const handleLogout = () => {
    setAnchorEl(null);
    // Clear user data from Redux store
    dispatch(resetUserdata());
    logout({ userLogout, navigate });
  };


  useEffect(() => {
    const accessToken = localStorage.getItem("access_token");
    if (accessToken && !user) {
      try {
        const decoded = jwtDecode(accessToken);
        if (decoded.username && decoded.email) {
          dispatch(
            setUserdata({
              username: decoded.username,
              email: decoded.email,
              user_id: decoded.user_id,
            })
          );
        }
      } catch (error) {
        console.error("Error decoding access token:", error);
        handleLogout();
      }
    }
  }, [dispatch, user]);


  useEffect(() => {
    const path = location.pathname;
    if (path === "/dashboard") {
      setActiveTab("dashboard");
    }
    if (path === "/projects") {
      setActiveTab("projects");
    } else if (path === "/results") {
      setActiveTab("results");
    } else if (path === "/pythonScripts") {
      setActiveTab("pythonScripts");
    }
  }, [location.pathname]);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊", path: "/dashboard" },
    { id: "projects", label: "Projects", icon: "📊", path: "/projects" },
    { id: "results", label: "Results", icon: "📋", path: "/results" },
    {
      id: "pythonScripts",
      label: "Python Scripts",
      icon: "",
      path: "/pythonScripts",
    },
  ];

  const handleTabClick = (item) => {
    setActiveTab(item.id);
    navigate(item.path);
  };

  return (
    <div className="min-h-screen w-full  bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm  border-b border-gray-200">
        <div className=" mx-2  px-4 sm:px-6 lg:px-4">
          <div className="flex justify-between items-center h-16">
            {/* Left side - Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">🧪</span>
              </div>
              <h4 className="text-[12px] md:text-[20px]  font-semibold text-gray-900">
                Playwright Testing Suite
              </h4>
            </div>

            {/* Right side - User Menu */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  {user?.username || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {user?.email || "user@gmail.com"}
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={handleMenuClick}
                  className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors duration-200"
                >
                  <span className="text-gray-600">👤</span>
                </button>

                {/* Dropdown Menu */}
                {anchorEl && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={handleMenuClose}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <span>👤</span>
                      <span>Profile</span>
                    </button>
                    <button
                      onClick={handleMenuClose}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <span>⚙️</span>
                      <span>Settings</span>
                    </button>
                    <hr className="my-1 border-gray-200" />
                    <button
                      onClick={() => handleLogout()}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <span>🚪</span>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="bg-white p-2 m-4 min-w-32 overflow-x-scroll border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabClick(item)}
                className={`p-2 border-b-2 font-medium text-sm shadow rounded transition-colors duration-200 flex items-center space-x-2 ${
                  activeTab === item.id
                    ? "border-blue-500 text-blue-600 rounded-sm "
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      {/* <main className="flex-1 bg-gray-50">
        {children}
      </main> */}

      {/* Main Content Area for Nested Routes */}
      <main className="flex-1 w-full bg-gray-50 p-4">
        <Outlet />
      </main>

      {/* Click outside to close menu */}
      {anchorEl && (
        <div className="fixed inset-0 z-40" onClick={handleMenuClose}></div>
      )}
    </div>
  );
};

export default Navbar;