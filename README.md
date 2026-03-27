# GitHub PRs Dashboard

A lightweight, client-side React dashboard to track Pull Requests across multiple public GitHub repositories, filtered by specific authors. Designed for teams that want a quick overview of what everyone is working on without constantly browsing GitHub.

## What It Does

This dashboard generates a **single consolidated table** of Pull Requests from the repositories and authors you configure. It answers one question: **"What PRs are my team members working on right now?"**

- Fetches PRs from public GitHub repositories
- Filters by specific GitHub usernames (authors)
- Displays PR title, author, repository, status (open/closed/merged), build status, and creation date
- Stores fetched data locally so the dashboard works offline
- **Only updates when you click the Refresh button** to avoid excessive GitHub API usage

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm (comes with Node.js)

### Installation

```bash
git clone <repository-url>
cd github-prs-dashboard
npm install
```

### GitHub Token (Optional but Recommended)

Without a token, the GitHub API allows only **60 requests per hour**. With a token, you get **5,000 requests per hour**.

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Create a [GitHub Personal Access Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) with **public_repo** scope (read-only)

3. Add your token to `.env`:
   ```
   VITE_GITHUB_TOKEN=ghp_your_token_here
   ```

You can also set or override the token directly in the dashboard's Configuration page.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## Configuration Fields

All configuration is done through the **Configuration** page in the dashboard:

| Field | Description |
|-------|-------------|
| **Dashboard Title** | Optional name displayed in the header (e.g., your team name). If left blank, the header shows "GitHub PRs Dashboard". If filled with "My Team", it shows "My Team GitHub PRs Dashboard". |
| **Repositories** | List of public GitHub repository URLs to monitor. One per line or comma-separated. Example: `https://github.com/kubeflow/model-registry/` |
| **Authors** | List of GitHub usernames whose PRs you want to track. One per line or comma-separated, with or without `@`. Example: `@octocat` |
| **GitHub Token** | Optional Personal Access Token to increase the API rate limit from 60 to 5,000 requests per hour. Saved in your local `.env` file (never committed to git). |

Configuration is persisted locally in JSON files under the `config/` directory (git-ignored).

## How It Works

1. **Configure** your repositories and authors in the Configuration page
2. **Click Refresh** to fetch PRs from the GitHub API
3. **View the table** with all PRs, sorted with open PRs on top
4. **Filter** by author, repository, or status using the dropdowns above the table
5. **Close the browser** and come back later. Your data is still there (stored locally)

### Important: Manual Refresh Only

The dashboard **does not auto-refresh**. Data is only fetched from GitHub when you explicitly click the **Refresh** button. This is intentional to:

- Avoid hitting GitHub API rate limits
- Keep the dashboard usable offline with cached data
- Give you control over when network requests are made

The timestamp of the last refresh is displayed next to the Refresh button so you always know how fresh your data is.

## Data Storage

| File | Purpose |
|------|---------|
| `config/authors.json` | Configured author list with update timestamp |
| `config/repositories.json` | Configured repository list with update timestamp |
| `config/dashboard.json` | Dashboard title with update timestamp |
| `data/pull-requests.json` | Cached PR data with last refresh timestamp |
| `.env` | GitHub token (from `.env.example` template) |

All files under `config/`, `data/`, and `.env` are git-ignored. Only `.env.example` is committed as a template.

## Running Tests

```bash
npm run test          # run once
npm run test:watch    # watch mode
```

## Tech Stack

- React 18 + TypeScript
- Vite (dev server + build)
- Vitest + React Testing Library (tests)
- Pure CSS (no component library)
- GitHub REST API v3 (public, no auth required)
