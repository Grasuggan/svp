using System;
using System.Collections.Generic;
using System.Linq;
using Umbraco.Core.Services;
using System.Web.Mvc;
using Examine;
using Igloo.Core;
using Umbraco.Core;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Examine;
using Umbraco.Web;
using Umbraco.Web.WebApi;

namespace SvenskVardepappersservice.Core.Controllers
{
    public class SearchResult
    {
        public string Name { get; set; }
        public string Url { get; set; }
        public string Description { get; set; }
        public string CreateDate { get; set; }
        public string FileName { get; set; }
        public string FileType { get; set; }
    }

    public class SearchResponse
    {
        public List<SearchResult> Result { get; set; }
        public long ResultCount { get; set; }
    }

    public class SearchController : UmbracoApiController
    {
        ILocalizationService _localizationService = null;
        IglooSettings _settings = null;

        public SearchController(ILocalizationService localizationService)
        {
            _localizationService = localizationService;
            _settings = new IglooConfig().Settings;
        }

        [HttpGet]
        public SearchResponse GetSearch(string query, int amount, int page)
        {
            var culture = "";
            var searchResults = new SearchResponse() { Result = new List<SearchResult>(), ResultCount = 0 };
            if (!ExamineManager.Instance.TryGetIndex(Constants.UmbracoIndexes.ExternalIndexName, out var index) || !(index is IUmbracoIndex umbIndex))
                throw new InvalidOperationException($"The required index {Constants.UmbracoIndexes.ExternalIndexName} was not found");

            var documentTypeAliases = new[] { "document" };
            var fieldAliases = new[] {"uploadFile", "name", "description"};

            var fields = new string[]{};

            foreach (var fieldAlias in fieldAliases) {
                var alias = string.IsNullOrEmpty(culture) ? fieldAlias : fieldAlias+"_" + culture.ToLower();
                fields = fields.Append(alias).ToArray();
            }

            var isPublished = string.IsNullOrEmpty(culture) ? "__Published" : "__Published_" + culture.ToLower();
            var searcher = index.GetSearcher();

            var examineQuery = searcher
                // Only search content
                .CreateQuery("content")
                // Managed query for search term. A managed query means it's up to the field definition
                // to build the appropriate query (i.e. full text, wildcard, phrase, etc...)
                // nodeName will be indexed as 'fulltext' type which resolves to 
                // https://github.com/Shazwazza/Examine/blob/master/src/Examine/LuceneEngine/Indexing/FullTextType.cs#L69
                .ManagedQuery(query, fields)
                // Only published items
                .And().Field(isPublished, "y")
                // Only these content types
                .And().GroupedOr(new[] { "__NodeTypeAlias" }, documentTypeAliases);
            examineQuery = examineQuery
                // Exclude anything hidden from search, NOT filters must come last!
                .Not().Field("hideFromSearch", "1");
            var skip = (page - 1) * amount;
            var take = amount;
     
            var results = Umbraco.ContentQuery.Search(examineQuery, skip, take, out long totalRecords);
            searchResults.ResultCount = totalRecords;
            foreach (var result in results)
            {
                var node = result.Content;
                var fileUrl = node.Value<string>("UploadFile");
                searchResults.Result.Add(new SearchResult() { Name = node.Name, Url = fileUrl, CreateDate =  node.CreateDate.ToString("d MMMM yyyy", new System.Globalization.CultureInfo("sv-SE")), FileType = node.UrlSegment, Description = node.Value<string>("Description"), FileName = fileUrl.Substring(fileUrl.LastIndexOf('/') + 1)});
            }
            return searchResults;
        }
    }
}