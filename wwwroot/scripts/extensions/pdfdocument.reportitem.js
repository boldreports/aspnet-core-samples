var EJPdfDocument = (function () {
    function EJPdfDocument(rptDesigner) {
        this.customJSON = null;
        this.rootElement = null;
        this.customItemDiv = null;
        this.reportDesigner = null;
        this.reportDesigner = rptDesigner;
    }
    EJPdfDocument.prototype.initializeItem = function (args) {
        args.isBuildInService = false;
        args.defaultHeight = 160;
        args.defaultWidth = 160;
        args.minimumHeight = 15;
        args.minimumWidth = 90;
    };
    EJPdfDocument.prototype.renderItem = function (customJson, target, eventData) {
        if (eventData.eventName === 'begin') {
            this.customJSON = customJson;
            this.rootElement = target;
            this.renderPdfItem();
        }
    };
    EJPdfDocument.prototype.renderPdfItem = function () {
        this.customItemDiv = ej.buildTag('div.customitem', '', {
            'width': '100%', 'height': '100%', 'border': '1pt dotted gray', 'box-sizing': 'border-box',
            '-moz-box-sizing': 'border-box', '-webkit-box-sizing': 'border-box', 'overflow': 'hidden', 'position': 'absolute',
        }, {
            'id': this.customJSON.Name + '_customItem'
        });
        var pdfItem = ej.buildTag('div.e-rptdesigner-pdfdocument', '');
        this.customItemDiv.append(pdfItem);
        this.rootElement.append(this.customItemDiv);
    };
    EJPdfDocument.prototype.onPropertyChange = function (name, oldValue, newValue) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        switch (name) {
            case 'Sizing':
                this.updatePropertyVal(name, newValue);
                break;
            case 'DocumentValue':
                this.updatePropertyVal(name, newValue);
                break;
        }
    };
    EJPdfDocument.prototype.updatePropertyUIValue = function (name, value) {
    };
    EJPdfDocument.prototype.onPositionChanged = function (top, left) {
    };
    EJPdfDocument.prototype.onSizeChanged = function (height, width) {
        if (!ej.isNullOrUndefined(height) && !ej.isNullOrUndefined(width)) {
            this.customItemDiv.css({
                width: width,
                height: height
            });
        }
        else if (!ej.isNullOrUndefined(height) && ej.isNullOrUndefined(width)) {
            this.customItemDiv.css({
                height: height
            });
        }
        else if (ej.isNullOrUndefined(height) && !ej.isNullOrUndefined(width)) {
            this.customItemDiv.css({
                width: width
            });
        }
    };
    EJPdfDocument.prototype.getPropertyGridItems = function (baseProperties) {
        var itemProperties = [{
                'CategoryId': 'basicsettings',
                'DisplayName': 'categoryBasicSettings',
                'IsExpand': true,
                'Items': [{
                        'ItemId': 'pdfurl',
                        'Name': 'DocumentValue',
                        'DisplayName': 'url',
                        'Value': this.getPropertyVal('DocumentValue'),
                        'ItemType': 'TextBox'
                    },
                    {
                        'ItemId': 'pdfsizing',
                        'Name': 'Sizing',
                        'DisplayName': 'sizing',
                        'Value': this.getPropertyVal('Sizing'),
                        'ItemType': 'DropDown',
                        'EnableExpression': false,
                        'ValueList': [{ text: 'auto', value: 'AutoSize' }, { text: 'fitPage', value: 'FitToPageSize' }]
                    }]
            }];
        baseProperties.HeaderText = this.customJSON.Name;
        baseProperties.PropertyType = 'pdfdocument';
        baseProperties.SubType = 'pdfdocument';
        baseProperties.IsEditHeader = true;
        this.updateItemVisibility(baseProperties.Items, ['backgroundcolor'], false);
        baseProperties.Items = $.merge(itemProperties, baseProperties.Items);
        return baseProperties;
    };
    EJPdfDocument.prototype.updateItemVisibility = function (categories, itemId, newValue) {
        for (var index = 0; index < categories.length; index++) {
            for (var itemIndex = 0; itemIndex < categories[index].Items.length; itemIndex++) {
                if (itemId.indexOf(categories[index].Items[itemIndex].ItemId) !== -1) {
                    categories[index].Items[itemIndex].IsVisible = newValue;
                }
            }
        }
    };
    EJPdfDocument.prototype.getPropertyVal = function (name) {
        if (this.customJSON.CustomProperties && this.customJSON.CustomProperties.length > 0) {
            for (var index = 0; index < this.customJSON.CustomProperties.length; index++) {
                if (this.customJSON.CustomProperties[index].Name === name) {
                    return this.customJSON.CustomProperties[index].Value;
                }
            }
        }
        return null;
    };
    EJPdfDocument.prototype.setPropertyVal = function (name, val) {
        if (this.customJSON.CustomProperties === null) {
            this.customJSON.CustomProperties = [];
        }
        this.customJSON.CustomProperties.push(new ej.ReportModel.CustomProperty(name, val));
    };
    EJPdfDocument.prototype.updatePropertyVal = function (propertyName, value) {
        if (this.customJSON.CustomProperties && this.customJSON.CustomProperties.length > 0) {
            for (var index = 0; index < this.customJSON.CustomProperties.length; index++) {
                if (this.customJSON.CustomProperties[index].Name === propertyName) {
                    this.customJSON.CustomProperties[index].Value = value;
                }
            }
        }
    };
    EJPdfDocument.prototype.getReportItemJson = function () {
        if (this.customJSON === null) {
            this.customJSON = new ej.ReportModel.CustomReportItem().getModel();
            this.setPropertyVal('DocumentValue', '');
            this.setPropertyVal('Sizing', 'AutoSize');
        }
        return this.customJSON;
    };
    EJPdfDocument.prototype.setReportItemJson = function (reportItem) {
        this.customJSON = reportItem;
    };
    EJPdfDocument.prototype.dispose = function () {
        this.customJSON = null;
        this.rootElement = null;
        this.customItemDiv = null;
        this.reportDesigner = null;
    };
    EJPdfDocument.prototype.undoRedoAction = function (args) {
    };
    EJPdfDocument.prototype.getLocale = function (text) {
        var pdfLocale;
        var defaultLocale = EJPdfDocument.Locale['en-US'];
        if (this.reportDesigner && !ej.isNullOrUndefined(this.reportDesigner.model) &&
            !ej.isNullOrUndefined(EJPdfDocument.Locale[this.reportDesigner.model.locale])) {
            pdfLocale = EJPdfDocument.Locale[this.reportDesigner.model.locale];
        }
        else {
            pdfLocale = defaultLocale;
        }
        switch (text.toLowerCase()) {
            case 'categorybasicsettings':
                if (pdfLocale && pdfLocale.categoryBasicSettings) {
                    return pdfLocale.categoryBasicSettings;
                }
                return defaultLocale.categoryBasicSettings;
            case 'sizing':
                if (pdfLocale && pdfLocale.sizing) {
                    return pdfLocale.sizing;
                }
                return defaultLocale.sizing;
            case 'url':
                if (pdfLocale && pdfLocale.url) {
                    return pdfLocale.url;
                }
                return defaultLocale.url;
            case 'auto':
                if (pdfLocale && pdfLocale.sizeTypes.auto) {
                    return pdfLocale.sizeTypes.auto;
                }
                return defaultLocale.sizeTypes.auto;
            case 'fitpage':
                if (pdfLocale && pdfLocale.sizeTypes.fitPage) {
                    return pdfLocale.sizeTypes.fitPage;
                }
                return defaultLocale.sizeTypes.fitPage;
        }
        return text;
    };
    return EJPdfDocument;
}());
EJPdfDocument.Locale = {};
EJPdfDocument.Locale['en-US'] = {
    url: 'URL',
    categoryBasicSettings: 'Basic Settings',
    sizing: 'Sizing',
    sizeTypes: {
        auto: 'AutoSize',
        fitPage: 'FitToPageSize'
    },
    toolTip: {
        requirements: 'Display any PDF File',
        description: 'Display the pdf document content in the report',
        title: 'PDF'
    }
};
EJPdfDocument.Locale['ar-AE'] = {
    url: 'URL',
    categoryBasicSettings: 'الإعدادات الأساسية',
    sizing: 'تغيير الحجم',
    sizeTypes: {
        auto: 'الحجم التلقائي',
        fitPage: 'ملاءمة لحجم الصفحة'
    },
    toolTip: {
        requirements: 'عرض أي ملف PDF',
        description: 'عرض محتوى مستند PDF في التقرير',
        title: 'PDF'
    }
};
EJPdfDocument.Locale['fr-FR'] = {
    url: 'URL',
    categoryBasicSettings: 'Paramètres de base',
    sizing: 'Dimensionnement',
    sizeTypes: {
        auto: 'Taille automatique',
        fitPage: 'ملاءمة لحجم الصفحة'
    },
    toolTip: {
        requirements: 'Afficher n\'importe quel fichier PDF',
        description: 'Afficher le contenu du document PDF dans le rapport',
        title: 'PDF'
    }
};
EJPdfDocument.Locale['de-DE'] = {
    url: 'URL',
    categoryBasicSettings: 'Grundeinstellungen',
    sizing: 'Größenanpassung',
    sizeTypes: {
        auto: 'Automatische Größe',
        fitPage: 'An Seitengröße anpassen'
    },
    toolTip: {
        requirements: 'Beliebige PDF-Datei anzeigen',
        description: 'PDF-Dokumentinhalt im Bericht anzeigen',
        title: 'PDF'
    }
};
EJPdfDocument.Locale['en-AU'] = {
    url: 'URL',
    categoryBasicSettings: 'Basic Settings',
    sizing: 'Sizing',
    sizeTypes: {
        auto: 'AutoSize',
        fitPage: 'FitToPageSize'
    },
    toolTip: {
        requirements: 'Display any PDF File',
        description: 'Display the PDF document content in the report',
        title: 'PDF'
    }
};
EJPdfDocument.Locale['en-CA'] = {
    url: 'URL',
    categoryBasicSettings: 'Basic Settings',
    sizing: 'Sizing',
    sizeTypes: {
        auto: 'AutoSize',
        fitPage: 'FitToPageSize'
    },
    toolTip: {
        requirements: 'Display any PDF File',
        description: 'Display the PDF document content in the report',
        title: 'PDF'
    }
};
EJPdfDocument.Locale['es-ES'] = {
    url: 'URL',
    categoryBasicSettings: 'Configuración básica',
    sizing: 'Tamaño',
    sizeTypes: {
        auto: 'Tamaño automático',
        fitPage: 'Ajustar al tamaño de la página'
    },
    toolTip: {
        requirements: 'Mostrar cualquier archivo PDF',
        description: 'Mostrar el contenido del documento PDF en el informe',
        title: 'PDF'
    }
};
EJPdfDocument.Locale['it-IT'] = {
    url: 'URL',
    categoryBasicSettings: 'Impostazioni di base',
    sizing: 'Ridimensionamento',
    sizeTypes: {
        auto: 'Dimensione automatica',
        fitPage: 'Adatta al formato pagina'
    },
    toolTip: {
        requirements: 'Visualizza qualsiasi file PDF',
        description: 'Visualizza il contenuto del documento PDF nel rapporto',
        title: 'PDF'
    }
};
EJPdfDocument.Locale['fr-CA'] = {
    url: 'URL',
    categoryBasicSettings: 'Paramètres de base',
    sizing: 'Dimensionnement',
    sizeTypes: {
        auto: 'Taille automatique',
        fitPage: 'Adapter à la taille de la page'
    },
    toolTip: {
        requirements: 'Afficher n\'importe quel fichier PDF',
        description: 'Afficher le contenu du document PDF dans le rapport',
        title: 'PDF'
    }
};
EJPdfDocument.Locale['tr-TR'] = {
    url: 'URL',
    categoryBasicSettings: 'Temel Ayarlar',
    sizing: 'Boyutlandırma',
    sizeTypes: {
        auto: 'Otomatik Boyut',
        fitPage: 'Sayfa Boyutuna Sığdır'
    },
    toolTip: {
        requirements: 'Herhangi bir PDF dosyasını görüntüle',
        description: 'Rapor içinde PDF belgesi içeriğini görüntüle',
        title: 'PDF'
    }
};
EJPdfDocument.Locale['zh-CN'] = {
    url: 'URL',
    categoryBasicSettings: '基本设置',
    sizing: '调整大小',
    sizeTypes: {
        auto: '自动大小',
        fitPage: '适合页面大小'
    },
    toolTip: {
        requirements: '显示任何 PDF 文件',
        description: '在报告中显示 PDF 文档的内容',
        title: 'PDF'
    }
};
