var EJPdfDocument = (function () {
    function EJPdfDocument(rptDesigner) {
        this.customJSON = null;
        this.rootElement = null;
        this.propertyPanel = null;
        this.customItemDiv = null;
        this.reportDesigner = null;
        this.reportDesigner = rptDesigner;
        this.propertyPanel = this.reportDesigner.getInstance('PropertyPanel');
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
            case 'DocumentValue':
                if (typeof newValue === 'string') {
                    this.updatePropertyVal(name, newValue);
                }
                else {
                    this.setFileName(newValue);
                }
                break;
            case 'Sizing':
                this.updatePropertyVal(name, newValue);
                break;
            case 'Source':
                this.updatePropertyVal(name, newValue);
                this.updatePropertyVal('DocumentValue', '');
                this.updatePropertyUIValue('DocumentValue', '');
                break;
        }
    };
    EJPdfDocument.prototype.updatePropertyUIValue = function (name, value) {
        var customId = this.customJSON.UniqueId;
        switch (name) {
            case 'DocumentValue':
                var source = this.getPropertyVal('Source');
                if (source === 'URL') {
                    this.propertyPanel.updatePropertyUIValue('pdfurl', value, customId);
                }
                else if (source === 'Database') {
                    this.propertyPanel.updatePropertyUIValue('pdfdatabase', value, customId);
                }
                else {
                    this.propertyPanel.updatePropertyUIValue('pdfserver', { FilePath: value }, customId);
                }
                break;
        }
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
                        'ItemId': 'pdfsource',
                        'Name': 'Source',
                        'DisplayName': 'source',
                        'EnableExpression': false,
                        'Value': this.getPropertyVal('Source'),
                        'ItemType': 'DropDown',
                        'ValueList': [
                            { text: 'url', value: 'URL' },
                            { text: 'database', value: 'Database' },
                            { text: 'server', value: 'Server' }
                        ],
                        'DependentItems': [
                            { EnableItems: ['basicsettings_pdfurl'], DisableItems: ['basicsettings_pdfdatabase', 'basicsettings_pdfserver'], Value: ['URL'] },
                            { EnableItems: ['basicsettings_pdfdatabase'], DisableItems: ['basicsettings_pdfurl', 'basicsettings_pdfserver'], Value: ['Database'] },
                            { EnableItems: ['basicsettings_pdfserver'], DisableItems: ['basicsettings_pdfurl', 'basicsettings_pdfdatabase'], Value: ['Server'] }
                        ]
                    },
                    {
                        'ItemId': 'pdfurl',
                        'Name': 'DocumentValue',
                        'ParentId': 'basicsettings_pdfsource',
                        'DisplayName': 'url',
                        'Value': this.getPropertyVal('DocumentValue'),
                        'EnableExpression': false,
                        'ItemType': 'TextBox'
                    },
                    {
                        'ItemId': 'pdfdatabase',
                        'Name': 'DocumentValue',
                        'ParentId': 'basicsettings_pdfsource',
                        'DisplayName': 'database',
                        'Value': this.getPropertyVal('DocumentValue'),
                        'ItemType': 'ComboBox',
                        'SourceType': 'Fields',
                        'EnableExpression': true,
                        'EnableSearch': true
                    },
                    {
                        'ItemId': 'pdfserver',
                        'Name': 'DocumentValue',
                        'ParentId': 'basicsettings_pdfsource',
                        'DisplayName': 'server',
                        'Value': this.getFileName(),
                        'ItemType': 'LinkReport',
                        'EnableExpression': false,
                        'ExtType': 'pdf'
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
    EJPdfDocument.prototype.getFileName = function () {
        return {
            FilePath: this.getPropertyVal('DocumentValue')
        };
    };
    EJPdfDocument.prototype.setFileName = function (value) {
        this.updatePropertyVal('DocumentValue', value && value.FilePath ? value.FilePath : '');
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
            this.setPropertyVal('Source', 'URL');
        }
        return this.customJSON;
    };
    EJPdfDocument.prototype.setReportItemJson = function (reportItem) {
        this.customJSON = reportItem;
    };
    EJPdfDocument.prototype.dispose = function () {
        this.customJSON = null;
        this.rootElement = null;
        this.propertyPanel = null;
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
            case 'source':
                if (pdfLocale && pdfLocale.source) {
                    return pdfLocale.source;
                }
                return defaultLocale.source;
            case 'sizing':
                if (pdfLocale && pdfLocale.sizing) {
                    return pdfLocale.sizing;
                }
                return defaultLocale.sizing;
            case 'url':
                if (pdfLocale && pdfLocale.sourceTypes && pdfLocale.sourceTypes.url) {
                    return pdfLocale.sourceTypes.url;
                }
                return defaultLocale.sourceTypes.url;
            case 'database':
                if (pdfLocale && pdfLocale.sourceTypes && pdfLocale.sourceTypes.database) {
                    return pdfLocale.sourceTypes.database;
                }
                return defaultLocale.sourceTypes.database;
            case 'server':
                if (pdfLocale && pdfLocale.sourceTypes && pdfLocale.sourceTypes.server) {
                    return pdfLocale.sourceTypes.server;
                }
                return defaultLocale.sourceTypes.server;
            case 'auto':
                if (pdfLocale && pdfLocale.sizeTypes && pdfLocale.sizeTypes.auto) {
                    return pdfLocale.sizeTypes.auto;
                }
                return defaultLocale.sizeTypes.auto;
            case 'fitpage':
                if (pdfLocale && pdfLocale.sizeTypes && pdfLocale.sizeTypes.fitPage) {
                    return pdfLocale.sizeTypes.fitPage;
                }
                return defaultLocale.sizeTypes.fitPage;
        }
        return text;
    };
    return EJPdfDocument;
}());
EJPdfDocument.Locale = {};
EJPdfDocument.Locale['en-NZ'] = {
    source: 'Source',
    sourceTypes: {
        url: 'URL',
        database: 'Database',
        server: 'Server'
    },
    categoryBasicSettings: 'Basic Settings',
    sizing: 'Sizing',
    sizeTypes: {
        auto: 'AutoSize',
        fitPage: 'FitToPageSize'
    },
    toolTip: {
        requirements: 'Display any PDF file',
        description: 'Display the PDF document content in the report',
        title: 'PDF'
    }
};
EJPdfDocument.Locale['en-US'] = {
    source: 'Source',
    sourceTypes: {
        url: 'URL',
        database: 'Database',
        server: 'Server'
    },
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
    source: 'مصدر',
    sourceTypes: {
        url: 'URL',
        database: 'قاعدة البيانات',
        server: 'الخادم'
    },
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
    source: 'Source',
    sourceTypes: {
        url: 'URL',
        database: 'Base de données',
        server: 'Serveur'
    },
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
    source: 'Quelle',
    sourceTypes: {
        url: 'URL',
        database: 'Datenbank',
        server: 'Server'
    },
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
    source: 'Source',
    sourceTypes: {
        url: 'URL',
        database: 'Database',
        server: 'Server'
    },
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
    source: 'Source',
    sourceTypes: {
        url: 'URL',
        database: 'Database',
        server: 'Server'
    },
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
    source: 'Fuente',
    sourceTypes: {
        url: 'URL',
        database: 'Base de datos',
        server: 'Servidor'
    },
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
    source: 'Fonte',
    sourceTypes: {
        url: 'URL',
        database: 'Database',
        server: 'Server'
    },
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
    source: 'Source',
    sourceTypes: {
        url: 'URL',
        database: 'Base de données',
        server: 'Serveur'
    },
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
    source: 'Kaynak',
    sourceTypes: {
        url: 'URL',
        database: 'Veritabanı',
        server: 'Sunucu'
    },
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
EJPdfDocument.Locale['zh-Hans'] = {
    source: '来源',
    sourceTypes: {
        url: 'URL',
        database: '数据库',
        server: '服务器'
    },
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
EJPdfDocument.Locale['he-IL'] = {
    source: 'מקור',
    sourceTypes: {
        url: 'כתובת URL',
        database: 'מסד נתונים',
        server: 'שרת'
    },
    categoryBasicSettings: 'הגדרות בסיסיות',
    sizing: 'גודל',
    sizeTypes: {
        auto: 'גודל אוטומטי',
        fitPage: 'התאם לגודל הדף'
    },
    toolTip: {
        requirements: 'הצגת קובץ PDF כלשהו',
        description: 'הצגת תוכן מסמך ה-PDF בדוח',
        title: 'PDF'
    }
};
EJPdfDocument.Locale['ja-JP'] = {
    source: 'ソース',
    sourceTypes: {
        url: 'URL',
        database: 'データベース',
        server: 'サーバ'
    },
    categoryBasicSettings: '基本設定',
    sizing: 'サイズ設定',
    sizeTypes: {
        auto: '自動サイズ',
        fitPage: 'ページサイズに合わせる'
    },
    toolTip: {
        requirements: '任意のPDFファイルを表示',
        description: 'レポートでPDFドキュメントの内容を表示します',
        title: 'PDF'
    }
};
EJPdfDocument.Locale['pt-PT'] = {
    source: 'Fonte',
    sourceTypes: {
        url: 'URL',
        database: 'Base de dados',
        server: 'Servidor'
    },
    categoryBasicSettings: 'Configurações básicas',
    sizing: 'Dimensionamento',
    sizeTypes: {
        auto: 'Tamanho automático',
        fitPage: 'Ajustar ao tamanho da página'
    },
    toolTip: {
        requirements: 'Exibir qualquer ficheiro PDF',
        description: 'Exibir o conteúdo do documento PDF no relatório',
        title: 'PDF'
    }
};
EJPdfDocument.Locale['ru-RU'] = {
    source: 'Источник',
    sourceTypes: {
        url: 'URL',
        database: 'База данных',
        server: 'Сервер'
    },
    categoryBasicSettings: 'Основные настройки',
    sizing: 'Размер',
    sizeTypes: {
        auto: 'Автоматический размер',
        fitPage: 'Подогнать под размер страницы'
    },
    toolTip: {
        requirements: 'Показать любой PDF-файл',
        description: 'Показать содержимое PDF-документа в отчете',
        title: 'PDF'
    }
};
EJPdfDocument.Locale['zh-Hant'] = {
    source: '來源',
    sourceTypes: {
        url: 'URL',
        database: '資料庫',
        server: '伺服器'
    },
    categoryBasicSettings: '基本設定',
    sizing: '調整大小',
    sizeTypes: {
        auto: '自動大小',
        fitPage: '符合頁面大小'
    },
    toolTip: {
        requirements: '顯示任何 PDF 檔案',
        description: '在報告中顯示 PDF 文件內容',
        title: 'PDF'
    }
};
