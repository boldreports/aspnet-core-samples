namespace Samples.Core.Logger
{
    using System;
    using System.Configuration;
    using System.IO;
    using System.Reflection;
    using log4net;
    using System.Xml;
    using log4net.Config;
    using Microsoft.AspNetCore.Hosting;

    public static class LogExtension
    {
        private static readonly log4net.ILog Log = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);

        public static void LogInfo(string message, MethodBase methodType, string optionalData = "", string tenantUrl = null)
        {
            GenerateLog(message, null, methodType, optionalData, tenantUrl);
        }

        public static void LogError(string message, Exception exception, MethodBase methodType, string optionalData = "", string tenantUrl = null)
        {
            GenerateLog(message, exception, methodType, optionalData, tenantUrl);
        }

        public static void GenerateLog(string message, Exception exception, MethodBase methodType, string optionalData = "", string tenantUrl = null)
        {
            var nameSpace = string.Empty;
            var methodName = string.Empty;
            var dns = string.Empty;
            var host = tenantUrl;

            bool isLogOptionalData = ConfigurationManager.AppSettings["IsLogOptionalData"] == null ? false : Convert.ToBoolean(ConfigurationManager.AppSettings["IsLogOptionalData"]);

            optionalData = isLogOptionalData ? optionalData : string.Empty;

            if (methodType != null)
            {
                methodName = !string.IsNullOrWhiteSpace(methodType.Name) ? methodType.Name : string.Empty;

                if (methodType.DeclaringType != null)
                {
                    nameSpace = !string.IsNullOrWhiteSpace(methodType.DeclaringType.FullName)
                        ? methodType.DeclaringType.FullName
                        : string.Empty;
                }
            }

            if (Uri.IsWellFormedUriString(tenantUrl, UriKind.Absolute))
            {
                Uri uri = new Uri(tenantUrl);
                host = uri.Host;
            }

            dns = host?.Split('.').Length == 3 ? host.Split('.')[0] : host;

            log4net.LogicalThreadContext.Properties["Domain"] = host;
            log4net.LogicalThreadContext.Properties["dns"] = dns;
            if (exception != null)
                log4net.LogicalThreadContext.Properties["level"] = "error";
            log4net.LogicalThreadContext.Properties["level"] = "info";
            log4net.LogicalThreadContext.Properties["NameSpace"] = nameSpace;
            log4net.LogicalThreadContext.Properties["MethodName"] = methodName;
            log4net.LogicalThreadContext.Properties["OptionalData"] = optionalData;
            log4net.LogicalThreadContext.Properties["ActivityId"] = log4net.LogicalThreadContext.Properties["ActivityId"] ?? Guid.Empty;
            if (exception != null)
                Log.Error(message, exception);
            Log.Info(message);

        }

        static log4net.Repository.ILoggerRepository repository = log4net.LogManager.GetRepository(Assembly.GetCallingAssembly());

        public static void RegisterLog4NetConfig(string configPath = "")
        {
            var folderPath = GetExecutablePath();
            var prjDir = Path.GetFullPath(Path.Combine(folderPath));
            if (!string.IsNullOrEmpty(configPath) && File.Exists(configPath))
            {
                XmlConfigurator.Configure(repository, new System.IO.FileInfo(configPath));
            }
            else if (File.Exists(prjDir + "\\Log4Net.config"))
            {
                XmlConfigurator.Configure(repository, new System.IO.FileInfo(prjDir + "\\Log4Net.config"));
            }
            else if (File.Exists(prjDir + "\\logs\\Log4Net.config"))
            {
                XmlConfigurator.Configure(repository, new System.IO.FileInfo(prjDir + "\\logs\\Log4Net.config"));
            }
            else
            {
                if (!(log4net.GlobalContext.Properties["LogPath"] != null && log4net.GlobalContext.Properties["LogPath"] is string && (log4net.GlobalContext.Properties["LogPath"] as string).Length > 0))
                {
                    log4net.GlobalContext.Properties["LogPath"] = folderPath;
                }
                var configData = Assembly.GetExecutingAssembly().GetManifestResourceStream("Samples.Core.Logger.Log4Net.config");
                XmlDocument doc = new XmlDocument();
                doc.Load(configData);
                log4net.Config.XmlConfigurator.Configure((log4net.Repository.ILoggerRepository)doc.DocumentElement["log4net"]);
            }
        }

        public static void RegisterLog4NetConfig(FileInfo configInfo)
        {
            log4net.Config.XmlConfigurator.Configure(repository, configInfo);
        }

        private static string GetExecutablePath()
        {
            string path = (string)(log4net.GlobalContext.Properties["LogPath"] + "\\");
            return Path.GetDirectoryName(path);
        }
    }
}