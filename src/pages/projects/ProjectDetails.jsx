import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clientService, repoService } from '../../services/api';
import { FaArrowLeft, FaUserFriends, FaUserTie, FaDownload } from 'react-icons/fa';
import { toast } from 'react-toastify';
// Importa los componentes modales
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

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);
  const [fileInput, setFileInput] = useState(null);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchRepo = async () => {
      try {
        setLoading(true);
        const data = await repoService.getRepoById(id);
        console.log('Respuesta del backend (repo):', data); // <-- Añadido para depuración
        setRepo(data);
        setEditData(data); // Para edición
        setError(null);
      } catch (err) {
        setError('No se pudo cargar el repositorio.', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRepo();
    // Cargar clientes solo si el modal se va a usar
    clientService.getAllClients().then(setClients);
  }, [id]);

  const handleEdit = () => {
    setEditData(repo);
    setEditMode(true);
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
        fileName: editData.fileName,
      };
      // Si hay fichero nuevo, usa FormData
      if (fileInput) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => formData.append(key, value));
        formData.append('file', fileInput);
        await repoService.updateRepoWithFile(id, formData);
      } else {
        await repoService.updateRepo(id, payload);
      }
      toast.success('Proyecto actualizado');
      setEditMode(false);
      // Recargar datos
      const data = await repoService.getRepoById(id);
      setRepo(data);
      setEditData(data);
    } catch (err) {
      toast.error('Error al guardar');
    }
  };

  // Función para asignar cliente al repo
  const handleAssignClient = async (client) => {
    try {
      await repoService.updateRepo(repo.id, { client: client.id });
      toast.success('Cliente asignado correctamente');
      setShowClientModal(false);
      // Refrescar datos del repo
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
                    className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition"
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
          </div>

          {/* Columna derecha: Cliente y Colaboradores */}
          <div className="flex flex-col gap-8 justify-center">
            {/* Sección Cliente */}
            <div className="bg-gray-50 rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold flex items-center">
                  <FaUserTie className="mr-2" /> Cliente asignado
                </h2>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  onClick={() => setShowClientModal(true)}
                >
                  Gestionar Cliente
                </button>
              </div>
              {repo.client ? (
                <div>
                  <span className="font-medium">{repo.client.name}</span>
                </div>
              ) : (
                <span className="text-gray-500">Sin cliente asignado</span>
              )}
            </div>

            {/* Sección Colaboradores */}
            <div className="bg-gray-50 rounded-xl shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold flex items-center">
                  <FaUserFriends className="mr-2" /> Colaboradores
                </h2>
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
                  onClick={() => setShowColabModal(true)}
                >
                  Gestionar Colaboradores
                </button>
              </div>
              <ul className="list-disc ml-6">
                {repo.colaboradores && repo.colaboradores.length > 0 ? (
                  repo.colaboradores.map(colab => (
                    <li key={colab.id}>{colab.username}</li>
                  ))
                ) : (
                  <li className="text-gray-500">No hay colaboradores</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Modales componentizados */}
        <ClientModal
          open={showClientModal}
          onClose={() => setShowClientModal(false)}
          onAssign={handleAssignClient}
          assignedClientId={repo.client?.id}
          clients={clients}
        />
        <ColaboradoresModal
          open={showColabModal}
          onClose={() => setShowColabModal(false)}
          repoId={repo.id} // <-- asegúrate de pasar el id correcto
          ownerId={repo.owner?.id}
        />
      </div>
    </div>
  );
};

export default ProjectDetails;
