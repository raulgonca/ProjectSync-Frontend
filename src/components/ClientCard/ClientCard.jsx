import React from 'react';
import { FaUser, FaIdCard, FaPhone, FaEnvelope, FaGlobe, FaPen } from 'react-icons/fa';

const ClientCard = ({ client, onEdit }) => {
  // Función para truncar texto largo
  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const user = JSON.parse(localStorage.getItem('user'));
  // Soporta roles como array de strings o array de objetos con "authority"
  const roles = user?.roles || user?.authorities || [];
  const isAdmin = Array.isArray(roles)
    ? roles.some(r => r === 'ROLE_ADMIN' || r.authority === 'ROLE_ADMIN')
    : false;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 my-3 overflow-hidden w-full border border-gray-200">
      <div className="flex flex-col md:flex-row relative">
        {/* Botón editar solo para admin */}
        {isAdmin && onEdit && (
          <button
            className="absolute top-3 right-3 bg-white text-purple-500 hover:bg-purple-100 rounded-full p-2 shadow"
            onClick={() => onEdit(client)}
            title="Editar cliente"
          >
            <FaPen />
          </button>
        )}
        
        {/* Cabecera con nombre del cliente */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-300 to-transparent text-white p-4 md:p-5 md:w-1/3 flex items-center">
          <div className="flex items-center">
            <FaUser className="text-2xl mr-3 bg-white text-purple-500 p-1.5 rounded-full flex-shrink-0" />
            <h3 className="text-xl font-bold truncate" title={client.name}>
              {truncateText(client.name, 30)}
            </h3>
          </div>
        </div>
        
        {/* Información del cliente */}
        <div className="p-4 md:p-5 md:w-2/3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center">
              <FaIdCard className="text-gray-600 mr-3 flex-shrink-0" />
              <p className="truncate"><span className="font-semibold">CIF:</span> {client.cif}</p>
            </div>
            
            <div className="flex items-center">
              <FaPhone className="text-gray-600 mr-3 flex-shrink-0" />
              <p className="truncate"><span className="font-semibold">Teléfono:</span> {client.phone}</p>
            </div>
            
            <div className="flex items-center">
              <FaEnvelope className="text-gray-600 mr-3 flex-shrink-0" />
              <p className="truncate"><span className="font-semibold">Email:</span> {client.email}</p>
            </div>
            
            <div className="flex items-center">
              <FaGlobe className="text-gray-600 mr-3 flex-shrink-0" />
              <div className="truncate">
                <span className="font-semibold">Web:</span> {client.web ? (
                  <a href={client.web} target="_blank" rel="noopener noreferrer" className="text-purple-500 hover:text-purple-700 underline transition-colors">
                    {truncateText(client.web, 25)}
                  </a>
                ) : (
                  <span className="text-gray-500 italic">No disponible</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientCard;