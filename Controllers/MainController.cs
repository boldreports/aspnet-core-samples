using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ReportsCoreSamples.Models;

namespace ReportsCoreSamples.Controllers
{
    public class MainController : Controller
    {
        private SampleData _samples;
        public MainController(SampleData samples)
        {
            _samples = samples;
        }
        public IActionResult Index()
        {
            dynamic sampleData = _samples.getSampleData();
            string defaultPath = sampleData.samples[0].routerPath.Value;
            return RedirectToAction("Index", defaultPath);
        }
    }
}