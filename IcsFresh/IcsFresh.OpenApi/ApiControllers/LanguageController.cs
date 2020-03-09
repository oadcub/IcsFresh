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
    [RoutePrefix("api/Language")]
    public class LanguageController : ApiControllerBase
    {
        [HttpPost]
        [Route("Search")]
        [ResponseType(typeof(List<CoreLanguage>))]
        public IQueryable<CoreLanguage> Search(List<string> listLanguage)
        {
            var listLanguageUpperCase = listLanguage.Select(x => x.Trim().ToUpper()).ToList();
            var currentDateTime = DateTime.Now;
            //var keyList = listLanguage.Select(x => x.CoreLanguageId).ToList();
            //var menuId = int.Parse(base.getMenuIdFromUrl());
            var menuid = 0;
            var searchResult = db.CoreLanguages.Where(
            x => listLanguageUpperCase.Contains(x.CoreLanguageId.Trim().ToUpper())
            && (x.MenuId == 99999 || x.MenuId == menuid)
            ).OrderBy(x => x.MenuId);

            var availKeyList = searchResult.Select(x => x.CoreLanguageId.ToUpper().Trim()).ToList();

            var notAvailKeyList = listLanguage.Where(x => !availKeyList.Contains(x.ToUpper().Trim())).Select(x => x.Trim()).Distinct(StringComparer.CurrentCultureIgnoreCase).ToList();
            var listNewLanguage = new List<CoreLanguage>();
            foreach (var x in notAvailKeyList)
            {
                var newKey = new CoreLanguage();
                newKey.CoreLanguageId = x;
                newKey.Value = x;
                newKey.Culture = "EN";
                newKey.MenuId = 99999;
                listNewLanguage.Add(newKey);
            }
            db.CoreLanguages.AddRange(listNewLanguage);
            db.SaveChanges();
            return searchResult;
        }
    }
    }