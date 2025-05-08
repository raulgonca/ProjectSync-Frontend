import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/api';

// Importa aquí tu logo o usa un placeholder
// import Logo from '../../assets/logo.png';

const Register = () => {
  const [userData, setUserData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value
    });
  };

  const validateForm = () => {
    // Validar que las contraseñas coincidan
    if (userData.password !== userData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      setError('El formato del email no es válido');
      return false;
    }
    
    // Validar longitud de contraseña
    if (userData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validar formulario
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Eliminar confirmPassword antes de enviar
      const { confirmPassword: _, ...registerData } = userData;
      
      // Asegurarse de que los campos coincidan con lo que espera el backend
      const dataToSend = {
        email: registerData.email,
        username: registerData.username,
        password: registerData.password
      };
      
      console.log('Datos a enviar:', dataToSend); // Para depuración
      
      const response = await authService.register(dataToSend);
      console.log('Respuesta del servidor:', response); // Para depuración
      
      // Mostrar mensaje de éxito y redirigir al login
      alert('Usuario registrado con éxito. Por favor, inicia sesión.');
      navigate('/login');
    } catch (err) {
      console.error('Error completo:', err); // Para depuración
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-lg shadow-md w-full max-w-4xl flex overflow-hidden">
        {/* Lado izquierdo - Logo y título */}
        <div className="bg-blue-600 text-white w-2/5 p-8 flex flex-col justify-center items-center">
          <div className="h-24 w-24 bg-white text-blue-600 flex items-center justify-center text-3xl font-bold rounded-full mb-6">PS</div>
          <h1 className="text-3xl font-bold mb-4">ProjectSync</h1>
          <p className="text-center text-blue-100">Tu plataforma para gestionar proyectos de forma eficiente y colaborativa</p>
        </div>

        {/* Lado derecho - Formulario */}
        <div className="w-3/5 p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Crear cuenta</h2>
            <p className="text-gray-600">Regístrate para comenzar a usar ProjectSync</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="ejemplo@correo.com"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                Nombre de usuario
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={userData.username}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="usuario123"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">
                Confirmar contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="mb-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors"
              >
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;