(() => {
  const conW = document.querySelector(".containerW");
  const conT = document.querySelector(".containerT");
  const conR = document.querySelector(".containerR");
  const conH = document.querySelector(".containerH");
  const conO = document.querySelector(".containerO");
  const conTT = document.querySelector(".containert");
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  function update() {
    const vh = innerHeight;
    const span = 2 * vh;
    const t = clamp(scrollY / span, 0, 1);

    const yContainerW = lerp(-vh, vh, t);
    const yContainerT = lerp(-vh, vh, t);
    const yContainerR = lerp(-vh, vh, t);
    const yContainerH = lerp(vh, -vh, t);
    const yContainerO = lerp(vh, -vh, t);
    const yContainert = lerp(vh, -vh, t);

    conW.style.setProperty("--y", `${yContainerW}px`);
    conT.style.setProperty("--y", `${yContainerT}px`);
    conR.style.setProperty("--y", `${yContainerR}px`);
    conH.style.setProperty("--y", `${yContainerH}px`);
    conO.style.setProperty("--y", `${yContainerO}px`);
    conTT.style.setProperty("--y", `${yContainert}px`);
  }

  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        update();
      });
    }
  };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll, { passive: true });
  update();
})();

// const redButton = document.querySelector(".redbutton");

document.querySelectorAll(".buttonWithText").forEach((form) => {
  const slider = form.querySelector(".slider");
  const toggle = form.querySelector(".toggle");
  const input = form.querySelector(".input");

  function expand() {
    slider.classList.add("expanded");
    setTimeout(() => input.focus(), 500);
  }

  function collapse() {
    slider.classList.remove("expanded");
    input.blur();
  }

  toggle.addEventListener("click", expand);

  input.addEventListener("blur", () => {
    setTimeout(collapse, 100);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log("New input:", input.value);
    collapse();
  });
});
