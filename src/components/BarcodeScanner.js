// src/components/BarcodeScanner.js
import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';

const BarcodeScanner = ({ onScanSuccess, onScanError, autoStart = false, hideControls = false }) => {
  const webcamRef = useRef(null);
  const scanningRef = useRef(false);
  const [isScanning, setIsScanning] = useState(autoStart);

  const videoConstraints = {
    facingMode: 'environment'
  };

  const decodeBarcode = (imageData) => {
    try {
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        console.log('Found QR code', code.data);
        if (onScanSuccess) {
          onScanSuccess({
            category: 'food',
            type: 'vegetables',
            amount: 0.5,
            footprint: 1.0
          });
        }
        // Stop scanning
        scanningRef.current = false;
        setIsScanning(false);
      }
    } catch (err) {
      console.error('decodeBarcode error', err);
      if (onScanError) onScanError(err);
    }
  };

  const capture = () => {
    try {
      if (!scanningRef.current) return;
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          const image = new Image();
          image.src = imageSrc;
          image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext('2d');
            context.drawImage(image, 0, 0, image.width, image.height);
            const imageData = context.getImageData(0, 0, image.width, image.height);
            decodeBarcode(imageData);
          };
        }
      }
    } catch (err) {
      console.error('capture error', err);
      if (onScanError) onScanError(err);
    } finally {
      if (scanningRef.current) requestAnimationFrame(capture);
    }
  };

  useEffect(() => {
    if (isScanning) {
      scanningRef.current = true;
      requestAnimationFrame(capture);
    } else {
      scanningRef.current = false;
    }
    return () => { scanningRef.current = false; };
  }, [isScanning]);

  const startScan = () => setIsScanning(true);
  const stopScan = () => { scanningRef.current = false; setIsScanning(false); };

  return (
    <div className="flex flex-col items-center">
      {!hideControls && (
        <button 
          onClick={isScanning ? stopScan : startScan}
          className={`px-4 py-2 rounded font-bold transition-colors ${
            isScanning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          } text-white`}
        >
          {isScanning ? 'Stop Scan' : 'Start Barcode Scanner'}
        </button>
      )}
      {isScanning && (
        <div className="mt-4 border-2 border-green-500 rounded-lg overflow-hidden">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
          />
        </div>
      )}
    </div>
  );
};

export default BarcodeScanner;