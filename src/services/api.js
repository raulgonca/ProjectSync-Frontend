// Variables de entorno para la configuración de la API
const API_URL = import.meta.env.VITE_URL_API;
const BASE_API_URL = `${API_URL}/api`;

// Función principal para realizar peticiones a la API
const fetchFromAPI = async (endpoint, options = {}) => {
  try {
    // Configuración por defecto para las peticiones
    const defaultOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'omit'
    };

    // Añadir token de autenticación si es necesario
    if (options.requiresAuth !== false) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user?.token) {
        defaultOptions.headers['Authorization'] = `Bearer ${user.token}`;
      }
    }

    // Añadir cuerpo a la petición si existe
    if (options.body) {
      defaultOptions.body = JSON.stringify(options.body);
    }

    // Construir la URL completa
    let url = `${BASE_API_URL}${endpoint}`;
    
    // Añadir parámetros de consulta si existen
    if (options.params) {
      url += `?${new URLSearchParams(options.params)}`;
    }

    // Realizar la petición
    const response = await fetch(url, defaultOptions);

    // Para respuestas sin contenido (204)
    if (response.status === 204) {
      return {};
    }

    // Obtener los datos de la respuesta
    const data = await response.json();

    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      // Si es un error de autenticación (401), cerrar sesión
      if (response.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      throw new Error(data.message || 'Ha ocurrido un error en la petición');
    }

    return data;
  } catch (error) {
    // Si hay un error al parsear JSON
    if (error instanceof SyntaxError) {
      throw new Error('Error al procesar la respuesta del servidor');
    }
    throw error;
  }
};

// Servicios para autenticación
export const authService = {
  // Iniciar sesión
  login: async (email, password) => {
    try {
      console.log('Intentando login con:', { email });
      
      const data = await fetchFromAPI('/login', {
        method: 'POST',
        body: { email, password },
        requiresAuth: false
      });
      
      console.log('Datos recibidos:', data);
      
      // Guardar el token y nombre de usuario en localStorage
      if (data.token) {
        // Guardamos el token
        localStorage.setItem('token', data.token);
        
        // Creamos un objeto con la información del usuario
        const userData = {
          token: data.token,
          username: data.username || data.user?.username || email.split('@')[0],
        };
        
        // Guardamos el objeto de usuario completo
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('Token y nombre de usuario guardados en localStorage');
      } else {
        console.error('No se recibió token en la respuesta');
      }
      
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },
  
  // Registrar nuevo usuario
  register: async (userData) => {
    return await fetchFromAPI('/register', {
      method: 'POST',
      body: userData,
      requiresAuth: false
    });
  },
  
  // Cerrar sesión
  logout: () => {
    // Eliminar ambos elementos del localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Verificar que se hayan eliminado correctamente
    console.log('Usuario eliminado:', localStorage.getItem('user'));
    console.log('Token eliminado:', localStorage.getItem('token'));
    
    // Redireccionar a la página de login
    window.location.href = '/login';
  }
};

// Servicios para usuarios
export const userService = {
  // Obtener todos los usuarios
  getAllUsers: async () => {
    return await fetchFromAPI('/users');
  },
  
  // Obtener un usuario por ID
  getUserById: async (id) => {
    return await fetchFromAPI(`/users/${id}`);
  },
  
  // Actualizar usuario
  updateUser: async (id, userData) => {
    return await fetchFromAPI(`/users/${id}`, {
      method: 'PUT',
      body: userData
    });
  },
  
  // Eliminar usuario
  deleteUser: async (id) => {
    return await fetchFromAPI(`/users/${id}`, {
      method: 'DELETE'
    });
  },
  
  // Crear nuevo usuario
  createUser: async (userData) => {
    return await fetchFromAPI('/users', {
      method: 'POST',
      body: userData
    });
  }
};

// Servicios para proyectos (repositorios)
export const projectService = {
  // Obtener todos los proyectos
  getAllProjects: async () => {
    return await fetchFromAPI('/repos');  // Ruta para obtener repos donde el usuario es propietario
  },
  
  // Obtener proyectos donde el usuario es colaborador
  getCollaborationProjects: async () => {
    return await fetchFromAPI('/repos/colaboraciones');
  },
  
  // Obtener todos los proyectos (propietario + colaborador)
  getAllUserProjects: async () => {
    try {
      // Obtener proyectos donde el usuario es propietario
      const ownedProjects = await fetchFromAPI('/repos');
      
      // Obtener proyectos donde el usuario es colaborador
      const collaborationProjects = await fetchFromAPI('/repos/colaboraciones');
      
      // Combinar ambos arrays y devolver el resultado
      return [...ownedProjects, ...collaborationProjects];
    } catch (error) {
      console.error('Error al obtener todos los proyectos del usuario:', error);
      throw error;
    }
  },
  
  // Obtener un proyecto por ID
  getProjectById: async (id) => {
    return await fetchFromAPI(`/repo/${id}`);  // Corregido a la ruta correcta
  },
  
  // Crear nuevo proyecto
  createProject: async (projectData) => {
    return await fetchFromAPI('/newrepo', {  // Corregido a la ruta correcta
      method: 'POST',
      body: projectData
    });
  },
  
  // Actualizar proyecto
  updateProject: async (id, projectData) => {
    return await fetchFromAPI(`/updaterepo/${id}`, {  // Corregido a la ruta correcta
      method: 'PUT',
      body: projectData
    });
  },
  
  // Eliminar proyecto
  deleteProject: async (id) => {
    return await fetchFromAPI(`/deleterepo/${id}`, {  // Corregido a la ruta correcta
      method: 'DELETE'
    });
  },
  
  // Añadir colaborador a un proyecto
  addCollaborator: async (projectId, userId) => {
    return await fetchFromAPI(`/repos/${projectId}/colaboradores`, {
      method: 'POST',
      body: { userId }
    });
  },
  
  // Eliminar colaborador de un proyecto
  removeCollaborator: async (projectId, userId) => {
    return await fetchFromAPI(`/repos/${projectId}/colaboradores/${userId}`, {
      method: 'DELETE'
    });
  },
  
  // Obtener colaboradores de un proyecto
  getProjectCollaborators: async (projectId) => {
    return await fetchFromAPI(`/repos/${projectId}/colaboradores`);
  }
}

// Servicios para clientes
export const clientService = {
  // Obtener todos los clientes
  getAllClients: async () => {
    return await fetchFromAPI('/clients');
  },
  
  // Obtener un cliente por ID
  getClientById: async (id) => {
    return await fetchFromAPI(`/clients/${id}`);
  },
  
  // Actualizar cliente
  updateClient: async (id, clientData) => {
    return await fetchFromAPI(`/clients/${id}`, {
      method: 'PUT',
      body: clientData
    });
  },
  
  // Eliminar cliente
  deleteClient: async (id) => {
    return await fetchFromAPI(`/clients/${id}`, {
      method: 'DELETE'
    });
  },
  
  // Crear nuevo cliente
  createClient: async (clientData) => {
    return await fetchFromAPI('/createclient', {
      method: 'POST',
      body: clientData
    });
  }
};

// Servicios para repositorios (proyectos)
export const repoService = {
  // Obtener todos los repositorios
  getAllRepos: async () => {
    return await fetchFromAPI('/repos');
  },
  
  // Obtener un repositorio por ID
  getRepoById: async (id) => {
    return await fetchFromAPI(`/repos/${id}`);
  },
  
  // Crear nuevo repositorio
  createRepo: async (repoData) => {
    return await fetchFromAPI('/repos', {
      method: 'POST',
      body: repoData
    });
  },
  
  // Actualizar repositorio
  updateRepo: async (id, repoData) => {
    return await fetchFromAPI(`/repos/${id}`, {
      method: 'PUT',
      body: repoData
    });
  },
  
  // Eliminar repositorio
  deleteRepo: async (id) => {
    return await fetchFromAPI(`/repos/${id}`, {
      method: 'DELETE'
    });
  }
};

// Servicio para información general
export const mainService = {
  // Obtener información de bienvenida de la API
  getApiInfo: async () => {
    return await fetchFromAPI('/main');
  }
};