var EJQRBarcode = (function () {
    function EJQRBarcode(rptDesigner) {
        this.customJSON = null;
        this.propertyPanel = null;
        this.rootElement = null;
        this.customItemDiv = null;
        this.reportDesigner = null;
        this.loaderDiv = null;
        this.errMsgDiv = null;
        this.reportDesigner = rptDesigner;
        this.propertyPanel = this.reportDesigner.getInstance('PropertyPanel');
    }
    EJQRBarcode.prototype.initializeItem = function (args) {
        args.isBuildInService = true;
        args.defaultHeight = 160;
        args.defaultWidth = 160;
        args.minimumHeight = 15;
        args.minimumWidth = 15;
        args.renderCallback = $.proxy(this.renderData, this);
        args.loadingCallback = $.proxy(this.showIndicator, this);
    };
    EJQRBarcode.prototype.renderItem = function (customJson, target, eventData) {
        if (eventData.eventName === 'begin') {
            this.customJSON = customJson;
            this.rootElement = target;
            this.renderBarcode();
        }
    };
    EJQRBarcode.prototype.renderBarcode = function () {
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
    EJQRBarcode.prototype.onPropertyChange = function (name, oldValue, newValue) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        switch (name) {
            case 'BarcodeType':
                newValue = this.setBarcodeType(newValue);
                this.updatePropertyVal(name, newValue);
                if (!this.reportDesigner.undoManager.isPerformAction) {
                    var baseInstance = this.rootElement.data('CustomItem');
                    var correctionOldVal = this.getPropertyVal('CorrectionLevel');
                    baseInstance.updatePropertyChange(this.getCorrectionId(oldValue), correctionOldVal, null);
                    var correctionId = this.getCorrectionId(newValue);
                    if (correctionId) {
                        var correctionNewVal = this.getCorrectionVal(newValue);
                        baseInstance.updatePropertyChange(this.getCorrectionId(newValue), null, correctionNewVal);
                        this.updatePropertyUIValue(correctionId, correctionNewVal);
                    }
                }
                break;
            case 'BarcodeValue':
                this.updatePropertyVal(name, newValue);
                break;
            case 'DisplayBarcodeText':
                this.updatePropertyVal(name, (newValue === true) ? 'true' : 'false');
                break;
            case 'QrcodeCorrectionLevel':
                newValue = this.getQrErrCorrLevel(newValue);
                this.updatePropertyVal('CorrectionLevel', newValue);
                break;
            case 'Pdf417CorrectionLevel':
                newValue = this.getPdfErrCorrLevel(newValue);
                this.updatePropertyVal('CorrectionLevel', newValue);
                break;
        }
    };
    EJQRBarcode.prototype.updatePropertyUIValue = function (name, value) {
        var customId = this.customJSON.UniqueId;
        switch (name) {
            case 'BarcodeType':
                this.propertyPanel.updatePropertyUIValue('barcodetype', value, customId);
                break;
            case 'BarcodeValue':
                this.propertyPanel.updatePropertyUIValue('barcodevalue', value, customId);
                break;
            case 'DisplayBarcodeText':
                this.propertyPanel.updatePropertyUIValue('displaybarcodetext', value, customId);
                break;
            case 'QrcodeCorrectionLevel':
                this.propertyPanel.updatePropertyUIValue('qrerrcorrlevel', value, customId);
                break;
            case 'Pdf417CorrectionLevel':
                this.propertyPanel.updatePropertyUIValue('pdferrcorrlevel', value, customId);
        }
    };
    EJQRBarcode.prototype.onPositionChanged = function (top, left) {
    };
    EJQRBarcode.prototype.onSizeChanged = function (height, width) {
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
    EJQRBarcode.prototype.getPropertyGridItems = function (baseProperties) {
        var itemProperties = [{
                'CategoryId': 'basicsettings',
                'DisplayName': 'categoryBasicSettings',
                'IsExpand': true,
                'Items': [
                    {
                        'ItemId': 'barcodetype',
                        'Name': 'BarcodeType',
                        'DisplayName': 'BarcodeType',
                        'Value': this.getBarcodeType(this.getPropertyVal('BarcodeType')),
                        'ItemType': 'DropDown',
                        'EnableExpression': false,
                        'DependentItems': [
                            {
                                'EnableItems': ['basicsettings_qrerrcorrlevel'],
                                'DisableItems': ['basicsettings_pdferrcorrlevel'],
                                'Value': ['QR Barcode']
                            },
                            {
                                'EnableItems': ['basicsettings_pdferrcorrlevel'],
                                'DisableItems': ['basicsettings_qrerrcorrlevel'],
                                'Value': ['PDF417']
                            },
                            {
                                'EnableItems': [],
                                'DisableItems': ['basicsettings_qrerrcorrlevel', 'basicsettings_pdferrcorrlevel'],
                                'Value': ['Data Matrix']
                            }
                        ],
                        'ValueList': ['QR Barcode', 'Data Matrix', 'PDF417']
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
                        'EnableExpression': false,
                        'IsVisible': false
                    },
                    {
                        'ItemId': 'qrerrcorrlevel',
                        'Name': 'QrcodeCorrectionLevel',
                        'DisplayName': 'correctionLabel',
                        'Value': this.getQrErrCorrLevel(this.getPropertyVal('CorrectionLevel')),
                        'ParentId': 'basicsettings_barcodetype',
                        'ItemType': 'DropDown',
                        'EnableExpression': false,
                        'ValueList': this.getQrcodeCorrectionLevel()
                    },
                    {
                        'ItemId': 'pdferrcorrlevel',
                        'Name': 'Pdf417CorrectionLevel',
                        'DisplayName': 'correctionLabel',
                        'Value': this.getPdfErrCorrLevel(this.getPropertyVal('CorrectionLevel')),
                        'ParentId': 'basicsettings_barcodetype',
                        'ItemType': 'DropDown',
                        'EnableExpression': false,
                        'ValueList': this.getPDF417CorrectionLevel()
                    }
                ]
            }
        ];
        baseProperties.HeaderText = this.customJSON.Name;
        baseProperties.PropertyType = 'qrbarcode';
        baseProperties.SubType = 'qrbarcode';
        baseProperties.IsEditHeader = true;
        baseProperties.Items = $.merge(itemProperties, baseProperties.Items);
        return baseProperties;
    };
    EJQRBarcode.prototype.getPropertyVal = function (name) {
        if (this.customJSON.CustomProperties && this.customJSON.CustomProperties.length > 0) {
            for (var index = 0; index < this.customJSON.CustomProperties.length; index++) {
                if (this.customJSON.CustomProperties[index].Name === name) {
                    return this.customJSON.CustomProperties[index].Value;
                }
            }
        }
        return null;
    };
    EJQRBarcode.prototype.getPDF417CorrectionLevel = function () {
        return [
            {
                text: 'auto', value: 'Auto'
            },
            {
                text: 'level0', value: 'Level0'
            },
            {
                text: 'level1', value: 'Level1'
            },
            {
                text: 'level2', value: 'Level2'
            },
            {
                text: 'level3', value: 'Level3'
            },
            {
                text: 'level4', value: 'Level4'
            },
            {
                text: 'level5', value: 'Level5'
            },
            {
                text: 'level6', value: 'Level6'
            },
            {
                text: 'level7', value: 'Level7'
            },
            {
                text: 'level8', value: 'Level8'
            }
        ];
    };
    EJQRBarcode.prototype.getQrcodeCorrectionLevel = function () {
        return [
            {
                text: 'low', value: 'Low'
            },
            {
                text: 'medium', value: 'Medium'
            },
            {
                text: 'quartile', value: 'Quartile'
            },
            {
                text: 'high', value: 'High'
            }
        ];
    };
    EJQRBarcode.prototype.getBarcodeType = function (type) {
        switch (type.toLowerCase()) {
            case 'qrbarcode': return 'QR Barcode';
            case 'datamatrix': return 'Data Matrix';
            case 'pdf417': return 'PDF417';
        }
        return type;
    };
    EJQRBarcode.prototype.getQrErrCorrLevel = function (level) {
        var errLvl = level ? level.toLowerCase() : '';
        switch (errLvl) {
            case 'low': return 'Low';
            case 'medium': return 'Medium';
            case 'quartile': return 'Quartile';
            case 'high': return 'High';
        }
        return 'Low';
    };
    EJQRBarcode.prototype.getPdfErrCorrLevel = function (level) {
        var errLvl = level ? level.toLowerCase() : '';
        switch (errLvl) {
            case 'auto': return 'Auto';
            case 'level0': return 'Level0';
            case 'level1': return 'Level1';
            case 'level2': return 'Level2';
            case 'level3': return 'Level3';
            case 'level4': return 'Level4';
            case 'level5': return 'Level5';
            case 'level6': return 'Level6';
            case 'level7': return 'Level7';
            case 'level8': return 'Level8';
        }
        return 'Auto';
    };
    EJQRBarcode.prototype.setBarcodeType = function (type) {
        var barcodeType = type.replace(/\s+/g, '');
        switch (barcodeType.toLowerCase()) {
            case 'qrbarcode': return 'QRBarcode';
            case 'datamatrix': return 'DataMatrix';
            case 'pdf417': return 'PDF417';
        }
        return type;
    };
    EJQRBarcode.prototype.getCorrectionVal = function (type) {
        var barcodeType = type.replace(/\s+/g, '');
        switch (barcodeType.toLowerCase()) {
            case 'qrbarcode': return this.getQrcodeCorrectionLevel()[0].value;
            case 'pdf417': return this.getPDF417CorrectionLevel()[0].value;
        }
        return null;
    };
    EJQRBarcode.prototype.getCorrectionId = function (type) {
        var barcodeType = type.replace(/\s+/g, '');
        switch (barcodeType.toLowerCase()) {
            case 'qrbarcode': return 'QrcodeCorrectionLevel';
            case 'pdf417': return 'Pdf417CorrectionLevel';
        }
        return null;
    };
    EJQRBarcode.prototype.setPropertyVal = function (name, val) {
        if (this.customJSON.CustomProperties === null) {
            this.customJSON.CustomProperties = [];
        }
        this.customJSON.CustomProperties.push(new ej.ReportModel.CustomProperty(name, val));
    };
    EJQRBarcode.prototype.updatePropertyVal = function (propertyName, value) {
        if (this.customJSON.CustomProperties && this.customJSON.CustomProperties.length > 0) {
            for (var index = 0; index < this.customJSON.CustomProperties.length; index++) {
                if (this.customJSON.CustomProperties[index].Name === propertyName) {
                    this.customJSON.CustomProperties[index].Value = value;
                    break;
                }
            }
        }
    };
    EJQRBarcode.prototype.getReportItemJson = function () {
        if (this.customJSON === null) {
            this.customJSON = new ej.ReportModel.CustomReportItem().getModel();
            this.setPropertyVal('BarcodeValue', '00000');
            this.setPropertyVal('BarcodeType', 'QRBarcode');
            this.setPropertyVal('DisplayBarcodeText', 'true');
            this.setPropertyVal('CorrectionLevel', 'Low');
        }
        return this.customJSON;
    };
    EJQRBarcode.prototype.setReportItemJson = function (reportItem) {
        this.customJSON = reportItem;
    };
    EJQRBarcode.prototype.dispose = function () {
    };
    EJQRBarcode.prototype.isDisplayText = function () {
        return (this.getPropertyVal('DisplayBarcodeText').toLowerCase()) === 'true';
    };
    EJQRBarcode.prototype.undoRedoAction = function (args) {
    };
    EJQRBarcode.prototype.getLocale = function (text) {
        var barcodeLocale;
        var defaultLocale = EJQRBarcode.Locale['en-US'];
        if (this.reportDesigner && !ej.isNullOrUndefined(this.reportDesigner.model) &&
            !ej.isNullOrUndefined(EJQRBarcode.Locale[this.reportDesigner.model.locale])) {
            barcodeLocale = EJQRBarcode.Locale[this.reportDesigner.model.locale];
        }
        else {
            barcodeLocale = defaultLocale;
        }
        switch (text.toLowerCase()) {
            case 'barcodetype':
                if (barcodeLocale && barcodeLocale.barcodeType) {
                    return barcodeLocale.barcodeType;
                }
                return defaultLocale.barcodeType;
            case 'barcodevalue':
                if (barcodeLocale && barcodeLocale.barcodeValue) {
                    return barcodeLocale.barcodeValue;
                }
                return defaultLocale.barcodeValue;
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
            case 'correctionlabel':
                if (barcodeLocale && barcodeLocale.correctionLabel) {
                    return barcodeLocale.correctionLabel;
                }
                return defaultLocale.correctionLabel;
            case 'low':
                if (barcodeLocale && barcodeLocale.qrcodeCorrectionLevel.low) {
                    return barcodeLocale.qrcodeCorrectionLevel.low;
                }
                return defaultLocale.qrcodeCorrectionLevel.low;
            case 'medium':
                if (barcodeLocale && barcodeLocale.qrcodeCorrectionLevel.medium) {
                    return barcodeLocale.qrcodeCorrectionLevel.medium;
                }
                return defaultLocale.qrcodeCorrectionLevel.medium;
            case 'quartile':
                if (barcodeLocale && barcodeLocale.qrcodeCorrectionLevel.quartile) {
                    return barcodeLocale.qrcodeCorrectionLevel.quartile;
                }
                return defaultLocale.qrcodeCorrectionLevel.quartile;
            case 'high':
                if (barcodeLocale && barcodeLocale.qrcodeCorrectionLevel.high) {
                    return barcodeLocale.qrcodeCorrectionLevel.high;
                }
                return defaultLocale.qrcodeCorrectionLevel.high;
            case 'level0':
                if (barcodeLocale && barcodeLocale.pdf417CorrectionLevel.level0) {
                    return barcodeLocale.pdf417CorrectionLevel.level0;
                }
                return defaultLocale.pdf417CorrectionLevel.level0;
            case 'level1':
                if (barcodeLocale && barcodeLocale.pdf417CorrectionLevel.level1) {
                    return barcodeLocale.pdf417CorrectionLevel.level1;
                }
                return defaultLocale.pdf417CorrectionLevel.level1;
            case 'level2':
                if (barcodeLocale && barcodeLocale.pdf417CorrectionLevel.level2) {
                    return barcodeLocale.pdf417CorrectionLevel.level2;
                }
                return defaultLocale.pdf417CorrectionLevel.level2;
            case 'level3':
                if (barcodeLocale && barcodeLocale.pdf417CorrectionLevel.level3) {
                    return barcodeLocale.pdf417CorrectionLevel.level3;
                }
                return defaultLocale.pdf417CorrectionLevel.level3;
            case 'level4':
                if (barcodeLocale && barcodeLocale.pdf417CorrectionLevel.level4) {
                    return barcodeLocale.pdf417CorrectionLevel.level4;
                }
                return defaultLocale.pdf417CorrectionLevel.level4;
            case 'level5':
                if (barcodeLocale && barcodeLocale.pdf417CorrectionLevel.level5) {
                    return barcodeLocale.pdf417CorrectionLevel.level5;
                }
                return defaultLocale.pdf417CorrectionLevel.level5;
            case 'level6':
                if (barcodeLocale && barcodeLocale.pdf417CorrectionLevel.level6) {
                    return barcodeLocale.pdf417CorrectionLevel.level6;
                }
                return defaultLocale.pdf417CorrectionLevel.level6;
            case 'level7':
                if (barcodeLocale && barcodeLocale.pdf417CorrectionLevel.level7) {
                    return barcodeLocale.pdf417CorrectionLevel.level7;
                }
                return defaultLocale.pdf417CorrectionLevel.level7;
            case 'level8':
                if (barcodeLocale && barcodeLocale.pdf417CorrectionLevel.level8) {
                    return barcodeLocale.pdf417CorrectionLevel.level8;
                }
                return defaultLocale.pdf417CorrectionLevel.level8;
            case 'auto':
                if (barcodeLocale && barcodeLocale.pdf417CorrectionLevel.auto) {
                    return barcodeLocale.pdf417CorrectionLevel.auto;
                }
                return defaultLocale.pdf417CorrectionLevel.auto;
        }
        return text;
    };
    EJQRBarcode.prototype.renderData = function (args) {
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
    EJQRBarcode.prototype.showIndicator = function (isShow) {
        this.loaderDiv.css('display', isShow ? 'block' : 'none');
    };
    return EJQRBarcode;
}());
EJQRBarcode.Locale = {};
EJQRBarcode.Locale['en-US'] = {
    barcodeType: 'Symbology Type',
    barcodeValue: 'Text',
    textVisibility: 'Text Visibility',
    categoryBasicSettings: 'Basic Settings',
    toolTip: {
        requirements: 'Display any barcode type.',
        description: 'Displays the barcodes.',
        title: 'QRBarcode'
    },
    correctionLabel: 'Correction Level',
    qrcodeCorrectionLevel: {
        low: 'Low',
        medium: 'Medium',
        quartile: 'Quartile',
        high: 'High'
    },
    pdf417CorrectionLevel: {
        auto: 'Auto',
        level0: 'Level0',
        level1: 'Level1',
        level2: 'Level2',
        level3: 'Level3',
        level4: 'Level4',
        level5: 'Level5',
        level6: 'Level6',
        level7: 'Level7',
        level8: 'Level8',
    }
};
EJQRBarcode.Locale['fr-FR'] = {
    barcodeType: 'Type de symbologie',
    barcodeValue: 'Texte',
    textVisibility: 'Visibilite du texte',
    categoryBasicSettings: 'Paramètres de base',
    toolTip: {
        requirements: 'Afficher n\'importe quel type de code à barres.',
        description: 'Affiche les codes barres.',
        title: 'QRBarcode'
    },
    correctionLabel: 'Niveau de correction',
    qrcodeCorrectionLevel: {
        low: 'Faible',
        medium: 'Moyen',
        quartile: 'Quartile',
        high: 'Haut'
    },
    pdf417CorrectionLevel: {
        auto: 'Auto',
        level0: 'Niveau0',
        level1: 'Niveau1',
        level2: 'Niveau2',
        level3: 'Niveau3',
        level4: 'Niveau4',
        level5: 'Niveau5',
        level6: 'Niveau6',
        level7: 'Niveau7',
        level8: 'Niveau8',
    }
};
