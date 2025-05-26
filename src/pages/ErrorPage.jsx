import React from 'react';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa';

const ErrorPage = ({ error }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-purple-300 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center max-w-md w-full border border-purple-200">
        <FaExclamationTriangle className="text-5xl text-purple-500 mb-4" />
        <h1 className="text-3xl font-bold text-purple-800 mb-2">¡Vaya! Algo salió mal</h1>
        <p className="text-gray-600 mb-4 text-center">
          {error?.message || 'No se pudo encontrar la página o ha ocurrido un error inesperado.'}
        </p>
        <Link
          to="/main"
          className="inline-flex items-center gap-2 px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold shadow transition"
        >
          <FaArrowLeft /> Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
