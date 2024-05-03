function onTabPrev() {
    const curRouterData = getCurRouterData();
    const curRouterIndex = curRouterData.curIndex;
    const curSampleData = curRouterData.isFirst ? reportSamples[reportSamples.length - 1] : reportSamples[curRouterIndex - 1];
    let reportPath = curSampleData.routerPath ? (curSampleData.basePath + '/' + curSampleData.routerPath) : curSampleData.basePath;
    location.href = location.origin + getBasePath() + reportPath + location.search;
}

function onTabNext() {
    const curRouterData = getCurRouterData();
    const curRouterIndex = curRouterData.curIndex;
    const curSampleData = curRouterData.isLast ? reportSamples[0] : reportSamples[curRouterIndex + 1];
    let reportPath = curSampleData.routerPath ? (curSampleData.basePath + '/' + curSampleData.routerPath) : curSampleData.basePath;
    location.href = location.origin + getBasePath() + reportPath + location.search;
}

function onTabBtnClick() {
    let reportPath = reportRouterPath ? (reportBasePath + '/' + reportRouterPath) : reportBasePath;
    window.open(location.origin + getBasePath() + reportPath + '/preview' + location.search, '_blank', 'noreferrer');
}

function getCurRouterData() {
    const curData = {
        curIndex: undefined,
        isFirst: undefined,
        isLast: undefined
    };
    curData.curIndex = reportSamples.indexOf(reportSampleData);
    curData.isFirst = curData.curIndex === 0 ? true : false;
    curData.isLast = curData.curIndex === (reportSamples.length - 1) ? true : false;
    return curData;
}