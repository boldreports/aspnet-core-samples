var SignatureDialog = (function () {
    function SignatureDialog() {
        this.container = null;
        this.footerTag = null;
        this.ejOkbtn = null;
        this.ejCancelbtn = null;
        this.dlgInstance = null;
        this.id = null;
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.strokeColorObj = null;
        this.dropDownObj = null;
        this.canvasElement = null;
        this.locale = 'en-US';
        this.isMouseDown = false;
        this.isCropping = false;
        this.cropStartX = 0;
        this.cropStartY = 0;
        this.isCropEnabled = false;
        this.initialHgt = 273;
        this.initialWdth = 560;
        this.instance = null;
    }
    SignatureDialog.prototype.renderDialog = function () {
        this.container = this.buildElement('div', 'e-reportdesigner-designer-configuration e-userselect', '', {}, { id: this.id + '_signDialog' });
        var bodyRootEle = this.buildElement('div', 'e-signDialog-root-container', '', {}, {});
        var okBtn = this.buildElement('button', '', '', {}, { 'id': this.id + '_signDialog_okBtn', 'type': 'button' });
        var cancelBtn = this.buildElement('button', '', '', {}, { 'id': this.id + '_signDialog_cancelBtn' });
        this.container.append(bodyRootEle);
        $(document.body).append(this.container);
        ejs.popups.createSpinner({
            target: this.container.find('.e-signDialog-browsingDiv')[0],
            cssClass: 'e-spin-overlay'
        });
        this.dlgInstance = new ejs.popups.Dialog({
            allowDragging: true,
            width: 599,
            height: 'auto',
            visible: false,
            isModal: true,
            showCloseIcon: true,
            enableResize: true,
            header: this.getLocale('title'),
            footerTemplate: '<div id="' + this.id + '_signDialog_foot"></div>',
            target: document.body,
            cssClass: 'e-signDialog-size',
            beforeOpen: $.proxy(this.onOpen, this),
            close: $.proxy(this.resetDialogValues, this),
            resizeStop: $.proxy(this.onResizeStop, this)
        });
        this.dlgInstance.appendTo(this.container[0]);
        this.footerTag = $(this.dlgInstance.ftrTemplateContent).find('#' + this.id + '_signDialog_foot');
        this.footerTag.attr('tabindex', '-1');
        this.footerTag.append(okBtn).append(cancelBtn);
        this.ejOkbtn = new ejs.buttons.Button({
            content: this.getLocale('ok'),
            isPrimary: true,
            cssClass: 'e-rptdesigner-dlgbtn e-rptdesigner-btn e-medium '
        });
        this.ejOkbtn.appendTo(okBtn[0]);
        okBtn[0].onclick = $.proxy(this.saveSign, this);
        this.ejCancelbtn = new ejs.buttons.Button({
            content: this.getLocale('cancel'),
            cssClass: ' e-rptdesigner-dlgbtn e-rptdesigner-btn e-medium'
        });
        this.ejCancelbtn.appendTo(cancelBtn[0]);
        cancelBtn[0].onclick = $.proxy(this.closeDialog, this, true);
        $(this.dlgInstance.closeIcon).attr('title', this.getLocale('closeToolTip'));
    };
    SignatureDialog.prototype.openDialog = function (instance, dialogInfo) {
        this.canvasElement = dialogInfo.canvas;
        this.locale = dialogInfo.locale;
        this.callBackfn = dialogInfo.callBackFn;
        this.instance = instance;
        if (this.hasViewerInstance(this.instance)) {
            this.id = this.instance._id;
        }
        else if (this.hasDesignerInstance(this.instance)) {
            this.id = this.instance._id + '_reportviewer';
        }
        this.renderDialog();
        this.renderBody();
        this.wiredEvents();
        this.dlgInstance.show();
        this.setSign(dialogInfo.imageData);
    };
    SignatureDialog.prototype.resetDialogValues = function (args) {
        this.dlgInstance.refreshPosition();
        this.resetValues();
    };
    SignatureDialog.prototype.onOpen = function (args) {
        args.maxHeight = '670px';
        args.element.style.maxWidth = '800px';
    };
    SignatureDialog.prototype.renderBody = function () {
        var bodyRootEle = this.container.find('.e-signDialog-root-container');
        this.renderOptions(bodyRootEle);
        this.renderContent(bodyRootEle);
    };
    SignatureDialog.prototype.renderOptions = function (target) {
        var holderDiv = this.buildElement('div', '', '', { 'display': 'flex', 'gap': '13px', 'justify-content': 'space-between', 'align-items': 'center' }, {});
        var labelDiv = this.buildElement('div', 'e-signDialog-firstRow', '', { width: '100%', 'height': '37px', display: 'flex', 'justify-content': 'space-between', 'gap': '5px', 'align-items': 'center' }, {});
        this.appendStrokeWidth(holderDiv);
        this.appendStrokeColor(holderDiv);
        this.appendCropButton(holderDiv);
        labelDiv.append(holderDiv);
        this.appendClearBtn(labelDiv);
        target.append(labelDiv);
    };
    SignatureDialog.prototype.appendCropButton = function (target) {
        var cropBtn = this.buildElement('div', 'e-signDialog-cropIconDiv e-signDialog-cropIcon-disable', '', {}, { 'title': this.getLocale('crop'), 'aria-label': this.getLocale('arialabelcrop'), 'tabindex': '0', 'role': 'button', 'aria-disabled': 'true' });
        cropBtn.bind('click', $.proxy(this.updateCropState, this));
        target.append(cropBtn);
    };
    SignatureDialog.prototype.appendStrokeColor = function (target) {
        var strokeColorDiv = this.buildElement('div', 'e-signDialog-strokeColorDiv', '', {}, {});
        var strokeColorLabel = this.buildElement('span', 'e-rptdesigner-add-label e-signDialog-text-span', this.getLocale('strokeColor'), {}, { 'id': this.id + '_stroke_color_label', type: 'label', 'title': this.getLocale('strokeColor'), 'aria-label': this.getLocale('strokeColor') });
        var strokeColorTag = this.buildElement('div', 'e-signDialog-strokeColorTag', '', {}, { 'aria-labelledby': this.id + '_stroke_color_label', 'tabindex': '0' });
        var strokeColor = this.buildElement('input', 'e-signDialog-strokeColor', '', null, {});
        this.strokeColorObj = new ejs.inputs.ColorPicker({
            value: '#000000',
            cssClass: 'e-designer-colorpicker',
            mode: 'Palette',
            height: '37px',
            open: $.proxy(this.colorPickerOpen, this),
            onModeSwitch: $.proxy(this.colorPickerModeSwitch, this),
            change: $.proxy(this.onStrokeColorChange, this)
        });
        strokeColorTag.append(strokeColor);
        strokeColorDiv.append(strokeColorLabel, strokeColorTag);
        this.strokeColorObj.appendTo(strokeColor[0]);
        target.append(strokeColorDiv);
    };
    SignatureDialog.prototype.appendStrokeWidth = function (target) {
        var strokeWidth = this.buildElement('div', 'e-signDialog-strokeWidthDiv', '', {}, {});
        var drpdwnLbl = this.buildElement('span', 'e-rptdesigner-add-label e-signDialog-text-span', this.getLocale('strokeWidth'), {}, { 'id': this.id + '_stroke_width_label', type: 'label', 'title': this.getLocale('strokeWidth'), 'aria-label': this.getLocale('strokeWidth') });
        var drpdwnTag = this.buildElement('div', 'e-signDialog-drpDwnTag', '', {}, {});
        var dropDown = this.buildElement('input', 'e-field', '', {}, { type: 'text' });
        this.dropDownObj = new ejs.dropdowns.DropDownList({
            width: '73px',
            dataSource: [1, 2, 3, 4, 5],
            fields: { text: 'text' },
            value: 2,
            enabled: true,
            placeHolder: '2',
            cssClass: 'e-rptdesigner-param-assign e-designer-ejwidgets e-designer-dropdownlist',
            popupHeight: '180px',
            change: $.proxy(this.onLineWidthChange, this),
            htmlAttributes: { 'aria-labelledby': this.id + '_stroke_width_label' }
        });
        drpdwnTag.append(dropDown);
        strokeWidth.append(drpdwnLbl, drpdwnTag);
        this.dropDownObj.appendTo(dropDown[0]);
        target.append(strokeWidth);
    };
    SignatureDialog.prototype.appendClearBtn = function (target) {
        var clearBtn = this.buildElement('div', 'e-rptdesigner-add-btn e-signDialog-btn-clear e-signDialog-text-span', this.getLocale('clear'), {}, { 'title': this.getLocale('clear'), 'aria-label': this.getLocale('arialabelclear'), 'tabindex': '0', 'role': 'button' });
        clearBtn.bind('click', $.proxy(this.clearSignature, this));
        target.append(clearBtn);
    };
    SignatureDialog.prototype.renderContent = function (target) {
        var bodyRootEle = this.container.find('.e-signDialog-root-container');
        var labelDivHgt = this.container.find('.e-signDialog-firstRow').height();
        var gapValue = bodyRootEle.css('gap');
        var remainingHgt = labelDivHgt + parseFloat(gapValue) + 'px';
        var canvasContDiv = this.buildElement('div', 'e-signDialog-border e-signDialog-canvasDiv', '', { 'display': 'flex', 'width': '100%', height: "calc(100% - " + remainingHgt + ")" }, {});
        var cropBox = this.buildElement('div', 'e-signDialog-cropBox crop-disable', '', { 'display': 'none' }, {});
        var canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');
        canvas.id = this.id + '_signDialog_canvas';
        canvas.className = 'e-signDialog-canvas';
        canvas.width = this.initialWdth;
        canvas.height = this.initialHgt;
        canvas.setAttribute('tabindex', '0');
        canvas.setAttribute('aria-label', this.getLocale('arialabelcanvas'));
        context.lineWidth = 2;
        context.strokeStyle = '#000000';
        canvasContDiv.append(canvas, cropBox);
        target.append(canvasContDiv);
    };
    SignatureDialog.prototype.onStrokeColorChange = function (args) {
        var canvas = this.container.find('#' + this.id + '_signDialog_canvas')[0];
        if (canvas) {
            var context = canvas.getContext('2d');
            context.strokeStyle = args.currentValue.hex;
        }
    };
    SignatureDialog.prototype.onLineWidthChange = function (args) {
        var canvas = this.container.find('#' + this.id + '_signDialog_canvas')[0];
        if (canvas) {
            var ctx = canvas.getContext('2d');
            ctx.lineWidth = args.itemData.value;
        }
    };
    SignatureDialog.prototype.setSign = function (imgData) {
        var canvas = this.container.find('#' + this.id + '_signDialog_canvas')[0];
        if (imgData) {
            var image = new Image();
            image.src = imgData;
            image.onload = $.proxy(this.drawImage, this, image, canvas);
        }
    };
    SignatureDialog.prototype.drawImage = function (image, canvas) {
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    };
    SignatureDialog.prototype.onResizeStop = function () {
        var canvas = this.container.find('#' + this.id + '_signDialog_canvas')[0];
        var cropBox = this.container.find('.e-signDialog-cropBox');
        var imgData = canvas.toDataURL('image/png');
        var ctx = canvas.getContext('2d');
        canvas.height = this.container.find('.e-signDialog-canvasDiv')[0].offsetHeight;
        canvas.width = this.container.find('.e-signDialog-canvasDiv')[0].offsetWidth;
        ctx.lineWidth = this.dropDownObj.value;
        ctx.strokeStyle = this.strokeColorObj.value;
        this.setSign(imgData);
        if (cropBox) {
            cropBox.css('display', 'none');
        }
    };
    SignatureDialog.prototype.updateCropState = function () {
        var cropBox = this.container.find('.e-signDialog-cropBox');
        if (cropBox && cropBox.length > 0) {
            if (cropBox.hasClass('crop-disable')) {
                this.enableCropIcon();
            }
            else {
                this.disableCropIcon();
            }
        }
    };
    SignatureDialog.prototype.enableCropIcon = function () {
        var cropBox = this.container.find('.e-signDialog-cropBox');
        var cropDiv = this.container.find('.e-signDialog-cropIconDiv');
        if (cropBox.hasClass('crop-disable')) {
            cropBox.removeClass('crop-disable');
            cropBox.addClass('crop-enable');
            cropDiv.removeClass('e-signDialog-cropIcon-disable');
            cropDiv.attr('aria-disabled', 'false');
            cropDiv.addClass('e-signDialog-cropIcon-enable');
            var canvas = this.container.find('#' + this.id + '_signDialog_canvas')[0];
            if (canvas) {
                this.isCropEnabled = true;
                canvas.style.cursor = 'crosshair';
            }
        }
    };
    SignatureDialog.prototype.disableCropIcon = function () {
        var canvas = this.container.find('#' + this.id + '_signDialog_canvas')[0];
        var cropDiv = this.container.find('.e-signDialog-cropIconDiv');
        var cropBox = this.container.find('.e-signDialog-cropBox');
        if (cropBox.hasClass('crop-enable')) {
            cropBox.removeClass('crop-enable');
            cropBox.addClass('crop-disable');
            cropDiv.addClass('e-signDialog-cropIcon-disable');
            cropDiv.removeClass('e-signDialog-cropIcon-enable');
            cropDiv.attr('aria-disabled', 'true');
        }
        cropBox.css({ width: '0px', height: '0px', display: 'none' });
        canvas.style.cursor = 'default';
        this.isCropEnabled = false;
        this.isCropping = false;
    };
    SignatureDialog.prototype.hasCropBox = function () {
        var cropBox = this.container.find('.e-signDialog-cropBox');
        return cropBox.length > 0 && cropBox.is(':visible');
    };
    SignatureDialog.prototype.cropSelectedRegion = function () {
        var canvas = this.container.find('#' + this.id + '_signDialog_canvas')[0];
        var cropBox = this.container.find('.e-signDialog-cropBox');
        var ctx = canvas.getContext('2d');
        var rect = cropBox[0].getBoundingClientRect();
        var left = rect.left - canvas.getBoundingClientRect().left;
        var top = rect.top - canvas.getBoundingClientRect().top;
        var width = rect.width;
        var height = rect.height;
        var croppedimgData = ctx.getImageData(left, top, width, height);
        var tempCanvas = document.createElement('canvas');
        var croppedCtx = tempCanvas.getContext('2d');
        tempCanvas.width = width;
        tempCanvas.height = height;
        croppedCtx.putImageData(croppedimgData, 0, 0);
        return tempCanvas;
    };
    SignatureDialog.prototype.drawLine = function (x1, y1, x2, y2) {
        var canvas = this.container.find('#' + this.id + '_signDialog_canvas')[0];
        var ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
    };
    SignatureDialog.prototype.onMouseDown = function (e) {
        if (this.isCropEnabled) {
            this.onMouseDownCrop(e);
            return;
        }
        e.preventDefault();
        var canvas = this.container.find('#' + this.id + '_signDialog_canvas')[0];
        var rect = canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
        this.isDrawing = true;
        this.isMouseDown = true;
    };
    SignatureDialog.prototype.onMouseMove = function (e) {
        if (this.isCropEnabled && this.isMouseDown) {
            this.onMouseMoveCrop(e);
            return;
        }
        e.preventDefault();
        if (this.isDrawing && this.isMouseDown) {
            var canvas = this.container.find('#' + this.id + '_signDialog_canvas')[0];
            var rect = canvas.getBoundingClientRect();
            var x = 0;
            var y = 0;
            if (e.touches && e.touches.length > 0) {
                x = e.touches[0].clientX - rect.left;
                y = e.touches[0].clientY - rect.top;
            }
            else {
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
            }
            this.drawLine(this.lastX, this.lastY, x, y);
            this.lastX = x;
            this.lastY = y;
        }
    };
    SignatureDialog.prototype.onMouseUp = function (e) {
        if (this.isCropEnabled) {
            this.onMouseUpCrop(e);
            return;
        }
        e.preventDefault();
        this.isDrawing = false;
        this.isMouseDown = false;
    };
    SignatureDialog.prototype.onMouseLeave = function (e) {
        if (this.isDrawing || this.isCropping) {
            this.isMouseDown = false;
        }
    };
    SignatureDialog.prototype.onMouseEnter = function (e) {
        if (e.buttons === 1) {
            this.isMouseDown = true;
        }
    };
    SignatureDialog.prototype.onMouseDownCrop = function (e) {
        if (this.isCropEnabled) {
            var canvas = this.container.find('#' + this.id + '_signDialog_canvas')[0];
            var cropBox = this.container.find('.e-signDialog-cropBox');
            var rect = canvas.getBoundingClientRect();
            e.preventDefault();
            this.isCropping = true;
            this.isDrawing = false;
            this.isMouseDown = true;
            if (e.touches && e.touches.length > 0) {
                this.cropStartX = (e.touches[0].clientX - rect.left) + canvas.offsetLeft;
                this.cropStartY = (e.touches[0].clientY - rect.top) + canvas.offsetTop;
            }
            else {
                this.cropStartX = (e.clientX - rect.left) + canvas.offsetLeft;
                this.cropStartY = (e.clientY - rect.top) + canvas.offsetTop;
            }
            cropBox.css({
                display: 'block',
                width: '0px',
                height: '0px',
                left: this.cropStartX + "px",
                top: this.cropStartY + "px",
                pointerEvents: 'none'
            });
        }
    };
    SignatureDialog.prototype.onMouseUpCrop = function (e) {
        if (!this.isCropping) {
            return;
        }
        e.preventDefault();
        this.isCropping = false;
        this.isMouseDown = false;
    };
    SignatureDialog.prototype.onMouseMoveCrop = function (e) {
        if (!this.isCropping) {
            return;
        }
        e.preventDefault();
        var canvas = this.container.find('#' + this.id + '_signDialog_canvas')[0];
        var cropBox = this.container.find('.e-signDialog-cropBox');
        var rect = canvas.getBoundingClientRect();
        var currentX = null;
        var currentY = null;
        if (e.touches && e.touches.length > 0) {
            currentX = (e.touches[0].clientX - rect.left) + canvas.offsetLeft;
            currentY = (e.touches[0].clientY - rect.top) + canvas.offsetTop;
        }
        else {
            currentX = (e.clientX - rect.left) + canvas.offsetLeft;
            currentY = (e.clientY - rect.top) + canvas.offsetTop;
        }
        cropBox.css({
            width: Math.abs(currentX - this.cropStartX) + "px",
            height: Math.abs(currentY - this.cropStartY) + "px",
            left: Math.min(this.cropStartX, currentX) + "px",
            top: Math.min(this.cropStartY, currentY) + "px",
            pointerEvents: 'none'
        });
    };
    SignatureDialog.prototype.clearSignature = function () {
        var canvas = this.container.find('#' + this.id + '_signDialog_canvas')[0];
        if (canvas.getContext) {
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        this.disableCropIcon();
    };
    SignatureDialog.prototype.saveSign = function () {
        var canvasContDiv = this.container.find('.e-signDialog-canvasDiv');
        var imgData = null;
        if (canvasContDiv) {
            if (this.hasCropBox()) {
                var tempCanvas = this.cropSelectedRegion();
                imgData = tempCanvas.toDataURL('image/png');
            }
            else {
                var canvas = this.container.find('#' + this.id + '_signDialog_canvas')[0];
                if (canvas) {
                    imgData = canvas.toDataURL('image/png');
                }
            }
        }
        if (this.callBackfn) {
            this.invokeCallBack(this.callBackfn, { imageData: imgData, canvasElement: this.canvasElement });
        }
        this.dlgInstance.hide();
    };
    SignatureDialog.prototype.resetValues = function () {
        this.unwiredEvents();
        if (this.hasViewerInstance(this.instance)) {
            this.instance._destroyEJ2Objects(this.container.find('.e-dlg-content .e-signDialog-root-container'));
        }
        else {
            ej.ReportUtil.destroyEj2Objects(this.container.find('.e-dlg-content .e-signDialog-root-container'));
        }
        this.dlgInstance.destroy();
        $('#' + this.id + '_signDialog').remove();
        this.resetGlobalVbles();
    };
    SignatureDialog.prototype.closeDialog = function () {
        this.dlgInstance.hide();
    };
    SignatureDialog.prototype.updateCulture = function () {
    };
    SignatureDialog.prototype.updateSize = function () {
    };
    SignatureDialog.prototype.wiredEvents = function () {
        var canvas = this.container.find('#' + this.id + '_signDialog_canvas')[0];
        canvas.addEventListener('mousedown', $.proxy(this.onMouseDown, this));
        canvas.addEventListener('mousemove', $.proxy(this.onMouseMove, this));
        canvas.addEventListener('mouseup', $.proxy(this.onMouseUp, this));
        canvas.addEventListener('mouseleave', $.proxy(this.onMouseLeave, this));
        canvas.addEventListener('mouseenter', $.proxy(this.onMouseEnter, this));
        canvas.addEventListener('touchstart', $.proxy(this.onMouseDown, this));
        canvas.addEventListener('touchmove', $.proxy(this.onMouseMove, this));
        canvas.addEventListener('touchend', $.proxy(this.onMouseUp, this));
    };
    SignatureDialog.prototype.unwiredEvents = function () {
        var canvas = this.container.find('#' + this.id + '_signDialog_canvas')[0];
        canvas.removeEventListener('mousedown', $.proxy(this.onMouseDown, this));
        canvas.removeEventListener('mousemove', $.proxy(this.onMouseMove, this));
        canvas.removeEventListener('mouseup', $.proxy(this.onMouseUp, this));
        canvas.removeEventListener('mouseenter', $.proxy(this.onMouseEnter, this));
        canvas.removeEventListener('mouseleave', $.proxy(this.onMouseLeave, this));
        canvas.removeEventListener('touchstart', $.proxy(this.onMouseDown, this));
        canvas.removeEventListener('touchmove', $.proxy(this.onMouseMove, this));
        canvas.removeEventListener('touchend', $.proxy(this.onMouseUp, this));
    };
    SignatureDialog.prototype.getLocale = function (text) {
        var locale;
        var defaultLocale = SignatureDialog.Locale['en-US'];
        if (!ej.isNullOrUndefined(SignatureDialog.Locale[this.locale])) {
            locale = SignatureDialog.Locale[this.locale];
        }
        switch (text.toLowerCase()) {
            case 'title':
                if (locale && locale.title) {
                    return locale.title;
                }
                return defaultLocale.title;
            case 'closetooltip':
                if (locale && locale.closeToolTip) {
                    return locale.closeToolTip;
                }
                return defaultLocale.closeToolTip;
            case 'ok':
                if (locale && locale.ok) {
                    return locale.ok;
                }
                return defaultLocale.ok;
            case 'cancel':
                if (locale && locale.cancel) {
                    return locale.cancel;
                }
                return defaultLocale.cancel;
            case 'clear':
                if (locale && locale.clear) {
                    return locale.clear;
                }
                return defaultLocale.clear;
            case 'strokecolor':
                if (locale && locale.strokeColor) {
                    return locale.strokeColor;
                }
                return defaultLocale.strokeColor;
            case 'strokewidth':
                if (locale && locale.strokeWidth) {
                    return locale.strokeWidth;
                }
                return defaultLocale.strokeWidth;
            case 'crop':
                if (locale && locale.crop) {
                    return locale.crop;
                }
                return defaultLocale.crop;
            case 'arialabelcanvas':
                if (locale && locale.ariaLabelCanvas) {
                    return locale.ariaLabelCanvas;
                }
                return defaultLocale.ariaLabelCanvas;
            case 'arialabelcrop':
                if (locale && locale.ariaLabelCrop) {
                    return locale.ariaLabelCrop;
                }
                return defaultLocale.ariaLabelCrop;
            case 'arialabelclear':
                if (locale && locale.ariaLabelClear) {
                    return locale.ariaLabelClear;
                }
                return defaultLocale.ariaLabelClear;
        }
        return text;
    };
    SignatureDialog.prototype.colorPickerOpen = function (args) {
        if (window.innerHeight <=
            parseFloat(args.element.offsetParent.style.top) +
                args.element.offsetParent.clientHeight) {
            args.element.offsetParent.style.top = '0px';
        }
    };
    SignatureDialog.prototype.colorPickerModeSwitch = function (args) {
        if (window.innerHeight <=
            parseFloat(args.element.offsetParent.style.top) +
                args.element.offsetParent.clientHeight) {
            args.element.offsetParent.style.top = '0px';
        }
    };
    SignatureDialog.prototype.hasDesignerInstance = function (instance) {
        return instance && instance.pluginName && instance.pluginName.toLowerCase() === 'boldreportdesigner';
    };
    SignatureDialog.prototype.hasViewerInstance = function (instance) {
        return instance && instance.pluginName && instance.pluginName.toLowerCase() === 'boldreportviewer';
    };
    SignatureDialog.prototype.invokeCallBack = function (fnction, args) {
        if (fnction) {
            if (typeof fnction === 'function') {
                fnction(args);
            }
            else if (typeof fnction === 'string' && window[fnction]) {
                var callBack = (fnction);
                window[callBack](args);
            }
            else if (typeof fnction === 'string' && this[fnction]) {
                var callBack = (fnction);
                this[callBack](args);
            }
        }
    };
    SignatureDialog.prototype.buildElement = function (tag, classes, innerHtml, styles, attributes) {
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
    SignatureDialog.prototype.dispose = function () {
        if (!ej.isNullOrUndefined(this.container) && this.container.length > 0
            && !ej.isNullOrUndefined(this.dlgInstance)) {
            if (this.hasViewerInstance(this.instance)) {
                this.instance._destroyEJ2Objects(this.container.find('.e-dlg-content .e-signDialog-root-container'));
            }
            else {
                ej.ReportUtil.destroyEj2Objects(this.container.find('.e-dlg-content .e-signDialog-root-container'));
            }
            this.dlgInstance.destroy();
            this.container = null;
            this.canvasElement = null;
            this.instance = null;
            this.isDrawing = false;
            this.resetGlobalVbles();
            $('#' + this.id + '_signDialog').remove();
        }
    };
    SignatureDialog.prototype.resetGlobalVbles = function () {
        this.callBackfn = null;
        this.strokeColorObj = null;
        this.dropDownObj = null;
        this.locale = 'en-US';
        this.isCropping = false;
        this.isCropEnabled = false;
        this.cropStartX = null;
        this.cropStartY = null;
        this.lastX = null;
        this.lastY = null;
        this.isMouseDown = false;
        this.dlgInstance = null;
        this.container = null;
    };
    return SignatureDialog;
}());
SignatureDialog.Locale = {};
SignatureDialog.Instance = new SignatureDialog();
SignatureDialog.Locale['en-US'] = {
    cancel: 'Cancel',
    closeToolTip: 'Close',
    clear: 'Clear',
    ok: 'OK',
    title: 'Signature',
    strokeColor: 'Stroke Color',
    strokeWidth: 'Stroke Width',
    crop: 'Crop',
    ariaLabelCanvas: 'Canvas area to draw your signature',
    ariaLabelCrop: 'Crop the signature',
    ariaLabelClear: 'Clear the signature'
};
SignatureDialog.Locale['ar-AE'] = {
    cancel: 'إلغاء',
    closeToolTip: 'إغلاق',
    clear: 'مسح',
    ok: 'موافق',
    title: 'التوقيع',
    strokeColor: 'لون الخط',
    strokeWidth: 'عرض الخط',
    crop: 'اقتصاص',
    ariaLabelCanvas: 'منطقة اللوحة لرسم توقيعك',
    ariaLabelCrop: 'قص التوقيع',
    ariaLabelClear: 'مسح التوقيع'
};
SignatureDialog.Locale['fr-FR'] = {
    cancel: 'Annuler',
    closeToolTip: 'Fermer',
    ok: 'OK',
    title: 'Signature',
    clear: 'Effacer',
    strokeColor: 'Couleur du trait',
    strokeWidth: 'Épaisseur du trait',
    crop: 'Recadrer',
    ariaLabelCanvas: 'Zone de toile pour dessiner votre signature',
    ariaLabelCrop: 'Rogner la signature',
    ariaLabelClear: 'Effacer la signature'
};
SignatureDialog.Locale['de-DE'] = {
    cancel: 'Abbrechen',
    closeToolTip: 'Schließen',
    ok: 'OK',
    title: 'Unterschrift',
    clear: 'Löschen',
    strokeColor: 'Strichfarbe',
    strokeWidth: 'Strichstärke',
    crop: 'Zuschneiden',
    ariaLabelCanvas: 'Leinwandbereich zum Zeichnen Ihrer Unterschrift',
    ariaLabelCrop: 'Unterschrift zuschneiden',
    ariaLabelClear: 'Unterschrift löschen'
};
SignatureDialog.Locale['en-AU'] = {
    cancel: 'Cancel',
    closeToolTip: 'Close',
    clear: 'Clear',
    ok: 'OK',
    title: 'Signature',
    strokeColor: 'Stroke Color',
    strokeWidth: 'Stroke Width',
    crop: 'Crop',
    ariaLabelCanvas: 'Canvas area to draw your signature',
    ariaLabelCrop: 'Crop the signature',
    ariaLabelClear: 'Clear the signature'
};
SignatureDialog.Locale['en-CA'] = {
    cancel: 'Cancel',
    closeToolTip: 'Close',
    clear: 'Clear',
    ok: 'OK',
    title: 'Signature',
    strokeColor: 'Stroke Color',
    strokeWidth: 'Stroke Width',
    crop: 'Crop',
    ariaLabelCanvas: 'Canvas area to draw your signature',
    ariaLabelCrop: 'Crop the signature',
    ariaLabelClear: 'Clear the signature'
};
SignatureDialog.Locale['it-IT'] = {
    cancel: 'Annulla',
    closeToolTip: 'Chiudi',
    ok: 'OK',
    title: 'Firma',
    clear: 'Cancella',
    strokeColor: 'Colore tratto',
    strokeWidth: 'Spessore tratto',
    crop: 'Ritaglia',
    ariaLabelCanvas: 'Area della tela per disegnare la tua firma',
    ariaLabelCrop: 'Ritaglia la firma',
    ariaLabelClear: 'Cancella la firma'
};
SignatureDialog.Locale['es-ES'] = {
    cancel: 'Cancelar',
    closeToolTip: 'Cerrar',
    ok: 'Aceptar',
    title: 'Firma',
    clear: 'Borrar',
    strokeColor: 'Color del trazo',
    strokeWidth: 'Ancho del trazo',
    crop: 'Recortar',
    ariaLabelCanvas: 'Área de lienzo para dibujar tu firma',
    ariaLabelCrop: 'Recortar la firma',
    ariaLabelClear: 'Borrar la firma'
};
SignatureDialog.Locale['fr-CA'] = {
    cancel: 'Annuler',
    closeToolTip: 'Fermer',
    ok: 'OK',
    title: 'Signature',
    clear: 'Effacer',
    strokeColor: 'Couleur du trait',
    strokeWidth: 'Épaisseur du trait',
    crop: 'Recadrer',
    ariaLabelCanvas: 'Zone de canevas pour dessiner votre signature',
    ariaLabelCrop: 'Recadrer la signature',
    ariaLabelClear: 'Effacer la signature'
};
SignatureDialog.Locale['tr-TR'] = {
    cancel: 'İptal',
    closeToolTip: 'Kapat',
    ok: 'Tamam',
    title: 'İmza',
    clear: 'Temizle',
    strokeColor: 'Çizgi Rengi',
    strokeWidth: 'Çizgi Kalınlığı',
    crop: 'Kırp',
    ariaLabelCanvas: 'İmzanızı çizmek için tuval alanı',
    ariaLabelCrop: 'İmzayı kırp',
    ariaLabelClear: 'İmzayı temizle'
};
SignatureDialog.Locale['zh-CN'] = {
    cancel: '取消',
    closeToolTip: '关闭',
    ok: '确定',
    title: '签名',
    clear: '清除',
    strokeColor: '笔触颜色',
    strokeWidth: '笔触宽度',
    crop: '裁剪',
    ariaLabelCanvas: '签名绘制区域',
    ariaLabelCrop: '裁剪签名',
    ariaLabelClear: '清除签名'
};
