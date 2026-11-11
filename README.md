# 🏏 Cricket Rush — Chase Edition

A streamlined, 3D browser cricket game focused exclusively on **Chase Mode** — step up to the crease in a floodlit 3D stadium and chase down custom targets before your deliveries or wickets run out.

## 🚀 Quick Launch

Double-click `play.bat`, or run from a terminal:

```powershell
python run_game.py
```

Then open:

```
http://localhost:8080/index.html
```

## 🎯 Chase Mode

1. Click **PLAY CHASE** on the homepage.
2. Choose a preset or enter custom values:
   - **Target Runs**: `1` – `500` (default `50`)
   - **Available Balls**: `1` – `300` (default `30`)
3. Pick **Bowling Difficulty** (`Easy`, `Medium`, `Hard`) and **Graphics Quality** (`Low (2D)`, `Medium`, `High (3D)`), then click **START CHASE**.

### Presets

| Preset | Target | Balls |
| :--- | :--- | :--- |
| Easy | 20 | 30 |
| Medium | 50 | 30 |
| Hard | 100 | 30 |
| Expert | 100 | 12 |
| Extreme | 200 | 24 |

## 🎮 Batting Controls

- **Tap / `Space` / `Enter`**: Play shot / sprint between wickets
- **Swipe Left / `A` / `←`**: Off-side stance (Cover Drive / Cut)
- **Swipe Up / `W` / `↑`**: Straight stance (Straight / Lofted Drive)
- **Swipe Right / `D` / `→`**: Leg-side stance (Pull / Flick)
- **Swipe Down / `S` / `↓`**: Defensive block
- **`Esc`**: Pause / Resume match

## 🏆 Match Outcomes

- **VICTORY**: Reach or exceed the target within the available balls (including on the final ball).
- **DEFEAT**: Exhaust all available balls before reaching the target.
- **ALL OUT**: Lose all 10 wickets before reaching the target.
