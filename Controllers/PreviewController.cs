using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ReportsCoreSamples.Controllers
{
    public class PreviewController: Controller
    {
        public IActionResult Preview()
        {
            string foderName =  this.ControllerContext.RouteData.Values["controller"].ToString();
            ViewBag.action = "Preview";
            return View("~/Views/" + foderName + "/Index.cshtml");
        }
    }
}
