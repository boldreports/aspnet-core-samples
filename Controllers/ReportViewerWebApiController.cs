using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using BoldReports.Web;
using BoldReports.Web.ReportViewer;
using Microsoft.AspNetCore.Hosting;
using BoldReports.Models.ReportViewer;
using System.Data;
using Microsoft.Extensions.Caching.Memory;
using System.Reflection;
using log4net.Util;
using log4net;
using Samples.Core.Logger;

namespace ReportsCoreSamples.Controllers
{
    [Microsoft.AspNetCore.Cors.EnableCors("AllowAllOrigins")]
    public class ReportViewerWebApiController : Controller, IReportController, IReportLogger
    {
        // Report viewer requires a memory cache to store the information of consecutive client request and
        // have the rendered report viewer information in server.
        private Microsoft.Extensions.Caching.Memory.IMemoryCache _cache;

        // IHostingEnvironment used with sample to get the application data from wwwroot.
#if NETCOREAPP2_1
        private IHostingEnvironment _hostingEnvironment;
#else
        private IWebHostEnvironment _hostingEnvironment;
#endif

        // Post action to process the report from server based json parameters and send the result back to the client.
#if NETCOREAPP2_1
        public ReportViewerWebApiController(Microsoft.Extensions.Caching.Memory.IMemoryCache memoryCache,
            IHostingEnvironment hostingEnvironment)
#else
        public ReportViewerWebApiController(Microsoft.Extensions.Caching.Memory.IMemoryCache memoryCache,
            IWebHostEnvironment hostingEnvironment)
#endif
        {
            _cache = memoryCache;
            _hostingEnvironment = hostingEnvironment;
        }

        // Post action to process the report from server based json parameters and send the result back to the client.
        [HttpPost]
        public object PostReportAction([FromBody] Dictionary<string, object> jsonArray)
        {
            return ReportHelper.ProcessReport(jsonArray, this, this._cache);
        }

        // Method will be called to initialize the report information to load the report with ReportHelper for processing.
        public void OnInitReportOptions(ReportViewerOptions reportOption)
        {
            reportOption.ReportModel.EmbedImageData = true;
            string reportName = reportOption.ReportModel.ReportPath;
            string basePath = _hostingEnvironment.WebRootPath;
            FileStream reportStream = new FileStream(basePath + @"\resources\Report\" + reportOption.ReportModel.ReportPath, FileMode.Open, FileAccess.Read);
            reportOption.ReportModel.Stream = reportStream;
            if (reportName == "load-large-data.rdlc")
            {
                Models.SqlQuery.getJson(this._cache);
                reportOption.ReportModel.DataSources.Add(new BoldReports.Web.ReportDataSource("SalesOrderDetail", this._cache.Get("SalesOrderDetail") as DataTable));
            }

        }

        // Method will be called when reported is loaded with internally to start to layout process with ReportHelper.
        public void OnReportLoaded(ReportViewerOptions reportOption)
        {
        }

        //Get action for getting resources from the report
        [ActionName("GetResource")]
        [AcceptVerbs("GET")]
        // Method will be called from Report Viewer client to get the image src for Image report item.
        public object GetResource(ReportResource resource)
        {
            return ReportHelper.GetResource(resource, this, this._cache);
        }

        [HttpPost]
        public object PostFormReportAction()
        {
            return ReportHelper.ProcessReport(null, this, _cache);
        }
        public void LogError(string message, Exception exception, MethodBase methodType, ErrorType errorType)
        {
            LogExtension.LogError(message, exception, methodType, errorType == ErrorType.Error ? "Error" : "Info");
        }

        public void LogError(string errorCode, string message, Exception exception, string errorDetail, string methodName, string className)
        {
            LogExtension.LogError(message, exception, System.Reflection.MethodBase.GetCurrentMethod(), errorCode + "-" + errorDetail);
        }
    }
}