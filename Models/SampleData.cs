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
#if NETCOREAPP2_1
        private IHostingEnvironment _hostingEnvironment;
#else
        private IWebHostEnvironment _hostingEnvironment;
#endif

#if NETCOREAPP2_1
        public SampleData(IHostingEnvironment environment)
#else
     public SampleData(IWebHostEnvironment environment)
#endif
        {
            _hostingEnvironment = environment;
        }
        public dynamic getSampleData()
        {
            string json = System.IO.File.ReadAllText(_hostingEnvironment.WebRootPath + "/samples.json");
            dynamic sampleJson = JsonConvert.DeserializeObject(json);
            return sampleJson;
        }
    }
}
