var EJShape = (function () {
    function EJShape(instance) {
        this.customJSON = null;
        this.rootElement = null;
        this.customItemDiv = null;
        this.instance = null;
        this.instance = instance;
    }
    EJShape.prototype.initializeItem = function (args) {
        args.isBuildInService = false;
        args.defaultHeight = 150;
        args.defaultWidth = 150;
        args.minimumHeight = 15;
        args.minimumWidth = 15;
    };
    EJShape.prototype.renderItem = function (customJson, target, eventData) {
        if (eventData.eventName === 'begin') {
            this.customJSON = customJson;
            this.rootElement = target;
            this.initializeShape(eventData.isTablixCell);
        }
        else if (eventData.eventName === 'complete') {
            this.updateStyle(customJson.Style, eventData.isTablixCell);
        }
    };
    EJShape.prototype.initializeShape = function (isTablixCell) {
        var bgColor = (this.customJSON && this.customJSON.Style && this.customJSON.Style.BackgroundColor)
            ? ej.ReportUtil.convertColorFormat(this.customJSON.Style.BackgroundColor, true) : 'Transparent';
        this.customItemDiv = ej.buildTag('div.customitem e-rptdesigner-shape', '', {
            'width': '100%', 'height': '100%', 'box-sizing': 'border-box', '-moz-box-sizing': 'border-box', 'background-color': bgColor,
            'border': isTablixCell ? '1px dotted gray' : '1px none gray',
        }, {
            'id': this.customJSON.Name + '_customItem'
        });
        this.rootElement.append(this.customItemDiv);
        this.renderShape(this.customItemDiv, this.customJSON);
    };
    EJShape.prototype.renderShape = function (target, customJson) {
        var shapeInfo = this.getShapeInfo(customJson);
        switch (shapeInfo.shapeType.toLowerCase()) {
            case 'rectangle':
                this.renderRectangle(target, shapeInfo);
                break;
            case 'hexagon':
            case 'pentagon':
            case 'octagon':
                this.renderPolygon(target, shapeInfo);
                break;
            case 'triangle':
            case 'rightangletriangle':
                this.renderTriangle(target, shapeInfo);
                break;
            case 'star':
                this.renderStar(target, shapeInfo);
                break;
            case 'leftarrow':
            case 'rightarrow':
            case 'uparrow':
            case 'downarrow':
                this.renderArrow(target, shapeInfo);
                break;
            case 'ellipse':
                this.renderEllipse(target, shapeInfo);
                break;
        }
    };
    EJShape.prototype.getShapeInfo = function (customJson) {
        var svgHeight = this.getSvgHeight(customJson);
        var svgWidth = this.getSvgWidth(customJson);
        var shapeType = this.getPropertyVal('ShapeType', customJson);
        var angle = this.getPropertyVal('RotationAngle', customJson);
        var fillColor = this.getPropertyVal('FillColor', customJson);
        var strokeColor = this.getPropertyVal('LineColor', customJson);
        var strokeStyle = this.getPropertyVal('LineStyle', customJson);
        var strokeWidth = this.getPropertyVal('LineWidth', customJson);
        var starCount = this.getPropertyVal('StarCount', customJson);
        var starConcavity = this.getPropertyVal('Concavity', customJson);
        var arrowWidth = this.getPropertyVal('ArrowWidth', customJson);
        var arrowHeight = this.getPropertyVal('ArrowHeight', customJson);
        return {
            shapeType: shapeType ? shapeType : 'Ellipse', svgHeight: svgHeight, svgWidth: svgWidth, angle: angle ? angle : '0',
            fillColor: fillColor ? fillColor : 'Transparent', strokeWidth: strokeWidth ? strokeWidth : '1',
            strokeColor: strokeColor ? strokeColor : 'Black', strokeStyle: strokeStyle ? strokeStyle : 'Solid',
            arrowWidth: arrowWidth ? arrowWidth : '50', arrowHeight: arrowHeight ? arrowHeight : '50',
            starCount: starCount ? starCount : '5', starConcavity: starConcavity ? starConcavity : '0.5'
        };
    };
    EJShape.prototype.renderEllipse = function (target, shapeInfo) {
        var rx = shapeInfo.svgWidth / 2;
        var ry = shapeInfo.svgHeight / 2;
        shapeInfo.angle = parseFloat(shapeInfo.angle) % 360;
        var angleRad = (shapeInfo.angle * Math.PI) / 180;
        var sinValue = Math.sin(angleRad);
        var cosValue = Math.cos(angleRad);
        var rotatedWidth = Math.abs(shapeInfo.svgWidth * cosValue) + Math.abs(shapeInfo.svgHeight * sinValue);
        var rotatedHeight = Math.abs(shapeInfo.svgWidth * sinValue) + Math.abs(shapeInfo.svgHeight * cosValue);
        var ellipsePoints = [
            { x: -rx, y: 0 },
            { x: 0, y: -ry },
            { x: rx, y: 0 },
            { x: 0, y: ry }
        ];
        var rotatedEllipsePoints = ellipsePoints.map(function (point) { return ({
            x: point.x * cosValue - point.y * sinValue,
            y: point.x * sinValue + point.y * cosValue
        }); });
        var pathData = " M " + rotatedEllipsePoints[0].x + " " + rotatedEllipsePoints[0].y + "\n                                A " + rx + " " + ry + " " + shapeInfo.angle + " 0 1 " + rotatedEllipsePoints[2].x + " " + rotatedEllipsePoints[2].y + "\n                                A " + rx + " " + ry + " " + shapeInfo.angle + " 0 1 " + rotatedEllipsePoints[0].x + " " + rotatedEllipsePoints[0].y + "\n                                Z";
        var viewBox = -rotatedWidth / 2 + " " + -rotatedHeight / 2 + " " + rotatedWidth + " " + rotatedHeight;
        this.renderSvg(target, pathData, viewBox, shapeInfo);
    };
    EJShape.prototype.renderRectangle = function (target, shapeInfo) {
        var halfWidth = shapeInfo.svgWidth / 2;
        var halfHeight = shapeInfo.svgHeight / 2;
        var angleRad = (parseFloat(shapeInfo.angle) % 360 * Math.PI) / 180;
        var sinValue = Math.sin(angleRad);
        var cosValue = Math.cos(angleRad);
        var corners = [
            { x: -halfWidth, y: -halfHeight },
            { x: halfWidth, y: -halfHeight },
            { x: halfWidth, y: halfHeight },
            { x: -halfWidth, y: halfHeight }
        ];
        var rotatedPoints = corners.map(function (corner) { return ({
            x: corner.x * cosValue - corner.y * sinValue,
            y: corner.x * sinValue + corner.y * cosValue
        }); });
        var pathData = this.getPathData(rotatedPoints);
        var viewBox = this.getViewBox(rotatedPoints);
        this.renderSvg(target, pathData, viewBox, shapeInfo);
    };
    EJShape.prototype.renderTriangle = function (target, shapeInfo) {
        var halfWidth = shapeInfo.svgWidth / 2;
        var halfHeight = shapeInfo.svgHeight / 2;
        var angleRad = (parseFloat(shapeInfo.angle) % 360 * Math.PI) / 180;
        var sinValue = Math.sin(angleRad);
        var cosValue = Math.cos(angleRad);
        var points = [];
        var shapeType = shapeInfo.shapeType.toLowerCase();
        if (shapeType === 'triangle') {
            points = [
                { x: -halfWidth, y: halfHeight },
                { x: halfWidth, y: halfHeight },
                { x: 0, y: -halfHeight }
            ];
        }
        else if (shapeType === 'rightangletriangle') {
            points = [
                { x: -halfWidth, y: halfHeight },
                { x: halfWidth, y: halfHeight },
                { x: -halfWidth, y: -halfHeight }
            ];
        }
        var rotatedPoints = points.map(function (corner) { return ({
            x: corner.x * cosValue - corner.y * sinValue,
            y: corner.x * sinValue + corner.y * cosValue
        }); });
        var pathData = this.getPathData(rotatedPoints);
        var viewBox = this.getViewBox(rotatedPoints);
        this.renderSvg(target, pathData, viewBox, shapeInfo);
    };
    EJShape.prototype.renderArrow = function (target, shapeInfo) {
        var halfWidth = shapeInfo.svgWidth / 2;
        var halfHeight = shapeInfo.svgHeight / 2;
        var angleRad = (parseFloat(shapeInfo.angle) % 360 * Math.PI) / 180;
        var sinValue = Math.sin(angleRad);
        var cosValue = Math.cos(angleRad);
        var points = [];
        var maxArrowWidth = shapeInfo.svgWidth * 0.5;
        var maxArrowHeight = shapeInfo.svgHeight * 0.5;
        var arrowWidth = parseFloat(shapeInfo.arrowWidth);
        var arrowHeight = parseFloat(shapeInfo.arrowHeight);
        var shapeType = shapeInfo.shapeType.toLowerCase();
        if (shapeType === 'rightarrow') {
            arrowWidth = Math.min(arrowWidth, maxArrowHeight);
            arrowHeight = Math.min(arrowHeight, maxArrowWidth);
            points = [
                { x: -halfWidth, y: -arrowWidth / 2 },
                { x: halfWidth - arrowHeight, y: -arrowWidth / 2 },
                { x: halfWidth - arrowHeight, y: -halfHeight },
                { x: halfWidth, y: 0 },
                { x: halfWidth - arrowHeight, y: halfHeight },
                { x: halfWidth - arrowHeight, y: arrowWidth / 2 },
                { x: -halfWidth, y: arrowWidth / 2 },
                { x: -halfWidth, y: -arrowWidth / 2 }
            ];
        }
        else if (shapeType === 'leftarrow') {
            arrowWidth = Math.min(arrowWidth, maxArrowHeight);
            arrowHeight = Math.min(arrowHeight, maxArrowWidth);
            points = [
                { x: halfWidth, y: -arrowWidth / 2 },
                { x: -halfWidth + arrowHeight, y: -arrowWidth / 2 },
                { x: -halfWidth + arrowHeight, y: -halfHeight },
                { x: -halfWidth, y: 0 },
                { x: -halfWidth + arrowHeight, y: halfHeight },
                { x: -halfWidth + arrowHeight, y: arrowWidth / 2 },
                { x: halfWidth, y: arrowWidth / 2 },
                { x: halfWidth, y: -arrowWidth / 2 }
            ];
        }
        else if (shapeType === 'uparrow') {
            arrowWidth = Math.min(arrowWidth, maxArrowWidth);
            arrowHeight = Math.min(arrowHeight, maxArrowHeight);
            points = [
                { x: -arrowWidth / 2, y: halfHeight },
                { x: -arrowWidth / 2, y: -halfHeight + arrowHeight },
                { x: -halfWidth, y: -halfHeight + arrowHeight },
                { x: 0, y: -halfHeight },
                { x: halfWidth, y: -halfHeight + arrowHeight },
                { x: arrowWidth / 2, y: -halfHeight + arrowHeight },
                { x: arrowWidth / 2, y: halfHeight },
                { x: -arrowWidth / 2, y: halfHeight }
            ];
        }
        else if (shapeType === 'downarrow') {
            arrowWidth = Math.min(arrowWidth, maxArrowWidth);
            arrowHeight = Math.min(arrowHeight, maxArrowHeight);
            points = [
                { x: -arrowWidth / 2, y: -halfHeight },
                { x: -arrowWidth / 2, y: halfHeight - arrowHeight },
                { x: -halfWidth, y: halfHeight - arrowHeight },
                { x: 0, y: halfHeight },
                { x: halfWidth, y: halfHeight - arrowHeight },
                { x: arrowWidth / 2, y: halfHeight - arrowHeight },
                { x: arrowWidth / 2, y: -halfHeight },
                { x: -arrowWidth / 2, y: -halfHeight }
            ];
        }
        var rotatedPoints = points.map(function (point) { return ({
            x: point.x * cosValue - point.y * sinValue,
            y: point.x * sinValue + point.y * cosValue
        }); });
        var pathData = this.getPathData(rotatedPoints);
        var viewBox = this.getViewBox(rotatedPoints);
        this.renderSvg(target, pathData, viewBox, shapeInfo);
    };
    EJShape.prototype.renderStar = function (target, shapeInfo) {
        var halfWidth = shapeInfo.svgWidth / 2;
        var halfHeight = shapeInfo.svgHeight / 2;
        var angleRad = (parseFloat(shapeInfo.angle) % 360 * Math.PI) / 180;
        var sinValue = Math.sin(angleRad);
        var cosValue = Math.cos(angleRad);
        var aspectRatio = shapeInfo.svgWidth / shapeInfo.svgHeight;
        var radius = Math.min(shapeInfo.svgWidth, shapeInfo.svgHeight) * 0.45;
        var outerRadiusX = radius * (aspectRatio > 1 ? 1 : aspectRatio);
        var outerRadiusY = radius * (aspectRatio < 1 ? 1 : 1 / aspectRatio);
        var concavityFactor = Math.pow(parseFloat(shapeInfo.starConcavity), 1.5);
        var innerRadiusX = outerRadiusX * concavityFactor;
        var innerRadiusY = outerRadiusY * concavityFactor;
        var angleIncrement = (2 * Math.PI) / parseFloat(shapeInfo.starCount);
        var startAngle = -Math.PI / 2;
        var points = [];
        for (var index = 0; index < parseFloat(shapeInfo.starCount); index++) {
            var outerAngle = startAngle + index * angleIncrement;
            var innerAngle = outerAngle + angleIncrement / 2;
            points.push({
                x: halfWidth + Math.cos(outerAngle) * outerRadiusX,
                y: halfHeight + Math.sin(outerAngle) * outerRadiusY
            });
            points.push({
                x: halfWidth + Math.cos(innerAngle) * innerRadiusX,
                y: halfHeight + Math.sin(innerAngle) * innerRadiusY
            });
        }
        var rotatedPoints = points.map(function (point) { return ({
            x: (point.x - halfWidth) * cosValue - (point.y - halfHeight) * sinValue + halfWidth,
            y: (point.x - halfWidth) * sinValue + (point.y - halfHeight) * cosValue + halfHeight
        }); });
        var pathData = this.getPathData(rotatedPoints);
        var viewBox = this.getViewBox(rotatedPoints);
        this.renderSvg(target, pathData, viewBox, shapeInfo);
    };
    EJShape.prototype.renderPolygon = function (target, shapeInfo) {
        var maxRadiusX = shapeInfo.svgWidth / 2;
        var maxRadiusY = shapeInfo.svgHeight / 2;
        var angleRad = (parseFloat(shapeInfo.angle) % 360 * Math.PI) / 180;
        var sinValue = Math.sin(angleRad);
        var cosValue = Math.cos(angleRad);
        var points = [];
        var shapeType = shapeInfo.shapeType.toLowerCase();
        if (shapeType === 'octagon') {
            for (var index = 0; index < 8; index++) {
                var theta = (Math.PI / 8) + (Math.PI * 2 / 8) * index;
                points.push({
                    x: maxRadiusX + Math.cos(theta) * maxRadiusX,
                    y: maxRadiusY + Math.sin(theta) * maxRadiusY
                });
            }
        }
        else if (shapeType === 'pentagon') {
            for (var index = 0; index < 5; index++) {
                var theta = (-Math.PI / 2) + (Math.PI * 2 / 5) * index;
                points.push({
                    x: maxRadiusX + Math.cos(theta) * maxRadiusX,
                    y: maxRadiusY + Math.sin(theta) * maxRadiusY
                });
            }
        }
        else if (shapeType === 'hexagon') {
            for (var index = 0; index < 6; index++) {
                var theta = (Math.PI / 3) * index;
                points.push({
                    x: maxRadiusX + Math.cos(theta) * maxRadiusX,
                    y: maxRadiusY + Math.sin(theta) * maxRadiusY
                });
            }
        }
        var rotatedPoints = points.map(function (point) { return ({
            x: (point.x - maxRadiusX) * cosValue - (point.y - maxRadiusY) * sinValue + maxRadiusX,
            y: (point.x - maxRadiusX) * sinValue + (point.y - maxRadiusY) * cosValue + maxRadiusY
        }); });
        var pathData = this.getPathData(rotatedPoints);
        var viewBox = this.getViewBox(rotatedPoints);
        this.renderSvg(target, pathData, viewBox, shapeInfo);
    };
    EJShape.prototype.getPathData = function (points) {
        var pathData = "M " + points[0].x + " " + points[0].y + " ";
        for (var index = 1; index < points.length; index++) {
            pathData += "L " + points[index].x + " " + points[index].y + " ";
        }
        pathData += 'Z';
        return pathData;
    };
    EJShape.prototype.getViewBox = function (points) {
        var minX = Math.min.apply(Math, points.map(function (p) { return p.x; }));
        var maxX = Math.max.apply(Math, points.map(function (p) { return p.x; }));
        var minY = Math.min.apply(Math, points.map(function (p) { return p.y; }));
        var maxY = Math.max.apply(Math, points.map(function (p) { return p.y; }));
        var viewBox = minX + " " + minY + " " + (maxX - minX) + " " + (maxY - minY);
        return viewBox;
    };
    EJShape.prototype.renderSvg = function (target, pathData, viewBox, shapeInfo) {
        var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        var defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        var clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
        var clipPathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        var graphics = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        var shapePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        var targetId = target.attr('id');
        var fillColor = this.hasDesignerInstance(this.instance) ?
            ej.ReportUtil.convertColorFormat(shapeInfo.fillColor, true) : shapeInfo.fillColor;
        this.setAttributes(svg, {
            'width': shapeInfo.svgWidth + "px", 'height': shapeInfo.svgHeight + "px",
            'viewBox': viewBox, 'id': targetId + "_svg", 'preserveAspectRatio': 'none'
        });
        this.setAttributes(clipPathElement, { 'd': pathData });
        this.setAttributes(clipPath, { 'id': targetId + "_clip_path", 'clipPathUnits': 'userSpaceOnUse' });
        this.setAttributes(shapePath, {
            'd': pathData, 'vector-effect': 'non-scaling-stroke',
            'clip-path': "url(#" + targetId + "_clip_path)", 'id': targetId + "_shape_path", 'fill': fillColor,
            'stroke-dasharray': this.getStrokeStyle(shapeInfo.strokeStyle), 'stroke-width': "" + (parseFloat(shapeInfo.strokeWidth) + 1),
            'stroke': shapeInfo.strokeColor
        });
        target.empty();
        clipPath.appendChild(clipPathElement);
        defs.appendChild(clipPath);
        graphics.appendChild(shapePath);
        $(svg).append(defs, graphics);
        target.append(svg);
    };
    EJShape.prototype.getStrokeStyle = function (style) {
        var borderStyle = '0';
        switch (style.toLowerCase()) {
            case 'solid':
                borderStyle = '0';
                break;
            case 'dotted':
                borderStyle = '3,3';
                break;
            case 'dashed':
                borderStyle = '10,10';
                break;
            case 'dashdot':
                borderStyle = '10,10,4,10';
                break;
            case 'dashdotdot':
                borderStyle = '20,10,4,4,4,10';
                break;
        }
        return borderStyle;
    };
    EJShape.prototype.onPropertyChange = function (name, oldValue, newValue) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var shapeElement = this.customItemDiv.find('#' + this.customJSON.Name + '_customItem_shape_path');
        switch (name.toLowerCase()) {
            case 'backgroundcolor':
                this.customItemDiv.css('background-color', newValue);
                break;
            case 'borderstyle':
                if (args.length > 0) {
                    this.customItemDiv.css('border' + args[0] + '-style', newValue ? newValue.toLowerCase() : 'none');
                }
                this.renderShape(this.customItemDiv, this.customJSON);
                break;
            case 'borderwidth':
                this.renderShape(this.customItemDiv, this.customJSON);
                break;
            case 'shapetype':
                this.updatePropertyVal(name, newValue);
                this.renderShape(this.customItemDiv, this.customJSON);
                break;
            case 'fillcolor':
                if (!ej.ReportUtil.isEmptyString(newValue)) {
                    this.updatePropertyVal(name, newValue);
                    this.setAttributes(shapeElement[0], { 'fill': ej.ReportUtil.convertColorFormat(newValue, true) });
                }
                break;
            case 'linewidth':
                this.updatePropertyVal(name, newValue);
                this.setAttributes(shapeElement[0], { 'stroke-width': newValue + 1 });
                break;
            case 'linecolor':
                this.updatePropertyVal(name, newValue);
                this.setAttributes(shapeElement[0], { 'stroke': newValue });
                break;
            case 'linestyle':
                this.updatePropertyVal(name, newValue);
                this.setAttributes(shapeElement[0], { 'stroke-dasharray': this.getStrokeStyle(newValue) });
                break;
            case 'rotationangle':
                this.updatePropertyVal(name, newValue);
                this.renderShape(this.customItemDiv, this.customJSON);
                break;
            case 'starcount':
                this.updatePropertyVal(name, newValue);
                this.renderShape(this.customItemDiv, this.customJSON);
                break;
            case 'concavity':
                this.updatePropertyVal(name, newValue);
                this.renderShape(this.customItemDiv, this.customJSON);
                break;
            case 'arrowheight':
                this.updatePropertyVal(name, newValue);
                this.renderShape(this.customItemDiv, this.customJSON);
                break;
            case 'arrowwidth':
                this.updatePropertyVal(name, newValue);
                this.renderShape(this.customItemDiv, this.customJSON);
                break;
        }
    };
    EJShape.prototype.updatePropertyUIValue = function (name, value) {
    };
    EJShape.prototype.onPositionChanged = function (top, left) {
    };
    EJShape.prototype.onSizeChanged = function (height, width) {
        if (!ej.isNullOrUndefined(height) && !ej.isNullOrUndefined(width)) {
            this.customItemDiv.css({
                width: width,
                height: height
            });
        }
        else if (ej.isNullOrUndefined(width) && !ej.isNullOrUndefined(height)) {
            this.customItemDiv.css({
                height: height
            });
        }
        else if (ej.isNullOrUndefined(height) && !ej.isNullOrUndefined(width)) {
            this.customItemDiv.css({
                width: width
            });
        }
        this.renderShape(this.customItemDiv, this.customJSON);
    };
    EJShape.prototype.getPropertyGridItems = function (baseProperties) {
        var rdlParser = this.getRdlParser();
        var shapeInfo = this.getShapeInfo(this.customJSON);
        var shapeTypes = this.getShapeTypes();
        var lineStyles = this.getLineStyles();
        var itemProperties = [{
                'CategoryId': 'basicsettings',
                'DisplayName': 'categorybasicsettings',
                'IsExpand': true,
                'Items': [{
                        'ItemId': 'shapetype',
                        'Name': 'ShapeType',
                        'DisplayName': 'ShapeType',
                        'Value': shapeInfo.shapeType,
                        'ItemType': 'DropDown',
                        'EnableExpression': false,
                        'IsIgnoreCommon': true,
                        'ValueList': shapeTypes,
                        'DependentItems': [{
                                'EnableItems': [],
                                'DisableItems': ['basicsettings_starcount', 'basicsettings_concavity', 'basicsettings_arrowheight', 'basicsettings_arrowwidth'],
                                'Value': ['Ellipse', 'Rectangle', 'Hexagon', 'RightAngleTriangle', 'Triangle', 'Pentagon', 'Octagon']
                            },
                            {
                                'EnableItems': ['basicsettings_starcount', 'basicsettings_concavity'],
                                'DisableItems': ['basicsettings_arrowheight', 'basicsettings_arrowwidth'],
                                'Value': ['Star']
                            },
                            {
                                'EnableItems': ['basicsettings_arrowheight', 'basicsettings_arrowwidth'],
                                'DisableItems': ['basicsettings_starcount', 'basicsettings_concavity'],
                                'Value': ['LeftArrow', 'RightArrow', 'UpArrow', 'DownArrow']
                            }]
                    },
                    {
                        'ItemId': 'rotationangle',
                        'Name': 'RotationAngle',
                        'DisplayName': 'RotationAngle',
                        'Value': shapeInfo.angle,
                        'Minimum': 0,
                        'Maximum': 360,
                        'Interval': 1,
                        'DecimalPlaces': 0,
                        'EnableExpression': false,
                        'ItemType': 'Numeric',
                    },
                    {
                        'ItemId': 'starcount',
                        'Name': 'StarCount',
                        'DisplayName': 'StarCount',
                        'ParentId': 'basicsettings_shapetype',
                        'EnableExpression': false,
                        'IsIgnoreCommon': true,
                        'Value': shapeInfo.starCount,
                        'Minimum': 3,
                        'Maximum': 8,
                        'Interval': 1,
                        'DecimalPlaces': 0,
                        'ItemType': 'Numeric',
                    },
                    {
                        'ItemId': 'concavity',
                        'Name': 'Concavity',
                        'DisplayName': 'Concavity',
                        'ParentId': 'basicsettings_shapetype',
                        'EnableExpression': false,
                        'IsIgnoreCommon': true,
                        'Value': shapeInfo.starConcavity,
                        'Minimum': 0.3,
                        'Maximum': 1,
                        'Interval': 0.1,
                        'DecimalPlaces': 1,
                        'ItemType': 'Numeric'
                    },
                    {
                        'ItemId': 'arrowheight',
                        'Name': 'ArrowHeight',
                        'DisplayName': 'ArrowHeight',
                        'ParentId': 'basicsettings_shapetype',
                        'EnableExpression': false,
                        'IsIgnoreCommon': true,
                        'Value': shapeInfo.arrowHeight,
                        'Minimum': 0,
                        'Maximum': 100,
                        'Interval': 1,
                        'DecimalPlaces': 0,
                        'ItemType': 'Numeric'
                    },
                    {
                        'ItemId': 'arrowwidth',
                        'Name': 'ArrowWidth',
                        'DisplayName': 'ArrowWidth',
                        'EnableExpression': false,
                        'IsIgnoreCommon': true,
                        'ParentId': 'basicsettings_shapetype',
                        'Value': shapeInfo.arrowWidth,
                        'Minimum': 0,
                        'Maximum': 100,
                        'Interval': 1,
                        'DecimalPlaces': 0,
                        'ItemType': 'Numeric'
                    },
                    {
                        'ItemId': 'fillcolor',
                        'Name': 'FillColor',
                        'DisplayName': 'FillColor',
                        'Value': shapeInfo.fillColor,
                        'EnableExpression': true,
                        'ItemType': 'Color'
                    },
                    {
                        'ItemId': 'lineitem',
                        'Name': 'LineItem',
                        'DisplayName': 'LineStyle',
                        'ItemType': 'Border',
                        'EnableExpression': false,
                        'Items': [{
                                'ItemId': 'linestyle',
                                'Name': 'LineStyle',
                                'DisplayName': 'styletooltip',
                                'HeaderText': 'linestyle',
                                'Value': shapeInfo.strokeStyle,
                                'ItemType': 'DropDown',
                                'ValueList': lineStyles
                            },
                            {
                                'ItemId': 'linecolor',
                                'Name': 'LineColor',
                                'DisplayName': 'colortooltip',
                                'HeaderText': 'linecolor',
                                'Value': shapeInfo.strokeColor,
                                'ItemType': 'Color',
                                'EnableOpacity': false,
                                'EnableExpression': true,
                            },
                            {
                                'ItemId': 'linewidth',
                                'Name': 'LineWidth',
                                'DisplayName': 'sizetooltip',
                                'HeaderText': 'linesize',
                                'Value': shapeInfo.strokeWidth,
                                'Minimum': ej.ReportUtil.getPropertyValue(rdlParser.isPixelUnit(), rdlParser.getRDLUnit(), 0.33),
                                'Maximum': ej.ReportUtil.getPropertyValue(rdlParser.isPixelUnit(), rdlParser.getRDLUnit(), 26.6),
                                'Interval': ej.ReportUtil.getPropertyValue(rdlParser.isPixelUnit(), rdlParser.getRDLUnit(), 0.5),
                                'decimalPlaces': ej.ReportUtil.getDecimalPlaces(rdlParser.getUnitVal()),
                                'UnitType': rdlParser.getUnitVal(),
                                'ItemType': 'Numeric'
                            }]
                    }]
            }];
        baseProperties.HeaderText = this.customJSON.Name;
        baseProperties.PropertyType = 'shape';
        baseProperties.SubType = 'shape';
        baseProperties.IsEditHeader = true;
        baseProperties.Items = $.merge(itemProperties, baseProperties.Items);
        return baseProperties;
    };
    EJShape.prototype.updatePropertyVal = function (propertyName, value) {
        if (this.customJSON.CustomProperties && this.customJSON.CustomProperties.length > 0) {
            for (var index = 0; index < this.customJSON.CustomProperties.length; index++) {
                if (this.customJSON.CustomProperties[index].Name === propertyName) {
                    this.customJSON.CustomProperties[index].Value = value;
                }
            }
        }
    };
    EJShape.prototype.getPropertyVal = function (name, customJSON) {
        if (customJSON.CustomProperties && customJSON.CustomProperties.length > 0) {
            for (var index = 0; index < customJSON.CustomProperties.length; index++) {
                if (customJSON.CustomProperties[index].Name === name) {
                    return customJSON.CustomProperties[index].Value;
                }
            }
        }
        return null;
    };
    EJShape.prototype.undoRedoAction = function () {
    };
    EJShape.prototype.getReportItemJson = function () {
        if (this.customJSON === null) {
            this.customJSON = new ej.ReportModel.CustomReportItem().getModel();
            this.setPropertyVal('ShapeType', 'Ellipse');
            this.setPropertyVal('RotationAngle', '0');
            this.setPropertyVal('FillColor', 'Transparent');
            this.setPropertyVal('LineWidth', '1');
            this.setPropertyVal('LineColor', 'Black');
            this.setPropertyVal('LineStyle', 'Solid');
            this.setPropertyVal('StarCount', '5');
            this.setPropertyVal('Concavity', '0.5');
            this.setPropertyVal('ArrowHeight', '50');
            this.setPropertyVal('ArrowWidth', '50');
        }
        return this.customJSON;
    };
    EJShape.prototype.setPropertyVal = function (name, val) {
        if (this.customJSON.CustomProperties === null) {
            this.customJSON.CustomProperties = [];
        }
        this.customJSON.CustomProperties.push(new ej.ReportModel.CustomProperty(name, val));
    };
    EJShape.prototype.setReportItemJson = function (reportItem) {
        this.customJSON = reportItem;
    };
    EJShape.prototype.hasDesignerInstance = function (instance) {
        return instance && instance.pluginName && instance.pluginName.toLowerCase() === 'boldreportdesigner';
    };
    EJShape.prototype.setAttributes = function (el, attrs) {
        for (var key in attrs) {
            el.setAttributeNS(null, key, attrs[key]);
        }
    };
    EJShape.prototype.getSvgHeight = function (customJson) {
        var height = 0;
        var topBorderWidth = 0;
        var bottomBorderWidth = 0;
        var borderWidth = 0;
        if (this.hasDesignerInstance(this.instance)) {
            height = ej.ReportUtil.getPixelVal(customJson.Height.size);
            topBorderWidth = this.getBorderWidth(customJson.Style.TopBorder, true);
            bottomBorderWidth = this.getBorderWidth(customJson.Style.BottomBorder, true);
            borderWidth = this.getBorderWidth(customJson.Style.Border, true);
        }
        else {
            height = customJson.Height;
            topBorderWidth = this.getBorderWidth(customJson.Border.TopBorder, false);
            bottomBorderWidth = this.getBorderWidth(customJson.Border.BottomBorder, false);
            borderWidth = this.getBorderWidth(customJson.Border.Default, false);
        }
        var totalBorderWidth = (topBorderWidth || borderWidth) + (bottomBorderWidth || borderWidth);
        return height - totalBorderWidth;
    };
    EJShape.prototype.getSvgWidth = function (customJson) {
        var width = 0;
        var leftBorderWidth = 0;
        var rightBorderWidth = 0;
        var borderWidth = 0;
        if (this.hasDesignerInstance(this.instance)) {
            width = ej.ReportUtil.getPixelVal(customJson.Width.size);
            leftBorderWidth = this.getBorderWidth(customJson.Style.LeftBorder, true);
            rightBorderWidth = this.getBorderWidth(customJson.Style.RightBorder, true);
            borderWidth = this.getBorderWidth(customJson.Style.Border, true);
        }
        else {
            width = customJson.Width;
            leftBorderWidth = this.getBorderWidth(customJson.Border.LeftBorder, false);
            rightBorderWidth = this.getBorderWidth(customJson.Border.RightBorder, false);
            borderWidth = this.getBorderWidth(customJson.Border.Default, false);
        }
        var totalBorderWidth = (leftBorderWidth || borderWidth) + (rightBorderWidth || borderWidth);
        return width - totalBorderWidth;
    };
    EJShape.prototype.getBorderWidth = function (border, isDesigner) {
        var borderWidth = 0;
        if (isDesigner && border && border.Style && border.Style !== 'None' && border.Style !== 'Default' && border.Width) {
            borderWidth = ej.ReportUtil.getPixelVal(border.Width.size);
        }
        else if (border && border.BorderStyle && border.BorderStyle !== 'None' && border.BorderStyle !== 'Default' && border.Thickness) {
            borderWidth = border.Thickness;
        }
        return borderWidth;
    };
    EJShape.prototype.getRdlParser = function () {
        return this.hasDesignerInstance(this.instance) ? this.instance.rdlParser : null;
    };
    EJShape.prototype.getShapeTypes = function () {
        return [{ 'text': 'ellipse', 'value': 'Ellipse' },
            { 'text': 'triangle', 'value': 'Triangle' }, { 'text': 'rightangletriangle', 'value': 'RightAngleTriangle' },
            { 'text': 'rectangle', 'value': 'Rectangle' }, { 'text': 'hexagon', 'value': 'Hexagon' },
            { 'text': 'pentagon', 'value': 'Pentagon' }, { 'text': 'octagon', 'value': 'Octagon' },
            { 'text': 'star', 'value': 'Star' }, { 'text': 'leftarrow', 'value': 'LeftArrow' },
            { 'text': 'rightarrow', 'value': 'RightArrow' }, { 'text': 'uparrow', 'value': 'UpArrow' },
            { 'text': 'downarrow', 'value': 'DownArrow' }];
    };
    EJShape.prototype.getLineStyles = function () {
        return [{ 'text': 'dashed', 'value': 'Dashed' },
            { 'text': 'dotted', 'value': 'Dotted' }, { 'text': 'dashdotdot', 'value': 'DashDotDot' },
            { 'text': 'dashdot', 'value': 'DashDot' }, { 'text': 'solid', 'value': 'Solid' }];
    };
    EJShape.prototype.updateStyle = function (jsonStyle, isTablixCell) {
        if (jsonStyle && !isTablixCell) {
            if (jsonStyle.Border && (jsonStyle.Border.Style === 'Default' || jsonStyle.Border.Style === 'None')) {
                this.customItemDiv.css('border-style', 'none');
            }
            if (jsonStyle.TopBorder && (jsonStyle.TopBorder.Style === 'Default' || jsonStyle.TopBorder.Style === 'None')) {
                this.customItemDiv.css('border-top-style', 'none');
            }
            if (jsonStyle.BottomBorder && (jsonStyle.BottomBorder.Style === 'Default' || jsonStyle.BottomBorder.Style === 'None')) {
                this.customItemDiv.css('border-bottom-style', 'none');
            }
            if (jsonStyle.LeftBorder && (jsonStyle.LeftBorder.Style === 'Default' || jsonStyle.LeftBorder.Style === 'None')) {
                this.customItemDiv.css('border-left-style', 'none');
            }
            if (jsonStyle.RightBorder && (jsonStyle.RightBorder.Style === 'Default' || jsonStyle.RightBorder.Style === 'None')) {
                this.customItemDiv.css('border-right-style', 'none');
            }
        }
    };
    EJShape.prototype.dispose = function () {
        this.instance = null;
        this.customItemDiv = null;
        this.customJSON = null;
        this.rootElement = null;
    };
    EJShape.prototype.getLocale = function (text) {
        var shapeLocale;
        var defaultLocale = EJShape.Locale['en-US'];
        if (this.instance && this.hasDesignerInstance(this.instance) && this.instance.model && EJShape.Locale[this.instance.model.locale]) {
            shapeLocale = EJShape.Locale[this.instance.model.locale];
        }
        switch (text.toLowerCase()) {
            case 'categorybasicsettings':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.categoryName) {
                    return shapeLocale.basicSettings.categoryName;
                }
                return defaultLocale.basicSettings.categoryName;
            case 'shapetype':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.shapeType) {
                    return shapeLocale.basicSettings.shapeType;
                }
                return defaultLocale.basicSettings.shapeType;
            case 'rotationangle':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.rotationAngle) {
                    return shapeLocale.basicSettings.rotationAngle;
                }
                return defaultLocale.basicSettings.rotationAngle;
            case 'starcount':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.starCount) {
                    return shapeLocale.basicSettings.starCount;
                }
                return defaultLocale.basicSettings.starCount;
            case 'concavity':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.concavity) {
                    return shapeLocale.basicSettings.concavity;
                }
                return defaultLocale.basicSettings.concavity;
            case 'arrowheight':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.arrowHeight) {
                    return shapeLocale.basicSettings.arrowHeight;
                }
                return defaultLocale.basicSettings.arrowHeight;
            case 'arrowwidth':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.arrowWidth) {
                    return shapeLocale.basicSettings.arrowWidth;
                }
                return defaultLocale.basicSettings.arrowWidth;
            case 'linestyle':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.lineStyle) {
                    return shapeLocale.basicSettings.lineStyle;
                }
                return defaultLocale.basicSettings.lineStyle;
            case 'fillcolor':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.fillColor) {
                    return shapeLocale.basicSettings.fillColor;
                }
                return defaultLocale.basicSettings.fillColor;
            case 'ellipse':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.shapeTypes
                    && shapeLocale.basicSettings.shapeTypes.ellipse) {
                    return shapeLocale.basicSettings.shapeTypes.ellipse;
                }
                return defaultLocale.basicSettings.shapeTypes.ellipse;
            case 'triangle':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.shapeTypes
                    && shapeLocale.basicSettings.shapeTypes.triangle) {
                    return shapeLocale.basicSettings.shapeTypes.triangle;
                }
                return defaultLocale.basicSettings.shapeTypes.triangle;
            case 'rightangletriangle':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.shapeTypes
                    && shapeLocale.basicSettings.shapeTypes.rightAngleTriangle) {
                    return shapeLocale.basicSettings.shapeTypes.rightAngleTriangle;
                }
                return defaultLocale.basicSettings.shapeTypes.rightAngleTriangle;
            case 'rectangle':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.shapeTypes
                    && shapeLocale.basicSettings.shapeTypes.rectangle) {
                    return shapeLocale.basicSettings.shapeTypes.rectangle;
                }
                return defaultLocale.basicSettings.shapeTypes.rectangle;
            case 'hexagon':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.shapeTypes
                    && shapeLocale.basicSettings.shapeTypes.hexagon) {
                    return shapeLocale.basicSettings.shapeTypes.hexagon;
                }
                return defaultLocale.basicSettings.shapeTypes.hexagon;
            case 'pentagon':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.shapeTypes
                    && shapeLocale.basicSettings.shapeTypes.pentagon) {
                    return shapeLocale.basicSettings.shapeTypes.pentagon;
                }
                return defaultLocale.basicSettings.shapeTypes.pentagon;
            case 'octagon':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.shapeTypes
                    && shapeLocale.basicSettings.shapeTypes.octagon) {
                    return shapeLocale.basicSettings.shapeTypes.octagon;
                }
                return defaultLocale.basicSettings.shapeTypes.octagon;
            case 'star':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.shapeTypes
                    && shapeLocale.basicSettings.shapeTypes.star) {
                    return shapeLocale.basicSettings.shapeTypes.star;
                }
                return defaultLocale.basicSettings.shapeTypes.star;
            case 'leftarrow':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.shapeTypes
                    && shapeLocale.basicSettings.shapeTypes.leftArrow) {
                    return shapeLocale.basicSettings.shapeTypes.leftArrow;
                }
                return defaultLocale.basicSettings.shapeTypes.leftArrow;
            case 'rightarrow':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.shapeTypes
                    && shapeLocale.basicSettings.shapeTypes.rightArrow) {
                    return shapeLocale.basicSettings.shapeTypes.rightArrow;
                }
                return defaultLocale.basicSettings.shapeTypes.rightArrow;
            case 'uparrow':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.shapeTypes
                    && shapeLocale.basicSettings.shapeTypes.upArrow) {
                    return shapeLocale.basicSettings.shapeTypes.upArrow;
                }
                return defaultLocale.basicSettings.shapeTypes.upArrow;
            case 'downarrow':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.shapeTypes
                    && shapeLocale.basicSettings.shapeTypes.downArrow) {
                    return shapeLocale.basicSettings.shapeTypes.downArrow;
                }
                return defaultLocale.basicSettings.shapeTypes.downArrow;
            case 'dashed':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.lineStyles
                    && shapeLocale.basicSettings.lineStyles.dashed) {
                    return shapeLocale.basicSettings.lineStyles.dashed;
                }
                return defaultLocale.basicSettings.lineStyles.dashed;
            case 'dotted':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.lineStyles
                    && shapeLocale.basicSettings.lineStyles.dotted) {
                    return shapeLocale.basicSettings.lineStyles.dotted;
                }
                return defaultLocale.basicSettings.lineStyles.dotted;
            case 'dashdotdot':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.lineStyles
                    && shapeLocale.basicSettings.lineStyles.dashdotdot) {
                    return shapeLocale.basicSettings.lineStyles.dashdotdot;
                }
                return defaultLocale.basicSettings.lineStyles.dashdotdot;
            case 'dashdot':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.lineStyles
                    && shapeLocale.basicSettings.lineStyles.dashdot) {
                    return shapeLocale.basicSettings.lineStyles.dashdot;
                }
                return defaultLocale.basicSettings.lineStyles.dashdot;
            case 'solid':
                if (shapeLocale && shapeLocale.basicSettings && shapeLocale.basicSettings.lineStyles
                    && shapeLocale.basicSettings.lineStyles.solid) {
                    return shapeLocale.basicSettings.lineStyles.solid;
                }
                return defaultLocale.basicSettings.lineStyles.solid;
        }
    };
    EJShape.prototype.renderItemPreview = function (criModel, targetDiv, locale) {
        this.renderShape($(targetDiv), criModel);
    };
    return EJShape;
}());
EJShape.Locale = {};
EJShape.Locale['ar-AE'] = {
    basicSettings: {
        categoryName: 'الإعدادات الأساسية',
        shapeType: 'الأشكال',
        rotationAngle: 'زاوية الدوران',
        starCount: 'عدد النجوم',
        concavity: 'تقعر',
        arrowHeight: 'ارتفاع السهم',
        arrowWidth: 'عرض السهم',
        lineStyle: 'نمط الخط',
        fillColor: 'لون التعبئة',
        shapeTypes: {
            ellipse: 'القطع الناقص',
            triangle: 'مثلث',
            rightAngleTriangle: 'مثلث قائم الزاوية',
            rectangle: 'المستطيل',
            hexagon: 'مسدس',
            pentagon: 'البنتاغون',
            octagon: 'مثمن',
            star: 'نجم',
            leftArrow: 'السهم الأيسر',
            rightArrow: 'السهم الأيمن',
            upArrow: 'سهم لأعلى',
            downArrow: 'سهم لأسفل'
        },
        lineStyles: {
            dashed: 'متقطع',
            dotted: 'منقط',
            dashdotdot: 'شرطة نقطة نقطة',
            dashdot: 'داش دوت',
            solid: 'صلب'
        }
    },
    toolTip: {
        requirements: 'Display items in Shapes',
        description: 'Visualize data with customizable shapes.',
        title: 'Shape'
    }
};
EJShape.Locale['en-NZ'] = {
    basicSettings: {
        categoryName: 'Basic Settings',
        shapeType: 'Shapes',
        rotationAngle: 'Rotation Angle',
        starCount: 'Star Count',
        concavity: 'Concavity',
        arrowHeight: 'Arrow Height',
        arrowWidth: 'Arrow Width',
        lineStyle: 'Line Style',
        fillColor: 'Fill Colour',
        shapeTypes: {
            ellipse: 'Ellipse',
            triangle: 'Triangle',
            rightAngleTriangle: 'Right Angle Triangle',
            rectangle: 'Rectangle',
            hexagon: 'Hexagon',
            pentagon: 'Pentagon',
            octagon: 'Octagon',
            star: 'Star',
            leftArrow: 'Left Arrow',
            rightArrow: 'Right Arrow',
            upArrow: 'Up Arrow',
            downArrow: 'Down Arrow'
        },
        lineStyles: {
            dashed: 'Dashed',
            dotted: 'Dotted',
            dashdotdot: 'Dash Dot Dot',
            dashdot: 'Dash Dot',
            solid: 'Solid'
        }
    },
    toolTip: {
        requirements: 'Display items in Shapes',
        description: 'Visualise data with customisable shapes.',
        title: 'Shape'
    }
};
EJShape.Locale['en-US'] = {
    basicSettings: {
        categoryName: 'Basic Settings',
        shapeType: 'Shapes',
        rotationAngle: 'Rotation Angle',
        starCount: 'Star Count',
        concavity: 'Concavity',
        arrowHeight: 'Arrow Height',
        arrowWidth: 'Arrow Width',
        lineStyle: 'Line Style',
        fillColor: 'Fill Color',
        shapeTypes: {
            ellipse: 'Ellipse',
            triangle: 'Triangle',
            rightAngleTriangle: 'Right Angle Triangle',
            rectangle: 'Rectangle',
            hexagon: 'Hexagon',
            pentagon: 'Pentagon',
            octagon: 'Octagon',
            star: 'Star',
            leftArrow: 'Left Arrow',
            rightArrow: 'Right Arrow',
            upArrow: 'Up Arrow',
            downArrow: 'Down Arrow'
        },
        lineStyles: {
            dashed: 'Dashed',
            dotted: 'Dotted',
            dashdotdot: 'Dash Dot Dot',
            dashdot: 'Dash Dot',
            solid: 'Solid'
        }
    },
    toolTip: {
        requirements: 'Display items in Shapes',
        description: 'Visualize data with customizable shapes.',
        title: 'Shape'
    }
};
EJShape.Locale['de-DE'] = {
    basicSettings: {
        categoryName: 'Grundeinstellungen',
        shapeType: 'Formen',
        rotationAngle: 'Drehwinkel',
        starCount: 'Sternenanzahl',
        concavity: 'Konkavität',
        arrowHeight: 'Pfeilhöhe',
        arrowWidth: 'Pfeilbreite',
        lineStyle: 'Linienstil',
        fillColor: 'Füllfarbe',
        shapeTypes: {
            ellipse: 'Ellipse',
            triangle: 'Dreieck',
            rightAngleTriangle: 'Rechtwinkliges Dreieck',
            rectangle: 'Rechteck',
            hexagon: 'Hexagon',
            pentagon: 'Pentagon',
            octagon: 'Oktagon',
            star: 'Stern',
            leftArrow: 'Linker Pfeil',
            rightArrow: 'Rechter Pfeil',
            upArrow: 'Nach oben Pfeil',
            downArrow: 'Nach unten Pfeil'
        },
        lineStyles: {
            dashed: 'Gestrichelt',
            dotted: 'Gepunktet',
            dashdotdot: 'Strich Punkt Punkt',
            dashdot: 'Strich Punkt',
            solid: 'Durchgezogen'
        }
    },
    toolTip: {
        requirements: 'Elemente in Formen anzeigen',
        description: 'Visualisieren von Daten mit anpassbaren Formen.',
        title: 'Form'
    }
};
EJShape.Locale['en-AU'] = {
    basicSettings: {
        categoryName: 'Basic Settings',
        shapeType: 'Shapes',
        rotationAngle: 'Rotation Angle',
        starCount: 'Star Count',
        concavity: 'Concavity',
        arrowHeight: 'Arrow Height',
        arrowWidth: 'Arrow Width',
        fillColor: 'Fill Color',
        lineStyle: 'Line Style',
        shapeTypes: {
            ellipse: 'Ellipse',
            triangle: 'Triangle',
            rightAngleTriangle: 'Right Angle Triangle',
            rectangle: 'Rectangle',
            hexagon: 'Hexagon',
            pentagon: 'Pentagon',
            octagon: 'Octagon',
            star: 'Star',
            leftArrow: 'Left Arrow',
            rightArrow: 'Right Arrow',
            upArrow: 'Up Arrow',
            downArrow: 'Down Arrow'
        },
        lineStyles: {
            dashed: 'Dashed',
            dotted: 'Dotted',
            dashdotdot: 'Dash Dot Dot',
            dashdot: 'Dash Dot',
            solid: 'Solid'
        }
    },
    toolTip: {
        requirements: 'Display items in Shapes',
        description: 'Visualize data with customizable shapes.',
        title: 'Shape'
    }
};
EJShape.Locale['en-CA'] = {
    basicSettings: {
        categoryName: 'Basic Settings',
        shapeType: 'Shapes',
        rotationAngle: 'Rotation Angle',
        starCount: 'Star Count',
        concavity: 'Concavity',
        arrowHeight: 'Arrow Height',
        arrowWidth: 'Arrow Width',
        lineStyle: 'Line Style',
        fillColor: 'Fill Color',
        shapeTypes: {
            ellipse: 'Ellipse',
            triangle: 'Triangle',
            rightAngleTriangle: 'Right Angle Triangle',
            rectangle: 'Rectangle',
            hexagon: 'Hexagon',
            pentagon: 'Pentagon',
            octagon: 'Octagon',
            star: 'Star',
            leftArrow: 'Left Arrow',
            rightArrow: 'Right Arrow',
            upArrow: 'Up Arrow',
            downArrow: 'Down Arrow'
        },
        lineStyles: {
            dashed: 'Dashed',
            dotted: 'Dotted',
            dashdotdot: 'Dash Dot Dot',
            dashdot: 'Dash Dot',
            solid: 'Solid'
        }
    },
    toolTip: {
        requirements: 'Display items in Shapes',
        description: 'Visualize data with customizable shapes.',
        title: 'Shape'
    }
};
EJShape.Locale['en-ES'] = {
    basicSettings: {
        categoryName: 'Basic Settings',
        shapeType: 'Shapes',
        rotationAngle: 'Ángulo de Rotación',
        starCount: 'Conteo de estrellas',
        concavity: 'Concavidad',
        arrowHeight: 'Altura de la Flecha',
        arrowWidth: 'Ancho de la Flecha',
        fillColor: 'Color de Relleno',
        lineStyle: 'Estilo de línea',
        shapeTypes: {
            ellipse: 'Ellipse',
            triangle: 'Triángulo',
            rightAngleTriangle: 'Triángulo Rectángulo',
            rectangle: 'Rectángulo',
            hexagon: 'Hexágono',
            pentagon: 'Pentágono',
            octagon: 'Octágono',
            star: 'Estrella',
            leftArrow: 'Flecha Izquierda',
            rightArrow: 'Flecha Derecha',
            upArrow: 'Flecha Arriba',
            downArrow: 'Flecha Abajo',
        },
        lineStyles: {
            dashed: 'Guiones',
            dotted: 'Punteado',
            dashdotdot: 'Punto Guion Guion',
            dashdot: 'Punto Guion',
            solid: 'Sólido'
        }
    },
    toolTip: {
        requirements: 'Display items in Shapes',
        description: 'Visualize data with customizable shapes.',
        title: 'Shape'
    }
};
EJShape.Locale['fr-CA'] = {
    basicSettings: {
        categoryName: 'Paramètres de base',
        shapeType: 'Formes',
        rotationAngle: 'Angle de Rotation',
        starCount: 'Nombre d\'étoiles',
        concavity: 'Concavité',
        arrowHeight: 'Hauteur de la Flèche',
        arrowWidth: 'Largeur de la Flèche',
        lineStyle: 'Style de ligne',
        fillColor: 'Couleur de Remplissage',
        shapeTypes: {
            ellipse: 'Ellipse',
            triangle: 'Triangle',
            rightAngleTriangle: 'Triangle Rectangle',
            rectangle: 'Rectangle',
            hexagon: 'Hexagone',
            pentagon: 'Pentagone',
            octagon: 'Octogone',
            star: 'Étoile',
            leftArrow: 'Flèche Gauche',
            rightArrow: 'Flèche Droite',
            upArrow: 'Flèche Haut',
            downArrow: 'Flèche Bas'
        },
        lineStyles: {
            dashed: 'Tirets',
            dotted: 'Pointillés',
            dashdotdot: 'Tiret Point Point',
            dashdot: 'Tiret Point',
            solid: 'Solide'
        }
    },
    toolTip: {
        requirements: 'Afficher les éléments dans les Formes',
        description: 'Visualisez les données avec des formes personnalisables.',
        title: 'Forme'
    }
};
EJShape.Locale['fr-FR'] = {
    basicSettings: {
        shapeType: 'Formes',
        categoryName: 'Paramètres de base',
        rotationAngle: 'Angle de Rotation',
        starCount: 'Nombre d\'étoiles',
        concavity: 'Concavité',
        arrowHeight: 'Hauteur de la Flèche',
        arrowWidth: 'Largeur de la Flèche',
        fillColor: 'Couleur de Remplissage',
        lineStyle: 'Style de ligne',
        shapeTypes: {
            ellipse: 'Ellipse',
            triangle: 'Triangle',
            rightAngleTriangle: 'Triangle Rectangle',
            rectangle: 'Rectangle',
            hexagon: 'Hexagone',
            pentagon: 'Pentagone',
            octagon: 'Octogone',
            star: 'Étoile',
            leftArrow: 'Flèche Gauche',
            rightArrow: 'Flèche Droite',
            upArrow: 'Flèche Haut',
            downArrow: 'Flèche Bas',
        },
        lineStyles: {
            dashed: 'Tirets',
            dotted: 'Pointillés',
            dashdotdot: 'Tiret Point Point',
            dashdot: 'Tiret Point',
            solid: 'Solide'
        }
    },
    toolTip: {
        requirements: 'Afficher les éléments dans les Formes',
        description: 'Visualisez les données avec des formes personnalisables.',
        title: 'Forme'
    }
};
EJShape.Locale['it-IT'] = {
    basicSettings: {
        categoryName: 'Impostazioni di base',
        shapeType: 'Forme',
        rotationAngle: 'Angolo di Rotazione',
        starCount: 'Conteggio delle stelle',
        concavity: 'Concavità',
        arrowHeight: 'Altezza Freccia',
        arrowWidth: 'Larghezza Freccia',
        lineStyle: 'Stile di linea',
        fillColor: 'Colore di Riempimento',
        shapeTypes: {
            ellipse: 'Ellisse',
            triangle: 'Triangolo',
            rightAngleTriangle: 'Triangolo Rettangolo',
            rectangle: 'Rettangolo',
            hexagon: 'Esagono',
            pentagon: 'Pentagono',
            octagon: 'Ottagono',
            star: 'Stella',
            leftArrow: 'Freccia Sinistra',
            rightArrow: 'Freccia Destra',
            upArrow: 'Freccia Su',
            downArrow: 'Freccia Giù',
        },
        lineStyles: {
            dashed: 'Tratteggiato',
            dotted: 'Puntinato',
            dashdotdot: 'Trattino Punto Punto',
            dashdot: 'Trattino Punto',
            solid: 'Continuo'
        }
    }, toolTip: {
        requirements: 'Mostra elementi in Forme',
        description: 'Visualizza dati con forme personalizzabili.',
        title: 'Forma'
    }
};
EJShape.Locale['tr-TR'] = {
    basicSettings: {
        categoryName: 'Temel Ayarlar',
        shapeType: 'Şekiller',
        rotationAngle: 'Dönme Açısı',
        concavity: 'Konkavite',
        starCount: 'Yıldız Sayısı',
        arrowHeight: 'Ok Yüksekliği',
        arrowWidth: 'Ok Genişliği',
        lineStyle: 'Çizgi Stili',
        fillColor: 'Dolgu Rengi',
        shapeTypes: {
            ellipse: 'Elips',
            star: 'Yıldız',
            leftArrow: 'Sol Ok',
            rightArrow: 'Sağ Ok',
            upArrow: 'Yukarı Ok',
            downArrow: 'Aşağı Ok',
            rectangle: 'Dikdörtgen',
            hexagon: 'Altıgen',
            triangle: 'Üçgen',
            pentagon: 'Beşgen',
            octagon: 'Sekizgen',
            rightAngleTriangle: 'Dik Açılı Üçgen',
        },
        lineStyles: {
            dashdotdot: 'Kesik Çizgi Nokta Nokta',
            dashdot: 'Kesik Çizgi Nokta',
            solid: 'Düz',
            dashed: 'Kesik Çizgi',
            dotted: 'Nokta'
        }
    },
    toolTip: {
        requirements: 'Şekillerde öğeleri görüntüle',
        description: 'Özelleştirilebilir şekillerle veri görselleştirme.',
        title: 'Şekil'
    }
};
EJShape.Locale['zh-Hans'] = {
    basicSettings: {
        categoryName: '基本设置',
        shapeType: '形状',
        rotationAngle: '旋转角度',
        arrowHeight: '箭头高度',
        arrowWidth: '箭头宽度',
        starCount: '星星数',
        concavity: '凹度',
        lineStyle: '线条样式',
        fillColor: '填充颜色',
        shapeTypes: {
            ellipse: '椭圆',
            triangle: '三角形',
            rightAngleTriangle: '直角三角形',
            rectangle: '长方形',
            hexagon: '六边形',
            pentagon: '五边形',
            octagon: '八边形',
            star: '星形',
            leftArrow: '左箭头',
            rightArrow: '右箭头',
            upArrow: '上箭头',
            downArrow: '下箭头',
        },
        lineStyles: {
            dashed: '虚线',
            dotted: '点线',
            dashdotdot: '点划点线',
            dashdot: '点划线',
            solid: '实线'
        }
    },
    toolTip: {
        requirements: '显示形状中的项目',
        description: '使用可定制的形状来可视化数据。',
        title: '形状'
    }
};
EJShape.Locale['he-IL'] = {
    basicSettings: {
        categoryName: 'הגדרות בסיסיות',
        shapeType: 'צורות',
        rotationAngle: 'זווית סיבוב',
        starCount: 'מספר כוכבים',
        concavity: 'קיעור',
        arrowHeight: 'גובה חץ',
        arrowWidth: 'רוחב חץ',
        lineStyle: 'סגנון קו',
        fillColor: 'צבע מילוי',
        shapeTypes: {
            ellipse: 'אליפסה',
            triangle: 'משולש',
            rightAngleTriangle: 'משולש ישר זווית',
            rectangle: 'מלבן',
            hexagon: 'משושה',
            pentagon: 'מחומש',
            octagon: 'מתומן',
            star: 'כוכב',
            leftArrow: 'חץ שמאלה',
            rightArrow: 'חץ ימינה',
            upArrow: 'חץ למעלה',
            downArrow: 'חץ למטה'
        },
        lineStyles: {
            dashed: 'מקווקו',
            dotted: 'מנוקד',
            dashdotdot: 'קו מקו-נקודה-נקודה',
            dashdot: 'קו מקו-נקודה',
            solid: 'רציף'
        }
    },
    toolTip: {
        requirements: 'הצגת פריטים בצורות',
        description: 'הצגת נתונים באמצעות צורות מותאמות אישית.',
        title: 'צורה'
    }
};
EJShape.Locale['ja-JP'] = {
    basicSettings: {
        categoryName: '基本設定',
        shapeType: '図形',
        rotationAngle: '回転角度',
        starCount: '星の数',
        concavity: '凹み',
        arrowHeight: '矢印の高さ',
        arrowWidth: '矢印の幅',
        lineStyle: '線のスタイル',
        fillColor: '塗りつぶし色',
        shapeTypes: {
            ellipse: '楕円',
            triangle: '三角形',
            rightAngleTriangle: '直角三角形',
            rectangle: '長方形',
            hexagon: '六角形',
            pentagon: '五角形',
            octagon: '八角形',
            star: '星形',
            leftArrow: '左矢印',
            rightArrow: '右矢印',
            upArrow: '上矢印',
            downArrow: '下矢印'
        },
        lineStyles: {
            dashed: '破線',
            dotted: '点線',
            dashdotdot: 'ダッシュ・ドット・ドット',
            dashdot: 'ダッシュ・ドット',
            solid: '実線'
        }
    },
    toolTip: {
        requirements: '図形内の項目を表示',
        description: 'カスタマイズ可能な図形でデータを可視化します。',
        title: '図形'
    }
};
EJShape.Locale['pt-PT'] = {
    basicSettings: {
        categoryName: 'Configurações básicas',
        shapeType: 'Formas',
        rotationAngle: 'Ângulo de rotação',
        starCount: 'Contagem de estrelas',
        concavity: 'Concavidade',
        arrowHeight: 'Altura da seta',
        arrowWidth: 'Largura da seta',
        lineStyle: 'Estilo de linha',
        fillColor: 'Cor de preenchimento',
        shapeTypes: {
            ellipse: 'Elipse',
            triangle: 'Triângulo',
            rightAngleTriangle: 'Triângulo Retângulo',
            rectangle: 'Retângulo',
            hexagon: 'Hexágono',
            pentagon: 'Pentágono',
            octagon: 'Octógono',
            star: 'Estrela',
            leftArrow: 'Seta Esquerda',
            rightArrow: 'Seta Direita',
            upArrow: 'Seta Para Cima',
            downArrow: 'Seta Para Baixo'
        },
        lineStyles: {
            dashed: 'Tracejado',
            dotted: 'Pontilhado',
            dashdotdot: 'Traço Ponto Ponto',
            dashdot: 'Traço Ponto',
            solid: 'Sólido'
        }
    },
    toolTip: {
        requirements: 'Exibir itens em Formas',
        description: 'Visualize dados com formas personalizáveis.',
        title: 'Forma'
    }
};
EJShape.Locale['ru-RU'] = {
    basicSettings: {
        categoryName: 'Основные настройки',
        shapeType: 'Фигуры',
        rotationAngle: 'Угол вращения',
        starCount: 'Количество звезд',
        concavity: 'Вогнутость',
        arrowHeight: 'Высота стрелки',
        arrowWidth: 'Ширина стрелки',
        lineStyle: 'Стиль линии',
        fillColor: 'Цвет заливки',
        shapeTypes: {
            ellipse: 'Эллипс',
            triangle: 'Треугольник',
            rightAngleTriangle: 'Прямоугольный треугольник',
            rectangle: 'Прямоугольник',
            hexagon: 'Шестиугольник',
            pentagon: 'Пятиугольник',
            octagon: 'Восьмиугольник',
            star: 'Звезда',
            leftArrow: 'Левая стрелка',
            rightArrow: 'Правая стрелка',
            upArrow: 'Верхняя стрелка',
            downArrow: 'Нижняя стрелка'
        },
        lineStyles: {
            dashed: 'Пунктир',
            dotted: 'Точечная',
            dashdotdot: 'Тире точка точка',
            dashdot: 'Тире точка',
            solid: 'Сплошная'
        }
    },
    toolTip: {
        requirements: 'Показать элементы в фигурах',
        description: 'Визуализируйте данные с помощью настраиваемых фигур.',
        title: 'Фигура'
    }
};
EJShape.Locale['zh-Hant'] = {
    basicSettings: {
        categoryName: '基本設定',
        shapeType: '形狀',
        rotationAngle: '旋轉角度',
        starCount: '星數',
        concavity: '凹度',
        arrowHeight: '箭頭高度',
        arrowWidth: '箭頭寬度',
        lineStyle: '線條樣式',
        fillColor: '填充顏色',
        shapeTypes: {
            ellipse: '橢圓',
            triangle: '三角形',
            rightAngleTriangle: '直角三角形',
            rectangle: '長方形',
            hexagon: '六邊形',
            pentagon: '五邊形',
            octagon: '八邊形',
            star: '星形',
            leftArrow: '左箭頭',
            rightArrow: '右箭頭',
            upArrow: '上箭頭',
            downArrow: '下箭頭'
        },
        lineStyles: {
            dashed: '虛線',
            dotted: '點線',
            dashdotdot: '虛線點點',
            dashdot: '虛線點',
            solid: '實線'
        }
    },
    toolTip: {
        requirements: '顯示形狀中的項目',
        description: '使用可自訂的形狀來視覺化資料。',
        title: '形狀'
    }
};
