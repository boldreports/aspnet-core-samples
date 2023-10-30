using BoldReports.Web;
using BoldReports.Writer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace ReportsCoreSamples.Controllers
{

    public class ReportWriterController : PreviewController
    {
        private IWebHostEnvironment _hostingEnvironment;

        public ReportWriterController(IWebHostEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }
        internal ExternalServer Server { get; set; }
        public string ServerURL { get; set; }
        public string getName(string name)
        {
            string[] splittedNames = name.Split('-');
            string sampleName = "";
            foreach (string splittedName in splittedNames)
            {
                sampleName += (char.ToUpper(splittedName[0]) + splittedName.Substring(1));
            }
            return sampleName;
        }

        // GET: ReportWriter
        public ActionResult Index()
        {
            this.updateMetaData();
            return View();
        }

        [HttpPost]
        public IActionResult generate(string reportName, string type)
        {
            try
            {
                string basePath = _hostingEnvironment.WebRootPath;
                string fileName = reportName.Contains("-") ? getName(reportName) : (char.ToUpper(reportName[0]) + reportName.Substring(1));
                WriterFormat format;
                ReportWriter reportWriter = new ReportWriter();

                ExternalServer externalServer = new ExternalServer(_hostingEnvironment);
                this.Server = externalServer;
                this.ServerURL = "Sample";
                externalServer.ReportServerUrl = this.ServerURL;
                reportWriter.ReportingServer = this.Server;
                reportWriter.ReportServerUrl = this.ServerURL;
                reportWriter.ReportServerCredential = System.Net.CredentialCache.DefaultCredentials;

                reportWriter.ReportProcessingMode = ProcessingMode.Remote;
                reportWriter.ExportResources.UsePhantomJS = true;
                reportWriter.ExportResources.PhantomJSPath = basePath + @"\PhantomJS\";

                FileStream inputStream = new FileStream(basePath + @"\Resources\Report\" + reportName + ".rdl", FileMode.Open, FileAccess.Read);
                reportWriter.LoadReport(inputStream);

                reportWriter.ExportResources.Scripts = new List<string>
                {
                    "../../scripts/bold-reports/v2.0/common/bold.reports.common.min.js",
                    "../../scripts/bold-reports/v2.0/common/bold.reports.widgets.min.js",
                    //Report Viewer Script
                    "../../scripts/bold-reports/v2.0/bold.report-viewer.min.js"
                };

                reportWriter.ExportResources.DependentScripts = new List<string>
                {
                    "../../scripts/dependent/jquery.min.js"
                };

                if (type == "pdf")
                {
                    fileName += ".pdf";
                    format = WriterFormat.PDF;
                }
                else if (type == "word")
                {
                    fileName += ".docx";
                    format = WriterFormat.Word;
                }
                else if (type == "csv")
                {
                    fileName += ".csv";
                    format = WriterFormat.CSV;
                }
                else if (type == "html")
                {
                    fileName += ".html";
                    format = WriterFormat.HTML;
                }
                else if (type == "ppt")
                {
                    fileName += ".ppt";
                    format = WriterFormat.PPT;
                }
                else if (type == "xml")
                {
                    fileName += ".xml";
                    format = WriterFormat.XML;
                }
                else
                {
                    fileName += ".xlsx";
                    format = WriterFormat.Excel;
                }
                MemoryStream memoryStream = new MemoryStream();
                reportWriter.Save(memoryStream, format);

                memoryStream.Position = 0;
                string mimeType = "application/" + type;
                FileStreamResult fileStreamResult = new FileStreamResult(memoryStream, mimeType);
                fileStreamResult.FileDownloadName = fileName;
                return fileStreamResult;
            }
            catch
            {
                return null;
            }

        }
    }

}
