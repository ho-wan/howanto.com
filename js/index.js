// wait for base elements in DOM ready (does not include load() elements)
$(document).ready(function () {
  // removes # when page loads
  removeHash();
  // wait for images and load functions to complete before using getElement.
  window.onload = function () {
    removeHash();

    // Smooth scroll using jQuery with offset
    const scroll_speed = 800;
    const target_offset = -70;
    $(".link-smooth").on('click', function (event) {
      const my_path = window.location.pathname;
      const dest = $(this).attr("dest");
      if (my_path === "/" || my_path === "/index.html") {
        if (dest !== "null") {
          $('html, body').animate({
            scrollTop: $('#' + dest).offset().top + target_offset
          }, scroll_speed);
        } else {
          throw "'dest' attribute not set";
        };
        return false;
      };
    });
    // end on click
  };
});

function removeHash() {
  history.replaceState(null, null, ' ');
}