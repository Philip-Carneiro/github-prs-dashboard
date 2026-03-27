import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

const CONFIG_DIR = path.resolve(process.cwd(), 'config');
const DATA_DIR = path.resolve(process.cwd(), 'data');
const ENV_FILE = path.resolve(process.cwd(), '.env');

const FILES: Record<string, string> = {
  'authors': path.join(CONFIG_DIR, 'authors.json'),
  'repositories': path.join(CONFIG_DIR, 'repositories.json'),
  'dashboard': path.join(CONFIG_DIR, 'dashboard.json'),
  'pull-requests': path.join(DATA_DIR, 'pull-requests.json'),
};

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJsonFile(filePath: string): unknown {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function writeJsonFile(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  ensureDir(dir);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function parseBody(req: { on: (event: string, cb: (chunk: Buffer) => void) => void }): Promise<string> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
  });
}

function readEnvToken(): string {
  if (!fs.existsSync(ENV_FILE)) return '';
  const content = fs.readFileSync(ENV_FILE, 'utf-8');
  const match = content.match(/^VITE_GITHUB_TOKEN=(.*)$/m);
  return match?.[1]?.trim() ?? '';
}

function writeEnvToken(token: string): void {
  if (fs.existsSync(ENV_FILE)) {
    const content = fs.readFileSync(ENV_FILE, 'utf-8');
    if (/^VITE_GITHUB_TOKEN=/m.test(content)) {
      const updated = content.replace(/^VITE_GITHUB_TOKEN=.*$/m, `VITE_GITHUB_TOKEN=${token}`);
      fs.writeFileSync(ENV_FILE, updated, 'utf-8');
      return;
    }
    fs.writeFileSync(ENV_FILE, content.trimEnd() + `\nVITE_GITHUB_TOKEN=${token}\n`, 'utf-8');
    return;
  }
  fs.writeFileSync(ENV_FILE, `VITE_GITHUB_TOKEN=${token}\n`, 'utf-8');
}

export function apiPlugin(): Plugin {
  return {
    name: 'local-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        const segments = req.url.replace('/api/', '').split('?');
        const resource = segments[0];

        res.setHeader('Content-Type', 'application/json');

        if (resource === 'token') {
          if (req.method === 'GET') {
            const token = readEnvToken();
            res.end(JSON.stringify({ githubToken: token }));
            return;
          }
          if (req.method === 'PUT') {
            const body = await parseBody(req);
            const { githubToken } = JSON.parse(body);
            writeEnvToken(githubToken ?? '');
            res.end(JSON.stringify({ githubToken, updatedAt: new Date().toISOString() }));
            return;
          }
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const filePath = FILES[resource];

        if (!filePath) {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Not found' }));
          return;
        }

        if (req.method === 'GET') {
          const data = readJsonFile(filePath);
          res.end(JSON.stringify(data ?? { error: 'File not found' }));
          return;
        }

        if (req.method === 'PUT') {
          const body = await parseBody(req);
          const parsed = JSON.parse(body);
          parsed.updatedAt = new Date().toISOString();
          writeJsonFile(filePath, parsed);
          res.end(JSON.stringify(parsed));
          return;
        }

        res.statusCode = 405;
        res.end(JSON.stringify({ error: 'Method not allowed' }));
      });
    },
  };
}
