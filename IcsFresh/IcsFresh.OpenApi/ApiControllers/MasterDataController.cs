using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Description;
using System.Web.Http.Results;
using System.Web.Script.Serialization;
using IcsFresh.OpenApi.Ef;
using IcsFresh.OpenApi.Helper;
using IcsFresh.OpenApi.ViewModel;
using Newtonsoft.Json;

namespace IcsFresh.OpenApi.ApiControllers
{
    [RoutePrefix("api/MasterData")]
    public class MasterDataController : ApiControllerBase
    {

        [HttpGet]
        [Route("GetFieldInfo")]
        public IQueryable<CoreTableMetaData> GetFieldInfo(string id)
        {
            var listFieldInfo = db.CoreTableMetaDatas.Where(x => x.TableName == id).OrderBy(x => x.Sequence);
            return listFieldInfo;
        }

        [HttpGet]
        [Route("GetSearchResult")]
        public Object GetSearchResult(string id)
        {
            
            var query = "select * from " + id;
            var list = DynamicSqlHelper.DynamicSqlQuery(db.Database, query);
            return list;
        }
        [HttpPost]
        [Route("Search")]
        public Object Search(string id, [FromBody]string json)
        {
            
            var hasSeq = db.CoreTableMetaDatas.Where(x => x.TableName == id
           && x.FieldName.ToUpper() == "SEQ").Count() > 0;
            var sWhere = " where 1=1";
            if (json != null)
            {
                JavaScriptSerializer serializer = new JavaScriptSerializer();
                dynamic item = serializer.Deserialize<object>(json);

                foreach (var x in item)
                {
                    if (x.Value != null && x.Value != "")
                    {

                        sWhere += " and [" + x.Key + "] like " + "N'%" + x.Value + "%'";
                    }
                }
            }


            var query = "select * from " + id + sWhere;
            if (hasSeq) { query += " order by SEQ"; };
            var list = DynamicSqlHelper.DynamicSqlQuery(db.Database, query);
            return list;
        }


        [HttpPost]
        [Route("GetByEntity")]
        public async Task<IHttpActionResult> GetCoreTableMetaDatas(string id, [FromBody]string json)
        {
            
            var listPk = db.CoreTableMetaDatas.Where(x => x.TableName == id
            && x.IsPrimaryKey == true).OrderBy(x => x.Sequence);
            var listPkValue = new List<string>();

            JavaScriptSerializer serializer = new JavaScriptSerializer();
            dynamic item = serializer.Deserialize<object>(json);

            var query = "select * from " + id;
            query += " where 1=1";
            var paramList = new List<SqlParameter>();
            foreach (var pk in listPk)
            {
                query += " and [" + pk.FieldName + "]=" + "@" + pk.FieldName;
                paramList.Add(new SqlParameter(pk.FieldName, item[pk.FieldName]));
                listPkValue.Add(item[pk.FieldName].ToString());
            }
            var list = DynamicSqlHelper.DynamicSqlQuery(db.Database, query, paramList.ToArray());

            return Ok(list);
        }





        [HttpPost]
        [Route("Insert")]
        public async Task<IHttpActionResult> PostMasterData(string id, [FromBody]string json)
        {

            
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            dynamic item = serializer.Deserialize<object>(json);

            var listPk = db.CoreTableMetaDatas.Where(x => x.TableName == id
            && x.IsPrimaryKey == true).OrderBy(x => x.Sequence).ToList();
            var listPkName = listPk.Select(x => x.FieldName).ToList();
            var listPkValue = new List<string>();

            var hasSeq = db.CoreTableMetaDatas.Where(x => x.TableName == id
            && x.FieldName.ToUpper() == "SEQ").Count() > 0;


            var listParamName = new List<string>();
            var listParam = new List<SqlParameter>();
            //listParamName.Add("UpdateDate");
            //listParam.Add(new SqlParameter("UpdateDate", DateTime.Now));
            //listParamName.Add("UpdateBy");
            //listParam.Add(new SqlParameter("UpdateBy", userId));
            var tempSeq = "";

            foreach (var x in item)
            {
                if (x.Key != "UpdateDate" && x.Key != "UpdateBy" && x.Key != "$$hashKey")
                {
                    if (hasSeq && x.Key == "Seq")
                    {
                        tempSeq = x.Value ?? "";
                    }
                    else
                    {
                        listParamName.Add(x.Key);
                        listParam.Add(new SqlParameter(x.Key, x.Value ?? DBNull.Value));
                    }
                }
            }
            if (hasSeq)
            {
                if (tempSeq == "")
                {
                    var nextSeq = 1;
                    var maxSeqQuery = "select max(SEQ) from " + id;
                    var maxSeq = db.Database.SqlQuery<int?>(maxSeqQuery).FirstOrDefault();
                    if (maxSeq != null)
                    {
                        nextSeq = maxSeq.Value + 1;
                    }
                    tempSeq = nextSeq.ToString();
                }
                else
                {
                    var existSeqQuery = "select SEQ from " + id + " where SEQ =" + tempSeq;
                    var existSeq = db.Database.SqlQuery<int?>(existSeqQuery).FirstOrDefault();
                    if (existSeq != null)
                    {
                        var seqToReOrderQuery = @" WITH a AS(
SELECT ROW_NUMBER() OVER(ORDER BY(SELECT SEQ)) as rn, SEQ
FROM " + id + @" where SEQ >= @seq ) 
UPDATE a SET SEQ = @seq + rn
OPTION(MAXDOP 1)";
                        db.Database.ExecuteSqlCommand(
                seqToReOrderQuery,
                new SqlParameter("Seq", tempSeq));

                    }
                }
                listParamName.Add("Seq");
                listParam.Add(new SqlParameter("Seq", tempSeq));
            }


            var sqlCommand = "Insert into " + id + "(" +
                  string.Join(",", listParamName) + ")"
                + " Values(@" + string.Join(",@", listParamName) + ")"
                + " ; SELECT CAST(SCOPE_IDENTITY() AS INT);";
            //   var insertedId= db.Database.ExecuteSqlCommand(
            //    sqlCommand,
            //    listParam.ToArray()
            //);
            var logId = "";
            var insertedId = db.Database.SqlQuery<int?>(sqlCommand, listParam.ToArray()).FirstOrDefault();
            if (insertedId != null)
            {
                logId = insertedId.ToString();
            }
            else
            {
                foreach (var pk in listPkName)
                {
                    listPkValue.Add(item[pk].ToString());
                }
                logId = string.Join(",", listPkValue);
            }

            return Created("", item);

        }


        [HttpPut]
        [Route("Update")]
        public async Task<IHttpActionResult> PutMasterData(string id, [FromBody]string json)
        {
            var listPk = db.CoreTableMetaDatas.Where(x => x.TableName == id
            && x.IsPrimaryKey == true).OrderBy(x => x.Sequence).ToList();
            var listPkName = listPk.Select(x => x.FieldName).ToList();
            var listPkValue = new List<string>();
            var hasSeq = db.CoreTableMetaDatas.Where(x => x.TableName == id
            && x.FieldName.ToUpper() == "SEQ").Count() > 0;
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            dynamic item = serializer.Deserialize<object>(json);
            var listParamName = new List<string>();
            var listParam = new List<SqlParameter>();
            var tempSeq = "";
            foreach (var x in item)
            {
                if (x.Key != "UpdateDate" && x.Key != "UpdateBy" && x.Key != "$$hashKey"
                    )
                {
                    if (hasSeq && x.Key == "Seq")
                    {
                        tempSeq = (x.Value ?? "").ToString();
                    }
                    else
                    {
                        listParamName.Add(x.Key);
                        listParam.Add(new SqlParameter(x.Key, x.Value ?? DBNull.Value));
                    }
                }
            }
            if (hasSeq)
            {
                if (tempSeq == "")
                {
                    var nextSeq = 1;
                    var maxSeqQuery = "select max(SEQ) from " + id;
                    var maxSeq = db.Database.SqlQuery<int?>(maxSeqQuery).FirstOrDefault();
                    if (maxSeq != null)
                    {
                        nextSeq = maxSeq.Value + 1;
                    }
                    tempSeq = nextSeq.ToString();
                }
                else
                {

                    var existSeqQuery = "select SEQ from " + id + " where SEQ =" + tempSeq;
                    var existSeq = db.Database.SqlQuery<int?>(existSeqQuery).FirstOrDefault();
                    if (existSeq != null)
                    {
                        var listParamKey = new List<SqlParameter>();
                        var sWhereSeq = " where not(1=1 ";
                        foreach (var pk in listPkName)
                        {
                            sWhereSeq += " and [" + pk + "]=@" + pk;
                            var pkValue = listParam.Where(x => x.ParameterName == pk).Select(x => x.Value).FirstOrDefault();
                            listParamKey.Add(new SqlParameter(pk, pkValue));
                        }
                        sWhereSeq += ")";
                        var seqToReOrderQuery = @" WITH a AS(
SELECT ROW_NUMBER() OVER(ORDER BY(SELECT SEQ)) as rn, SEQ
FROM " + id + sWhereSeq + @" and SEQ >= @seq ) 
UPDATE a SET SEQ = @seq + rn
OPTION(MAXDOP 1)";
                        listParamKey.Add(new SqlParameter("Seq", tempSeq));
                        db.Database.ExecuteSqlCommand(
                seqToReOrderQuery,
                listParamKey.ToArray());

                    }
                    listParamName.Add("Seq");
                    listParam.Add(new SqlParameter("Seq", tempSeq));
                }
            }
            var sWhere = " where 1=1";
            foreach (var pk in listPkName)
            {
                sWhere += " and " + pk + "=" + "@" + pk;
                listPkValue.Add(item[pk].ToString());
            }

            var arrSet = new List<string>();
            foreach (var col in listParamName)
            {
                if (col != "UpdateDate" && col != "UpdateBy" && col != "$$hashKey"
                    && !listPkName.Contains(col))
                {
                    arrSet.Add("[" + col + "]=@" + col);
                }
            }
            var sSet = " set " + string.Join(",", arrSet);


            var sqlCommand = "Update " + id + sSet + sWhere;
            db.Database.ExecuteSqlCommand(
            sqlCommand,
            listParam.ToArray()
        );
            return StatusCode(HttpStatusCode.NoContent);
        }



        [HttpDelete]
        [Route("Delete")]
        [ResponseType(typeof(CoreTableMetaData))]
        public async Task<IHttpActionResult> DeleteMasterData(string id, [FromBody]string json)
        {
            
            var listPk = db.CoreTableMetaDatas.Where(x => x.TableName == id
             && x.IsPrimaryKey == true).OrderBy(x => x.Sequence).ToList();
            var listPkName = listPk.Select(x => x.FieldName).ToList();
            var listPkValue = new List<string>();
            JavaScriptSerializer serializer = new JavaScriptSerializer();
            dynamic item = serializer.Deserialize<object>(json);
            var listParamName = new List<string>();
            var listParam = new List<SqlParameter>();

            var sWhere = " where 1=1";
            foreach (var pk in listPkName)
            {
                listParamName.Add(pk);
                listParam.Add(new SqlParameter(pk, item[pk] ?? DBNull.Value));
                sWhere += " and [" + pk + "]=" + "@" + pk;
                listPkValue.Add(item[pk].ToString());
            }
            var sqlCommand = "delete from " + id + sWhere;
            db.Database.ExecuteSqlCommand(
            sqlCommand,
            listParam.ToArray());
            return Ok(item);
        }



        [HttpPost]
        [Route("AutoComplete")]
        public async Task<IHttpActionResult> AutoComplete(SearchCondition searchCondition)
        {
            
            string selectField = "select ";
            selectField += string.Join(",", searchCondition.List_Select);

            string from = " from " + searchCondition.DataSourceId;

            string whereCause = " where 1=1";
            if (searchCondition.List_Where != null)
            {
                foreach (var where in searchCondition.List_Where)
                {

                    if (where.Condition == "IN")
                    {
                        whereCause += " and [" + where.Key + "] "
                        + where.Condition + " " + where.Value + " ";
                    }
                    else
                    {
                        whereCause += " and [" + where.Key + "] "
                        + (where.Condition ?? "=") + " '" + where.Value + "'";
                    }
                }
            }
            string groupBy = " ";
            if (searchCondition.List_GroupBy != null)
            {
                groupBy += "group by " + string.Join(",", searchCondition.List_GroupBy);
            }

            string orderBy = " ";
            if ((searchCondition.OrderBy ?? "") != "")
            {
                orderBy += " order by " + searchCondition.OrderBy ?? "";
            }

            string sqlCommand = selectField + from + whereCause + groupBy + orderBy;
            var list = DynamicSqlHelper.DynamicSqlQuery(db.Database, sqlCommand);
            return Json(list);
        }


        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

    }
}