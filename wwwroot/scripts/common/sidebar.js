function onTocClick(args) {
    args.e.preventDefault();
    let samples = getSampleData().samples[args.index];
    location.href = location.origin + getBasePath() + reportViewerPath + samples.routerPath;
}

function onHomeBtnClick() {
    let samples = getSampleData().samples[0];
    location.href = location.origin + getBasePath() + reportViewerPath + samples.routerPath;
}
