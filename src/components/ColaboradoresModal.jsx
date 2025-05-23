import React, { useEffect, useState } from 'react';
import { userService, projectService } from '../services/api';

const ColaboradoresModal = ({ open, onClose, repoId, ownerId }) => {
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
    await projectService.addCollaborator(repoId, userId); // usa projectService
    setAccion(null);
  };

  const handleRemove = async (userId) => {
    setAccion('remove');
    await projectService.removeCollaborator(repoId, userId); // usa projectService
    setAccion(null);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/10 backdrop-blur-sm">
      <div className="bg-white rounded shadow-lg p-6 w-full max-w-3xl relative">
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-xl font-bold mb-4">Gestionar Colaboradores</h3>
        <div className="flex gap-8">
          <div className="flex-1 border-r pr-4">
            <h4 className="font-semibold mb-2">Usuarios disponibles</h4>
            {loading ? (
              <div className="text-gray-500 text-center py-10">Cargando...</div>
            ) : disponibles.length === 0 ? (
              <div className="text-gray-400 text-center py-10">No hay usuarios disponibles</div>
            ) : (
              <ul className="space-y-2">
                {disponibles.map(user => (
                  <li key={user.id} className="flex justify-between items-center border-b pb-1">
                    <span>{user.username}</span>
                    <button
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                      onClick={() => handleAdd(user.id)}
                    >
                      Añadir
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex-1 pl-4">
            <h4 className="font-semibold mb-2">Colaboradores actuales</h4>
            {loading ? (
              <div className="text-gray-500 text-center py-10">Cargando...</div>
            ) : colaboradores.length === 0 ? (
              <div className="text-gray-400 text-center py-10">No hay colaboradores</div>
            ) : (
              <ul className="space-y-2">
                {colaboradores.map(user => (
                  <li key={user.id} className="flex justify-between items-center border-b pb-1">
                    <span>{user.username}</span>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
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
