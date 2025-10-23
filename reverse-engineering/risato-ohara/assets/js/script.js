(() => {
  const block = document.querySelector(".block-container");

  const SPEED = 0.6;
  const GAP = 0;

  let cycle = 0;
  let vw = 0;
  function measure() {
    const prev = block.style.transform;
    block.style.transform = "translate(0, -50%)";
    cycle = block.offsetWidth + GAP;
    vw = window.innerWidth;
    block.style.transform = prev;
  }

  let total = 0;
  let prevY = window.scrollY;

  function update() {
    if (!cycle) return;

    const y = window.scrollY;
    const dy = y - prevY;
    prevY = y;
    total += dy;

    const span = vw + cycle;

    const prog = (((total * SPEED) % span) + span) % span;
    const x = vw - prog;

    block.style.transform = `translate(${x}px, -50%)`;

    const max = document.documentElement.scrollHeight - window.innerHeight;
    const buffer = 200;
    if (y < buffer || y > max - buffer) {
      const mid = Math.floor(max / 2);
      window.scrollTo(0, mid);
      prevY = mid;
    }
  }

  measure();
  update();
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", () => {
    measure();
    update();
  });

  const mq = matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener?.("change", () => {
    if (mq.matches) block.style.transform = "translate(0, -50%)";
    else {
      measure();
      update();
    }
  });
})();
