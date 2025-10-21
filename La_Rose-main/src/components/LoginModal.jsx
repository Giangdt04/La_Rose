import React from 'react';

const LoginModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleLogin = (e) => {
    e.preventDefault();
    alert('Đăng nhập thành công! (Đây là bản demo)');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-6">
          <h3 className="font-playfair text-2xl font-bold text-rose-deep">Đăng nhập</h3>
        </div>
        <form onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input type="email" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <input type="password" required className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500" />
            </div>
          </div>
          <button type="submit" className="w-full mt-6 bg-rose-500 text-white p-3 rounded-lg hover:bg-rose-600 transition-colors">
            Đăng nhập
          </button>
        </form>
        <div className="text-center mt-4">
          <button onClick={onClose} className="text-gray-600 hover:text-rose-500">Đóng</button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;