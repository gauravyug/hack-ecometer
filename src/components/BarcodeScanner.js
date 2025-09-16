// src/components/BarcodeScanner.js
import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import { productDatabase } from '../utils/productDatabase';

const BarcodeScanner = ({ onScanSuccess, onScanError }) => {
  const [showScanner, setShowScanner] = useState(false);

  const handleScan = (data) => {
    if (data && data.text) {
      const product = productDatabase[data.text];
      if (product) {
        // We found a product!
        onScanSuccess(product);
        setShowScanner(false); // Hide the scanner
      } else {
        const notFoundError = "Product not found in database.";
        onScanError(notFoundError);
      }
    }
  };

  const handleError = (err) => {
    console.error(err);
    onScanError('Failed to access camera.');
  };

  if (!showScanner) {
    return (
      <div className="text-center p-4">
        <button
          onClick={() => setShowScanner(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          Scan Barcode
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center">
      <h3 className="text-xl font-bold mb-4">Scan a Barcode</h3>
      <div className="w-full max-w-sm">
        <QrScanner
          delay={300}
          onError={handleError}
          onScan={handleScan}
          style={{ width: '100%' }}
        />
      </div>
      <button
        onClick={() => setShowScanner(false)}
        className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
      >
        Close Scanner
      </button>
    </div>
  );
};

export default BarcodeScanner;