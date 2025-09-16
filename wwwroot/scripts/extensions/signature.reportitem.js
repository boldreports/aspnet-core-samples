var EJSignature = (function () {
    function EJSignature(instance) {
        this.customJSON = null;
        this.rootElement = null;
        this.customItemDiv = null;
        this.instance = null;
        this.canvasTag = null;
        this.customItemInstance = null;
        this.instance = instance;
    }
    EJSignature.prototype.initializeItem = function (args) {
        args.isBuildInService = false;
        args.defaultHeight = 120;
        args.defaultWidth = 180;
        args.minimumHeight = 15;
        args.minimumWidth = 90;
    };
    EJSignature.prototype.renderItem = function (customJson, target, eventData) {
        if (eventData.eventName === 'begin') {
            this.customJSON = customJson;
            this.rootElement = target;
            this.customItemInstance = target.data('CustomItem');
            this.renderSignature();
        }
    };
    EJSignature.prototype.renderSignature = function () {
        var bgColor = (this.customJSON && this.customJSON.Style && this.customJSON.Style.BackgroundColor
            && this.customJSON.Style.BackgroundColor !== 'Transparent' && this.customJSON.Style.BackgroundColor !== '#00ffffff')
            ? ej.ReportUtil.convertColorFormat(this.customJSON.Style.BackgroundColor, true) : 'white';
        this.customItemDiv = this.buildElement('div', 'customitem e-rptdesigner-customItem-sign', '', { 'id': this.customJSON.Name + '_customItem' }, { 'background-color': bgColor });
        this.canvasTag = this.buildElement('canvas', '', '', { 'id': this.customJSON.Name + '_customItem_canvas' }, { width: '100%', height: '100%' });
        this.customItemDiv.append(this.canvasTag);
        this.rootElement.append(this.customItemDiv);
        var imgData = this.getPropertyVal('SignatureValue');
        imgData = imgData && imgData.length > 0 ? 'data:image/png;base64,' + imgData : imgData;
        this.setSign(imgData, document.getElementById(this.customJSON.Name + '_customItem_canvas'), bgColor);
    };
    EJSignature.prototype.onPropertyChange = function (name, oldValue, newValue) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        switch (name.toLowerCase()) {
            case 'backgroundcolor':
                var bgColor = (newValue === 'Transparent' || newValue === '#ffffff00') ? 'white' : newValue;
                this.customItemDiv.css('background-color', bgColor);
                this.canvasTag.css('background-color', bgColor);
                break;
        }
    };
    EJSignature.prototype.updatePropertyUIValue = function (name, value) {
        if (this.hasDesignerInstance(this.instance)) {
            switch (name.toLowerCase()) {
                case 'backgroundcolor':
                    this.instance.propertyPanel.updatePropertyUIValue('backgroundcolor', value, this.customJSON.UniqueId);
                    break;
            }
        }
    };
    EJSignature.prototype.onPositionChanged = function (top, left) {
    };
    EJSignature.prototype.onSizeChanged = function (height, width) {
        var imgData = this.getPropertyVal('SignatureValue');
        imgData = imgData && imgData.length > 0 ? 'data:image/png;base64,' + imgData : imgData;
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
        this.setSign(imgData, document.getElementById(this.customJSON.Name + '_customItem_canvas'), (this.customJSON.Style.BackgroundColor === 'Transparent' || this.customJSON.Style.BackgroundColor === '#00ffffff') ? 'white' : ej.ReportUtil.convertColorFormat(this.customJSON.Style.BackgroundColor, true));
    };
    EJSignature.prototype.customAction = function (paramInfo) {
        var imgData = this.getPropertyVal('SignatureValue');
        imgData = imgData && imgData.length > 0 ? 'data:image/png;base64,' + imgData : null;
        var dlgData = {
            callBackFn: $.proxy(this.saveSign, this, false),
            locale: this.instance.model.locale,
            imageData: imgData,
            canvas: null
        };
        if (this.hasDesignerInstance(this.instance)) {
            var dlgInstance = window['SignatureDialog'].Instance;
            dlgInstance.openDialog(this.instance, dlgData);
        }
    };
    EJSignature.prototype.getPropertyGridItems = function (baseProperties) {
        var itemProperties = [{
                'CategoryId': 'basicsettings',
                'DisplayName': 'categoryBasicSettings',
                'IsExpand': true,
                'IsIgnoreCommon': true,
                'Items': [{
                        ItemId: 'signature',
                        Name: 'signature',
                        DisplayName: 'signature',
                        ItemType: 'CustomBtn',
                        IsVisible: true
                    }]
            }];
        baseProperties.HeaderText = this.customJSON.Name;
        baseProperties.PropertyType = 'sign';
        baseProperties.SubType = 'signature';
        baseProperties.IsEditHeader = true;
        baseProperties.Items = $.merge(itemProperties, baseProperties.Items);
        baseProperties.getItemProperty = {
            event: $.proxy(this.customAction, this), eventData: {}
        };
        return baseProperties;
    };
    EJSignature.prototype.setSign = function (imgData, canvas, bgColor) {
        if (canvas) {
            canvas.style.backgroundColor = bgColor;
            if (imgData) {
                var image = new Image();
                image.src = imgData;
                image.onload = $.proxy(this.drawImage, this, image, canvas);
            }
        }
    };
    EJSignature.prototype.drawImage = function (image, canvas) {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    EJSignature.prototype.clearSign = function (canvas) {
        if (canvas && canvas.getContext) {
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };
    EJSignature.prototype.setPropertyVal = function (name, val) {
        if (this.customJSON.CustomProperties === null) {
            this.customJSON.CustomProperties = [];
        }
        this.customJSON.CustomProperties.push(new ej.ReportModel.CustomProperty(name, val));
    };
    EJSignature.prototype.getPropertyVal = function (name) {
        if (this.customJSON && this.customJSON.CustomProperties && this.customJSON.CustomProperties.length > 0) {
            for (var index = 0; index < this.customJSON.CustomProperties.length; index++) {
                if (this.customJSON.CustomProperties[index].Name === name) {
                    return this.customJSON.CustomProperties[index].Value;
                }
            }
        }
        return null;
    };
    EJSignature.prototype.updatePropertyVal = function (propertyName, value) {
        if (this.customJSON && this.customJSON.CustomProperties && this.customJSON.CustomProperties.length > 0) {
            for (var index = 0; index < this.customJSON.CustomProperties.length; index++) {
                if (this.customJSON.CustomProperties[index].Name === propertyName) {
                    this.customJSON.CustomProperties[index].Value = value;
                    break;
                }
            }
        }
    };
    EJSignature.prototype.getReportItemJson = function () {
        if (this.customJSON === null) {
            this.customJSON = new ej.ReportModel.CustomReportItem().getModel();
            this.setPropertyVal('SignatureValue', '');
            this.setPropertyVal('ContentEditable', 'true');
        }
        return this.customJSON;
    };
    EJSignature.prototype.setReportItemJson = function (reportItem) {
        this.customJSON = reportItem;
    };
    EJSignature.prototype.saveSign = function (isUndoRedo, imageDetails) {
        var imgData = imageDetails ? imageDetails.imageData : null;
        var prevVal = this.getPropertyVal('SignatureValue');
        prevVal = prevVal && prevVal.length > 0 ? 'data:image/png;base64,' + prevVal : prevVal;
        if (imgData) {
            var base64String = imgData.replace('data:image/png;base64,', '');
            this.updatePropertyVal('SignatureValue', base64String);
            this.setSign(imgData, document.getElementById(this.customJSON.Name + '_customItem_canvas'), (this.customJSON.Style.BackgroundColor === 'Transparent' || this.customJSON.Style.BackgroundColor === '#00ffffff') ? 'white' : ej.ReportUtil.convertColorFormat(this.customJSON.Style.BackgroundColor, true));
        }
        else {
            this.clearSign(document.getElementById(this.customJSON.Name + '_customItem_canvas'));
            this.updatePropertyVal('SignatureValue', '');
        }
        if (!isUndoRedo) {
            this.customItemInstance.addCustomAction('CommandAction', [{ method: 'saveSign', imageData: prevVal, propertyName: 'signature', undoRedo: false }], [{ method: 'saveSign', imageData: imgData, propertyName: 'signature', undoRedo: true }]);
        }
    };
    EJSignature.prototype.undoRedoAction = function (canvasInfo) {
        if (canvasInfo) {
            if (canvasInfo.propertyName && canvasInfo.propertyName.toLowerCase() === 'signature') {
                ej.ReportUtil.invokeMethod(this, canvasInfo.method, [canvasInfo.undoRedo, { imageData: canvasInfo.imageData }]);
            }
        }
    };
    EJSignature.prototype.hasDesignerInstance = function (instance) {
        return instance && instance.pluginName && instance.pluginName.toLowerCase() === 'boldreportdesigner';
    };
    EJSignature.prototype.hasViewerInstance = function (instance) {
        return instance && instance.pluginName && instance.pluginName.toLowerCase() === 'boldreportviewer';
    };
    EJSignature.prototype.getLocale = function (text) {
        var signatureLocale;
        var defaultLocale = EJSignature.Locale['en-US'];
        if (this.instance && this.hasDesignerInstance(this.instance) && !ej.isNullOrUndefined(this.instance.model) && !ej.isNullOrUndefined(EJSignature.Locale[this.instance.model.locale])) {
            signatureLocale = EJSignature.Locale[this.instance.model.locale];
        }
        switch (text.toLowerCase()) {
            case 'signature':
                if (signatureLocale && signatureLocale.signatureLabel) {
                    return signatureLocale.signatureLabel;
                }
                return defaultLocale.signatureLabel;
            case 'categorybasicsettings':
                if (signatureLocale && signatureLocale.categoryBasicSettings) {
                    return signatureLocale.categoryBasicSettings;
                }
                return defaultLocale.categoryBasicSettings;
            case 'btndisplaytext':
                if (signatureLocale && signatureLocale.btnText) {
                    return signatureLocale.btnText;
                }
                return defaultLocale.btnText;
        }
        return text;
    };
    EJSignature.prototype.buildElement = function (tag, classes, innerHtml, attributes, styles) {
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
    EJSignature.prototype.dispose = function () {
        this.canvasTag = null;
        this.instance = null;
        this.customItemInstance = null;
        this.customItemDiv = null;
        this.customJSON = null;
        this.rootElement = null;
        var signDlgIns = window['SignatureDialog'] ? window['SignatureDialog'].Instance : null;
        if (signDlgIns && signDlgIns.dlgInstance && signDlgIns.dlgInstance.visible) {
            signDlgIns.closeDialog();
        }
    };
    EJSignature.prototype.renderItemPreview = function (criModel, targetDiv, locale) {
        var canvas = this.buildElement('canvas', '', '', {}, { width: '100%', height: '100%' });
        var editIcon = this.buildElement('span', 'e-designer-click e-rptdesigner-sign-editIcon', '', {}, { 'display': 'none' });
        var bgColor = criModel.BackgroundColor;
        var imgData = criModel.ImageUrl;
        var proxy = this;
        var callBackFn = function (imageDetails) {
            proxy.updateSignature(imageDetails, ej.isNullOrUndefined(criModel.ItemName) ? criModel.Name : criModel.ItemName);
            proxy.saveViewerSignature(imageDetails);
        };
        $(targetDiv).append(canvas, editIcon);
        $(targetDiv).bind('mouseenter', $.proxy(this.showEditIcon, this, editIcon));
        $(targetDiv).bind('mouseleave', $.proxy(this.hideEditIcon, this, editIcon));
        imgData = imgData && imgData.length > 0 ? 'data:image/png;base64,' + imgData : imgData;
        bgColor = (bgColor === 'Transparent' || bgColor === '#00ffffff') ? 'white' : bgColor;
        this.setSign(imgData, canvas[0], bgColor);
        canvas.attr('imageString', imgData);
        var dataInfo = {
            callBackfn: callBackFn, locale: locale
        };
        editIcon.bind('click', $.proxy(this.invokeDialog, this, canvas, dataInfo));
    };
    EJSignature.prototype.updateSignature = function (imageDetails, reportItemName) {
        if (this.hasViewerInstance(this.instance) && imageDetails.imageData && imageDetails.imageData.length > 0) {
            (this.instance).doAjaxPost('POST', (this.instance)._actionUrl, JSON.stringify({
                'reportAction': 'UpdateValue',
                'modelType': 'CustomReportItemModel',
                'newValue': { 'imageData': imageDetails.imageData.replace(/^data:image\/png;base64,/, '') },
                'itemName': reportItemName
            }), '_handleCustomItemError');
        }
    };
    EJSignature.prototype.showEditIcon = function (editIcon) {
        editIcon.css('display', 'block');
    };
    EJSignature.prototype.hideEditIcon = function (editIcon) {
        editIcon.css('display', 'none');
    };
    EJSignature.prototype.invokeDialog = function (canvas, dataInfo) {
        var dlgInstance = window['SignatureDialog'].Instance;
        var dlgData = {
            callBackFn: $.proxy(dataInfo.callBackfn, this),
            locale: dataInfo.locale,
            imageData: canvas.attr('imageString'),
            canvas: canvas
        };
        if (this.hasViewerInstance(this.instance) && dlgInstance) {
            dlgInstance.openDialog(this.instance, dlgData);
        }
    };
    EJSignature.prototype.saveViewerSignature = function (imageDetails) {
        var imgData = imageDetails != null ? imageDetails.imageData : null;
        if (imgData) {
            var canvas = imageDetails.canvasElement;
            if (canvas) {
                this.setSign(imgData, canvas[0], imageDetails.bgColor);
                $(canvas).attr('imageString', imgData);
            }
        }
        else {
            this.clearSign(imageDetails.canvasElement);
        }
    };
    return EJSignature;
}());
EJSignature.Locale = {};
EJSignature.Locale['ar-AE'] = {
    btnText: 'رسم',
    categoryBasicSettings: 'الإعدادات الأساسية',
    signatureLabel: 'التوقيع',
    toolTip: {
        requirements: 'عرض أي توقيع إلكتروني للتوقيع.',
        description: 'يُستخدم عنصر التقرير هذا لإضافة توقيع رسومي',
        title: 'التوقيع'
    }
};
EJSignature.Locale['en-US'] = {
    btnText: 'Draw',
    categoryBasicSettings: 'Basic Settings',
    signatureLabel: 'Signature',
    toolTip: {
        requirements: 'Display any electronic signature for signing.',
        description: 'This report item is used to add a graphic signature',
        title: 'Signature'
    }
};
EJSignature.Locale['fr-FR'] = {
    signatureLabel: 'Signature',
    btnText: 'Dessiner',
    categoryBasicSettings: 'Paramètres de base',
    toolTip: {
        requirements: 'Afficher toute signature électronique pour la signature.',
        description: 'Cet élément de rapport est utilisé pour ajouter une signature graphique',
        title: 'Signature'
    }
};
EJSignature.Locale['de-DE'] = {
    signatureLabel: 'Unterschrift',
    btnText: 'ziehen',
    categoryBasicSettings: 'Grundlegende Einstellungen',
    toolTip: {
        requirements: 'Zeigen Sie alle elektronischen Signaturen für die Unterschrift an.',
        description: 'Dieses Element wird verwendet, um eine grafische Unterschrift hinzuzufügen.',
        title: 'Unterschrift'
    }
};
EJSignature.Locale['en-AU'] = {
    btnText: 'Draw',
    categoryBasicSettings: 'Basic Settings',
    signatureLabel: 'Signature',
    toolTip: {
        requirements: 'Display any electronic signature for signing.',
        description: 'This report item is used to add a graphic signature',
        title: 'Signature'
    }
};
EJSignature.Locale['en-CA'] = {
    btnText: 'Draw',
    categoryBasicSettings: 'Basic Settings',
    signatureLabel: 'Signature',
    toolTip: {
        requirements: 'Display any electronic signature for signing.',
        description: 'This report item is used to add a graphic signature',
        title: 'Signature'
    }
};
EJSignature.Locale['es-ES'] = {
    signatureLabel: 'Firma',
    categoryBasicSettings: 'Configuración básica',
    btnText: 'Dibujar',
    toolTip: {
        requirements: 'Mostrar todas las firmas electrónicas para la firma.',
        description: 'Este elemento de informe se utiliza para agregar una firma gráfica.',
        title: 'Firma'
    }
};
EJSignature.Locale['it-IT'] = {
    signatureLabel: 'Firma',
    categoryBasicSettings: 'Impostazioni di base',
    btnText: 'Disegna',
    toolTip: {
        requirements: 'Mostra tutte le firme elettroniche per la firma.',
        description: 'Questo elemento di report viene utilizzato per aggiungere una firma grafica.',
        title: 'Firma'
    }
};
EJSignature.Locale['fr-CA'] = {
    signatureLabel: 'Signature',
    categoryBasicSettings: 'Paramètres de base',
    btnText: 'Dessiner',
    toolTip: {
        requirements: 'Afficher toute signature électronique pour la signature.',
        description: 'Cet élément de rapport est utilisé pour ajouter une signature graphique',
        title: 'Signature'
    }
};
EJSignature.Locale['tr-TR'] = {
    signatureLabel: 'İmza',
    categoryBasicSettings: 'Temel Ayarlar',
    btnText: 'çizmek',
    toolTip: {
        requirements: 'İmza için tüm elektronik imzaları göster.',
        description: 'Bu rapor öğesi grafiksel bir imza eklemek için kullanılır.',
        title: 'İmza'
    }
};
EJSignature.Locale['zh-Hans'] = {
    signatureLabel: '签名',
    categoryBasicSettings: '基本设置',
    btnText: '绘制签名',
    toolTip: {
        requirements: '显示所有电子签名以进行签名。',
        description: '此报表项用于添加图形签名。',
        title: '签名'
    }
};
EJSignature.Locale['he-IL'] = {
    btnText: 'צייר',
    categoryBasicSettings: 'הגדרות בסיסיות',
    signatureLabel: 'חתימה',
    toolTip: {
        requirements: 'הצגת חתימה אלקטרונית לצורך חתימה.',
        description: 'פריט דוח זה משמש להוספת חתימה גרפית',
        title: 'חתימה'
    }
};
EJSignature.Locale['ja-JP'] = {
    btnText: '描画',
    categoryBasicSettings: '基本設定',
    signatureLabel: '署名',
    toolTip: {
        requirements: '署名用の電子署名を表示します。',
        description: 'このレポート項目はグラフィック署名を追加するために使用されます',
        title: '署名'
    }
};
EJSignature.Locale['pt-PT'] = {
    btnText: 'Desenhar',
    categoryBasicSettings: 'Configurações básicas',
    signatureLabel: 'Assinatura',
    toolTip: {
        requirements: 'Exibir qualquer assinatura eletrónica para assinar.',
        description: 'Este item de relatório é usado para adicionar uma assinatura gráfica',
        title: 'Assinatura'
    }
};
EJSignature.Locale['ru-RU'] = {
    btnText: 'Рисовать',
    categoryBasicSettings: 'Основные настройки',
    signatureLabel: 'Подпись',
    toolTip: {
        requirements: 'Показать любую электронную подпись для подписания.',
        description: 'Этот элемент отчета используется для добавления графической подписи',
        title: 'Подпись'
    }
};
EJSignature.Locale['zh-Hant'] = {
    btnText: '繪製',
    categoryBasicSettings: '基本設定',
    signatureLabel: '簽名',
    toolTip: {
        requirements: '顯示任何電子簽名以供簽署。',
        description: '此報告項目用於新增圖形簽名',
        title: '簽名'
    }
};
