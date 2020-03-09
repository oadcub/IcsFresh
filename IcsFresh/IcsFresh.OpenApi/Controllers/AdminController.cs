using IcsFresh.OpenApi.Ef;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace IcsFresh.OpenApi.Controllers
{
    public class AdminController : Controller
    {
        private IcsFreshDbEntities db = new IcsFreshDbEntities();
        public ActionResult MasterData(string id)
        {
            ViewBag.Entity = id;
            var model = db.CoreTableMetaDatas.Where(x => x.TableName == id).OrderBy(x => x.Sequence);
            return View(model);
        }
    }
}