import { useEffect, useState } from 'react';
import { FaUser, FaFolderOpen, FaEnvelope, FaUsers, FaArrowRight } from 'react-icons/fa';
import { projectService } from '../services/api';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [ownProjects, setOwnProjects] = useState([]);
  const [collabProjects, setCollabProjects] = useState([]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);

    if (userData) {
      projectService.getUserProjects(userData.id).then(setOwnProjects);
      projectService.getUserCollaborations(userData.id).then(setCollabProjects);
    }
  }, []);

  if (!user) return null;

  // Proyectos finalizados y próximos a finalizar
  const now = new Date();
  const finalizados = ownProjects.filter(p => p.fechaFin && new Date(p.fechaFin) < now).length;
  const proximos = ownProjects.filter(p => {
    if (!p.fechaFin) return false;
    const fin = new Date(p.fechaFin);
    return fin >= now && fin <= new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);
  }).length;

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-4 text-purple-800">Mi Panel</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl shadow p-4 flex flex-col items-center text-white">
          <FaFolderOpen className="text-2xl mb-1" />
          <div className="text-xl font-bold">{ownProjects.length}</div>
          <div className="text-xs opacity-80">Proyectos propios</div>
        </div>
        <div className="bg-gradient-to-br from-pink-300 to-purple-400 rounded-xl shadow p-4 flex flex-col items-center text-white">
          <FaUsers className="text-2xl mb-1" />
          <div className="text-xl font-bold">{collabProjects.length}</div>
          <div className="text-xs opacity-80">Colaboraciones</div>
        </div>
        <div className="bg-gradient-to-br from-green-300 to-green-500 rounded-xl shadow p-4 flex flex-col items-center text-white">
          <span className="text-2xl mb-1">✔️</span>
          <div className="text-xl font-bold">{finalizados}</div>
          <div className="text-xs opacity-80">Finalizados</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-xl shadow p-4 flex flex-col items-center text-gray-800">
          <span className="text-2xl mb-1">⏳</span>
          <div className="text-xl font-bold">{proximos}</div>
          <div className="text-xs opacity-80">Próx. a finalizar</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-purple-700">Mis proyectos propios</h2>
        {ownProjects.length === 0 ? (
          <p className="text-gray-500">No tienes proyectos propios.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {ownProjects.map(p => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-purple-50 border border-purple-100 rounded-lg px-4 py-3 hover:shadow transition group"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-purple-800 text-base truncate group-hover:underline">
                    {p.projectname}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-700">
                    <span>
                      <span className="font-semibold text-purple-600">Fin:</span> {p.fechaFin || '-'}
                    </span>
                    {p.client?.name && (
                      <span>
                        <span className="font-semibold text-purple-600">Cliente:</span> {p.client.name}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  to={`/main/projects/${p.id}`}
                  className="mt-2 sm:mt-0 sm:ml-6 inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded font-semibold text-xs transition"
                  title="Ver proyecto"
                >
                  Ver <FaArrowRight />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3 text-purple-700">Proyectos como colaborador</h2>
        {collabProjects.length === 0 ? (
          <p className="text-gray-500">No colaboras en ningún proyecto.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {collabProjects.map(p => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between bg-purple-50 border border-purple-100 rounded-lg px-4 py-3 hover:shadow transition group"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-purple-800 text-base truncate group-hover:underline">
                    {p.projectname}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-700">
                    <span>
                      <span className="font-semibold text-purple-600">Fin:</span> {p.fechaFin || '-'}
                    </span>
                    {p.client?.name && (
                      <span>
                        <span className="font-semibold text-purple-600">Cliente:</span> {p.client.name}
                      </span>
                    )}
                  </div>
                </div>
                <Link
                  to={`/main/projects/${p.id}`}
                  className="mt-2 sm:mt-0 sm:ml-6 inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded font-semibold text-xs transition"
                  title="Ver proyecto"
                >
                  Ver <FaArrowRight />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
