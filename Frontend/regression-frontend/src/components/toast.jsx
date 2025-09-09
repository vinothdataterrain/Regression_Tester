import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Toast types and their respective colors
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
};

// Toast positions
const TOAST_POSITIONS = {
  TOP_RIGHT: 'top-right',
  TOP_LEFT: 'top-left',
  TOP_CENTER: 'top-center',
  BOTTOM_RIGHT: 'bottom-right',
  BOTTOM_LEFT: 'bottom-left',
  BOTTOM_CENTER: 'bottom-center',
};

// Default configuration for toasts
const defaultConfig = {
  position: TOAST_POSITIONS.TOP_RIGHT,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

// Toast utility function
const showToast = (message, type = TOAST_TYPES.INFO, config = {}) => {
  const toastConfig = {
    ...defaultConfig,
    ...config,
  };

  switch (type) {
    case TOAST_TYPES.SUCCESS:
      toast.success(message, toastConfig);
      break;
    case TOAST_TYPES.ERROR:
      toast.error(message, toastConfig);
      break;
    case TOAST_TYPES.WARNING:
      toast.warning(message, toastConfig);
      break;
    case TOAST_TYPES.INFO:
    default:
      toast.info(message, toastConfig);
      break;
  }
};

// ToastProvider component
const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  );
};

// Custom hook for using toast
const useToast = () => {
  return {
    showToast,
    success: (message, config) => showToast(message, TOAST_TYPES.SUCCESS, config),
    error: (message, config) => showToast(message, TOAST_TYPES.ERROR, config),
    warning: (message, config) => showToast(message, TOAST_TYPES.WARNING, config),
    info: (message, config) => showToast(message, TOAST_TYPES.INFO, config),
  };
};

export { ToastProvider, useToast, TOAST_TYPES, TOAST_POSITIONS };