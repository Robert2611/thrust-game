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
| **Level Editor** | `Alt + E` (Dev Mode) | N/A |

### Mechanics
- **Physics**: Real-time Euler integration with gravity, thrust, inertia, and tethering.
- **Traction**: Land near a pod to collect it.
- **Goal**: Navigate to the pod, collect it, and exit through the magenta portal.

---

## 🚀 Development & Local Setup

### Installation
1. **Clone the repo** and install dependencies:
   ```bash
   npm install
   ```
2. **Start the dev server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` to play.

### 🛠️ Built-in Level Editor
For developers, the game includes a robust visual level editor to modify terrain and entity layouts in real-time.

- **Toggle Editor**: Press `Alt + E` to enter/exit Edit Mode.
- **Universal Dragging**: Click and drag any handle to reposition items. All items snap to a 10px grid.
  - 🟢 **Green**: Ship Start
  - 🔵 **Blue**: Pod Start
  - 🟣 **Magenta**: Exit Portal
  - 🟡 **Yellow**: Platforms
  - 🟠 **Orange**: Fans
  - 🔵 **Cyan**: Terrain Polygon Vertices
- **Geometric Editing**:
  - **Add Vertex**: Click on any terrain line segment to split it and insert a new point.
  - **Remove Vertex**: `Ctrl + Click` a cyan vertex handle.
  - **Delete Entity/Shape**: `Ctrl + Shift + Click` any handle to remove the entire object (Fan, Platform, or Polygon).
- **Creation**: Use the **"ADD POLYGON"** button to spawn new terrain shapes.
- **Pan View**: Click and drag on empty background space to move the camera.
- **Export**: Click **"EXPORT CODE"** to generate formatted TypeScript for `src/data/levels.ts`.

> [!IMPORTANT]
> **Mandatory Build Check**: Before committing changes, always run `npm run build`. 
> This project has strict TypeScript rules (`noUnusedLocals`) enabled, and a full compilation is required to pass the CI/CD deployment pipeline.

---

## 🛠️ Technical Overview
Built with **TypeScript** and **Vite**, using a modular architecture:
- **Models**: `Ship.ts`, `Pod.ts` (stateful entities).
- **Core Engine**: `PhysicsEngine.ts`, `CollisionDetector.ts` (pure logic & testable).
- **UI/Rendering**: `Renderer.ts`, `UIManager.ts`.
- **Tests**: Comprehensive unit test suite with **Vitest**.

## 📦 Deployment
The game is automatically deployed to **GitHub Pages** via GitHub Actions on every push to `main`.

## 📜 License
MIT License.
