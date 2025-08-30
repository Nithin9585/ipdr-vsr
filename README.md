# IPDR Intelligence Platform

## System Architecture

```mermaid
graph TB
    %% Frontend Components
    subgraph "Frontend (React + TypeScript)"
        A[CSV Upload Interface]
        B[User Input/Prompt Interface]
        C[Generate Report Interface]
        D[Three.js 3D Graph Renderer]
        E[Filters & Search]
        F[Anomaly Visualization]
        G[Node Interaction]
    end

    %% Backend Components
    subgraph "Backend (FastAPI + Python)"
        H[IPDR Parsing Endpoint]
        I[AI Anomaly Detection Model]
        J[PDF Report Generator]
    end

    %% External Services
    subgraph "Cloud Storage"
        K[Amazon S3<br/>PDF Storage]
    end

    %% Connections
    A --> H
    H --> A
    D --> F
    A --> I
    I --> A
    A --> J
    J --> K
    K --> J
    J --> A
    G --> D
    E --> D

    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef cloud fill:#fff3e0,stroke:#e65100,stroke-width:2px

    class A,B,C,D,E,F,G frontend
    class H,I,J backend
    class K cloud
```

## Features

### 🎯 Core Functionality
- **IPDR Data Visualization**: Interactive 3D graph showing A-to-B mappings
- **Anomaly Detection**: AI-powered analysis with red highlighting for suspicious activities
- **Real-time Filtering**: Search and filter by IP, phone, protocol, bytes, duration, and date
- **Node Details**: Tap any node to view IP, phone number, location, and session count
- **PDF Report Generation**: Generate detailed analysis reports for selected nodes

### 🔧 Technical Features
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional interface with dark/light theme support
- **Performance Optimized**: Efficient rendering of large datasets
- **Real-time Updates**: Live anomaly detection and visualization
- **Export Capabilities**: PDF reports with comprehensive analysis

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Three.js** for 3D graph rendering
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Force Graph** for network visualization

### Backend
- **FastAPI** (Python)
- **AI/ML Models** for anomaly detection
- **PDF Generation** libraries
- **Data Processing** pipelines

### Infrastructure
- **Amazon S3** for file storage
- **RESTful APIs** for communication
- **JSON** data interchange

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.8+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Nithin9585/ipdr-vsr.git
   cd ipdr-vsr
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Start the backend server**
   ```bash
   python main.py
   ```

## Usage

1. **Upload IPDR CSV**: Use the upload interface to import your IPDR data
2. **Visualize Data**: View the interactive 3D graph with nodes and connections
3. **Apply Filters**: Use search and filter options to focus on specific data
4. **Detect Anomalies**: Run AI analysis to identify suspicious activities
5. **Generate Reports**: Create PDF reports for selected nodes or custom analysis

## Data Flow

1. **CSV Upload** → IPDR Parsing → Data Visualization
2. **User Interaction** → Node Selection → Detail View
3. **Anomaly Analysis** → AI Processing → Visual Highlighting
4. **Report Generation** → PDF Creation → S3 Storage → Download Link

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.