# 🧠 EIS Mental Math — Who Has the Biggest Brain?

[![GitHub Pages](https://img.shields.io/badge/Live-GitHub%20Pages-brightgreen)](https://mohammedamy.github.io/biggest-brain-game/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A competitive mental math game built for **Edugates International School** students. Race against the clock across 7 brain-bending categories and prove you have the biggest brain!

🎮 **[Play Now →](https://mohammedamy.github.io/biggest-brain-game/)**

---

## ✨ Features

- 🏆 **7 unique brain challenge categories** with 45 seconds each
- 🎯 **Competition Mode** — shared code ensures all players get identical questions
- 📊 **Local leaderboard** with CSV export for teachers
- 🔥 **Streak bonuses** — 3, 5, 10+ correct in a row for bonus points
- 📖 **Wrong answer review** — learn from your mistakes after each game
- 🎵 **Procedural music & SFX** powered by Tone.js
- ♿ **Accessibility** — Big Text, Text-to-Speech
- 📱 **Mobile-first** responsive design
- 🌐 **Offline support** via Service Worker
- ⏸️ **Tab pause** — timer freezes when you switch tabs

---

## 🎮 Game Categories

| # | Category | Icon | Description |
|---|----------|------|-------------|
| 1 | **Calculate** | 🧮 | Solve math problems: addition, subtraction, multiplication, mixed operations, and missing operands |
| 2 | **Memorize** | 🧠 | Remember and replay sequences of 3–7 digits |
| 3 | **Analyze** | 🔍 | Find the next number in a pattern (arithmetic, geometric, quadratic sequences) |
| 4 | **Visualize** | 🧊 | Count 3D isometric cubes — including hidden ones! Features 8 textured themes |
| 5 | **Weigh** | ⚖️ | Determine the heaviest object using balance scale clues |
| 6 | **Count Up** | 🎯 | Tap dancing, spinning numbers in ascending order |
| 7 | **React** | ⚡ | Stroop test — identify the ink color, not the word |

---

## 🏅 Rank System

Progress through 8 ranks based on your total score:

| Score | Rank | Icon |
|-------|------|------|
| 0+ | Amoeba | 🦠 |
| 200+ | Goldfish | 🐠 |
| 400+ | Rabbit | 🐰 |
| 650+ | Dolphin | 🐬 |
| 900+ | Owl | 🦉 |
| 1200+ | Elephant | 🐘 |
| 1600+ | Einstein | 😼 |
| 2000+ | Galaxy Brain | 🌌 |

---

## 🎯 How to Play

1. Enter your name (and optionally your class/group)
2. Choose a game mode:
   - **Play All Categories** — tackle all 7 categories in sequence
   - **Competition Mode** — enter a shared code for fair competition
   - **Practice** — play any single category
3. Answer as many questions as you can in 45 seconds per category
4. Build streaks for bonus points!
5. Review wrong answers and check the leaderboard

---

## 🏆 Setting Up a Competition

1. **Choose a code** (e.g., `EIS2026`) — share it with all participants
2. Each player clicks **🏆 Competition Mode** and enters the same code
3. The seeded random number generator ensures **everyone gets identical questions**
4. After all players finish, view the **📊 Leaderboard** for results
5. Click **📥 CSV** to export scores to a spreadsheet

> **Tip:** Use the Group/Class field to organize scores by classroom!

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (no frameworks)
- **Audio:** [Tone.js](https://tonejs.github.io/) for procedural music & sound effects
- **Fonts:** [Fredoka](https://fonts.google.com/specimen/Fredoka) + [Nunito](https://fonts.google.com/specimen/Nunito) via Google Fonts
- **Deployment:** GitHub Pages (static site)
- **Offline:** Service Worker with cache-first strategy

---

## 📁 Project Structure

```
biggest-brain-game/
├── index.html              # HTML shell
├── sw.js                   # Service worker for offline support
├── css/
│   ├── main.css            # Core layout, typography, variables
│   ├── components.css      # Buttons, cards, game UI components
│   ├── animations.css      # All @keyframes animations
│   └── responsive.css      # Media queries for different screen sizes
├── js/
│   ├── config.js           # Constants & category definitions
│   ├── state.js            # Game state & utility functions
│   ├── audio.js            # Music engine & sound effects (Tone.js)
│   ├── ui.js               # DOM helpers & UI effects
│   ├── preferences.js      # Accessibility settings (Big Text, TTS)
│   ├── game.js             # Core game loop & flow control
│   ├── leaderboard.js      # Scores display & CSV export
│   └── categories/
│       ├── calculate.js    # Math operations category
│       ├── memorize.js     # Digit sequence memory
│       ├── analyze.js      # Number pattern recognition
│       ├── visualize.js    # 3D isometric cube counting
│       ├── weigh.js        # Balance scale deduction
│       ├── countup.js      # Ascending order tap game
│       └── react.js        # Stroop color test
├── assets/
│   └── eis-logo.jpg        # School logo
└── README.md
```

---

## 🚀 Development

### Running Locally

No build step required! Just open `index.html` in a browser, or use a local server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx serve .

# Using PHP
php -S localhost:8080
```

Then visit `http://localhost:8080`

### Deploying to GitHub Pages

1. Fork or clone this repository
2. Go to **Settings → Pages**
3. Set source to **main** branch, root directory
4. Your game will be live at `https://<username>.github.io/biggest-brain-game/`

---

## 🤝 Contributing

Contributions are welcome! Here are some ways to help:

- 🐛 Report bugs by opening an issue
- 💡 Suggest new categories or features
- 🌍 Add translations for different languages
- ♿ Improve accessibility
- 📝 Improve documentation

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with ❤️ for <strong>Edugates International School</strong>
</p>
