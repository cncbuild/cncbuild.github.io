# Spellaunch

A 2D spelling shooter: move your spaceship and shoot letters in the sky in the right order to spell the word.

## How to play

1. Open `index.html` in a web browser (double-click or drag into Chrome, Edge, Firefox, etc.).
2. Click **Launch** to start.
3. The target word is shown at the start of each stage, then fades out over 4 seconds.
4. Use **←** **→** or **A** **D** to move. **Space** or **click** (bottom of screen) to fire.
5. Shoot the letters in the correct order to fill the blanks at the top.
6. When all blanks are filled, the game checks your spelling. Correct = next stage; wrong = lose one energy vial and retry the stage.
7. You have 3 energy vials. Game over when you misspell with no vials left.

## Files

- `index.html` — Page and canvas
- `styles.css` — Layout and HUD
- `game.js` — Game logic (ship, lasers, letters, stages, win/lose)

No build step required.
