// src/components/BarcodeScanner.js
import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';

const BarcodeScanner = ({ onScanSuccess, onScanError }) => {
  const webcamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  const videoConstraints = {
    facingMode: 'environment'
  };

  const decodeBarcode = (imageData) => {
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: "dontInvert",
    });

    if (code) {
      console.log("Found QR code", code.data);
      onScanSuccess({
        category: "food",
        type: "vegetables",
        amount: 0.5,
        footprint: 1.0
      });
      setIsScanning(false);
    }
  };

  const capture = () => {
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
    requestAnimationFrame(capture);
  };

  useEffect(() => {
    if (isScanning) {
      requestAnimationFrame(capture);
    }
  }, [isScanning]);

  const startScan = () => {
    setIsScanning(true);
  };

  const stopScan = () => {
    setIsScanning(false);
  };

  return (
    <div className="flex flex-col items-center">
      <button 
        onClick={isScanning ? stopScan : startScan}
        className={`px-4 py-2 rounded font-bold transition-colors ${
          isScanning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
        } text-white`}
      >
        {isScanning ? 'Stop Scan' : 'Start Barcode Scanner'}
      </button>
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