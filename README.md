# 🔐 Passwordless Authentication System

*Unlock Your World, No Passwords Required*

[![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-326CE5?logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![FIDO2](https://img.shields.io/badge/FIDO2-FF6B35?logo=fido-alliance&logoColor=white)](https://fidoalliance.org/)

A modern, secure diary application that eliminates passwords entirely using FIDO2/WebAuthn technology. Experience seamless authentication through biometrics, security keys, or platform authenticators.

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [🚀 Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [Local Development](#local-development)
  - [Docker Deployment](#docker-deployment)
  - [Kubernetes Deployment](#kubernetes-deployment)
- [🔧 Configuration](#-configuration)
- [📱 Usage](#-usage)
- [🛠️ API Reference](#️-api-reference)
- [🐳 Containerization](#-containerization)
- [☸️ Kubernetes](#️-kubernetes)
- [🔒 Security](#-security)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

### 🛡️ **Passwordless Security**
- **FIDO2/WebAuthn Integration**: Complete elimination of passwords using modern authentication standards
- **Biometric Authentication**: Support for fingerprint, face recognition, and other biometric methods
- **Hardware Security Keys**: Compatible with YubiKey, Google Titan, and other FIDO2 devices
- **Platform Authenticators**: Works with Windows Hello, Touch ID, and Android biometrics

### 📖 **Personal Diary Management**
- **Secure Entry Creation**: Create and manage personal diary entries
- **Real-time Updates**: Instant saving and retrieval of diary content
- **Session-based Access**: Secure session management without password storage
- **User-specific Data**: Each user's diary entries are completely isolated

### 🏗️ **Modern Architecture**
- **RESTful API**: Clean, well-structured API endpoints
- **MongoDB Storage**: Scalable NoSQL database for user data and diary entries
- **Express.js Backend**: Fast, minimalist web framework
- **Container Ready**: Docker and Kubernetes deployment support

### 🔐 **Enterprise Security**
- **No Password Storage**: Zero password-related vulnerabilities
- **Encrypted Sessions**: Secure session management with MongoDB store
- **CORS Protection**: Configurable cross-origin resource sharing
- **Environment-based Configuration**: Secure configuration management

---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │   Express.js    │    │    MongoDB      │
│                 │    │     Server      │    │   Database      │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   FIDO2     │◄┼────┼►│  Auth API   │ │    │ │    Users    │ │
│ │ WebAuthn    │ │    │ │             │◄┼────┼►│   Diary     │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ │  Entries    │ │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ └─────────────┘ │
│ │    UI       │◄┼────┼►│  Diary API  │ │    │                 │
│ │ Components  │ │    │ │             │ │    │                 │
│ └─────────────┘ │    │ └─────────────┘ │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v6.0 or higher)
- **npm** or **yarn**
- **Docker** (optional, for containerized deployment)
- **Kubernetes** (optional, for orchestrated deployment)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Shrinidhi972004/passwordless-password-authentication-system.git
   cd passwordless-password-authentication-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:6.0
   ```

5. **Run the application:**
   ```bash
   npm start
   ```

6. **Access the application:**
   Open [http://localhost:10000](http://localhost:10000) in your browser

### Docker Deployment

1. **Build and run with Docker Compose:**
   ```bash
   docker-compose up -d
   ```

2. **Access the application:**
   Open [http://localhost:10000](http://localhost:10000)

### Kubernetes Deployment

1. **Deploy to Kubernetes:**
   ```bash
   cd k8s
   kubectl apply -f namespace.yaml
   kubectl apply -f secrets.yaml
   kubectl apply -f mongo-pv.yaml
   kubectl apply -f mongo-pvc.yaml
   kubectl apply -f mongo-deployment.yaml
   kubectl apply -f mongo-service.yaml
   kubectl apply -f app-deployment.yaml
   kubectl apply -f app-service.yaml
   kubectl apply -f ingress.yaml
   kubectl apply -f hpa.yaml
   ```

2. **Access via port forwarding:**
   ```bash
   kubectl port-forward service/passwordless-app 10000:10000 -n passwordless-auth
   ```

---

## � Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `PORT` | Server port | `10000` | No |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/passwordless` | Yes |
| `SESSION_SECRET` | Session encryption key | - | Yes |
| `RP_ID` | Relying Party ID for FIDO2 | `localhost` | Yes |
| `ORIGIN` | Application origin URL | `http://localhost:10000` | Yes |

### Example `.env` file:
```env
PORT=10000
MONGODB_URI=mongodb://localhost:27017/passwordless
SESSION_SECRET=your-super-secret-key-here
RP_ID=localhost
ORIGIN=http://localhost:10000
```

---

## � Usage

### 1. **User Registration**
- Navigate to `/register`
- Enter a unique username
- Follow browser prompts to set up biometric/security key authentication
- Complete registration process

### 2. **User Login**
- Go to the home page (`/`)
- Enter your username
- Authenticate using your registered method (biometric/security key)
- Access your personal dashboard

### 3. **Diary Management**
- Create new diary entries with title and content
- View all your previous entries
- Edit or delete existing entries
- All data is automatically saved and secured

---

## 🛠️ API Reference

### Authentication Endpoints

#### `POST /register-challenge`
Generate registration challenge for new user
```json
{
  "username": "john_doe"
}
```

#### `POST /register-verify`
Verify registration credentials
```json
{
  "username": "john_doe",
  "credential": { /* WebAuthn credential */ }
}
```

#### `POST /login-challenge`
Generate login challenge for existing user
```json
{
  "username": "john_doe"
}
```

#### `POST /login-verify`
Verify login credentials
```json
{
  "username": "john_doe",
  "credential": { /* WebAuthn credential */ }
}
```

### Diary Endpoints

#### `GET /session-info`
Get current user session and diary entries
```json
{
  "username": "john_doe",
  "lastLogin": "2024-01-15T10:30:00Z",
  "diary": [...]
}
```

#### `POST /save-diary`
Create or update diary entry
```json
{
  "title": "My Day",
  "content": "Today was amazing..."
}
```

#### `DELETE /delete-diary/:id`
Delete specific diary entry

#### `PUT /edit-diary/:id`
Update existing diary entry
```json
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

---

## 🐳 Containerization

### Dockerfile
The application includes a multi-stage Dockerfile for optimized container builds:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --production=false
COPY . .

FROM node:18-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app ./
EXPOSE 10000
CMD ["node", "server.js"]
```

### Docker Compose
Complete development environment with MongoDB:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "10000:10000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/passwordless
    depends_on:
      - mongo
  
  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
```

---

## ☸️ Kubernetes

### Features
- **Namespace Isolation**: Dedicated `passwordless-auth` namespace
- **Persistent Storage**: MongoDB data persistence with PVs and PVCs
- **Horizontal Pod Autoscaling**: Automatic scaling based on CPU usage
- **Ingress Controller**: External access configuration
- **Secret Management**: Secure credential storage

### Components
- **Deployments**: App and MongoDB deployments
- **Services**: Internal service discovery
- **ConfigMaps & Secrets**: Configuration management
- **Ingress**: External traffic routing
- **HPA**: Auto-scaling configuration

### Port Forwarding
```bash
# Forward application port
kubectl port-forward service/passwordless-app 10000:10000 -n passwordless-auth

# Forward MongoDB port (for debugging)
kubectl port-forward service/mongo 27017:27017 -n passwordless-auth
```

---

## 🔒 Security

### Authentication Security
- **No Passwords**: Complete elimination of password-based vulnerabilities
- **FIDO2 Compliance**: Industry-standard authentication protocol
- **Cryptographic Verification**: Public key cryptography for user verification
- **Replay Attack Protection**: Challenge-response mechanism prevents replay attacks

### Data Security
- **Encrypted Sessions**: MongoDB session store with encryption
- **User Isolation**: Complete data separation between users
- **Secure Headers**: CORS and security headers implementation
- **Environment Secrets**: Sensitive data stored in environment variables

### Best Practices
- Regular dependency updates
- Secure MongoDB configuration
- HTTPS enforcement in production
- Rate limiting for API endpoints
- Input validation and sanitization

---

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Follow semantic versioning

---

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Shrinidhi Upadhyaya**
- GitHub: [@Shrinidhi972004](https://github.com/Shrinidhi972004)

---

## 🙏 Acknowledgments

- [FIDO Alliance](https://fidoalliance.org/) for authentication standards
- [Express.js](https://expressjs.com/) for the web framework
- [MongoDB](https://www.mongodb.com/) for database solutions
- [Docker](https://www.docker.com/) for containerization
- [Kubernetes](https://kubernetes.io/) for orchestration

---

*Experience the future of authentication - secure, simple, and password-free! 🚀*







