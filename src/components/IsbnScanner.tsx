import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5Qrcode, CameraDevice } from 'html5-qrcode';
import { Camera, RefreshCw, X, Shield, Sparkles, BookOpen, Layers, CheckCircle } from 'lucide-react';
import { Button } from './ui';
import { cn } from '@/src/lib/utils';
import { ScannerPrefillData, PRESET_BOOKS } from '@/src/lib/asuPresets';

interface IsbnScannerProps {
  onScanSuccess: (isbn: string, prefillData?: ScannerPrefillData) => void;
  onClose: () => void;
}

export const IsbnScanner: React.FC<IsbnScannerProps> = ({ onScanSuccess, onClose }) => {
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string>('');
  const [successCode, setSuccessCode] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  const qrCodeInstance = useRef<Html5Qrcode | null>(null);
  const SCAN_ELEMENT_ID = 'isbn-camera-reader';

  // Request cameras list and initialize scanner
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Default to the first back camera if available, otherwise first device
          const backCamera = devices.find(d => d.label.toLowerCase().includes('back') || d.label.toLowerCase().includes('environment'));
          setSelectedCameraId(backCamera ? backCamera.id : devices[0].id);
        } else {
          setErrorStatus('No camera devices found. Ensure hardware is plugged in and authorized.');
        }
      })
      .catch((err) => {
        console.warn('IsbnScanner: Camera list permission resolution:', err);
        const errString = String(err);
        if (errString.includes('Permission') || errString.includes('denied') || errString.includes('dismissed') || errString.includes('NotAllowedError')) {
          setErrorStatus('Camera hardware permissions were denied or dismissed. If you are using the app within an iframe sandbox window, Chrome/Firefox security layers often block native camera requests. You can open the app in a new tab using the expand button on the top right to grant access, or instantly click any of the custom books in the digital registry on the right to simulate scanning.');
        } else {
          setErrorStatus(`Camera access could not be established: ${errString}. Please verify hardware or choose from the ready-made simulator templates listed in the registry.`);
        }
      });

    return () => {
      stopCameraScan();
    };
  }, []);

  const startCameraScan = async (cameraId: string) => {
    if (!cameraId) return;
    setErrorStatus('');
    setSuccessCode('');
    
    // Stop any existing scanner first
    await stopCameraScan();

    const scanner = new Html5Qrcode(SCAN_ELEMENT_ID);
    qrCodeInstance.current = scanner;

    setIsScanning(true);

    try {
      await scanner.start(
        cameraId,
        {
          fps: 60,
          // Support standard wide barcodes as well as QR codes
          qrbox: (width, height) => {
            const desiredWidth = Math.min(width * 0.85, 400);
            const desiredHeight = Math.min(height * 0.45, 180); // Rectangular for barcodes
            return { width: desiredWidth, height: desiredHeight };
          },
          aspectRatio: 1.777778, // 16:9 box is better for barcodes
        },
        (decodedText) => {
          // Success callback
          handleScanValue(decodedText);
        },
        () => {
          // Keep searching silently
        }
      );
    } catch (err: any) {
      console.warn('IsbnScanner: Failed to start camera', err);
      setIsScanning(false);
      setErrorStatus(`Camera startup failed: ${err.message || err}.`);
    }
  };

  const stopCameraScan = async () => {
    if (qrCodeInstance.current) {
      if (qrCodeInstance.current.isScanning) {
        try {
          await qrCodeInstance.current.stop();
        } catch (err) {
          console.warn("IsbnScanner: Error stopping scanner instance", err);
        }
      }
      qrCodeInstance.current = null;
    }
    setIsScanning(false);
  };

  // Toggle camera active state
  const toggleCameraActive = () => {
    if (isScanning) {
      stopCameraScan();
    } else {
      if (selectedCameraId) {
        startCameraScan(selectedCameraId);
      }
    }
  };

  // Process any scanned value
  const handleScanValue = (value: string) => {
    // Play light tone if supported
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}

    setSuccessCode(value);
    stopCameraScan();

    // Check if the barcode matches any of our known ASU presets to auto prefill
    const matchingPreset = PRESET_BOOKS.find(book => 
      book.isbn.replace(/[-\s]/g, '') === value.replace(/[-\s]/g, '')
    );

    // Call callback with small delay for lovely transition
    setTimeout(() => {
      onScanSuccess(value, matchingPreset);
    }, 800);
  };

  // Simulate scanning of an ASU pre-defined database book
  const handleSimulatePreset = (preset: ScannerPrefillData) => {
    if (isSimulating) return;
    stopCameraScan();
    setIsSimulating(true);
    setSimulatedProgress(0);

    // Simulated scanning visual timeline adjusted for high-refresh 120Hz Displays
    const interval = setInterval(() => {
      setSimulatedProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleScanValue(preset.isbn);
          setIsSimulating(false);
          return 100;
        }
        return Math.min(100, prev + 0.8); // Increment smoothly at 8.33ms intervals (exactly matching 120Hz display refreshes)
      });
    }, 8.33);
  };

  return (
    <div className="absolute inset-0 z-[120] flex flex-col bg-zinc-950/95 backdrop-blur-md p-4 sm:p-8 max-h-full overflow-y-auto custom-scrollbar">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-noir-border/10 pb-4 mb-6 shrink-0">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-cyan flex items-center gap-2">
            <Shield size={14} className="text-cyan animate-pulse" />
            NCISM ISBN Scanner Panel
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1">Capture textbook barcodes instantly or select central pre-set templates below.</p>
        </div>
        <button 
          onClick={() => {
            stopCameraScan();
            onClose();
          }} 
          className="rounded-full p-2 text-zinc-400 hover:bg-black/60 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Grid: Live Scanning + Simulator Database */}
      <div className="grid gap-6 lg:grid-cols-12 flex-1">
        
        {/* Left Column: Live camera view with glow frame */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="relative overflow-hidden rounded-[24px] border border-noir-border/30 bg-black/80 aspect-[1.5] flex flex-col items-center justify-center group shadow-inner">
            
            {/* The Target scanning grid element */}
            <div id={SCAN_ELEMENT_ID} className="w-full h-full bg-black/20" />

            {/* Simulated Laser guides / Overlay */}
            {(!isScanning && !isSimulating && !successCode) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/60 pointer-events-none">
                <Camera size={44} className="text-zinc-600 mb-3 group-hover:text-cyan transition-colors" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Camera Feed is Offline</span>
                <p className="text-[10px] text-zinc-500 mt-1 max-w-xs">Activate your device camera to read EAN-13 barcodes printed on physical books.</p>
              </div>
            )}

            {/* Simulated laser scanline */}
            {(isScanning || isSimulating) && (
              <div className="absolute inset-x-0 w-full height-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] pointer-events-none animate-[scanLaser_2.5s_infinite_ease-in-out]" />
            )}

            {/* Target Reticle Frame overlays */}
            <div className="absolute top-6 left-6 w-5 h-5 border-t-2 border-l-2 border-cyan pointer-events-none" />
            <div className="absolute top-6 right-6 w-5 h-5 border-t-2 border-r-2 border-cyan pointer-events-none" />
            <div className="absolute bottom-6 left-6 w-5 h-5 border-b-2 border-l-2 border-cyan pointer-events-none" />
            <div className="absolute bottom-6 right-6 w-5 h-5 border-b-2 border-r-2 border-cyan pointer-events-none" />

            {/* Simulation Overlay progress */}
            <AnimatePresence>
              {isSimulating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 p-6 text-center"
                >
                  <Sparkles size={36} className="text-cyan animate-pulse mb-3" />
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan">Decoding Prefill ASU Records</span>
                  <div className="w-48 h-1.5 bg-zinc-900 border border-noir-border/10 rounded-full overflow-hidden mt-3 max-w-full">
                    <motion.div 
                      className="bg-cyan h-full shadow-[0_0_8px_rgba(34,211,238,0.5)]" 
                      animate={{ width: `${simulatedProgress}%` }}
                      transition={{ type: "tween", ease: "linear", duration: 0.00833 }}
                    />
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500 mt-2">ISBN CHECK: OK • STATUS: MATCHING</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Animation overlay */}
            <AnimatePresence>
              {successCode && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-950/90 p-6 text-center"
                >
                  <CheckCircle size={44} className="text-emerald-400 animate-bounce mb-3" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">ISBN Validated ✓</span>
                  <p className="text-[10px] text-zinc-300 font-mono mt-1 select-all">{successCode}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Camera controls & Selector */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full bg-black/40 border border-noir-border/20 rounded-xl px-3 py-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 shrink-0">Source Camera:</span>
              <select
                value={selectedCameraId}
                onChange={(e) => {
                  setSelectedCameraId(e.target.value);
                  if (isScanning) startCameraScan(e.target.value);
                }}
                disabled={cameras.length === 0}
                className="bg-transparent border-0 text-white outline-none font-medium truncate max-w-xs text-[10px] font-bold uppercase tracking-wider text-right w-full cursor-pointer"
              >
                {cameras.length > 0 ? (
                  cameras.map((cam) => (
                    <option key={cam.id} value={cam.id} className="bg-zinc-900 text-white">
                      {cam.label || `Camera ${cam.id.substring(0, 5)}...`}
                    </option>
                  ))
                ) : (
                  <option value="" className="text-zinc-600 font-sans">No Camera Selected</option>
                )}
              </select>
            </div>
            
            <Button
              type="button"
              onClick={toggleCameraActive}
              disabled={isSimulating || cameras.length === 0}
              className={cn(
                "h-11 px-6 rounded-xl text-xs font-bold uppercase tracking-widest w-full sm:w-auto shrink-0 gap-2 font-mono border",
                isScanning 
                  ? "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20" 
                  : "bg-cyan-500/10 text-cyan border-cyan-500/20 hover:bg-cyan-500/20"
              )}
            >
              <RefreshCw size={12} className={cn("shrink-0", isScanning && "animate-spin")} />
              {isScanning ? 'TURN OFF CAMERA' : 'ACTIVATE CAMERA'}
            </Button>
          </div>

          {errorStatus && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-[10px]/normal text-zinc-400 flex items-start gap-2.5">
              <span className="h-4 w-4 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center font-bold font-mono text-[9px] shrink-0">!</span>
              <div>
                <span className="font-bold text-red-400">Device Alert: </span>
                {errorStatus}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pre-validated Curriculum Database Presets */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 px-1 shrink-0">
            <BookOpen size={12} className="text-purple-400" />
            Curriculum Registry Presets (Instant Simulations)
          </span>
          
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] lg:max-h-[380px] pr-1 custom-scrollbar">
            {PRESET_BOOKS.map((book) => (
              <button
                key={book.isbn}
                type="button"
                onClick={() => handleSimulatePreset(book)}
                disabled={isSimulating}
                className="w-full text-left bg-black/40 border border-noir-border/10 rounded-2xl p-4 hover:border-cyan/40 hover:bg-zinc-900/40 transition-all flex items-start gap-3 select-none cursor-pointer group"
              >
                <div className="w-12 h-16 rounded-lg bg-zinc-900 overflow-hidden border border-noir-border/20 shrink-0 relative flex items-center justify-center text-zinc-700">
                  {book.coverUrl ? (
                    <img 
                      src={book.coverUrl} 
                      alt={book.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <BookOpen size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-purple-400 font-mono">
                      {book.system}
                    </span>
                    <span className="text-[8px] font-mono text-zinc-500 truncate">{book.subject}</span>
                  </div>
                  <h4 className="font-serif text-sm font-bold text-white truncate mt-1 group-hover:text-cyan transition-colors">{book.title}</h4>
                  <p className="text-[9px] text-zinc-400 truncate mt-0.5">{book.author} / {book.publisher}</p>
                  <p className="text-[8px] font-mono text-zinc-500 mt-2 border-t border-noir-border/5 pt-1 flex items-center justify-between">
                    <span>ISBN: {book.isbn}</span>
                    <span className="text-cyan font-bold uppercase group-hover:underline">Simulate Scan →</span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Laser beam style definitions */}
      <style>{`
        @keyframes scanLaser {
          0%, 100% { top: 12%; }
          50% { top: 88%; }
        }
      `}</style>
    </div>
  );
};
