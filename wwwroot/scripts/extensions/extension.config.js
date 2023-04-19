var dataExtensions = [];
var cloudDataExtensions = [];
var itemExtensions = [{
        name: 'barcode',
        className: 'EJBarcode',
        imageClass: 'customitem-barcode',
        displayName: '1D Barcode',
        category: 'Barcodes',
        toolTip: {
            requirements: 'Add a report item to the designer area.',
            description: 'Display the barcode lines as report item.',
            title: 'Barcode'
        }
    }, {
        name: 'matrixbarcode',
        className: 'EJQRBarcode',
        imageClass: 'customitem-qrbarcode',
        displayName: '2D Barcode',
        category: 'Barcodes',
        toolTip: {
            requirements: 'Add a report item to the designer area.',
            description: 'Display the barcode lines as report item.',
            title: '2D Barcode'
        }
    }];
