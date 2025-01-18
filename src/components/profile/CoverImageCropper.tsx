import React, { useState, useEffect } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X } from 'lucide-react';
import { Button } from '../common/Button';

interface CoverImageCropperProps {
  imageUrl: string;
  onCrop: (croppedImage: Blob) => Promise<void>;
  onCancel: () => void;
}

export const CoverImageCropper: React.FC<CoverImageCropperProps> = ({
  imageUrl,
  onCrop,
  onCancel,
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 100,
    height: 33.33, // 3:1 aspect ratio
    x: 0,
    y: 33.33, // Start from the middle
  });
  const [imageRef, setImageRef] = useState<HTMLImageElement | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const getCroppedImg = async () => {
    if (!imageRef) return null;

    const canvas = document.createElement('canvas');
    const scaleX = imageRef.naturalWidth / imageRef.width;
    const scaleY = imageRef.naturalHeight / imageRef.height;
    canvas.width = (crop.width * imageRef.width) / 100;
    canvas.height = (crop.height * imageRef.height) / 100;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    ctx.drawImage(
      imageRef,
      (crop.x * imageRef.width) / 100 * scaleX,
      (crop.y * imageRef.height) / 100 * scaleY,
      (crop.width * imageRef.width) / 100 * scaleX,
      (crop.height * imageRef.height) / 100 * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg', 0.9);
    });
  };

  const handleCrop = async () => {
    try {
      setSubmitting(true);
      const croppedImage = await getCroppedImg();
      if (croppedImage) {
        await onCrop(croppedImage);
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 w-full max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-white">Crop Cover Image</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={submitting}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            aspect={3}
            className="max-h-[60vh] overflow-hidden rounded-lg"
            minHeight={33.33}
          >
            <img
              src={imageUrl}
              onLoad={(e) => setImageRef(e.currentTarget)}
              alt="Cover"
              className="max-w-full"
            />
          </ReactCrop>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            variant="secondary" 
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCrop}
            isLoading={submitting}
          >
            Save Crop
          </Button>
        </div>
      </div>
    </div>
  );
};