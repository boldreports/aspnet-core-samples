var EJPDFSignature = (function () {
    function EJPDFSignature(rptDesigner) {
        this.customJSON = null;
        this.rootElement = null;
        this.customItemDiv = null;
        this.instance = null;
        this.customItemInstance = null;
        this.instance = rptDesigner;
        if (this.hasDesignerInstance(this.instance)) {
            this.designPanel = this.instance.getInstance('DesignPanel');
        }
    }
    EJPDFSignature.prototype.initializeItem = function (args) {
        args.isBuildInService = false;
        args.defaultHeight = 96;
        args.defaultWidth = 192;
        args.minimumHeight = 15;
        args.minimumWidth = 90;
    };
    EJPDFSignature.prototype.renderItem = function (customJson, target, eventData) {
        if (eventData.eventName === 'begin') {
            this.customJSON = customJson;
            this.rootElement = target;
            this.customItemInstance = target.data('CustomItem');
            this.renderPDFSignature();
        }
    };
    EJPDFSignature.prototype.renderPDFSignature = function () {
        this.customItemDiv = this.buildElement('div', 'customitem e-rptdesigner-pdfsign', '', {}, { 'background-color': this.getBackgroundColor() });
        var isSignedName = this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'SignedName'));
        var isContactInfo = this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'ContactInfo'));
        var isReason = this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'Reason'));
        var isDate = this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'Date'));
        var isLocation = this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'Location'));
        var isDataPresent = isSignedName || isContactInfo || isReason || isDate || isLocation;
        var configDiv = this.buildElement('div', 'e-pdfsign-config', '', {}, { 'display': 'flex' });
        var imgDiv = this.buildElement('div', 'e-pdfsign-signImg', '', {}, { 'display': 'flex', 'width': '50%', 'height': '100%' });
        var dataDiv = this.buildElement('div', 'e-pdfsign-dataConfig', '', {}, { 'display': isDataPresent ? 'flex' : 'none' });
        this.appendElement(dataDiv, 'e-pdfsign-signedName', this.getLocale('signednamelabel') + ': ' + this.getLocale('signednamevalue'), isSignedName);
        this.appendElement(dataDiv, 'e-pdfsign-contactInfo', this.getLocale('contactinfolabel') + ': ' + this.getLocale('contactinfovalue'), isContactInfo);
        this.appendElement(dataDiv, 'e-pdfsign-reason', this.getLocale('reasonLabel') + ': ' + this.getLocale('reasonvalue'), isReason);
        this.appendElement(dataDiv, 'e-pdfsign-location', this.getLocale('locationLabel') + ': ' + this.getLocale('locationvalue'), isLocation);
        this.appendElement(dataDiv, 'e-pdfsign-date', this.getLocale('dateLabel') + ': ' + this.getFormattedDate(this.instance.model.locale), isDate);
        this.customItemDiv.append(configDiv);
        configDiv.append(imgDiv, dataDiv);
        this.rootElement.append(this.customItemDiv);
        var base64Prefix = 'data:image/png;base64,';
        var signatureValue = this.getPropertyValue(this.customJSON.CustomProperties, 'SignatureValue');
        if (signatureValue) {
            var signatureData = "" + base64Prefix + signatureValue;
            this.setSign(signatureData, imgDiv);
        }
        else {
            this.clearSign(imgDiv);
        }
    };
    EJPDFSignature.prototype.getBackgroundColor = function () {
        return (this.customJSON && this.customJSON.Style && this.customJSON.Style.BackgroundColor
            && this.customJSON.Style.BackgroundColor !== 'Transparent' && this.customJSON.Style.BackgroundColor !== '#00ffffff')
            ? ej.ReportUtil.convertColorFormat(this.customJSON.Style.BackgroundColor, true) : 'white';
    };
    EJPDFSignature.prototype.getPropertyGridItems = function (baseProperties) {
        var itemProperties = [{
                'CategoryId': 'basicsettings',
                'DisplayName': 'categoryBasicSettings',
                'IsExpand': true,
                'IsIgnoreCommon': true,
                'Items': [
                    {
                        ItemId: 'digitalidfile',
                        Name: 'digitalidfile',
                        DisplayName: 'digitalidfile',
                        Value: this.getPropertyValue(this.customJSON.CustomProperties, 'CertificateFileName'),
                        ItemType: 'FilePicker',
                        FileType: ['.pfx']
                    },
                    {
                        'ItemId': 'signature',
                        'Name': 'signature',
                        'DisplayName': 'signature',
                        'ItemType': 'CustomBtn',
                        'EnableExpression': false,
                        'IsVisible': true
                    },
                    {
                        'ItemId': 'signedname',
                        'Name': 'signedname',
                        'DisplayName': 'prptysignedname',
                        'ItemType': 'Bool',
                        'Value': this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'SignedName')),
                        'EnableExpression': false,
                        'IsVisible': true
                    },
                    {
                        'ItemId': 'contactinfo',
                        'Name': 'contactinfo',
                        'DisplayName': 'prptycontactinfo',
                        'ItemType': 'Bool',
                        'Value': this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'ContactInfo')),
                        'EnableExpression': false,
                        'IsVisible': true
                    }, {
                        'ItemId': 'location',
                        'Name': 'location',
                        'DisplayName': 'prptylocation',
                        'ItemType': 'Bool',
                        'Value': this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'Location')),
                        'EnableExpression': false,
                        'IsVisible': true
                    }, {
                        'ItemId': 'date',
                        'Name': 'date',
                        'DisplayName': 'prptydate',
                        'ItemType': 'Bool',
                        'Value': this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'Date')),
                        'EnableExpression': false,
                        'IsVisible': true
                    }, {
                        'ItemId': 'reasonLabel',
                        'Name': 'reasonLabel',
                        'DisplayName': 'prptyreason',
                        'ItemType': 'Bool',
                        'Value': this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'Reason')),
                        'EnableExpression': false,
                        'DependentItems': [
                            {
                                'DisableItems': ['basicsettings_reasonInput'],
                                'Value': [false]
                            },
                            {
                                'EnableItems': ['basicsettings_reasonInput'],
                                'Value': [true]
                            }
                        ],
                        'IsVisible': true
                    }, {
                        'ItemId': 'reasonInput',
                        'Name': 'reasonInput',
                        'DisplayName': 'prptyReasonInput',
                        'ItemType': 'TextBox',
                        'Value': this.getPropertyValue(this.customJSON.CustomProperties, 'ReasonText'),
                        'ParentId': 'basicsettings_reason',
                        'EnableExpression': false,
                        'IsVisible': true
                    }
                ]
            }];
        baseProperties.HeaderText = this.customJSON.Name;
        baseProperties.PropertyType = 'pdfsign';
        baseProperties.SubType = 'pdfsignature';
        baseProperties.IsEditHeader = true;
        baseProperties.Items = $.merge(itemProperties, baseProperties.Items);
        baseProperties.getItemProperty = {
            event: $.proxy(this.customAction, this), eventData: {}
        };
        return baseProperties;
    };
    EJPDFSignature.prototype.appendElement = function (target, className, text, display) {
        var elementDiv = this.buildElement('div', 'e-pdfsign-label' + ' ' + className, text, {}, { 'display': display ? 'flex' : 'none' });
        target.append(elementDiv);
    };
    EJPDFSignature.prototype.undoRedoAction = function (imgInfo) {
        if (imgInfo) {
            if (imgInfo.propertyName && imgInfo.propertyName.toLowerCase() === 'pdfsignature') {
                ej.ReportUtil.invokeMethod(this, imgInfo.method, [imgInfo.undoRedo, { imageData: imgInfo.imageData }]);
            }
        }
    };
    EJPDFSignature.prototype.onPropertyChange = function (name, oldValue, newValue) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        switch (name.toLowerCase()) {
            case 'signedname':
                this.updateDisplay('e-pdfsign-signedName', newValue, 'SignedName');
                break;
            case 'contactinfo':
                this.updateDisplay('e-pdfsign-contactInfo', newValue, 'ContactInfo');
                break;
            case 'reasonlabel':
                this.updateDisplay('e-pdfsign-reason', newValue, 'Reason');
                break;
            case 'location':
                this.updateDisplay('e-pdfsign-location', newValue, 'Location');
                break;
            case 'reasoninput':
                this.updatePropertyVal('ReasonText', newValue);
                break;
            case 'date':
                this.updateDisplay('e-pdfsign-date', newValue, 'Date');
                break;
            case 'digitalidfile':
                newValue && newValue.name ? this.updatePropertyVal('CertificateFileName', newValue.name) : this.updatePropertyVal('CertificateFileName', '');
                newValue && newValue.id ? this.updatePropertyVal('CertificateFileID', newValue.id) : this.updatePropertyVal('CertificateFileID', '');
                break;
            case 'backgroundcolor':
                var color = (newValue === 'Transparent' || newValue === '#ffffff00') ? 'White' : newValue;
                this.customItemDiv.css('background-color', color);
                break;
        }
    };
    EJPDFSignature.prototype.updatePropertyUIValue = function (name, value) {
        switch (name.toLowerCase()) {
            case 'backgroundcolor':
            case 'reasonlabel':
            case 'reasoninput':
            case 'location':
            case 'date':
            case 'signedname':
            case 'contactinfo':
            case 'digitalidfile':
                this.instance.propertyPanel.updatePropertyUIValue(name, value.toString(), this.customJSON.UniqueId);
                break;
        }
    };
    EJPDFSignature.prototype.onPositionChanged = function (top, left) {
    };
    EJPDFSignature.prototype.onSizeChanged = function (height, width) {
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
    EJPDFSignature.prototype.updateDisplay = function (className, propValue, propertyName) {
        this.updatePropertyVal(propertyName, propValue.toString());
        var elementDiv = this.customItemDiv.find('.' + className);
        var dataConfig = this.customItemDiv.find('.e-pdfsign-dataConfig');
        var imgDiv = this.customItemDiv.find('.e-pdfsign-signImg');
        var isDataPresent = this.isDataConfigured(this.customJSON.CustomProperties);
        elementDiv.css('display', this.booleanValue(propValue) ? 'flex' : 'none');
        dataConfig.css('display', isDataPresent ? 'flex' : 'none');
        imgDiv.css('width', isDataPresent ? '50%' : '100%');
    };
    EJPDFSignature.prototype.isDataConfigured = function (customProperties) {
        var _this = this;
        var properties = ['Reason', 'Location', 'Date', 'ContactInfo', 'SignedName'];
        return properties.some(function (prop) { return _this.booleanValue(_this.getPropertyValue(customProperties, prop)); });
    };
    EJPDFSignature.prototype.customAction = function (paramInfo) {
        var imgData = this.getPropertyValue(this.customJSON.CustomProperties, 'SignatureValue');
        imgData = imgData && imgData.length > 0 ? 'data:image/png;base64,' + imgData : null;
        var dlgData = {
            callBackFn: $.proxy(this.saveSign, this, false),
            locale: this.instance.model.locale,
            imageData: imgData,
            canvas: null,
            isViewerDialog: false
        };
        if (this.hasDesignerInstance(this.instance)) {
            this.invokeDialog(dlgData);
        }
    };
    EJPDFSignature.prototype.saveSign = function (isUndoRedo, imageDetails) {
        var imgData = imageDetails ? imageDetails.imageData : null;
        var imgDiv = this.customItemDiv.find('.e-pdfsign-signImg');
        var prevVal = this.getPropertyValue(this.customJSON.CustomProperties, 'SignatureValue');
        prevVal = prevVal && prevVal.length > 0 ? "data:image/png;base64," + prevVal : prevVal;
        if (imgData) {
            var base64String = imgData.replace('data:image/png;base64,', '');
            this.updatePropertyVal('SignatureValue', base64String);
            this.setSign(imgData, imgDiv);
        }
        else {
            this.clearSign(imgDiv);
            this.updatePropertyVal('SignatureValue', '');
        }
        if (!isUndoRedo) {
            this.customItemInstance.addCustomAction('CommandAction', [{ method: 'saveSign', imageData: prevVal, propertyName: 'pdfsignature', undoRedo: false }], [{ method: 'saveSign', imageData: imgData, propertyName: 'pdfsignature', undoRedo: true }]);
        }
    };
    EJPDFSignature.prototype.setSign = function (imgData, imgDiv) {
        imgDiv.removeClass('e-pdfsign-signImg-bgImg');
        imgDiv.css('background-image', "url(" + imgData + ")");
    };
    EJPDFSignature.prototype.clearSign = function (imgDiv) {
        imgDiv.css('background-image', 'none');
        imgDiv.addClass('e-pdfsign-signImg-bgImg');
    };
    EJPDFSignature.prototype.getFormattedDate = function (locale) {
        var currentDate = new Date();
        var dateOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
        var formattedDate = new Intl.DateTimeFormat(locale, dateOptions).format(currentDate);
        var timeOptions = { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short' };
        var formattedTime = new Intl.DateTimeFormat(locale, timeOptions).format(currentDate);
        return formattedDate + ", " + formattedTime;
    };
    EJPDFSignature.prototype.getReportItemJson = function () {
        if (this.customJSON === null) {
            this.customJSON = new ej.ReportModel.CustomReportItem().getModel();
            this.setPropertyVal('ContentEditable', 'true');
            this.setPropertyVal('Reason', 'true');
            this.setPropertyVal('ReasonText', this.getLocale('reasonTxt'));
            this.setPropertyVal('Location', 'true');
            this.setPropertyVal('Date', 'true');
            this.setPropertyVal('SignatureValue', '');
            this.setPropertyVal('SignedName', 'true');
            this.setPropertyVal('ContactInfo', 'true');
            this.setPropertyVal('CertificateFileName', '');
            this.setPropertyVal('CertificateFileID', '');
        }
        return this.customJSON;
    };
    EJPDFSignature.prototype.setReportItemJson = function (reportItem) {
        this.customJSON = reportItem;
    };
    EJPDFSignature.prototype.setPropertyVal = function (name, val) {
        if (this.customJSON.CustomProperties === null) {
            this.customJSON.CustomProperties = [];
        }
        this.customJSON.CustomProperties.push(new ej.ReportModel.CustomProperty(name, val));
    };
    EJPDFSignature.prototype.updatePropertyVal = function (propertyName, value) {
        if (this.customJSON && this.customJSON.CustomProperties && this.customJSON.CustomProperties.length > 0) {
            for (var index = 0; index < this.customJSON.CustomProperties.length; index++) {
                if (this.customJSON.CustomProperties[index].Name === propertyName) {
                    this.customJSON.CustomProperties[index].Value = value;
                    break;
                }
            }
        }
    };
    EJPDFSignature.prototype.getPropertyValue = function (customProperties, value) {
        for (var index = 0; customProperties && index < customProperties.length; index++) {
            if (customProperties[index].Name === value) {
                return customProperties[index].Value;
            }
        }
        return null;
    };
    EJPDFSignature.prototype.invokeDialog = function (dlgData) {
        var dlgInstance = window['SignatureDialog'].Instance;
        if (dlgInstance) {
            dlgInstance.openDialog(this.instance, dlgData);
        }
    };
    EJPDFSignature.prototype.dispose = function () {
        this.customJSON = null;
        this.rootElement = null;
        this.customItemDiv = null;
        this.instance = null;
        this.customItemInstance = null;
        this.designPanel = null;
        var signDlgIns = window['SignatureDialog'] ? window['SignatureDialog'].Instance : null;
        if (signDlgIns && signDlgIns.dlgInstance && signDlgIns.dlgInstance.visible) {
            signDlgIns.closeDialog();
        }
    };
    EJPDFSignature.prototype.hasDesignerInstance = function (instance) {
        return instance && instance.pluginName && instance.pluginName.toLowerCase() === 'boldreportdesigner';
    };
    EJPDFSignature.prototype.hasViewerInstance = function (instance) {
        return instance && instance.pluginName && instance.pluginName.toLowerCase() === 'boldreportviewer';
    };
    EJPDFSignature.prototype.renderItemPreview = function (criModel, targetDiv, locale) {
        var customProperties = criModel.CustomProperties;
        var isReason = this.booleanValue(this.getPropertyValue(customProperties, 'Reason'));
        var isLocation = this.booleanValue(this.getPropertyValue(customProperties, 'Location'));
        var isDate = this.booleanValue(this.getPropertyValue(customProperties, 'Date'));
        var isContactInfo = this.booleanValue(this.getPropertyValue(customProperties, 'ContactInfo'));
        var isSignedName = this.booleanValue(this.getPropertyValue(customProperties, 'SignedName'));
        var isDataPresent = isSignedName || isContactInfo || isReason || isDate || isLocation;
        var imgData = criModel.ImageUrl;
        var configDiv = this.buildElement('div', 'e-pdfsign-config', '', {}, { 'display': 'flex' });
        var imgDiv = this.buildElement('div', 'e-pdfsign-signImg', '', {}, { 'display': 'flex', 'width': isDataPresent ? '50%' : '100%', 'height': '100%' });
        var editIcon = this.buildElement('span', 'e-designer-click e-rptdesigner-sign-editIcon', '', {}, { 'display': 'none' });
        var base64Prefix = 'data:image/png;base64,';
        var signatureData = "" + base64Prefix + imgData;
        var proxy = this;
        imgDiv.attr('imageString', signatureData);
        var callBackFn = function (imageDetails) {
            proxy.updateSignature(imageDetails, ej.isNullOrUndefined(criModel.ItemName) ? criModel.Name : criModel.ItemName);
            proxy.saveViewerSignature(imageDetails);
        };
        var dlgData = {
            callBackFn: $.proxy(callBackFn, this),
            locale: locale,
            imageData: imgDiv.attr('imageString'),
            canvas: imgDiv,
            isViewerDialog: true
        };
        if (imgData) {
            this.setSign(signatureData, imgDiv);
        }
        else {
            this.clearSign(imgDiv);
        }
        configDiv.bind('mouseenter', $.proxy(this.showEditIcon, this, editIcon, customProperties));
        configDiv.bind('mouseleave', $.proxy(this.hideEditIcon, this, editIcon));
        editIcon.bind('click', $.proxy(this.invokeDialog, this, dlgData));
        configDiv.append(imgDiv, editIcon);
        var dataDiv;
        if (isDataPresent) {
            dataDiv = this.buildElement('div', 'e-pdfsign-dataConfig', '', {}, { 'display': 'flex' });
            if (isSignedName) {
                this.appendElement(dataDiv, 'e-pdfsign-signedName', this.getLocale('signednamelabel') + ': ' + this.getLocale('signednamevalue'), isSignedName);
            }
            if (isContactInfo) {
                this.appendElement(dataDiv, 'e-pdfsign-contactInfo', this.getLocale('contactinfolabel') + ': ' + this.getLocale('contactinfovalue'), isContactInfo);
            }
            if (isReason) {
                this.appendElement(dataDiv, 'e-pdfsign-reason', this.getLocale('reasonlabel') + ': ' + this.getLocale('reasonvalue'), isReason);
            }
            if (isLocation) {
                this.appendElement(dataDiv, 'e-pdfsign-location', this.getLocale('locationlabel') + ': ' + this.getLocale('locationvalue'), isLocation);
            }
            if (isDate) {
                this.appendElement(dataDiv, 'e-pdfsign-date', this.getLocale('datelabel') + ': ' + this.getFormattedDate(this.instance.model.locale), isDate);
            }
            configDiv.append(dataDiv);
        }
        $(targetDiv).append(configDiv);
    };
    EJPDFSignature.prototype.saveViewerSignature = function (imageDetails) {
        var imgData = imageDetails != null ? imageDetails.imageData : null;
        var imgDiv = imageDetails.canvasElement;
        if (imgData && imgDiv) {
            this.setSign(imgData, imgDiv);
            imgDiv.attr('imageString', imgData);
        }
        else if (imgDiv) {
            this.clearSign(imgDiv);
        }
    };
    EJPDFSignature.prototype.updateSignature = function (imageDetails, reportItemName) {
        if (this.hasViewerInstance(this.instance) && imageDetails.imageData && imageDetails.imageData.length > 0) {
            (this.instance).doAjaxPost('POST', (this.instance)._actionUrl, JSON.stringify({
                'reportAction': 'UpdateValue',
                'modelType': 'CustomReportItemModel',
                'newValue': { 'imageData': imageDetails.imageData.replace(/^data:image\/png;base64,/, '') },
                'itemName': reportItemName
            }), '_handleCustomItemError');
        }
    };
    EJPDFSignature.prototype.showEditIcon = function (editIcon) {
        editIcon.css('display', 'block');
    };
    EJPDFSignature.prototype.hideEditIcon = function (editIcon) {
        editIcon.css('display', 'none');
    };
    EJPDFSignature.prototype.getLocale = function (text) {
        var defaultLocale = EJPDFSignature.Locale['en-US'];
        var pdfSignatureLocale;
        if (this.instance && !ej.isNullOrUndefined(this.instance.model) && !ej.isNullOrUndefined(EJPDFSignature.Locale[this.instance.model.locale])) {
            pdfSignatureLocale = EJPDFSignature.Locale[this.instance.model.locale];
        }
        switch (text.toLowerCase()) {
            case 'categorybasicsettings':
                if (pdfSignatureLocale && pdfSignatureLocale.categoryBasicSettings) {
                    return pdfSignatureLocale.categoryBasicSettings;
                }
                return defaultLocale.categoryBasicSettings;
            case 'digitalidfile':
                if (pdfSignatureLocale && pdfSignatureLocale.basicSettingsLabels.digitalIDFile) {
                    return pdfSignatureLocale.basicSettingsLabels.digitalIDFile;
                }
                return defaultLocale.basicSettingsLabels.digitalIDFile;
            case 'prptyreason':
                if (pdfSignatureLocale && pdfSignatureLocale.basicSettingsLabels.reason) {
                    return pdfSignatureLocale.basicSettingsLabels.reason;
                }
                return defaultLocale.basicSettingsLabels.reason;
            case 'prptyreasoninput':
                if (pdfSignatureLocale && pdfSignatureLocale.basicSettingsLabels.reasonLabel) {
                    return pdfSignatureLocale.basicSettingsLabels.reasonLabel;
                }
                return defaultLocale.basicSettingsLabels.reasonLabel;
            case 'prptylocation':
                if (pdfSignatureLocale && pdfSignatureLocale.basicSettingsLabels.location) {
                    return pdfSignatureLocale.basicSettingsLabels.location;
                }
                return defaultLocale.basicSettingsLabels.location;
            case 'prptydate':
                if (pdfSignatureLocale && pdfSignatureLocale.basicSettingsLabels.date) {
                    return pdfSignatureLocale.basicSettingsLabels.date;
                }
                return defaultLocale.basicSettingsLabels.date;
            case 'prptysignedname':
                if (pdfSignatureLocale && pdfSignatureLocale.basicSettingsLabels.signedName) {
                    return pdfSignatureLocale.basicSettingsLabels.signedName;
                }
                return defaultLocale.basicSettingsLabels.signedName;
            case 'prptycontactinfo':
                if (pdfSignatureLocale && pdfSignatureLocale.basicSettingsLabels.contactInfo) {
                    return pdfSignatureLocale.basicSettingsLabels.contactInfo;
                }
                return defaultLocale.basicSettingsLabels.contactInfo;
            case 'reasonvalue':
                if (pdfSignatureLocale && pdfSignatureLocale.designPanelLabels.reason) {
                    return pdfSignatureLocale.designPanelLabels.reason;
                }
                return defaultLocale.designPanelLabels.reason;
            case 'locationvalue':
                if (pdfSignatureLocale && pdfSignatureLocale.designPanelLabels.location) {
                    return pdfSignatureLocale.designPanelLabels.location;
                }
                return defaultLocale.designPanelLabels.location;
            case 'signednamevalue':
                if (pdfSignatureLocale && pdfSignatureLocale.designPanelLabels.signedName) {
                    return pdfSignatureLocale.designPanelLabels.signedName;
                }
                return defaultLocale.designPanelLabels.signedName;
            case 'contactinfovalue':
                if (pdfSignatureLocale && pdfSignatureLocale.designPanelLabels.contactInfo) {
                    return pdfSignatureLocale.designPanelLabels.contactInfo;
                }
                return defaultLocale.designPanelLabels.contactInfo;
            case 'reasonlabel':
                if (pdfSignatureLocale && pdfSignatureLocale.designPanelLabels.reasonLabel) {
                    return pdfSignatureLocale.designPanelLabels.reasonLabel;
                }
                return defaultLocale.designPanelLabels.reasonLabel;
            case 'locationlabel':
                if (pdfSignatureLocale && pdfSignatureLocale.designPanelLabels.locationLabel) {
                    return pdfSignatureLocale.designPanelLabels.locationLabel;
                }
                return defaultLocale.designPanelLabels.locationLabel;
            case 'contactinfolabel':
                if (pdfSignatureLocale && pdfSignatureLocale.designPanelLabels.contactInfoLabel) {
                    return pdfSignatureLocale.designPanelLabels.contactInfoLabel;
                }
                return defaultLocale.designPanelLabels.contactInfoLabel;
            case 'signednamelabel':
                if (pdfSignatureLocale && pdfSignatureLocale.designPanelLabels.signedNameLabel) {
                    return pdfSignatureLocale.designPanelLabels.signedNameLabel;
                }
                return defaultLocale.designPanelLabels.signedNameLabel;
            case 'datelabel':
                if (pdfSignatureLocale && pdfSignatureLocale.designPanelLabels.dateLabel) {
                    return pdfSignatureLocale.designPanelLabels.dateLabel;
                }
                return defaultLocale.designPanelLabels.dateLabel;
            case 'btndisplaytext':
                if (pdfSignatureLocale && pdfSignatureLocale.basicSettingsLabels.btnText) {
                    return pdfSignatureLocale.basicSettingsLabels.btnText;
                }
                return defaultLocale.basicSettingsLabels.btnText;
            case 'signature':
                if (pdfSignatureLocale && pdfSignatureLocale.basicSettingsLabels.signatureLabel) {
                    return pdfSignatureLocale.basicSettingsLabels.signatureLabel;
                }
                return defaultLocale.basicSettingsLabels.signatureLabel;
            case 'reasontxt':
                if (pdfSignatureLocale && pdfSignatureLocale.basicSettingsLabels.reasonTxt) {
                    return pdfSignatureLocale.basicSettingsLabels.reasonTxt;
                }
                return defaultLocale.basicSettingsLabels.reasonTxt;
        }
        return text;
    };
    EJPDFSignature.prototype.buildElement = function (tag, classes, innerHtml, attributes, styles) {
        var tagElement = document.createElement(tag);
        if (classes && classes.length > 0) {
            tagElement.className = '' + classes;
        }
        if (innerHtml) {
            var txtNode = document.createTextNode(innerHtml);
            tagElement.appendChild(txtNode);
        }
        if (attributes) {
            var keys = Object.keys(attributes);
            for (var index = 0; index < keys.length; index++) {
                tagElement.setAttribute(keys[index], attributes[keys[index]]);
            }
        }
        if (styles) {
            var keys = Object.keys(styles);
            for (var index = 0; index < keys.length; index++) {
                tagElement.style[keys[index]] = styles[keys[index]];
            }
        }
        return $(tagElement);
    };
    EJPDFSignature.prototype.booleanValue = function (value) {
        return value && value === true || (typeof value === 'string' && value.toLowerCase() === 'true');
    };
    return EJPDFSignature;
}());
EJPDFSignature.Locale = {};
EJPDFSignature.Locale['en-US'] = {
    categoryBasicSettings: 'Basic Settings',
    basicSettingsLabels: {
        reason: 'Show Reason',
        digitalIDFile: 'Digital ID File',
        reasonLabel: 'Reason',
        location: 'Show Location',
        date: 'Show Current Date',
        signatureLabel: 'Signature',
        btnText: 'Draw',
        contactInfo: 'Show Contact Info',
        signedName: 'Show Signed Name',
        reasonTxt: 'I agree'
    },
    designPanelLabels: {
        reason: 'Your signing reason',
        location: 'Your signing location',
        contactInfo: 'Your contact info',
        signedName: 'Digitally signed by your common name',
        reasonLabel: 'Reason',
        locationLabel: 'Location',
        contactInfoLabel: 'Contact',
        signedNameLabel: 'Name',
        dateLabel: 'Date'
    },
    toolTip: {
        requirements: 'Add a report item to the designer area.',
        description: 'This report item is used to add a PDF signature.',
        title: 'PDF Signature'
    }
};
EJPDFSignature.Locale['en-AU'] = {
    categoryBasicSettings: 'Basic Settings',
    basicSettingsLabels: {
        reason: 'Show Reason',
        digitalIDFile: 'Digital ID File',
        reasonLabel: 'Reason',
        location: 'Show Location',
        date: 'Show Current Date',
        signatureLabel: 'Signature',
        btnText: 'Draw',
        contactInfo: 'Show Contact Info',
        signedName: 'Show Signed Name',
        reasonTxt: 'I agree'
    },
    designPanelLabels: {
        reason: 'Your signed reason',
        location: 'Your signed location',
        contactInfo: 'Your contact Info',
        signedName: 'Your signed Name',
        reasonLabel: 'Reason',
        locationLabel: 'Location',
        contactInfoLabel: 'Contact',
        signedNameLabel: 'Name',
        dateLabel: 'Date'
    },
    toolTip: {
        requirements: 'Add a report item to the designer area.',
        description: 'This report item is used to add a PDF signature.',
        title: 'PDF Signature'
    }
};
EJPDFSignature.Locale['en-CA'] = {
    categoryBasicSettings: 'Basic Settings',
    basicSettingsLabels: {
        reason: 'Show Reason',
        digitalIDFile: 'Digital ID File',
        reasonLabel: 'Reason',
        location: 'Show Location',
        date: 'Show Current Date',
        signatureLabel: 'Signature',
        btnText: 'Draw',
        contactInfo: 'Show Contact Info',
        signedName: 'Show Signed Name',
        reasonTxt: 'I agree'
    },
    designPanelLabels: {
        reason: 'Your signed reason',
        location: 'Your signed location',
        contactInfo: 'Your contact Info',
        signedName: 'Your signed Name',
        reasonLabel: 'Reason',
        locationLabel: 'Location',
        contactInfoLabel: 'Contact',
        signedNameLabel: 'Name',
        dateLabel: 'Date'
    },
    toolTip: {
        requirements: 'Add a report item to the designer area.',
        description: 'This report item is used to add a PDF signature.',
        title: 'PDF Signature'
    }
};
EJPDFSignature.Locale['de-DE'] = {
    categoryBasicSettings: 'Grundeinstellungen',
    basicSettingsLabels: {
        reason: 'Grund anzeigen',
        digitalIDFile: 'Digitale ID-Datei',
        reasonLabel: 'Grund',
        location: 'Ort anzeigen',
        date: 'Aktuelles Datum anzeigen',
        signatureLabel: 'Signatur',
        btnText: 'Zeichnen',
        contactInfo: 'Kontaktinfo anzeigen',
        signedName: 'Unterschriebenen Namen anzeigen',
        reasonTxt: 'Ich stimme zu'
    },
    designPanelLabels: {
        reason: 'Ihr Signiergrund',
        location: 'Ihr Signierort',
        contactInfo: 'Ihre Kontaktinformationen',
        signedName: 'Digital signiert von Ihrem allgemeinen Namen',
        reasonLabel: 'Grund',
        locationLabel: 'Ort',
        contactInfoLabel: 'Kontakt',
        signedNameLabel: 'Name',
        dateLabel: 'Datum'
    },
    toolTip: {
        requirements: 'Fügen Sie ein Berichtselement in den Designerbereich hinzu.',
        description: 'Dieses Berichtselement wird verwendet, um eine PDF-Signatur hinzuzufügen.',
        title: 'PDF-Signatur'
    }
};
EJPDFSignature.Locale['ar-AE'] = {
    categoryBasicSettings: 'الإعدادات الأساسية',
    basicSettingsLabels: {
        reason: 'إظهار السبب',
        digitalIDFile: 'ملف الهوية الرقمية',
        reasonLabel: 'سبب',
        location: 'إظهار الموقع',
        date: 'إظهار التاريخ الحالي',
        signatureLabel: 'التوقيع',
        btnText: 'رسم',
        contactInfo: 'إظهار معلومات الاتصال',
        signedName: 'إظهار الاسم الموقع',
        reasonTxt: 'أنا موافق'
    },
    designPanelLabels: {
        reason: 'سبب توقيعك',
        location: 'موقع توقيعك',
        contactInfo: 'معلومات الاتصال الخاصة بك',
        signedName: 'تم التوقيع رقميًا بواسطة اسمك الشائع',
        reasonLabel: 'السبب',
        locationLabel: 'الموقع',
        contactInfoLabel: 'الاتصال',
        signedNameLabel: 'الاسم',
        dateLabel: 'التاريخ'
    },
    toolTip: {
        requirements: 'أضف عنصر تقرير إلى منطقة المصمم.',
        description: 'يُستخدم عنصر التقرير هذا لإضافة توقيع PDF.',
        title: 'توقيع PDF'
    }
};
EJPDFSignature.Locale['fr-FR'] = {
    categoryBasicSettings: 'Paramètres de base',
    basicSettingsLabels: {
        reason: 'Afficher la raison',
        digitalIDFile: 'Fichier d\'identification numérique',
        reasonLabel: 'Raison',
        location: 'Afficher le lieu',
        date: 'Afficher la date actuelle',
        signatureLabel: 'Signature',
        btnText: 'Dessiner',
        contactInfo: 'Afficher les informations de contact',
        signedName: 'Afficher le nom signé',
        reasonTxt: 'Je suis d\'accord'
    },
    designPanelLabels: {
        reason: 'Votre raison de signature',
        location: 'Votre emplacement de signature',
        contactInfo: 'Vos informations de contact',
        signedName: 'Signé numériquement par votre nom commun',
        reasonLabel: 'Raison',
        locationLabel: 'Emplacement',
        contactInfoLabel: 'Contact',
        signedNameLabel: 'Nom',
        dateLabel: 'Date'
    },
    toolTip: {
        requirements: 'Ajoutez un élément de rapport dans la zone de conception.',
        description: 'Cet élément de rapport est utilisé pour ajouter une signature PDF.',
        title: 'Signature PDF'
    }
};
EJPDFSignature.Locale['fr-CA'] = {
    categoryBasicSettings: 'Paramètres de base',
    basicSettingsLabels: {
        reason: 'Afficher la raison',
        digitalIDFile: 'Fichier d\'identification numérique',
        reasonLabel: 'Raison',
        location: 'Afficher l’emplacement',
        date: 'Afficher la date actuelle',
        signatureLabel: 'Signature',
        btnText: 'Dessiner',
        contactInfo: 'Afficher les informations de contact',
        signedName: 'Afficher le nom signé',
        reasonTxt: 'Je suis d\'accord'
    },
    designPanelLabels: {
        reason: 'Votre raison de signature',
        location: 'Votre emplacement de signature',
        contactInfo: 'Vos informations de contact',
        signedName: 'Signé numériquement par votre nom commun',
        reasonLabel: 'Raison',
        locationLabel: 'Emplacement',
        contactInfoLabel: 'Contact',
        signedNameLabel: 'Nom',
        dateLabel: 'Date'
    },
    toolTip: {
        requirements: 'Ajoutez un élément de rapport à la zone de conception.',
        description: 'Cet élément de rapport est utilisé pour ajouter une signature PDF.',
        title: 'Signature PDF'
    }
};
EJPDFSignature.Locale['it-IT'] = {
    categoryBasicSettings: 'Impostazioni di base',
    basicSettingsLabels: {
        reason: 'Mostra motivo',
        digitalIDFile: 'File dell\'ID digitale',
        reasonLabel: 'Motivo',
        location: 'Mostra posizione',
        date: 'Mostra data corrente',
        signatureLabel: 'Firma',
        btnText: 'Disegna',
        contactInfo: 'Mostra informazioni di contatto',
        signedName: 'Mostra nome firmato',
        reasonTxt: 'Sono d\'accordo'
    },
    designPanelLabels: {
        reason: 'Il motivo della tua firma',
        location: 'La tua posizione di firma',
        contactInfo: 'Le tue informazioni di contatto',
        signedName: 'Firmato digitalmente dal tuo nome comune',
        reasonLabel: 'Motivo',
        locationLabel: 'Posizione',
        contactInfoLabel: 'Contatto',
        signedNameLabel: 'Nome',
        dateLabel: 'Data'
    },
    toolTip: {
        requirements: 'Aggiungi un elemento di report all’area del designer.',
        description: 'Questo elemento di report è utilizzato per aggiungere una firma PDF.',
        title: 'Firma PDF'
    }
};
EJPDFSignature.Locale['es-ES'] = {
    categoryBasicSettings: 'Configuración básica',
    basicSettingsLabels: {
        reason: 'Mostrar motivo',
        digitalIDFile: 'Archivo de identificación digital',
        reasonLabel: 'Motivo',
        location: 'Mostrar ubicación',
        date: 'Mostrar fecha actual',
        signatureLabel: 'Firma',
        btnText: 'Dibujar',
        contactInfo: 'Mostrar información de contacto',
        signedName: 'Mostrar nombre firmado',
        reasonTxt: 'Estoy de acuerdo'
    },
    designPanelLabels: {
        reason: 'Su motivo de firma',
        location: 'Su ubicación de firma',
        contactInfo: 'Su información de contacto',
        signedName: 'Firmado digitalmente por su nombre común',
        reasonLabel: 'Motivo',
        locationLabel: 'Ubicación',
        contactInfoLabel: 'Contacto',
        signedNameLabel: 'Nombre',
        dateLabel: 'Fecha'
    },
    toolTip: {
        requirements: 'Agregue un elemento de informe al área del diseñador.',
        description: 'Este elemento de informe se utiliza para agregar una firma PDF.',
        title: 'Firma PDF'
    }
};
EJPDFSignature.Locale['tr-TR'] = {
    categoryBasicSettings: 'Temel Ayarlar',
    basicSettingsLabels: {
        reason: 'Nedeni Göster',
        digitalIDFile: 'Dijital kimlik dosyası',
        reasonLabel: 'Nedeni',
        location: 'Konumu Göster',
        date: 'Geçerli Tarihi Göster',
        signatureLabel: 'İmza',
        btnText: 'Çiz',
        contactInfo: 'İletişim Bilgilerini Göster',
        signedName: 'İmzalanmış İsmi Göster',
        reasonTxt: 'Kabul ediyorum'
    },
    designPanelLabels: {
        reason: 'İmza nedeniniz',
        location: 'İmza konumunuz',
        contactInfo: 'İletişim bilgileriniz',
        signedName: 'Genel adınızla dijital olarak imzalandı',
        reasonLabel: 'Neden',
        locationLabel: 'Konum',
        contactInfoLabel: 'İletişim',
        signedNameLabel: 'Ad',
        dateLabel: 'Tarih'
    },
    toolTip: {
        requirements: 'Tasarımcı alanına bir rapor öğesi ekleyin.',
        description: 'Bu rapor öğesi, bir PDF imzası eklemek için kullanılır.',
        title: 'PDF İmzası'
    }
};
EJPDFSignature.Locale['zh-Hans'] = {
    categoryBasicSettings: '基本设置',
    basicSettingsLabels: {
        reason: '显示原因',
        digitalIDFile: '数字身份证文件',
        reasonLabel: '原因',
        location: '显示位置',
        date: '显示当前日期',
        signatureLabel: '签名',
        btnText: '绘制',
        contactInfo: '显示联系信息',
        signedName: '显示签名名称',
        reasonTxt: '我同意'
    },
    designPanelLabels: {
        reason: '您的签署原因',
        location: '您的签署位置',
        contactInfo: '您的联系信息',
        signedName: '由您的常用名进行数字签名',
        reasonLabel: '原因',
        locationLabel: '位置',
        contactInfoLabel: '联系方式',
        signedNameLabel: '姓名',
        dateLabel: '日期'
    },
    toolTip: {
        requirements: '将报告项添加到设计区域。',
        description: '此报告项用于添加 PDF 签名。',
        title: 'PDF 签名'
    }
};
EJPDFSignature.Locale['he-IL'] = {
    categoryBasicSettings: 'הגדרות בסיסיות',
    basicSettingsLabels: {
        reason: 'הצג סיבה',
        digitalIDFile: 'קובץ מזהה דיגיטלי',
        reasonLabel: 'לְנַמֵק',
        location: 'הצג מיקום',
        date: 'הצג תאריך נוכחי',
        signatureLabel: 'חתימה',
        btnText: 'צייר',
        contactInfo: 'הצג פרטי קשר',
        signedName: 'הצג שם חתום',
        reasonTxt: 'אני מסכים'
    },
    designPanelLabels: {
        reason: 'סיבת החתימה שלך',
        location: 'מיקום החתימה שלך',
        contactInfo: 'פרטי הקשר שלך',
        signedName: 'נחתם דיגיטלית על ידי שמך הנפוץ',
        reasonLabel: 'סיבה',
        locationLabel: 'מיקום',
        contactInfoLabel: 'פרטי קשר',
        signedNameLabel: 'שם',
        dateLabel: 'תאריך'
    },
    toolTip: {
        requirements: 'הוסף פריט דוח לאזור המעצב.',
        description: 'פריט דוח זה משמש להוספת חתימה על PDF.',
        title: 'חתימה על PDF'
    }
};
EJPDFSignature.Locale['ja-JP'] = {
    categoryBasicSettings: '基本設定',
    basicSettingsLabels: {
        reason: '理由を表示',
        digitalIDFile: 'デジタルIDファイル',
        reasonLabel: '理由',
        location: '場所を表示',
        date: '現在の日付を表示',
        signatureLabel: '署名',
        btnText: '描画',
        contactInfo: '連絡先情報を表示',
        signedName: '署名者名を表示',
        reasonTxt: '同意します'
    },
    designPanelLabels: {
        reason: '署名理由',
        location: '署名場所',
        contactInfo: 'あなたの連絡先情報',
        signedName: 'あなたの一般名でデジタル署名',
        reasonLabel: '理由',
        locationLabel: '場所',
        contactInfoLabel: '連絡先',
        signedNameLabel: '名前',
        dateLabel: '日付'
    },
    toolTip: {
        requirements: 'デザイナー領域にレポート項目を追加します。',
        description: 'このレポート項目はPDF署名を追加するために使用されます。',
        title: 'PDF署名'
    }
};
EJPDFSignature.Locale['pt-PT'] = {
    categoryBasicSettings: 'Configurações básicas',
    basicSettingsLabels: {
        reason: 'Mostrar motivo',
        digitalIDFile: 'Arquivo de identificação digital',
        reasonLabel: 'Motivo',
        location: 'Mostrar localização',
        date: 'Mostrar data atual',
        signatureLabel: 'Assinatura',
        btnText: 'Desenhar',
        contactInfo: 'Mostrar informações de contacto',
        signedName: 'Mostrar nome assinado',
        reasonTxt: 'Concordo'
    },
    designPanelLabels: {
        reason: 'O seu motivo de assinatura',
        location: 'A sua localização de assinatura',
        contactInfo: 'As suas informações de contacto',
        signedName: 'Assinado digitalmente pelo seu nome comum',
        reasonLabel: 'Motivo',
        locationLabel: 'Localização',
        contactInfoLabel: 'Contacto',
        signedNameLabel: 'Nome',
        dateLabel: 'Data'
    },
    toolTip: {
        requirements: 'Adicione um item de relatório à área do designer.',
        description: 'Este item de relatório é usado para adicionar uma assinatura PDF.',
        title: 'Assinatura PDF'
    }
};
EJPDFSignature.Locale['ru-RU'] = {
    categoryBasicSettings: 'Основные настройки',
    basicSettingsLabels: {
        reason: 'Показать причину',
        digitalIDFile: 'Файл цифрового удостоверения личности',
        reasonLabel: 'Причина',
        location: 'Показать местоположение',
        date: 'Показать текущую дату',
        signatureLabel: 'Подпись',
        btnText: 'Рисовать',
        contactInfo: 'Показать контактную информацию',
        signedName: 'Показать имя подписавшего',
        reasonTxt: 'Я согласен'
    },
    designPanelLabels: {
        reason: 'Ваша причина подписи',
        location: 'Ваше место подписи',
        contactInfo: 'Ваша контактная информация',
        signedName: 'Цифровая подпись вашим общим именем',
        reasonLabel: 'Причина',
        locationLabel: 'Местоположение',
        contactInfoLabel: 'Контакт',
        signedNameLabel: 'Имя',
        dateLabel: 'Дата'
    },
    toolTip: {
        requirements: 'Добавьте элемент отчета в область конструктора.',
        description: 'Этот элемент отчета используется для добавления подписи PDF.',
        title: 'PDF-подпись'
    }
};
EJPDFSignature.Locale['zh-Hant'] = {
    categoryBasicSettings: '基本設定',
    basicSettingsLabels: {
        reason: '顯示原因',
        digitalIDFile: '數位身分證文件',
        reasonLabel: '原因',
        location: '顯示位置',
        date: '顯示目前日期',
        signatureLabel: '簽名',
        btnText: '繪製',
        contactInfo: '顯示聯絡資訊',
        signedName: '顯示簽名者姓名',
        reasonTxt: '我同意'
    },
    designPanelLabels: {
        reason: '您的簽署原因',
        location: '您的簽署位置',
        contactInfo: '您的聯絡資訊',
        signedName: '以您的通用名稱進行數位簽名',
        reasonLabel: '原因',
        locationLabel: '位置',
        contactInfoLabel: '聯絡方式',
        signedNameLabel: '姓名',
        dateLabel: '日期'
    },
    toolTip: {
        requirements: '將報告項目新增至設計區域。',
        description: '此報告項目用於新增 PDF 簽名。',
        title: 'PDF 簽名'
    }
};
