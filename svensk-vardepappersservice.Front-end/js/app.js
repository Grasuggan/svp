var listItems = document.querySelectorAll(".list-container");
listItems.forEach(function (item) {
  item.addEventListener("click", function () {
    window.location = item.querySelector(".button").href;
  });
});

var mobileNav = document.querySelector(".mobile-nav");

mobileNav.addEventListener("click", function (e) {
  e.preventDefault();
  mobileNav.classList.toggle("mobile-nav-open");
});
