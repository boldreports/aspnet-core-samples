var target = Argument("target", "Default");

using Cake.Common.Net;
using Cake.Common.IO;
//////////////////////////////////////////////////////////////////////
// TASKS
//////////////////////////////////////////////////////////////////////

Task("GitLeaksDownload")
    .Does(() => {
    DownloadFile("https://github.com/zricethezav/gitleaks/releases/download/v8.15.2/gitleaks_8.15.2_windows_x64.zip", "GitLeaks.zip");
    Unzip("GitLeaks.zip", "./GitLeaks");
    CopyFile("./GitLeaks/gitleaks.exe", "../gitleaks.exe");		
});
    
Task("Default")
    .IsDependentOn("GitLeaksDownload")
    .Does(()=>{       
    CreateDirectory("../GitLeaksReport");
    if (FileExists("../gitleaks.toml"))
    {
        StartProcess("../gitleaks.exe", new ProcessSettings {Arguments ="detect --verbose --report-path ../GitLeaksReport/gitleaks-report.json -c ../gitleaks.toml"});
    }
    else { 
        StartProcess("../gitleaks.exe", new ProcessSettings {Arguments ="detect --verbose --report-path ../GitLeaksReport/gitleaks-report.json"});
    }    
});
   
//////////////////////////////////////////////////////////////////////
// EXECUTION
//////////////////////////////////////////////////////////////////////

RunTarget(target);