using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.IO;
using System.Net;
using System.Xml.Serialization;
using System.Xml;
using System.Net.Http;
using Syncfusion.Reporting.ServerProcessor;
using System.Web;
using System.Text.RegularExpressions;

namespace ReportsCoreSamples.Controllers
{
    public sealed class ExternalServer : ReportingServer
    {
        // IHostingEnvironment used with sample to get the application data from wwwroot.
        private Microsoft.AspNetCore.Hosting.IHostingEnvironment _hostingEnvironment;
        string basePath;
        public ExternalServer(Microsoft.AspNetCore.Hosting.IHostingEnvironment hostingEnvironment)
        {
            _hostingEnvironment = hostingEnvironment;
            basePath = _hostingEnvironment.WebRootPath;
        }

        public override List<CatalogItem> GetItems(string folderName, ItemTypeEnum type)
        {
            List<CatalogItem> _items = new List<CatalogItem>();

            string targetFolder = this.basePath + @"\Resources\";

            if (type == ItemTypeEnum.Folder || type == ItemTypeEnum.Report)
            {
                targetFolder = targetFolder + @"Report\";
                if (!(string.IsNullOrEmpty(folderName) || folderName.Trim() == "/"))
                {
                    targetFolder = targetFolder + folderName;
                }
            }

            if (type == ItemTypeEnum.DataSet)
            {
                foreach (var file in Directory.GetFiles(targetFolder + "DataSet"))
                {
                    CatalogItem catalogItem = new CatalogItem();
                    catalogItem.Name = Path.GetFileNameWithoutExtension(file);
                    catalogItem.Type = ItemTypeEnum.DataSet;
                    catalogItem.Id = Regex.Replace(catalogItem.Name, @"[^0-9a-zA-Z]+", "_");
                    _items.Add(catalogItem);
                }
            }
            else if (type == ItemTypeEnum.DataSource)
            {
                foreach (var file in Directory.GetFiles(targetFolder + "DataSource"))
                {
                    CatalogItem catalogItem = new CatalogItem();
                    catalogItem.Name = Path.GetFileNameWithoutExtension(file);
                    catalogItem.Type = ItemTypeEnum.DataSource;
                    catalogItem.Id = Regex.Replace(catalogItem.Name, @"[^0-9a-zA-Z]+", "_");
                    _items.Add(catalogItem);
                }
            }
            else if (type == ItemTypeEnum.Folder)
            {
                foreach (var file in Directory.GetDirectories(targetFolder))
                {
                    CatalogItem catalogItem = new CatalogItem();
                    catalogItem.Name = Path.GetFileNameWithoutExtension(file);
                    catalogItem.Type = ItemTypeEnum.Folder;
                    catalogItem.Id = Regex.Replace(catalogItem.Name, @"[^0-9a-zA-Z]+", "_");
                    _items.Add(catalogItem);
                }
            }
            else if (type == ItemTypeEnum.Report)
            {
                foreach (var file in Directory.GetFiles(targetFolder, "*.rdl"))
                {
                    CatalogItem catalogItem = new CatalogItem();
                    catalogItem.Name = Path.GetFileNameWithoutExtension(file);
                    catalogItem.Type = ItemTypeEnum.Report;
                    catalogItem.Id = Regex.Replace(catalogItem.Name, @"[^0-9a-zA-Z]+", "_");
                    _items.Add(catalogItem);
                }
            }

            return _items;
        }

        public override bool CreateReport(string reportName, string folderName, byte[] reportdata, out string exception)
        {
            return base.CreateReport(reportName, folderName, reportdata, out exception);
        }

        public override System.IO.Stream GetReport()
        {
            string reportPath = this.ReportPath.TrimStart('/').TrimEnd('/').Trim();
            string reportName = reportPath.Substring(reportPath.IndexOf('/') + 1).Trim();
            string targetFolder = this.basePath + @"\Resources\Report\";
            string reportPat = targetFolder + reportName + ".rdl";

            if (File.Exists(reportPat))
            {
                return this.ReadFiles(reportPat);
            }

            return null;
        }

        private Stream ReadFiles(string filePath)
        {
            using (FileStream fileStream = File.OpenRead(filePath))
            {
                fileStream.Position = 0;
                MemoryStream memStream = new MemoryStream();
                memStream.SetLength(fileStream.Length);
                fileStream.Read(memStream.GetBuffer(), 0, (int)fileStream.Length);
                return memStream;
            }
        }

        public override bool EditReport(byte[] reportdata)
        {
            string reportPath = this.ReportPath.TrimStart('/').TrimEnd('/').Trim();
            string reportName = reportPath.Substring(reportPath.IndexOf('/') + 1).Trim();
            string catagoryName = reportPath.Substring(0, reportPath.IndexOf('/') > 0 ? reportPath.IndexOf('/') : 0).Trim();
            string targetFolder = this.basePath + @"\Resources\Report\";

            string reportPat = targetFolder + catagoryName + @"\" + reportName + ".rdl";
            File.WriteAllBytes(reportPat, reportdata.ToArray());

            return true;
        }

        public override DataSourceDefinition GetDataSourceDefinition(string dataSource)
        {
            if (dataSource != null && dataSource.Contains("/"))
            {
                string[] _dataSrcPathHierarchy = dataSource.Split('/');
                dataSource = _dataSrcPathHierarchy.Last().TrimStart('/');
            }

            string targetFolder = this.basePath + @"\Resources\DataSource\";

            string dataSourcePath = targetFolder + dataSource + ".rds";

            if (File.Exists(dataSourcePath))
            {
                var _sharedDatasetInfo = new SharedDatasetinfo();
                var stream = this.ReadFiles(dataSourcePath);
                int length = Convert.ToInt32(stream.Length);
                byte[] data = new byte[length];
                stream.Read(data, 0, length);
                stream.Close();
                return this.GetDataSourceDefinition(data, dataSource, null);
            }

            return null;
        }

        DataSourceDefinition GetDataSourceDefinition(byte[] dataSourceContent, string name, string guid)
        {
            var _rptDefinition = new DataSourceDefinition();
            var _datasourceStream = this.GetFileToStream(dataSourceContent);
            var _umpDefinition = this.DeseralizeObj<DataSourceDefinition>(_datasourceStream);
            _rptDefinition = _umpDefinition;
            return _rptDefinition;
        }

        public override SharedDatasetinfo GetSharedDataDefinition(string dataSet)
        {
            string targetFolder = this.basePath + @"\Resources\DataSet\";
            string dataSetPath = targetFolder + dataSet + ".rsd";

            if (File.Exists(dataSetPath))
            {
                var _sharedDatasetInfo = new SharedDatasetinfo();
                var stream = this.ReadFiles(dataSetPath);
                int length = Convert.ToInt32(stream.Length);
                byte[] data = new byte[length];
                stream.Read(data, 0, length);
                stream.Close();
                var _datasetStream = this.GetFileToStream(data);
                _sharedDatasetInfo.DataSetStream = _datasetStream;
                _sharedDatasetInfo.Guid = Guid.Empty.ToString();
                return _sharedDatasetInfo;
            }

            return null;
        }

        T DeseralizeObj<T>(Stream str)
        {
            XmlSerializer serializer = new XmlSerializer(typeof(T));
            XmlReader reader = XmlReader.Create(str);
            return (T)serializer.Deserialize(reader);
        }

        private Stream GetFileToStream(byte[] _fileContent)
        {
            MemoryStream memStream = new MemoryStream();
            memStream.Write(_fileContent, 0, _fileContent.Length);
            memStream.Seek(0, SeekOrigin.Begin);
            return memStream;
        }
    }
}