Project Overview: Full-Stack API Testing Client
This document provides a comprehensive technical breakdown of the "Auth Project" (API Client) codebase. You can use this guide as a reference for explaining the project during technical interviews.

1. High-Level Summary
The project is a Full-Stack API Testing Tool (similar to Postman or Insomnia). It allows users to authenticate, construct HTTP requests (defining methods, headers, parameters, and bodies), execute them, save them into collections, and track their request history.

The application uses a React single-page application (SPA) on the frontend and a Node.js/Express API on the backend, with MongoDB as the database, all orchestrated locally using Docker Compose.

2. Tech Stack & Architecture
Frontend
Framework: React 18 with Vite for fast bundling and hot-module replacement.
Routing: React Router v7 (react-router-dom) for client-side navigation.
State Management: React Context API (AuthContext) and local state (no heavy libraries like Redux).
Drag-and-Drop: @hello-pangea/dnd for reordering requests or collections easily.
Styling: Vanilla CSS (index.css) relying on CSS variables for consistent theming and dark mode.
Backend
Server: Node.js with Express.js.
Security & Middleware: helmet (security headers), cors (cross-origin resource sharing), express-rate-limit (DDoS protection), express-validator (input validation).
Database: MongoDB, completely decoupled via the Mongoose ODM (Object Data Modeling).
Authentication: Custom token-based authentication using jsonwebtoken (JWT) and bcryptjs for secure password hashing.
Proxy Logic: Uses axios on the backend to forward HTTP requests.
Infrastructure
Docker: Frontend runs natively on the host (for dev mode), while the MongoDB database and Node.js backend are containerized and handled seamlessly using a docker-compose.yml file.
3. Core Features & Implementations
1. Authentication System
How it works: A standard JWT-based auth flow. Users can register/login. The backend validates credentials, hashes passwords using bcrypt, and issues a JWT token.
Frontend Integration: Managed globally via an AuthContext, returning standard states (user, loading). Pages like /dashboard and /history are wrapped in a <Protected> route guard that redirects unauthenticated users to /login.
2. Request Proxying (Overcoming CORS)
If the frontend sends an API request directly to a third-party server (e.g., https://api.github.com), the browser might block it due to CORS (Cross-Origin Resource Sharing) restrictions.

Solution: The frontend sends the request details to the local backend proxy route (/api/proxy/execute). The Node.js backend uses axios to make the actual fetch request and then accurately proxies the response (status code, headers, and body text) back to the frontend.
3. Collections & Folder Management
Users can organize saved API requests into structured components locally.
The schema uses reference models, similar to relational foreign keys, where a Request model references a Collection via ObjectId.
4. Request History Tracking
The backend proxyController hooks into the execution logic. When a proxy request completes successfully, if the request came from an authenticated user (req.user), it asynchronously saves the HTTP metadata (URL, headers, method, status) to a MongoDB History document via the History model.
5. Sharable Read-only Links
The system supports sharing collections. The backend can generate a unique token for a Collection.
The frontend route <Route path="/share/:token" element={<ShareView />} /> grabs the collection via a public, read-only endpoint, letting anonymous users view endpoints and methods without needing an account.
4. Database Schema (Mongoose Models)
User: Stores authentication details (email, hashed password).
Collection: Organizes folders and requests (belongs to a User).
Environment: Stores variable environments (like Dev vs Prod base URLs).
Request: Stores deep configuration for an API call, including headers, params, body (raw, form-data, json), and experimental support for preRequestScript and tests.
History: Records every HTTP request executed via the proxy for auditing and quick redialing.
