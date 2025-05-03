# Chamanguitech

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 13.x.x.

## 🚀 Getting Started (Local Development)

1. **Clone the repository**

   ```bash
   git clone [https://github.com/Jonathan-s-Team/pesaje-frontend.git](https://github.com/Jonathan-s-Team/pesaje-frontend.git)
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

   This is configured in `src/environments/environment.ts`.

## 🔧 Environments

- **Local development** uses:  
  `apiUrl: http://localhost:8080/api`

- **Production (deployed on Netlify)** uses:  
  `apiUrl: /api`  
  _(Handled via reverse proxy in Netlify)_

## 🚀 Deployment Strategy

- **QA (Staging)**  
  Every push to the `develop` branch automatically deploys to the **Netlify QA site** via GitHub Actions.

- **Production**  
  A deploy is triggered when a **GitHub release is published** from the `main` branch.

  - **Pre-releases** (e.g., `v1.0.0-rc.1`) are deployed to **QA**
  - **Full releases** (e.g., `v1.0.0`) are deployed to **production**

## 🔄 GitHub Workflows

This project uses two GitHub Actions workflows for CI/CD:

- **`deploy-staging.yml`**
  - Triggered on pushes to the `develop` branch
  - Builds the Angular app and deploys to Netlify QA

- **`deploy-prod-on-release.yml`**
  - Triggered when a GitHub release is published on the `main` branch
  - If the release is a **pre-release**, it deploys to QA
  - If it's a **full release**, it deploys to production

Secrets like `NETLIFY_AUTH_TOKEN`, `NETLIFY_QA_SITE_ID`, and `NETLIFY_PROD_SITE_ID` are stored in GitHub Secrets.

## 🌐 Netlify `_redirects` File

The project includes a `_redirects` file to support:

- **Client-side routing (SPA):**
  ```
  /*    /index.html   200
  ```

- **API proxying (for production deployments):**
  ```
  /api/*   http://localhost:8080/api/:splat   200
  ```

📁 Place `_redirects` in the `src/` directory.

📦 Then update `angular.json` under the `assets` section to ensure it's copied into the `dist/` folder during build:

```json
"assets": [
  "src/favicon.ico",
  "src/assets",
  "src/_redirects"
]
```

## 🛠 Build

To build the project for production, run:

```bash
ng build
```

The build artifacts will be stored in the `dist/` directory.

## ✅ Running Unit Tests

To run unit tests:

```bash
ng test
```

This uses [Karma](https://karma-runner.github.io) as the test runner.

## 🔍 Running End-to-End Tests

To run end-to-end tests (after configuring a framework like Cypress or Protractor):

```bash
ng e2e
```

> Note: You may need to install and configure an appropriate e2e test framework.

## 💡 Code Generation

Use Angular CLI to generate components, services, modules, etc.:

```bash
ng generate component my-component
ng generate service my-service
```

## ℹ️ Further Help

To explore more Angular CLI commands, run:

```bash
ng help
```

Or visit the [Angular CLI Documentation](https://angular.io/cli).
