import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { authService } from '../services/api';
// Importa los iconos de react-icons
import { FaTachometerAlt, FaFolderOpen, FaUsers, FaBuilding, FaChevronLeft, FaChevronRight, FaUser } from 'react-icons/fa';

// Importa aquí tu logo o usa un placeholder
// import Logo from '../assets/logo.png';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    // Detectar si es dispositivo móvil
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    
    // Verificar al cargar y cuando cambia el tamaño de la ventana
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Función para verificar si un enlace está activo
  const isActive = (path) => {
    if (path === '/main') {
      // Para el Dashboard, solo debe estar activo cuando la ruta es exactamente /main
      return location.pathname === '/main';
    }
    // Para los demás elementos, verificamos si la ruta comienza con el path
    return location.pathname.startsWith(path);
  };

  const userData = JSON.parse(localStorage.getItem('user'));
  const roles = userData?.roles || userData?.authorities || [];
  const isAdmin = Array.isArray(roles)
    ? roles.some(r => r === 'ROLE_ADMIN' || r.authority === 'ROLE_ADMIN')
    : false;

  // Elementos del menú
  const menuItems = [
    ...(isAdmin ? [{
      path: '/main/dashboard',
      name: 'Dashboard',
      icon: <FaTachometerAlt />
    }] : []),
    { 
      path: '/main/projects', 
      name: 'Proyectos', 
      icon: <FaFolderOpen />
    },
    { 
      path: '/main/users', 
      name: 'Usuarios', 
      icon: <FaUsers />
    },
    { 
      path: '/main/clients', 
      name: 'Clientes', 
      icon: <FaBuilding />
    },
    {
      path: '/main/user-dashboard',
      name: 'Mi Panel',
      icon: <FaUser />
    }
  ];

  return (
    <div className={`sidebar bg-purple-800 text-white h-screen ${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 flex flex-col relative ${isMobile ? 'absolute z-10' : ''}`}>
      {/* Logo y título */}
      <div className="p-4 flex items-center justify-center">
        {!collapsed && (
          <div className="flex items-center">
            {/* <img src={Logo} alt="ProjectSync Logo" className="h-8 w-8 mr-2" /> */}
            <h1 className="text-xl font-bold">ProjectSync</h1>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto">
            {/* <img src={Logo} alt="Logo" className="h-8 w-8" /> */}
            <span className="font-bold">PS</span>
          </div>
        )}
      </div>
      
      {/* Botón de colapsar */}
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className={`absolute top-4 ${collapsed ? 'right-[-12px]' : 'right-4'} bg-purple-700 hover:bg-purple-600 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center shadow-md transition-all duration-300 z-20`}
        aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
      >
        {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
      </button>

      {/* Separador */}
      <div className="border-b border-purple-700 my-2"></div>

      {/* Elementos del menú */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="py-4">
          {menuItems.map((item) => (
            <li key={item.path} className="mb-2">
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 ${
                  isActive(item.path) 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-200 hover:bg-purple-700'
                } rounded-lg mx-2 transition-colors`}
                onClick={() => isMobile && setCollapsed(true)}
              >
                <span className="text-xl mr-3">{item.icon}</span>
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Perfil de usuario en la parte inferior */}
      <div className="border-t border-purple-700 px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-lg font-bold select-none">
            <span className="mx-auto block leading-none">{user?.username?.charAt(0) || 'U'}</span>
          </div>
          <div className="flex flex-col">
            <Link
              to="/main/profile"
              className="text-base font-semibold hover:underline text-white"
              title="Ver perfil"
              style={{ lineHeight: 1 }}
            >
              {user?.username || 'Usuario'}
            </Link>
            <button
              className="text-xs text-gray-300 hover:text-white mt-1 text-left"
              onClick={() => {
                authService.logout();
                window.location.reload();
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;