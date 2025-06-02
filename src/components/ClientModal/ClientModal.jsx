import React, { useState, useEffect } from 'react';
import { FaTimes, FaInfoCircle, FaBuilding, FaIdCard, FaPhone, FaEnvelope, FaGlobe } from 'react-icons/fa';

// El modal necesita recibir estos props para funcionar correctamente:
// - isOpen: boolean (si el modal está abierto)
// - onClose: función para cerrar el modal
// - onSave: función para guardar (crear o editar) el cliente
// - existingClients: array de clientes existentes (para validaciones)
// - clientToEdit: objeto cliente a editar o null para crear uno nuevo

const ClientModal = ({ isOpen, onClose, onSave, existingClients, clientToEdit }) => {
  const initialFormData = {
    name: '',
    cif: '',
    phone: '',
    email: '',
    web: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (clientToEdit) {
      setFormData({
        name: clientToEdit.name || '',
        cif: clientToEdit.cif || '',
        phone: clientToEdit.phone || '',
        email: clientToEdit.email || '',
        web: clientToEdit.web || ''
      });
    } else {
      setFormData(initialFormData);
    }
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

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

  const validateForm = () => {
    const newErrors = {};
    
    // Filtra los clientes excluyendo el que se está editando (si aplica)
    const otherClients = clientToEdit
      ? existingClients.filter(c => c.id !== clientToEdit.id)
      : existingClients;

    // Validar nombre (obligatorio)
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    } else if (otherClients.some(client => 
      client.name.toLowerCase() === formData.name.toLowerCase()
    )) {
      newErrors.name = 'Ya existe un cliente con este nombre';
    }
    
    // Validar CIF (obligatorio y formato)
    if (!formData.cif.trim()) {
      newErrors.cif = 'El CIF es obligatorio';
    } else if (!/^[A-Z0-9]{9}$/.test(formData.cif)) {
      newErrors.cif = 'El CIF debe tener 9 caracteres alfanuméricos';
    } else if (otherClients.some(client => 
      client.cif.toLowerCase() === formData.cif.toLowerCase()
    )) {
      newErrors.cif = 'Ya existe un cliente con este CIF';
    }
    
    // Validar teléfono (obligatorio y formato)
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    } else if (!/^\d{9}$/.test(formData.phone)) {
      newErrors.phone = 'El teléfono debe tener 9 dígitos';
    }
    
    // Validar email (obligatorio y formato)
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    } else if (formData.email && otherClients.some(client => 
      client.email && client.email.toLowerCase() === formData.email.toLowerCase()
    )) {
      newErrors.email = 'Ya existe un cliente con este email';
    }
    
    // Validar web (formato)
    if (formData.web && !/^(https?:\/\/)?(www\.)?[a-zA-Z0-9]+(\.[a-zA-Z]{2,})+.*$/.test(formData.web)) {
      newErrors.web = 'El formato de la URL no es válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        if (clientToEdit) {
          // Llama a onSave con el id para editar
          await onSave({ ...formData, id: clientToEdit.id });
        } else {
          await onSave(formData);
        }
        setFormData(initialFormData);
        onClose();
      } catch (error) {
        setErrors({
          submit: 'Ha ocurrido un error al guardar el cliente. Por favor, inténtalo de nuevo.'
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
              {clientToEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors bg-purple-700 hover:bg-purple-800 rounded-full p-1"
            >
              <FaTimes />
            </button>
          </div>
          <p className="text-sm text-purple-100 mt-1">
            {clientToEdit
              ? 'Modifica los datos del cliente y guarda los cambios'
              : 'Completa el formulario para añadir un nuevo cliente'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5">
          {errors.submit && (
            <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4 flex items-start">
              <FaInfoCircle className="text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <p>{errors.submit}</p>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaBuilding className="mr-2 text-purple-600" />
              Nombre <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors`}
              placeholder="Nombre de la empresa"
            />
            {errors.name && <p className="text-red-600 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.name}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="cif" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaIdCard className="mr-2 text-purple-600" />
              CIF <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="cif"
              name="cif"
              value={formData.cif}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.cif ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors`}
              placeholder="B12345678"
            />
            {errors.cif && <p className="text-red-600 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.cif}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaPhone className="mr-2 text-purple-600" />
              Teléfono <span className="text-red-500 ml-1">*</span>
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors`}
              placeholder="912345678"
            />
            {errors.phone && <p className="text-red-600 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.phone}</p>}
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
              placeholder="contacto@empresa.com"
            />
            {errors.email && <p className="text-red-600 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.email}</p>}
          </div>
          
          <div className="mb-6">
            <label htmlFor="web" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <FaGlobe className="mr-2 text-purple-600" />
              Sitio Web <span className="text-xs text-gray-500 ml-1">(Opcional)</span>
            </label>
            <input
              type="text"
              id="web"
              name="web"
              value={formData.web}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.web ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors`}
              placeholder="https://www.empresa.com"
            />
            {errors.web && <p className="text-red-600 text-xs mt-1 flex items-center"><FaInfoCircle className="mr-1" /> {errors.web}</p>}
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
              {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientModal;