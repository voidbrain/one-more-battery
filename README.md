# Angular 21 Project

A modern Angular application featuring the latest Angular 21 technologies and best practices.

## Features

- **Angular 21** with zoneless change detection
- **Signals** and **Signals Forms** for reactive programming
- **Internationalization (i18n)** with English and Italian support
- **Progressive Web App (PWA)** capabilities
- **SQLite-style** database using localStorage (client-side persistence)
- **Chart.js** for data visualization
- **Transformers.js** for AI/ML capabilities
- **Docker** development environment with HMR
- **ESLint** and **Prettier** for code quality
- **Angular CLI GitHub Pages** deployment

## Prerequisites

- Node.js 20+
- Docker (optional, for containerized development)
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

### Local Development

```bash
npm start
```

Navigate to `http://localhost:4200/`

### Docker Development (with HMR)

```bash
npm run docker:dev
```

Or run in detached mode:

```bash
npm run docker:dev:detached
```

### Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Build

```bash
npm run build
```

## Deployment

### GitHub Pages

```bash
npm run gh-pages
```

## Project Structure

```
src/
├── app/
│   ├── app.config.ts          # Application configuration
│   ├── app.routes.ts          # Routing configuration
│   ├── app.ts                 # Main app component
│   ├── app.html               # App template
│   ├── app.scss               # App styles
│   ├── components/            # Reusable components
│   │   └── language-selector/ # Language switcher component
│   ├── interfaces/            # TypeScript interfaces
│   │   └── index.ts           # Battery management interfaces
│   ├── pages/                 # Page components (lazy-loaded)
│   │   ├── battery-management/# Battery CRUD management page
│   │   └── settings/          # Application settings page
│   └── services/              # Application services
│       ├── sqlite.ts          # SQLite/localStorage service
│       └── transloco-loader.ts # i18n loader service
├── assets/
│   └── i18n/                  # Translation files
│       ├── en.json
│       └── it.json
├── locale/                    # XLIFF translation files
└── styles.scss                # Global styles
```

## Technologies Used

- **Angular 21**: Latest Angular framework
- **Signals**: Reactive state management
- **Signals Forms**: Modern form handling
- **Transloco**: Internationalization library
- **Chart.js**: Data visualization
- **Transformers.js**: Machine learning in the browser
- **sql-wasm**: SQLite in WebAssembly
- **Docker**: Containerized development
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **PWA**: Progressive Web App features

## Key Features Demonstrated

### Signals and Signals Forms

The app demonstrates modern Angular signals for reactive state management and signals-based forms for better performance and developer experience.

### Internationalization

Full i18n support with English and Italian translations using Transloco.

### SQLite Database

Client-side SQLite database using WebAssembly for data persistence.

### PWA Capabilities

Service worker, web app manifest, and offline capabilities.

### Docker Development

Containerized development environment with hot module replacement.

## Best Practices Compliance

### ✅ Following Best Practices

- **Standalone Components**: All components are standalone, eliminating the need for NgModules
- **Signals State Management**: Uses Angular signals for reactive state management throughout the application
- **Lazy Loading**: Implements route-based lazy loading for optimal bundle splitting
- **Zoneless Change Detection**: Uses Angular 21's zoneless change detection for better performance
- **Reactive Forms**: Uses Angular Reactive Forms for complex form handling
- **Modern Control Flow**: Uses Angular 21's new `@if`, `@for`, and `@switch` control flow syntax
- **TypeScript Strict Mode**: Maintains strict type checking with no `any` types in source code
- **Service Architecture**: Services use `providedIn: 'root'` for proper singleton management

### ⚠️ Areas for Improvement

- **Accessibility**: Add AXE testing and WCAG AA compliance checks
- **Component Size**: Some components could be further broken down into smaller, more focused units
- **Dependency Injection**: Consider migrating from constructor injection to the `inject()` function
- **Change Detection**: Implement `ChangeDetectionStrategy.OnPush` for better performance
- **Input/Output Functions**: Migrate from `@Input()`/`@Output()` decorators to `input()`/`output()` functions
- **Image Optimization**: Use `NgOptimizedImage` for any static images (currently no images in the app)

## Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run format` - Format code
- `npm run format:check` - Check code formatting
- `npm run docker:dev` - Start Docker development environment
- `npm run gh-pages` - Deploy to GitHub Pages

## Contributing

1. Follow the established code style
2. Run linting and formatting before committing
3. Test your changes thoroughly
4. Update documentation as needed

## License

This project is licensed under the MIT License.
