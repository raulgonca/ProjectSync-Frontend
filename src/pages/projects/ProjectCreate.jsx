import React, { useState } from 'react';
import { repoService, clientService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaFileUpload } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ProjectCreate = () => {
  const [form, setForm] = useState({
    projectname: '',
    description: '',
    fechaInicio: '',
    fechaFin: '',
    client: '',
  });
  const [clients, setClients] = useState([]);
  const [file, setFile] = useState(null);
  const [fileNamePreview, setFileNamePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Cargar clientes para el select
  React.useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await clientService.getClients();
        setClients(data);
      } catch {
        setClients([]);
      }
    };
    fetchClients();
  }, []);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileNamePreview(selectedFile ? selectedFile.name : '');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('projectname', form.projectname);
      formData.append('description', form.description);
      formData.append('fechaInicio', form.fechaInicio);
      formData.append('fechaFin', form.fechaFin);
      formData.append('client', form.client);
      // Añadir el owner desde el usuario logueado
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        formData.append('owner', user.id);
      }
      if (file) {
        formData.append('file', file);
      }
      await repoService.createRepo(formData);
      toast.success('Repositorio creado con éxito');
      navigate('/main/projects');
    } catch (err) {
      toast.error('Error al crear el repositorio' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-8">
      <div className="w-full max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/main/projects')}
          className="flex items-center text-purple-600 mb-6 hover:underline"
        >
          <FaArrowLeft className="mr-2" /> Volver a proyectos
        </button>
        <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-purple-700 text-center">Crear nuevo proyecto</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 font-semibold text-gray-700">
                Nombre del proyecto <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="projectname"
                value={form.projectname}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
                placeholder="Introduce el nombre del proyecto"
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Descripción</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
                placeholder="Describe brevemente el proyecto"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block mb-1 font-semibold text-gray-700">
                  Fecha de inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={form.fechaInicio}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
                />
              </div>
              <div className="flex-1">
                <label className="block mb-1 font-semibold text-gray-700">Fecha de fin</label>
                <input
                  type="date"
                  name="fechaFin"
                  value={form.fechaFin}
                  onChange={handleChange}
                  className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Cliente</label>
              <select
                name="client"
                value={form.client}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition"
              >
                <option value="">Sin cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold text-gray-700">Archivo del proyecto</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => document.getElementById('fileInput').click()}
                  className="flex items-center bg-purple-50 px-4 py-2 rounded-lg border border-purple-200 hover:bg-purple-100 text-purple-700 font-medium transition"
                >
                  <FaFileUpload className="mr-2" />
                  Subir archivo
                </button>
                <input
                  id="fileInput"
                  type="file"
                  name="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept="*"
                />
                {fileNamePreview && (
                  <span className="text-sm text-gray-700 truncate max-w-xs">{fileNamePreview}</span>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center font-semibold text-lg transition"
            >
              <FaSave className="mr-2" />
              {loading ? 'Guardando...' : 'Crear proyecto'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreate;
