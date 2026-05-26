# Neural Network Visualizer

An AI-powered web application that generates and visualizes custom 3D neural network architectures from user-defined prompts using Gemini API. The application dynamically creates structured neural network graphs with nodes, layers, and synapses, allowing users to simulate and explore AI-inspired architectures interactively.

---

## 🚀 Features

- Generate custom neural network structures from conceptual prompts
- AI-powered node and synapse generation
- Structured layer-based architecture creation
- Interactive 3D visualization support
- Smooth frontend experience with React + Vite
- Express backend integration
- Gemini API-powered architecture generation
- TypeScript-based scalable setup
- Production-ready build configuration
- Environment-based API key handling

---

## 🛠 Tech Stack

### Frontend
- React 19
- Vite
- TypeScript
- Tailwind CSS
- Motion
- Lucide React

### Backend
- Express.js
- Node.js
- Gemini API (`@google/genai`)
- dotenv

### Build Tools
- ESBuild
- TSX
- Vite

---

## 📁 Project Structure

```bash
Neural-Network-Visualizer/
│
├── index.html              # Root HTML file
├── server.ts               # Express server + Gemini API integration
├── package.json            # Project dependencies and scripts
├── package-lock.json       # Dependency lock file
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite configuration
├── README.md               # Documentation
├── .env / .env.local      # Environment variables
└── src/                   # Frontend source code
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/reak-projects/Neural-network-visualizer.git
cd Neural-Network-Visualizer
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` or `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## ▶️ Running Locally

Start development server:

```bash
npm run dev
```

The app will run locally at:

```bash
http://localhost:3000
```

---

## 📦 Available Scripts

### Start Development Server
```bash
npm run dev
```

Runs Express server using TSX.

---

### Build for Production
```bash
npm run build
```

Builds:
- Frontend using Vite
- Backend using ESBuild

Output generated in:

```bash
dist/
```

---

### Start Production Server
```bash
npm run start
```

Runs built production server.

---

### Preview Frontend
```bash
npm run preview
```

Preview Vite frontend.

---

### Type Checking
```bash
npm run lint
```

Runs TypeScript validation.

---

### Clean Build Files
```bash
npm run clean
```

Removes generated build files.

---

## 🧠 How It Works

1. User enters a conceptual prompt (e.g. `"AI recommendation system"`).
2. Request is sent to backend API.
3. Gemini API generates structured neural network data.
4. Backend parses AI response.
5. Nodes and synapses are returned.
6. Frontend renders a visual architecture.

---

## 🔌 API Endpoints

---

### 1. Generate Neural Network

#### POST `/api/generate-network`

Generates a custom neural network structure.

### Request Body

```json
{
  "prompt": "AI recommendation system"
}
```

### Example Response

```json
{
  "nodes": [
    {
      "id": "n1",
      "label": "Input Node",
      "layer": "Input",
      "layerIndex": 0,
      "description": "Initial processing layer",
      "x": -4.2,
      "y": 1.4,
      "z": 0.3
    }
  ],
  "synapses": [
    {
      "from": "n1",
      "to": "n2",
      "weight": 0.82
    }
  ]
}
```

---

### 2. Config Status

#### GET `/api/config-status`

Checks whether Gemini API key is configured.

### Response

```json
{
  "hasGeminiKey": true
}
```

---

## 🏗 Backend Architecture

The backend:
- Uses Express for API routing
- Validates user prompts
- Initializes Gemini API client
- Generates JSON-based neural architectures
- Handles production and development modes
- Serves frontend through Vite middleware in development
- Serves static build files in production

---

## 🎨 Frontend Responsibilities

The frontend is responsible for:
- Prompt input handling
- API communication
- Rendering node connections
- Displaying neural layers
- Interactive visualization
- Smooth animations
- User feedback states

---

## 🔐 Environment Variables

| Variable | Description |
|---------|---------|
| `GEMINI_API_KEY` | Gemini API authentication key |

---

## 📈 Future Improvements

Potential enhancements:
- Real-time neural pulse animations
- Drag & zoom 3D interaction
- Custom node editing
- Network export as JSON / SVG
- Save generated architectures
- Dark / Light theme toggle
- Neural performance simulation
- Better graph optimization
- User prompt history
- AI explanation for generated layers

---

## 🧪 Validation Rules

Prompt must:
- Be a valid string
- Not be empty
- Be concept-based

Generated network constraints:
- 15 to 45 nodes
- 20 to 50 synapses
- Structured layer progression
- 3D coordinates
- Organic but aligned architecture

---

## 🚀 Deployment

Build project:

```bash
npm run build
```

Start production server:

```bash
npm run start
```

Deployable on:
- Vercel
- Render
- Railway
- DigitalOcean
- AWS
- Any Node.js hosting environment

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push branch
5. Open pull request

---

## 📝 License

MIT License

---

## 👨‍💻 Author

Built for AI-powered neural architecture visualization using React, Vite, Express, and Gemini API.
