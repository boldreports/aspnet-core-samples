(function onInit() {
    document.querySelector('.mobile-overlay').classList.add('e-hidden');
    let routerPath = location.pathname.replace(getBasePath() + reportViewerPath, "");
    let samples = getSampleData().samples;
    let sampleData = samples.filter(function (sample) {
        return sample.routerPath === routerPath
    })[0];
    document.querySelector(".splash").classList.add('e-hidden');
    document.querySelector('.ej-body.e-hidden').classList.remove('e-hidden');
    tocSelection(sampleData, samples);
    loadTabContent(sampleData);
    updateMetaData(sampleData);
    setReportsHeight();
    updateTab();
})();

window.addEventListener('resize', function () {
    setReportsHeight();
    updateTab();
    updateOverlay();
});

function tocSelection(sampleData, samples) {
    let ele = document.querySelectorAll('.ej-sb-toc-card')[samples.indexOf(sampleData)];
    let previousSelected = document.querySelector('.toc-selected');
    if (previousSelected) {
        previousSelected.classList.remove('toc-selected')
    }
    ele.classList.add('toc-selected');
    ele.focus();
}

function loadTabContent(sampleData) {
    $('#parentTab li:first-child a').tab('show');
    $('#childtTab li:first-child a').tab('show');
    let childaTab = document.getElementById("childTabContainer");
    let cshtml = getResponse(getBasePath() + 'Views/' + sampleData.routerPath + '/Index.cshtml');
    let csharp = getResponse(getBasePath() + 'Controllers/ReportViewer/' + sampleData.routerPath + 'Controller.cs');
    childaTab.getElementsByClassName('cshtml-header')[0].textContent = 'Index.cshtml';
    childaTab.getElementsByClassName('csharp-header')[0].textContent = sampleData.routerPath + '.cs';
    childaTab.getElementsByClassName('cshtml-content')[0].innerHTML = Prism.highlight(cshtml, Prism.languages.html);
    childaTab.getElementsByClassName('csharp-content')[0].innerHTML = Prism.highlight(csharp, Prism.languages.csharp);;
}

function updateMetaData(sampleData) {
    document.title = sampleData.sampleName + ' | Reports for ASP.NET Core | Syncfusion';
    document.querySelector('meta[name="description"]').setAttribute('content', sampleData.metaData.description);
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
    if (window.matchMedia('(max-width:850px)').matches) {
        $('#parentTab li:first-child a').tab('show');
        sourceTab.classList.add('e-hidden');
    } else {
        if (sourceTab.classList.contains('e-hidden')) {
            sourceTab.classList.remove('e-hidden');
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