﻿using System;
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
            string json = System.IO.File.ReadAllText(_hostingEnvironment.WebRootPath + "/samples.json");
            dynamic sampleJson = JsonConvert.DeserializeObject(json);
            return sampleJson;
        }
    }
}
