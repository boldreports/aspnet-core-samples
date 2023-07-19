using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Antiforgery;
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
    public class CSRFHandler
    {
        private readonly IAntiforgery _antiforgery;
        private readonly RequestDelegate _next;

        public CSRFHandler(IAntiforgery antiforgery, RequestDelegate next)
        {
            _antiforgery = antiforgery;
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.Request.Cookies["CSRF-TOKEN"] == null)
            {
                var token = _antiforgery.GetAndStoreTokens(context);                
                context.Response.Cookies.Append("CSRF-TOKEN", token.RequestToken, new Microsoft.AspNetCore.Http.CookieOptions 
                {  
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    HttpOnly = true 
                });
                context.Response.Cookies.Append("X-CSRF-TOKEN", token.RequestToken, new Microsoft.AspNetCore.Http.CookieOptions
                {
                    Secure = true,
                    SameSite = SameSiteMode.None,
                    HttpOnly = true
                });
            }
            await _next(context);
        }
    }
}