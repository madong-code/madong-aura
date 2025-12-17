# Madong UI Admin Art Design

This is a middle-to-back-end management system template based on Vue3 + Vite, featuring a rich component library and a complete permission management system.

## Features

- 🎨 modular architecture
- 📊 Rich data visualization components
- 🛡 Comprehensive permission control system
- 📱 Responsive layout supporting mobile access
- 🌐 Multi-language support (Chinese/English)
- 📦 Integrated common business modules (user management, role management, menu management, etc.)
- 📊 Multiple statistical report components provided
- 📝 Integrated rich text editor
- 📁 File upload and download functionality
- 🕒 Comprehensive log management system

## Technology Stack

- Vue3 + TypeScript + Vite
- Element Plus component library
- Vue Router 4
- Pinia state management
- Axios for HTTP requests
- ECharts for data visualization
- Sass CSS preprocessor

## Directory Structure

```bash
├── public/              # Static assets
├── src/
│   ├── api/             # API definitions
│   ├── assets/          # Static resource files
│   ├── components/      # Common components
│   ├── config/          # Configuration files
│   ├── locales/         # Multi-language files
│   ├── router/          # Routing configuration
│   ├── store/           # State management
│   ├── types/           # Type definitions
│   ├── utils/           # Utility functions
│   ├── views/           # Page views
│   └── main.ts          # Entry file
├── .env                 # Environment variables configuration
└── vite.config.ts       # Vite configuration
```

## Quick Start

1. Install dependencies

```bash
pnpm install
```

2. Start the development server

```bash
pnpm dev
```

3. Build for production

```bash
pnpm build
```

## Usage Instructions

- System configuration: `src/config/index.ts`
- Routing configuration: `src/router/index.ts`
- State management: `src/store/index.ts`
- API definitions: `src/api/` directory
- Component usage: `src/components/` directory

## Contribution Guidelines

Contributions and issue feedback are welcome! Please read the CONTRIBUTING.md document first.

## License

This project is licensed under the MIT License. See the LICENSE file for details.
