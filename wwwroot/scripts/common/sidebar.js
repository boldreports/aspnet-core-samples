function onTocClick(args) {
    let reportViewerElement = document.querySelector('.e-reportviewer.e-js');
    if (reportViewerElement)
        $(reportViewerElement).boldReportViewer("clearReportCache");
    args.e.preventDefault();
    let curSampleData = reportSamples[args.index];
    let reportPath = curSampleData.routerPath ? (curSampleData.basePath + '/' + curSampleData.routerPath) : curSampleData.basePath;
    let routePath = location.origin + getBasePath() + reportPath + location.search;
    if (location.href != routePath){
        location.href = routePath;
    }
}

function onHomeBtnClick() {
    let homePageUrl = location.origin.indexOf('demos.boldreports.com') !== -1 ? '/home/' : '/';
    location.href = location.origin + homePageUrl;
}
