let z = 1;
$(".box")
  .draggable({
    containment: ".container", // stay within container. Comment this line out and comment out "overflow: hidden" on container in CSS to remove this constraint.
    start: function () {
      $(this).css("z-index", ++z);
    },
  })
  .on("mouseover", function () {
    // hover (without dragging) also brings elements forward.
    $(this).css("z-index", ++z);
  });
