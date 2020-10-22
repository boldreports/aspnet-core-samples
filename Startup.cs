using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using System.IO;
using ReportsCoreSamples.Models;
using Microsoft.AspNetCore.ResponseCompression;
using System.Text;
using Bold.Licensing;
using BoldReports.Web;
using Newtonsoft.Json;
using System.Reflection;
using Samples.Core.Logger;

#if NETCOREAPP2_1
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
#else
using Microsoft.Extensions.Hosting;
#endif

namespace ReportsCoreSamples
{
    public class Startup
    {

#if NETCOREAPP2_1
        public Startup(IConfiguration configuration, IHostingEnvironment _hostingEnvironment)
#else
        public Startup(IConfiguration configuration, IWebHostEnvironment _hostingEnvironment)
#endif
        {
            log4net.GlobalContext.Properties["LogPath"] = _hostingEnvironment.ContentRootPath;
            LogExtension.RegisterLog4NetConfig();

            string License = File.ReadAllText(System.IO.Path.Combine(_hostingEnvironment.ContentRootPath, "BoldLicense.txt"), Encoding.UTF8);
            BoldLicenseProvider.RegisterLicense(License);
            ReportConfig.DefaultSettings = new ReportSettings()
            {
                MapSetting = this.GetMapSettings(_hostingEnvironment)
            }.RegisterExtensions(this.GetDataExtension(configuration.GetSection("appSettings").GetSection("ExtAssemblies").Value));

            Configuration = configuration;
            env = _hostingEnvironment;
        }
        private List<string> GetDataExtension(string ExtAssemblies)
        {
            var extensions = !string.IsNullOrEmpty(ExtAssemblies) ? ExtAssemblies : string.Empty;
            try
            {
                return new List<string>(extensions.Split(new string[] { ";" }, StringSplitOptions.RemoveEmptyEntries));
            }
            catch (Exception ex)
            {
                LogExtension.LogError("Failed to Load Data Extension", ex, MethodBase.GetCurrentMethod());
            }
            return null;
        }

#if NETCOREAPP2_1
        public IHostingEnvironment env { get; }
#else
        public IWebHostEnvironment env { get; }
#endif
        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
#if NETCOREAPP2_1
            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
#else
            services.AddControllersWithViews();
#endif
            services.AddHttpContextAccessor();
            services.AddMemoryCache();
            services.Configure<GzipCompressionProviderOptions>(options => options.Level = System.IO.Compression.CompressionLevel.Optimal);
            services.AddResponseCompression();
            services.Add(new ServiceDescriptor(typeof(SampleData), new SampleData(env)));
            services.Add(new ServiceDescriptor(typeof(Globals), typeof(Globals), ServiceLifetime.Transient));
            services.AddCors(o => o.AddPolicy("AllowAllOrigins", builder =>
            {
                builder.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
            }));
        }

#if NETCOREAPP2_1
        private BoldReports.Web.MapSetting GetMapSettings(IHostingEnvironment _hostingEnvironment)
#else
        private BoldReports.Web.MapSetting GetMapSettings(IWebHostEnvironment _hostingEnvironment)
#endif
        {
            try
            {
                string basePath = _hostingEnvironment.WebRootPath;
                return new MapSetting()
                {
                    ShapePath = basePath + "\\ShapeData\\",
                    MapShapes = JsonConvert.DeserializeObject<List<MapShape>>(System.IO.File.ReadAllText(basePath + "\\ShapeData\\mapshapes.txt"))
                };
            }
            catch (Exception ex) { Console.WriteLine(ex); }
            return null;
        }


        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseResponseCompression();
            app.UseFileServer();

            app.UseStaticFiles(new StaticFileOptions
            {
                ServeUnknownFileTypes = true,
                DefaultContentType = "plain/text",
                FileProvider = new PhysicalFileProvider(
            Path.Combine(Directory.GetCurrentDirectory(), "Controllers")),
                RequestPath = "/Controllers"
            });

            app.UseStaticFiles(new StaticFileOptions
            {
                ServeUnknownFileTypes = true,
                DefaultContentType = "plain/text",
                FileProvider = new PhysicalFileProvider(
            Path.Combine(Directory.GetCurrentDirectory(), "Views")),
                RequestPath = "/Views"
            });

#if NETCOREAPP2_1
            app.UseMvc(routes =>
                {
                    routes.MapRoute(
                          name: "ReportViewer",
                          template: "ReportViewer/{controller}/{action=Index}/{id?}");
                    routes.MapRoute(
                        name: "default",
                        template: "{controller=Main}/{action=Index}/{id?}");
                });
#else
            app.UseRouting();
            app.UseCors("AllowAllOrigins");
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                          name: "ReportViewer",
                          pattern: "ReportViewer/{controller}/{action=Index}/{id?}");
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Main}/{action=Index}/{id?}");
            });
#endif
        }
    }
}
