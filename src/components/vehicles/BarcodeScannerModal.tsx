"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, Upload, X, AlertCircle, Loader2, Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  MultiFormatReader,
  BarcodeFormat,
  DecodeHintType,
  BinaryBitmap,
  HybridBinarizer,
  HTMLCanvasElementLuminanceSource,
} from "@zxing/library";

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
  const [statusMessage, setStatusMessage] = useState<string>(
    "Point camera at VIN barcode or upload a photo"
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const zxingReaderRef = useRef<MultiFormatReader | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const isFrameProcessingRef = useRef<boolean>(false);

  useEffect(() => {
    setMounted(true);
    // Initialize ZXing hints and reader
    const hints = new Map<DecodeHintType, any>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_39,
      BarcodeFormat.CODE_128,
      BarcodeFormat.DATA_MATRIX,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.PDF_417,
      BarcodeFormat.UPC_A,
      BarcodeFormat.EAN_13,
      BarcodeFormat.ITF,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const reader = new MultiFormatReader();
    reader.setHints(hints);
    zxingReaderRef.current = reader;

    return () => {
      stopCamera();
    };
  }, []);

  // Clean / extract 17-char VIN candidate
  const extractValidVin = (rawText: string): string | null => {
    if (!rawText) return null;
    const upper = rawText.toUpperCase().trim();

    // Standard 17-char VIN matching (excludes letters I, O, Q which are invalid in VIN standard)
    const strictMatch = upper.match(/[A-HJ-NPR-Z0-9]{17}/);
    if (strictMatch) {
      return strictMatch[0];
    }

    // Fallback: any 17 alphanumeric sequence
    const cleaned = upper.replace(/[^A-Z0-9]/g, "");
    const genericMatch = cleaned.match(/[A-Z0-9]{17}/);
    if (genericMatch) {
      return genericMatch[0];
    }

    if (cleaned.length === 17) {
      return cleaned;
    }

    return null;
  };

  // Stop camera stream & scanner
  const stopCamera = () => {
    isScanningRef.current = false;
    isFrameProcessingRef.current = false;
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const triggerSuccess = (detectedVin: string) => {
    isScanningRef.current = false;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(100);
      } catch {}
    }
    stopCamera();
    onVinDetected(detectedVin);
    onClose();
  };

  // Process a single video frame or canvas snapshot
  const scanCanvas = (canvas: HTMLCanvasElement): string | null => {
    if (!zxingReaderRef.current || !canvas || canvas.width === 0 || canvas.height === 0) {
      return null;
    }
    try {
      const luminanceSource = new HTMLCanvasElementLuminanceSource(canvas);
      const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));
      const result = zxingReaderRef.current.decode(binaryBitmap);
      if (result) {
        return extractValidVin(result.getText());
      }
    } catch {
      // Cleanly ignore not found or format errors during normal video scanning
    }
    return null;
  };

  // Start camera stream and scanner
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
        await videoRef.current.play().catch(() => {});
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

  // Live video frame barcode detection
  const startLiveDetection = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    isScanningRef.current = true;
    isFrameProcessingRef.current = false;

    scanIntervalRef.current = setInterval(async () => {
      if (!isScanningRef.current || isFrameProcessingRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
        return;
      }
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        return;
      }

      isFrameProcessingRef.current = true;

      try {
        // 1. Try Native BarcodeDetector if available
        if ("BarcodeDetector" in window) {
          try {
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
            const barcodes = await detector.detect(video);
            if (barcodes && barcodes.length > 0) {
              for (const b of barcodes) {
                const detected = extractValidVin(b.rawValue);
                if (detected) {
                  triggerSuccess(detected);
                  return;
                }
              }
            }
          } catch {
            // Fall through to ZXing
          }
        }

        // 2. ZXing canvas decoder
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const detected = scanCanvas(canvas);
          if (detected) {
            triggerSuccess(detected);
            return;
          }
        }
      } catch {
        // Ignore live stream frame errors
      } finally {
        isFrameProcessingRef.current = false;
      }
    }, 200);
  };

  // Photo upload detection with dual-engine fallback (iOS / Android / Desktop)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setCameraError(null);
    setStatusMessage("Scanning barcode from image...");

    try {
      // Attempt 1: Native BarcodeDetector on image bitmap
      if ("BarcodeDetector" in window) {
        try {
          const bitmap = await createImageBitmap(file);
          const detector = new (window as any).BarcodeDetector({
            formats: ["code_128", "code_39", "data_matrix", "qr_code", "pdf417", "upc_a"],
          });
          const barcodes = await detector.detect(bitmap);
          if (barcodes && barcodes.length > 0) {
            for (const b of barcodes) {
              const detected = extractValidVin(b.rawValue);
              if (detected) {
                triggerSuccess(detected);
                return;
              }
            }
          }
        } catch {
          // next fallback
        }
      }

      // Attempt 2: ZXing canvas decoder on loaded image
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load image file"));
        img.src = objectUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext("2d");
      if (ctx && canvas.width > 0 && canvas.height > 0) {
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(objectUrl);
        const detected = scanCanvas(canvas);
        if (detected) {
          triggerSuccess(detected);
          return;
        }
      } else {
        URL.revokeObjectURL(objectUrl);
      }

      throw new Error(
        "Could not detect a standard 17-digit VIN barcode or QR code in this photo. Make sure the barcode is clear and well-lit, or type the VIN manually."
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        aria-label="Scan VIN Barcode"
        className="w-full max-w-md rounded-2xl border border-border/80 bg-card p-5 shadow-2xl space-y-4 z-[9999]"
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-3 space-y-0 text-left">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">Scan VIN Barcode</DialogTitle>
              <p className="text-xs text-muted-foreground">
                Door sticker, windshield, or vehicle barcode
              </p>
            </div>
          </div>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}
