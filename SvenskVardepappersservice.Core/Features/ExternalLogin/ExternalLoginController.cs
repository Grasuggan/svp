using SvenskVardepappersservice.Core.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Mvc;
using Umbraco.Core.Composing;
using Umbraco.Web.Mvc;
using SvenskVardepappersservice.Core.Settings;

namespace SvenskVardepappersservice.Core.Controllers
{
    public class ExternalLoginController : SurfaceController
    {
        [System.Web.Http.HttpPost]
        public ActionResult Login(ExternalLoginRequest model)
        {

            if(model.Key == Constants.MemberLoginKey)
            {
                var member = Current.Services.MemberService.GetByUsername(model.Username);

                //if the default member does not exist we create it first
                if(member == null)
                {
                    var email = model.Username.Contains("@") ? model.Username : Constants.DefaultMemberEmail;//is username is email, use it otherwise use a default
                    member = Current.Services.MemberService.CreateMemberWithIdentity(model.Username, email, model.Username, "Member");
                    Current.Services.MemberService.SavePassword(member, Constants.DefaultMemberPassword);
                    Current.Services.MemberService.AssignRole(model.Username, "Members");
                }

                Members.Login(model.Username, Constants.DefaultMemberPassword);
            }

            return Redirect("/");
        }
    }
}
