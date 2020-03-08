using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace IcsFresh.OpenApi.Controllers
{
    public class ProductPageController : Controller
    {
        public ActionResult Products()
        {
            return View();
        }
    }
}