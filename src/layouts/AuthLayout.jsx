import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="auth-container min-h-screen bg-gray-100">
      <Outlet />
    </div>
  );
};

export default AuthLayout;