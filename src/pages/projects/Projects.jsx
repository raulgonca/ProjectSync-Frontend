import React, { useState, useEffect } from 'react';
import ProjectCard from '../../components/projects/ProjectCard';

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simulación de datos de proyectos (reemplazar con llamada a API real)
  useEffect(() => {
    // Aquí harías tu llamada a la API para obtener los proyectos
    // Por ahora usamos datos de ejemplo
    const mockProjects = [
      {
        id: 1,
        title: 'Desarrollo de aplicación web',
        date: '2023-05-15',
        description: 'Desarrollo de una aplicación web completa con React y Node.js para gestión de inventario y ventas. Incluye panel de administración, informes y gestión de usuarios.',
        status: 'in-progress',
        client: 'TechSolutions S.L.',
        team: ['Ana García', 'Carlos López', 'María Rodríguez']
      },
      {
        id: 2,
        title: 'Rediseño de sitio corporativo',
        date: '2023-06-20',
        description: 'Actualización completa del sitio web corporativo con nuevo diseño, mejoras de rendimiento y optimización SEO. Implementación de blog y área de clientes.',
        status: 'pending',
        client: 'Constructora Hernández',
        team: ['Juan Pérez', 'Laura Martínez']
      },
      {
        id: 3,
        title: 'Implementación de CRM',
        date: '2023-04-10',
        description: 'Configuración e implementación de sistema CRM personalizado para equipo de ventas y atención al cliente. Integración con herramientas existentes.',
        status: 'completed',
        client: 'Distribuciones Gómez',
        team: ['Pedro Sánchez', 'Elena Torres', 'Miguel Fernández']
      },
      {
        id: 4,
        title: 'Desarrollo de aplicación móvil',
        date: '2023-07-05',
        description: 'Creación de aplicación móvil multiplataforma para Android e iOS utilizando React Native. Funcionalidades de geolocalización y notificaciones push.',
        status: 'in-progress',
        client: 'FitLife App',
        team: ['Sofía Ruiz', 'David Moreno']
      },
      {
        id: 5,
        title: 'Migración a la nube',
        date: '2023-03-22',
        description: 'Migración completa de infraestructura local a servicios en la nube AWS. Incluye reconfiguración de servidores, bases de datos y sistemas de seguridad.',
        status: 'completed',
        client: 'Seguros Martínez',
        team: ['Roberto Díaz', 'Carmen Vega', 'Javier Ortiz']
      },
      {
        id: 6,
        title: 'Campaña de marketing digital',
        date: '2023-08-01',
        description: 'Diseño e implementación de campaña integral de marketing digital. Incluye SEO, SEM, redes sociales y email marketing.',
        status: 'pending',
        client: 'Moda Express',
        team: ['Lucía Jiménez', 'Alberto Navarro']
      }
    ];
    
    setTimeout(() => {
      setProjects(mockProjects);
      setLoading(false);
    }, 800); // Simulamos un tiempo de carga
  }, []);

  // Función para normalizar texto (eliminar acentos y convertir a minúsculas)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Filtrar proyectos según el término de búsqueda (insensible a mayúsculas y acentos)
  const filteredProjects = projects.filter(project => 
    normalizeText(project.title).includes(normalizeText(searchTerm))
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="p-6">
      {/* Cabecera con título y buscador */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Lista de Proyectos</h1>
        
        <div className="w-full md:w-1/3">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre de proyecto..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido de la lista de proyectos */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500 text-lg">No se encontraron proyectos que coincidan con tu búsqueda.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;