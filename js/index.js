// wait for base elements in DOM ready (does not include load() elements)
$(document).ready(function () {
  // wait for images and load functions to complete before using getElement.
  window.onload = function () {
    // Smooth scroll using jQuery with offset
    const scroll_speed = 800;
    const target_offset = -70;
    $(".link-smooth").on('click', function (event) {
      console.log("link clicked.")
      let dest = $(this).attr("dest");
      if (dest !== "null") {
        $('html, body').animate({
          scrollTop: $('#' + dest).offset().top + target_offset
        }, scroll_speed);
      } else {
        throw "'dest' attribute not set";
      };
    });
    // end smooth scroll
  };
});
