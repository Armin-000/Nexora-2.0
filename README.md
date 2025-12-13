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
NEXORA-2.0/
├── backend/
│   └── server.js              # Local backend (Ollama proxy / API logic)
│
├── favicon/
│   └── code.ico               # Application favicon
│
├── node_modules/
│
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx     # Admin interface
│   │   └── settingsModal.tsx  # Settings modal
│   │
│   ├── context/
│   │   └── AuthContext.tsx    # Authentication context
│   │
│   ├── hooks/
│   │   └── useChat.ts         # Chat logic + streaming
│   │
│   ├── pages/
│   │   ├── Landing.tsx        # Landing page
│   │   ├── Login.tsx          # Login page
│   │   └── Register.tsx       # Register page
│   │
│   ├── styles/
│   │   └── index.css          # Global styles
│   │
│   ├── App.tsx                # Main application shell
│   ├── main.tsx               # React entry point
│   └── prism.d.ts             # Prism.js type declarations
│
├── .env                       # Environment variables
├── .gitignore
├── index.html
├── LICENSE
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
