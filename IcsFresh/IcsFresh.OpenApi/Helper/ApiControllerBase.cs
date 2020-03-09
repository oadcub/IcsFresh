using System;
using System.Data.Entity;
using System.Web.Http;
using System.Web.Http.Cors;
using IcsFresh.OpenApi.Ef;
using IcsFresh.OpenApi.ViewModel;

namespace IcsFresh.OpenApi.Helper
{
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class ApiControllerBase : ApiController
    {
        public IcsFreshDbEntities db = new IcsFreshDbEntities();
        public JsonResultWrapper result = new JsonResultWrapper();
        public DateTime today;
        public DateTime now;
        public const string BADREQUESTMESSAGE = "กรุณากรอก format ข้อมูลให้ถูกต้องและครบถ้วน";

        public ApiControllerBase()
        {
            today = DateTime.Today;
            now = DateTime.Now;
            db.Configuration.LazyLoadingEnabled = false;
        }

        protected void ErrorLog(string PrimaryKey, Exception ex)
        {
            result.ErrorView.IsError = true;
            result.ErrorView.Message = ex.GetBaseException().Message + "(" + ex.StackTrace.Substring(Math.Max(0, ex.StackTrace.Length - 50)) + ")";
            result.ErrorView.StackTrace = ex.StackTrace;
        }



        protected System.Collections.IEnumerable GetListSql(string sqlCommand)
        {
            var list = DynamicSqlHelper.DynamicSqlQuery(db.Database, sqlCommand);
            return list;
        }
    }
}