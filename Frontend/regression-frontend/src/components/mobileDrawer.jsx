import { Close as CloseIcon } from '@mui/icons-material';

const MobileDrawer = ({ open, onClose, navigationItems, activeTab, handleTabClick }) => {
  if (!open) return null;

  const handleItemClick = (item) => {
    handleTabClick(item);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-transparent bg-opacity-50 z-40 lg:hidden transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 lg:hidden transform transition-transform duration-300">
        {/* Drawer Header */}
        <div className="flex justify-between items-center p-4 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Navigation</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-4 space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`w-full p-3 rounded-lg font-medium text-sm transition-colors duration-200 flex items-center space-x-3 ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;