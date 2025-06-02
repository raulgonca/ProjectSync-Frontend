// Variables de entorno para la configuración de la API
const API_URL = import.meta.env.VITE_URL_API;
const BASE_API_URL = `${API_URL}/api`;

// Función principal para realizar peticiones a la API
const fetchFromAPI = async (endpoint, options = {}) => {
  try {
    if (!API_URL) {
      throw new Error('La URL de la API (VITE_URL_API) no está definida. Revisa tu archivo .env');
    }

    // Configuración por defecto para las peticiones
    const defaultOptions = {
      method: options.method || 'GET',
      headers: {
        'Accept': 'application/json'
      },
      credentials: 'omit'
    };

    // Añadir token a las cabeceras si existe y no es petición pública
    const user = localStorage.getItem('user');
    const token = user ? JSON.parse(user).token : null;
    const requiresAuth = options.requiresAuth !== false;
    if (token && requiresAuth) {
      defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }

    // Si el body es FormData, no poner Content-Type
    if (options.body instanceof FormData) {
      defaultOptions.body = options.body;
    } else if (options.body) {
      defaultOptions.headers['Content-Type'] = 'application/json';
      defaultOptions.body = JSON.stringify(options.body);
    }

    // Construir la URL completa
    let url = `${BASE_API_URL}${endpoint}`;
    // Añadir parámetros de consulta si existen
    if (options.params) {
      url += `?${new URLSearchParams(options.params)}`;
    }

    // Para depuración, muestra la URL final
    // console.log('URL final de la petición:', url);

    // Realizar la petición
    const response = await fetch(url, defaultOptions);

    // Para respuestas sin contenido (204)
    if (response.status === 204) {
      return {};
    }

    // Leer el cuerpo de la respuesta solo una vez
    const responseText = await response.text();
    let data;
    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch (e) {
      console.error('Respuesta no válida del servidor:', responseText + e );
      throw new Error('Error al procesar la respuesta del servidor: ' + responseText);
    }

    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      // Si es 401, elimina el usuario del localStorage
      if (response.status === 401) {
        localStorage.removeItem('user');
      }
      console.error('Respuesta con error:', response.status, responseText);
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
    const data = await fetchFromAPI('/login', {
      method: 'POST',
      body: { email, password },
      requiresAuth: false
    });
    if (data.token) {
      // Asegúrate de guardar el id, username y roles correctamente
      const userData = {
        token: data.token,
        id: data.user?.id || data.id,
        username: data.user?.username || data.username || email.split('@')[0],
        roles: data.user?.roles || data.roles || []
      };
      localStorage.setItem('user', JSON.stringify(userData));
    }
    return data;
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
    localStorage.removeItem('user');
    console.log('Usuario eliminado:', localStorage.getItem('user'));
    window.location.href = '/login';
  }
};

// Servicios para usuarios
export const userService = {
  // Obtener todos los usuarios
  getAllUsers: async () => {
    return await fetchFromAPI('/user/all');
  },
  // Obtener un usuario por ID
  getUserById: async (id) => {
    return await fetchFromAPI(`/users/${id}`);
  },
  // Actualizar usuario
  updateUser: async (id, userData) => {
    return await fetchFromAPI(`/user/update/${id}`, {
      method: 'PUT',
      body: userData
    });
  },
  // Cambiar email del usuario
  updateEmail: async (id, email) => {
    return await fetchFromAPI(`/user/update-email/${id}`, {
      method: 'PUT',
      body: { email }
    });
  },
  // Cambiar contraseña del usuario
  updatePassword: async (id, currentPassword, newPassword) => {
    return await fetchFromAPI(`/user/update-password/${id}`, {
      method: 'PUT',
      body: { currentPassword, newPassword }
    });
  },
  // Eliminar usuario
  deleteUser: async (id) => {
    // Backend espera /user/delete/{id}
    return await fetchFromAPI(`/user/delete/${id}`, {
      method: 'DELETE'
    });
  },
  // Crear nuevo usuario
  createUser: async (userData) => {
    // Backend espera /user/new
    return await fetchFromAPI('/user/new', {
      method: 'POST',
      body: userData
    });
  }
};

// Servicios para proyectos (repositorios)
export const projectService = {
  // Obtener todos los proyectos
  getAllProjects: async () => {
    const response = await fetchFromAPI('/repos/all');
    return Array.isArray(response) ? response : [];
  },
  // Obtener proyectos donde el usuario es colaborador
  getCollaborationProjects: async () => {
    const response = await fetchFromAPI('/repos/colaboraciones');
    return Array.isArray(response) ? response : [];
  },
  // Obtener todos los proyectos (propietario + colaborador)
  getAllUserProjects: async () => {
    // Obtener proyectos donde el usuario es propietario
    const ownedProjects = await fetchFromAPI('/repos');
    const ownedProjectsArray = Array.isArray(ownedProjects) ? ownedProjects : [];
    // Obtener proyectos donde el usuario es colaborador
    const collaborationProjects = await fetchFromAPI('/repos/colaboraciones');
    const collaborationProjectsArray = Array.isArray(collaborationProjects) ? collaborationProjects : [];
    // Combinar ambos arrays y devolver el resultado
    return [...ownedProjectsArray, ...collaborationProjectsArray];
  },
  // Obtener un proyecto por ID
  getProjectById: async (id) => {
    return await fetchFromAPI(`/repos/find/${id}`);  // Corregido a la ruta correctaend
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
  },
  // Obtener proyectos propios de un usuario
  getUserProjects: async (userId) => {
    return await fetchFromAPI(`/user/${userId}/projects`);
  },
  // Obtener colaboraciones de un usuario
  getUserCollaborations: async (userId) => {
    return await fetchFromAPI(`/user/${userId}/collaborations`);
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
    // Backend espera /updateclient/{id} y método PUT
    return await fetchFromAPI(`/updateclient/${id}`, {
      method: 'PUT',
      body: clientData
    });
  },
  // Eliminar cliente
  deleteClient: async (id) => {
    // Backend espera /deleteclient/{id}
    return await fetchFromAPI(`/deleteclient/${id}`, {
      method: 'DELETE'
    });
  },
  // Crear nuevo cliente
  createClient: async (clientData) => {
    // Backend espera /createclient
    return await fetchFromAPI('/createclient', {
      method: 'POST',
      body: clientData
    });
  },
  // Importar clientes desde CSV
  importClientsFromCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await fetchFromAPI('/clients/import', {
      method: 'POST',
      body: formData
    });
  }
};

// Servicios para repositorios (proyectos)
export const repoService = {
  // Obtener todos los repositorios
  getAllRepos: async () => {
    return await fetchFromAPI('/repos/all');
  },
  // Obtener un repositorio por ID
  getRepoById: async (id) => {
    return await fetchFromAPI(`/repos/find/${id}`);
  },
  // Crear nuevo repositorio
  createRepo: async (repoData) => {
    return await fetchFromAPI('/newrepo', { 
      method: 'POST',
      body: repoData
    });
  },
  // Actualizar repositorio
  updateRepo: async (id, repoData) => {
    return await fetchFromAPI(`/updaterepo/${id}`, {
      method: 'PATCH',
      body: repoData
    });
  },
  // Eliminar repositorio
  deleteRepo: async (id) => {
    return await fetchFromAPI(`/deleterepo/${id}`, { // <-- Corrige aquí la ruta
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

export const projectFileService = {
  // Subir un archivo a un proyecto
  uploadFile: async (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return await fetchFromAPI(`/projects/${projectId}/files`, {
      method: 'POST',
      body: formData
    });
  },
  // Listar archivos de un proyecto
  listFiles: async (projectId) => {
    return await fetchFromAPI(`/projects/${projectId}/files`);
  },
  // Descargar un archivo de un proyecto
  downloadFile: (projectId, fileId) => {
    // Devuelve la URL para descargar el archivo (puedes usar fetch si quieres forzar descarga)
    const API_URL = import.meta.env.VITE_URL_API;
    return `${API_URL}/api/projects/${projectId}/files/${fileId}/download`;
  },
  // Eliminar un archivo de un proyecto
  deleteFile: async (projectId, fileId) => {
    return await fetchFromAPI(`/projects/${projectId}/files/${fileId}`, {
      method: 'DELETE'
    });
  },
  // Renombrar un archivo de un proyecto
  renameFile: async (projectId, fileId, newName) => {
    return await fetchFromAPI(`/projects/${projectId}/files/${fileId}/rename`, {
      method: 'PUT',
      body: { originalName: newName }
    });
  }
};