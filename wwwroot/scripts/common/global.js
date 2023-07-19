function onToolbarRendering() {
    if (this.element[0].baseURI.lastIndexOf('ExternalParameterReport') != -1 && location.search.trim() == '?v2') {
        this.model.toolbarSettings.items = ~ej.ReportViewer.ToolbarItems.Parameters & ~ej.ReportViewer.ToolbarItems.Find & ~ej.ReportViewer.ToolbarItems.Analytics;
    }
    else if (this.element[0].baseURI.lastIndexOf('ExternalParameterReport') != -1) {
        this.model.toolbarSettings.items = ~ej.ReportViewer.ToolbarItems.Find & ~ej.ReportViewer.ToolbarItems.Analytics;
    }
    if (location.search.trim() != '?v2') {
        this.model.toolbarSettings.customGroups = [{
            items: [{
                type: 'Default',
                cssClass: "e-icon e-edit e-reportviewer-icon ej-webicon CustomGroup",
                id: "edit-report",
                // Need to add the proper header and content once, the tool tip issue resolved.
                tooltip: {
                    header: 'Edit Report',
                    content: 'Edit this report in designer'
                }
            }],
            // Need to remove the css (e-reportviewer-toolbarcontainer ul.e-ul:nth-child(4)) once the group index issue resolved
            groupIndex: 3,
            cssClass: "e-show"
        }]
    }
}

let destroyReport = true;

function onExportItemClick() {
    destroyReport = false;
}
    
function onToolBarItemClick(args) {
    if (args.value === 'edit-report') {
        let reportPath = this.element[0].baseURI.lastIndexOf('ExternalParameterReport') !== -1 ? 'external-parameter-report' : this.element[0].baseURI.lastIndexOf('ParameterCustomization') !== -1 ? 'parameter-customization' : args.model.reportPath;
        let ReportDesignerPath = reportPath.indexOf('.rdlc') !== -1 ? 'ReportDesigner/RDLC' : 'ReportDesigner';
        window.open(location.origin + getBasePath() + ReportDesignerPath + '?report-name=' + reportPath, location.pathname.indexOf('Preview') === -1 ? '_blank' : '_self')
    }
}

window.addEventListener("beforeunload", function () {
    if (destroyReport) {
        destroyReportControls();
    } else {
        destroyReport = true;
    }
});

function destroyReportControls() {
    let reportViewerElement = document.querySelector('.e-reportviewer.e-js');
    if (reportViewerElement) $(reportViewerElement).data('boldReportViewer')._ajaxCallMethod("ClearCache", "_clearCurrentServerCache", false);
}

function switchv2() {
    let origin = location.origin;
    let pathname = location.pathname;
    window.open(origin + pathname + '?v2', '_self');
}

function disableBarInfo() {
    if (location.search.trim() == '?v2') {
        hideBarInfo();
        resetMainTop();
    }
}

function hideBarInfo() {
    let bar = document.querySelector('.ej-info-bar.navbar');
    if (bar)
        bar.style.display = 'none';
}

function resetMainTop() {
    let main = document.querySelector('.ej-main-parent-content');
    if (main)
        main.style.top = '48px';
}

function showTransitionBarInfo() {
    let bar = document.querySelector('.ej-info-bar.navbar');
    if (bar)
        bar.classList.remove('ej-info-invisible');
}
