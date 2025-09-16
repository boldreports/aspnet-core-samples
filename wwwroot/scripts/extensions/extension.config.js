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
    },
    {
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
    },
    {
        name: 'ESignature',
        className: 'EJSignature',
        imageClass: 'customitem-signature',
        displayName: 'Electronic',
        category: 'Signatures',
        toolTip: {
            requirements: 'Add a report item to the designer area.',
            description: 'This report item is used to add a graphic signature.',
            title: 'Electronic'
        }
    },
    {
        name: 'PDFSignature',
        className: 'EJPDFSignature',
        imageClass: 'customitem-pdfsignature',
        displayName: 'PDF',
        category: 'Signatures',
        toolTip: {
            requirements: 'Add a report item to the designer area.',
            description: 'This report item is used to add a digital PDF signature.',
            title: 'PDF'
        }
    },
    {
        name: 'Shape',
        className: 'EJShape',
        imageClass: 'customitem-shape',
        displayName: 'Shape',
        category: 'Shapes',
        toolTip: {
            requirements: 'Add a report item to the designer area',
            description: 'Display the different types of shapes as report item',
            title: 'Shapes'
        }
    },
    {
        name: 'pdfdocument',
        className: 'EJPdfDocument',
        imageClass: 'customitem-pdfdocument',
        displayName: 'PDF',
        category: 'Documents',
        toolTip: {
            requirements: 'Add a report item to the designer area.',
            description: 'Display the pdf document content in the report',
            title: 'PDF'
        },
        allowHeaderFooter: false
    },
    {
        name: 'htmldocument',
        className: 'EJHtmlDocument',
        imageClass: 'customitem-htmldocument',
        displayName: 'Html',
        category: 'Documents',
        toolTip: {
            requirements: 'Add a report item to the designer area.',
            description: 'This report item used to process the html markup text and url',
            title: 'Html'
        }
    }];
