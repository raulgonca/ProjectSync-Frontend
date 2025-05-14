import React, { useState, useEffect } from 'react';
import { clientService } from '../../services/api';
import ClientCard from '../../components/ClientCard/ClientCard';
import ClientModal from '../../components/ClientModal/ClientModal';
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const data = await clientService.getAllClients();
        setClients(data);
        setError(null);
      } catch (err) {
        console.error('Error al cargar los clientes:', err);
        setError('No se pudieron cargar los clientes. Por favor, inténtalo de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Filtrar clientes según el término de búsqueda y el tipo de filtro
  const filteredClients = clients.filter(client => {
    if (!searchTerm.trim()) return true;
    
    const term = searchTerm.toLowerCase();
    
    switch (filterType) {
      case 'name':
        return client.name.toLowerCase().includes(term);
      case 'cif':
        return client.cif.toLowerCase().includes(term);
      case 'email':
        return client.email && client.email.toLowerCase().includes(term);
      case 'all':
      default:
        return (
          client.name.toLowerCase().includes(term) ||
          client.cif.toLowerCase().includes(term) ||
          (client.email && client.email.toLowerCase().includes(term))
        );
    }
  });

  const handleSaveClient = async (clientData) => {
    try {
      console.log('Datos a enviar:', clientData);
      const newClient = await clientService.createClient(clientData);
      console.log('Respuesta del servidor:', newClient);
      
      // Recargar la lista completa de clientes para asegurar datos actualizados
      const updatedClients = await clientService.getAllClients();
      setClients(updatedClients);
      
      return newClient;
    } catch (error) {
      console.error('Error al crear el cliente:', error);
      throw error;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-lg text-gray-600">Cargando clientes...</div>;
  }

  if (error) {
    return <div className="bg-red-100 text-red-800 p-4 rounded-md my-5">{error}</div>;
  }

  return (
    <div className="p-5">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4 md:mb-0">Clientes</h1>
        
        <div className="flex flex-col w-full md:w-auto space-y-2 md:space-y-0 md:space-x-2">
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg flex items-center transition-colors"
              title="Mostrar filtros"
            >
              <FaFilter className={`${showFilters ? 'text-blue-600' : 'text-gray-600'}`} />
            </button>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <FaPlus className="mr-2" />
              Nuevo Cliente
            </button>
          </div>
          
          {showFilters && (
            <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 mt-2 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 mr-2 self-center">Filtrar por:</span>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setFilterType('all')} 
                  className={`px-3 py-1 text-sm rounded-full ${filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setFilterType('name')} 
                  className={`px-3 py-1 text-sm rounded-full ${filterType === 'name' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Nombre
                </button>
                <button 
                  onClick={() => setFilterType('cif')} 
                  className={`px-3 py-1 text-sm rounded-full ${filterType === 'cif' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  CIF
                </button>
                <button 
                  onClick={() => setFilterType('email')} 
                  className={`px-3 py-1 text-sm rounded-full ${filterType === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {filteredClients.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          {searchTerm ? (
            <p className="text-gray-600">
              No se encontraron clientes que coincidan con tu búsqueda 
              {filterType !== 'all' && ` en el campo "${
                filterType === 'name' ? 'nombre' : 
                filterType === 'cif' ? 'CIF' : 'email'
              }"`}.
            </p>
          ) : (
            <div className="bg-green-100 text-green-800 p-4 rounded-md my-5 text-center">
              No hay clientes disponibles. ¡Añade tu primer cliente!
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
      
      <ClientModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveClient}
        existingClients={clients}
      />
    </div>
  );
};

export default Clients;