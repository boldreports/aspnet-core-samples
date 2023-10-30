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
         public static string getProductCategory(IMemoryCache _cache)
        {

            using (SqlConnection connection = new SqlConnection("Data Source=dataplatformdemodata.syncfusion.com;Initial Catalog=AdventureWorks2016;user id=demoreadonly@data-platform-demo;password=N@c)=Y8s*1&dh;"))
            {
                connection.Open();

                string queryString = "SELECT DISTINCT ProductCategoryID, Name FROM Production.ProductCategory";
                SqlDataAdapter adapter = new SqlDataAdapter(queryString, connection);

                using (DataSet ProductCategories = new DataSet())
                {
                    adapter.Fill(ProductCategories, "Orders");
                    _cache.Set("ProductCategoryDetail", ProductCategories.Tables[0]);
                    connection.Close();
                    return JsonConvert.SerializeObject(_cache.Get("ProductCategoryDetail"));
                }
            }
        }
        public static string getProductSubCategory(IMemoryCache _cache)
        {

            using (SqlConnection connection = new SqlConnection("Data Source=dataplatformdemodata.syncfusion.com;Initial Catalog=AdventureWorks2016;user id=demoreadonly@data-platform-demo;password=N@c)=Y8s*1&dh;"))
            {
                connection.Open();

                string queryString = $"SELECT ProductSubcategoryID, ProductCategoryID, Name FROM Production.ProductSubcategory";
                SqlDataAdapter adapter = new SqlDataAdapter(queryString, connection);

                using (DataSet ProductCategories = new DataSet())
                {
                    adapter.Fill(ProductCategories, "Orders");
                    _cache.Set("ProductSubCategoryDetail", ProductCategories.Tables[0]);
                    connection.Close();
                    return JsonConvert.SerializeObject(_cache.Get("ProductSubCategoryDetail"));
                }
            }
        }
    }
}
