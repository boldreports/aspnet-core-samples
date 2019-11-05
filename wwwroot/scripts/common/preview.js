(function onInit() {
    let sampleName = '';
    let isReportDesigner = location.pathname.indexOf('/ReportDesigner') !== -1;
    if (isReportDesigner) {
        let reportPath = location.search.split('=')[1];
        reportPath.split('.')[0].replace(/-/g, ' ').replace(/\w\S*/g, function (value) {
            sampleName += value.charAt(0).toUpperCase() + value.substr(1).toLowerCase() + ' ';
            return sampleName.trim();
        });
    } else {
        const samplePath = location.pathname.split('/')[location.pathname.split('/').length - 2];
        sampleName = getSampleData().samples.filter(function (sample) {
            return sample.routerPath === samplePath
        })[0].sampleName;
    }
    updateMetaData(sampleName, isReportDesigner);
    document.querySelector(".splash").classList.add('e-hidden');
    document.querySelector('.ej-body.e-hidden').classList.remove('e-hidden');
})();

function updateMetaData(sampleName, isReportDesigner) {
    let title;
    let metaContent;
    if (isReportDesigner) {
        title = sampleName + ' | ASP.NET Core Report Designer';
        if (title.length < 45) {
            title = title + ' | Syncfusion';
        }
        metaContent = 'The HTML5 web report designer allows the end-users to arrange/customize the reports appearance in browsers.' +
            'It helps to edit the ' + sampleName + 'for customer\'s application needs.';
    } else {
        title = sampleName + ' | Preview | ASP.NET Core Report Viewer';
        metaContent = 'The HTML5 web report viewer allows the end-users to visualize the ' + sampleName + ' report in browsers.';
    }
    document.title = title;
    document.querySelector('meta[name="description"]').setAttribute('content', metaContent);
}