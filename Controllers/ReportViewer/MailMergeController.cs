using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ReportsCoreSamples.Controllers
{
    public class MailMergeController : PreviewController
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}