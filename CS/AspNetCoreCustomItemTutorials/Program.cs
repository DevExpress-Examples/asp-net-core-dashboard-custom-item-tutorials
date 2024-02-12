using DevExpress.AspNetCore;
using DevExpress.Spreadsheet;
using DevExpress.DashboardAspNetCore;
using DevExpress.DashboardCommon;
using DevExpress.DashboardCommon.ViewerData;
using DevExpress.DashboardWeb;
using DevExpress.DataAccess.Excel;
using DevExpress.DataAccess.Sql;
using Microsoft.Extensions.FileProviders;
using System.Drawing;
using AspNetCoreCustomItemTutorials;

var builder = WebApplication.CreateBuilder(args);

IFileProvider? fileProvider = builder.Environment.ContentRootFileProvider;
IConfiguration? configuration = builder.Configuration;
DashboardExportSettings.CompatibilityMode = DashboardExportCompatibilityMode.Restricted;

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddRazorPages();

builder.Services.AddDevExpressControls();
builder.Services
.AddResponseCompression()
    .AddDevExpressControls()
    .AddMvc();
builder.Services.AddScoped<DashboardConfigurator>((IServiceProvider serviceProvider) => {
    DashboardConfigurator configurator = new DashboardConfigurator();
    configurator.CustomizeExportDocument += Configurator_CustomizeExportDocument;
    configurator.SetConnectionStringsProvider(new DashboardConnectionStringsProvider(configuration));

    DashboardFileStorage dashboardFileStorage = new DashboardFileStorage(fileProvider.GetFileInfo("Data/Dashboards").PhysicalPath);
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
            e.ConnectionParameters = new ExcelDataSourceConnectionParameters(fileProvider.GetFileInfo("Data/Sales.xlsx").PhysicalPath);
        }
    };
    return configurator;
});

var app = builder.Build();


// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseDevExpressControls();

app.UseRouting();

app.UseAuthorization();
app.MapRazorPages();

app.MapDashboardRoute("api/dashboard", "DefaultDashboard");

app.Run();
void Configurator_CustomizeExportDocument(object sender, CustomizeExportDocumentWebEventArgs e) {
    CustomDashboardItem? item = e.GetDashboardItem("customItemDashboardItem3") as CustomDashboardItem;

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