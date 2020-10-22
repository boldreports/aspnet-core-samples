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
using System.IO;
using Microsoft.AspNetCore.Hosting;
using System.Data;
using Microsoft.Extensions.Caching.Memory;
using System.Net;
using Samples.Core.Logger;
using System.Reflection;

namespace ReportsCoreSamples.Controllers
{
    [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
    public class ReportDesignerWebApiController : Controller, IReportDesignerController, IReportLogger
    {
        private Microsoft.Extensions.Caching.Memory.IMemoryCache _cache;
#if NETCOREAPP2_1
        private IHostingEnvironment _hostingEnvironment;
#else
        private IWebHostEnvironment _hostingEnvironment;
#endif
        internal ExternalServer Server
        {
            get;
            set;
        }
        internal string ServerURL
        {
            get;
            set;
        }
#if NETCOREAPP2_1
        public ReportDesignerWebApiController(Microsoft.Extensions.Caching.Memory.IMemoryCache memoryCache, IHostingEnvironment hostingEnvironment)
#else
        public ReportDesignerWebApiController(Microsoft.Extensions.Caching.Memory.IMemoryCache memoryCache, IWebHostEnvironment hostingEnvironment)
#endif
        {
            _cache = memoryCache;
            _hostingEnvironment = hostingEnvironment;
            ExternalServer externalServer = new ExternalServer(_hostingEnvironment);
            this.ServerURL = "Sample";
            externalServer.ReportServerUrl = this.ServerURL;
            ReportDesignerHelper.ReportingServer = this.Server = externalServer;
        }

        [ActionName("GetImage")]
        [AcceptVerbs("GET")]
        public object GetImage(string key, string image)
        {
            return ReportDesignerHelper.GetImage(key, image, this);
        }

        [HttpPost]
        public bool DisposeObjects()
        {
            try
            {
                string targetFolder = this._hostingEnvironment.WebRootPath + "\\";
                targetFolder += "Cache";

                if (Directory.Exists(targetFolder))
                {
                    string[] dirs = Directory.GetDirectories(targetFolder);

                    for (var index = 0; index < dirs.Length; index++)
                    {
                        string[] files = Directory.GetFiles(dirs[index]);

                        var fileCount = 0;
                        for (var fileIndex = 0; fileIndex < files.Length; fileIndex++)
                        {
                            FileInfo fi = new FileInfo(files[fileIndex]);
                            if (fi.LastAccessTimeUtc < DateTime.UtcNow.AddDays(-2))
                            {
                                fileCount++;
                            }
                        }

                        if (files.Length == 0 || (files.Length == fileCount))
                        {
                            Directory.Delete(dirs[index], true);
                        }
                    }
                }
                return true;
            }
            catch (Exception ex)
            {
                LogExtension.LogError(ex.Message, ex, MethodBase.GetCurrentMethod());
            }
            return false;
        }


        [ActionName("GetResource")]
        [AcceptVerbs("GET")]
        public object GetResource(ReportResource resource)
        {
            return ReportHelper.GetResource(resource, this, _cache);
        }

        public void OnInitReportOptions(ReportViewerOptions reportOption)
        {
            string reportName = reportOption.ReportModel.ReportPath;
            reportOption.ReportModel.ReportingServer = this.Server;
            reportOption.ReportModel.ReportServerUrl = this.ServerURL;
            reportOption.ReportModel.ReportServerCredential = new NetworkCredential("Sample", "Passwprd");
            if (reportName == "load-large-data.rdlc")
            {
                Models.SqlQuery.getJson(this._cache);
                reportOption.ReportModel.ProcessingMode = ProcessingMode.Remote;
                reportOption.ReportModel.DataSources.Add(new ReportDataSource("SalesOrderDetail", _cache.Get("SalesOrderDetail") as DataTable));
            }

        }

        public void OnReportLoaded(ReportViewerOptions reportOption)
        {

        }

        [HttpPost]
        public object PostDesignerAction([FromBody] Dictionary<string, object> jsonResult)
        {
            this.UpdateReportType(jsonResult);
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
            this.UpdateReportType(jsonResult);
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
                LogExtension.LogError(ex.Message, ex, MethodBase.GetCurrentMethod());
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
                LogExtension.LogError(ex.Message, ex, MethodBase.GetCurrentMethod());
                resource.ErrorMessage = ex.Message;
            }
            return resource;
        }

        public void LogError(string message, Exception exception, MethodBase methodType, ErrorType errorType)
        {
            LogExtension.LogError(message, exception, methodType, errorType == ErrorType.Error ? "Error" : "Info");
        }

        public void LogError(string errorCode, string message, Exception exception, string errorDetail, string methodName, string className)
        {
            LogExtension.LogError(message, exception, System.Reflection.MethodBase.GetCurrentMethod(), errorCode + "-" + errorDetail);
        }

        public void UpdateReportType(Dictionary<string, object> jsonResult)
        {
            string reportType = "";
            if (jsonResult.ContainsKey("customData"))
            {
                string customData = jsonResult["customData"].ToString();
                reportType = (string)(JsonConvert.DeserializeObject(customData) as dynamic).reportType;
            }
            this.Server.reportType = String.IsNullOrEmpty(reportType) ? "RDL" : reportType;
        }

    }

}
