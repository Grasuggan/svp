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

/*======================================
      #Full Search
    ======================================*/
var body = document.body;
(function () {
  var searchInput = document.querySelector(".search__input");
  var pager = document.querySelector(".search-pagination-container button");
  if (searchInput) {
    //Preform search on page load
    doFullSearch(searchInput.value, 10);
    //Preform search on input change
    searchInput.addEventListener("input", function (e) {
      doFullSearch(searchInput.value, 10);
      document.querySelector(".query").innerHTML =
        '"' + searchInput.value + '"';
    });
    //pager
    pager.addEventListener("click", function (e) {
      pager.dataset.currentPage = (
        pager.dataset.currentPage ? parseInt(pager.dataset.currentPage) + 1 : 2
      ).toString();
      doFullSearch(searchInput.value, parseInt(pager.dataset.currentPage));
    });
  }
})();
function doFullSearch(query, page) {
  var resultLabelSingle = document.querySelector(
    ".search-results-count-label.single"
  );
  var resultLabelMultible = document.querySelector(
    ".search-results-count-label.multi"
  );
  var resultLabelCount = document.querySelector(".search-results-count");
  var resultLabelQuery = document.querySelector(
    ".search-result-info strong.query"
  );
  var searchEmpty = document.querySelector(".search-empty");
  var pager = document.querySelector(".search-pagination-container");
  /*var amountPerPageElement = document.querySelector(".search-pagination-amount");*/
  var amountPerPage = 10;

  axios({
    url:
      "/Umbraco/Api/Search/GetSearch?Query=" +
      query +
      "&Amount=" +
      amountPerPage +
      "&Page=" +
      page +
      "&SiteId=" +
      body.dataset.siteid +
      "&Culture=" +
      body.dataset.culture +
      "&ExtendedModel=true",
    method: "GET",
  })
    .then(function (response) {
      if (response.data.ResultCount == 1) {
        resultLabelSingle.style.display = "inline-block";
        resultLabelMultible.style.display = "none";
      } else {
        resultLabelMultible.style.display = "inline-block";
        resultLabelSingle.style.display = "none";
      }
      resultLabelCount.textContent = '"' + query + '"';
      resultLabelCount.textContent = response.data.ResultCount;
      // No results
      if (response.data.ResultCount == 0) {
        searchEmpty.style.display = "block";
        document
          .querySelectorAll(".search-result, .search-result-container")
          .forEach(function (e) {
            return e.remove();
          });
        pager.style.display = "none";
      } else {
        searchEmpty.style.display = "none";
        if (page == 1) {
          document
            .querySelectorAll(".search-result, .search-result-container")
            .forEach(function (e) {
              return e.remove();
            });
        }
        var template = document.querySelector(".search-results template");
        for (var i = 0; i < response.data.Result.length; i++) {
          var clone = template.content.cloneNode(true);
          var listContainer = clone.querySelector(".search-result");
          if (response.data.Result[i].Alias == "document") {
            listContainer.classList.add("files");
            var listInnerContainer = document.createElement("div");
            listInnerContainer.className = "list-container__content";
            var preHead = document.createElement("div");
            preHead.className = "pre-head";
            var heading = document.createElement("h2");
            var desc = document.createElement("p");
            var downloadLink = document.createElement("a");
            downloadLink.className = "file-container";

            var downLoadImg = document.createElement("img");

            listContainer.appendChild(listInnerContainer);
            listContainer.appendChild(downloadLink);

            listInnerContainer.appendChild(preHead);
            listInnerContainer.appendChild(heading);
            listInnerContainer.appendChild(desc);

            downloadLink.appendChild(downLoadImg);

            var fileUrl = response.data.Result[i].UploadFile;
            var suffix = fileUrl.substring(fileUrl.lastIndexOf(".") + 1);

            /*var downladLink = clone.querySelector("a");*/
            downloadLink.setAttribute("href", fileUrl);
            downloadLink.setAttribute("download", "download");
            if (
              suffix == "doc" ||
              suffix == "pdf" ||
              suffix == "pptx" ||
              suffix == "xlsx"
            ) {
              var imgsrc = "/assets/Icons/file-" + suffix + ".svg";
              downLoadImg.setAttribute("src", imgsrc);
            } else if (
              suffix == "txt" ||
              suffix == "odt" ||
              suffix.includes("doc")
            ) {
              downLoadImg.setAttribute("src", "/assets/Icons/file-doc.svg");
            } else if (suffix.includes("xl")) {
              downLoadImg.setAttribute("src", "/assets/Icons/file-xlsx.svg");
            } else if (
              suffix.includes("pp") ||
              suffix.includes("tif") ||
              suffix.includes("odp")
            ) {
              downLoadImg.setAttribute("src", "/assets/Icons/file-xlsx.svg");
            } else {
              downLoadImg.setAttribute("src", "/assets/Icons/file-pdf.svg");
            }

            preHead.textContent = response.data.Result[i].Date;
            heading.textContent = response.data.Result[i].Title;
            desc.textContent = response.data.Result[i].Description;
            //clone.querySelector("img").setAttribute("src", "/assets/img/download.png" + "?width=100");
            //clone.querySelector("a").setAttribute("href", response.data.Result[i].Url);
          } else {
            var listInnerContainer = document.createElement("a");
            listInnerContainer.className = "list-container__content col-65";
            var preHead = document.createElement("div");
            preHead.className = "pre-head";
            var heading = document.createElement("h2");
            var desc = document.createElement("p");
            var btn = document.createElement("div");
            btn.className = "button-container";
            var linkToSite = document.createElement("a");

            if (response.data.Result[i].Alias == "contact") {
              var url = response.data.Result[i].Url;
              var urlS = url.toString().split("/");
              var lastWord = urlS[urlS.length - 2];
              var newPath = url.substring(0, url.lastIndexOf(lastWord));

              linkToSite.setAttribute("href", newPath);
              listInnerContainer.setAttribute("href", newPath);
            } else {
              linkToSite.setAttribute("href", response.data.Result[i].Url);
              listInnerContainer.setAttribute(
                "href",
                response.data.Result[i].Url
              );
            }

            var linkToSiteImg = document.createElement("img");
            linkToSiteImg.setAttribute("src", "/assets/Icons/ctrl-right.svg");

            listContainer.appendChild(listInnerContainer);
            listContainer.appendChild(btn);

            listInnerContainer.appendChild(preHead);
            listInnerContainer.appendChild(heading);
            listInnerContainer.appendChild(desc);

            btn.appendChild(linkToSite);
            linkToSite.appendChild(linkToSiteImg);

            if (
              response.data.Result[i].MetaTitle != null &&
              response.data.Result[i].MetaTitle != ""
            ) {
              heading.textContent = response.data.Result[i].MetaTitle;
            } else {
              heading.textContent = response.data.Result[i].Title;
            }

            if (
              response.data.Result[i].MetaDescription != null &&
              response.data.Result[i].MetaDescription != ""
            ) {
              desc.textContent = response.data.Result[i].MetaDescription;
            } else if (
              response.data.Result[i].Description != "" &&
              response.data.Result[i].Description != null
            ) {
              desc.textContent = response.data.Result[i].Description;
            } else if (
              response.data.Result[i].Summary != "" &&
              response.data.Result[i].Summary != null
            ) {
              desc.textContent = response.data.Result[i].Summary;
            }

            if (
              response.data.Result[i].Role != "" &&
              response.data.Result[i].Role != null
            ) {
              var role = document.createElement("p");
              role.textContent = response.data.Result[i].Role;
              listInnerContainer.appendChild(role);
            }
            if (
              response.data.Result[i].DirectNumber != "" &&
              response.data.Result[i].DirectNumber != null
            ) {
              var dn = document.createElement("p");
              dn.textContent = response.data.Result[i].DirectNumber;
              listInnerContainer.appendChild(dn);
            }
            if (
              response.data.Result[i].GroupNumber != "" &&
              response.data.Result[i].GroupNumber != null
            ) {
              var gn = document.createElement("p");
              gn.textContent = response.data.Result[i].GroupNumber;
              listInnerContainer.appendChild(gn);
            }
            if (
              response.data.Result[i].Email != "" &&
              response.data.Result[i].Email != null
            ) {
              var em = document.createElement("p");
              em.textContent = response.data.Result[i].Email;
              listInnerContainer.appendChild(em);
            }

            //clone.querySelector("h3").textContent = response.data.Result[i].Title;
            //clone.querySelector("p").textContent = response.data.Result[i].Description;
          }

          template.parentElement.appendChild(clone);
        }
        if (
          document.querySelectorAll(".search-result, .search-result-container")
            .length < response.data.ResultCount
        ) {
          pager.style.display = "block";
        } else {
          pager.style.display = "none";
        }
      }
      resultLabelCount.innerHTML = response.data.ResultCount;
    })
    ["catch"](function () {});
}
