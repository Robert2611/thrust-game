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
| **Tractor Beam** | Automatically attaches when landing near the pod (Level 1) | Automatic |

### Mechanics
- **Physics**: Real-time Euler integration with gravity, thrust, inertia, and tethering.
- **Traction**: Land near a pod to collect it.
- **Fuel**: Every thrust consumes fuel. Don't run dry!
- **Goal**: Navigate to the pod, collect it, and exit through the magenta portal.

---

## 🛠️ Technical Overview
The project has been refactored into a **Modular Architecture** to support testability and clean separation of concerns:
- **Models**: `Ship.js`, `Pod.js` manaing state.
- **Core Logic**: `GameEngine.js`, `PhysicsEngine.js` (headless/testable).
- **UI/IO**: `InputHandler.js`, `UIManager.js`, `Renderer.js`.
- **Modules**: Uses standard **ES Modules** (`import`/`export`).

## 🚀 Local Development
Because the game uses **ES Modules**, it cannot be opened directly via the `file://` protocol. You must serve it using a local web server:

```bash
# Using Node.js (npx)
npx serve .

# Using Python
python -m http.server 8000
```

## 🧪 Unit Testing
The game logic is now fully decoupled from the DOM and Canvas. You can easily integrate a test runner like **Vitest** or **Jest** to test the `GameEngine` or `PhysicsEngine` in isolation.

## 📦 Deployment
If you are hosting this on **GitHub Pages**, follow these steps:
1.  Go to **Settings > Pages** in your repository.
2.  Under **Branch**, select `main` and click **Save**.
3.  Your game will be live at [robert2611.github.io/thrust-game/](https://robert2611.github.io/thrust-game/) in about a minute.

## 📜 License
MIT License. Feel free to fork and improve!
