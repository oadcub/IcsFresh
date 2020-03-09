using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IcsFresh.OpenApi.Helper
{
    public class SearchCondition
    {
        public string DataSourceId { get; set; }
        public int QueryType { get; set; }
        public List<string> List_Select { get; set; }
        public List<WhereCondition> List_Where { get; set; }
        public string OrderBy { get; set; }
        public List<string> List_GroupBy { get; set; }
    }
    public class WhereCondition
    {
        public string Key { get; set; }
        public string Condition { get; set; }
        public string Value { get; set; }
    }
}