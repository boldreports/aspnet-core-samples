using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

namespace ReportsCoreSamples.Models
{
    public class SqlQuery
    {
        public static string getJson(IMemoryCache _cache)
        {
            string json;
            if (_cache.Get("SalesOrderDetail") == null)
            {
                using (SqlConnection connection = new SqlConnection("Data Source=dataplatformdemodata.syncfusion.com;Initial Catalog=AdventureWorks2016;user id=demoreadonly@data-platform-demo;password=N@c)=Y8s*1&dh;"))
                {
                    connection.Open();

                    string queryString = "SELECT SOD.SalesOrderDetailID, SOD.OrderQty, SOD.UnitPrice,CASE WHEN SOD.UnitPriceDiscount IS NULL THEN 0 ELSE SOD.UnitPriceDiscount END AS UnitPriceDiscount, SOD.LineTotal, SOD.CarrierTrackingNumber, SOD.SalesOrderID, P.Name, P.ProductNumber FROM        Sales.SalesOrderDetail SOD INNER JOIN Production.Product P ON SOD.ProductID = P.ProductID INNER JOIN Sales.SalesOrderHeader SOH ON SOD.SalesOrderID = SOH.SalesOrderID";
                    SqlDataAdapter adapter = new SqlDataAdapter(queryString, connection);

                    DataSet salesOrders = new DataSet();
                    adapter.Fill(salesOrders, "Orders");
                    _cache.Set("SalesOrderDetail", salesOrders.Tables[0]);
                    connection.Close();
                }
            }
            json = "[{\"value\":" + JsonConvert.SerializeObject(_cache.Get("SalesOrderDetail")) + ",\"name\": \"SalesOrderDetail\"}]";
            return json;
        }
    }
}
