import React, { useState, useEffect } from "react";
import ProjectCard from "../../components/projects/ProjectCard";
import { projectService } from "../../services/api";
import { Link } from "react-router-dom";
import { FaPlus, FaSearch } from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner"; // Nuevo loader

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos de proyectos desde la API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Solo obtener los proyectos donde el usuario es propietario
        const ownedProjects = await projectService.getAllProjects();
        const ownedProjectsArray = Array.isArray(ownedProjects) ? ownedProjects : [];
        console.log("Proyectos propios:", ownedProjectsArray);

        // Adaptar los datos para que coincidan con la estructura esperada
        const formattedProjects = ownedProjectsArray.map((project) => ({
          id: project.id,
          title: project.projectname || project.title || "Sin título",
          date:
            project.fechaInicio ||
            project.date ||
            new Date().toISOString().split("T")[0],
          description: project.description || "Sin descripción",
          status: project.status || "pending",
          client: project.client?.name || "Sin cliente",
          // Elimina el campo team relacionado con colaboradores
        }));

        setProjects(formattedProjects);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar los proyectos:", error);
        setError(
          "No se pudieron cargar los proyectos. Por favor, inténtalo de nuevo más tarde."
        );
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Función para normalizar texto (eliminar acentos y convertir a minúsculas)
  const normalizeText = (text) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Filtrar proyectos según el término de búsqueda (insensible a mayúsculas y acentos)
  const filteredProjects = projects.filter((project) =>
    normalizeText(project.title).includes(normalizeText(searchTerm))
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="p-6">
      {/* Cabecera con título y buscador */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Lista de Proyectos
        </h1>

        <div className="flex w-full md:w-auto items-center space-x-3">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Buscar proyecto..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
          </div>
          
          <Link 
            to="/main/projects/new" 
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-300 flex items-center whitespace-nowrap"
          >
            <FaPlus className="mr-2" />
            Crear Proyecto
          </Link>
        </div>
      </div>

      {/* Contenido de la lista de proyectos */}
      {loading ? (
        <LoadingSpinner section="projects" text="Cargando proyectos..." />
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500 text-center">
            <p className="text-lg font-semibold mb-2">Error</p>
            <p>{error}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.length > 0 ? (
            filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500 text-lg">
                No se encontraron proyectos que coincidan con tu búsqueda.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Projects;
