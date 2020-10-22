using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using ReportsCoreSamples.Models;

namespace ReportsCoreSamples.Controllers
{
    public class ReportDesignerController : Controller
    {
        public IActionResult Index()
        {
            ViewBag.action = "Preview";
            ViewBag.toolbarSettings = new BoldReports.Models.ReportDesigner.ToolbarSettings();
            ViewBag.toolbarSettings.Items = BoldReports.ReportDesignerEnums.ToolbarItems.All
                                               & ~BoldReports.ReportDesignerEnums.ToolbarItems.Save;
            this.updateMetaData("RDL");
            return View();
        }
        public IActionResult RDLC()
        {
            ViewBag.action = "Preview";
            ViewBag.toolbarSettings = new BoldReports.Models.ReportDesigner.ToolbarSettings();
            ViewBag.toolbarSettings.Items = BoldReports.ReportDesignerEnums.ToolbarItems.All
                                               & ~BoldReports.ReportDesignerEnums.ToolbarItems.Save;
            this.updateMetaData("RDLC");
            return View("~/Views/RDLC/Index.cshtml");
        }
        dynamic getReportSampleData(string routerPath)
        {
            IServiceProvider services = this.HttpContext.RequestServices;
            SampleData _samples = (SampleData)services.GetService(typeof(SampleData));
            dynamic samples = _samples.getSampleData().samples;
            dynamic sampleData = null;
            foreach (dynamic sample in samples)
            {
                if (sample.routerPath == routerPath)
                {
                    sampleData = sample;
                    break;
                }
            }

            return sampleData;
        }

        public void updateMetaData(string reportType)
        {
            string reportName = this.HttpContext.Request.Query["report-name"];
            dynamic sampleData;
            if (!string.IsNullOrEmpty(reportName))
            {
                string formattedName = "";
                string[] splittedNames = reportName.Split('.')[0].Split('-');
                for (int i = 0; i < splittedNames.Length; i++)
                {
                    formattedName += Char.ToUpper(splittedNames[i][0]) + splittedNames[i].Substring(1);
                }
                sampleData = getReportSampleData(formattedName.Trim());
            }
            else
            {
                sampleData = new { sampleName = reportType + " sample", metaData = new { title = "" } };
            }

            updateDesignerMetaData(sampleData);

        }

        public void updateDesignerMetaData(dynamic sampleData)
        {
            string title = String.IsNullOrEmpty((string)sampleData.metaData.title) ? sampleData.sampleName : sampleData.metaData.title;
            string metaContent = "The ASP.NET Core bold report designer allows the end-users to arrange/customize the reports appearance in browsers." +
                        "It helps to edit the " + title + " for customer\"s application needs.";
            title += " | ASP.NET Core Report Designer";
            ViewBag.Title = title.Length < 45 ? title += " | Bold Reports" : title;
            ViewBag.Description = metaContent;
        }
    }
}