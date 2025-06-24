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
        args.defaultHeight = 160;
        args.defaultWidth = 360;
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
        var canDataConfig = this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'DataConfig'));
        var bgColor = this.customJSON.Style.BackgroundColor === 'Transparent' ? 'White' : this.customJSON.Style.BackgroundColor;
        this.customItemDiv = this.buildElement('div', 'customitem e-rptdesigner-pdfsign', '', {}, { 'background-color': canDataConfig ? bgColor : 'Transparent' });
        var isSignedName = this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'SignedName'));
        var isContactInfo = this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'ContactInfo'));
        var isReason = this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'Reason'));
        var isDate = this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'Date'));
        var isLocation = this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'Location'));
        var isDataPresent = isSignedName || isContactInfo || isReason || isDate || isLocation;
        var defaultDiv = this.buildElement('div', 'e-pdfsign-default', this.getLocale('defaulttxt'), {}, { 'display': canDataConfig ? 'none' : 'flex' });
        var configDiv = this.buildElement('div', 'e-pdfsign-config', '', {}, { 'display': canDataConfig ? 'flex' : 'none' });
        var imgDiv = this.buildElement('div', 'e-pdfsign-signImg', '', {}, { 'display': 'flex', 'width': '50%', 'height': '100%' });
        var dataDiv = this.buildElement('div', 'e-pdfsign-dataConfig', '', {}, { 'display': isDataPresent ? 'flex' : 'none' });
        this.appendElement(dataDiv, 'e-pdfsign-signedName', this.getLocale('signednamelabel') + ': ' + this.getLocale('signednamevalue'), isSignedName);
        this.appendElement(dataDiv, 'e-pdfsign-contactInfo', this.getLocale('contactinfolabel') + ': ' + this.getLocale('contactinfovalue'), isContactInfo);
        this.appendElement(dataDiv, 'e-pdfsign-reason', this.getLocale('reasonLabel') + ': ' + this.getLocale('reasonvalue'), isReason);
        this.appendElement(dataDiv, 'e-pdfsign-location', this.getLocale('locationLabel') + ': ' + this.getLocale('locationvalue'), isLocation);
        this.appendElement(dataDiv, 'e-pdfsign-date', this.getLocale('dateLabel') + ': ' + this.getFormattedDate(this.instance.model.locale), isDate);
        this.customItemDiv.append(defaultDiv, configDiv);
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
    EJPDFSignature.prototype.getPropertyGridItems = function (baseProperties) {
        var isDataPresent = this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'DataConfig'));
        var itemProperties = [{
                'CategoryId': 'basicsettings',
                'DisplayName': 'categoryBasicSettings',
                'IsExpand': true,
                'IsIgnoreCommon': true,
                'Items': [
                    {
                        'ItemId': 'showdata',
                        'Name': 'showdata',
                        'DisplayName': 'showdata',
                        'ItemType': 'Bool',
                        'Value': isDataPresent,
                        'EnableExpression': false,
                        'DependentItems': [
                            {
                                'DisableItems': ['basicsettings_reason', 'basicsettings_location', 'basicsettings_date', 'basicsettings_signature', 'basicsettings_signedname', 'basicsettings_contactinfo'],
                                'Value': [false]
                            },
                            {
                                'EnableItems': ['basicsettings_reason', 'basicsettings_location', 'basicsettings_date', 'basicsettings_signature', 'basicsettings_signedname', 'basicsettings_contactinfo'],
                                'Value': [true]
                            }
                        ],
                        IsVisible: true
                    },
                    {
                        'ItemId': 'signature',
                        'Name': 'signature',
                        'DisplayName': 'signature',
                        'ItemType': 'CustomBtn',
                        'EnableExpression': false,
                        'IsVisible': isDataPresent
                    },
                    {
                        'ItemId': 'signedname',
                        'Name': 'signedname',
                        'DisplayName': 'prptysignedname',
                        'ItemType': 'Bool',
                        'Value': this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'SignedName')),
                        'ParentId': 'basicsettings_default',
                        'EnableExpression': false,
                        'IsVisible': isDataPresent
                    },
                    {
                        'ItemId': 'contactinfo',
                        'Name': 'contactinfo',
                        'DisplayName': 'prptycontactinfo',
                        'ItemType': 'Bool',
                        'Value': this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'ContactInfo')),
                        'ParentId': 'basicsettings_default',
                        'EnableExpression': false,
                        'IsVisible': isDataPresent
                    },
                    {
                        'ItemId': 'reason',
                        'Name': 'reason',
                        'DisplayName': 'prptyreason',
                        'ItemType': 'Bool',
                        'Value': this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'Reason')),
                        'ParentId': 'basicsettings_default',
                        'EnableExpression': false,
                        'IsVisible': isDataPresent
                    }, {
                        'ItemId': 'location',
                        'Name': 'location',
                        'DisplayName': 'prptylocation',
                        'ItemType': 'Bool',
                        'Value': this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'Location')),
                        'ParentId': 'basicsettings_default',
                        'EnableExpression': false,
                        'IsVisible': isDataPresent
                    }, {
                        'ItemId': 'date',
                        'Name': 'date',
                        'DisplayName': 'prptydate',
                        'ItemType': 'Bool',
                        'Value': this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'Date')),
                        'ParentId': 'basicsettings_default',
                        'EnableExpression': false,
                        'IsVisible': isDataPresent
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
    EJPDFSignature.prototype.isDataConfigured = function () {
        if (this.hasDesignerInstance(this.instance)) {
            var target = this.designPanel.designArea.find('.e-customitem .e-rptdesigner-pdfsign');
            return target.toArray().some(function (targetElement) {
                var itemJSON = ej.ReportUtil.getReportItem($(targetElement.parentElement)).getReportItemJson();
                var customProperties = itemJSON.CustomProperties || [];
                return customProperties.some(function (_a) {
                    var Name = _a.Name, Value = _a.Value;
                    return Name === 'DataConfig' && Value === 'true';
                });
            });
        }
    };
    EJPDFSignature.prototype.updateDataConfig = function (value) {
        var _this = this;
        var defaultDiv = this.customItemDiv.find('.e-pdfsign-default');
        var configDiv = this.customItemDiv.find('.e-pdfsign-config');
        defaultDiv.css('display', value ? 'none' : 'flex');
        configDiv.css('display', value ? 'flex' : 'none');
        this.updatePropertyVal('DataConfig', value.toString());
        this.customItemDiv.css('background-color', value ? this.customJSON.Style.BackgroundColor === 'Transparent' ? 'white' : this.customJSON.Style.BackgroundColor : 'Transparent');
        if (value && this.hasDesignerInstance(this.instance)) {
            var targets = this.designPanel.designArea.find('.e-customitem .e-rptdesigner-pdfsign');
            targets.toArray().forEach(function (targetElement) {
                var target = $(targetElement.parentElement);
                var itemJSON = ej.ReportUtil.getReportItem(target).getReportItemJson();
                if (itemJSON.Name !== _this.customJSON.Name) {
                    var customProperties = itemJSON.CustomProperties || [];
                    customProperties.some(function (property) {
                        if (property.Name === 'DataConfig' && property.Value === 'true') {
                            property.Value = 'false';
                            target.find('.e-pdfsign-config').css('display', 'none');
                            target.find('.e-pdfsign-default').css('display', 'flex');
                            target.find('.e-rptdesigner-pdfsign').css('background-color', 'Transparent');
                            return true;
                        }
                        return false;
                    });
                }
            });
        }
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
            case 'showdata':
                this.updateDataConfig(newValue);
                break;
            case 'signedname':
                this.updateDisplay('e-pdfsign-signedName', newValue, 'SignedName');
                break;
            case 'contactinfo':
                this.updateDisplay('e-pdfsign-contactInfo', newValue, 'ContactInfo');
                break;
            case 'reason':
                this.updateDisplay('e-pdfsign-reason', newValue, 'Reason');
                break;
            case 'location':
                this.updateDisplay('e-pdfsign-location', newValue, 'Location');
                break;
            case 'date':
                this.updateDisplay('e-pdfsign-date', newValue, 'Date');
                break;
            case 'backgroundcolor':
                var showData = this.booleanValue(this.getPropertyValue(this.customJSON.CustomProperties, 'DataConfig'));
                var color = showData ? newValue === 'Transparent' ? 'White' : newValue : 'Transparent';
                this.customItemDiv.css('background-color', color);
                break;
        }
    };
    EJPDFSignature.prototype.updatePropertyUIValue = function (name, value) {
        switch (name.toLowerCase()) {
            case 'backgroundcolor':
            case 'reason':
            case 'location':
            case 'date':
            case 'showdata':
            case 'signedname':
            case 'contactinfo':
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
    EJPDFSignature.prototype.updateDisplay = function (className, newValue, propertyName) {
        var elementDiv = this.customItemDiv.find('.' + className);
        var dataConfig = this.customItemDiv.find('.e-pdfsign-dataConfig');
        elementDiv.css('display', newValue ? 'flex' : 'none');
        this.updatePropertyVal(propertyName, newValue.toString());
        dataConfig.css('display', this.getDataConfigDisplay(this.customJSON.CustomProperties) ? 'flex' : 'none');
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
    EJPDFSignature.prototype.getDataConfigDisplay = function (customProperties) {
        var _this = this;
        var properties = ['Reason', 'Location', 'Date', 'ContactInfo', 'SignedName'];
        return properties.some(function (prop) { return _this.booleanValue(_this.getPropertyValue(customProperties, prop)); });
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
            this.setPropertyVal('Location', 'true');
            this.setPropertyVal('Date', 'true');
            this.setPropertyVal('SignatureValue', '');
            this.setPropertyVal('SignedName', 'true');
            this.setPropertyVal('ContactInfo', 'true');
            this.setPropertyVal('DataConfig', this.isDataConfigured() ? 'false' : 'true');
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
        if (this.customJSON.CustomProperties && this.customJSON.CustomProperties.length > 0) {
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
    };
    EJPDFSignature.prototype.hasDesignerInstance = function (instance) {
        return instance && instance.pluginName && instance.pluginName.toLowerCase() === 'boldreportdesigner';
    };
    EJPDFSignature.prototype.hasViewerInstance = function (instance) {
        return instance && instance.pluginName && instance.pluginName.toLowerCase() === 'boldreportviewer';
    };
    EJPDFSignature.prototype.renderItemPreview = function (criModel, targetDiv, locale) {
        var customProperties = criModel.CustomProperties;
        var canDataConfig = this.booleanValue(this.getPropertyValue(customProperties, 'DataConfig'));
        if (canDataConfig) {
            var isReason = this.booleanValue(this.getPropertyValue(customProperties, 'Reason'));
            var isLocation = this.booleanValue(this.getPropertyValue(customProperties, 'Location'));
            var isDate = this.booleanValue(this.getPropertyValue(customProperties, 'Date'));
            var isContactInfo = this.booleanValue(this.getPropertyValue(customProperties, 'ContactInfo'));
            var isSignedName = this.booleanValue(this.getPropertyValue(customProperties, 'SignedName'));
            var isDataPresent = isSignedName || isContactInfo || isReason || isDate || isLocation;
            var imgData = criModel.ImageUrl;
            var configDiv = this.buildElement('div', 'e-pdfsign-config', '', {}, { 'display': 'flex' });
            var imgDiv = this.buildElement('div', 'e-pdfsign-signImg', '', {}, { 'display': 'flex', 'width': '50%', 'height': '100%' });
            var editIcon = this.buildElement('span', 'e-designer-click e-rptdesigner-sign-editIcon', '', {}, { 'display': 'none' });
            var base64Prefix = 'data:image/png;base64,';
            var signatureData = "" + base64Prefix + imgData;
            var proxy_1 = this;
            imgDiv.attr('imageString', signatureData);
            var callBackFn = function (imageDetails) {
                proxy_1.updateSignature(imageDetails, ej.isNullOrUndefined(criModel.ItemName) ? criModel.Name : criModel.ItemName);
                proxy_1.saveViewerSignature(imageDetails);
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
            if (isDataPresent) {
                var dataDiv = this.buildElement('div', 'e-pdfsign-dataConfig', '', {}, { 'display': 'flex' });
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
                    this.appendElement(dataDiv, 'e-pdfsign-location', this.getLocale('locationlabel') + ': ' + this.getLocale('designlocation'), isLocation);
                }
                if (isDate) {
                    this.appendElement(dataDiv, 'e-pdfsign-date', this.getLocale('datelabel') + ': ' + this.getFormattedDate(this.instance.model.locale), isDate);
                }
                configDiv.append(dataDiv);
            }
            $(targetDiv).append(configDiv);
        }
        else {
            var defaultDiv = this.buildElement('div', 'e-pdfsign-default', this.getLocale('defaulttxt'), {}, { 'display': 'flex' });
            $(targetDiv).append(defaultDiv);
            $(targetDiv).css({
                'border': 'none',
                'background-color': 'Transparent'
            });
        }
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
            case 'prptyreason':
                if (pdfSignatureLocale && pdfSignatureLocale.basicSettingsLabels.reason) {
                    return pdfSignatureLocale.basicSettingsLabels.reason;
                }
                return defaultLocale.basicSettingsLabels.reason;
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
            case 'showdata':
                if (pdfSignatureLocale && pdfSignatureLocale.basicSettingsLabels.showdata) {
                    return pdfSignatureLocale.basicSettingsLabels.showdata;
                }
                return defaultLocale.basicSettingsLabels.showdata;
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
            case 'defaulttxt':
                if (pdfSignatureLocale && pdfSignatureLocale.designPanelLabels.defaultText) {
                    return pdfSignatureLocale.designPanelLabels.defaultText;
                }
                return defaultLocale.designPanelLabels.defaultText;
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
        location: 'Show Location',
        date: 'Show Current Date',
        signatureLabel: 'Signature',
        btnText: 'Draw',
        showdata: 'Show Data',
        contactInfo: 'Show Contact Info',
        signedName: 'Show Signed Name',
    },
    designPanelLabels: {
        reason: 'Your signing reason',
        location: 'Your signing location',
        defaultText: 'Digital PDF Signature',
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
        location: 'Show Location',
        date: 'Show Current Date',
        signatureLabel: 'Signature',
        btnText: 'Draw',
        showdata: 'Show Data',
        contactInfo: 'Show Contact Info',
        signedName: 'Show Signed Name',
    },
    designPanelLabels: {
        reason: 'Your signed reason',
        location: 'Your signed location',
        defaultText: 'Digital PDF Signature',
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
        location: 'Show Location',
        date: 'Show Current Date',
        signatureLabel: 'Signature',
        btnText: 'Draw',
        showdata: 'Show Data',
        contactInfo: 'Show Contact Info',
        signedName: 'Show Signed Name',
    },
    designPanelLabels: {
        reason: 'Your signed reason',
        location: 'Your signed location',
        defaultText: 'Digital PDF Signature',
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
        location: 'Ort anzeigen',
        date: 'Aktuelles Datum anzeigen',
        signatureLabel: 'Signatur',
        btnText: 'Zeichnen',
        showdata: 'Daten anzeigen',
        contactInfo: 'Kontaktinfo anzeigen',
        signedName: 'Unterschriebenen Namen anzeigen',
    },
    designPanelLabels: {
        reason: 'Ihr Signiergrund',
        location: 'Ihr Signierort',
        defaultText: 'Digitale PDF-Signatur',
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
        location: 'إظهار الموقع',
        date: 'إظهار التاريخ الحالي',
        signatureLabel: 'التوقيع',
        btnText: 'رسم',
        showdata: 'إظهار البيانات',
        contactInfo: 'إظهار معلومات الاتصال',
        signedName: 'إظهار الاسم الموقع',
    },
    designPanelLabels: {
        reason: 'سبب توقيعك',
        location: 'موقع توقيعك',
        defaultText: 'توقيع PDF رقمي',
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
        location: 'Afficher le lieu',
        date: 'Afficher la date actuelle',
        signatureLabel: 'Signature',
        btnText: 'Dessiner',
        showdata: 'Afficher les données',
        contactInfo: 'Afficher les informations de contact',
        signedName: 'Afficher le nom signé',
    },
    designPanelLabels: {
        reason: 'Votre raison de signature',
        location: 'Votre emplacement de signature',
        defaultText: 'Signature numérique PDF',
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
        location: 'Afficher l’emplacement',
        date: 'Afficher la date actuelle',
        signatureLabel: 'Signature',
        btnText: 'Dessiner',
        showdata: 'Afficher les données',
        contactInfo: 'Afficher les informations de contact',
        signedName: 'Afficher le nom signé',
    },
    designPanelLabels: {
        reason: 'Votre raison de signature',
        location: 'Votre emplacement de signature',
        defaultText: 'Signature numérique PDF',
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
        location: 'Mostra posizione',
        date: 'Mostra data corrente',
        signatureLabel: 'Firma',
        btnText: 'Disegna',
        showdata: 'Mostra dati',
        contactInfo: 'Mostra informazioni di contatto',
        signedName: 'Mostra nome firmato',
    },
    designPanelLabels: {
        reason: 'Il motivo della tua firma',
        location: 'La tua posizione di firma',
        defaultText: 'Firma digitale PDF',
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
        location: 'Mostrar ubicación',
        date: 'Mostrar fecha actual',
        signatureLabel: 'Firma',
        btnText: 'Dibujar',
        showdata: 'Mostrar datos',
        contactInfo: 'Mostrar información de contacto',
        signedName: 'Mostrar nombre firmado',
    },
    designPanelLabels: {
        reason: 'Su motivo de firma',
        location: 'Su ubicación de firma',
        defaultText: 'Firma digital en PDF',
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
        location: 'Konumu Göster',
        date: 'Geçerli Tarihi Göster',
        signatureLabel: 'İmza',
        btnText: 'Çiz',
        showdata: 'Veriyi Göster',
        contactInfo: 'İletişim Bilgilerini Göster',
        signedName: 'İmzalanmış İsmi Göster',
    },
    designPanelLabels: {
        reason: 'İmza nedeniniz',
        location: 'İmza konumunuz',
        defaultText: 'Dijital PDF İmzası',
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
EJPDFSignature.Locale['zh-CN'] = {
    categoryBasicSettings: '基本设置',
    basicSettingsLabels: {
        reason: '显示原因',
        location: '显示位置',
        date: '显示当前日期',
        signatureLabel: '签名',
        btnText: '绘制',
        showdata: '显示数据',
        contactInfo: '显示联系信息',
        signedName: '显示签名名称',
    },
    designPanelLabels: {
        reason: '您的签署原因',
        location: '您的签署位置',
        defaultText: '数字 PDF 签名',
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
