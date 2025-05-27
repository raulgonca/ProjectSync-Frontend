import React, { useState, useEffect } from 'react';
import { FaTimes, FaInfoCircle, FaUser, FaEnvelope, FaLock, FaIdCard, FaUserTag } from 'react-icons/fa';

const UserModal = ({ isOpen, onClose, onSave, existingUsers, userToEdit }) => {
  const initialFormData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'ROLE_USER'
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        username: userToEdit.username || '',
        email: userToEdit.email || '',
        password: '',
        confirmPassword: '',
        name: userToEdit.name || '',
        role: Array.isArray(userToEdit.roles) ? userToEdit.roles[0] : 'ROLE_USER'
      });
    } else {
      setFormData(initialFormData);
    }
  }, [userToEdit]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors = {};
    const otherUsers = userToEdit
      ? existingUsers.filter(u => u.id !== userToEdit.id)
      : existingUsers;

    // Validar nombre de usuario (obligatorio)
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es obligatorio';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    } else if (otherUsers.some(user => 
      user.username.toLowerCase() === formData.username.toLowerCase()
    )) {
      newErrors.username = 'Este nombre de usuario ya está en uso';
    }

    // Validar email (obligatorio y formato)
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    } else if (otherUsers.some(user => 
      user.email.toLowerCase() === formData.email.toLowerCase()
    )) {
      newErrors.email = 'Este email ya está en uso';
    }

    // Validar contraseña (obligatorio y seguridad)
    if (!userToEdit) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es obligatoria';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar rol (obligatorio)
    if (!formData.role) {
      newErrors.role = 'El rol es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Limpiar el error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const userData = { ...formData };
        delete userData.confirmPassword;
        userData.roles = [userData.role];
        delete userData.role;
        if (userToEdit) {
          // Si no se cambia la contraseña, no la envíes
          if (!formData.password) delete userData.password;
          await onSave({ ...userData, id: userToEdit.id });
        } else {
          await onSave(userData);
        }
        setFormData(initialFormData);
        onClose();
      } catch (error) {
        setErrors({
          submit: 'Ha ocurrido un error al guardar el usuario. Por favor, inténtalo de nuevo.'
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-400 text-white p-5 border-b border-purple-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold flex items-center">
              <FaUser className="mr-2" /> {userToEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors bg-purple-700 hover:bg-purple-800 rounded-full p-1"
            >
              <FaTimes />
            </button>
          </div>
          <p className="text-sm text-purple-100 mt-1">{userToEdit ? 'Modifica los datos del usuario' : 'Completa el formulario para añadir un nuevo usuario'}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          {errors.submit && (
            <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4 flex items-start">
              <FaInfoCircle className="text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <p>{errors.submit}</p>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaUser className="mr-2 text-purple-600" />
              Nombre de usuario <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.username ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors`}
              placeholder="usuario123"
            />
            {errors.username && <p className="text-red-600 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.username}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaEnvelope className="mr-2 text-purple-600" />
              Email <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors`}
              placeholder="usuario@ejemplo.com"
            />
            {errors.email && <p className="text-red-600 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.email}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaLock className="mr-2 text-purple-600" />
              Contraseña {userToEdit ? '(Dejar en blanco si no se desea cambiar)' : <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors`}
              placeholder="******"
            />
            {errors.password && <p className="text-red-600 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.password}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaLock className="mr-2 text-purple-600" />
              Confirmar contraseña {userToEdit ? '' : <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors`}
              placeholder="******"
            />
            {errors.confirmPassword && <p className="text-red-600 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.confirmPassword}</p>}
          </div>
          
          <div className="mb-6">
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaUserTag className="mr-2 text-purple-600" />
              Rol <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.role ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors`}
            >
              <option value="ROLE_USER">Usuario</option>
              <option value="ROLE_ADMIN">Administrador</option>
            </select>
            {errors.role && <p className="text-red-600 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.role}</p>}
          </div>
          
          <div className="flex justify-end space-x-3 pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors flex items-center"
            >
              <FaTimes className="mr-1" /> Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:bg-purple-400 flex items-center"
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;