"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ChevronLeft, Camera, Upload, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui";
import { Suspense } from "react";

const UPLOAD_TIPS = [
  "Face clearly visible",
  "Good, even lighting",
  "Front-facing photo",
  "Neutral expression",
];

function UploadForm() {
  const router = useRouter();
  const params = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const MAX_SIZE_MB = 10;

  const handleFile = (file: File) => {
    setError(null);
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Photo must be under ${MAX_SIZE_MB}MB.`);
      return;
    }
    // Revoke any previous blob URL before creating a new one
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    const url = URL.createObjectURL(file);
    blobUrlRef.current = url;
    setPreview(url);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleRetake = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setPreview(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleUsePhoto = () => {
    const query = new URLSearchParams(params.toString());
    // In RVI-13, we'll upload the actual file here. For now, navigate with mock flag.
    query.set("mock", "1");
    router.push(`/analyzing?${query}`);
  };

  return (
    <main className="min-h-screen bg-surface-bg flex flex-col px-4 py-6">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1 text-content-secondary text-sm mb-6 -ml-1"
      >
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      {!preview ? (
        <>
          <h1 className="text-2xl font-bold text-content-primary mb-1">Upload a photo</h1>
          <p className="text-content-secondary text-sm mb-6">
            For the best results, follow these tips:
          </p>

          {/* Tips */}
          <ul className="bg-white rounded-card shadow-card p-4 mb-8 space-y-2">
            {UPLOAD_TIPS.map((tip) => (
              <li key={tip} className="flex items-center gap-2 text-sm text-content-primary">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary flex-shrink-0" />
                {tip}
              </li>
            ))}
          </ul>

          {/* Hidden inputs */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={onFileChange}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/heic"
            className="hidden"
            onChange={onFileChange}
          />

          <div className="flex flex-col gap-3 mb-6">
            <Button fullWidth onClick={() => cameraInputRef.current?.click()}>
              <Camera className="w-4 h-4 mr-2" /> Take Photo
            </Button>
            <Button fullWidth variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" /> Upload from Gallery
            </Button>
          </div>

          {error && (
            <p className="text-feedback-warning text-sm text-center">{error}</p>
          )}

          {/* Privacy assurance */}
          <div className="flex items-center justify-center gap-1.5 mt-4">
            <Shield className="w-3.5 h-3.5 text-content-secondary" />
            <p className="text-xs text-content-secondary">
              Your photo is used only for analysis.
            </p>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-content-primary mb-6">
            Does this look good?
          </h1>

          {/* Preview */}
          <div className="relative w-full aspect-[3/4] rounded-card overflow-hidden mb-6 shadow-card">
            <Image src={preview} alt="Your photo preview" fill className="object-cover" />
          </div>

          <div className="flex flex-col gap-3">
            <Button fullWidth onClick={handleUsePhoto}>
              Use This Photo
            </Button>
            <Button fullWidth variant="secondary" onClick={handleRetake}>
              <RefreshCw className="w-4 h-4 mr-2" /> Retake
            </Button>
          </div>
        </>
      )}
    </main>
  );
}

export default function UploadPage() {
  return (
    <Suspense>
      <UploadForm />
    </Suspense>
  );
}
