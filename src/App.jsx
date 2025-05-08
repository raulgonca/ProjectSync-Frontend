
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar'; // Asegúrate de crear este componente

function App() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
