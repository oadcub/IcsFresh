using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace IcsFresh.OpenApi.ViewModel
{
    public class UpdatePropertyViewModel
    {
        public string Entity { get; set; }
        public string Id { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
    }
}