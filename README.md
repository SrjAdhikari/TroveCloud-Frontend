# TroveCloud Frontend

A modern, feature-rich cloud file management web app built with React, TypeScript, and Vite.

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Server State**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: Sonner
- **Font**: Poppins

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

```bash
git clone https://github.com/SrjAdhikari/TroveCloud-Frontend.git
cd TroveCloud-Frontend
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Project Structure

```
src/
├── api/            → API endpoint functions
├── config/         → Infrastructure setup (Axios client, query client)
├── components/
│   ├── ui/         → shadcn/ui primitives
│   ├── auth/       → Auth-specific components
│   └── layout/     → Layout components
├── hooks/          → Custom React hooks
├── lib/            → Utility functions
├── pages/          → Page components (one per route)
├── routes/         → Route definitions + auth guards
├── schemas/        → Zod validation schemas
└── types/          → TypeScript type definitions
```
