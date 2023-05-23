using DevExpress.AspNetCore;
using DevExpress.Spreadsheet;
using DevExpress.DashboardAspNetCore;
using DevExpress.DashboardCommon;
using DevExpress.DashboardCommon.ViewerData;
using DevExpress.DashboardWeb;
using DevExpress.DataAccess.Excel;
using DevExpress.DataAccess.Sql;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Hosting;
using System.Collections.Generic;
using System.Drawing;
using System;

namespace AspNetCoreCustomItemTutorials {
    public class Startup {
        public Startup(IConfiguration configuration, IWebHostEnvironment hostingEnvironment) {
            Configuration = configuration;
            FileProvider = hostingEnvironment.ContentRootFileProvider;
            DashboardExportSettings.CompatibilityMode = DashboardExportCompatibilityMode.Restricted;
        }

        public IFileProvider FileProvider { get; }
        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services) {
            services
                .AddResponseCompression()
                .AddDevExpressControls()
                .AddMvc();
            services.AddScoped<DashboardConfigurator>((IServiceProvider serviceProvider) => {
                DashboardConfigurator configurator = new DashboardConfigurator();
                configurator.CustomizeExportDocument += Configurator_CustomizeExportDocument;
                configurator.SetConnectionStringsProvider(new DashboardConnectionStringsProvider(Configuration));

                DashboardFileStorage dashboardFileStorage = new DashboardFileStorage(FileProvider.GetFileInfo("Data/Dashboards").PhysicalPath);
                configurator.SetDashboardStorage(dashboardFileStorage);

                DataSourceInMemoryStorage dataSourceStorage = new DataSourceInMemoryStorage();

                // Registers an SQL data source.
                DashboardSqlDataSource sqlDataSource = new DashboardSqlDataSource("SQL Data Source", "NWindConnectionString");
                sqlDataSource.DataProcessingMode = DataProcessingMode.Client;
                SelectQuery query = SelectQueryFluentBuilder
                    .AddTable("Categories")
                    .Join("Products", "CategoryID")
                    .SelectAllColumns()
                    .Build("Products_Categories");
                sqlDataSource.Queries.Add(query);
                dataSourceStorage.RegisterDataSource("sqlDataSource", sqlDataSource.SaveToXml());

                // Registers an Object data source.
                DashboardObjectDataSource objDataSource = new DashboardObjectDataSource("Object Data Source");
                objDataSource.DataId = "objDataConnection";
                dataSourceStorage.RegisterDataSource("objDataSource", objDataSource.SaveToXml());

                // Registers an Excel data source.
                DashboardExcelDataSource excelDataSource = new DashboardExcelDataSource("Excel Data Source");
                excelDataSource.ConnectionName = "excelDataConnection";
                excelDataSource.SourceOptions = new ExcelSourceOptions(new ExcelWorksheetSettings("Sheet1"));
                dataSourceStorage.RegisterDataSource("excelDataSource", excelDataSource.SaveToXml());

                configurator.SetDataSourceStorage(dataSourceStorage);

                configurator.DataLoading += (s, e) => {
                    if (e.DataId == "objDataConnection") {
                        e.Data = Invoices.CreateData();
                    }
                };
                configurator.ConfigureDataConnection += (s, e) => {
                    if (e.ConnectionName == "excelDataConnection") {
                        e.ConnectionParameters = new ExcelDataSourceConnectionParameters(FileProvider.GetFileInfo("Data/Sales.xlsx").PhysicalPath);
                    }
                };
                return configurator;
            });
        }

        private void Configurator_CustomizeExportDocument(object sender, CustomizeExportDocumentWebEventArgs e) {
                CustomDashboardItem item = e.GetDashboardItem("customItemDashboardItem3") as CustomDashboardItem;

                if (item != null) {
                    Workbook workbook = new Workbook();
                    Worksheet worksheet = workbook.Worksheets[0];

                    MultiDimensionalData itemData = e.GetItemData(e.ItemComponentName);
                    CustomItemData customItemData = new CustomItemData(item, itemData);

                    DashboardFlatDataSource flatData = customItemData.GetFlatData();
                    IList<DashboardFlatDataColumn> columns = flatData.GetColumns();
                    for (int colIndex = 0; colIndex < columns.Count; colIndex++) {
                        worksheet.Cells[0, colIndex].Value = columns[colIndex].DisplayName;
                        worksheet.Cells[0, colIndex].FillColor = Color.LightGreen;
                        worksheet.Cells[0, colIndex].Font.FontStyle = SpreadsheetFontStyle.Bold;
                        int headerOffset = 1;
                        for (int rowIndex = 0; rowIndex < flatData.Count; rowIndex++)
                            worksheet.Cells[rowIndex + headerOffset, colIndex].Value = flatData.GetDisplayText(columns[colIndex].Name, rowIndex);

                    }
                    e.Stream.SetLength(0);
                    workbook.SaveDocument(e.Stream, DocumentFormat.Xlsx);
                }
            }

            // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
            public void Configure(IApplicationBuilder app, IWebHostEnvironment env) {
            if(env.IsDevelopment()) {
                app.UseDeveloperExceptionPage();
            }
            else {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseDevExpressControls();

            app.UseRouting();
            app.UseEndpoints(endpoints => {
                endpoints.MapDashboardRoute("api/dashboard", "DefaultDashboard");
                endpoints.MapRazorPages();
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
