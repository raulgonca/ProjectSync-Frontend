import { FaUsers, FaFolderOpen, FaBuilding, FaSpinner } from 'react-icons/fa';

const icons = {
  users: FaUsers,
  projects: FaFolderOpen,
  clients: FaBuilding,
  default: FaSpinner,
};

const LoadingSpinner = ({ section = 'default', text = 'Cargando...' }) => {
  const Icon = icons[section] || icons.default;
  return (
    <div className="flex flex-col items-center justify-center min-h-[120px] py-8 w-full">
      <Icon className="animate-spin text-4xl text-purple-500 mb-3" />
      <span className="text-lg text-gray-600">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
