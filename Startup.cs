using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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

namespace ReportsCoreSamples
{
    public class Startup
    {

        public Startup(IConfiguration configuration, IHostingEnvironment _hostingEnvironment)
        {
            string License = File.ReadAllText(System.IO.Path.Combine(_hostingEnvironment.ContentRootPath, "BoldLicense.txt"), Encoding.UTF8);
            BoldLicenseProvider.RegisterLicense(License);
            ReportConfig.DefaultSettings = new ReportSettings()
            {
                MapSetting = this.GetMapSettings(_hostingEnvironment)
            };

            Configuration = configuration;
            env = _hostingEnvironment;
        }

        public IHostingEnvironment env { get; }
        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            services.AddMvc().SetCompatibilityVersion(CompatibilityVersion.Version_2_1);
            services.AddHttpContextAccessor();
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

        private BoldReports.Web.MapSetting GetMapSettings(IHostingEnvironment _hostingEnvironment)
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
            catch (Exception ex) { }
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

            app.UseMvc(routes =>
                {
                    routes.MapRoute(
                          name: "ReportViewer",
                          template: "ReportViewer/{controller}/{action=Index}/{id?}");
                    routes.MapRoute(
                        name: "default",
                        template: "{controller=Main}/{action=Index}/{id?}");
                });
        }
    }
}
