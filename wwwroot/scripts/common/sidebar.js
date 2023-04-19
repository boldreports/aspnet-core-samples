﻿function onTocClick(args) {
    let reportViewerElement = document.querySelector('.e-reportviewer.e-js');
    if (reportViewerElement)
        $(reportViewerElement).boldReportViewer("clearReportCache");
    args.e.preventDefault();
    let curSampleData = reportSamples[args.index];
    let reportPath = curSampleData.routerPath ? (curSampleData.basePath + '/' + curSampleData.routerPath) : curSampleData.basePath;
    location.href = location.origin + getBasePath() + reportPath;
}

function onHomeBtnClick() {
    let homePageUrl = location.origin.indexOf('demos.boldreports.com') !== -1 ? '/home/' : '/';
    location.href = location.origin + homePageUrl;
}
