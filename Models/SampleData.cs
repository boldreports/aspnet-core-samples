using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Newtonsoft.Json;

namespace ReportsCoreSamples.Models
{
    public class SampleData
    {
        private IWebHostEnvironment _hostingEnvironment;
        public SampleData(IWebHostEnvironment environment)
        {
            _hostingEnvironment = environment;
        }
        public dynamic getSampleData()
        {
            var fileInfo = _hostingEnvironment.WebRootFileProvider.GetFileInfo("samples.json");
            using var reader = new System.IO.StreamReader(fileInfo.CreateReadStream());
            return new JsonSerializer().Deserialize(reader, typeof(object));
        }
    }
}
