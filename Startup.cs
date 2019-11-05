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

namespace ReportsCoreSamples
{
    public class Startup
    {

        public Startup(IConfiguration configuration, IHostingEnvironment _hostingEnvironment)
        {
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
            services.Add(new ServiceDescriptor(typeof(SampleData), new SampleData(env)));
            services.Add(new ServiceDescriptor(typeof(Globals), typeof(Globals), ServiceLifetime.Transient));
            services.AddCors(o => o.AddPolicy("AllowAllOrigins", builder =>
            {
                builder.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
            }));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

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
