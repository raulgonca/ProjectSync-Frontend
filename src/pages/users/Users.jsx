import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import UserCard from '../../components/UserCard/UserCard';
import UserModal from '../../components/UserModal/UserModal';
import { FaPlus, FaSearch, FaFilter, FaExclamationTriangle } from 'react-icons/fa';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      // Asegurarnos de que data es un array
      setUsers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error al cargar los usuarios:', err);
      setError('No se pudieron cargar los usuarios. Por favor, inténtalo de nuevo más tarde.');
      setUsers([]); // Establecer un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios según el término de búsqueda y el tipo de filtro
  // Asegurarnos de que users es un array antes de filtrar
  const filteredUsers = Array.isArray(users) ? users.filter(user => {
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase();
    
    switch (filterType) {
      case 'username':
        return user.username && user.username.toLowerCase().includes(term);
      case 'name':
        return user.name && user.name.toLowerCase().includes(term);
      case 'email':
        return user.email && user.email.toLowerCase().includes(term);
      case 'role':
        return user.role && user.role.toLowerCase().includes(term);
      case 'all':
      default:
        return (
          (user.username && user.username.toLowerCase().includes(term)) ||
          (user.name && user.name.toLowerCase().includes(term)) ||
          (user.email && user.email.toLowerCase().includes(term)) ||
          (user.role && user.role.toLowerCase().includes(term))
        );
    }
  }) : [];

  const handleSaveUser = async (userData) => {
    try {
      console.log('Datos a enviar:', userData);
      let updatedUser;
      
      if (currentUser) {
        // Actualizar usuario existente
        updatedUser = await userService.updateUser(currentUser.id, userData);
        setUsers(users.map(user => user.id === currentUser.id ? updatedUser : user));
      } else {
        // Crear nuevo usuario
        updatedUser = await userService.createUser(userData);
        // Recargar la lista completa para asegurar datos actualizados
        await fetchUsers();
      }
      
      setCurrentUser(null);
      return updatedUser;
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
      throw error;
    }
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (confirmDelete === id) {
      try {
        await userService.deleteUser(id);
        setUsers(users.filter(user => user.id !== id));
        setConfirmDelete(null);
      } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        setError('No se pudo eliminar el usuario. Por favor, inténtalo de nuevo más tarde.');
      }
    } else {
      setConfirmDelete(id);
      // Resetear la confirmación después de 3 segundos
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-lg text-gray-600">Cargando usuarios...</div>;
  }

  if (error) {
    return <div className="bg-red-100 text-red-800 p-4 rounded-md my-5">{error}</div>;
  }

  return (
    <div className="p-5">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4 md:mb-0">Usuarios</h1>
        
        <div className="flex flex-col w-full md:w-auto space-y-2 md:space-y-0 md:space-x-2">
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Buscar usuario..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg flex items-center transition-colors"
              title="Mostrar filtros"
            >
              <FaFilter className={`${showFilters ? 'text-purple-600' : 'text-gray-600'}`} />
            </button>
            
            <button 
              onClick={() => {
                setCurrentUser(null);
                setIsModalOpen(true);
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <FaPlus className="mr-2" />
              Nuevo Usuario
            </button>
          </div>
          
          {showFilters && (
            <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 mt-2 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 mr-2 self-center">Filtrar por:</span>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilterType('all')} 
                  className={`px-3 py-1 text-sm rounded-full ${filterType === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setFilterType('username')} 
                  className={`px-3 py-1 text-sm rounded-full ${filterType === 'username' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Usuario
                </button>
                <button 
                  onClick={() => setFilterType('name')} 
                  className={`px-3 py-1 text-sm rounded-full ${filterType === 'name' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Nombre
                </button>
                <button 
                  onClick={() => setFilterType('email')} 
                  className={`px-3 py-1 text-sm rounded-full ${filterType === 'email' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Email
                </button>
                <button 
                  onClick={() => setFilterType('role')} 
                  className={`px-3 py-1 text-sm rounded-full ${filterType === 'role' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Rol
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          {searchTerm ? (
            <p className="text-gray-600">
              No se encontraron usuarios que coincidan con tu búsqueda 
              {filterType !== 'all' && ` en el campo "${
                filterType === 'username' ? 'usuario' : 
                filterType === 'name' ? 'nombre' : 
                filterType === 'email' ? 'email' : 'rol'
              }"`}.
            </p>
          ) : (
            <div className="bg-green-100 text-green-800 p-4 rounded-md my-5 text-center">
              No hay usuarios disponibles. ¡Añade tu primer usuario!
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="relative">
              {confirmDelete === user.id && (
                <div className="absolute inset-0 bg-red-100 bg-opacity-90 rounded-lg flex items-center justify-center z-10 p-4">
                  <div className="text-center">
                    <FaExclamationTriangle className="text-red-600 text-3xl mx-auto mb-2" />
                    <p className="text-red-800 font-medium mb-3">¿Estás seguro de que quieres eliminar este usuario?</p>
                    <div className="flex justify-center space-x-3">
                      <button 
                        onClick={() => setConfirmDelete(null)} 
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)} 
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <UserCard 
                user={user} 
                onEdit={handleEditUser} 
                onDelete={handleDeleteUser} 
              />
            </div>
          ))}
        </div>
      )}
      
      <UserModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCurrentUser(null);
        }}
        onSave={handleSaveUser}
        existingUsers={users.filter(u => !currentUser || u.id !== currentUser.id)}
        initialData={currentUser}
      />
    </div>
  );
};

export default Users;