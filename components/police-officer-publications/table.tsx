"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, ExternalLink, Pencil, Trash2 } from "lucide-react";

import { usePermissions } from "@/hooks/use-permissions";
import { useDeletePoliceOfficerPublicationMutation } from "@/hooks/use-police-officer-publication-mutations";
import type { PoliceOfficerPublicationItem } from "@/types/police-officer-publication.type";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function getNatureVariant(isPositive?: boolean | null) {
  if (isPositive === true) return "success";
  if (isPositive === false) return "danger";
  return "secondary";
}

interface PoliceOfficerPublicationsTableProps {
  policeOfficerPublications: PoliceOfficerPublicationItem[];
}

export function PoliceOfficerPublicationsTable({
  policeOfficerPublications,
}: PoliceOfficerPublicationsTableProps) {
  const permissions = usePermissions("police-officer-publications");
  const deleteMutation = useDeletePoliceOfficerPublicationMutation();
  const [publicationToDelete, setPublicationToDelete] =
    useState<PoliceOfficerPublicationItem | null>(null);

  async function handleDelete() {
    if (!publicationToDelete) {
      return;
    }

    await deleteMutation.mutateAsync(publicationToDelete.id);
    setPublicationToDelete(null);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/80">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Policial</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Boletim</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Conteudo</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {policeOfficerPublications.map((publication) => (
                <tr
                  key={publication.id}
                  className="border-t border-slate-200/70"
                >
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-medium text-slate-900">
                        {publication.police_officer?.war_name ??
                          publication.police_officer?.user?.name ??
                          `Policial #${publication.police_officer_id}`}
                      </p>
                      <p className="mt-1 text-slate-500">
                        Matrícula:{" "}
                        {publication.police_officer?.registration_number ??
                          "Não informada"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {publication.publication_type ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-slate-900">
                          {publication.publication_type.name}
                        </span>
                        <Badge
                          variant={getNatureVariant(
                            publication.publication_type.is_positive,
                          )}
                        >
                          {publication.publication_type.nature?.label ??
                            "Neutra"}
                        </Badge>
                      </div>
                    ) : (
                      <span className="text-slate-500">Não informado</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900">
                      {publication.bulletin}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {publication.publication_date ?? "-"}
                  </td>
                  <td className="max-w-xs px-4 py-4">
                    <p className="line-clamp-2 text-slate-700">
                      {publication.content}
                    </p>
                    {publication.external_link ? (
                      <a
                        href={publication.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Link externo
                      </a>
                    ) : null}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      {permissions.canView ? (
                        <Button asChild size="icon" variant="outline">
                          <Link
                            href={`/police-officer-publications/${publication.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canUpdate ? (
                        <Button asChild size="icon" variant="outline">
                          <Link
                            href={`/police-officer-publications/${publication.id}/edit`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                      ) : null}

                      {permissions.canDelete ? (
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => setPublicationToDelete(publication)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog
        open={Boolean(publicationToDelete)}
        onOpenChange={(open) => !open && setPublicationToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir publicação</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a publicação &quot;
              {publicationToDelete?.bulletin}&quot; de{" "}
              {publicationToDelete?.police_officer?.war_name ??
                publicationToDelete?.police_officer?.user?.name}
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPublicationToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => void handleDelete()}
            >
              {deleteMutation.isPending ? "Excluindo..." : "Confirmar exclusão"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
