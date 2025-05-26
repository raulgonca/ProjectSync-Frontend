import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import RootLayout from '../layouts/RootLayout';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Páginas de autenticación
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Páginas principales
import Projects from '../pages/projects/Projects';
import Users from '../pages/users/Users';
import Clients from '../pages/clients/Clients';
import ProjectCreate from '../pages/projects/ProjectCreate';
import ProjectDetail from '../pages/projects/ProjectDetails'; 
import UserDashboard from '../pages/UserDashboard';
import Dashboard from '../pages/Dashboard';
import ErrorPage from '../pages/ErrorPage';

// Función para verificar si el usuario está autenticado
const isAuthenticated = () => {
  const user = localStorage.getItem('user');
  if (!user) return false;
  try {
    const parsed = JSON.parse(user);
    return !!parsed.token;
  } catch {
    return false;
  }
};

// Función para comprobar si es admin
const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const roles = user?.roles || user?.authorities || [];
  return Array.isArray(roles)
    ? roles.some(r => r === 'ROLE_ADMIN' || r.authority === 'ROLE_ADMIN')
    : false;
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

// Página principal dinámica según rol
const MainIndex = () => {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  if (isAdmin()) return <Dashboard />;
  return <UserDashboard />;
};

// Configuración del enrutador
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
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
            element: <MainIndex />
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
          },
          {
            path: 'user-dashboard',
            element: <UserDashboard />
          },
          {
            path: 'dashboard',
            element: isAdmin() ? <Dashboard /> : <div className="p-6 text-center text-red-600 font-semibold">No tienes permisos para ver este panel.</div>,
          }
        ]
      }
    ]
  }
]);

export default router;