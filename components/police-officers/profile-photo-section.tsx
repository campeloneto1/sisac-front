"use client";

import { useState } from "react";
import Image from "next/image";

import {
  useUploadPoliceOfficerProfilePhotoMutation,
  useDeletePoliceOfficerProfilePhotoMutation,
} from "@/hooks/use-police-officer-mutations";
import type { PoliceOfficerItem } from "@/types/police-officer.type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfilePhotoSectionProps {
  policeOfficer: PoliceOfficerItem;
}

export function ProfilePhotoSection({ policeOfficer }: ProfilePhotoSectionProps) {
  const uploadMutation = useUploadPoliceOfficerProfilePhotoMutation();
  const deleteMutation = useDeletePoliceOfficerProfilePhotoMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      return;
    }

    await uploadMutation.mutateAsync({
      id: policeOfficer.id,
      photo: selectedFile,
    });

    setSelectedFile(null);
    setPreviewUrl(null);
  }

  async function handleDelete() {
    await deleteMutation.mutateAsync(policeOfficer.id);
  }

  function handleCancel() {
    setSelectedFile(null);
    setPreviewUrl(null);
  }

  const currentPhotoUrl = policeOfficer.profile_photo?.url;
  const displayUrl = previewUrl || currentPhotoUrl;
  const displayName = policeOfficer.name || policeOfficer.war_name;

  return (
    <Card className="border-slate-200/70 bg-white/80">
      <CardHeader>
        <CardTitle>Foto de perfil</CardTitle>
        <CardDescription>
          Formatos aceitos: JPEG, JPG, PNG. Tamanho máximo: 5MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-6">
          <Avatar className="h-32 w-32">
            {displayUrl ? (
              <AvatarImage src={displayUrl} alt={displayName} />
            ) : null}
            <AvatarFallback className="text-3xl">
              {displayName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile_photo">Selecionar nova foto</Label>
              <Input
                id="profile_photo"
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleFileChange}
                disabled={uploadMutation.isPending || deleteMutation.isPending}
              />
            </div>

            {selectedFile ? (
              <div className="flex gap-2">
                <Button
                  onClick={() => void handleUpload()}
                  disabled={uploadMutation.isPending}
                  size="sm"
                >
                  {uploadMutation.isPending ? "Enviando..." : "Enviar foto"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={uploadMutation.isPending}
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            ) : currentPhotoUrl ? (
              <Button
                variant="outline"
                onClick={() => void handleDelete()}
                disabled={deleteMutation.isPending}
                size="sm"
              >
                {deleteMutation.isPending ? "Removendo..." : "Remover foto"}
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
