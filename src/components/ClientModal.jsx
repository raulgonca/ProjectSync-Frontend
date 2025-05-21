import { useEffect, useState } from 'react';
import { clientService } from '../services/api';

const PAGE_SIZE = 10;

const ClientModal = ({ open, onClose, onAssign = () => {}, assignedClientId }) => {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (open) {
      clientService.getAllClients().then(setClients);
      setCurrentPage(1);
    }
  }, [open]);

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(search.toLowerCase())
  );

  // Paginación
  const totalPages = Math.ceil(filteredClients.length / PAGE_SIZE);
  const paginatedClients = filteredClients.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/10 backdrop-blur-sm">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-5xl relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ×
        </button>
        <div className="flex items-center mb-4 gap-2">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="flex-1 px-3 py-2 border rounded focus:ring-2 focus:ring-purple-400"
          />
          <button
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            onClick={() => setSearch(search)}
          >
            Buscar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-purple-100 text-purple-800">
                <th className="py-2 px-3 text-left">Nombre</th>
                <th className="py-2 px-3 text-left">CIF</th>
                <th className="py-2 px-3 text-left">Teléfono</th>
                <th className="py-2 px-3 text-left">Email</th>
                <th className="py-2 px-3 text-left">Web</th>
                <th className="py-2 px-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No hay clientes disponibles.
                  </td>
                </tr>
              ) : (
                paginatedClients.map(client => (
                  <tr key={client.id}>
                    <td className="py-2 px-3">{client.name}</td>
                    <td className="py-2 px-3">{client.cif || '-'}</td>
                    <td className="py-2 px-3">{client.phone || '-'}</td>
                    <td className="py-2 px-3">{client.email || '-'}</td>
                    <td className="py-2 px-3">
                      {client.web ? (
                        <a
                          href={client.web}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {client.web}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2 px-3">
                      {assignedClientId === client.id ? (
                        <span className="text-green-600 font-semibold">Asignado</span>
                      ) : (
                        <button
                          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded"
                          onClick={() => onAssign(client)}
                        >
                          Añadir
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-4 gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
            >
              Anterior
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`px-3 py-1 rounded ${currentPage === idx + 1
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-purple-400'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded bg-gray-100 text-gray-600 hover:bg-purple-400 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientModal;
