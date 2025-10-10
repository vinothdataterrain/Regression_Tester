import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import { useUserLogoutMutation } from "../services/login.api.services";
import { logout } from "../utils/constant";
import { useSelector, useDispatch } from "react-redux";
import { setUserdata, resetUserdata } from "../features/userSlice";
import { jwtDecode } from "jwt-decode";
import { Menu as MenuIcon, Close as CloseIcon, Dataset, Analytics, Article, Terminal } from '@mui/icons-material';
import MobileDrawer from './mobileDrawer';

const MainNavbar = ({ user, activeTab, navigationItems, handleTabClick, handleLogout }) => {
  const [anchorEl, setAnchorEl] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleMenuClick = () => setAnchorEl(!anchorEl);
  const handleMenuClose = () => setAnchorEl(false);

  return (
    <>
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-2 px-4 sm:px-6 lg:px-4">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <MenuIcon />
            </button>

            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-base sm:text-lg font-bold">🧪</span>
              </div>
              <h4 className="text-xs sm:text-sm md:text-lg lg:text-xl font-semibold text-gray-900 truncate">
                TestFlow
              </h4>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Hide user info on small screens */}
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-gray-900">{user?.username }</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
              
              <div className="relative">
                <button
                  onClick={handleMenuClick}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors duration-200"
                >
                  <span className="text-gray-600">👤</span>
                </button>
                
                {/* Desktop Dropdown */}
                {anchorEl && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={handleMenuClose}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                      {/* Show user info on mobile in dropdown */}
                      <div className="sm:hidden px-4 py-2 border-b border-gray-200">
                        <div className="text-sm font-medium text-gray-900">{user?.username}</div>
                        <div className="text-xs text-gray-500">{user?.email}</div>
                      </div>
                      
                      {/* <button
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
                      </button> */}
                      {/* <hr className="my-1 border-gray-200" /> */}
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                      >
                        <span>🚪</span>
                        <span>Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Secondary Navigation */}
      <div className="hidden lg:block bg-white p-2 m-4 border-gray-200">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 sm:gap-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                key={item.id}
                onClick={() => handleTabClick(item)}
                className={`p-2 border-b-2 font-medium text-sm shadow rounded transition-colors duration-200 flex items-center space-x-2 ${
                  activeTab === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="text-lg" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        navigationItems={navigationItems}
        activeTab={activeTab}
        handleTabClick={handleTabClick}
      />
    </>
  );
};

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

  const handleMenuClose = () => setAnchorEl(null);

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Analytics, path: "/dashboard" },
    { id: "projects", label: "Projects", icon: Dataset, path: "/projects" },
    { id: "results", label: "Results", icon: Article, path: "/results" },
    {
      id: "pythonScripts",
      label: "Python Scripts",
      icon: Terminal,
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
     <MainNavbar user={user} activeTab={activeTab} navigationItems={navigationItems} handleTabClick={handleTabClick} handleLogout={handleLogout}/>
      

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