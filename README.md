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
| **Thrust** | `Up` Arrow Key | "THRUST" Touch Zone |
| **Tractor Beam** | `Space` Bar | "BEAM" Touch Zone |

### Mechanics
- **Physics**: Real-time Euler integration with gravity, thrust, inertia, and tethers.
- **Tractor Beam**: Activate when near the pod to tether it to your ship.
- **Fuel**: Every thrust and second of flight consumes fuel. Don't run dry!
- **Goal**: Navigate to the pod, attach it, and exit through the dotted circular portal.

---

## 🛠️ Technical Overview
- **Core**: Vanilla JavaScript (No Frameworks).
- **Graphics**: HTML5 Canvas with custom ShadowBlur "Neon Glow" rendering.
- **Responsive**: Fully playable on both Desktop (Keyboard) and Mobile (Touch).
- **Standalone**: Zero dependencies. Runs directly from `index.html`.

## 🚀 Deployment Instructions
If you are hosting this on **GitHub Pages**, follow these steps:
1.  Go to **Settings > Pages** in your repository.
2.  Under **Branch**, select `main` and click **Save**.
3.  Your game will be live at [robert2611.github.io/thrust-game/](https://robert2611.github.io/thrust-game/) in about a minute.

## 📜 License
MIT License. Feel free to fork and improve!
