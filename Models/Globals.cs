using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;

namespace ReportsCoreSamples.Models
{
    public class Globals
    {
        public static string SERVICE_URL;
        public static string DESIGNER_SERVICE_URL;
        public static bool isPhatomJSExist;
        public Globals(IHttpContextAccessor _context, IWebHostEnvironment hostingEnvironment)
        {
            SERVICE_URL = _context.HttpContext.Request.PathBase + "/ReportViewerWebApi";
            DESIGNER_SERVICE_URL = _context.HttpContext.Request.PathBase + "/ReportDesignerWebApi";
            isPhatomJSExist = File.Exists(hostingEnvironment.WebRootPath + @"\PhantomJS\phantomjs.exe");
        }
    }
}
