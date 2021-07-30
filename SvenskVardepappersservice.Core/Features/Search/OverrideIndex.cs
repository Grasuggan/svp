using Examine;
using Umbraco.Core;
using Umbraco.Core.Composing;
using Umbraco.Core.Scoping;
using Umbraco.Core.Services;
using Umbraco.Examine;
using Umbraco.Web.Search;

namespace SvenskVardepappersservice.Core
{
    [ComposeAfter(typeof(ExamineComposer))]
    public class CustomizeIndexComposer : IUserComposer
    {

        public void Compose(Composition composition)
        {
            // replace the default IUmbracoIndexConfig definition
            composition.RegisterUnique<IUmbracoIndexConfig, CustomIndexConfig>();
        }
    }

    // inherit from the default
    public class CustomIndexConfig : UmbracoIndexConfig, IUmbracoIndexConfig
    {
        private readonly IPublicAccessService _publicAccessService;
        private readonly IScopeProvider _scopeProvider;

        public CustomIndexConfig(IPublicAccessService publicAccessService, IScopeProvider scopeProvider)
            : base(publicAccessService)
        {
            _publicAccessService = publicAccessService;
            _scopeProvider = scopeProvider;
        }

        // explicit implementation - overrides base class.
        IContentValueSetValidator IUmbracoIndexConfig.GetContentValueSetValidator()
        {
            bool supportProtectedContent = true;

            return new ContentValueSetValidator(false, supportProtectedContent, _publicAccessService, _scopeProvider);
        }

        // explicit implementation - overrides base class
        IValueSetValidator IUmbracoIndexConfig.GetMemberValueSetValidator()
        {
            var excludeFields = Umbraco.Core.Constants.Conventions.Member.GetStandardPropertyTypeStubs().Keys;

            // include everything except the above
            return new MemberValueSetValidator(null, null, null, excludeFields);
        }

        // explicit implementation - overrides base class.
        IContentValueSetValidator IUmbracoIndexConfig.GetPublishedContentValueSetValidator()
        {
            bool supportProtectedContent = true;

            return new ContentValueSetValidator(true, supportProtectedContent, _publicAccessService, _scopeProvider);
        }
    }
}