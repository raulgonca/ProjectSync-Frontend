import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaPen, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const UserCard = ({ user, onEdit, onDelete, confirmDelete }) => {
  const auth = useAuth();
  // Soporta roles como array de strings o array de objetos con "authority"
  const roles = auth?.currentUser?.roles || auth?.currentUser?.authorities || [];
  const isAdmin = Array.isArray(roles)
    ? roles.some(r => r === 'ROLE_ADMIN' || r.authority === 'ROLE_ADMIN')
    : false;

  const getInitials = (username) => {
    if (!username) return 'U';
    const parts = username.trim().split(' ');
    return parts.length > 1
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : username[0].toUpperCase();
  };

  const generateBgColor = (username) => {
    const colors = [
      'from-blue-500 to-blue-400',
      'from-yellow-600 to-yellow-500',
      'from-teal-500 to-teal-400',
      'from-indigo-500 to-indigo-400',
      'from-purple-500 to-purple-400',
      'from-red-500 to-red-400',
    ];
    const sum = username
      ? username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : 0;
    return colors[sum % colors.length];
  };

  // Función para manejar el clic en el botón de eliminar
  const handleDelete = () => {
    if (onDelete && user && user.id) {
      toast.info(`Eliminando usuario con ID: ${user.id}`);
      onDelete(user.id);
    } else {
      toast.error('No se puede eliminar: falta ID de usuario o función onDelete');
      console.error('No se puede eliminar: falta ID de usuario o función onDelete');
    }
  };

  // Función para manejar el clic en el botón de editar
  const handleEdit = () => {
    if (onEdit && user) {
      onEdit(user); // Debe pasar el usuario a editar
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 p-4 sm:p-6 relative w-full max-w-[280px] sm:max-w-[300px] overflow-hidden">
      {isAdmin && (
        <>
          {/* Botón Editar a la izquierda */}
          <button
            className="absolute top-2 sm:top-3 left-2 sm:left-3 w-6 h-6 sm:w-7 sm:h-7 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow transition z-10"
            onClick={handleEdit}
            title="Editar"
          >
            <FaPen className="text-purple-600 text-xs sm:text-sm" />
          </button>
          {/* Botón Eliminar a la derecha */}
          <button
            className="absolute top-2 sm:top-3 right-2 sm:right-3 w-6 h-6 sm:w-7 sm:h-7 bg-white/70 hover:bg-white rounded-full flex items-center justify-center shadow transition z-10"
            onClick={handleDelete}
            title="Eliminar"
          >
            <FaTrashAlt className="text-red-600 text-xs sm:text-sm" />
          </button>
        </>
      )}

      {/* Avatar */}
      <div className="flex flex-col items-center mb-4 sm:mb-5 relative z-0">
        <div
          className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br ${generateBgColor(
            user?.username
          )} flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg border-[3px] border-white/70`}
        >
          {getInitials(user?.username)}
        </div>
      </div>

      {/* Info alineada */}
      <div className="space-y-2 text-xs sm:text-sm text-gray-800 font-medium font-sans">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-semibold">Nombre:</span>
          <span className="text-right max-w-[60%] truncate">{user?.username || 'Usuario'}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-semibold">Cargo:</span>
          <span
            className={`text-right ${
              user?.cargo === 'ROLE_ADMIN' ? 'text-purple-700' : 'text-purple-600'
            }`}
          >
            {user?.cargo === 'ROLE_ADMIN' ? 'Administrador' : 'Usuario'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-semibold">Rol:</span>
          <span
            className={`text-right ${
              Array.isArray(user?.roles) && user.roles.includes('ROLE_ADMIN') ? 'text-purple-700' : 'text-purple-600'
            }`}
          >
            {Array.isArray(user?.roles) && user.roles.includes('ROLE_ADMIN') ? 'Administrador' : 'Usuario'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserCard;
