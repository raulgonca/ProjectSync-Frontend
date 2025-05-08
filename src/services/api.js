// URL base para todas las peticiones API
const API_URL = import.meta.env.VITE_URL_API + '/api';

// Función para obtener el token JWT del almacenamiento local
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.token;
};

// Función para manejar errores de respuesta
const handleResponse = async (response) => {
  // Para respuestas sin contenido (204)
  if (response.status === 204) {
    return {};
  }
  
  try {
    // Obtener los datos de la respuesta
    const data = await response.json();
    
    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      // Si es un error de autenticación (401), cerrar sesión
      if (response.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // Lanzar un error con el mensaje del servidor o un mensaje genérico
      throw data.message ? { message: data.message } : { message: 'Ha ocurrido un error' };
    }
    
    // Devolver los datos si todo está bien
    return data;
  } catch (error) {
    // Si hay un error al parsear JSON
    if (error instanceof SyntaxError) {
      throw { message: 'Error al procesar la respuesta del servidor' };
    }
    throw error;
  }
};

// Función para crear opciones de fetch con método y cuerpo
const createFetchOptions = (method, body = null, requiresAuth = true) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    // Cambiamos a 'omit' para evitar problemas de CORS
    credentials: 'omit'
  };
  
  // Añadir el token de autenticación si es necesario
  if (requiresAuth) {
    const token = getToken();
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  // Añadir el cuerpo si existe
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  return options;
};

// Servicios para autenticación
export const authService = {
  // Iniciar sesión
  login: async (email, password) => {
    try {
      console.log('Intentando login con:', { email }); // Para depuración
      
      // Construimos la URL completa para depuración
      const url = `${API_URL}/login`;
      
      // Las rutas de autenticación no requieren token
      const options = createFetchOptions('POST', { email, password }, false);
      
      // Usamos fetch con un timeout para evitar que se quede colgado
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
      
      options.signal = controller.signal;
      
      try {
        const response = await fetch(url, options);
        clearTimeout(timeoutId);
        console.log('Respuesta recibida:', response.status);
        
        const data = await handleResponse(response);
        console.log('Datos recibidos:', data); // Para depuración
        
        // Guardar el token y nombre de usuario en localStorage
        if (data.token) {
          // Guardamos el token
          localStorage.setItem('token', data.token);
          
          // Creamos un objeto con la información del usuario
          const userData = {
            token: data.token,
            username: data.username || data.user?.username || email.split('@')[0], // Usamos el nombre de usuario o una alternativa
            // Puedes añadir más campos si los necesitas
          };
          
          // Guardamos el objeto de usuario completo
          localStorage.setItem('user', JSON.stringify(userData));
          
          console.log('Token y nombre de usuario guardados en localStorage');
        } else {
          console.error('No se recibió token en la respuesta');
        }
        
        return data;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.error('La solicitud ha excedido el tiempo de espera');
          throw { message: 'Tiempo de espera excedido. Verifica la conexión con el servidor.' };
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },
  
  // Registrar nuevo usuario
  register: async (userData) => {
    try {
      // Las rutas de registro no requieren token
      const response = await fetch(`${API_URL}/register`, createFetchOptions('POST', userData, false));
      return handleResponse(response);
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
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
    const response = await fetch(`${API_URL}/users`, createFetchOptions('GET'));
    return handleResponse(response);
  },
  
  // Obtener un usuario por ID
  getUserById: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`, createFetchOptions('GET'));
    return handleResponse(response);
  },
  
  // Actualizar usuario
  updateUser: async (id, userData) => {
    const response = await fetch(`${API_URL}/users/${id}`, createFetchOptions('PUT', userData));
    return handleResponse(response);
  },
  
  // Eliminar usuario
  deleteUser: async (id) => {
    const response = await fetch(`${API_URL}/users/${id}`, createFetchOptions('DELETE'));
    return handleResponse(response);
  }
};

// Servicios para proyectos
export const projectService = {
  // Obtener todos los proyectos
  getAllProjects: async () => {
    const response = await fetch(`${API_URL}/projects`, createFetchOptions('GET'));
    return handleResponse(response);
  },
  
  // Obtener un proyecto por ID
  getProjectById: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}`, createFetchOptions('GET'));
    return handleResponse(response);
  },
  
  // Crear nuevo proyecto
  createProject: async (projectData) => {
    const response = await fetch(`${API_URL}/projects`, createFetchOptions('POST', projectData));
    return handleResponse(response);
  },
  
  // Actualizar proyecto
  updateProject: async (id, projectData) => {
    const response = await fetch(`${API_URL}/projects/${id}`, createFetchOptions('PUT', projectData));
    return handleResponse(response);
  },
  
  // Eliminar proyecto
  deleteProject: async (id) => {
    const response = await fetch(`${API_URL}/projects/${id}`, createFetchOptions('DELETE'));
    return handleResponse(response);
  }
};

// Servicios para clientes
export const clientService = {
  // Obtener todos los clientes
  getAllClients: async () => {
    const response = await fetch(`${API_URL}/clients`, createFetchOptions('GET'));
    return handleResponse(response);
  },
  
  // Obtener un cliente por ID
  getClientById: async (id) => {
    const response = await fetch(`${API_URL}/clients/${id}`, createFetchOptions('GET'));
    return handleResponse(response);
  },
  
  // Crear nuevo cliente
  createClient: async (clientData) => {
    const response = await fetch(`${API_URL}/clients`, createFetchOptions('POST', clientData));
    return handleResponse(response);
  },
  
  // Actualizar cliente
  updateClient: async (id, clientData) => {
    const response = await fetch(`${API_URL}/clients/${id}`, createFetchOptions('PUT', clientData));
    return handleResponse(response);
  },
  
  // Eliminar cliente
  deleteClient: async (id) => {
    const response = await fetch(`${API_URL}/clients/${id}`, createFetchOptions('DELETE'));
    return handleResponse(response);
  }
};