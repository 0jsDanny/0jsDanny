# 📊 React Health Dashboard Proof of Concept (PoC)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-22B5E2?style=for-the-badge)
![Apache ECharts](https://img.shields.io/badge/Apache_ECharts-AA232E?style=for-the-badge&logo=apache-echarts&logoColor=white)

A high-performance, responsive executive dashboard built with React 19, TypeScript, and Vite. 

This repository demonstrates modern frontend architecture patterns applied to public health management panels, focusing on rendering efficiency, clean state management, and real-time visualization under high data volumes.

---

## 🎯 Architectural Patterns & Core Demonstrations

### 1. Rendering Optimization & Virtualization
Large-scale health surveillance data can contain thousands of records. This PoC showcases how to:
- Render high-density tables and grid layouts without incurring CPU frame drops or blocking the main thread.
- Leverage memoization (`useMemo`, `useCallback`) and virtualized rendering boundaries to ensure sub-16ms frame rendering (60 FPS) during search/filter operations.

### 2. SOLID Component Design
- **Single Responsibility Principle (SRP):** Complete separation of data-fetching containers, presentation components, and layout shells.
- **Dependency Inversion:** Presentation widgets interact with abstract data interfaces rather than concrete API response objects, making the codebase highly testable and agnostic of the underlying backend schemas.

### 3. Efficient State Management & Caching
- **Client State vs. Server State:** Separation of UI layout states (managed via React Context/Zustand) and server state/caching (managed via TanStack Query).
- **Optimistic UI Updates:** Instant UI feedback during data manipulation, with background synchronisation and automatic validation retries.

### 4. Modular Service Layer
- Exposes structured Service classes (`HealthService`, `MetricsService`) acting as gateways.
- Out of the box support for runtime environment swapping (mock data mode vs. production HTTP client instances) utilizing client-side adapters.

---

## 🚀 Tech Stack & Tooling

- **Core:** React 19, Vite (Fast HMR compilation), TypeScript (Strict Mode).
- **Styling:** TailwindCSS (Utility-first, responsive layouts).
- **Visualizations:** Recharts & Apache ECharts (Canvas/SVG rendering for complex medical data curves).
- **Icons:** Lucide React.

---

## 📦 Running Locally

Ensure Node.js (v18+) is installed.

```bash
# Clone the repository
git clone https://github.com/0jsDanny/react-health-dashboard-poc.git

# Access the directory
cd react-health-dashboard-poc

# Install dependencies
npm install

# Start the Vite local development server
npm run dev
```

---

## 🔒 Privacy & Data Anonymization Disclaimer

*Note: In compliance with data confidentiality regulations and General Data Protection Law (LGPD) obligations, this proof of concept relies exclusively on synthetic "Mock Data" (fictional health metrics) and does not reflect, storage, or connect to any real-world patient records or municipal production servers.*
