"use client";

import { useRef } from "react";
import { Printer } from "lucide-react";

import type { ArmamentLoanRecord } from "@/types/armament-loan.type";
import { getArmamentLoanItemModeLabel } from "@/types/armament-loan.type";
import { Button } from "@/components/ui/button";

interface ArmamentLoanPrintReportProps {
  loan: ArmamentLoanRecord;
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDate(value?: string | null) {
  if (!value) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(new Date(value));
}

export function ArmamentLoanPrintReport({ loan }: ArmamentLoanPrintReportProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Button onClick={handlePrint} variant="outline" className="print:hidden">
        <Printer className="mr-2 h-4 w-4" />
        Imprimir relatório
      </Button>

      <div ref={printRef} className="print-content hidden print:block">
        <div className="mx-auto max-w-4xl space-y-6 bg-white p-8 text-black">
          {/* Cabeçalho */}
          <div className="border-b-2 border-black pb-4 text-center">
            <h1 className="text-2xl font-bold uppercase">
              Relatório de Empréstimo de Armamento
            </h1>
            <p className="mt-2 text-sm">
              Sistema de Controle de Armamento - SISAC
            </p>
            <p className="text-xs text-gray-600">
              Documento nº {loan.id} • Emitido em {formatDate(new Date().toISOString())}
            </p>
          </div>

          {/* Informações Principais */}
          <div className="grid grid-cols-2 gap-4 border-b border-gray-300 pb-4">
            <div>
              <h2 className="mb-3 text-lg font-bold">Dados do Policial</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Nome de Guerra:</span>{" "}
                  {loan.police_officer?.war_name || "Não informado"}
                </div>
                <div>
                  <span className="font-semibold">Nome Completo:</span>{" "}
                  {loan.police_officer?.name || "Não informado"}
                </div>
                <div>
                  <span className="font-semibold">Matrícula:</span>{" "}
                  {loan.police_officer?.registration_number || "Não informada"}
                </div>
                <div>
                  <span className="font-semibold">CPF:</span>{" "}
                  {loan.police_officer?.cpf || "Não informado"}
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-bold">Dados do Empréstimo</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Tipo:</span>{" "}
                  {loan.kind_label ?? loan.kind}
                </div>
                <div>
                  <span className="font-semibold">Status:</span>{" "}
                  {loan.status_label ?? loan.status}
                </div>
                <div>
                  <span className="font-semibold">Data do Empréstimo:</span>{" "}
                  {formatDateTime(loan.loaned_at)}
                </div>
                <div>
                  <span className="font-semibold">Previsão de Devolução:</span>{" "}
                  {loan.expected_return_at
                    ? formatDateTime(loan.expected_return_at)
                    : "Não informada"}
                </div>
                {loan.returned_at ? (
                  <div>
                    <span className="font-semibold">Data de Devolução:</span>{" "}
                    {formatDateTime(loan.returned_at)}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Aprovador e Finalidade */}
          <div className="border-b border-gray-300 pb-4">
            <h2 className="mb-3 text-lg font-bold">Autorização e Finalidade</h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-semibold">Aprovado por:</span>{" "}
                {loan.approved_by_user?.name || "Não informado"}
                {loan.approved_by_user?.email
                  ? ` (${loan.approved_by_user.email})`
                  : ""}
              </div>
              <div>
                <span className="font-semibold">Finalidade:</span>
                <p className="mt-1 whitespace-pre-wrap rounded border border-gray-300 bg-gray-50 p-2">
                  {loan.purpose || "Nenhuma finalidade registrada."}
                </p>
              </div>
              {loan.return_notes ? (
                <div>
                  <span className="font-semibold">Observações de Retorno:</span>
                  <p className="mt-1 whitespace-pre-wrap rounded border border-gray-300 bg-gray-50 p-2">
                    {loan.return_notes}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          {/* Controle Quantitativo */}
          <div className="border-b border-gray-300 pb-4">
            <h2 className="mb-3 text-lg font-bold">Controle Quantitativo</h2>
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div className="rounded border border-gray-300 bg-gray-50 p-3">
                <div className="text-xs font-semibold uppercase text-gray-600">
                  Total Emprestado
                </div>
                <div className="mt-1 text-2xl font-bold">{loan.total_quantity}</div>
              </div>
              <div className="rounded border border-gray-300 bg-gray-50 p-3">
                <div className="text-xs font-semibold uppercase text-gray-600">
                  Devolvido
                </div>
                <div className="mt-1 text-2xl font-bold text-green-700">
                  {loan.returned_quantity}
                </div>
              </div>
              <div className="rounded border border-gray-300 bg-gray-50 p-3">
                <div className="text-xs font-semibold uppercase text-gray-600">
                  Consumido
                </div>
                <div className="mt-1 text-2xl font-bold text-orange-700">
                  {loan.consumed_quantity}
                </div>
              </div>
              <div className="rounded border border-gray-300 bg-gray-50 p-3">
                <div className="text-xs font-semibold uppercase text-gray-600">
                  Extraviado
                </div>
                <div className="mt-1 text-2xl font-bold text-red-700">
                  {loan.lost_quantity}
                </div>
              </div>
            </div>
          </div>

          {/* Itens do Empréstimo */}
          <div className="border-b border-gray-300 pb-4">
            <h2 className="mb-3 text-lg font-bold">Itens Emprestados</h2>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="pb-2 text-left font-semibold">#</th>
                  <th className="pb-2 text-left font-semibold">Armamento</th>
                  <th className="pb-2 text-left font-semibold">Referência</th>
                  <th className="pb-2 text-center font-semibold">Total</th>
                  <th className="pb-2 text-center font-semibold">Devolvido</th>
                  <th className="pb-2 text-center font-semibold">Pendente</th>
                </tr>
              </thead>
              <tbody>
                {(loan.items ?? []).map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-300">
                    <td className="py-2">{index + 1}</td>
                    <td className="py-2">
                      <div>
                        <div className="font-medium">
                          {[item.armament?.type?.name, item.armament?.variant?.name]
                            .filter(Boolean)
                            .join(" ") || `Armamento #${item.armament_id}`}
                        </div>
                        <div className="text-xs text-gray-600">
                          {item.armament?.subunit?.abbreviation ||
                            item.armament?.subunit?.name ||
                            ""}
                        </div>
                      </div>
                    </td>
                    <td className="py-2">
                      <div className="text-xs">
                        <div>{getArmamentLoanItemModeLabel(item)}</div>
                        <div className="text-gray-600">
                          {item.armament_unit_id
                            ? `Unidade #${item.armament_unit_id}${
                                item.unit?.serial_number
                                  ? ` • ${item.unit.serial_number}`
                                  : ""
                              }`
                            : `Lote #${item.armament_batch_id}${
                                item.batch?.batch_number
                                  ? ` • ${item.batch.batch_number}`
                                  : ""
                              }`}
                        </div>
                      </div>
                    </td>
                    <td className="py-2 text-center font-semibold">{item.quantity}</td>
                    <td className="py-2 text-center text-green-700">
                      {item.returned_quantity}
                    </td>
                    <td className="py-2 text-center font-semibold">
                      {item.pending_quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Confirmações */}
          {loan.confirmations && loan.confirmations.length > 0 ? (
            <div className="border-b border-gray-300 pb-4">
              <h2 className="mb-3 text-lg font-bold">Confirmações</h2>
              <div className="space-y-2 text-sm">
                {loan.confirmations.map((confirmation) => (
                  <div
                    key={confirmation.id}
                    className="rounded border border-gray-300 bg-gray-50 p-3"
                  >
                    <div className="font-semibold">
                      {confirmation.operation_type_label ||
                        confirmation.operation_type ||
                        "Operação confirmada"}
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      Confirmante:{" "}
                      {confirmation.confirmed_by_user?.name ||
                        `#${confirmation.confirmed_by_user_id}`}{" "}
                      • Método:{" "}
                      {confirmation.confirmation_method_label ||
                        confirmation.confirmation_method}
                    </div>
                    <div className="text-xs text-gray-600">
                      Operador: {confirmation.operator_user?.name || "Não informado"} •{" "}
                      {formatDateTime(confirmation.confirmed_at)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Assinaturas */}
          <div className="mt-8 grid grid-cols-2 gap-8">
            <div className="text-center">
              <div className="mt-16 border-t border-black pt-2">
                <p className="text-sm font-semibold">
                  {loan.police_officer?.war_name || loan.police_officer?.name}
                </p>
                <p className="text-xs text-gray-600">Policial Responsável</p>
                <p className="text-xs text-gray-600">
                  Mat.: {loan.police_officer?.registration_number}
                </p>
              </div>
            </div>
            <div className="text-center">
              <div className="mt-16 border-t border-black pt-2">
                <p className="text-sm font-semibold">
                  {loan.approved_by_user?.name || "Não informado"}
                </p>
                <p className="text-xs text-gray-600">Aprovador</p>
              </div>
            </div>
          </div>

          {/* Rodapé */}
          <div className="mt-8 border-t border-gray-300 pt-4 text-center text-xs text-gray-600">
            <p>
              Este documento foi gerado automaticamente pelo Sistema de Controle de
              Armamento (SISAC)
            </p>
            <p className="mt-1">
              Criado por: {loan.creator?.name || "Não informado"} • Última
              atualização: {formatDateTime(loan.updated_at)}
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content,
          .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
          @page {
            size: A4;
            margin: 1cm;
          }
        }
      `}</style>
    </>
  );
}
