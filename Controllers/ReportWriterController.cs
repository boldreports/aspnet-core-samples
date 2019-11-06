using BoldReports.Web;
using BoldReports.Writer;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

using Microsoft.AspNetCore.Mvc;
using System.IO;

namespace ReportsCoreSamples.Controllers
{
    public class ReportWriterController : PreviewController
    {
        public Microsoft.AspNetCore.Hosting.IHostingEnvironment _hostingEnvironment;

        public ReportWriterController(Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
        }
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
                reportWriter.ReportProcessingMode = ProcessingMode.Remote;

                FileStream inputStream = new FileStream(basePath + @"\Resources\Report\" + reportName + ".rdl", FileMode.Open, FileAccess.Read);
                reportWriter.LoadReport(inputStream);
                if (type == "pdf")
                {
                    fileName += ".pdf";
                    format = WriterFormat.PDF;
                }
                else if (type == "word")
                {
                    fileName += ".doc";
                    format = WriterFormat.Word;
                }
                else if (type == "csv")
                {
                    fileName += ".csv";
                    format = WriterFormat.CSV;
                }
                else
                {
                    fileName += ".xls";
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