  import React, { useEffect, useState } from 'react';
  import { useParams, Link } from 'react-router-dom';
  import { clientService, repoService, projectFileService } from '../../services/api';
  import { FaArrowLeft, FaUserFriends, FaUserTie, FaDownload, FaEdit, FaSave, FaTimes, FaFileUpload, FaFolderOpen, FaPlus, FaFileArchive, FaCalendarAlt, FaUser, FaRegFileAlt } from 'react-icons/fa';
  import { toast } from 'react-toastify';
  import ClientModal from '../../components/ClientModal';
  import ColaboradoresModal from '../../components/ColaboradoresModal';
  import LoadingSpinner from '../../components/LoadingSpinner'; 

  const ProjectDetails = ({ projectId }) => {
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
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [showFileInput, setShowFileInput] = useState(false);
    const [renamingFileId, setRenamingFileId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const [editClient, setEditClient] = useState(null);

    useEffect(() => {
      const fetchRepo = async () => {
        try {
          setLoading(true);
          const data = await repoService.getRepoById(id);
          setRepo(data);
          setEditData(data);
          setError(null);
        } catch (err) {
          setError('No se pudo cargar el repositorio.', err);
        } finally {
          setLoading(false);
        }
      };
      fetchRepo();
      clientService.getAllClients().then(setClients);
    }, [id, refreshColabs]); 

    // Cargar archivos al montar o cuando cambia el proyecto
    useEffect(() => {
      const fetchFiles = async () => {
        try {
          const data = await projectFileService.listFiles(id);
          setFiles(data);
        } catch (err) {
          console.error('Error al cargar los archivos:', err);
          toast.error('Error al cargar los archivos del proyecto.');
        }
      };
      fetchFiles();
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
          // client: editData.client?.id || '', // <-- Elimina esto del payload al editar
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

    // Cambia el uso de ClientModal para que pase correctamente isOpen y clientToEdit
    // Cambia handleSaveClient para cerrar el modal y limpiar editClient
    const handleSaveClient = async (clientData) => {
      try {
        await repoService.updateRepo(repo.id, { client: clientData.id });
        toast.success('Cliente asignado correctamente');
        setShowClientModal(false);
        setEditClient(null);
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

    // Subir archivo
    const handleUpload = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      try {
        await projectFileService.uploadFile(id, file);
        const data = await projectFileService.listFiles(id);
        setFiles(data);
      } catch (err) {
        // Manejo de error
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    };

    // Descargar archivo
    const handleDownload = (fileId) => {
      window.open(projectFileService.downloadFile(id, fileId), '_blank');
    };

    // Eliminar archivo
    const handleDelete = async (fileId) => {
      await projectFileService.deleteFile(id, fileId);
      setFiles(files.filter(f => f.id !== fileId));
    };

    // Renombrar archivo (mantén la función, pero ahora la usaremos con el input)
    const handleRename = async (fileId, newName) => {
      await projectFileService.renameFile(id, fileId, newName);
      const data = await projectFileService.listFiles(id);
      setFiles(data);
      setRenamingFileId(null);
      setRenameValue('');
    };

    // Añade este método al projectFileService en tu api.js si no lo tienes:
    const handleDownloadAll = () => {
      const url = `${import.meta.env.VITE_URL_API}/api/projects/${id}/files/download-zip`;
      window.open(url, '_blank');
    };

    const handleCloseColabModal = () => {
      setShowColabModal(false);
      setRefreshColabs(prev => !prev); // Fuerza recarga de colaboradores al cerrar el modal
    };

    if (loading) return <LoadingSpinner section="projects" text="Cargando proyecto..." />;
    if (error) return <div className="p-8 text-red-600">{error}</div>;
    if (!repo) return null;

    return (
      <div className="min-h-screen flex-1">
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
                  {/* Eliminado: sección de archivo y cliente al editar */}
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
                    {/* Badge de estado en la esquina superior derecha */}
                    <div className="absolute top-0 right-0 mt-4 mr-6 z-10">
                      {repo.fechaFin ? (
                        new Date(repo.fechaFin) < new Date() ? (
                          <span className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-bold shadow-lg tracking-wide uppercase">
                            Finalizado
                          </span>
                        ) : (
                          <span className="inline-block px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold shadow-lg tracking-wide uppercase">
                            En curso
                          </span>
                        )
                      ) : (
                        <span className="inline-block px-4 py-1.5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold shadow-lg tracking-wide uppercase">
                          Sin fecha fin
                        </span>
                      )}
                    </div>
                    {/* Icono y nombre */}
                    <div className="flex items-center gap-6 mb-4">
                      <div className="bg-gradient-to-br from-purple-500 to-purple-300 rounded-full w-14 h-14 flex items-center justify-center shadow-xl border-4 border-white">
                        <FaRegFileAlt className="text-white text-2xl" />
                      </div>
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-purple-800 tracking-tight mb-1 drop-shadow">
                          {repo.projectname}
                        </h1>
                        <div className="flex items-center gap-2 text-base text-gray-500 mt-1">
                          <FaUser className="text-purple-400" />
                          <span className="font-semibold text-gray-700">{repo.owner?.username}</span>
                        </div>
                      </div>
                    </div>
                    {/* Descripción */}
                    <div className="mb-8">
                      <div className="border-2 border-purple-200 rounded-xl p-5 bg-white/80 shadow-inner">
                        <p className="text-lg text-gray-700 leading-relaxed">
                          {repo.description
                            ? <span className="">{repo.description}</span>
                            : <span className="italic text-gray-400">Sin descripción</span>
                          }
                        </p>
                      </div>
                    </div>
                    {/* Fechas en columna mejoradas */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-10 ml-2">
                      <div className="flex-1 flex flex-col items-center bg-purple-50 rounded-lg px-4 py-2 shadow border-2 border-purple-100 min-w-[120px] max-w-[180px]">
                        <div className="flex items-center gap-2 mb-1">
                          <FaCalendarAlt className="text-purple-400" />
                          <span className="font-semibold text-purple-700 text-sm">Inicio</span>
                        </div>
                        <span className="font-mono text-sm text-gray-700">{repo.fechaInicio}</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center bg-yellow-50 rounded-lg px-4 py-2 shadow border-2 border-yellow-100 min-w-[120px] max-w-[180px]">
                        <div className="flex items-center gap-2 mb-1">
                          <FaCalendarAlt className="text-yellow-400" />
                          <span className="font-semibold text-yellow-700 text-sm">Fin</span>
                        </div>
                        <span className="font-mono text-sm text-gray-700">{repo.fechaFin || 'No especificada'}</span>
                      </div>
                    </div>
                    {/* Botón editar */}
                    <div className="flex justify-end mt-2">
                      <button
                        className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-7 py-2.5 rounded-xl text-lg flex items-center gap-2 shadow-lg font-bold transition-all duration-150"
                        onClick={handleEdit}
                      >
                        <FaEdit /> Editar
                      </button>
                    </div>
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
                    onClick={() => {
                      // Para depuración, muestra un log
                      console.log('Botón asignar/cambiar cliente pulsado');
                      setEditClient(null); // Asegura modo "nuevo cliente"
                      setShowClientModal(true); // Abre el modal
                    }}
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
          <section className="bg-white rounded-xl border-2 border-purple-200 p-8 mt-8 min-h-[200px] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-purple-700 flex items-center gap-2 tracking-tight">
                <FaFolderOpen /> Ficheros
              </h2>
              <div className="flex gap-2">
                <label
                  className="flex items-center bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg font-semibold transition cursor-pointer shadow"
                  style={{ marginBottom: 0 }}
                >
                  <FaPlus className="mr-2" /> Añadir fichero
                  <input
                    type="file"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={handleDownloadAll}
                  className="flex items-center bg-blue-100 hover:bg-blue-200 text-blue-700 px-5 py-2 rounded-lg font-semibold transition shadow disabled:opacity-60"
                  title="Descargar todos los ficheros en ZIP"
                  disabled={files.length === 0}
                >
                  <FaFileArchive className="mr-2" /> Descargar ZIP
                </button>
              </div>
            </div>
            {files.length === 0 ? (
              <div className="text-gray-400 text-center py-10 font-medium">
                Aquí aparecerán los ficheros del proyecto.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-y-2">
                  <thead>
                    <tr>
                      <th className="text-sm font-bold text-purple-700 px-2 text-left uppercase tracking-wide">Nombre</th>
                      <th className="text-sm font-bold text-purple-700 px-2 text-right uppercase tracking-wide">Subido por</th>
                      <th className="text-sm font-bold text-purple-700 px-2 text-right uppercase tracking-wide">Fecha</th>
                      <th className="text-sm font-bold text-purple-700 px-2 text-right uppercase tracking-wide">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map(file => (
                      <tr key={file.id} className="bg-purple-50 hover:bg-purple-100 rounded-lg transition">
                        <td className="px-2 py-2 max-w-xs truncate font-semibold text-left align-middle text-purple-900">
                          {renamingFileId === file.id ? (
                            <form
                              onSubmit={async (e) => {
                                e.preventDefault();
                                if (renameValue && renameValue !== file.originalName) {
                                  await handleRename(file.id, renameValue);
                                } else {
                                  setRenamingFileId(null);
                                }
                              }}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="text"
                                value={renameValue}
                                onChange={e => setRenameValue(e.target.value)}
                                className="border border-purple-300 rounded px-2 py-1 text-sm"
                                autoFocus
                                onBlur={() => setRenamingFileId(null)}
                                style={{ maxWidth: 180 }}
                              />
                              <button
                                type="submit"
                                className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-semibold"
                              >
                                Guardar
                              </button>
                            </form>
                          ) : (
                            file.originalName
                          )}
                        </td>
                        <td className="px-2 py-2 text-sm text-right align-middle text-purple-700 font-medium">{file.user?.username || '-'}</td>
                        <td className="px-2 py-2 text-sm text-right align-middle text-purple-700 font-medium">{file.fechaSubida || '-'}</td>
                        <td className="px-2 py-2 align-middle">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleDownload(file.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition text-xs font-semibold shadow"
                            >
                              Descargar
                            </button>
                            <button
                              onClick={() => handleDelete(file.id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition text-xs font-semibold shadow"
                            >
                              Eliminar
                            </button>
                            {renamingFileId === file.id ? null : (
                              <button
                                onClick={() => {
                                  setRenamingFileId(file.id);
                                  setRenameValue(file.originalName);
                                }}
                                className="bg-purple-200 hover:bg-purple-300 text-purple-800 px-3 py-1 rounded transition text-xs font-semibold shadow"
                              >
                                Renombrar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
        {/* Modal de cliente */}
        <ClientModal
          open={showClientModal}
          onClose={() => setShowClientModal(false)}
          onAssign={async (client) => {
            try {
              await repoService.updateRepo(repo.id, { client: client.id });
              toast.success('Cliente asignado correctamente');
              setShowClientModal(false);
              // Refresca datos del proyecto
              const data = await repoService.getRepoById(id);
              setRepo(data);
              setEditData(data);
            } catch (err) {
              toast.error('Error al asignar cliente');
            }
          }}
          assignedClientId={repo.client?.id}
        />
        {/* Modal de colaboradores */}
        <ColaboradoresModal
          open={showColabModal}
          onClose={handleCloseColabModal}
          repoId={repo.id}
          ownerId={repo.owner?.id}
          onAddColaborador={handleAddColaborador}
        />
      </div>
    );
  };

  export default ProjectDetails;