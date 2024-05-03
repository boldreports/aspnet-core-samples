using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ReportsCoreSamples.Controllers.ReportViewer
{
    [Route("report-viewer/spark-line")]
    public class SparkLineController : PreviewController
    {
        [HttpGet("")]
        public IActionResult Index()
        {
            this.updateMetaData();
            return View();
        }
    }
}