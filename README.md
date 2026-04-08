# Thrust: Neon Edition 🚀

> [!TIP]
> **✨ This repository is Vibe Coded.**

A high-fidelity 2D physics game inspired by the classic "Thrust". Navigate your ship through treacherous caves, retrieve the heavy pod using your tractor beam, and escape the cavern before you run out of fuel.

## 🕹️ [Play Directly on GitHub Pages](https://robert2611.github.io/thrust-game/)

---

## 🎮 How to Play

### Controls
| Action | Keyboard | Mobile/Touch |
| :--- | :--- | :--- |
| **Rotate** | `Left` / `Right` Arrow Keys | Left/Right Touch Zones |
| **Thrust** | `Up` Arrow Key | Central "THRUST" Zone |
| **Tractor Beam** | Automatically attaches when landing near the pod | Automatic |

### Mechanics
- **Physics**: Real-time Euler integration with gravity, thrust, inertia, and tethering.
- **Traction**: Land near a pod to collect it.
- **Fuel**: Every thrust consumes fuel. Don't run dry!
- **Goal**: Navigate to the pod, collect it, and exit through the magenta portal.

---

## 🛠️ Technical Overview
The project is built with **TypeScript** and **Vite**, using a modular architecture for clean separation of concerns:
- **Models**: `Ship.ts`, `Pod.ts` managing state.
- **Core Logic**: `GameEngine.ts`, `PhysicsEngine.ts` (headless/testable).
- **UI/IO**: `InputHandler.ts`, `UIManager.ts`, `Renderer.ts`.
- **Bundling**: Powered by **Vite** for fast development and optimized production builds.

## 🚀 Local Development

To run the game locally for development:

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   The game will be available at `http://localhost:5173`.

## 📦 Deployment

The game is automatically deployed to **GitHub Pages** on every push to the `main` branch.

> [!IMPORTANT]
> **Setup Requirement**:
> Ensure your repository is configured to use **GitHub Actions** as the deployment source:
> 1. Go to **Settings > Pages**.
> 2. Under **Build and deployment > Source**, select **"GitHub Actions"**.

## 📜 License
MIT License. Feel free to fork and improve!
