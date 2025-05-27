import React from 'react';
import { Link } from 'react-router-dom';

const ProjectCard = ({ project, className = "" }) => {
  // Formatear la fecha para mostrarla de manera amigable
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Estado: completed, in-progress, pending, etc. (puedes mejorar la lógica si tienes un campo real)
  const getStatusBadgeClasses = (status) => {
    switch(status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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

  // Corrige los campos para que funcionen con tu backend
  const title = project.title || project.projectname || 'Sin título';
  const description = project.description || '';
  const fechaFin = project.fechaFin ? formatDate(project.fechaFin) : '-';
  // Cliente puede ser string o objeto
  const clientName = typeof project.client === 'object' && project.client !== null
    ? project.client.name
    : project.client || '-';

  return (
    <div className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-200 ${className}`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800 truncate">{title}</h3>
          {/* Si tienes un campo status, úsalo. Si no, puedes quitar esto */}
          {/* <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadgeClasses(project.status)}`}>
            {getStatusText(project.status)}
          </span> */}
        </div>
        
        <div className="mb-3 text-sm text-gray-500 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          {fechaFin}
        </div>
        
        <div className="mb-3 text-sm text-gray-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
          Cliente: {clientName || '-'}
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
          {description}
        </p>
        
        {/* Si tienes equipo, puedes mostrarlo aquí */}
        {/* <div className="flex flex-wrap gap-1 mb-4">
          {Array.isArray(project.team) && project.team.slice(0, 3).map((member, index) => (
            <span key={index} className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-600">
              {member}
            </span>
          ))}
          {Array.isArray(project.team) && project.team.length > 3 && (
            <span className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-semibold text-gray-600">
              +{project.team.length - 3} más
            </span>
          )}
        </div> */}
        
        <div className="flex justify-end">
          <Link 
            to={`/main/projects/${project.id}`} 
            className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            Ver detalles
            <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;