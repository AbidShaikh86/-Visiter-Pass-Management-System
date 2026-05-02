import { useEffect, useRef } from 'react';
// Importing Html5QrcodeScanner
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScanner = ({ onScanSuccess }) => {
    // Ref for the scanner
    const scannerRef = useRef(null);

    useEffect(() => {
        // Initializing the QR code scanner
        const scanner = new Html5QrcodeScanner('reader', {
            fps: 10,
            qrbox: { width: 250, height: 250 },
        });

        return () => {
            // Clearing the scanner on component
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, [onScanSuccess]);

    return (
        <div>
            <div id="reader"></div>
        </div>
    );
};

export default QRScanner;
