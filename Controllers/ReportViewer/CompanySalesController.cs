using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ReportsCoreSamples.Controllers
{
    [Route("report-viewer/company-sales")]
    public class CompanySalesController : PreviewController
    {
        [HttpGet("")]
        public IActionResult Index()
        {
            this.updateMetaData();
            return View();
        }
    }
}