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
/*(function () {
//    var searchInput = document.querySelector(".search__input");
//    var searchresult = document.querySelector(".searchresult"); //searchresults
//    var pager = document.querySelector(".search-pagination-container button");
//    if (searchInput && searchresult) {
//        //Preform search on page load
//        doFullSearch(searchInput.value, 1);
//        //Preform search on input change
//        searchInput.addEventListener("input", function (e) {
//            doFullSearch(searchInput.value, 1);
//            // document.querySelector(".query").innerHTML = '"' + searchInput.value + '"';
//        });
//        //pager
//        pager.addEventListener("click", function (e) {
//            pager.dataset.currentPage = (pager.dataset.currentPage ? parseInt(pager.dataset.currentPage) + 1 : 2).toString();
//            doFullSearch(searchInput.value, parseInt(pager.dataset.currentPage));
//        });
//    }
//})();
//function doFullSearch(query, page) {
//    // var resultLabelSingle = document.querySelector(".search-results-count-label.single");
//    // var resultLabelMultible = document.querySelector(".search-results-count-label.multi");
//    // var resultLabelCount = document.querySelector(".search-results-count");
//    // var resultLabelQuery = document.querySelector(".search-result-info strong.query");
//    var searchEmpty = document.querySelector(".search-empty");
//    var searchShort = document.querySelector(".search-short");
//    var pager = document.querySelector(".search-pagination-container");
//    var amountPerPageElement = document.querySelector(".search-pagination-amount");
//    var amountPerPage = 10 // parseInt(amountPerPageElement.value);
//    axios({
//        url: "/Umbraco/Api/Search/GetSearch?Query=" + query + "&Amount=" + amountPerPage + "&Page=" + page,
//        method: "GET"
//    }).then(function (response) {
//        // if (response.data.ResultCount == 1) {
//        //     resultLabelSingle.style.display = 'inline-block';
//        //     resultLabelMultible.style.display = 'none';
//        // }
//        // else {
//        //     resultLabelMultible.style.display = 'inline-block';
//        //     resultLabelSingle.style.display = 'none';
//        // }
//        // resultLabelCount.textContent = '"' + query + '"';
//        // resultLabelCount.textContent = response.data.ResultCount;
//        // No results
//        if (response.data.ResultCount === 0 && query.length < 3) {
//            searchEmpty.style.display = 'none';
//            searchShort.style.display = 'block';
//            document.querySelectorAll('.search-result, .search-result-container').forEach(function (e) { return e.remove(); });
//            pager.style.display = 'none';
//        }
//        else if (response.data.ResultCount === 0) {
//            searchEmpty.style.display = 'block';
//            searchShort.style.display = 'none';
//            document.querySelectorAll('.search-result, .search-result-container').forEach(function (e) { return e.remove(); });
//            pager.style.display = 'none';
//        }
//        else {
//            searchEmpty.style.display = 'none';
//            searchShort.style.display = 'none';
//            if (page === 1) {
//                document.querySelectorAll('.search-result, .search-result-container').forEach(function (e) { return e.remove(); });
//            }
//            var template = document.querySelector(".search-results template");
//            for (var i = 0; i < response.data.Result.length; i++) {
//                var clone = template.content.cloneNode(true);
//                var fileUrl = response.data.Result[i].Url;
//                var fileType = response.data.Result[i].FileType;
//                var src = ""
//                if (fileType === "doc" || fileType === "pdf" || fileType === "pptx" || fileType === "xlsx")
//                {
//                    src = "/assets/Icons/file-" + fileType + ".svg";
//                }
//                else if (fileUrl !== "")
//                {
//                    src = "/assets/Icons/paper-2.svg"
//                }  
                
//                clone.querySelectorAll("a").forEach(function (e) { return e.setAttribute("href", fileUrl); });
//                clone.querySelector("h2").textContent = response.data.Result[i].Name;
//                clone.querySelector(".pre-head").textContent = response.data.Result[i].CreateDate;
//                clone.querySelector(".info-popup").textContent = response.data.Result[i].FileName;
//                clone.querySelector("img").setAttribute("src", src);
//                clone.querySelector("p").textContent = response.data.Result[i].Description;
//                template.parentElement.appendChild(clone);
//            }
//            if (document.querySelectorAll(".search-result, .search-result-container").length < response.data.ResultCount) {
//                pager.style.display = 'block';
//            }
//            else {
//                pager.style.display = 'none';
//            }
//        }
//        resultLabelCount.innerHTML = response.data.ResultCount;
//    })["catch"](function () {
//    });
//}




 /*======================================
      #Search Header
    ======================================*/
var body = document.body;
(function () {
   
    var searchInput = document.querySelector(".search__input");
    var autocomplete = document.querySelector(".search__autocomplete");
    var sResults = autocomplete.querySelectorAll(".search__suggest");
    // Autocomplete Header
    var searchTimeout = null;
    if (searchInput) {
        searchInput.addEventListener("input", function (e) {
            var query = searchInput.value;
            //  let query: Array<string> = searchInput.value.split(" ");
            if (query.length > 2) {
                sResults.forEach(function (title) {
                    autocomplete.style.display = "block";
                });
            }
            else {
                 autocomplete.style.display = "none";
            }
            if (searchTimeout != null) {
                clearTimeout(searchTimeout);
            }
            // Do the search!
            searchTimeout = setTimeout(function () {
                doSearch(query);
            }, 300);
        });
    }
})();
function doSearch(query) {
    var searchTimeout = null;
 /*   var loader = document.querySelector(".search__loader");*/
    var noResults = document.querySelector(".search__no-results");
/*    var button = document.querySelector(".search__autocomplete .button");*/
    var suggest = document.querySelector(".search__suggest");
    var resultCount = document.querySelector(".search__result-count");
    axios({
        url: "/Umbraco/Api/Search/Search?Query=" + query + "&Amount=6&Page=1&SiteId=" + body.dataset.siteid + "&Culture=" + body.dataset.culture,
        method: "GET"
    }).then(function (response) {
        // Clear suggest list
        suggest.innerHTML = "";
        if (response.data.Result.length == 0) {
            /*button.style.display = "none";*/
            suggest.style.display = "none";
            noResults.style.display = "block";
        }
        else {
            /*button.style.display = "block";*/
            suggest.style.display = "block";
            noResults.style.display = "none";
            for (var i = 0; i < response.data.Result.length; i++) {
                suggest.innerHTML += '<li><a href="' + response.data.Result[i].Url + '"><span class="search__suggest-info"><span class="search__suggest-title">' + response.data.Result[i].Title + '</span><span class="search__suggest-desc">' + response.data.Result[i].Description + '</span></span></a></li>';
            }
        }
        // Hide loader
       /* loader.classList.remove("loading");*/
        // Update result count
        resultCount.innerHTML = ("(" + response.data.ResultCount + ")");
    })["catch"]();
}
