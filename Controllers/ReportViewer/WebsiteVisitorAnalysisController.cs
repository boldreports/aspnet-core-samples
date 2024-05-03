using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ReportsCoreSamples.Controllers
{
    [Route("report-viewer/website-visitor-analysis")]
    public class WebsiteVisitorAnalysisController : PreviewController
    {
        [HttpGet("")]
        public IActionResult Index()
        {
            this.updateMetaData();
            return View();
        }
    }
}