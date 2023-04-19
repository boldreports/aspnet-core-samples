using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ReportsCoreSamples.Models;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.AspNetCore.Mvc;

namespace ReportsCoreSamples.Controllers
{
    public class ExternalParameterReportController : PreviewController
    {
        private Microsoft.Extensions.Caching.Memory.IMemoryCache _cache;
        public ExternalParameterReportController(Microsoft.Extensions.Caching.Memory.IMemoryCache memoryCache)
        {
            _cache = memoryCache;
        }
        public IActionResult Index()
        {
            ViewBag.parameterSettings = new BoldReports.Models.ReportViewer.ParameterSettings();
            ViewBag.parameterSettings.HideParameterBlock = true;
            this.updateMetaData();
            return View();
        }
    }
}
