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
    [RoutePrefix("api/OrderTemplateDetail")]
    public class OrderTemplateDetailController : ApiControllerBase
    {

        [HttpGet]
        [Route("Fetch")]
        [ResponseType(typeof(JsonResultWrapper))]
        public async Task<IHttpActionResult> Fetch()
        {
            try
            {
                result.Datas.Data1 = await db.OrderTemplateDetails.OrderBy(x=>x.Seq).ToListAsync();
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
        public async Task<IHttpActionResult> Insert(OrderTemplateDetail viewModel)
        {
            try
            {
                ensureSeq(ref viewModel);

                db.OrderTemplateDetails.Add(viewModel);

                var runningOrder = db.OrderTemplateDetails.Where(x => x.Seq >= viewModel.Seq && x.TemplateCode == viewModel.TemplateCode && x.ProductCode != viewModel.ProductCode).OrderBy(x => x.Seq).ToList();
                var continueSeq = viewModel.Seq;
                foreach (var r in runningOrder)
                {
                    continueSeq++;
                    r.Seq = continueSeq;
                }
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

        private void ensureSeq(ref OrderTemplateDetail viewModel)
        {
            if (viewModel.Seq == null || viewModel.Seq == 0)
            {
                var latest = db.OrderTemplateDetails.OrderByDescending(x => x.Seq).FirstOrDefault();
                if (latest != null && latest.Seq.HasValue)
                {
                    viewModel.Seq = latest.Seq.Value;
                }
                else
                {
                    viewModel.Seq = 1;
                }
            }
        }

        [HttpPost]
        [Route("Update")]
        [ResponseType(typeof(JsonResultWrapper))]
        public async Task<IHttpActionResult> UpdateProperty(OrderTemplateDetail viewModel)
        {
            try
            {
                ensureSeq(ref viewModel);
                var row = db.OrderTemplateDetails.FirstOrDefault(x => x.TemplateCode == viewModel.TemplateCode && x.ProductCode == viewModel.ProductCode);
                //update
                row.ProductCode = viewModel.ProductCode;
                row.TemplateCode = viewModel.TemplateCode;

                var runningOrder = db.OrderTemplateDetails.Where(x => x.Seq >= viewModel.Seq && x.TemplateCode == viewModel.TemplateCode && x.ProductCode != viewModel.ProductCode).OrderBy(x=>x.Seq).ToList();
                var continueSeq = viewModel.Seq;
                foreach (var r in runningOrder)
                {
                    continueSeq++;
                    r.Seq = continueSeq;
                }

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

        /// <summary>
        /// id = productCode|templateCode
        /// use | as seperator
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete]
        [Route("Delete/{id}")]
        [ResponseType(typeof(JsonResultWrapper))]
        public async Task<IHttpActionResult> Delete(string id)
        {
            var arrId = id.Split('|');
            var productCode = arrId[0];
            var templateCode = arrId[1];
            try
            {
                var row = db.OrderTemplateDetails.FirstOrDefault(x => x.ProductCode == productCode && x.TemplateCode == templateCode);
                db.OrderTemplateDetails.Remove(row);
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