function onToolbarRendering() {
    if (this.element[0].baseURI.lastIndexOf('external-parameter-report') != -1) {
        this.model.toolbarSettings.toolbars = ej.ReportViewer.Toolbars.All & ~ej.ReportViewer.Toolbars.Vertical
    }
    if (this.element[0].baseURI.lastIndexOf('powerpoint-report') != -1) {
        this.model.exportSettings.exportOptions = ej.ReportViewer.ExportOptions.PPT
    }
    this.model.toolbarSettings.items = ej.ReportViewer.ToolbarItems.All & ~ej.ReportViewer.ToolbarItems.Find;
    this.model.toolbarSettings.customGroups = [{
        items: [{
            type: 'Default',
            cssClass: "e-icon e-edit e-reportviewer-icon ej-webicon CustomGroup",
            prefixIcon: "e-viewer-icons edit",
            id: "edit-report",
            // Need to add the proper header and content once, the tool tip issue resolved.
            tooltip: {
                header: 'Edit Report',
                content: 'Edit this report in designer'
            }
        }],
        // Need to remove the css (e-reportviewer-toolbarcontainer ul.e-ul:nth-child(4)) once the group index issue resolved
        cssClass: "e-show"
    }]
}

let destroyReport = true;

function onExportItemClick() {
    destroyReport = false;
}

function onToolBarItemClick(args) {
    if (args.value === 'edit-report') {
        let reportPath = this.element[0].baseURI.lastIndexOf('external-parameter-report') !== -1 ? 'external-parameter-report' : this.element[0].baseURI.lastIndexOf('parameter-customization') !== -1 ? 'parameter-customization' : args.model.reportPath;
        let ReportDesignerPath = reportPath.indexOf('.rdlc') !== -1 ? 'report-designer/rdlc' : 'report-designer';
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