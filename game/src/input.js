// Gobble Run — keyboard and mouse input, nothing else.
// One job: turn physical keys and clicks into game intents.
export class Input {
  constructor(canvas) {
    this.keys = new Set();
    this.pressed = new Set();
    this.clicks = [];
    this.canvas = canvas;
    window.addEventListener('keydown', (e) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
      if (!e.repeat) this.pressed.add(e.key.toLowerCase());
      this.keys.add(e.key.toLowerCase());
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.key.toLowerCase());
    });
    canvas.addEventListener('mousedown', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      this.clicks.push({ x, y });
    });
    window.addEventListener('blur', () => {
      this.keys.clear();
    });
  }

  held(...names) {
    return names.some((n) => this.keys.has(n));
  }

  wasPressed(...names) {
    return names.some((n) => this.pressed.has(n));
  }

  consumeClicks() {
    const out = this.clicks;
    this.clicks = [];
    return out;
  }

  endFrame() {
    this.pressed.clear();
  }
}

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}
