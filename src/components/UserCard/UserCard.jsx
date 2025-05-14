import React from 'react';
import { FaUser, FaEnvelope, FaUserTag, FaEdit, FaTrash } from 'react-icons/fa';

const UserCard = ({ user, onEdit, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
      <div className="relative">
        {/* Botones de acción en la esquina superior derecha */}
        <div className="absolute top-0 right-0 flex space-x-2">
          <button 
            onClick={() => onEdit(user)} 
            className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
            title="Editar usuario"
          >
            <FaEdit />
          </button>
          <button 
            onClick={() => onDelete(user.id)} 
            className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
            title="Eliminar usuario"
          >
            <FaTrash />
          </button>
        </div>
        
        {/* Contenido centrado de la tarjeta */}
        <div className="flex flex-col items-center text-center">
          {/* Icono de usuario grande en el centro */}
          <div className="bg-purple-100 p-6 rounded-full mb-4">
            <FaUser className="text-purple-600 text-4xl" />
          </div>
          
          {/* Nombre de usuario */}
          <h3 className="text-xl font-semibold text-gray-800 mb-1">{user.name}</h3>
          <p className="text-sm text-gray-500 mb-4">@{user.username}</p>
          
          {/* Información adicional */}
          <div className="w-full space-y-3 mt-2">
            <div className="flex items-center justify-center text-gray-600">
              <FaEnvelope className="mr-2 text-purple-500" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center justify-center text-gray-600">
              <FaUserTag className="mr-2 text-purple-500" />
              <span className={`px-3 py-1 rounded-full text-xs ${
                user.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user.role === 'admin' ? 'Administrador' : 'Usuario'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserCard;