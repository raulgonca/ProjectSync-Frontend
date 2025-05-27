import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clientService, repoService } from '../../services/api';
import { FaArrowLeft, FaUserFriends, FaUserTie, FaDownload, FaEdit, FaSave, FaTimes, FaFileUpload, FaFolderOpen } from 'react-icons/fa';
import { toast } from 'react-toastify';
import ClientModal from '../../components/ClientModal';
import ColaboradoresModal from '../../components/ColaboradoresModal';
import LoadingSpinner from '../../components/LoadingSpinner'; 

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
  // Colaboradores
  const [refreshColabs, setRefreshColabs] = useState(false);

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
  }, [id, refreshColabs]); // Añadido refreshColabs para refrescar tras añadir

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
    // Actualiza editData para mostrar el nombre del archivo seleccionado
    setEditData(prev => ({
      ...prev,
      fileName: e.target.files[0]?.name || prev.fileName
    }));
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

  // Cambia handleAssignClient para usar onSave del modal
  const handleSaveClient = async (clientData) => {
    try {
      await repoService.updateRepo(repo.id, { client: clientData.id });
      toast.success('Cliente asignado correctamente');
      setShowClientModal(false);
      const data = await repoService.getRepoById(id);
      setRepo(data);
      setEditData(data);
    } catch (err) {
      toast.error('Error al asignar cliente');
    }
  };

  // Añadir colaborador (llamado desde el modal)
  const handleAddColaborador = async (userId) => {
    try {
      await repoService.addColaborador(repo.id, userId);
      toast.success('Colaborador añadido');
      setShowColabModal(false);
      setRefreshColabs(prev => !prev); // Refresca la lista
    } catch (err) {
      toast.error('Error al añadir colaborador');
    }
  };

  if (loading) return <LoadingSpinner section="projects" text="Cargando proyecto..." />;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!repo) return null;

  return (
    <div className="min-h-screen flex-1 bg-white">
      {/* No sidebar aquí, lo pone la app */}
      <main className="w-full max-w-7xl mx-auto p-4 md:p-10">
        {/* Botón volver */}
        <div className="mb-6">
          <Link to="/main/projects" className="flex items-center text-purple-600 hover:underline text-lg font-medium">
            <FaArrowLeft className="mr-2" /> Volver a proyectos
          </Link>
        </div>
        {/* Grid superior */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Detalles del proyecto */}
          <section className="bg-white rounded-xl border-2 border-purple-200 p-8 flex flex-col justify-between min-h-[260px]">
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
                    {repo.fileName && !fileInput && (
                      <a
                        href={`${import.meta.env.VITE_URL_API}/api/repo/${repo.id}/download`}
                        className="inline-flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Descargar archivo"
                      >
                        <FaDownload className="text-lg" />
                        <span className="ml-2">{repo.fileName}</span>
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
                    {fileInput && (
                      <span className="text-xs text-gray-700">{fileInput.name}</span>
                    )}
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
                <h1 className="text-3xl font-extrabold mb-4 text-purple-700">{repo.projectname}</h1>
                <p className="mb-6 text-base text-gray-700">{repo.description}</p>
                <div className="mb-3 flex flex-wrap gap-x-8 gap-y-2">
                  <div className="flex items-center gap-2">
                    <strong>Fecha inicio:</strong>
                    <span>{repo.fechaInicio}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <strong>Fecha fin:</strong>
                    <span>{repo.fechaFin || 'No especificada'}</span>
                  </div>
                </div>
                <div className="mb-3 flex items-center gap-2">
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
                <div className="mb-3 flex items-center gap-2">
                  <strong>Propietario:</strong>
                  <span>{repo.owner?.username}</span>
                </div>
                <button
                  className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded text-lg flex items-center gap-2 w-fit"
                  onClick={handleEdit}
                >
                  <FaEdit /> Editar
                </button>
              </>
            )}
          </section>
          {/* Columna derecha: Clientes y Colaboradores */}
          <div className="flex flex-col gap-6">
            {/* Cliente */}
            <section className="bg-white rounded-xl border-2 border-purple-200 p-6 flex flex-col min-h-[80px]">
              <h2 className="text-xl font-bold mb-2 text-purple-700">Cliente</h2>
              <div className="flex-1 flex flex-col items-start justify-center">
                <div className="mb-2">
                  <span className="block text-base font-semibold text-gray-800">
                    {repo.client?.name || <span className="text-gray-400">Sin cliente</span>}
                  </span>
                  {repo.client?.email && (
                    <span className="block text-xs text-gray-500">{repo.client.email}</span>
                  )}
                </div>
                <button
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 font-semibold shadow"
                  onClick={() => setShowClientModal(true)}
                >
                  {repo.client ? 'Cambiar cliente' : 'Asignar cliente'}
                </button>
              </div>
            </section>
            {/* Colaboradores */}
            <section className="bg-white rounded-xl border-2 border-purple-200 p-6 flex flex-col min-h-[160px]">
              <h2 className="text-xl font-bold mb-2 text-purple-700">Colaboradores</h2>
              <div className="flex-1 overflow-auto max-h-40">
                <ul className="space-y-2">
                  {repo.colaboradores?.length === 0 ? (
                    <li className="text-gray-400 text-center py-4">No hay colaboradores en este proyecto.</li>
                  ) : (
                    repo.colaboradores.map(colaborador => (
                      <li
                        key={colaborador.id}
                        className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-100"
                        style={{ minHeight: 40, maxHeight: 40 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 text-lg">
                            <FaUserTie />
                          </div>
                          <div>
                            <span className="block text-sm font-semibold text-gray-800">{colaborador.username}</span>
                            <span className="block text-xs text-gray-500">{colaborador.email}</span>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => setShowColabModal(true)}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2 font-semibold shadow"
                >
                  <FaUserFriends /> Agregar colaborador
                </button>
              </div>
            </section>
          </div>
        </div>
        {/* Sección de ficheros */}
        <section className="bg-white rounded-xl border-2 border-purple-200 p-8 mt-8 min-h-[200px]">
          <h2 className="text-2xl font-bold mb-4 text-purple-700 flex items-center gap-2">
            <FaFolderOpen /> Ficheros
          </h2>
          <div className="text-gray-400 text-center py-10">
            Aquí aparecerán los ficheros del proyecto.
          </div>
        </section>
      </main>
      {/* Modal de cliente */}
      <ClientModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSave={handleSaveClient}
        existingClients={clients}
        clientToEdit={null}
      />
      {/* Modal de colaboradores */}
      <ColaboradoresModal
        open={showColabModal} 
        onClose={() => setShowColabModal(false)}
        repoId={repo.id}
        ownerId={repo.owner?.id}
        onAddColaborador={handleAddColaborador}
      />
    </div>
  );
};

export default ProjectDetails;