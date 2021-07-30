using System;
using System.Web.Mvc;
using System.Web.Routing;
using Umbraco.Core;
using Umbraco.Core.Composing;

namespace SvenskVardepappersservice.Core.Features
{

    [RuntimeLevel(MinLevel = RuntimeLevel.Run)]
    public class ExternalLoginComposer : IUserComposer
    {

        public void Compose(Composition composition)
        {
            composition.Components().Append<LoginRouteComponent>();
        }
    }

    public class LoginRouteComponent : IComponent
    {
        public void Initialize()
        {
            RouteTable.Routes.MapRoute(
                name: "ExternalLogin",
                url: "bwlogin",
                defaults: new { controller = "ExternalLogin", action = "Login" }
            );
        }

        public void Terminate()
        {
            // Do nothing
        }
    }
   
}
