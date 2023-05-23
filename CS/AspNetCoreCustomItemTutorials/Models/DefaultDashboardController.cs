using DevExpress.DashboardAspNetCore;
using DevExpress.DashboardCommon;
using DevExpress.DashboardCommon.ViewerData;
using DevExpress.DashboardWeb;
using DevExpress.Spreadsheet;
using Microsoft.AspNetCore.DataProtection;
using System.Collections.Generic;
using System.Drawing;

namespace AspNetCoreCustomItemTutorials.Models
{
    public class DefaultDashboardController : DashboardController
    {
        public DefaultDashboardController(DashboardConfigurator configurator, IDataProtectionProvider dataProtectionProvider = null)
         : base(configurator, dataProtectionProvider)
        {
           
        }

    }
}
