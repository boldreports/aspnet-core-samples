(function onInit() {
    document.querySelector('.mobile-overlay').classList.add('e-hidden');
    let urlPaths = location.pathname.replace(getBasePath(), '').split('/');
    reportBasePath = urlPaths[0];
    reportRouterPath = urlPaths[1] ? urlPaths[1] : '';
    reportSamples = getReportSampleData().samples;
    reportSampleData = reportSamples.filter(function (sample) {
        return (sample.routerPath === reportRouterPath && sample.basePath === reportBasePath)
    })[0];
    document.querySelector(".splash").classList.add('e-hidden');
    document.querySelector('.ej-body.e-hidden').classList.remove('e-hidden');
    tocSelection();
    updateSampleDetails();
    loadTabContent();
    setReportsHeight();
    updateTab();
})();

window.addEventListener('resize', function () {
    setReportsHeight();
    updateTab();
    updateOverlay();
});

function tocSelection() {
    let ele = document.querySelectorAll('.ej-sb-toc-card')[reportSamples.indexOf(reportSampleData)];
    let previousSelected = document.querySelector('.toc-selected');
    if (previousSelected) {
        previousSelected.classList.remove('toc-selected')
    }
    ele.classList.add('toc-selected');
    ele.focus();
}

function loadTabContent() {
    $('#parentTab li:first-child a').tab('show');
    $('#childtTab li:first-child a').tab('show');
    let controllerName = reportRouterPath ? reportRouterPath : reportBasePath;
    let controllerPath = reportRouterPath ? reportBasePath + '/' + controllerName : controllerName;
    let childaTab = document.getElementById("childTabContainer");
    let cshtml = getResponse(getBasePath() + 'Views/' + controllerName + '/Index.cshtml');
    cshtml = cshtml.replace(/@section (description) {[^}]*}/, '');;
    let csharp = getResponse(getBasePath() + 'Controllers/' + controllerPath + 'Controller.cs');
    childaTab.getElementsByClassName('cshtml-header')[0].textContent = 'Index.cshtml';
    childaTab.getElementsByClassName('csharp-header')[0].textContent = controllerName + '.cs';
    childaTab.getElementsByClassName('cshtml-content')[0].innerHTML = Prism.highlight(cshtml, Prism.languages.csharp);
    childaTab.getElementsByClassName('csharp-content')[0].innerHTML = Prism.highlight(csharp, Prism.languages.csharp);
}

function updateSampleDetails() {
    let titleElement = document.querySelector('.ej-main-body-content .ej-title');
    let metaDescriptionElement = document.querySelector('.ej-main-body-content .ej-meta-description');
    titleElement.innerText = reportSampleData.sampleName;
    metaDescriptionElement.innerText = reportSampleData.metaData.description;
}

function setReportsHeight() {
    let style = document.getElementById('reports-style');
    if (!style) {
        style = document.createElement('style');
        style.id = 'reports-style';
        document.body.appendChild(style);
    }
    style.textContent = 'ej-sample { display:block; overflow: hidden; height:' + (window.innerHeight -
        (document.getElementById('parentTabContent').getBoundingClientRect().top - document.body.getBoundingClientRect().top)) + 'px}';
}

function updateOverlay() {
    let mobileOverlay = document.querySelector('.mobile-overlay');
    let mobileSideBar = document.querySelector('ej-sidebar');
    if (!window.matchMedia('(max-width:550px)').matches) {
        mobileSideBar.classList.remove('ej-toc-mobile-slide-left');
        mobileOverlay.classList.add('e-hidden');
    }
}

function updateTab() {
    let sourceTab = document.querySelector('.ej-nav-item.source-tab');
    let descTab = document.querySelector('.ej-nav-item.desc-tab');
    if (window.matchMedia('(max-width:850px)').matches) {
        $('#parentTab li:first-child a').tab('show');
        sourceTab.classList.add('e-hidden');
        descTab.classList.add('e-hidden');
    } else {
        if (sourceTab.classList.contains('e-hidden')) {
            sourceTab.classList.remove('e-hidden');
            descTab.classList.remove('e-hidden');
        }
    }
}

function getResponse(url) {
    return $.ajax({
        type: "GET",
        url: url,
        async: false
    }).responseText;
}