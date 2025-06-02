import React, { useState } from 'react';
import { userService } from '../services/api';
import { toast } from 'react-toastify';
import { FaUserCircle, FaEnvelope, FaLock } from 'react-icons/fa';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [email, setEmail] = useState(user?.email || '');
  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    try {
      await userService.updateEmail(user.id, email);
      toast.success('Email actualizado correctamente');
      // Actualiza localStorage
      localStorage.setItem('user', JSON.stringify({ ...user, email }));
    } catch (err) {
      toast.error(err.message || 'Error al actualizar el email');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }
    setPasswordLoading(true);
    try {
      // Llama correctamente al endpoint de tu backend
      await userService.updatePassword(user.id, currentPassword, newPassword);

      toast.success('Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      if (err.message && err.message.includes('404')) {
        toast.error('No se pudo actualizar la contraseña. Ruta no encontrada en el servidor.');
      } else {
        toast.error(err.message || 'Error al actualizar la contraseña');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center border-2 border-purple-200">
        <div className="flex flex-col items-center mb-8">
          <FaUserCircle className="text-purple-400 text-6xl mb-2" />
          <div className="text-xl font-bold text-gray-800">{user?.username}</div>
          <div className="text-sm text-gray-500 mb-1">
            {Array.isArray(user?.roles) && user.roles.includes('ROLE_ADMIN') ? 'Administrador' : 'Usuario'}
          </div>
        </div>
        <form onSubmit={handleEmailUpdate} className="mb-8 w-full flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-3 text-purple-600 flex items-center">
            <FaEnvelope className="mr-2" /> Cambiar email
          </h2>
          <div className="w-full flex flex-col items-center">
            <input
              type="email"
              value={email}
              placeholder="Nuevo email"
              onChange={e => setEmail(e.target.value)}
              className="border-2 border-purple-200 rounded px-4 py-2 w-full text-base focus:ring-2 focus:ring-purple-300"
              required
            />
            <button
              type="submit"
              disabled={emailLoading}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-semibold transition mt-3"
              style={{ minWidth: 140, maxWidth: 200 }}
            >
              {emailLoading ? 'Guardando...' : 'Actualizar'}
            </button>
          </div>
        </form>
        <form onSubmit={handlePasswordUpdate} className="w-full flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-3 text-purple-600 flex items-center">
            <FaLock className="mr-2" /> Cambiar contraseña
          </h2>
          <div className="mb-3 w-full">
            <input
              type="password"
              placeholder="Contraseña actual"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              className="border-2 border-purple-200 rounded px-4 py-2 w-full text-base focus:ring-2 focus:ring-purple-300"
              required
            />
          </div>
          <div className="mb-3 w-full">
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="border-2 border-purple-200 rounded px-4 py-2 w-full text-base focus:ring-2 focus:ring-purple-300"
              required
            />
          </div>
          <div className="mb-5 w-full">
            <input
              type="password"
              placeholder="Confirmar nueva contraseña"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="border-2 border-purple-200 rounded px-4 py-2 w-full text-base focus:ring-2 focus:ring-purple-300"
              required
            />
          </div>
          <button
            type="submit"
            disabled={passwordLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded font-semibold transition"
            style={{ minWidth: 180, maxWidth: 220 }}
          >
            {passwordLoading ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;