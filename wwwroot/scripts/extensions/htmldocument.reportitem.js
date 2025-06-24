var EJHtmlDocument = (function () {
    function EJHtmlDocument(rptDesigner) {
        this.customJSON = null;
        this.propertyPanel = null;
        this.rootElement = null;
        this.customItemDiv = null;
        this.reportDesigner = null;
        this.reportDesigner = rptDesigner;
        this.propertyPanel = this.reportDesigner.getInstance('PropertyPanel');
    }
    EJHtmlDocument.prototype.initializeItem = function (args) {
        args.isBuildInService = false;
        args.defaultHeight = 160;
        args.defaultWidth = 160;
        args.minimumHeight = 15;
        args.minimumWidth = 90;
    };
    EJHtmlDocument.prototype.renderItem = function (customJson, target, eventData) {
        if (eventData.eventName === 'begin') {
            this.customJSON = customJson;
            this.rootElement = target;
            this.renderHtmlItem();
        }
    };
    EJHtmlDocument.prototype.renderHtmlItem = function () {
        this.customItemDiv = ej.buildTag('div.customitem', '', {
            'width': '100%', 'height': '100%', 'border': '1pt dotted gray', 'box-sizing': 'border-box',
            '-moz-box-sizing': 'border-box', '-webkit-box-sizing': 'border-box', 'overflow': 'hidden', 'position': 'absolute'
        }, {
            'id': this.customJSON.Name + '_customItem'
        });
        var htmlItem = ej.buildTag('div.e-rptdesigner-htmldocument', '');
        this.customItemDiv.append(htmlItem);
        this.rootElement.append(this.customItemDiv);
    };
    EJHtmlDocument.prototype.onPropertyChange = function (name, oldValue, newValue) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        switch (name) {
            case 'DocumentValue':
                this.updatePropertyVal(name, newValue);
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
    EJHtmlDocument.prototype.updatePropertyUIValue = function (name, value) {
        var customId = this.customJSON.UniqueId;
        switch (name) {
            case 'DocumentValue':
                var source = this.getPropertyVal('Source');
                if (source === 'URL') {
                    this.propertyPanel.updatePropertyUIValue('htmlurl', value, customId);
                }
                else if (source === 'Content') {
                    this.propertyPanel.updatePropertyUIValue('htmlcontent', value, customId);
                }
                else {
                    this.propertyPanel.updatePropertyUIValue('htmldatabase', value, customId);
                }
                break;
        }
    };
    EJHtmlDocument.prototype.onPositionChanged = function (top, left) {
    };
    EJHtmlDocument.prototype.onSizeChanged = function (height, width) {
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
    EJHtmlDocument.prototype.getPropertyGridItems = function (baseProperties) {
        var itemProperties = [{
                'CategoryId': 'basicsettings',
                'DisplayName': 'categoryBasicSettings',
                'IsExpand': true,
                'Items': [{
                        'ItemId': 'htmlsource',
                        'Name': 'Source',
                        'DisplayName': 'source',
                        'EnableExpression': false,
                        'Value': this.getPropertyVal('Source'),
                        'ItemType': 'DropDown',
                        'ValueList': [
                            { text: 'content', value: 'Content' },
                            { text: 'url', value: 'URL' },
                            { text: 'database', value: 'Database' }
                        ],
                        'DependentItems': [{
                                EnableItems: ['basicsettings_htmlcontent'],
                                DisableItems: ['basicsettings_htmlurl', 'basicsettings_htmldatabase'],
                                Value: ['Content']
                            }, {
                                EnableItems: ['basicsettings_htmlurl'],
                                DisableItems: ['basicsettings_htmlcontent', 'basicsettings_htmldatabase'],
                                Value: ['URL']
                            }, {
                                EnableItems: ['basicsettings_htmldatabase'],
                                DisableItems: ['basicsettings_htmlcontent', 'basicsettings_htmlurl'],
                                Value: ['Database']
                            }]
                    },
                    {
                        'ItemId': 'htmlcontent',
                        'Name': 'DocumentValue',
                        'ParentId': 'basicsettings_htmlsource',
                        'DisplayName': 'content',
                        'Value': this.getPropertyVal('DocumentValue'),
                        'EnableExpression': false,
                        'ItemType': 'TextArea'
                    },
                    {
                        'ItemId': 'htmlurl',
                        'Name': 'DocumentValue',
                        'ParentId': 'basicsettings_htmlsource',
                        'DisplayName': 'url',
                        'Value': this.getPropertyVal('DocumentValue'),
                        'EnableExpression': false,
                        'ItemType': 'TextBox'
                    },
                    {
                        'ItemId': 'htmldatabase',
                        'Name': 'DocumentValue',
                        'ParentId': 'basicsettings_htmlsource',
                        'DisplayName': 'database',
                        'Value': this.getPropertyVal('DocumentValue'),
                        'ItemType': 'ComboBox',
                        'SourceType': 'Fields',
                        'EnableExpression': true
                    },
                    {
                        'ItemId': 'htmlsizing',
                        'Name': 'Sizing',
                        'DisplayName': 'sizing',
                        'Value': this.getPropertyVal('Sizing'),
                        'ItemType': 'DropDown',
                        'EnableExpression': false,
                        'ValueList': [
                            { text: 'auto', value: 'AutoSize' },
                            { text: 'fit', value: 'Fit' },
                            { text: 'proportional', value: 'FitProportional' },
                            { text: 'clip', value: 'Clip' }
                        ]
                    }]
            }];
        baseProperties.HeaderText = this.customJSON.Name;
        baseProperties.PropertyType = 'htmldocument';
        baseProperties.SubType = 'htmldocument';
        baseProperties.IsEditHeader = true;
        this.updateItemVisibility(baseProperties.Items, ['backgroundcolor'], false);
        baseProperties.Items = $.merge(itemProperties, baseProperties.Items);
        return baseProperties;
    };
    EJHtmlDocument.prototype.updateItemVisibility = function (categories, itemId, newValue) {
        for (var index = 0; index < categories.length; index++) {
            for (var itemIndex = 0; itemIndex < categories[index].Items.length; itemIndex++) {
                if (itemId.indexOf(categories[index].Items[itemIndex].ItemId) !== -1) {
                    categories[index].Items[itemIndex].IsVisible = newValue;
                }
            }
        }
    };
    EJHtmlDocument.prototype.getPropertyVal = function (name) {
        if (this.customJSON.CustomProperties && this.customJSON.CustomProperties.length > 0) {
            for (var index = 0; index < this.customJSON.CustomProperties.length; index++) {
                if (this.customJSON.CustomProperties[index].Name === name) {
                    return this.customJSON.CustomProperties[index].Value;
                }
            }
        }
        return null;
    };
    EJHtmlDocument.prototype.setPropertyVal = function (name, val) {
        if (this.customJSON.CustomProperties === null) {
            this.customJSON.CustomProperties = [];
        }
        this.customJSON.CustomProperties.push(new ej.ReportModel.CustomProperty(name, val));
    };
    EJHtmlDocument.prototype.updatePropertyVal = function (propertyName, value) {
        if (this.customJSON.CustomProperties && this.customJSON.CustomProperties.length > 0) {
            for (var index = 0; index < this.customJSON.CustomProperties.length; index++) {
                if (this.customJSON.CustomProperties[index].Name === propertyName) {
                    this.customJSON.CustomProperties[index].Value = value;
                }
            }
        }
    };
    EJHtmlDocument.prototype.getReportItemJson = function () {
        if (this.customJSON === null) {
            this.customJSON = new ej.ReportModel.CustomReportItem().getModel();
            this.setPropertyVal('Source', 'Content');
            this.setPropertyVal('Sizing', 'AutoSize');
            this.setPropertyVal('DocumentValue', '');
        }
        return this.customJSON;
    };
    EJHtmlDocument.prototype.setReportItemJson = function (reportItem) {
        this.customJSON = reportItem;
    };
    EJHtmlDocument.prototype.dispose = function () {
        this.customJSON = null;
        this.propertyPanel = null;
        this.rootElement = null;
        this.customItemDiv = null;
        this.reportDesigner = null;
    };
    EJHtmlDocument.prototype.undoRedoAction = function (args) {
    };
    EJHtmlDocument.prototype.getLocale = function (text) {
        var htmlLocale;
        var defaultLocale = EJHtmlDocument.Locale['en-US'];
        if (this.reportDesigner && !ej.isNullOrUndefined(this.reportDesigner.model) &&
            !ej.isNullOrUndefined(EJHtmlDocument.Locale[this.reportDesigner.model.locale])) {
            htmlLocale = EJHtmlDocument.Locale[this.reportDesigner.model.locale];
        }
        else {
            htmlLocale = defaultLocale;
        }
        switch (text.toLowerCase()) {
            case 'categorybasicsettings':
                if (htmlLocale && htmlLocale.categoryBasicSettings) {
                    return htmlLocale.categoryBasicSettings;
                }
                return defaultLocale.categoryBasicSettings;
            case 'sizing':
                if (htmlLocale && htmlLocale.sizing) {
                    return htmlLocale.sizing;
                }
                return defaultLocale.sizing;
            case 'source':
                if (htmlLocale && htmlLocale.source) {
                    return htmlLocale.source;
                }
                return defaultLocale.source;
            case 'content':
                if (htmlLocale && htmlLocale.sourceTypes && htmlLocale.sourceTypes.content) {
                    return htmlLocale.sourceTypes.content;
                }
                return defaultLocale.sourceTypes.content;
            case 'url':
                if (htmlLocale && htmlLocale.sourceTypes && htmlLocale.sourceTypes.url) {
                    return htmlLocale.sourceTypes.url;
                }
                return defaultLocale.sourceTypes.url;
            case 'database':
                if (htmlLocale && htmlLocale.sourceTypes && htmlLocale.sourceTypes.database) {
                    return htmlLocale.sourceTypes.database;
                }
                return defaultLocale.sourceTypes.database;
            case 'auto':
                if (htmlLocale && htmlLocale.sizeTypes && htmlLocale.sizeTypes.auto) {
                    return htmlLocale.sizeTypes.auto;
                }
                return defaultLocale.sizeTypes.auto;
            case 'fit':
                if (htmlLocale && htmlLocale.sizeTypes && htmlLocale.sizeTypes.fit) {
                    return htmlLocale.sizeTypes.fit;
                }
                return defaultLocale.sizeTypes.fit;
            case 'proportional':
                if (htmlLocale && htmlLocale.sizeTypes && htmlLocale.sizeTypes.proportional) {
                    return htmlLocale.sizeTypes.proportional;
                }
                return defaultLocale.sizeTypes.proportional;
            case 'clip':
                if (htmlLocale && htmlLocale.sizeTypes && htmlLocale.sizeTypes.clip) {
                    return htmlLocale.sizeTypes.clip;
                }
                return defaultLocale.sizeTypes.clip;
        }
        return text;
    };
    return EJHtmlDocument;
}());
EJHtmlDocument.Locale = {};
EJHtmlDocument.Locale['en-US'] = {
    source: 'Source',
    sourceTypes: {
        content: 'Content',
        url: 'URL',
        database: 'Database',
    },
    categoryBasicSettings: 'Basic Settings',
    sizing: 'Sizing',
    sizeTypes: {
        auto: 'AutoSize',
        fit: 'Fit',
        proportional: 'FitProportional',
        clip: 'Clip'
    },
    toolTip: {
        requirements: 'Display any Html markup (or) url',
        description: 'This report item used to process the html markup text and url',
        title: 'Html'
    }
};
EJHtmlDocument.Locale['ar-AE'] = {
    source: 'مصدر',
    sourceTypes: {
        content: 'محتوى',
        url: 'رابط',
        database: 'قاعدة البيانات',
    },
    categoryBasicSettings: 'الإعدادات الأساسية',
    sizing: 'تغيير الحجم',
    sizeTypes: {
        auto: 'حجم تلقائي',
        fit: 'لياقة',
        proportional: 'ملاءمة متناسبة',
        clip: 'قص'
    },
    toolTip: {
        requirements: 'عرض أي ترميز HTML (أو) رابط',
        description: 'يستخدم عنصر التقرير هذا لمعالجة نص ترميز HTML والرابط',
        title: 'HTML'
    }
};
EJHtmlDocument.Locale['fr-FR'] = {
    source: 'Source',
    sourceTypes: {
        content: 'Contenu',
        url: 'URL',
        database: 'Base de données',
    },
    categoryBasicSettings: 'Paramètres de base',
    sizing: 'Dimensionnement',
    sizeTypes: {
        auto: 'Taille automatique',
        fit: 'Ajustement',
        proportional: 'Ajustement proportionnel',
        clip: 'Couper'
    },
    toolTip: {
        requirements: 'Afficher n\'importe quel balisage HTML (ou) URL',
        description: 'Cet élément de rapport est utilisé pour traiter le texte de balisage HTML et l\'URL',
        title: 'Html'
    }
};
EJHtmlDocument.Locale['de-DE'] = {
    source: 'Quelle',
    sourceTypes: {
        content: 'Inhalt',
        url: 'URL',
        database: 'Datenbank',
    },
    categoryBasicSettings: 'Grundeinstellungen',
    sizing: 'Größenanpassung',
    sizeTypes: {
        auto: 'Automatische Größe',
        fit: 'Anpassen',
        proportional: 'Proportional anpassen',
        clip: 'Schneiden'
    },
    toolTip: {
        requirements: 'Beliebiges HTML-Markup (oder) URL anzeigen',
        description: 'Dieses Berichtsobjekt wird verwendet, um HTML-Markup-Text und URL zu verarbeiten',
        title: 'Html'
    }
};
EJHtmlDocument.Locale['en-AU'] = {
    source: 'Source',
    sourceTypes: {
        content: 'Content',
        url: 'URL',
        database: 'Database',
    },
    categoryBasicSettings: 'Basic Settings',
    sizing: 'Sizing',
    sizeTypes: {
        auto: 'AutoSize',
        fit: 'Fit',
        proportional: 'FitProportional',
        clip: 'Clip'
    },
    toolTip: {
        requirements: 'Display any Html markup (or) url',
        description: 'This report item used to process the html markup text and url',
        title: 'Html'
    }
};
EJHtmlDocument.Locale['en-CA'] = {
    source: 'Source',
    sourceTypes: {
        content: 'Content',
        url: 'URL',
        database: 'Database',
    },
    categoryBasicSettings: 'Basic Settings',
    sizing: 'Sizing',
    sizeTypes: {
        auto: 'AutoSize',
        fit: 'Fit',
        proportional: 'FitProportional',
        clip: 'Clip'
    },
    toolTip: {
        requirements: 'Display any Html markup (or) url',
        description: 'This report item used to process the html markup text and url',
        title: 'Html'
    }
};
EJHtmlDocument.Locale['es-ES'] = {
    source: 'Fuente',
    sourceTypes: {
        content: 'Contenido',
        url: 'URL',
        database: 'Base de datos',
    },
    categoryBasicSettings: 'Configuración básica',
    sizing: 'Tamaño',
    sizeTypes: {
        auto: 'Tamaño automático',
        fit: 'Ajustar',
        proportional: 'Ajuste proporcional',
        clip: 'Recortar'
    },
    toolTip: {
        requirements: 'Mostrar cualquier marcado HTML (o) URL',
        description: 'Este elemento de informe se utiliza para procesar el texto de marcado HTML y la URL',
        title: 'Html'
    }
};
EJHtmlDocument.Locale['it-IT'] = {
    source: 'Fonte',
    sourceTypes: {
        content: 'Contenuto',
        url: 'URL',
        database: 'Database',
    },
    categoryBasicSettings: 'Impostazioni di base',
    sizing: 'Ridimensionamento',
    sizeTypes: {
        auto: 'Dimensione automatica',
        fit: 'Adatta',
        proportional: 'Adatta proporzionalmente',
        clip: 'Taglia'
    },
    toolTip: {
        requirements: 'Visualizza qualsiasi markup HTML (o) URL',
        description: 'Questo elemento del rapporto viene utilizzato per elaborare il testo di markup HTML e l\'URL',
        title: 'Html'
    }
};
EJHtmlDocument.Locale['fr-CA'] = {
    source: 'Source',
    sourceTypes: {
        content: 'Contenu',
        url: 'URL',
        database: 'Base de données',
    },
    categoryBasicSettings: 'Paramètres de base',
    sizing: 'Dimensionnement',
    sizeTypes: {
        auto: 'Taille automatique',
        fit: 'Ajustement',
        proportional: 'Ajustement proportionnel',
        clip: 'Couper'
    },
    toolTip: {
        requirements: 'Afficher n\'importe quel balisage HTML (ou) URL',
        description: 'Cet élément de rapport est utilisé pour traiter le texte de balisage HTML et l\'URL',
        title: 'Html'
    }
};
EJHtmlDocument.Locale['tr-TR'] = {
    source: 'Kaynak',
    sourceTypes: {
        content: 'İçerik',
        url: 'URL',
        database: 'Veritabanı',
    },
    categoryBasicSettings: 'Temel Ayarlar',
    sizing: 'Boyutlandırma',
    sizeTypes: {
        auto: 'Otomatik Boyut',
        fit: 'Sığdır',
        proportional: 'Orantılı Sığdır',
        clip: 'Kes'
    },
    toolTip: {
        requirements: 'Herhangi bir HTML işaretlemesi (veya) URL görüntüle',
        description: 'Bu rapor öğesi HTML işaretleme metnini ve URL\'yi işlemek için kullanılır',
        title: 'Html'
    }
};
EJHtmlDocument.Locale['zh-CN'] = {
    source: '来源',
    sourceTypes: {
        content: '内容',
        url: 'URL',
        database: '数据库',
    },
    categoryBasicSettings: '基本设置',
    sizing: '调整大小',
    sizeTypes: {
        auto: '自动大小',
        fit: '适合',
        proportional: '比例适合',
        clip: '剪辑'
    },
    toolTip: {
        requirements: '显示任何 HTML 标记（或）URL',
        description: '此报告项目用于处理 HTML 标记文本和 URL',
        title: 'Html'
    }
};
