using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Syncfusion.Reporting.Web;
using Syncfusion.Reporting.Web.ReportDesigner;
using Syncfusion.Reporting.Web.ReportViewer;

namespace ReportsCoreSamples.Controllers
{
    [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
    public class ReportDesignerAPIController : Controller, IReportDesignerController
    {
        private Microsoft.Extensions.Caching.Memory.IMemoryCache _cache;
        private Microsoft.AspNetCore.Hosting.IHostingEnvironment _hostingEnvironment;

        public ReportDesignerAPIController(Microsoft.Extensions.Caching.Memory.IMemoryCache memoryCache, Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment)
        {
            _cache = memoryCache;
            _hostingEnvironment = hostingEnvironment;
            ExternalServer externalServer = new ExternalServer(_hostingEnvironment);
            ReportDesignerHelper.ReportingServer = externalServer;
        }

        public string GetFilePath(string fileName)
        {
            string targetFolder = this._hostingEnvironment.WebRootPath + "\\";
            targetFolder += "Cache";

            if (!System.IO.Directory.Exists(targetFolder))
            {
                System.IO.Directory.CreateDirectory(targetFolder);
            }

            if (!System.IO.Directory.Exists(targetFolder + "\\" + ReportDesignerHelper.EJReportDesignerToken))
            {
                System.IO.Directory.CreateDirectory(targetFolder + "\\" + ReportDesignerHelper.EJReportDesignerToken);
            }

            var folderPath = targetFolder + "\\" + ReportDesignerHelper.EJReportDesignerToken + "\\";
            return folderPath + fileName;
        }

        [ActionName("GetImage")]
        [AcceptVerbs("GET")]
        public object GetImage(string key, string image)
        {
            return ReportDesignerHelper.GetImage(key, image, this);
        }

        [ActionName("GetResource")]
        [AcceptVerbs("GET")]
        public object GetResource(ReportResource resource)
        {
            return ReportHelper.GetResource(resource, this, _cache);
        }

        public void OnInitReportOptions(ReportViewerOptions reportOption)
        {

        }

        public void OnReportLoaded(ReportViewerOptions reportOption)
        {

        }

        [HttpPost]
        public object PostDesignerAction([FromBody] Dictionary<string, object> jsonResult)
        {
            return ReportDesignerHelper.ProcessDesigner(jsonResult, this, null, this._cache);
        }

        [HttpPost]
        public object PostFormDesignerAction()
        {
            return ReportDesignerHelper.ProcessDesigner(null, this, null, this._cache);
        }

        [HttpPost]
        public object PostFormReportAction()
        {
            return ReportHelper.ProcessReport(null, this, this._cache);
        }

        [HttpPost]
        public object PostReportAction([FromBody] Dictionary<string, object> jsonResult)
        {
            return ReportHelper.ProcessReport(jsonResult, this, this._cache);
        }

        public bool UploadFile(IFormFile httpPostedFile)
        {
            string targetFolder = this._hostingEnvironment.WebRootPath + "\\";
            string fileName = !string.IsNullOrEmpty(ReportDesignerHelper.SaveFileName) ? ReportDesignerHelper.SaveFileName : System.IO.Path.GetFileName(httpPostedFile.FileName);
            targetFolder += "Cache";

            if (!System.IO.Directory.Exists(targetFolder))
            {
                System.IO.Directory.CreateDirectory(targetFolder);
            }

            if (!System.IO.Directory.Exists(targetFolder + "\\" + ReportDesignerHelper.EJReportDesignerToken))
            {
                System.IO.Directory.CreateDirectory(targetFolder + "\\" + ReportDesignerHelper.EJReportDesignerToken);
            }
            using (var reader = new System.IO.StreamReader(httpPostedFile.OpenReadStream()))
            {
                string contentAsString = reader.ReadToEnd();
                byte[] bytes = System.Text.Encoding.ASCII.GetBytes(contentAsString);
                if (System.IO.File.Exists(targetFolder + "\\" + ReportDesignerHelper.EJReportDesignerToken + "\\" + fileName))
                {
                    System.IO.File.Delete(targetFolder + "\\" + ReportDesignerHelper.EJReportDesignerToken + "\\" + fileName);
                }
                System.IO.File.WriteAllBytes(targetFolder + "\\" + ReportDesignerHelper.EJReportDesignerToken + "\\" + fileName, bytes);
                reader.Close();
                reader.Dispose();
            }
            return true;
        }

        [HttpPost]
        public void UploadReportAction()
        {
            ReportDesignerHelper.ProcessDesigner(null, this, this.Request.Form.Files[0], this._cache);
        }

        public FileModel GetFile(string filename, bool isOverride)
        {
            throw new NotImplementedException();
        }

        public List<FileModel> GetFiles(FileType fileType)
        {
            throw new NotImplementedException();
        }
    }

}