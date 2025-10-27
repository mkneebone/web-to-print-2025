const image = document.querySelector(".image");
let index = 0;
let brightness = 100;

image.addEventListener("click", () => {
  image.style.filter = `brightness(${brightness}%)`;

  index = index + 10;
  brightness = brightness + 10;

  if (index >= 360) {
    index = 0;
  }
  if (brightness >= 200) {
    brightness = 100;
  }
});
