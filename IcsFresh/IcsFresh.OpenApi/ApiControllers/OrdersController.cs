namespace IcsFresh.OpenApi.ApiControllers
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Validation;
    using System.Linq;
    using System.Threading.Tasks;
    using System.Web.Http;
    using System.Web.Http.Description;
    using IcsFresh.OpenApi.Ef;
    using IcsFresh.OpenApi.Helper;

    [RoutePrefix("api/Orders")]
    public class OrdersController : ApiControllerBase
    {
        [HttpGet]
        [Route("Fetch")]
        [ResponseType(typeof(JsonResultWrapper))]
        public async Task<IHttpActionResult> Fetch()
        {
            try
            {
                result.Datas.Data1 = await db.Orders.OrderBy(x => x.DeliveryDate).ToListAsync();
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
        [Route("Search")]
        [ResponseType(typeof(JsonResultWrapper))]
        public async Task<IHttpActionResult> Search(Order viewModel)
        {
            try
            {
                var order = await db.Orders.Where(
                                x =>

                                    // x.CustomerCode == viewModel.CustomerCode 
                                    (x.TemplateCode == viewModel.TemplateCode)
                                    && x.DeliveryDate == viewModel.DeliveryDate).FirstOrDefaultAsync();
                if (order == null)
                {
                    return Json(result);
                }

                result.Datas.Data1 = order;
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
        [Route("OrderSummaries")]
        [ResponseType(typeof(JsonResultWrapper))]
        public async Task<IHttpActionResult> OrderSummaries(Order viewModel)
        {
            try
            {
                result.Datas.Data1 = await db.vOrderSummaries.Where(
                                         x => x.DeliveryDate == viewModel.DeliveryDate).ToListAsync(); 
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

        [HttpGet]
        [Route("SearchDetail")]
        [ResponseType(typeof(JsonResultWrapper))]
        public async Task<IHttpActionResult> SearchDetail(string orderId)
        {
            try
            {
                var details = await db.OrderDetails.Where(
                                  x =>
                                      x.OrderId.ToString() == orderId).ToListAsync();
                result.Datas.Data1 = details;
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
        [Route("Save")]
        [ResponseType(typeof(JsonResultWrapper))]
        public void Save(Order viewModel)
        {
            try
            {
                var oldOrder = db.Orders.Where(
                    x =>

                        // x.CustomerCode == viewModel.CustomerCode
                        x.TemplateCode == viewModel.TemplateCode
                        && x.DeliveryDate == viewModel.DeliveryDate).FirstOrDefault();
                if (oldOrder != null)
                {
                    var details = db.OrderDetails.Where(x => x.OrderId == oldOrder.Id);
                    db.OrderDetails.RemoveRange(details);
                    db.Orders.Remove(oldOrder);
                }

                viewModel.Id = Guid.NewGuid();
                var seq = 1;
                foreach (OrderDetail d in viewModel.OrderDetails)
                {
                    d.OrderId = viewModel.Id;
                    d.Id=Guid.NewGuid();
                    d.Seq = seq++;
                }
                db.Orders.Add(viewModel);
                db.SaveChanges();
            }
            catch (DbEntityValidationException ex)
            {
                base.ErrorLog(string.Empty, ex);
                throw (ex);
            }
            catch (Exception ex)
            {
                base.ErrorLog(string.Empty, ex);
                throw (ex);
            }
        }

        [HttpDelete]
        [Route("Delete/{id}")]
        [ResponseType(typeof(JsonResultWrapper))]
        public async Task<IHttpActionResult> Delete(string id)
        {
            try
            {
                var order = db.Orders.FirstOrDefault(x => x.Id.ToString() == id);
                var details = db.OrderDetails.Where(x => x.OrderId == order.Id);

                db.OrderDetails.RemoveRange(details);
                db.Orders.Remove(order);
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