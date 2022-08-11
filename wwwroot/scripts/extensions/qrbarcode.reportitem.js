var EJQRBarcode = (function () {
    function EJQRBarcode(rptDesigner) {
        this.customJSON = null;
        this.rootElement = null;
        this.customItemDiv = null;
        this.reportDesigner = null;
        this.loaderDiv = null;
        this.errMsgDiv = null;
        this.reportDesigner = rptDesigner;
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
    EJQRBarcode.prototype.renderItem = function (customJson, target) {
        this.customJSON = customJson;
        this.rootElement = target;
        this.renderBarcode();
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
                break;
            case 'BarcodeValue':
                this.updatePropertyVal(name, newValue);
                break;
            case 'DisplayBarcodeText':
                this.updatePropertyVal(name, (newValue === true) ? 'true' : 'false');
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
    EJQRBarcode.prototype.getPropertyGridItems = function () {
        var propertyItems = {
            'HeaderText': this.customJSON.Name,
            'PropertyType': 'qrbarcode',
            'SubType': 'qrbarcode',
            'IsEditHeader': true,
            'Items': [{
                    'CategoryId': 'basicsettings',
                    'DisplayName': this.getLocale('categoryBasicSettings'),
                    'IsExpand': true,
                    'Items': [
                        {
                            'ItemId': 'barcodetype',
                            'Name': 'BarcodeType',
                            'DisplayName': this.getLocale('BarcodeType'),
                            'Value': this.getBarcodeType(this.getPropertyVal('BarcodeType')),
                            'ItemType': 'DropDown',
                            'EnableExpression': false,
                            'ValueList': ['QR Barcode', 'Data Matrix', 'PDF417']
                        },
                        {
                            'ItemId': 'barcodevalue',
                            'Name': 'BarcodeValue',
                            'DisplayName': this.getLocale('barcodeValue'),
                            'EnableExpression': true,
                            'Value': this.getPropertyVal('BarcodeValue'),
                            'ItemType': 'TextBox'
                        },
                        {
                            'ItemId': 'displaybarcodetext',
                            'Name': 'DisplayBarcodeText',
                            'DisplayName': this.getLocale('displayText'),
                            'Value': this.isDisplayText() ? true : false,
                            'ItemType': 'Bool',
                            'EnableExpression': false,
                            'IsVisible': false
                        }
                    ]
                }
            ]
        };
        return propertyItems;
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
    EJQRBarcode.prototype.getBarcodeType = function (type) {
        switch (type.toLowerCase()) {
            case 'qrbarcode': return 'QR Barcode';
            case 'datamatrix': return 'Data Matrix';
            case 'pdf417': return 'PDF417';
        }
        return type;
    };
    EJQRBarcode.prototype.setBarcodeType = function (type) {
        switch (type.toLowerCase()) {
            case 'qr barcode': return 'QRBarcode';
            case 'data matrix': return 'DataMatrix';
            case 'pdf417': return 'PDF417';
        }
        return type;
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
    }
};
