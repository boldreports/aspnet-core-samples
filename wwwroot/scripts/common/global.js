function onToolbarRendering() {
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
        groupIndex: 3
    }]
}

function onToolBarItemClick(args) {
    if (args.value === "edit-report") {
        window.open(location.origin + getBasePath() + 'ReportDesigner?report-name=' + args.model.reportPath, location.pathname.indexOf('Preview') === -1 ? '_blank' : '_self');
    }
}