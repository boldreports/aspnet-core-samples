using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ReportsCoreSamples.Controllers
{
    [Route("report-viewer/sales-report")]
    public class SalesReportController : PreviewController
    {
        [HttpGet("")]
        public IActionResult Index()
        {
            this.updateMetaData();
            return View();
        }
    }
}