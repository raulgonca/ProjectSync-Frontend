import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaBuilding } from 'react-icons/fa';

const ProjectCard = ({ project, className = "" }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
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
    switch (status) {
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

  const getDynamicStatus = (fechaFin) => {
    if (!fechaFin) return 'pending';

    const today = new Date();
    const endDate = new Date(fechaFin);

    if (endDate < today) {
      return 'completed';
    } else {
      return 'in-progress';
    }
  };

  const rawTitle = project.title || project.projectname || 'Sin título';
  const title = rawTitle.charAt(0).toUpperCase() + rawTitle.slice(1);
  const description = project.description || '';
  const fechaFin = project.fechaFin ? formatDate(project.fechaFin) : '-';
  const clientName = typeof project.client === 'object' && project.client !== null
    ? project.client.name
    : project.client || '-';

  const status = getDynamicStatus(project.fechaFin);

  return (
    <div className={`rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-200 bg-white ${className}`}>
      <div className="p-5 flex flex-col h-full space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900 truncate">{title}</h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClasses(status)}`}>
            {getStatusText(status)}
          </span>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FaCalendarAlt className="text-purple-500 w-4 h-4" />
            <span className="font-medium">Entrega:</span> {fechaFin}
          </div>
          <div className="flex items-center gap-2">
            <FaBuilding className="text-purple-500 w-4 h-4" />
            <span className="font-medium">Cliente:</span> {clientName}
          </div>
        </div>

        {/* Descripción con filo morado */}
        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-md line-clamp-3 border-l-4 border-purple-600">
          {description}
        </p>

        <div className="mt-auto flex justify-end">
          <Link
            to={`/main/projects/${project.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-all"
          >
            <span>Ver detalles</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
