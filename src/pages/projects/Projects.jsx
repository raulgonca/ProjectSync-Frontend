import React, { useState, useEffect } from "react";
import ProjectCard from "../../components/projects/ProjectCard";
import { projectService } from "../../services/api";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar datos de proyectos desde la API
  // En Projects.jsx
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Usar getAllUserProjects en lugar de getAllProjects
        const data = await projectService.getAllUserProjects();

        // Adaptar los datos para que coincidan con la estructura esperada
        const formattedProjects = data.map((project) => ({
          id: project.id,
          title: project.projectname || project.title || "Sin título",
          date:
            project.fechaInicio ||
            project.date ||
            new Date().toISOString().split("T")[0],
          description: project.description || "Sin descripción",
          status: project.status || "pending",
          client: project.client?.name || "Sin cliente",
          team: project.colaboradores?.map((c) => c.username) || [],
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
              <svg
                className="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
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
