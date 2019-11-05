function onTocClick(args) {
    args.e.preventDefault();
    let curSampleData = reportSamples[args.index];
    let reportPath = curSampleData.routerPath ? (curSampleData.basePath + '/' + curSampleData.routerPath) : curSampleData.basePath;
    location.href = location.origin + getBasePath() + reportPath;
}

function onHomeBtnClick() {
    let curSampleData = reportSamples[0];
    let reportPath = curSampleData.routerPath ? (curSampleData.basePath + '/' + curSampleData.routerPath) : curSampleData.basePath;
    location.href = location.origin + getBasePath() + reportPath;
}
