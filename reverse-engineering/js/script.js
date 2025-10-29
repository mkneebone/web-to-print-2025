const puzzleImage =
  "https://petscare-assets-prod.s3.amazonaws.com/media/original_images/deer-head-chihuahua-alert-wooden-floor-47283.webp";

const els = {
  board: document.getElementById("board"),
  trayLeft: document.getElementById("trayLeft"),
  trayRight: document.getElementById("trayRight"),
  win: document.getElementById("win"),
  reshuffle: document.getElementById("reshuffle"),
  swapToggle: document.getElementById("swapToggle"),
};

const cols = 4;
const rows = 3;
let imgUrl = puzzleImage;

// Utilities
const shuffle = (a) =>
  a
    .map((v) => [Math.random(), v])
    .sort((x, y) => x[0] - y[0])
    .map((v) => v[1]);

function px(n) {
  return `${Math.round(n)}px`;
}

function readGap() {
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--gap")
    .trim();
  return parseFloat(v || "10");
}

// Sync the cell size so TRAYS and BOARD use IDENTICAL squares
function syncCellSize() {
  const gap = readGap();
  const w = els.board.clientWidth; // available inner width of the board panel
  const cell = Math.floor((w - (cols - 1) * gap) / cols);
  document.documentElement.style.setProperty("--cell-px", px(cell));
}

function makeTile(index) {
  const r = Math.floor(index / cols);
  const c = index % cols;
  const tile = document.createElement("div");
  tile.className = "tile";
  tile.draggable = true;
  tile.id = `tile-${index}`;
  tile.dataset.index = index; // correct position index
  // background slice
  const x = (c / (cols - 1)) * 100;
  const y = (r / (rows - 1)) * 100;
  tile.style.backgroundImage = `url("${imgUrl}")`;
  tile.style.backgroundPosition = `${x}% ${y}%`;
  tile.setAttribute("aria-label", `Tile ${index + 1}`);
  return tile;
}

function makeBoardCell(targetIndex) {
  const dz = document.createElement("div");
  dz.className = "dropzone board-cell";
  dz.dataset.target = targetIndex; // where the correct tile index should go
  return dz;
}

function makeTrayCell() {
  const dz = document.createElement("div");
  dz.className = "dropzone tray-cell";
  return dz;
}

function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function build() {
  document.documentElement.style.setProperty("--cols", cols);
  document.documentElement.style.setProperty("--rows", rows);
  els.win.classList.remove("show");

  // Prepare equal cell size first
  syncCellSize();

  // Build board cells
  clear(els.board);
  clear(els.trayLeft);
  clear(els.trayRight);
  const total = cols * rows; // 12
  for (let i = 0; i < total; i++) els.board.appendChild(makeBoardCell(i));

  // Build trays with 2×3 each (6 cells + 6 cells)
  for (let i = 0; i < 6; i++) els.trayLeft.appendChild(makeTrayCell());
  for (let i = 0; i < 6; i++) els.trayRight.appendChild(makeTrayCell());

  // Build & shuffle tiles, then split into left/right trays
  const order = shuffle([...Array(total).keys()]);
  const leftCells = [...els.trayLeft.querySelectorAll(".dropzone")];
  const rightCells = [...els.trayRight.querySelectorAll(".dropzone")];

  order
    .slice(0, 6)
    .forEach((idx, i) => leftCells[i].appendChild(makeTile(idx)));
  order.slice(6).forEach((idx, i) => rightCells[i].appendChild(makeTile(idx)));

  wireDnD();
}

// Drag and drop
const dragKey = "text/plain";
const getZone = (el) => el && el.closest && el.closest(".dropzone");

function onDragStart(e) {
  const t = e.target.closest(".tile");
  if (!t) return;
  e.dataTransfer.setData(dragKey, t.id);
  e.dataTransfer.effectAllowed = "move";
}

function onDragOver(e) {
  const z = getZone(e.target);
  if (!z) return;
  e.preventDefault();
  const occupied = !!z.querySelector(".tile");
  const allowSwap = document.getElementById("swapToggle").checked;
  e.dataTransfer.dropEffect = !occupied || allowSwap ? "move" : "none";
}

function onDragEnter(e) {
  const z = getZone(e.target);
  if (!z) return;
  z.classList.add("active");
}

function onDragLeave(e) {
  const z = getZone(e.target);
  if (!z) return;
  const to = e.relatedTarget && getZone(e.relatedTarget);
  if (to !== z) z.classList.remove("active");
}

function onDrop(e) {
  e.preventDefault();
  const z = getZone(e.target);
  if (!z) return;
  const id = e.dataTransfer.getData(dragKey);
  const incoming = document.getElementById(id);
  if (!incoming) return;

  const occupiedTile = z.querySelector(".tile");
  const allowSwap = document.getElementById("swapToggle").checked;

  if (occupiedTile && !allowSwap) {
    z.classList.remove("active");
    return;
  }

  if (occupiedTile && allowSwap) {
    const srcZone = incoming.parentElement.closest(".dropzone");
    if (srcZone) {
      srcZone.appendChild(occupiedTile);
      srcZone.classList.toggle("occupied", !!srcZone.querySelector(".tile"));
    }
  }

  z.appendChild(incoming);
  document
    .querySelectorAll(".dropzone")
    .forEach((cell) =>
      cell.classList.toggle("occupied", !!cell.querySelector(".tile"))
    );
  z.classList.remove("active");
  checkWin();
}

function wireDnD() {
  // Tiles
  document
    .querySelectorAll(".tile")
    .forEach((t) => t.addEventListener("dragstart", onDragStart));
  // Dropzones (board & trays)
  document.querySelectorAll(".dropzone").forEach((z) => {
    z.addEventListener("dragover", onDragOver);
    z.addEventListener("dragenter", onDragEnter);
    z.addEventListener("dragleave", onDragLeave);
    z.addEventListener("drop", onDrop);
  });
  // Occupied tiles
  document
    .querySelectorAll(".dropzone")
    .forEach((cell) =>
      cell.classList.toggle("occupied", !!cell.querySelector(".tile"))
    );
}

function checkWin() {
  const boardCells = [...document.querySelectorAll(".board .dropzone")];
  for (const cell of boardCells) {
    const t = cell.querySelector(".tile");
    if (!t) {
      document.getElementById("win").classList.remove("show");
      return;
    }
    if (t.dataset.index !== cell.dataset.target) {
      document.getElementById("win").classList.remove("show");
      return;
    }
  }
  document.getElementById("win").classList.add("show");
}

// Controls
document.getElementById("reshuffle").addEventListener("click", build);

// Initialize and resize so tray and board cells always match
window.addEventListener("resize", () => {
  syncCellSize();
});
build();
