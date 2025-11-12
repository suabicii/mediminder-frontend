import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Heart, Calendar, Pill } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Medications from './pages/Medications';

const NavBar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Calendar },
    { path: '/medications', label: 'Moje leki', icon: Pill },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-red-500" />
            <span className="text-xl font-bold text-gray-900">MediMinder</span>
          </Link>
          
          <div className="flex space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/medications" element={<Medications />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
