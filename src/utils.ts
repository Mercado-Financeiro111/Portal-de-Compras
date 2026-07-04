/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcurementRequest, Installment, HistoryEntry, RequestSource } from "./types";

// Cost Center Lookups
export const COST_CENTERS: Record<string, string> = {
  "Oficina Mecânica": "CC-MANUTENCAO-10",
  "Operação Florestal": "CC-FLORESTAL-20",
  "Abastecimento": "CC-ABASTEC-30",
};

// Specialized Buyers Routing
export const BUYERS: Record<string, string> = {
  "Oficina Mecânica": "Márcio Souza (Especialista Peças)",
  "Operação Florestal": "Sandro Lima (Insumos Florestais)",
  "Abastecimento": "Patrícia Melo (Combustível)",
  "Outros": "Patrícia Melo (Abastecimento)",
};

/**
 * Generate a randomized ID for audit logs
 */
export function generateAuditId(): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const num = Math.floor(Math.random() * 90000) + 10000;
  const chars = Array.from({ length: 4 }, () => letters[Math.floor(Math.random() * letters.length)]).join("");
  return `AUD-${chars}-${num}`;
}

/**
 * Generates automated installments based on payment terms, value and current date
 */
export function generateInstallments(
  totalValue: number,
  paymentTerms: string,
  numInstallments: number = 1
): Installment[] {
  const installments: Installment[] = [];
  const baseValue = Math.floor((totalValue / numInstallments) * 100) / 100;
  const remainder = Math.round((totalValue - baseValue * numInstallments) * 100) / 100;

  const today = new Date();

  for (let i = 1; i <= numInstallments; i++) {
    const dueDate = new Date(today);
    // Add 30 days per installment level
    dueDate.setDate(today.getDate() + 30 * i);
    
    // Format to PT-BR date
    const day = String(dueDate.getDate()).padStart(2, "0");
    const month = String(dueDate.getMonth() + 1).padStart(2, "0");
    const year = dueDate.getFullYear();

    installments.push({
      number: i,
      dueDate: `${day}/${month}/${year}`,
      value: i === numInstallments ? parseFloat((baseValue + remainder).toFixed(2)) : baseValue,
      status: "Pendente",
    });
  }

  return installments;
}

/**
 * Helper to record state transitions in history logs
 */
export function addHistory(
  history: HistoryEntry[],
  status: string,
  user: string,
  description: string
): HistoryEntry[] {
  const now = new Date();
  const dateStr = now.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  return [
    ...history,
    {
      status,
      date: dateStr,
      user,
      description,
    },
  ];
}

/**
 * Simple formatter for Currency in Reais (R$)
 */
export function formatCurrency(value: number | null): string {
  if (value === null || isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
