/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProcurementRequest } from "./types";

export const initialRequests: ProcurementRequest[] = [
  {
    id: 301,
    source: "Portal de Campo",
    requester: "Daniel Silva (Operador)",
    target: "Harvester Caterpillar 02",
    dept: "Operação Florestal",
    item: "Mangueira de Pressão Hidráulica 3/4 (Corte)",
    qty: 2,
    status: "Pendente Cotação",
    costCenter: "CC-FLORESTAL-20",
    needsCCManualInput: false,
    manualCC: "",
    timestamp: "03/07/2026 07:15",
    auditLink: "AUD-992A7",
    buyer: "Sandro Lima (Insumos Florestais)",
    cotacoes: {
      a: { fornecedor: "", valor: null },
      b: { fornecedor: "", valor: null },
      c: { fornecedor: "", valor: null }
    },
    opcaoVencedora: "",
    deadline: "",
    paymentMethod: "",
    paymentTerms: "",
    pixKey: "",
    tedBank: "",
    tedAgency: "",
    tedAccount: "",
    tedDoc: "",
    boletoBarcode: "",
    installments: [],
    invoiceNumber: "",
    invoiceConfirmed: false,
    history: [
      {
        status: "Pendente Cotação",
        date: "03/07/2026 07:15",
        user: "Daniel Silva (Campo)",
        description: "Solicitação enviada via aplicativo móvel do campo."
      }
    ]
  },
  {
    id: 302,
    source: "E-mail",
    requester: "Marcos Souza (Mecânico Chefe)",
    target: "Caminhão Scania Placa ABC-1234",
    dept: "Oficina Mecânica",
    item: "Jogo de Pneus Dianteiros 295/80 R22.5",
    qty: 2,
    status: "Aguardando Autorização",
    costCenter: "CC-MANUTENCAO-10",
    needsCCManualInput: false,
    manualCC: "",
    timestamp: "02/07/2026 15:40",
    auditLink: "AUD-883F2",
    buyer: "Márcio Souza (Especialista Peças)",
    cotacoes: {
      a: { fornecedor: "Pneulândia Florestal", valor: 4200 },
      b: { fornecedor: "RodoDiesel Auto Peças", valor: 4500 },
      c: { fornecedor: "Sul Pneus Transportes", valor: 4350 }
    },
    opcaoVencedora: "",
    deadline: "2 dias úteis",
    paymentMethod: "",
    paymentTerms: "",
    pixKey: "",
    tedBank: "",
    tedAgency: "",
    tedAccount: "",
    tedDoc: "",
    boletoBarcode: "",
    installments: [],
    invoiceNumber: "",
    invoiceConfirmed: false,
    history: [
      {
        status: "Pendente Cotação",
        date: "02/07/2026 15:40",
        user: "Marcos Souza (Oficina)",
        description: "Demanda recebida via integração de e-mail."
      },
      {
        status: "Aguardando Autorização",
        date: "02/07/2026 16:30",
        user: "Márcio Souza (Compras)",
        description: "Três orçamentos mapeados no mercado local e enviados para aprovação gerencial."
      }
    ]
  },
  {
    id: 303,
    source: "Portal de Campo",
    requester: "Amilton Santos (Supervisor Frota)",
    target: "Trator Skidder John Deere 01",
    dept: "Desconhecido", // To trigger manual CC input simulation!
    item: "Filtro de Ar e Elementos Hidráulicos",
    qty: 1,
    status: "Pendente Cotação",
    costCenter: "",
    needsCCManualInput: true,
    manualCC: "",
    timestamp: "03/07/2026 08:00",
    auditLink: "AUD-771B4",
    buyer: "Márcio Souza (Especialista Peças)",
    cotacoes: {
      a: { fornecedor: "", valor: null },
      b: { fornecedor: "", valor: null },
      c: { fornecedor: "", valor: null }
    },
    opcaoVencedora: "",
    deadline: "",
    paymentMethod: "",
    paymentTerms: "",
    pixKey: "",
    tedBank: "",
    tedAgency: "",
    tedAccount: "",
    tedDoc: "",
    boletoBarcode: "",
    installments: [],
    invoiceNumber: "",
    invoiceConfirmed: false,
    history: [
      {
        status: "Pendente Cotação",
        date: "03/07/2026 08:00",
        user: "Amilton Santos (Campo)",
        description: "Pedido urgente gerado em campo. Alerta de centro de custo desconhecido gerado."
      }
    ]
  },
  {
    id: 304,
    source: "Integração ERP",
    requester: "Gleison Lima (Operador Abastecimento)",
    target: "Manutenção Geral Oficina",
    dept: "Abastecimento",
    item: "Óleo Lubrificante Motor Diesel 15W40 (Tambor 200L)",
    qty: 1,
    status: "Autorizado - Emitir OC",
    costCenter: "CC-ABASTEC-30",
    needsCCManualInput: false,
    manualCC: "",
    timestamp: "02/07/2026 09:12",
    auditLink: "AUD-104C7",
    buyer: "Patrícia Melo (Abastecimento)",
    cotacoes: {
      a: { fornecedor: "AgroLub Distribuidora S/A", valor: 2850 },
      b: { fornecedor: "LubriNorte Distribuição", valor: 2950 },
      c: { fornecedor: "Posto e Lubrificantes Rodovia", valor: 3100 }
    },
    opcaoVencedora: "a", // Approved Option A
    deadline: "24 horas",
    paymentMethod: "",
    paymentTerms: "",
    pixKey: "",
    tedBank: "",
    tedAgency: "",
    tedAccount: "",
    tedDoc: "",
    boletoBarcode: "",
    installments: [],
    invoiceNumber: "",
    invoiceConfirmed: false,
    history: [
      {
        status: "Pendente Cotação",
        date: "02/07/2026 09:12",
        user: "Gleison Lima (Campo)",
        description: "Demanda de óleo de motor vinda do sistema de estoque do ERP."
      },
      {
        status: "Aguardando Autorização",
        date: "02/07/2026 10:20",
        user: "Patrícia Melo (Compras)",
        description: "Orçamentos inseridos."
      },
      {
        status: "Autorizado - Emitir OC",
        date: "02/07/2026 11:45",
        user: "Roberto Diretor (Gerente)",
        description: "Compra autorizada utilizando a Opção A (AgroLub) devido ao menor preço e melhor prazo."
      }
    ]
  },
  {
    id: 305,
    source: "E-mail",
    requester: "Marcos Souza (Oficina)",
    target: "Caminhão Volvo Placa XYZ-5678",
    dept: "Oficina Mecânica",
    item: "Serviço de Retífica do Turbocompressor Cummins",
    qty: 1,
    status: "OC Emitida - Enviado ao Financeiro",
    costCenter: "CC-MANUTENCAO-10",
    needsCCManualInput: false,
    manualCC: "",
    timestamp: "01/07/2026 11:20",
    auditLink: "AUD-662D5",
    buyer: "Márcio Souza (Especialista Peças)",
    cotacoes: {
      a: { fornecedor: "Retífica Diesel Brasil", valor: 6800 },
      b: { fornecedor: "Turbos S/A", valor: 7500 },
      c: { fornecedor: "TurboOficina Norte", valor: 7100 }
    },
    opcaoVencedora: "a",
    deadline: "3 dias úteis",
    paymentMethod: "Boleto",
    paymentTerms: "2 Parcelas (30/60 dias)",
    pixKey: "",
    tedBank: "",
    tedAgency: "",
    tedAccount: "",
    tedDoc: "",
    boletoBarcode: "34191.79001 01043.513184 91020.150008 7 97500000340000",
    installments: [
      { number: 1, dueDate: "03/08/2026", value: 3400, status: "Pendente" },
      { number: 2, dueDate: "02/09/2026", value: 3400, status: "Pendente" }
    ],
    invoiceNumber: "", // Awaiting verification in Finance step
    invoiceConfirmed: false,
    history: [
      {
        status: "Pendente Cotação",
        date: "01/07/2026 11:20",
        user: "Marcos Souza (Oficina)",
        description: "Serviço de turbina requisitado pelo e-mail."
      },
      {
        status: "Aguardando Autorização",
        date: "01/07/2026 12:45",
        user: "Márcio Souza (Compras)",
        description: "Cotações cadastradas."
      },
      {
        status: "Autorizado - Emitir OC",
        date: "01/07/2026 14:00",
        user: "Roberto Diretor (Gerente)",
        description: "Autorizado com foco na Retífica Diesel Brasil."
      },
      {
        status: "OC Emitida - Enviado ao Financeiro",
        date: "01/07/2026 15:30",
        user: "Márcio Souza (Compras)",
        description: "Ordem de Compra emitida em 2 parcelas via Boleto. Documento faturado enviado para o contas a pagar."
      }
    ]
  },
  {
    id: 306,
    source: "Portal de Campo",
    requester: "Amilton Santos (Frota)",
    target: "Caminhão Volvo Placa XYZ-5678",
    dept: "Abastecimento",
    item: "Carga de Combustível Diesel S10 (Posto Rodovia)",
    qty: 1,
    status: "Liquidado / Pago",
    costCenter: "CC-ABASTEC-30",
    needsCCManualInput: false,
    manualCC: "",
    timestamp: "30/06/2026 10:00",
    auditLink: "AUD-552K1",
    buyer: "Patrícia Melo (Abastecimento)",
    cotacoes: {
      a: { fornecedor: "Posto Rodovia Central Ltda", valor: 5400 },
      b: { fornecedor: "Posto Trevo Florestal", valor: 5600 },
      c: { fornecedor: "Comercial Diesel Norte", valor: 5500 }
    },
    opcaoVencedora: "a",
    deadline: "Imediato",
    paymentMethod: "PIX",
    paymentTerms: "À Vista (PIX)",
    pixKey: "financeiro@postorodovia.com.br",
    tedBank: "",
    tedAgency: "",
    tedAccount: "",
    tedDoc: "",
    boletoBarcode: "",
    installments: [
      { number: 1, dueDate: "30/06/2026", value: 5400, status: "Pago" }
    ],
    invoiceNumber: "NF-99412",
    invoiceConfirmed: true,
    paymentDate: "30/06/2026 14:22",
    history: [
      {
        status: "Pendente Cotação",
        date: "30/06/2026 10:00",
        user: "Amilton Santos (Campo)",
        description: "Abastecimento emergencial de comboio solicitado."
      },
      {
        status: "Aguardando Autorização",
        date: "30/06/2026 10:15",
        user: "Patrícia Melo (Compras)",
        description: "Valores preenchidos."
      },
      {
        status: "Autorizado - Emitir OC",
        date: "30/06/2026 10:30",
        user: "Roberto Diretor (Gerente)",
        description: "Autorizado."
      },
      {
        status: "OC Emitida - Enviado ao Financeiro",
        date: "30/06/2026 11:00",
        user: "Patrícia Melo (Compras)",
        description: "OC emitida à vista via PIX."
      },
      {
        status: "Liquidado / Pago",
        date: "30/06/2026 14:22",
        user: "Flávia Financeiro (Fin)",
        description: "Nota fiscal NF-99412 recebida, conferida e pagamento efetuado via PIX Copia e Cola às 14:22."
      }
    ]
  }
];

import { StockItem, StockMovement, HistoricalQuote, StageAccessControl } from "./types";

export const initialStockItems: StockItem[] = [
  {
    id: "STK-001",
    item: "Mangueira de Pressão Hidráulica 3/4 (Corte)",
    model: "HighTemp-XP",
    brand: "Gates",
    qty: 12,
    unitValue: 120,
    totalValue: 1440,
    lastUpdated: "03/07/2026 08:30"
  },
  {
    id: "STK-002",
    item: "Filtro de Ar e Elementos Hidráulicos",
    model: "FA-9912",
    brand: "Donaldson",
    qty: 5,
    unitValue: 350,
    totalValue: 1750,
    lastUpdated: "02/07/2026 10:00"
  },
  {
    id: "STK-003",
    item: "Óleo Lubrificante Motor Diesel 15W40 (Tambor 200L)",
    model: "Urania 1000",
    brand: "Petronas",
    qty: 2,
    unitValue: 2850,
    totalValue: 5700,
    lastUpdated: "30/06/2026 14:00"
  },
  {
    id: "STK-004",
    item: "Jogo de Pneus Dianteiros 295/80 R22.5",
    model: "ArmorMax",
    brand: "Goodyear",
    qty: 0,
    unitValue: 2100,
    totalValue: 0,
    lastUpdated: "03/07/2026 09:00"
  }
];

export const initialStockMovements: StockMovement[] = [
  {
    id: "MOV-001",
    timestamp: "03/07/2026 08:30",
    type: "Entrada",
    item: "Mangueira de Pressão Hidráulica 3/4 (Corte)",
    model: "HighTemp-XP",
    brand: "Gates",
    qty: 10,
    unitValue: 120,
    totalValue: 1200,
    destination: "Estoque Central",
    requester: "Sandro Lima (Compras)",
    approver: "Roberto Diretor (Gerente)"
  },
  {
    id: "MOV-002",
    timestamp: "02/07/2026 14:45",
    type: "Saída",
    item: "Filtro de Ar e Elementos Hidráulicos",
    model: "FA-9912",
    brand: "Donaldson",
    qty: 1,
    unitValue: 350,
    totalValue: 350,
    destination: "Trator Skidder John Deere 01",
    requester: "Amilton Santos (Supervisor)",
    approver: "Roberto Diretor"
  }
];

export const initialHistoricalQuotes: HistoricalQuote[] = [
  {
    item: "Mangueira de Pressão Hidráulica 3/4 (Corte)",
    model: "HighTemp-XP",
    brand: "Gates",
    fornecedor: "Casa das Mangueiras Ltda",
    valor: 115,
    data: "20/06/2026"
  },
  {
    item: "Mangueira de Pressão Hidráulica 3/4 (Corte)",
    model: "HighTemp-XP",
    brand: "Gates",
    fornecedor: "Hidráulica Paranaense",
    valor: 120,
    data: "22/06/2026"
  },
  {
    item: "Jogo de Pneus Dianteiros 295/80 R22.5",
    model: "ArmorMax",
    brand: "Goodyear",
    fornecedor: "Pneulândia Florestal",
    valor: 2150,
    data: "15/06/2026"
  },
  {
    item: "Jogo de Pneus Dianteiros 295/80 R22.5",
    model: "ArmorMax",
    brand: "Goodyear",
    fornecedor: "Giga Pneus Sul",
    valor: 2100,
    data: "18/06/2026"
  },
  {
    item: "Óleo Lubrificante Motor Diesel 15W40 (Tambor 200L)",
    model: "Urania 1000",
    brand: "Petronas",
    fornecedor: "Lubrificantes Pinheiro",
    valor: 2800,
    data: "10/06/2026"
  }
];

export const initialStageAccess: StageAccessControl[] = [
  {
    stageId: 1,
    stageName: "Solicitação",
    authorizedNames: ["Daniel Silva", "Marcos Souza", "Amilton Santos", "Gleison Lima"]
  },
  {
    stageId: 2,
    stageName: "Cotações (Compras)",
    authorizedNames: ["Márcio Souza", "Sandro Lima", "Patrícia Melo"]
  },
  {
    stageId: 3,
    stageName: "Autorização (Gerente)",
    authorizedNames: ["Roberto Diretor", "Cláudio Gerente"]
  },
  {
    stageId: 4,
    stageName: "Efetivação de OC (Compras)",
    authorizedNames: ["Márcio Souza", "Sandro Lima", "Patrícia Melo"]
  },
  {
    stageId: 5,
    stageName: "Financeiro",
    authorizedNames: ["Flávia Financeiro", "Alex Contas"]
  }
];

export const STANDARD_ITEMS_LIST = [
  { item: "Mangueira de Pressão Hidráulica 3/4 (Corte)", model: "HighTemp-XP", brand: "Gates" },
  { item: "Filtro de Ar e Elementos Hidráulicos", model: "FA-9912", brand: "Donaldson" },
  { item: "Jogo de Pneus Dianteiros 295/80 R22.5", model: "ArmorMax", brand: "Goodyear" },
  { item: "Óleo Lubrificante Motor Diesel 15W40 (Tambor 200L)", model: "Urania 1000", brand: "Petronas" },
  { item: "Filtro de Combustível Secundário PSD", model: "FC-PSD-44", brand: "Parker" },
  { item: "Cabo de Aço para Guinchos Arrasto 5/8", model: "Arrasto-Pro", brand: "Cimaf" },
  { item: "Bateria Blindada Pesada 150Ah", model: "Moura Heavy Duty", brand: "Moura" },
  { item: "Aditivo de Radiador Orgânico Concentrado", model: "Coolant-Eco", brand: "Radnaq" }
];
