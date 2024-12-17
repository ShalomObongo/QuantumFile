## Project Structure

```
quantumfile/
├── src/
│   ├── main/
│   │   ├── main.ts                 # Main electron process - The entry point of your Electron app. Handles window creation and app lifecycle
│   │   ├── ipc.ts                  # Manages communication between main and renderer processes (Inter-Process Communication)
│   │   └── fileManager.ts          # Contains logic for file operations, reading directories, and implementing file organization algorithms
│   │
│   ├── renderer/
│   │   ├── index.html             # The main HTML file that loads your React application
│   │   ├── styles/
│   │   │   ├── main.css          # Global styles for your application
│   │   │   └── themes.css        # Theme-specific styles (dark/light mode)
│   │   │
│   │   ├── components/
│   │   │   ├── FileList.tsx      # Component to display files that need organization
│   │   │   ├── PreviewChanges.tsx # Shows users what changes will be made before applying them
│   │   │   ├── Settings.tsx      # Settings page for API key input and other configurations
│   │   │   └── ThemeToggle.tsx   # Component for switching between themes
│   │   │
│   │   ├── contexts/
│   │   │   ├── ThemeContext.tsx  # React context for managing theme state across the app
│   │   │   └── SettingsContext.tsx # React context for managing app settings
│   │   │
│   │   └── services/
│   │       ├── geminiService.ts  # Handles all interactions with Google's Gemini API
│   │       └── storageService.ts # Manages local storage of settings and preferences
│   │
│   └── shared/
│       ├── types/
│       │   └── index.ts          # TypeScript type definitions used across the application
│       └── constants.ts          # Shared constant values used throughout the app
│
├── assets/
│   └── icons/                    # Application icons for different platforms and sizes
│
├── .gitignore                    # Specifies which files Git should ignore
├── package.json                  # Project metadata and dependencies
├── tsconfig.json                # TypeScript configuration
├── electron-builder.json        # Configuration for building and packaging the app
└── README.md                    # Project documentation
```
