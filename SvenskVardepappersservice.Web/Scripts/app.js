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
        doFullSearch(searchInput.value, 1);
        //Preform search on input change
        searchInput.addEventListener("input", function (e) {
            doFullSearch(searchInput.value, 1);
            document.querySelector(".query").innerHTML = '"' + searchInput.value + '"';
        });
        //pager
        pager.addEventListener("click", function (e) {
            pager.dataset.currentPage = (pager.dataset.currentPage ? parseInt(pager.dataset.currentPage) + 1 : 2).toString();
            doFullSearch(searchInput.value, parseInt(pager.dataset.currentPage));
        });
    }
})();
function doFullSearch(query, page) {
    var resultLabelSingle = document.querySelector(".search-results-count-label.single");
    var resultLabelMultible = document.querySelector(".search-results-count-label.multi");
    var resultLabelCount = document.querySelector(".search-results-count");
    var resultLabelQuery = document.querySelector(".search-result-info strong.query");
    var searchEmpty = document.querySelector(".search-empty");
    var pager = document.querySelector(".search-pagination-container");
    var amountPerPageElement = document.querySelector(".search-pagination-amount");
    /*var amountPerPage = parseInt(amountPerPageElement.value);*/
    var amountPerPage = 1;
    axios({
        url: "/Umbraco/Api/Search/GetSearch?Query=" + query + "&Amount=" + amountPerPage + "&Page=" + page + "&SiteId=" + body.dataset.siteid + "&Culture=" + body.dataset.culture + "&ExtendedModel=true",
        method: "GET"
    }).then(function (response) {
        if (response.data.ResultCount == 1) {
            resultLabelSingle.style.display = 'inline-block';
            resultLabelMultible.style.display = 'none';
        }
        else {
            resultLabelMultible.style.display = 'inline-block';
            resultLabelSingle.style.display = 'none';
        }
        resultLabelCount.textContent = '"' + query + '"';
        resultLabelCount.textContent = response.data.ResultCount;
        // No results
        if (response.data.ResultCount == 0) {
            searchEmpty.style.display = 'block';
            document.querySelectorAll('.search-result, .search-result-container').forEach(function (e) { return e.remove(); });
            pager.style.display = 'none';
        }
        else {
            searchEmpty.style.display = 'none';
            if (page == 1) {
                document.querySelectorAll('.search-result, .search-result-container').forEach(function (e) { return e.remove(); });
            }
            var template = document.querySelector(".search-results template");
            for (var i = 0; i < response.data.Result.length; i++) {
                var clone = template.content.cloneNode(true);
                if (response.data.Result[i].ImageUrl && clone.querySelector("img")) {
                    clone.querySelector("img").setAttribute("data-src", response.data.Result[i].ImageUrl + "?anchor=center&amp;mode=crop&amp;width=500&amp;height=350&amp;rnd=132154250515800000");
                }
                clone.querySelectorAll("a").forEach(function (e) { return e.setAttribute("href", response.data.Result[i].Url); });
                clone.querySelector("h3 a").textContent = response.data.Result[i].Title;
                clone.querySelector("p").textContent = response.data.Result[i].Description;
                template.parentElement.appendChild(clone);
            }
            if (document.querySelectorAll(".search-result, .search-result-container").length < response.data.ResultCount) {
                pager.style.display = 'block';
            }
            else {
                pager.style.display = 'none';
            }
        }
        resultLabelCount.innerHTML = response.data.ResultCount;
    })["catch"](function () {
    });
}
