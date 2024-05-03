using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ReportsCoreSamples.Controllers
{

    public class PreviewController : MetaData
    {
        [HttpGet("preview")]
        public IActionResult Preview()
        {
            string foderName = this.ControllerContext.RouteData.Values["controller"].ToString();
            ViewBag.action = "Preview";
            ViewBag.isDesigner = false;
            if (foderName == "ExternalParameterReport")
            {
                ViewBag.parameterSettings = new BoldReports.Models.ReportViewer.ParameterSettings();
                ViewBag.parameterSettings.HideParameterBlock = true;
            }
            this.updateMetaData();
            return View("~/Views/" + foderName + "/Index.cshtml");
        }
    }
}