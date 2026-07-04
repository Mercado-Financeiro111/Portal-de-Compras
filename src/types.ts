/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RequestSource = "Portal de Campo" | "E-mail" | "Integração ERP";

export type RequestStatus =
  | "Pendente Cotação"
  | "Aguardando Autorização"
  | "Autorizado - Emitir OC"
  | "OC Emitida - Enviado ao Financeiro"
  | "Liquidado / Pago"
  | "Cancelado";

export type PaymentMethod = "PIX" | "Boleto" | "TED" | "";

export interface Quote {
  fornecedor: string;
  valor: number | null;
}

export interface QuotesGroup {
  a: Quote;
  b: Quote;
  c: Quote;
}

export interface Installment {
  number: number;
  dueDate: string;
  value: number;
  status: "Pendente" | "Pago";
}

export interface HistoryEntry {
  status: string;
  date: string;
  user: string;
  description: string;
}

export interface ProcurementRequest {
  id: number;
  source: RequestSource;
  requester: string;
  target: string;
  dept: string;
  item: string;
  itemModel?: string;
  itemBrand?: string;
  qty: number;
  status: RequestStatus;
  costCenter: string;
  needsCCManualInput: boolean;
  manualCC: string;
  timestamp: string;
  auditLink: string;
  buyer: string;
  cotacoes: QuotesGroup;
  opcaoVencedora: "a" | "b" | "c" | "";
  deadline: string;
  paymentMethod: PaymentMethod;
  paymentTerms: string;
  pixKey: string;
  tedBank: string;
  tedAgency: string;
  tedAccount: string;
  tedDoc: string;
  boletoBarcode: string;
  installments: Installment[];
  invoiceNumber: string;
  invoiceConfirmed: boolean;
  paymentDate?: string;
  history: HistoryEntry[];
  photoUrl?: string;
  rejectionReason?: string;
  isFromStock?: boolean;
}

export interface StockItem {
  id: string;
  item: string;
  model: string;
  brand: string;
  qty: number;
  unitValue: number;
  totalValue: number;
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  type: "Entrada" | "Saída";
  item: string;
  model: string;
  brand: string;
  qty: number;
  unitValue: number;
  totalValue: number;
  destination: string;
  requester: string;
  approver: string;
}

export interface HistoricalQuote {
  item: string;
  model: string;
  brand: string;
  fornecedor: string;
  valor: number;
  data: string;
}

export interface StageAccessControl {
  stageId: number;
  stageName: string;
  authorizedNames: string[];
}

export interface AppNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: "info" | "success" | "warn";
  read: boolean;
  targetTab?: "solicitacao" | "cotacoes" | "autorizador" | "efetivar" | "financeiro" | "estoque";
  requestId?: number;
}
