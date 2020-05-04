using IcsFresh.OpenApi.Ef;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace IcsFresh.OpenApi.Controllers
{
    public class PatialController : Controller
    {
        private IcsFreshDbEntities db = new IcsFreshDbEntities();

        [ChildActionOnly]
        public ActionResult MainMenu(string id)
        {
            ViewBag.Entity = id;
            var model = db.CoreTableMetaDatas.Where(x => x.TableName == id).OrderBy(x => x.Sequence);
            return View(model);
        }
    }
}