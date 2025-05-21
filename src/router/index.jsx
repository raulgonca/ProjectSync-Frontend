import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import RootLayout from '../layouts/RootLayout';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Páginas de autenticación
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Páginas principales
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/projects/Projects';
import Users from '../pages/users/Users';
import Clients from '../pages/clients/Clients';
import NotFound from '../pages/NotFound';
import ProjectCreate from '../pages/projects/ProjectCreate';
import ProjectDetail from '../pages/projects/ProjectDetails'; 

// Función para verificar si el usuario está autenticado
const isAuthenticated = () => {
  return localStorage.getItem('user') !== null;
};

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Componente para rutas de autenticación (redirige a main si ya está autenticado)
const AuthRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/main" replace />;
  }
  return children;
};

// Configuración del enrutador
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      {
        path: '/',
        element: <Navigate to="/login" replace />
      },
      // Rutas de autenticación
      {
        path: '/',
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: (
              <AuthRoute>
                <Login />
              </AuthRoute>
            )
          },
          {
            path: 'register',
            element: (
              <AuthRoute>
                <Register />
              </AuthRoute>
            )
          }
        ]
      },
      
      // Rutas principales (protegidas)
      {
        path: '/main',
        element: (
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: '',
            element: <Dashboard />
          },
          {
            path: 'projects',
            element: <Projects />
          },
          {
            path: 'projects/new',
            element: <ProjectCreate />
          },
          {
            path: 'projects/:id',
            element: <ProjectDetail />
          },
          {
            path: 'users',
            element: <Users />
          },
          {
            path: 'clients',
            element: <Clients />
          }
        ]
      }
    ]
  }
]);

export default router;