(function onInit() {
    let url = location.origin.indexOf('demos.boldreports.com') !== -1 ? '/' : '/demos/';
    document.getElementById('home_page').setAttribute('href', url + 'aspnet-core/');
    let isReportDesigner = location.pathname.indexOf('/ReportDesigner') !== -1;
    let urlPaths = location.pathname.replace(getBasePath(), '').split('/');
    reportBasePath = urlPaths[0];
    reportRouterPath = urlPaths[1] !== 'Preview' && !isReportDesigner ? urlPaths[1] : '';
    let reportName = getReportName();
    reportSamples = getReportSampleData().samples;
    if (!(isReportDesigner && !reportName)) {
        if (isReportDesigner) {
            let sampleName = '';
            reportName.split('.')[0].replace(/-/g, ' ').replace(/\w\S*/g, function (value) {
                sampleName += value.charAt(0).toUpperCase() + value.substr(1).toLowerCase();
                sampleName = sampleName.trim();
                reportSampleData = reportSamples.filter(function (sample) {
                    return (sample.routerPath === sampleName)
                })[0];
            });
        } else {
            reportSampleData = reportSamples.filter(function (sample) {
                return (sample.routerPath === reportRouterPath && sample.basePath === reportBasePath)
            })[0];
        }
    }
    document.querySelector(".splash").classList.add('e-hidden');
    document.querySelector('.ej-body.e-hidden').classList.remove('e-hidden');
})();

function getReportName() {
    const reportNameRegex = /[\\?&]report-name=([^&#]*)/.exec(location.search);
    return reportNameRegex ? reportNameRegex[1] : undefined;
};
