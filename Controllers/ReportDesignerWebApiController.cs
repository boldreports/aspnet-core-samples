using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using BoldReports.Web;
using BoldReports.Web.ReportDesigner;
using BoldReports.Web.ReportViewer;
using Newtonsoft.Json;

namespace ReportsCoreSamples.Controllers
{
    [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
    public class ReportDesignerWebApiController : Controller, IReportDesignerController
    {
        private Microsoft.Extensions.Caching.Memory.IMemoryCache _cache;
        private Microsoft.AspNetCore.Hosting.IHostingEnvironment _hostingEnvironment;
        internal ExternalServer Server
        {
            get;
            set;
        }

        public ReportDesignerWebApiController(Microsoft.Extensions.Caching.Memory.IMemoryCache memoryCache, Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment)
        {
            _cache = memoryCache;
            _hostingEnvironment = hostingEnvironment;
            ExternalServer externalServer = new ExternalServer(_hostingEnvironment);
            ReportDesignerHelper.ReportingServer = this.Server = externalServer;
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
            string reportType = "";
            if (jsonResult.ContainsKey("customData"))
            {
                string customData = jsonResult["customData"].ToString();
                reportType = (string)(JsonConvert.DeserializeObject(customData) as dynamic).reportType;
            }
            this.Server.reportType = String.IsNullOrEmpty(reportType) ? "RDL" : reportType;
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

        [HttpPost]
        public void UploadReportAction()
        {
            ReportDesignerHelper.ProcessDesigner(null, this, this.Request.Form.Files[0], this._cache);
        }

        private string GetFilePath(string itemName, string key)
        {
            string targetFolder = this._hostingEnvironment.WebRootPath + "\\";
            targetFolder += "Cache";

            if (!System.IO.Directory.Exists(targetFolder))
            {
                System.IO.Directory.CreateDirectory(targetFolder);
            }

            if (!System.IO.Directory.Exists(targetFolder + "\\" + key))
            {
                System.IO.Directory.CreateDirectory(targetFolder + "\\" + key);
            }

            return targetFolder + "\\" + key + "\\" + itemName;
        }

        public bool SetData(string key, string itemId, ItemInfo itemData, out string errMsg)
        {
            errMsg = string.Empty;
            try
            {
                if (itemData.Data != null)
                {
                    System.IO.File.WriteAllBytes(this.GetFilePath(itemId, key), itemData.Data);
                }
                else if (itemData.PostedFile != null)
                {
                    var fileName = itemId;
                    if (string.IsNullOrEmpty(itemId))
                    {
                        fileName = System.IO.Path.GetFileName(itemData.PostedFile.FileName);
                    }

                    using (System.IO.MemoryStream stream = new System.IO.MemoryStream())
                    {
                        itemData.PostedFile.OpenReadStream().CopyTo(stream);
                        byte[] bytes = stream.ToArray();
                        var writePath = this.GetFilePath(fileName, key);

                        if (System.IO.File.Exists(writePath))
                        {
                            System.IO.File.Delete(writePath);
                        }

                        System.IO.File.WriteAllBytes(writePath, bytes);
                        stream.Close();
                        stream.Dispose();
                    }
                }
            }
            catch (Exception ex)
            {
                errMsg = ex.Message;
                return false;
            }
            return true;
        }

        public ResourceInfo GetData(string key, string itemId)
        {
            var resource = new ResourceInfo();
            try
            {
                resource.Data = System.IO.File.ReadAllBytes(this.GetFilePath(itemId, key));
            }
            catch (Exception ex)
            {
                resource.ErrorMessage = ex.Message;
            }
            return resource;
        }
    }

}