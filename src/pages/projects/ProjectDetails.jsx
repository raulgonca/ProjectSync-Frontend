import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clientService, repoService } from '../../services/api';
import { FaArrowLeft, FaUserFriends, FaUserTie, FaDownload, FaEdit, FaSave, FaTimes, FaFileUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ClientModal from '../../components/ClientModal';
import ColaboradoresModal from '../../components/ColaboradoresModal';

const ProjectDetails = () => {
  const { id } = useParams();
  const [repo, setRepo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modales
  const [showClientModal, setShowClientModal] = useState(false);
  const [showColabModal, setShowColabModal] = useState(false);

  // Edición
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [fileInput, setFileInput] = useState(null);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        setLoading(true);
        const data = await repoService.getRepoById(id);
        setRepo(data);
        setEditData(data);
        setError(null);
      } catch (err) {
        setError('No se pudo cargar el repositorio.');
      } finally {
        setLoading(false);
      }
    };
    fetchRepo();
    clientService.getAllClients().then(setClients);
  }, [id]);

  const handleEdit = () => {
    setEditData(repo);
    setEditMode(true);
    setFileInput(null);
  };

  const handleCancel = () => {
    setEditData(repo);
    setEditMode(false);
    setFileInput(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFileInput(e.target.files[0]);
  };

  const handleSave = async () => {
    try {
      let payload = {
        projectname: editData.projectname,
        description: editData.description,
        fechaInicio: editData.fechaInicio,
        fechaFin: editData.fechaFin,
        client: editData.client?.id || '',
      };
      if (fileInput) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
        formData.append('file', fileInput);
        await repoService.updateRepo(id, formData);
      } else {
        await repoService.updateRepo(id, payload);
      }
      toast.success('Proyecto actualizado');
      setEditMode(false);
      const data = await repoService.getRepoById(id);
      setRepo(data);
      setEditData(data);
    } catch (err) {
      toast.error('Error al guardar');
    }
  };

  // Asignar cliente
  const handleAssignClient = async (client) => {
    try {
      await repoService.updateRepo(repo.id, { client: client.id });
      toast.success('Cliente asignado correctamente');
      setShowClientModal(false);
      const data = await repoService.getRepoById(id);
      setRepo(data);
      setEditData(data);
    } catch (err) {
      toast.error('Error al asignar cliente');
    }
  };

  if (loading) return <div className="p-8">Cargando...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!repo) return null;

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="w-full max-w-5xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-2xl p-8">
        <Link to="/main/projects" className="flex items-center text-purple-600 mb-8 hover:underline">
          <FaArrowLeft className="mr-2" /> Volver a proyectos
        </Link>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Columna izquierda: Datos del proyecto */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col justify-center">
            {editMode ? (
              <>
                <input
                  type="text"
                  name="projectname"
                  value={editData.projectname}
                  onChange={handleChange}
                  className="text-3xl font-bold mb-4 text-purple-700 text-center border-b border-purple-200"
                />
                <textarea
                  name="description"
                  value={editData.description || ''}
                  onChange={handleChange}
                  className="mb-4 text-gray-700 text-center border rounded p-2"
                  placeholder="Descripción"
                />
                <div className="mb-3 flex justify-between">
                  <strong>Fecha inicio:</strong>
                  <input
                    type="date"
                    name="fechaInicio"
                    value={editData.fechaInicio}
                    onChange={handleChange}
                    className="border rounded px-2"
                  />
                </div>
                <div className="mb-3 flex justify-between">
                  <strong>Fecha fin:</strong>
                  <input
                    type="date"
                    name="fechaFin"
                    value={editData.fechaFin || ''}
                    onChange={handleChange}
                    className="border rounded px-2"
                  />
                </div>
                <div className="mb-3 flex justify-between items-center">
                  <strong>Archivo:</strong>
                  <div className="flex items-center gap-2">
                    {repo.fileName && (
                      <a
                        href={`${import.meta.env.VITE_URL_API}/api/repo/${repo.id}/download`}
                        className="inline-flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Descargar archivo"
                      >
                        <FaDownload className="text-lg" />
                      </a>
                    )}
                    <label className="flex items-center gap-2 cursor-pointer bg-purple-100 px-2 py-1 rounded hover:bg-purple-200">
                      <FaFileUpload />
                      <span className="text-sm">Subir/Reemplazar</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    {fileInput && <span className="text-xs text-gray-700">{fileInput.name}</span>}
                  </div>
                </div>
                <div className="mb-3 flex justify-between">
                  <strong>Cliente:</strong>
                  <select
                    name="client"
                    value={editData.client?.id || ''}
                    onChange={e => {
                      const clientId = e.target.value;
                      const clientObj = clients.find(c => c.id === parseInt(clientId));
                      setEditData(prev => ({ ...prev, client: clientObj || null }));
                    }}
                    className="border rounded px-2"
                  >
                    <option value="">Sin cliente</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3 flex justify-between">
                  <strong>Propietario:</strong>
                  <span>{repo.owner?.username}</span>
                </div>
                <div className="flex gap-4 mt-4">
                  <button
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                    onClick={handleSave}
                  >
                    <FaSave /> Guardar
                  </button>
                  <button
                    className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                    onClick={handleCancel}
                  >
                    <FaTimes /> Cancelar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold mb-4 text-purple-700 text-center">{repo.projectname}</h1>
                <p className="mb-4 text-gray-700 text-center">{repo.description}</p>
                <div className="mb-3 flex justify-between">
                  <strong>Fecha inicio:</strong>
                  <span>{repo.fechaInicio}</span>
                </div>
                <div className="mb-3 flex justify-between">
                  <strong>Fecha fin:</strong>
                  <span>{repo.fechaFin || 'No especificada'}</span>
                </div>
                <div className="mb-3 flex justify-between items-center">
                  <strong>Archivo:</strong>
                  {repo.fileName ? (
                    <span className="flex items-center gap-2">
                      <span className="text-gray-700">{repo.fileName}</span>
                      <a
                        href={`${import.meta.env.VITE_URL_API}/api/repo/${repo.id}/download`}
                        className="inline-flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Descargar archivo"
                      >
                        <FaDownload className="text-lg" />
                      </a>
                    </span>
                  ) : (
                    <span className="text-gray-500">Sin archivo</span>
                  )}
                </div>
                {repo.client && (
                  <div className="mb-3 flex justify-between">
                    <strong>Cliente:</strong>
                    <span>{repo.client.name}</span>
                  </div>
                )}
                <div className="mb-3 flex justify-between">
                  <strong>Propietario:</strong>
                  <span>{repo.owner?.username}</span>
                </div>
                <button
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded flex items-center gap-2 mx-auto"
                  onClick={handleEdit}
                >
                  <FaEdit /> Editar
                </button>
              </>
            )}
          </div>
          {/* Columna derecha: Colaboradores y acciones */}
          <div className="bg-white rounded-xl shadow p-6 flex flex-col">
            <h2 className="text-2xl font-semibold mb-4 text-purple-700">Colaboradores</h2>
            <div className="flex-1 overflow-auto">
              {/* Lista de colaboradores */}
              <ul className="space-y-3">
                {repo.colaboradores?.map(colaborador => (
                  <li key={colaborador.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={colaborador.avatar || '/default-avatar.png'}
                        alt={colaborador.username}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <span className="block text-sm font-medium text-gray-800">{colaborador.username}</span>
                        <span className="block text-xs text-gray-500">{colaborador.email}</span>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => setShowColabModal(true)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm flex items-center gap-1"
                      >
                        <FaUserFriends className="text-xs" /> Ver perfil
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowColabModal(true)}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2"
              >
                <FaUserFriends /> Agregar colaborador
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Modal de cliente */}
      <ClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onAssign={handleAssignClient}
        currentClient={repo.client}
      />
      {/* Modal de colaboradores */}
      <ColaboradoresModal
        isOpen={showColabModal}
        onClose={() => setShowColabModal(false)}
        repoId={repo.id}
      />
    </div>
  );
};

export default ProjectDetails;