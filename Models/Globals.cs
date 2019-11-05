using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Syncfusion.Reporting.Models.ReportViewer;

namespace ReportsCoreSamples.Models
{
    public class Globals
    {
        public static string SERVICE_URL;
        public static string DESIGNER_SERVICE_URL;
        public Globals(IHttpContextAccessor _context)
        {
            SERVICE_URL = _context.HttpContext.Request.PathBase + "/ReportViewerAPI";
            DESIGNER_SERVICE_URL = _context.HttpContext.Request.PathBase + "/ReportDesignerAPI";

        }

        public Toolbar toolbarSettings()
        {
           return new Toolbar();
        }
    }

    public class Toolbar
    {
        public bool showToolbar { get; set; }
        public List<object> customGroups = new List<object>();

        public Toolbar()
        {
            showToolbar = true;
           customGroups.Add(new { type = "Default", cssClass= "e-icon e-edit e-reportviewer-icon ej-webicon CustomGroup", id= "edit-report", groupIndex=3, tooltip = new Tooltip("Edit Report", "Edit this report in designer") });
        }

    
    }



    public class Tooltip
    {
        public string header { get; set; }
        public string content { get; set; }

        public Tooltip(string header, string content)
        {
            this.header = header;
            this.content = content;
        }
    }
}
