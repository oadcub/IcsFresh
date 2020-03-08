using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Http.Results;
using IcsFresh.OpenApi.Ef;
using IcsFresh.OpenApi.Helper;
using IcsFresh.OpenApi.ViewModel;
using Newtonsoft.Json;

namespace IcsFresh.OpenApi.ApiControllers
{
    [RoutePrefix("api/Products")]
    public class ProductsController : ApiControllerBase
    {

        [HttpGet]
        [Route("Fetch")]
        [ResponseType(typeof(JsonResultWrapper))]
        public async Task<IHttpActionResult> Fetch()
        {
            try
            {
                result.Datas.Data1 = await db.Products.OrderBy(x=>x.Name).ToListAsync();
                return Json(result);
            }
            catch (DbEntityValidationException ex)
            {
                base.ErrorLog(string.Empty, ex);
            }
            catch (Exception ex)
            {
                base.ErrorLog(string.Empty, ex);
            }
            return Json(result);
        }


        [HttpPost]
        [Route("Insert")]
        [ResponseType(typeof(JsonResultWrapper))]
        public async Task<IHttpActionResult> Insert(Product viewModel)
        {
            try
            {
                db.Products.Add(viewModel);
                await db.SaveChangesAsync();
                return Json(result);
            }
            catch (DbEntityValidationException ex)
            {
                base.ErrorLog(string.Empty, ex);
            }
            catch (Exception ex)
            {
                base.ErrorLog(string.Empty, ex);
            }
            return Json(result);
        }

        [HttpPost]
        [Route("UpdateProperty")]
        [ResponseType(typeof(JsonResultWrapper))]
        public async Task<IHttpActionResult> UpdateProperty(UpdatePropertyViewModel viewModel)
        {
            try
            {
                var row = db.Products.FirstOrDefault(x => x.Code == viewModel.Id);
                //update
                row.GetType().GetProperty(viewModel.Name).SetValue(row, viewModel.Value, null);
                await db.SaveChangesAsync();
                return Json(result);
            }
            catch (DbEntityValidationException ex)
            {
                base.ErrorLog(string.Empty, ex);
            }
            catch (Exception ex)
            {
                base.ErrorLog(string.Empty, ex);
            }
            return Json(result);
        }

    }
}