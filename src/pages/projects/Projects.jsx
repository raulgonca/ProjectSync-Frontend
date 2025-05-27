import React, { useEffect, useState } from "react";
import { projectService } from "../../services/api";
import ProjectCard from "../../components/projects/ProjectCard";
import LoadingSpinner from "../../components/LoadingSpinner";
import { FaFolderOpen, FaUsers, FaPlus, FaSearch, FaChevronDown, FaChevronUp, FaFilter } from "react-icons/fa";
import { Link } from "react-router-dom";

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [ownedProjects, setOwnedProjects] = useState([]);
  const [collabProjects, setCollabProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sectionFilter, setSectionFilter] = useState('both'); // 'both', 'owner', 'collab'

  // Obtener el usuario logueado
  const user = JSON.parse(localStorage.getItem("user"));

  // Cargar datos de proyectos desde la API
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        if (!user?.id) throw new Error("Usuario no autenticado");
        // Proyectos donde el usuario es propietario
        const owned = await projectService.getUserProjects(user.id);
        // Proyectos donde el usuario es colaborador
        const collabs = await projectService.getUserCollaborations(user.id);
        setOwnedProjects(Array.isArray(owned) ? owned : []);
        setCollabProjects(Array.isArray(collabs) ? collabs : []);
      } catch (error) {
        console.error("Error al cargar los proyectos:", error);
        setError(
          "No se pudieron cargar los proyectos. Por favor, inténtalo de nuevo más tarde."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user?.id]);

  // Función para normalizar texto (eliminar acentos y convertir a minúsculas)
  const normalizeText = (text) => {
    if (!text || typeof text !== "string") return "";
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Filtrar proyectos según el término de búsqueda y el tipo de filtro
  const filterProject = (project, type) => {
    const term = normalizeText(searchTerm);
    if (!term) return true;
    switch (type) {
      case 'name':
        return normalizeText(project.title || project.projectname || '').includes(term);
      case 'client':
        // project.client puede ser objeto o string
        if (typeof project.client === 'object' && project.client !== null) {
          return normalizeText(project.client.name || '').includes(term);
        }
        return normalizeText(project.client || '').includes(term);
      default:
        // 'all'
        return (
          normalizeText(project.title || project.projectname || '').includes(term) ||
          (typeof project.client === 'object'
            ? normalizeText(project.client.name || '').includes(term)
            : normalizeText(project.client || '').includes(term)
          )
        );
    }
  };

  const filteredOwnedProjects = ownedProjects.filter((project) => filterProject(project, filterType));
  const filteredCollabProjects = collabProjects.filter((project) => filterProject(project, filterType));

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading)
    return <LoadingSpinner section="projects" text="Cargando proyectos..." />;

  return (
    <div className="p-6">
      {/* Cabecera con título y acciones */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
          Lista de Proyectos
        </h1>
        <div className="flex flex-col w-full md:w-auto space-y-2 md:space-y-0 md:space-x-2">
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Buscar proyecto..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded-lg flex items-center transition-colors"
              title="Mostrar filtros"
            >
              <FaFilter className={`${showFilters ? 'text-purple-600' : 'text-gray-600'}`} />
            </button>
            <Link
              to="/main/projects/new"
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
            >
              <FaPlus className="mr-2" />
              Nuevo Proyecto
            </Link>
          </div>
          {showFilters && (
            <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 mt-2 flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 mr-2 self-center">Filtrar por:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 text-sm rounded-full ${filterType === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterType('name')}
                  className={`px-3 py-1 text-sm rounded-full ${filterType === 'name' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Nombre
                </button>
                <button
                  onClick={() => setFilterType('client')}
                  className={`px-3 py-1 text-sm rounded-full ${filterType === 'client' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Cliente
                </button>
              </div>
              <span className="text-sm text-gray-600 mx-2 self-center">Ver:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSectionFilter('both')}
                  className={`px-3 py-1 text-sm rounded-full ${sectionFilter === 'both' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setSectionFilter('owner')}
                  className={`px-3 py-1 text-sm rounded-full ${sectionFilter === 'owner' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Propietario
                </button>
                <button
                  onClick={() => setSectionFilter('collab')}
                  className={`px-3 py-1 text-sm rounded-full ${sectionFilter === 'collab' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  Colaborador
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Sección de proyectos propios */}
      {sectionFilter === 'both' || sectionFilter === 'owner' ? (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <FaFolderOpen className="text-purple-600" />
            <h2 className="text-xl font-semibold text-purple-700">Mis proyectos</h2>
          </div>
          {ownedProjects.length === 0 ? (
            <div className="bg-gray-100 p-6 rounded-lg text-center text-gray-500">
              No tienes proyectos propios.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOwnedProjects.length > 0 ? (
                filteredOwnedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    className="bg-white border-2 border-purple-200"
                  />
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
        </section>
      ) : null}

      {/* Sección de colaboraciones */}
      {sectionFilter === 'both' || sectionFilter === 'collab' ? (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FaUsers className="text-blue-600" />
            <h2 className="text-xl font-semibold text-blue-700">Colaboraciones</h2>
          </div>
          {collabProjects.length === 0 ? (
            <div className="bg-blue-50 p-6 rounded-lg text-center text-blue-500">
              No colaboras en ningún proyecto.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCollabProjects.length > 0 ? (
                filteredCollabProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    className="bg-blue-50 border-2 border-blue-200"
                  />
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
        </section>
      ) : null}
    </div>
  );
};

export default Projects;
