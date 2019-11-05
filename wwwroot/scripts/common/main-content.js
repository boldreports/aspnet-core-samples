function onTabPrev() {
    let samples = getSampleData().samples;
    const curRouterData = getCurRouterData();
    const curRouterIndex = curRouterData.curIndex;
    const sampleData = !isUndefined(curRouterIndex) ?
        (curRouterData.isFirst ? samples[samples.length - 1] : samples[curRouterIndex - 1]) : samples[0];
    location.href = location.origin + getBasePath() + reportViewerPath + sampleData.routerPath;
}

function onTabNext() {
    let samples = getSampleData().samples;
    const curRouterData = getCurRouterData();
    const curRouterIndex = curRouterData.curIndex;
    const sampleData = !isUndefined(curRouterIndex) ?
        (curRouterData.isLast ? samples[0] : samples[curRouterIndex + 1]) : samples[0];
    location.href = location.origin + getBasePath() + reportViewerPath + sampleData.routerPath;
}

function onTabBtnClick() {
    let routerPath = location.pathname.replace(getBasePath() + reportViewerPath, "");
    const sampleData = getSampleData().samples.filter(function (sample) {
        return sample.routerPath === routerPath
    })[0];
    if (sampleData) {
        window.open(location.origin + getBasePath() + reportViewerPath + sampleData.routerPath + '/Preview', '_blank');
    }
}

function getCurRouterData() {
    const curData = {
        curIndex: undefined,
        isFirst: undefined,
        isLast: undefined
    };
    let samples = getSampleData().samples;
    let routerPath = location.pathname.replace(getBasePath() + reportViewerPath, "");
    samples.some(function (sample, index) {
        if (sample.routerPath === routerPath) {
            curData.curIndex = index;
            return true;
        } else {
            return false;
        }
    });
    if (!this.isUndefined(curData.curIndex)) {
        curData.isFirst = curData.curIndex === 0 ? true : false;
        curData.isLast = curData.curIndex === (samples.length - 1) ? true : false;
    }
    return curData;
}

function isUndefined(value) {
    return ('undefined' === typeof value);
}