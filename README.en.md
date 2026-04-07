# Madong UI Admin Art Design

A modern admin backend frontend framework based on Vue 3 + Vite, designed specifically for MD-Admin 5.x backend services. Developed with Composition API and TypeScript, providing responsive layout and complete permission management functionality.

## Project Introduction

Madong UI Admin Art Design is a feature-complete, aesthetically pleasing admin backend frontend solution designed to provide developers with the ability to quickly build enterprise-level management systems.

## Core Features

- 🎨 Modern design style with modular architecture
- 📊 Rich data visualization components based on ECharts
- 🛡 Complete permission control system with granular permission management
- 📱 Responsive layout supporting mobile access
- 🌐 Multi-language support (Chinese/English)
- 📦 Integrated common business modules (user, role, menu management, etc.)
- 📝 Rich text editor integration
- 📁 File upload and download functionality
- 🕒 Comprehensive log management system
- 🔧 Comprehensive CRUD feature templates

## Technology Stack

- **Frontend Framework**: Vue 3 + TypeScript + Vite
- **UI Component Library**: Element Plus
- **Routing Management**: Vue Router 4
- **State Management**: Pinia
- **HTTP Client**: Axios
- **Data Visualization**: ECharts
- **CSS Preprocessor**: Sass

## Directory Structure

```bash
├── public/              # Static assets
├── src/                 # Main application directory
│   ├── apps/            # Feature modules directory
│   │   ├── demo/        # Demo module
│   │   └── official/    # Official module
│   ├── assets/          # Static resource files
│   ├── components/      # Common components
│   ├── config/          # Configuration files
│   ├── locales/         # Multi-language files
│   ├── router/          # Routing configuration
│   ├── store/           # State management
│   ├── types/           # Type definitions
│   ├── lang/            # Multi-language files
│   ├── api/             # API definitions
│   ├── views/           # Page views
│   ├── utils/           # Utility functions
│   └── main.ts          # Entry file
├── .env                 # Environment variables configuration
└── vite.config.ts       # Vite configuration
```

## Quick Start

1. **Install dependencies**

```bash
pnpm install
```

2. **Start the development server**

```bash
pnpm dev
```

3. **Build for production**

```bash
pnpm build
```

4. **Preview production build**

```bash
pnpm preview
```

## Usage Instructions

- **System Configuration**: `src/config/index.ts`
- **Routing Configuration**: `src/router/index.ts`
- **State Management**: `src/store/index.ts`
- **API Definitions**: `src/api/` directory
- **Component Usage**: `src/components/` directory
- **Page Development**: `src/app/views/` directory
- **CRUD Templates**: Refer to `AI_CONTEXT.md` file

## Development Guidelines

- Use TypeScript for type checking
- Follow Vue 3 Composition API best practices
- Use PascalCase for component naming
- Use kebab-case for file naming
- Follow project directory structure conventions

## Contribution Guidelines

Contributions and issue feedback are welcome! Please read the CONTRIBUTING.md document first.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
