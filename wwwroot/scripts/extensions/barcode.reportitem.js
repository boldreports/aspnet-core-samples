var EJBarcode = (function () {
    function EJBarcode(rptDesigner) {
        this.customJSON = null;
        this.rootElement = null;
        this.customItemDiv = null;
        this.reportDesigner = null;
        this.loaderDiv = null;
        this.errMsgDiv = null;
        this.reportDesigner = rptDesigner;
    }
    EJBarcode.prototype.initializeItem = function (args) {
        args.isBuildInService = true;
        args.defaultHeight = 120;
        args.defaultWidth = 180;
        args.minimumHeight = 15;
        args.minimumWidth = 90;
        args.renderCallback = $.proxy(this.renderData, this);
        args.loadingCallback = $.proxy(this.showIndicator, this);
    };
    EJBarcode.prototype.renderItem = function (customJson, target, eventData) {
        if (eventData.eventName === 'begin') {
            this.customJSON = customJson;
            this.rootElement = target;
            this.renderBarcode();
        }
    };
    EJBarcode.prototype.renderBarcode = function () {
        this.customItemDiv = ej.buildTag('div.customitem', '', {
            'width': '100%',
            'height': '100%',
            'border': '1pt dotted gray',
            'box-sizing': 'border-box',
            '-moz-box-sizing': 'border-box',
            '-webkit-box-sizing': 'border-box',
            'overflow': 'hidden', 'position': 'absolute'
        }, {
            'id': this.customJSON.Name + '_customItem'
        });
        var loaderDiv = this.loaderDiv = ej.buildTag('div.e-rptdesigner-loaderDiv', '', {
            'width': '100%', 'height': '100%', 'display': 'none', 'opacity': '0.9',
            'position': 'absolute', 'border': '0.5px dotted black',
            'background-color': 'white',
            'z-index': '4000', 'overflow': 'hidden'
        });
        var spinnerDiv = ej.buildTag('div.e-rptdesigner-spinnerDiv', '', {
            'border': '5px solid #f3f3f3',
            'border-radius': '50%', 'margin': '-17.5px 0 0 -17.5px',
            'border-top': '5px solid #3498db',
            '-webkit-animation': 'spin 2s linear infinite',
            'animation': 'spin 2s linear infinite',
            'background': 'transparent',
            'position': 'absolute',
            'left': '50%',
            'top': '50%',
            'cursor': 'default',
            'height': '25px',
            'width': '25px'
        });
        var errorRootDiv = this.errMsgDiv = ej.buildTag('div', '', {
            'display': 'none', 'position': 'relative', 'z-index': '3000',
            'font-family': 'Segoe UI', 'font-size': '13px', 'height': '100%', 'width': '100%'
        });
        var errorDiv = ej.buildTag('div', 'Failed to load barcode', {
            'display': 'table-cell', 'overflow': 'hidden', 'font-family': 'Segoe UI',
            'font-size': '13px', 'vertical-align': 'middle', 'text-align': 'center'
        });
        this.rootElement.append(loaderDiv);
        loaderDiv.append(spinnerDiv);
        errorRootDiv.append(errorDiv);
        this.customItemDiv.append(errorRootDiv);
        this.rootElement.append(this.customItemDiv);
    };
    EJBarcode.prototype.onPropertyChange = function (name, oldValue, newValue) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        switch (name) {
            case 'BarcodeValue':
                this.updatePropertyVal(name, newValue);
                break;
            case 'BarcodeType':
                this.updatePropertyVal(name, newValue);
                break;
            case 'DisplayBarcodeText':
                this.updatePropertyVal(name, (newValue === true) ? 'true' : 'false');
                break;
            case 'BarcodeRotation':
                this.updatePropertyVal(name, newValue ? newValue : 'None');
                break;
        }
    };
    EJBarcode.prototype.updatePropertyUIValue = function (name, value) {
    };
    EJBarcode.prototype.onPositionChanged = function (top, left) {
    };
    EJBarcode.prototype.onSizeChanged = function (height, width) {
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
    EJBarcode.prototype.getPropertyGridItems = function (baseProperties) {
        var barCodeType = this.getPropertyVal('BarcodeType');
        var itemProperties = [{
                'CategoryId': 'basicsettings',
                'DisplayName': 'categoryBasicSettings',
                'IsExpand': true,
                'Items': [
                    {
                        'ItemId': 'barcodetype',
                        'Name': 'BarcodeType',
                        'DisplayName': 'BarcodeType',
                        'Value': barCodeType,
                        'ItemType': 'DropDown',
                        'EnableExpression': false,
                        'ValueList': ['Code39', 'Code39Extended', 'Code11', 'Codabar', 'Code93', 'Code128A', 'Code128B',
                            'Code128C', 'GS1-128', 'UpcBarcode', 'EAN-13', 'EAN-8', 'Code39 Mod 43', 'Interleaved 2 of 5',
                            'Standard 2 of 5', 'Pharmacode']
                    },
                    {
                        'ItemId': 'barcodevalue',
                        'Name': 'BarcodeValue',
                        'DisplayName': 'barcodeValue',
                        'EnableExpression': true,
                        'Value': this.getPropertyVal('BarcodeValue'),
                        'ItemType': 'TextBox'
                    },
                    {
                        'ItemId': 'displaybarcodetext',
                        'Name': 'DisplayBarcodeText',
                        'DisplayName': 'displayText',
                        'Value': this.isDisplayText() ? true : false,
                        'ItemType': 'Bool',
                        'EnableExpression': false
                    },
                    {
                        'ItemId': 'barcoderotation',
                        'Name': 'BarcodeRotation',
                        'DisplayName': 'barcodeRotationLabel',
                        'Value': this.getBarcodeRotation(this.getPropertyVal('BarcodeRotation')),
                        'ItemType': 'DropDown',
                        'EnableExpression': false,
                        'ValueList': this.getRotationLevel()
                    }
                ]
            }
        ];
        baseProperties.HeaderText = this.customJSON.Name;
        baseProperties.PropertyType = 'barcode';
        baseProperties.SubType = 'barcode';
        baseProperties.IsEditHeader = true;
        baseProperties.Items = $.merge(itemProperties, baseProperties.Items);
        return baseProperties;
    };
    EJBarcode.prototype.getPropertyVal = function (name) {
        if (this.customJSON.CustomProperties && this.customJSON.CustomProperties.length > 0) {
            for (var index = 0; index < this.customJSON.CustomProperties.length; index++) {
                if (this.customJSON.CustomProperties[index].Name === name) {
                    return this.customJSON.CustomProperties[index].Value;
                }
            }
        }
        return null;
    };
    EJBarcode.prototype.setPropertyVal = function (name, val) {
        if (this.customJSON.CustomProperties === null) {
            this.customJSON.CustomProperties = [];
        }
        this.customJSON.CustomProperties.push(new ej.ReportModel.CustomProperty(name, val));
    };
    EJBarcode.prototype.updatePropertyVal = function (propertyName, value) {
        var isUpdated = false;
        if (this.customJSON.CustomProperties && this.customJSON.CustomProperties.length > 0) {
            for (var index = 0; index < this.customJSON.CustomProperties.length; index++) {
                if (this.customJSON.CustomProperties[index].Name === propertyName) {
                    this.customJSON.CustomProperties[index].Value = value;
                    isUpdated = true;
                    break;
                }
            }
        }
        if (!isUpdated) {
            this.setPropertyVal(propertyName, value);
        }
    };
    EJBarcode.prototype.getReportItemJson = function () {
        if (this.customJSON === null) {
            this.customJSON = new ej.ReportModel.CustomReportItem().getModel();
            this.setPropertyVal('BarcodeValue', '00000');
            this.setPropertyVal('BarcodeType', 'Code39');
            this.setPropertyVal('DisplayBarcodeText', 'true');
            this.setPropertyVal('BarcodeRotation', 'None');
        }
        return this.customJSON;
    };
    EJBarcode.prototype.getRotationLevel = function () {
        return [
            {
                text: 'rotationnone', value: 'None'
            },
            {
                text: 'rotate90degrees', value: 'Rotate90Degrees'
            },
            {
                text: 'rotate180degrees', value: 'Rotate180Degrees'
            },
            {
                text: 'rotate270degrees', value: 'Rotate270Degrees'
            }
        ];
    };
    EJBarcode.prototype.getBarcodeRotation = function (rotation) {
        var rotationVal = rotation ? rotation.toLowerCase() : '';
        switch (rotationVal) {
            case 'none': return 'None';
            case 'rotate90degrees': return 'Rotate90Degrees';
            case 'rotate180degrees': return 'Rotate180Degrees';
            case 'rotate270degrees': return 'Rotate270Degrees';
        }
        return 'None';
    };
    EJBarcode.prototype.setReportItemJson = function (reportItem) {
        this.customJSON = reportItem;
    };
    EJBarcode.prototype.dispose = function () {
    };
    EJBarcode.prototype.undoRedoAction = function (args) {
    };
    EJBarcode.prototype.isDisplayText = function () {
        return (this.getPropertyVal('DisplayBarcodeText').toLowerCase()) === 'true';
    };
    EJBarcode.prototype.getLocale = function (text) {
        var barcodeLocale;
        var defaultLocale = EJBarcode.Locale['en-US'];
        if (this.reportDesigner && !ej.isNullOrUndefined(this.reportDesigner.model) &&
            !ej.isNullOrUndefined(EJBarcode.Locale[this.reportDesigner.model.locale])) {
            barcodeLocale = EJBarcode.Locale[this.reportDesigner.model.locale];
        }
        else {
            barcodeLocale = defaultLocale;
        }
        switch (text.toLowerCase()) {
            case 'barcodevalue':
                if (barcodeLocale && barcodeLocale.barcodeValue) {
                    return barcodeLocale.barcodeValue;
                }
                return defaultLocale.barcodeValue;
            case 'barcodetype':
                if (barcodeLocale && barcodeLocale.barcodeType) {
                    return barcodeLocale.barcodeType;
                }
                return defaultLocale.barcodeType;
            case 'displaytext':
                if (barcodeLocale && barcodeLocale.textVisibility) {
                    return barcodeLocale.textVisibility;
                }
                return defaultLocale.textVisibility;
            case 'categorybasicsettings':
                if (barcodeLocale && barcodeLocale.categoryBasicSettings) {
                    return barcodeLocale.categoryBasicSettings;
                }
                return defaultLocale.categoryBasicSettings;
            case 'barcoderotationlabel':
                if (barcodeLocale && barcodeLocale.barcodeRotationLabel) {
                    return barcodeLocale.barcodeRotationLabel;
                }
                return defaultLocale.barcodeRotationLabel;
            case 'rotationnone':
                if (barcodeLocale && barcodeLocale.barcodeRotation.rotationNone) {
                    return barcodeLocale.barcodeRotation.rotationNone;
                }
                return defaultLocale.barcodeRotation.rotationNone;
            case 'rotate90degrees':
                if (barcodeLocale && barcodeLocale.barcodeRotation.rotate90degrees) {
                    return barcodeLocale.barcodeRotation.rotate90degrees;
                }
                return defaultLocale.barcodeRotation.rotate90degrees;
            case 'rotate180degrees':
                if (barcodeLocale && barcodeLocale.barcodeRotation.rotate180degrees) {
                    return barcodeLocale.barcodeRotation.rotate180degrees;
                }
                return defaultLocale.barcodeRotation.rotate180degrees;
            case 'rotate270degrees':
                if (barcodeLocale && barcodeLocale.barcodeRotation.rotate270degrees) {
                    return barcodeLocale.barcodeRotation.rotate270degrees;
                }
                return defaultLocale.barcodeRotation.rotate270degrees;
        }
        return text;
    };
    EJBarcode.prototype.renderData = function (args) {
        this.customItemDiv.css('background-image', 'none');
        if (args && args.data && typeof args.data === 'string' && args.data.indexOf('Sf_Exception') !== -1) {
            this.errMsgDiv.css('display', 'table');
            this.errMsgDiv.find('div').text('Failed to load barcode - ' + args.data.replace('Sf_Exception - ', ''));
        }
        else if (args.isLoaded && args.data) {
            this.errMsgDiv.css('display', 'none');
            this.customItemDiv.css({
                'background-image': 'url(data:image/BMP;base64,' + args.data + ')',
                'background-size': '100% 100%',
                'background-repeat': 'no-repeat',
                'background-position': 'left top'
            });
        }
        else {
            this.errMsgDiv.css('display', 'table');
            this.errMsgDiv.find('div').text('Failed to load barcode');
        }
    };
    EJBarcode.prototype.showIndicator = function (isShow) {
        this.loaderDiv.css('display', isShow ? 'block' : 'none');
    };
    return EJBarcode;
}());
EJBarcode.Locale = {};
EJBarcode.Locale['en-NZ'] = {
    barcodeValue: 'Text',
    barcodeType: 'Symbology Type',
    textVisibility: 'Text Visibility',
    categoryBasicSettings: 'Basic Settings',
    barcodeRotationLabel: 'Rotation',
    barcodeRotation: {
        rotationNone: 'None',
        rotate90degrees: '90',
        rotate180degrees: '180',
        rotate270degrees: '270'
    },
    toolTip: {
        requirements: 'Display any barcode type.',
        description: 'Displays the barcodes.',
        title: 'Barcode'
    }
};
EJBarcode.Locale['en-US'] = {
    barcodeValue: 'Text',
    barcodeType: 'Symbology Type',
    textVisibility: 'Text Visibility',
    categoryBasicSettings: 'Basic Settings',
    barcodeRotationLabel: 'Rotation',
    barcodeRotation: {
        rotationNone: 'None',
        rotate90degrees: '90',
        rotate180degrees: '180',
        rotate270degrees: '270'
    },
    toolTip: {
        requirements: 'Display any barcode type.',
        description: 'Displays the barcodes.',
        title: 'Barcode'
    }
};
EJBarcode.Locale['fr-FR'] = {
    barcodeValue: 'Texte',
    barcodeType: 'Type de symbologie',
    textVisibility: 'Visibilite du texte',
    barcodeRotationLabel: 'Rotation',
    barcodeRotation: {
        rotationNone: 'Aucun',
        rotate90degrees: '90',
        rotate180degrees: '180',
        rotate270degrees: '270'
    },
    categoryBasicSettings: 'Paramètres de base',
    toolTip: {
        requirements: 'Afficher n\'importe quel type de code à barres.',
        description: 'Affiche les codes barres.',
        title: 'code à barre'
    }
};
EJBarcode.Locale['he-IL'] = {
    barcodeValue: 'טקסט',
    barcodeType: 'סוג סימנים',
    textVisibility: 'הצגת טקסט',
    barcodeRotationLabel: 'סיבוב',
    barcodeRotation: {
        rotationNone: 'ללא',
        rotate90degrees: '90',
        rotate180degrees: '180',
        rotate270degrees: '270'
    },
    categoryBasicSettings: 'הגדרות בסיסיות',
    toolTip: {
        requirements: 'הצג כל סוג של ברקוד.',
        description: 'מציג ברקודים.',
        title: 'ברקוד'
    }
};
EJBarcode.Locale['ja-JP'] = {
    barcodeValue: 'テキスト',
    barcodeType: 'シンボロジータイプ',
    textVisibility: 'テキストの表示',
    barcodeRotationLabel: '回転',
    barcodeRotation: {
        rotationNone: 'なし',
        rotate90degrees: '90',
        rotate180degrees: '180',
        rotate270degrees: '270'
    },
    categoryBasicSettings: '基本設定',
    toolTip: {
        requirements: 'すべてのバーコードタイプを表示します。',
        description: 'バーコードを表示します。',
        title: 'バーコード'
    }
};
EJBarcode.Locale['pt-PT'] = {
    barcodeValue: 'Texto',
    barcodeType: 'Tipo de simbologia',
    textVisibility: 'Visibilidade do texto',
    barcodeRotationLabel: 'Rotação',
    barcodeRotation: {
        rotationNone: 'Nenhuma',
        rotate90degrees: '90',
        rotate180degrees: '180',
        rotate270degrees: '270'
    },
    categoryBasicSettings: 'Configurações básicas',
    toolTip: {
        requirements: 'Exibe qualquer tipo de código de barras.',
        description: 'Exibe os códigos de barras.',
        title: 'Código de barras'
    }
};
EJBarcode.Locale['ru-RU'] = {
    barcodeValue: 'Текст',
    barcodeType: 'Тип символики',
    textVisibility: 'Отображение текста',
    barcodeRotationLabel: 'Вращение',
    barcodeRotation: {
        rotationNone: 'Нет',
        rotate90degrees: '90',
        rotate180degrees: '180',
        rotate270degrees: '270'
    },
    categoryBasicSettings: 'Основные настройки',
    toolTip: {
        requirements: 'Отображает любой тип штрихкода.',
        description: 'Отображает штрихкоды.',
        title: 'Штрихкод'
    }
};
EJBarcode.Locale['zh-Hans'] = {
    barcodeValue: '文本',
    barcodeType: '符号类型',
    textVisibility: '文本可见性',
    barcodeRotationLabel: '旋转',
    barcodeRotation: {
        rotationNone: '无',
        rotate90degrees: '90',
        rotate180degrees: '180',
        rotate270degrees: '270'
    },
    categoryBasicSettings: '基本设置',
    toolTip: {
        requirements: '显示任何条码类型。',
        description: '显示条码。',
        title: '条码'
    }
};
EJBarcode.Locale['zh-Hant'] = {
    barcodeValue: '文字',
    barcodeType: '符號類型',
    textVisibility: '文字可見性',
    barcodeRotationLabel: '旋轉',
    barcodeRotation: {
        rotationNone: '無',
        rotate90degrees: '90',
        rotate180degrees: '180',
        rotate270degrees: '270'
    },
    categoryBasicSettings: '基本設定',
    toolTip: {
        requirements: '顯示任何條碼類型。',
        description: '顯示條碼。',
        title: '條碼'
    }
};
