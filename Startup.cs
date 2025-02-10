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
using System.IO.Compression;
using ReportsCoreSamples.Models;
using Microsoft.AspNetCore.ResponseCompression;
using System.Text;
using Bold.Licensing;
using BoldReports.Web;
using Newtonsoft.Json;
using System.Reflection;
using Samples.Core.Logger;

using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.CookiePolicy;

namespace ReportsCoreSamples
{
    public class Startup
    {

        public Startup(IConfiguration configuration, IWebHostEnvironment _hostingEnvironment)
        {
            log4net.GlobalContext.Properties["LogPath"] = _hostingEnvironment.ContentRootPath;
            LogExtension.RegisterLog4NetConfig();

            string License = File.ReadAllText(System.IO.Path.Combine(_hostingEnvironment.ContentRootPath, "BoldLicense.txt"), Encoding.UTF8);
            BoldLicenseProvider.RegisterLicense(License, bool.Parse(configuration.GetSection("appSettings").GetSection("IsOfflineLicense").Value), bool.Parse(configuration.GetSection("appSettings").GetSection("EnableLicenseLog").Value));
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
                var ExtNames =  new List<string>(extensions.Split(new string[] { ";" }, StringSplitOptions.RemoveEmptyEntries));
                List<string> ExtCollections = new List<string>();
                ExtNames.ForEach(Extension => ExtCollections.Add(System.IO.Path.Combine(System.AppDomain.CurrentDomain.BaseDirectory, Extension + ".dll")));
                return ExtCollections;
            }
            catch (Exception ex)
            {
                LogExtension.LogError("Failed to Load Data Extension", ex, MethodBase.GetCurrentMethod());
            }
            return null;
        }

        public IWebHostEnvironment env { get; }
        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                options.MinimumSameSitePolicy = SameSiteMode.None;
                options.HttpOnly = HttpOnlyPolicy.Always;
            });
            services.AddControllersWithViews();
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
            services.AddAntiforgery(options =>
            {
                options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
                options.Cookie.SameSite = SameSiteMode.None;
                options.Cookie.HttpOnly = true;
            });
            services.AddResponseCompression(options =>
            {
                options.EnableForHttps = true; // Enable compression for HTTPS requests
                options.Providers.Add<GzipCompressionProvider>();
            });
            services.Configure<GzipCompressionProviderOptions>(options =>
            {
                options.Level = CompressionLevel.Fastest; // Adjust compression level as needed
            });
        }

        private BoldReports.Web.MapSetting GetMapSettings(IWebHostEnvironment _hostingEnvironment)
        {
            try
            {
                string basePath = _hostingEnvironment.WebRootPath;
                string mapShapePath = Path.Combine(basePath, "ShapeData");
                mapShapePath = Path.GetFullPath(mapShapePath);
                return new MapSetting()
                {
                    ShapePath = mapShapePath + '/',
                    MapShapes = JsonConvert.DeserializeObject<List<MapShape>>(System.IO.File.ReadAllText(Path.Combine(mapShapePath, "mapshapes.txt")))
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
            app.UseMiddleware<CSRFHandler>();
            app.UseResponseCompression();
            app.UseFileServer();
            app.UseCookiePolicy();
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

            // Enable browser caching for static files
            app.UseStaticFiles(new StaticFileOptions
            {
                OnPrepareResponse = ctx =>
                {
                    const int durationInSeconds = 60 * 60 * 24 * 1; // 1 day
                    ctx.Context.Response.Headers["Cache-Control"] = $"public,max-age={durationInSeconds}";
                }
            });

            app.UseRouting();
            app.UseCors("AllowAllOrigins");
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                          name: "ReportViewer",
                          pattern: "report-viewer/{controller}/{action=Index}/{id?}");
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Main}/{action=Index}/{id?}");
                endpoints.MapFallback(context =>
                 {
                     var redirectPath = context.Request.PathBase.Value.Contains("aspnet-core") ? "/aspnet-core/report-viewer/product-line-sales/" : "/report-viewer/product-line-sales";
                     context.Response.Redirect(redirectPath);
                     return Task.CompletedTask;
                 });
            });
            app.UseResponseCompression();        

        }
    }
}
