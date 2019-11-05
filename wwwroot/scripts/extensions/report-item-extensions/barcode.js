/**
 * Barcode ReportItem - Designs the Barcode ReportItem and provides the Serialization and Deserialization operation.
 */
var EJBarcode = /** @class */ (function () {
    /**
     * Constructor for creating Barcode reportitem widget.
     */
    function EJBarcode(rptDesigner) {
        // Internal Variables
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
        args.renderCallback = $.proxy(this.renderData, this);
        args.loadingCallback = $.proxy(this.showIndicator, this);
    };
    EJBarcode.prototype.renderItem = function (customJson, target) {
        this.customJSON = customJson;
        this.rootElement = target;
        this.renderBarcode();
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
            'font-family': 'Segoe UI', 'font-size': '13px', 'height': '100%'
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
        }
    };
    EJBarcode.prototype.onPositionChanged = function (top, left) {
        //
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
    EJBarcode.prototype.getPropertyGridItems = function () {
        var propertyItems = {
            'Header': this.customJSON.Name,
            'Type': 'barcode',
            'EditHeader': true,
            'Items': [{
                    'CategoryName': 'Basic Settings',
                    'DisplayName': this.getLocale('categoryBasicSettings'),
                    'Items': [
                        {
                            'name': 'BarcodeType',
                            'displayName': this.getLocale('BarcodeType'),
                            'value': this.getPropertyVal('BarcodeType'),
                            'itemType': 'dropdown',
                            'enableExpression': false,
                            'valueList': {
                                'text': ['Code39', 'Code39Extended', 'Code11', 'Codabar', 'Code93', 'Code128A', 'Code128B', 'Code128C', 'UPCA',
                                    'EAN-13', 'EAN-8', 'Code39 Mod 43', 'Interleaved 2 of 5', 'Standard 2 of 5',
                                    'Code11', 'Pharmacode'],
                                'value': ['Code39', 'Code39Extended', 'Code11', 'Codabar', 'Code93', 'Code128A', 'Code128B',
                                    'Code128C', 'UpcBarcode', 'EAN-13', 'EAN-8', 'Code39 Mod 43', 'Interleaved 2 of 5',
                                    'Standard 2 of 5', 'Code11', 'Pharmacode']
                            }
                        },
                        {
                            'name': 'BarcodeValue',
                            'displayName': this.getLocale('barcodeValue'),
                            'enableExpression': true,
                            'value': this.getPropertyVal('BarcodeValue'),
                            'itemType': 'text'
                        },
                        {
                            'name': 'DisplayBarcodeText',
                            'displayName': this.getLocale('displayText'),
                            'value': this.isDisplayText() ? true : false,
                            'itemType': 'bool',
                            'enableExpression': false
                        }
                    ]
                }
            ]
        };
        return propertyItems;
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
        if (this.customJSON.CustomProperties && this.customJSON.CustomProperties.length > 0) {
            for (var index = 0; index < this.customJSON.CustomProperties.length; index++) {
                if (this.customJSON.CustomProperties[index].Name === propertyName) {
                    this.customJSON.CustomProperties[index].Value = value;
                }
            }
        }
    };
    EJBarcode.prototype.getReportItemJson = function () {
        if (this.customJSON === null) {
            this.customJSON = new ej.ReportModel.CustomReportItem().getModel();
            this.setPropertyVal('BarcodeValue', '00000');
            this.setPropertyVal('BarcodeType', 'Code39');
            this.setPropertyVal('DisplayBarcodeText', 'true');
        }
        return this.customJSON;
    };
    EJBarcode.prototype.setReportItemJson = function (reportItem) {
        this.customJSON = reportItem;
    };
    EJBarcode.prototype.dispose = function () {
        //
    };
    EJBarcode.prototype.isDisplayText = function () {
        return (this.getPropertyVal('DisplayBarcodeText').toLowerCase()) === 'true';
    };
    EJBarcode.prototype.getLocale = function (text) {
        var barcodeLocale;
        /* tslint:disable:no-use-before-declare */
        var defaultLocale = EJBarcode.Locale['en-US'];
        if (this.reportDesigner && !ej.isNullOrUndefined(this.reportDesigner.model) &&
            !ej.isNullOrUndefined(EJBarcode.Locale[this.reportDesigner.model.locale])) {
            barcodeLocale = EJBarcode.Locale[this.reportDesigner.model.locale];
        }
        else {
            barcodeLocale = defaultLocale;
        }
        /* tslint:enable:no-use-before-declare */
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
                'background-size': 'auto 100%',
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
//tslint:disable:variable-name no-use-before-declare
EJBarcode.Locale = {};
//tslint:enable:variable-name no-use-before-declare
EJBarcode.Locale['en-US'] = {
    barcodeValue: 'Text',
    barcodeType: 'Symbology Type',
    textVisibility: 'Text Visibility',
    categoryBasicSettings: 'Basic Settings',
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
    categoryBasicSettings: 'Paramètres de base',
    toolTip: {
        requirements: 'Afficher n\'importe quel type de code à barres.',
        description: 'Affiche les codes barres.',
        title: 'code à barre'
    }
};
//# sourceMappingURL=barcode.reportitem.js.map