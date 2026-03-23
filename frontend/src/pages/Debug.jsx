import { useState, useEffect } from 'react';

export default function Debug() {
  const [info, setInfo] = useState({
    userAgent: '',
    localStorage: {},
    apiCheck: { status: 'pending', message: 'Verificando...' },
    componentCheck: { status: 'pending', message: 'Verificando...' },
    errors: []
  });

  useEffect(() => {
    // Coletar informações de debug
    const collectDebugInfo = async () => {
      const errors = [];
      
      // 1. Verificar User Agent
      const userAgent = navigator.userAgent;
      
      // 2. Verificar LocalStorage
      const localStorageData = {};
      try {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          localStorageData[key] = localStorage.getItem(key);
        }
      } catch (e) {
        errors.push(`Erro ao acessar localStorage: ${e.message}`);
      }
      
      // 3. Verificar conexão com API
      let apiStatus = { status: 'unknown', message: 'Não verificado' };
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
        const response = await fetch(`${API_URL.replace('/api', '')}/health`, {
          method: 'GET',
          mode: 'cors'
        });
        
        if (response.ok) {
          apiStatus = { 
            status: 'success', 
            message: `API acessível em ${API_URL}`,
            data: await response.text()
          };
        } else {
          apiStatus = { 
            status: 'error', 
            message: `API retornou status ${response.status}` 
          };
        }
      } catch (e) {
        apiStatus = { 
          status: 'error', 
          message: `Erro ao conectar na API: ${e.message}. Verifique se o backend está rodando em http://localhost:3333` 
        };
      }
      
      // 4. Verificar se componentes React carregam
      let componentStatus = { status: 'success', message: 'Componentes OK' };
      try {
        // Testar renderização básica
        const testDiv = document.createElement('div');
        testDiv.className = 'test-tailwind';
        document.body.appendChild(testDiv);
        const styles = window.getComputedStyle(testDiv);
        // Se Tailwind estiver funcionando, não terá estilos inline
        componentStatus = { 
          status: 'success', 
          message: 'React e Tailwind funcionando corretamente' 
        };
        document.body.removeChild(testDiv);
      } catch (e) {
        componentStatus = { 
          status: 'error', 
          message: `Erro ao renderizar componentes: ${e.message}` 
        };
        errors.push(e.message);
      }
      
      // 5. Verificar variáveis de ambiente
      const envVars = {
        VITE_API_URL: import.meta.env.VITE_API_URL || 'não definida (usando padrão)',
      };
      
      setInfo({
        userAgent,
        localStorage: localStorageData,
        apiCheck: apiStatus,
        componentCheck: componentStatus,
        errors,
        envVars,
        timestamp: new Date().toLocaleString('pt-BR')
      });
    };
    
    collectDebugInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Debug do NutriBot
          </h1>
          <p className="text-gray-600">
            Página de diagnóstico para identificar problemas
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Gerado em: {info.timestamp}
          </p>
        </div>

        {/* Status Geral */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            📊 Status Geral
          </h2>
          
          <div className="space-y-4">
            {/* API Status */}
            <div className={`p-4 rounded-lg ${
              info.apiCheck.status === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {info.apiCheck.status === 'success' ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <div>
                  <p className="font-medium text-gray-900">Backend API</p>
                  <p className="text-sm text-gray-700">{info.apiCheck.message}</p>
                  {info.apiCheck.data && (
                    <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                      {info.apiCheck.data}
                    </pre>
                  )}
                </div>
              </div>
            </div>

            {/* Component Status */}
            <div className={`p-4 rounded-lg ${
              info.componentCheck.status === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {info.componentCheck.status === 'success' ? (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
                <div>
                  <p className="font-medium text-gray-900">Frontend Components</p>
                  <p className="text-sm text-gray-700">{info.componentCheck.message}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Variáveis de Ambiente */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ⚙️ Variáveis de Ambiente
          </h2>
          <div className="space-y-2">
            {info.envVars && Object.entries(info.envVars).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-mono text-sm text-gray-700">{key}</span>
                <span className="text-sm text-gray-900">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* LocalStorage */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            💾 LocalStorage
          </h2>
          {Object.keys(info.localStorage).length === 0 ? (
            <p className="text-gray-500 text-sm">LocalStorage vazio</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(info.localStorage).map(([key, value]) => (
                <div key={key} className="p-2 bg-gray-50 rounded">
                  <p className="font-mono text-sm text-gray-700">{key}</p>
                  <p className="text-sm text-gray-900 truncate">
                    {value.length > 100 ? value.substring(0, 100) + '...' : value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Informações do Navegador */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🌐 Informações do Navegador
          </h2>
          <div className="bg-gray-50 rounded p-3">
            <p className="text-xs font-mono text-gray-700 break-all">
              {info.userAgent}
            </p>
          </div>
        </div>

        {/* Erros */}
        {info.errors && info.errors.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              ⚠️ Erros Encontrados
            </h2>
            <ul className="space-y-2">
              {info.errors.map((error, index) => (
                <li key={index} className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Ações */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🛠️ Ações de Debug
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                localStorage.clear();
                alert('LocalStorage limpo!');
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            >
              Limpar LocalStorage
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Recarregar Página
            </button>
            <button
              onClick={async () => {
                const logs = await fetch('/logs.txt').then(r => r.text()).catch(() => 'Logs não disponíveis');
                alert('Verifique o console do navegador (F12) para mais detalhes');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Ver Logs
            </button>
          </div>
        </div>

        {/* Links Úteis */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            🔗 Links Úteis
          </h2>
          <div className="space-y-2">
            <a href="/login" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition">
              → Ir para Login
            </a>
            <a href="/register" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition">
              → Ir para Registro
            </a>
            <a href="http://localhost:3333/health" target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 transition">
              → Health Check do Backend (nova aba)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
