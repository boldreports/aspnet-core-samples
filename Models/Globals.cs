using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace ReportsCoreSamples.Models
{
    public class Globals
    {
        public static string SERVICE_URL;
        public static string DESIGNER_SERVICE_URL;
        public Globals(IHttpContextAccessor _context)
        {
            SERVICE_URL = _context.HttpContext.Request.PathBase + "/ReportViewerWebApi";
            DESIGNER_SERVICE_URL = _context.HttpContext.Request.PathBase + "/ReportDesignerWebApi";

        }
    }
}
