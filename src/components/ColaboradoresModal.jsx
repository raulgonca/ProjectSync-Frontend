import React, { useEffect, useState } from 'react';
import { userService, projectService } from '../services/api';

const ColaboradoresModal = ({ open, onClose, repoId, ownerId, onAddColaborador }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accion, setAccion] = useState(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      userService.getAllUsers(),
      projectService.getProjectCollaborators(repoId)
    ]).then(([users, colabs]) => {
      setAllUsers(Array.isArray(users) ? users : []);
      setColaboradores(Array.isArray(colabs) ? colabs : []);
      setLoading(false);
    });
  }, [open, repoId, accion]);

  // Filtra usuarios disponibles (no owner ni colaboradores)
  const disponibles = allUsers.filter(
    u => !colaboradores.some(c => c.id === u.id) && u.id !== ownerId
  );

  const handleAdd = async (userId) => {
    setAccion('add');
    await projectService.addCollaborator(repoId, userId);
    onAddColaborador(userId); // Llama a la función pasada por props
    setAccion(null);
  };

  const handleRemove = async (userId) => {
    setAccion('remove');
    await projectService.removeCollaborator(repoId, userId);
    setAccion(null);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/10 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-lg p-6 w-full max-w-3xl relative pt-10">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-purple-700 text-2xl font-bold"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-2xl font-bold mb-6 text-purple-700 text-center">Gestionar Colaboradores</h3>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 border-r border-purple-100 pr-6">
            <h4 className="font-semibold mb-3 text-purple-600 text-lg">Usuarios disponibles</h4>
            {loading ? (
              <div className="text-gray-500 text-center py-10">Cargando...</div>
            ) : disponibles.length === 0 ? (
              <div className="text-gray-400 text-center py-10">No hay usuarios disponibles</div>
            ) : (
              <ul className="space-y-3">
                {disponibles.map(user => (
                  <li key={user.id} className="flex justify-between items-center bg-purple-50 rounded-lg px-4 py-2 shadow-sm">
                    <span className="font-medium text-gray-700">{user.username}</span>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                      onClick={() => handleAdd(user.id)}
                    >
                      Añadir
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex-1 pl-6">
            <h4 className="font-semibold mb-3 text-purple-600 text-lg">Colaboradores actuales</h4>
            {loading ? (
              <div className="text-gray-500 text-center py-10">Cargando...</div>
            ) : colaboradores.length === 0 ? (
              <div className="text-gray-400 text-center py-10">No hay colaboradores</div>
            ) : (
              <ul className="space-y-3">
                {colaboradores.map(user => (
                  <li key={user.id} className="flex justify-between items-center bg-purple-100 rounded-lg px-4 py-2 shadow-sm">
                    <span className="font-medium text-gray-700">{user.username}</span>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow"
                      onClick={() => handleRemove(user.id)}
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColaboradoresModal;
