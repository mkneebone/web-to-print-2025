(function () {
  const root = document.documentElement;
  const grid = document.getElementById("grid");

  const PALETTE = ["red", "blue", "yellow", "springgreen"];

  const readNumVar = (name) =>
    Number(getComputedStyle(root).getPropertyValue(name).trim());
  const ROWS = readNumVar("--rows");
  const COLS = readNumVar("--cols");
  const GAP = readNumVar("--gap");

  const idx = (r, c) => (r - 1) * COLS + (c - 1);
  let cells = [];

  const state = {
    small: null,
    medium: null,
    large: null,
  };
  let currentBP = null;

  function breakpoint() {
    const w = window.innerWidth;
    if (w >= 1000) return "large";
    if (w >= 600) return "medium";
    return "small";
  }

  function buildGrid() {
    const frag = document.createDocumentFragment();
    for (let i = 0; i < ROWS * COLS; i++) {
      const d = document.createElement("div");
      d.className = "cell";
      d.setAttribute("role", "gridcell");
      d.setAttribute("tabindex", "0");
      frag.appendChild(d);
    }
    grid.appendChild(frag);
    cells = Array.from(grid.children);
  }

  function layout() {
    const usableW = window.innerWidth - 2 * GAP;
    const usableH = window.innerHeight - 2 * GAP;
    const fitW = Math.floor((usableW - GAP * (COLS - 1)) / COLS);
    const fitH = Math.floor((usableH - GAP * (ROWS - 1)) / ROWS);
    const cell = Math.max(1, Math.max(fitW, fitH));
    root.style.setProperty("--cell", `${cell}px`);
  }

  function parsePattern() {
    const raw = getComputedStyle(root)
      .getPropertyValue("--pattern")
      .trim()
      .replace(/['"]/g, "");
    if (!raw) return new Set();
    const coords = raw
      .split(/\s+/)
      .map((pair) => {
        const [r, c] = pair.split(",").map(Number);
        return Number.isFinite(r) && Number.isFinite(c) ? idx(r, c) : null;
      })
      .filter((v) => v !== null);
    return new Set(coords);
  }

  function initStateFromPattern() {
    const arr = new Uint8Array(ROWS * COLS);
    const onSet = parsePattern();
    onSet.forEach((i) => {
      if (i >= 0 && i < arr.length) arr[i] = 1;
    });
    return arr;
  }

  function render() {
    const arr = state[currentBP];
    if (!arr) return;
    cells.forEach((el, i) => {
      const colorIndex = arr[i];
      if (colorIndex === 0) {
        el.style.backgroundColor = "";
      } else {
        el.style.backgroundColor = PALETTE[colorIndex - 1] || PALETTE[0];
      }
    });
  }

  function cycleCell(i, dir = 1) {
    const arr = state[currentBP];
    const max = PALETTE.length;
    const next = (arr[i] + dir + (max + 1)) % (max + 1);
    arr[i] = next;
    if (next === 0) cells[i].style.backgroundColor = "";
    else cells[i].style.backgroundColor = PALETTE[next - 1] || PALETTE[0];
  }

  function ensureStateFor(bp) {
    if (!state[bp]) state[bp] = initStateFromPattern();
    currentBP = bp;
  }

  buildGrid();
  layout();
  ensureStateFor(breakpoint());
  render();

  window.addEventListener("resize", () => {
    layout();
    const bp = breakpoint();
    if (bp !== currentBP) {
      ensureStateFor(bp);
    }
    render();
  });

  grid.addEventListener("click", (e) => {
    if (!e.target.classList.contains("cell")) return;
    const i = cells.indexOf(e.target);
    if (i >= 0) cycleCell(i, +1);
  });

  window.exportColoredPattern = () => {
    const arr = state[currentBP];
    const out = { off: [] };
    for (let ci = 1; ci <= PALETTE.length; ci++) out["c" + ci] = [];
    for (let i = 0; i < arr.length; i++) {
      const r = Math.floor(i / COLS) + 1;
      const c = (i % COLS) + 1;
      const val = arr[i];
      if (val === 0) out.off.push(`${r},${c}`);
      else out["c" + val].push(`${r},${c}`);
    }
    console.log(out);
    return out;
  };

  window.resetToCssPattern = () => {
    state[currentBP] = initStateFromPattern();
    render();
  };
})();
