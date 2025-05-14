import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '../../services/api';

const ProjectDetails = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [error, setError] = useState(null);

  // Cargar datos del proyecto desde la API
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const data = await projectService.getProjectById(id);
        
        // Adaptar los datos para que coincidan con la estructura esperada
        const formattedProject = {
          id: data.id,
          title: data.projectname || data.title || 'Sin título',
          date: data.fechaInicio || data.date || new Date().toISOString().split('T')[0],
          endDate: data.fechaFin || data.endDate || new Date().toISOString().split('T')[0],
          description: data.description || 'Sin descripción',
          status: data.status || 'pending',
          client: data.client || 'Sin cliente',
          budget: data.budget || 0,
          team: data.team || [],
          tasks: data.tasks || []
        };
        
        setProject(formattedProject);
        setEditedProject(formattedProject);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar los detalles del proyecto:', error);
        setError('No se pudo cargar la información del proyecto. Por favor, inténtalo de nuevo más tarde.');
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [id]);

  // Función para manejar cambios en el formulario de edición
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProject({
      ...editedProject,
      [name]: value
    });
  };

  // Función para guardar los cambios
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Adaptar los datos para que coincidan con la estructura esperada por el backend
      const projectData = {
        projectname: editedProject.title,
        fechaInicio: editedProject.date,
        fechaFin: editedProject.endDate,
        description: editedProject.description,
        status: editedProject.status,
        client: editedProject.client,
        budget: editedProject.budget,
      };
      
      // Llamar al servicio para actualizar el proyecto
      await projectService.updateProject(id, projectData);
      
      // Actualizar el estado local
      setProject(editedProject);
      setIsEditing(false);
      setLoading(false);
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
      setError('No se pudieron guardar los cambios. Por favor, inténtalo de nuevo más tarde.');
      setLoading(false);
    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Función para obtener el color de fondo según el estado
  const getStatusBadgeClasses = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto del estado en español
  const getStatusText = (status) => {
    switch(status) {
      case 'completed':
        return 'Completado';
      case 'in-progress':
        return 'En progreso';
      case 'pending':
        return 'Pendiente';
      default:
        return 'Desconocido';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <div className="text-red-500 mb-4">{error}</div>
        <Link 
          to="/main/projects" 
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Volver a proyectos
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Cabecera con navegación */}
      <div className="mb-6">
        <Link to="/main/projects" className="text-blue-600 hover:text-blue-800 flex items-center">
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Volver a proyectos
        </Link>
      </div>

      {/* Contenido principal */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {isEditing ? (
          /* Formulario de edición */
          <div>
            <h2 className="text-2xl font-bold mb-6">Editar Proyecto</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                  Título del proyecto
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={editedProject.title}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="client">
                  Cliente
                </label>
                <input
                  type="text"
                  id="client"
                  name="client"
                  value={editedProject.client}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={editedProject.date}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="endDate">
                  Fecha de finalización
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={editedProject.endDate}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="status">
                  Estado
                </label>
                <select
                  id="status"
                  name="status"
                  value={editedProject.status}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="pending">Pendiente</option>
                  <option value="in-progress">En progreso</option>
                  <option value="completed">Completado</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="budget">
                  Presupuesto (€)
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={editedProject.budget}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Descripción
              </label>
              <textarea
                id="description"
                name="description"
                value={editedProject.description}
                onChange={handleChange}
                rows="4"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Guardar cambios
              </button>
            </div>
          </div>
        ) : (
          /* Vista de detalles */
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{project.title}</h1>
                <p className="text-gray-600">Cliente: {project.client}</p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                </svg>
                Editar proyecto
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Estado</h3>
                <span className={`px-3 py-1 text-sm rounded-full ${getStatusBadgeClasses(project.status)}`}>
                  {getStatusText(project.status)}
                </span>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Fechas</h3>
                <p className="text-gray-600">Inicio: {formatDate(project.date)}</p>
                <p className="text-gray-600">Fin: {formatDate(project.endDate)}</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Presupuesto</h3>
                <p className="text-gray-600">{project.budget.toLocaleString('es-ES')} €</p>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="font-semibold text-gray-700 mb-2">Descripción</h3>
              <p className="text-gray-600">{project.description}</p>
            </div>
            
            <div className="mb-8">
              <h3 className="font-semibold text-gray-700 mb-4">Equipo</h3>
              {project.team && project.team.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {project.team.map((member, index) => (
                    <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">
                        {member.charAt(0)}
                      </div>
                      <span className="text-sm">{member}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay miembros asignados a este proyecto</p>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-4">Tareas</h3>
              {project.tasks && project.tasks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white">
                    <thead>
                      <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6 text-left">Tarea</th>
                        <th className="py-3 px-6 text-left">Responsable</th>
                        <th className="py-3 px-6 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-600 text-sm">
                      {project.tasks.map((task) => (
                        <tr key={task.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-6 text-left">{task.title}</td>
                          <td className="py-3 px-6 text-left">{task.assignee}</td>
                          <td className="py-3 px-6 text-center">
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClasses(task.status)}`}>
                              {getStatusText(task.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">No hay tareas asignadas a este proyecto</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;