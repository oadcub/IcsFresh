using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IcsFresh.OpenApi.Helper
{
    public class JsonResultWrapper
    {
        public JsonResultWrapper()
        {
            this.ErrorView = new ErrorViewModels();
            this.Datas = new JsonResultDataViewModel();
        }
        public ErrorViewModels ErrorView { get; set; }
        public JsonResultDataViewModel Datas { get; set; }
    }
}