# Chamanguitech

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.x.x.

## 🚀 Getting Started (Local Development)

1. **Clone the repository**

   ```bash
   git clone https://github.com/Jonathan-s-Team/pesaje-frontend.git
   cd pesaje-frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run the development server**

   ```bash
   ng serve
   ```

   Navigate to `http://localhost:4200/`.  
   The app will automatically reload if you change any of the source files.

4. **Start the backend API**

   Make sure your backend server is running locally at:

   ```
   http://localhost:8080
   ```

   The frontend is configured to use `http://localhost:8080/api` for API calls in development (`src/environments/environment.ts`).

## 🔧 Environments

- **Local development** uses:  
  `apiUrl: http://localhost:8080/api`

- **Production (deployed on Netlify)** uses:  
  `apiUrl: /api`  
  _(Handled via reverse proxy on Netlify)_

## 🚀 Deployment Strategy

- **QA (Staging)**  
  - Every push to the `develop` branch automatically deploys to the **Netlify QA site** via GitHub Actions.
  - Publishing a **pre-release** (e.g., `v1.0.0-rc.1`) from the `main` branch will also deploy to **QA**.

- **Production**  
  - A **full release** (e.g., `v1.0.0`) published from the `main` branch triggers a deploy to the **Netlify Production site**.

## 🔄 GitHub Workflows

This project uses two GitHub Actions workflows for CI/CD:

- **`deploy-staging.yml`**
  - Triggered on pushes to the `develop` branch
  - Builds the Angular app and deploys to Netlify QA

- **`deploy-prod-on-release.yml`**
  - Triggered when a GitHub release is published on the `main` branch
  - Deploys to:
    - **QA** if it’s a pre-release
    - **Production** if it’s a full release

GitHub secrets required:

- `NETLIFY_AUTH_TOKEN`
- `NETLIFY_QA_SITE_ID`
- `NETLIFY_PROD_SITE_ID`

## 🌐 Netlify `_redirects` File

The project includes a `_redirects` file to support:

- **Client-side routing (SPA):**
  ```
  /*    /index.html   200
  ```

- **API proxying for production deployments:**
  ```
  /api/*   http://localhost:8080/api/:splat   200
  ```

📁 Place `_redirects` in the `src/` directory.

📦 Update `angular.json` under the `assets` section to ensure `_redirects` is copied during build:

```json
"assets": [
  "src/favicon.ico",
  "src/assets",
  "src/_redirects"
]
```

## 🛠 Build

To build the project for production:

```bash
ng build
```

The output will be stored in the `dist/` directory.

## ✅ Running Unit Tests

To execute unit tests:

```bash
ng test
```

Uses [Karma](https://karma-runner.github.io) as the test runner.

## 🔍 Running End-to-End Tests

To run end-to-end tests (after configuring Cypress or Protractor):

```bash
ng e2e
```

> You may need to install and configure an appropriate e2e test framework.

## 💡 Code Generation

Generate components, services, and more using Angular CLI:

```bash
ng generate component my-component
ng generate service my-service
```

## ℹ️ Further Help

To explore more Angular CLI commands:

```bash
ng help
```

Or visit the [Angular CLI Documentation](https://angular.io/cli).
