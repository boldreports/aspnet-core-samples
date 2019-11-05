using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ReportsCoreSamples.Controllers
{
    public class ReportDesignerController : Controller
    {
        public IActionResult Index()
        {
            ViewBag.action = "Preview";
            ViewBag.toolbarSettings = new Syncfusion.Reporting.Models.ReportDesigner.ToolbarSettings();
            ViewBag.toolbarSettings.Items = Syncfusion.Reporting.ReportDesignerEnums.ToolbarItems.All
                                               & ~Syncfusion.Reporting.ReportDesignerEnums.ToolbarItems.Save;
            ViewBag.reportitems = new List<Syncfusion.Reporting.Models.ReportDesigner.ReportItemExtensionsModule>() {
                new Syncfusion.Reporting.Models.ReportDesigner.ReportItemExtensionsModule() { ClassName = "EJBarcode", Name = "barcode", ImageClass = "customitem-barcode", DisplayName = "1D Barcode", Category = "Barcodes" },
                new Syncfusion.Reporting.Models.ReportDesigner.ReportItemExtensionsModule() { ClassName = "EJQRBarcode", Name = "qrbarcode", ImageClass = "customitem-qrbarcode", DisplayName = "QR Barcode", Category = "Barcodes" }
            };
            return View();
        }
    }
}