"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Camera, Upload, X, AlertCircle, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVinDetected: (vin: string) => void;
}

export function BarcodeScannerModal({
  isOpen,
  onClose,
  onVinDetected,
}: BarcodeScannerModalProps) {
  const [mounted, setMounted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("Point camera at VIN barcode or upload a photo");
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Stop camera stream
  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Start camera stream
  const startCamera = async () => {
    setCameraError(null);
    setStatusMessage("Opening camera...");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setStatusMessage("Align the vehicle's barcode inside the frame");
      startLiveDetection();
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      setCameraError(
        "Could not access camera. You can still upload a photo of the barcode or door sticker below."
      );
      setStatusMessage("Upload an image of the barcode");
    }
  };

  // Clean / extract 17-char VIN candidate
  const extractValidVin = (rawText: string): string | null => {
    if (!rawText) return null;
    const cleaned = rawText.toUpperCase().replace(/[^A-Z0-9]/g, "");
    
    // Look for exact 17 character alphanumeric string
    const match = cleaned.match(/[A-HJ-NPR-Z0-9]{17}/);
    if (match) return match[0];

    // If 17 chars long
    if (cleaned.length === 17) return cleaned;

    return null;
  };

  // Live video frame barcode detection
  const startLiveDetection = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    scanIntervalRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current) return;
      if (videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) return;

      try {
        if ("BarcodeDetector" in window) {
          const detector = new (window as any).BarcodeDetector({
            formats: [
              "code_128",
              "code_39",
              "data_matrix",
              "qr_code",
              "pdf417",
              "upc_a",
            ],
          });
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes && barcodes.length > 0) {
            for (const b of barcodes) {
              const detected = extractValidVin(b.rawValue);
              if (detected) {
                stopCamera();
                onVinDetected(detected);
                onClose();
                return;
              }
            }
          }
        }
      } catch (e) {
        // scan catch
      }
    }, 400);
  };

  // Photo upload detection fallback
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setCameraError(null);
    setStatusMessage("Scanning barcode from image...");

    try {
      const bitmap = await createImageBitmap(file);

      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({
          formats: ["code_128", "code_39", "data_matrix", "qr_code", "pdf417"],
        });
        const barcodes = await detector.detect(bitmap);
        if (barcodes && barcodes.length > 0) {
          for (const b of barcodes) {
            const detected = extractValidVin(b.rawValue);
            if (detected) {
              stopCamera();
              onVinDetected(detected);
              onClose();
              return;
            }
          }
        }
      }

      throw new Error(
        "Could not detect a standard 17-digit VIN barcode in this photo. Make sure the barcode is clear and well-lit, or type the VIN manually."
      );
    } catch (err: any) {
      setCameraError(err.message || "Failed to scan barcode from uploaded image.");
      setStatusMessage("Scan failed. Try another photo or enter VIN manually.");
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    stopCamera();
    onClose();
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in-0 duration-150"
      onClick={handleClose}
    >
      <div
        className="relative z-[10000] w-full max-w-md rounded-2xl border border-border/80 bg-card p-5 shadow-2xl space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Scan VIN Barcode</h2>
              <p className="text-xs text-muted-foreground">Door sticker, windshield, or vehicle barcode</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status / Alert */}
        {cameraError ? (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{cameraError}</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-muted/60 p-2 text-xs text-muted-foreground font-medium">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Video Viewport & Scanning Overlay */}
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black flex items-center justify-center border border-border/80">
          <video
            ref={videoRef}
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Targeted Scanner Reticle Overlay */}
          {!cameraError && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
              <div className="relative h-28 w-full border-2 border-dashed border-primary/80 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
                <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-primary shadow-[0_0_8px_#3b82f6] animate-pulse" />
              </div>
            </div>
          )}

          {isProcessingImage && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white text-xs">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span>Analyzing barcode image...</span>
            </div>
          )}
        </div>

        {/* Actions (Take Photo / Upload Image / Retry) */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            capture="environment"
            onChange={handleFileUpload}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            className="flex-1 text-xs gap-1.5 h-9 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Take Photo / Upload Image</span>
          </Button>

          {cameraError && (
            <Button
              type="button"
              variant="default"
              className="text-xs gap-1.5 h-9 cursor-pointer"
              onClick={startCamera}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Camera</span>
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            className="text-xs h-9 text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
