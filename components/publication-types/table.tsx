"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";

import { useDeletePublicationTypeMutation } from "@/hooks/use-publication-type-mutations";
import { usePermissions } from "@/hooks/use-permissions";
import type { PublicationTypeItem } from "@/types/publication-type.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PublicationTypesTableProps {
  publicationTypes: PublicationTypeItem[];
}

export function PublicationTypesTable({ publicationTypes }: PublicationTypesTableProps) {
  const permissions = usePermissions("publication-types");
  const deleteMutation = useDeletePublicationTypeMutation();

  return (
    <div className="space-y-3">
      {publicationTypes.map((publicationType) => (
        <Card key={publicationType.id} className="border-slate-200/70 bg-white/80">
          <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{publicationType.name}</p>
                <Badge
                  variant={
                    publicationType.nature?.value === "positive"
                      ? "success"
                      : publicationType.nature?.value === "negative"
                        ? "danger"
                        : "secondary"
                  }
                >
                  {publicationType.nature?.label ?? "Neutra"}
                </Badge>
                <Badge variant={publicationType.generates_points ? "info" : "secondary"}>
                  {publicationType.generates_points ? "Gera pontos" : "Não gera pontos"}
                </Badge>
              </div>

              <div className="space-y-1 text-sm text-slate-600">
                <p>Slug: {publicationType.slug}</p>
                <p>{publicationType.description || "Sem descrição cadastrada."}</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              {permissions.canView ? (
                <Button asChild size="icon" variant="outline">
                  <Link href={`/publication-types/${publicationType.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
              {permissions.canUpdate ? (
                <Button asChild size="icon" variant="outline">
                  <Link href={`/publication-types/${publicationType.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
              {permissions.canDelete ? (
                <Button size="icon" variant="outline" disabled={deleteMutation.isPending} onClick={() => void deleteMutation.mutateAsync(publicationType.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
