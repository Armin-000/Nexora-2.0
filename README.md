# Nexora — Local AI Coding Assistant

Nexora is a lightweight local coding assistant built with **React**, **TypeScript**, and **Vite**.  
It communicates with **Ollama** models running locally (e.g., `llama3.2:3b`) and provides a clean, responsive chat interface with streaming responses and syntax-highlighted code blocks.

This project is fully local and does not rely on external APIs.

---

## Features

- Local AI chat powered by the **Ollama API**
- Real-time **token streaming**
- Syntax highlighting using **Prism.js**
- Light & dark **theme support**
- Settings modal (Account + Help)
- **Copy-to-clipboard** for code blocks
- Clear separation of **UI**, **chat logic** and **types**
- Fully local processing (no cloud calls)

---

## Project Structure

```text
NEXORA/
├── favicon/                   # App icons
├── node_modules/
├── src/
│   ├── App.tsx                # Main UI
│   ├── main.tsx               # React entry point
│   ├── prism.d.ts             # Prism.js type declarations
│   ├── types.ts               # Shared TypeScript types
│   ├── hooks/
│   │   └── useChat.ts         # Chat + streaming logic
│   ├── components/
│   │   └── settingsModal.tsx  # Settings modal
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   └── styles/
│       ├── index.css          # Global styles
│       └── settings.css       # Modal styles      
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## Architecture Overview

| File | Purpose |
|------|---------|
| `App.tsx` | UI rendering, themes, modal handling, user input |
| `useChat.ts` | Ollama communication, streaming, errors, system prompt logic |
| `types.ts` | Centralized TypeScript interfaces |
| `settingsModal.tsx` | User settings modal |

---

## Installation

Install dependencies:

```sh
npm install
```

Install PrismJS:

```sh
npm install prismjs
```

Install React Markdown:

```sh
npm install react-markdown
```

Optional: install React Router:

```sh
npm install react-router-dom
```

---

## Running the App

Start the development server:

```sh
npm run dev
```

The application runs at:

```
http://localhost:5173
```

---

## Ollama Setup

Download Ollama:  
https://ollama.com/

Pull a model:

```sh
ollama pull llama3.2:3b
```

Run the model:

```sh
ollama run llama3.2:3b
```
