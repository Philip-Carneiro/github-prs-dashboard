import { useState } from 'react';
import type { AppConfig } from '../types';

interface ConfigPageProps {
  config: AppConfig;
  onSave: (config: AppConfig) => void;
}

export function ConfigPage({ config, onSave }: ConfigPageProps) {
  const [title, setTitle] = useState(config.dashboardTitle);
  const [reposText, setReposText] = useState(
    config.repositories.join('\n'),
  );
  const [authorsText, setAuthorsText] = useState(
    config.authors.map((a) => `@${a}`).join('\n'),
  );
  const [token, setToken] = useState(config.githubToken);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const repositories = reposText
      .split(/[\n,]+/)
      .map((line) => line.trim())
      .filter(Boolean);

    const authors = authorsText
      .split(/[\n,]+/)
      .map((author) => author.trim().replace(/^@/, ''))
      .filter(Boolean);

    onSave({ dashboardTitle: title, repositories, authors, githubToken: token });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="config-page">
      <h2>Configuration</h2>

      <div className="config-field">
        <label htmlFor="title-input">
          Dashboard Title (optional)
        </label>
        <input
          id="title-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Team Name"
          autoComplete="off"
        />
      </div>

      <div className="config-field">
        <label htmlFor="repos-input">
          Repositories (one per line or comma-separated)
        </label>
        <textarea
          id="repos-input"
          value={reposText}
          onChange={(e) => setReposText(e.target.value)}
          placeholder={`https://github.com/repo_owner/repository_1\nhttps://github.com/repo_owner/repository_2`}
          rows={6}
        />
      </div>

      <div className="config-field">
        <label htmlFor="authors-input">
          Authors (one per line or comma-separated)
        </label>
        <textarea
          id="authors-input"
          value={authorsText}
          onChange={(e) => setAuthorsText(e.target.value)}
          placeholder={`@githubuser_1\n@githubuser_2`}
          rows={6}
        />
      </div>

      <div className="config-field">
        <label htmlFor="token-input">
          GitHub Token (optional - increases rate limit from 60 to 5,000 req/h)
        </label>
        <input
          id="token-input"
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
          autoComplete="off"
        />
        <small className="helper-text">
          <a
            href="https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token"
            target="_blank"
            rel="noopener noreferrer"
          >
            How to create a GitHub Personal Access Token
          </a>
          {' — '}only <strong>public_repo</strong> scope is needed (read-only).
        </small>
      </div>

      <button className="save-button" onClick={handleSave}>
        {saved ? 'Saved!' : 'Save Configuration'}
      </button>
    </div>
  );
}
