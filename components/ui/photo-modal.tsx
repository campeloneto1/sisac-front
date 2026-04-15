"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl?: string | null;
  fallbackText: string;
  alt: string;
}

export function PhotoModal({
  isOpen,
  onClose,
  photoUrl,
  fallbackText,
  alt,
}: PhotoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <div className="flex items-center justify-center p-4">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={alt}
              className="max-h-[70vh] w-auto rounded-lg object-contain"
            />
          ) : (
            <Avatar className="h-64 w-64">
              <AvatarImage src={photoUrl ?? undefined} alt={alt} />
              <AvatarFallback className="text-6xl">
                {fallbackText}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
