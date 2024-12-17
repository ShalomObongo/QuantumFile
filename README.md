# 🌌 QuantumFile

<div align="center">

![QuantumFile Logo](assets/logo.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-✓-47848F.svg)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-✓-61DAFB.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-✓-3178C6.svg)](https://www.typescriptlang.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-✓-0081CB.svg)](https://mui.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4.svg)](https://deepmind.google/technologies/gemini/)

**AI-Powered File Organization**

[Features](#✨-features) • [Installation](#🚀-installation) • [Usage](#💡-usage) • [Development](#🛠️-development) • [Contributing](#🤝-contributing)

</div>

## ✨ Features

- 🤖 **AI-Powered Organization**: Leverages Google's Gemini AI to intelligently analyze and organize your files
- 🎯 **Smart Categorization**: Automatically suggests optimal file structures based on content and patterns
- 🔍 **Preview Changes**: Review and approve all suggested changes before they're applied
- 🔄 **Automatic Backup**: Built-in backup system ensures your files are always safe
- 🌓 **Dark/Light Mode**: Beautiful, responsive UI with support for both light and dark themes
- 🔐 **Secure**: Your files and API keys are handled securely with no external uploads

## 🚀 Installation

1. **Prerequisites**
   ```bash
   node >= 20.0.0
   npm >= 9.0.0
   ```

2. **Clone and Install**
   ```bash
   git clone https://github.com/ShalomObongo/QuantumFile.git
   cd QuantumFile
   npm install
   ```

3. **Get API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to the app's settings

4. **Run the App**
   ```bash
   npm run start
   ```

## 💡 Usage

1. **Launch QuantumFile**
   - Start the application using `npm run start`
   - The modern, intuitive interface will guide you through the process

2. **Configure Settings**
   - Add your Google Gemini API key in the Settings panel
   - Choose your preferred theme (Light/Dark)

3. **Select Folder**
   - Click the "Select Folder" button
   - Choose the folder you want to organize
   - Wait for AI analysis

4. **Review Changes**
   - Preview suggested file organization
   - Review each change with detailed explanations
   - Approve or modify suggestions

5. **Apply Changes**
   - Click "Apply Changes" to reorganize your files
   - Automatic backup is created for safety
   - Monitor progress in real-time

## 🛠️ Development

### Tech Stack
- **Frontend**: React, TypeScript, Material-UI
- **Backend**: Electron, Node.js
- **AI**: Google Gemini API
- **Build**: Webpack, TypeScript Compiler

### Project Structure
```
QuantumFile/
├── src/
│   ├── main/           # Electron main process
│   │   ├── ipc.ts      # IPC handlers
│   │   └── main.ts     # Main entry point
│   └── renderer/       # React renderer process
│       ├── components/ # React components
│       ├── contexts/   # React contexts
│       ├── services/   # Business logic
│       └── styles/     # CSS styles
├── dist/              # Compiled files
└── webpack.config.js  # Webpack configuration
```

### Available Scripts
- `npm run start`: Start the application
- `npm run build`: Build the application
- `npm run test`: Run tests
- `npm run lint`: Lint code
- `npm run format`: Format code

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful file analysis
- Electron team for the amazing framework
- React community for the robust ecosystem
- Material-UI team for beautiful components

---

<div align="center">

Made with ⚡️ by [Shalom Obongo](https://github.com/ShalomObongo)

[⬆ Back to Top](#-quantumfile)

</div>

