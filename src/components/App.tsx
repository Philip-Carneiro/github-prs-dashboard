import { useState } from 'react';
import { useAppConfig } from '../hooks/useLocalStorage';
import { ConfigPage } from './ConfigPage';
import { Dashboard } from './Dashboard';

type Page = 'dashboard' | 'config';

export function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const { config, setConfig, isLoading } = useAppConfig();

  if (isLoading) {
    return (
      <div className="app">
        <div className="empty-state">Loading configuration...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          {config.dashboardTitle
            ? `${config.dashboardTitle} GitHub PRs Dashboard`
            : 'GitHub PRs Dashboard'}
        </h1>
        <nav>
          <button
            className={page === 'dashboard' ? 'nav-active' : ''}
            onClick={() => setPage('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={page === 'config' ? 'nav-active' : ''}
            onClick={() => setPage('config')}
          >
            Configuration
          </button>
        </nav>
      </header>

      <main>
        {page === 'dashboard' ? (
          <Dashboard config={config} />
        ) : (
          <ConfigPage config={config} onSave={setConfig} />
        )}
      </main>
    </div>
  );
}
