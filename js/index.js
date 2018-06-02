// Smooth scroll using jQuery with offset
$(document).ready(function(){
  const scroll_speed = 800;
  const target_offset = -70;
  $(".link-smooth").on('click', function(event) {
    let dest = $(this).attr("dest");
    if (dest !== "null") {
      $('html, body').animate({
        scrollTop: $('#' + dest).offset().top + target_offset
      }, scroll_speed);
    } else {
      throw "'dest' attribute not set";
    }
  });
});

// Smooth scroll native
// $(".link-smooth").on('click', function (event) {
//   let my_href = this.getAttribute('href').replace(/#/, "");
//   let element = document.getElementById(my_href);
//   console.log(my_href, element);
//   element.scrollIntoView({behavior: 'smooth', block: "start", inline: "nearest"});
// });
