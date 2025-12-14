import React, { useState } from 'react';
import PatientForm from './components/patient/PatientForm';
import TokenCard from './components/patient/TokenCard';
import AdminDashboard from './components/admin/AdminDashboard';
import { isSupabaseConfigured } from './lib/supabase';

function App() {
  const [activeTab, setActiveTab] = useState('patient');
  const [patientToken, setPatientToken] = useState(null);

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Required</h1>
          <p className="text-gray-700 mb-4">
            Supabase is not configured. Please update your <code>.env.local</code> file with your project URL and Anon Key.
          </p>
          <div className="bg-gray-100 p-4 rounded text-left text-sm overflow-x-auto">
            <pre>VITE_SUPABASE_URL=...</pre>
            <pre>VITE_SUPABASE_ANON_KEY=...</pre>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            See <code>supabase_setup.md</code> for instructions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Header / Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center font-bold text-xl text-blue-600">
              DocQ
            </div>
            <div className="flex space-x-4 items-center">
              <button
                onClick={() => setActiveTab('patient')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${activeTab === 'patient'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Patient
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${activeTab === 'admin'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                Doctor / Admin
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {activeTab === 'patient' && (
          <div>
            {!patientToken ? (
              <PatientForm onJoin={(token) => {
                console.log('App: Setting patient token:', token);
                setPatientToken(token);
              }} />
            ) : (
              <TokenCard tokenData={patientToken} onCancel={() => setPatientToken(null)} />
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <AdminDashboard />
        )}
      </main>
    </div>
  );
}

export default App;
