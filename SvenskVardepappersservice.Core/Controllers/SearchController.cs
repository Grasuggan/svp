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
        public string Title { get; set; }
        public string Url { get; set; }
        public string Alias { get; set; }

        public string ImageUrl { get; set; }

        public string UploadFile { get; set; }

        public string Date { get; set; }

        public string Summary { get; set; }

        public string MetaDescription { get; set; }

        public string MetaTitle { get; set; }

        public string Description { get; set; }

        public string Role { get; set; }

        public string DirectNumber { get; set; }

        public string GroupNumber { get; set; }

        public string Email { get; set; }

        public bool Hide { get; set; }

        public bool HiddenParent { get; set; }
        //public string Description { get; set; }
        //public string CreateDate { get; set; }
        //public string FileName { get; set; }
        //public string FileType { get; set; }
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
        public SearchResponse GetSearch(string query, int amount, int page, int siteId, string culture)
        {
            var searchResults = new SearchResponse() { Result = new List<SearchResult>(), ResultCount = 0 };
            var site = Umbraco.Content(siteId);
            if (!ExamineManager.Instance.TryGetIndex(Constants.UmbracoIndexes.ExternalIndexName, out var index) || !(index is IUmbracoIndex umbIndex))
                throw new InvalidOperationException($"The required index {Constants.UmbracoIndexes.ExternalIndexName} was not found");

            var documentTypeAliases = GetDocumentTypeAliases();
            var fieldAliases = GetFieldAliases();

            // Get all index fields suffixed with the culture name supplied (culture variant), 
            // or fields that don't have a suffix (culture invariant).
            //var cultureAndInvariantFields = umbIndex.GetCultureAndInvariantFields(culture).ToArray();
            if (_localizationService.GetAllLanguages().Count() == 1)
            {
                culture = string.Empty;
            }
            var fields = new string[] { };

            foreach (var fieldAlias in fieldAliases)
            {
                var alias = string.IsNullOrEmpty(culture) ? fieldAlias : fieldAlias + "_" + culture.ToLower();
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
            if (site != null)
            {
                examineQuery = examineQuery
                    .And().GroupedOr(new[] { "__Path" }, $"{site.Path},*".MultipleCharacterWildcard(), $"{site.Path}".Escape());
            }
            examineQuery = examineQuery
                // Exclude anything hidden from search, NOT filters must come last!
                .Not().Field("hideFromSearch", "1");
            //var skip = (page - 1) * amount;
            //var take = amount;
            var skip = 0;
            var take = 100;

            var results = Umbraco.ContentQuery.Search(examineQuery, skip, take, out long totalRecords);
            searchResults.ResultCount = totalRecords;
            foreach (var result in results)
            {
                var node = result.Content;
                searchResults.Result.Add(new SearchResult() {
                    HiddenParent = node.Parent != null ? node.Parent.Value<bool>("umbracoNaviHide") : false,
                    Hide = node.Value<bool>("umbracoNaviHide"),
                    Summary = node.Value<string>("summary", ""),
                    MetaDescription = node.Value<string>("metaDescription", ""),
                    MetaTitle = node.Value<string>("metaTitle", ""),
                    Description = node.Value<string>("description", ""),
                    Role = node.Value<string>("role", ""),
                    DirectNumber = node.Value<string>("directNumber", ""),
                    GroupNumber = node.Value<string>("groupNumber", ""),
                    Email = node.Value<string>("email", ""),
                    Title = node.Name(culture),
                    Url = node.Url(culture),
                    Alias = node.ContentType.Alias,
                    Date = node.Value("Date", fallback: Fallback.ToDefaultValue, defaultValue: node.CreateDate).ToString("d MMMM yyyy"),
                    ImageUrl = node.Value<IPublishedContent>("image")?.Url, UploadFile = node.Value<string>("uploadFile", "")
                });
            }
            return searchResults;
        }

        private string[] GetDocumentTypeAliases()
        {
            var documentTypeAliasesSettings = _settings.Search.DocumentTypes;
            var arrayOfdocumentTypeAliases = Array.ConvertAll(documentTypeAliasesSettings.Split(','), p => p.Trim());

            return arrayOfdocumentTypeAliases;
        }

        private string[] GetFieldAliases()
        {
            var fieldsAliasesSettings = _settings.Search.Fields;
            var arrayOfFieldsAliases = Array.ConvertAll(fieldsAliasesSettings.Split(','), p => p.Trim());

            return arrayOfFieldsAliases;
        }
    }
}