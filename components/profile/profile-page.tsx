"use client";

import { Mail, Phone, Shield, User2 } from "lucide-react";

import { useAuth } from "@/contexts/auth-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/profile-form";

export function ProfilePageContent() {
  const { user } = useAuth();

  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card className="border-slate-200/70 bg-white/80">
        <CardHeader>
          <CardTitle>Visao geral</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>{user?.avatarFallback ?? "US"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold text-slate-900">{user?.name}</p>
              <p className="text-sm text-slate-500">{user?.role?.name ?? "Sem perfil"}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-primary" />
              <span>{user?.email ?? "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary" />
              <span>{user?.phone ?? "Nao informado"}</span>
            </div>
            <div className="flex items-center gap-3">
              <User2 className="h-4 w-4 text-primary" />
              <span>{user?.type_label ?? "-"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-primary" />
              <span>{user?.status_label ?? "-"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ProfileForm />
    </div>
  );
}

