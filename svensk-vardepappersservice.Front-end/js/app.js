var listItems = document.querySelectorAll(".list-container");
listItems.forEach(function (item) {
  item.addEventListener("click", function () {
    window.location = item.querySelector(".button").href;
  });
});
