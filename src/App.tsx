/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, FormEvent } from "react";
import {
  Truck,
  Plus,
  FileText,
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Clipboard,
  DollarSign,
  CreditCard,
  ArrowRight,
  Search,
  Trash2,
  Building2,
  Calendar,
  History,
  User,
  Check,
  X,
  Lock,
  Unlock,
  Download,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  ProcurementRequest,
  PaymentMethod,
  Installment,
  StockItem,
  StockMovement,
  HistoricalQuote,
  StageAccessControl,
  AppNotification
} from "./types";
import {
  initialRequests,
  initialStockItems,
  initialStockMovements,
  initialHistoricalQuotes,
  initialStageAccess,
  STANDARD_ITEMS_LIST
} from "./mockData";
import {
  COST_CENTERS,
  BUYERS,
  generateAuditId,
  generateInstallments,
  addHistory,
  formatCurrency,
} from "./utils";

export function AraucariaLogo({ 
  showText = true, 
  variant = "light", 
  className = "w-9 h-9" 
}: { 
  showText?: boolean; 
  variant?: "light" | "dark" | "color"; 
  className?: string;
}) {
  return (
    <div className="flex items-center space-x-3 shrink-0">
      {/* The Monogram Box matching the uploaded AF logo */}
      <div className={`${className} bg-[#15803D] rounded-xl shadow-md border border-emerald-600/30 flex items-center justify-center p-1.5 shrink-0 transition-all hover:scale-105 duration-200`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Left slanted leg of 'A' */}
          <path d="M 22 75 L 50 25" stroke="white" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
          {/* Right vertical line of 'A' and stem of 'F' / top bar of 'F' */}
          <path d="M 76 25 L 50 25 L 50 75" stroke="white" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
          {/* Middle bar of 'F' crossing over to the slanted leg */}
          <path d="M 36.5 50 L 76 50" stroke="white" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {showText && (
        <div className="text-left">
          <h1 className={`font-display text-base font-black uppercase tracking-wider leading-none flex items-center gap-1.5 ${
            variant === "light" ? "text-white" : "text-slate-900"
          }`}>
            Araucária
            <span className="font-light tracking-normal lowercase text-[11px] opacity-70">florestal</span>
          </h1>
          <p className={`text-[8px] font-mono font-bold uppercase tracking-widest mt-1 ${
            variant === "light" ? "text-emerald-400" : "text-emerald-600"
          }`}>
            S/A Transportes & Logística Pesada
          </p>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [requests, setRequests] = useState<ProcurementRequest[]>(initialRequests);
  const [abaAtiva, setAbaAtiva] = useState<
    "solicitacao" | "cotacoes" | "autorizador" | "efetivar" | "financeiro" | "estoque" | "cadastros"
  >("solicitacao");

  // Databases & Configuration States
  const [stockItems, setStockItems] = useState<StockItem[]>(initialStockItems);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(initialStockMovements);
  const [historicalQuotes, setHistoricalQuotes] = useState<HistoricalQuote[]>(initialHistoricalQuotes);
  const [stageAccess, setStageAccess] = useState<StageAccessControl[]>(initialStageAccess);
  
  // User Identity & Permissions Simulation
  const [activeUser, setActiveUser] = useState<string>("Administrador Geral");
  const [showPermissionsPanel, setShowPermissionsPanel] = useState<boolean>(false);

  // Push Notifications Simulation State
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: "notif-1",
      timestamp: "03/07/2026 09:00",
      title: "Nova Solicitação Recebida",
      message: "Solicitação #301 cadastrada via Portal de Campo. Aguardando cotação.",
      type: "info",
      read: false,
      targetTab: "cotacoes",
      requestId: 301
    },
    {
      id: "notif-2",
      timestamp: "02/07/2026 15:40",
      title: "Cotações Prontas para Análise",
      message: "Solicitação #302 com 3 cotações completas enviada ao Gerente Roberto Diretor.",
      type: "success",
      read: true,
      targetTab: "autorizador",
      requestId: 302
    }
  ]);
  const [showNotificationsMenu, setShowNotificationsMenu] = useState<boolean>(false);

  // Filter or search state
  const [searchQuery, setSearchQuery] = useState("");

  // Step 1 Form State
  const [formSource, setFormSource] = useState<"Portal de Campo" | "E-mail" | "Integração ERP">("Portal de Campo");
  const [formRequester, setFormRequester] = useState("");
  const [formTarget, setFormTarget] = useState("Caminhão Scania Placa ABC-1234");
  const [formDept, setFormDept] = useState("Oficina Mecânica");
  const [formItem, setFormItem] = useState("");
  const [formItemModel, setFormItemModel] = useState("");
  const [formItemBrand, setFormItemBrand] = useState("");
  const [formQty, setFormQty] = useState(1);
  const [formPhoto, setFormPhoto] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);

  // Autocomplete Suggestions State
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<typeof STANDARD_ITEMS_LIST>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  // Rejection Dialog Tracking State
  const [rejectionRequestId, setRejectionRequestId] = useState<number | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>("");

  // Step 3 Rejection Reason Inputs tracking per-request state
  const [tempRejectionReasons, setTempRejectionReasons] = useState<Record<number, string>>({});

  // Stock Manual Insertion form states
  const [showManualStockForm, setShowManualStockForm] = useState<boolean>(false);
  const [manualStockItem, setManualStockItem] = useState<string>("");
  const [manualStockModel, setManualStockModel] = useState<string>("");
  const [manualStockBrand, setManualStockBrand] = useState<string>("");
  const [manualStockQty, setManualStockQty] = useState<string>("10");
  const [manualStockUnitValue, setManualStockUnitValue] = useState<string>("50");

  // Standard dynamic lists state (central database / cadastros)
  const [costCentersList, setCostCentersList] = useState<Array<{ code: string; name: string }>>([
    { code: "CC-MANUTENCAO-10", name: "Oficina Mecânica" },
    { code: "CC-FLORESTAL-20", name: "Operação Florestal" },
    { code: "CC-ABASTEC-30", name: "Abastecimento" },
    { code: "CC-ESTOQUE-01", name: "Estoque Central" },
  ]);

  const [suppliersList, setSuppliersList] = useState<string[]>([
    "Pneulândia Florestal",
    "RodoDiesel Auto Peças",
    "Sul Pneus Transportes",
    "Casa das Mangueiras Ltda",
    "Hidráulica Paranaense",
    "Giga Pneus Sul",
    "Lubrificantes Pinheiro",
  ]);

  const [catalogItems, setCatalogItems] = useState<Array<{ item: string; model: string; brand: string }>>(STANDARD_ITEMS_LIST);

  const [modelsList, setModelsList] = useState<string[]>([
    "HighTemp-XP",
    "FA-9912",
    "ArmorMax",
    "Urania 1000",
    "FC-PSD-44",
    "Arrasto-Pro",
    "Moura Heavy Duty",
    "Coolant-Eco",
  ]);

  const [brandsList, setBrandsList] = useState<string[]>([
    "Gates",
    "Donaldson",
    "Goodyear",
    "Petronas",
    "Parker",
    "Cimaf",
    "Moura",
    "Radnaq",
  ]);

  // Cadastro sub-tab state
  const [cadastroSubTab, setCadastroSubTab] = useState<"cc" | "fornecedores" | "itens" | "servicos" | "modelos" | "marcas">("cc");

  // Cadastro new entry input states
  const [newCcCode, setNewCcCode] = useState("");
  const [newCcName, setNewCcName] = useState("");
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [newItemModel, setNewItemModel] = useState("");
  const [newItemBrand, setNewItemBrand] = useState("");
  const [newServiceName, setNewServiceName] = useState("");
  const [newModelName, setNewModelName] = useState("");
  const [newBrandName, setNewBrandName] = useState("");

  // Services dynamic master list
  const [servicesList, setServicesList] = useState<string[]>([
    "Serviço de Alinhamento e Balanceamento",
    "Recauchutagem de Pneus Florestais",
    "Troca de Óleo Hidráulico e Filtros",
    "Revisão Mecânica Preventiva",
    "Reparo Hidráulico de Mangueiras",
    "Manutenção Preventiva de Harvester",
    "Retífica de Motor Diesel",
  ]);

  // Stock Import CSV string state
  const [importCsvText, setImportCsvText] = useState<string>("");
  const [showImportArea, setShowImportArea] = useState<boolean>(false);

  // Share/Send Quote templates modal states for buyers
  const [showShareModalId, setShowShareModalId] = useState<number | null>(null);
  const [shareVendorName, setShareVendorName] = useState<string>("");
  const [shareVendorPhone, setShareVendorPhone] = useState<string>("");
  const [shareVendorEmail, setShareVendorEmail] = useState<string>("");
  const [shareMessageType, setShareMessageType] = useState<"whatsapp" | "email">("whatsapp");

  // Expanded request histories
  const [expandedHistories, setExpandedHistories] = useState<Record<number, boolean>>({});

  // Active Audit Document view modal/expanded states
  const [showAuditDocId, setShowAuditDocId] = useState<number | null>(null);

  // Handler to manually save a newly registered stock item
  const handleSaveManualStockItem = (e: FormEvent) => {
    e.preventDefault();
    if (!manualStockItem.trim()) {
      alert("Por favor, informe o nome do item.");
      return;
    }
    const qtyNum = parseInt(manualStockQty) || 0;
    const unitVal = parseFloat(manualStockUnitValue) || 0;
    
    const newItem: StockItem = {
      id: "SKU-" + Math.floor(1000 + Math.random() * 9000),
      item: manualStockItem,
      model: manualStockModel || "N/A",
      brand: manualStockBrand || "N/A",
      qty: qtyNum,
      unitValue: unitVal,
      totalValue: qtyNum * unitVal,
      lastUpdated: new Date().toLocaleDateString("pt-BR") + " " + new Date().toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' }),
    };

    setStockItems(prev => [newItem, ...prev]);

    // Also log a movement of Entrada
    const movement: StockMovement = {
      id: "M-" + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),
      type: "Entrada",
      item: newItem.item,
      model: newItem.model,
      brand: newItem.brand,
      qty: qtyNum,
      unitValue: unitVal,
      totalValue: qtyNum * unitVal,
      destination: "Estoque Central - Cadastro Manual",
      requester: activeUser,
      approver: "Administrador Geral"
    };

    setStockMovements(prev => [movement, ...prev]);

    addLog(`Item [${newItem.item}] cadastrado MANUALMENTE no estoque com saldo inicial de ${qtyNum} un.`, "success");
    addNotification("Novo Item Cadastrado", `Item ${newItem.item} cadastrado de forma manual no estoque florestal.`, "success", "estoque");

    // Clear form
    setManualStockItem("");
    setManualStockModel("");
    setManualStockBrand("");
    setManualStockQty("10");
    setManualStockUnitValue("50");
    setShowManualStockForm(false);
  };

  // App notification logs and helpers
  const addNotification = (
    title: string,
    message: string,
    type: "info" | "success" | "warn" = "info",
    targetTab?: "solicitacao" | "cotacoes" | "autorizador" | "efetivar" | "financeiro" | "estoque",
    requestId?: number
  ) => {
    const id = "notif-" + Math.floor(Math.random() * 1000000);
    const timestamp = new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    setNotifications((prev) => [
      { id, timestamp, title, message, type, read: false, targetTab, requestId },
      ...prev
    ]);
    addLog(`Push enviado: ${title} - ${message}`, type);
  };

  // Helper to replenish stock database automatically
  const replenishStockFromPurchase = (req: ProcurementRequest) => {
    const isEstoqueCC = 
      req.costCenter.toLowerCase().includes("estoque") || 
      (req.manualCC && req.manualCC.toLowerCase().includes("estoque"));
    
    if (!isEstoqueCC) return;

    const winnerOption = req.opcaoVencedora;
    if (!winnerOption) return;
    const quote = req.cotacoes[winnerOption];
    const unitPrice = quote.valor || 0;

    setStockItems((prev) => {
      const matchIndex = prev.findIndex(
        (s) =>
          s.item.toLowerCase() === req.item.toLowerCase() &&
          (s.model || "").toLowerCase() === (req.itemModel || "").toLowerCase() &&
          (s.brand || "").toLowerCase() === (req.itemBrand || "").toLowerCase()
      );

      if (matchIndex >= 0) {
        return prev.map((s, idx) => {
          if (idx === matchIndex) {
            const newQty = s.qty + req.qty;
            return {
              ...s,
              qty: newQty,
              unitValue: unitPrice > 0 ? unitPrice : s.unitValue,
              totalValue: newQty * (unitPrice > 0 ? unitPrice : s.unitValue),
              lastUpdated: new Date().toLocaleString("pt-BR"),
            };
          }
          return s;
        });
      } else {
        const newStockItem: StockItem = {
          id: "STK-" + (prev.length + 1).toString().padStart(3, "0"),
          item: req.item,
          model: req.itemModel || "S/M",
          brand: req.itemBrand || "S/M",
          qty: req.qty,
          unitValue: unitPrice,
          totalValue: req.qty * unitPrice,
          lastUpdated: new Date().toLocaleString("pt-BR"),
        };
        return [...prev, newStockItem];
      }
    });

    // Record movement (Entrada)
    const newMovement: StockMovement = {
      id: "MOV-" + Math.floor(Math.random() * 9000) + 1000,
      timestamp: new Date().toLocaleString("pt-BR"),
      type: "Entrada",
      item: req.item,
      model: req.itemModel || "",
      brand: req.itemBrand || "",
      qty: req.qty,
      unitValue: unitPrice,
      totalValue: req.qty * unitPrice,
      destination: "Estoque Central (Abastecimento via OC)",
      requester: req.requester,
      approver: "Financeiro (Conferência NF-e)",
    };
    setStockMovements((prev) => [newMovement, ...prev]);

    addLog(`Estoque abastecido com sucesso: ${req.qty} un de "${req.item}".`, "success");
    addNotification(
      "Estoque Abastecido",
      `Adicionadas ${req.qty} unidades de "${req.item}" ao estoque após confirmação de faturamento da compra #${req.id}.`,
      "success",
      "estoque",
      req.id
    );
  };

  // Check stage permission access
  const checkAbaAccess = (aba: string): boolean => {
    if (activeUser === "Administrador Geral") return true;
    
    let stageId = 0;
    if (aba === "solicitacao") stageId = 1;
    else if (aba === "cotacoes") stageId = 2;
    else if (aba === "autorizador") stageId = 3;
    else if (aba === "efetivar") stageId = 4;
    else if (aba === "financeiro") stageId = 5;
    else if (aba === "estoque") {
      // Stock is visible to Admins, Buyers, and Finance
      const allowedRoles = ["Administrador Geral", "Márcio Souza", "Patrícia Melo", "Flávia Financeiro"];
      return allowedRoles.includes(activeUser);
    } else if (aba === "cadastros") {
      // Cadastros is visible to Admin and Managers
      const allowedRoles = ["Administrador Geral", "Roberto Diretor"];
      return allowedRoles.includes(activeUser);
    }

    const stageConfig = stageAccess.find((s) => s.stageId === stageId);
    if (!stageConfig) return true;

    return stageConfig.authorizedNames.some((name) => 
      activeUser.toLowerCase().includes(name.toLowerCase())
    );
  };

  // App notification log
  const [logs, setLogs] = useState<Array<{ time: string; text: string; type: "info" | "success" | "warn" }>>([
    {
      time: "08:42",
      text: "Sistema operacional iniciado. Conexão com banco de dados de frotas e ERP ativa.",
      type: "success",
    },
    {
      time: "08:43",
      text: "Fila de cotações sincronizada. Aguardando novos inputs do campo.",
      type: "info",
    },
  ]);

  const addLog = (text: string, type: "info" | "success" | "warn" = "info") => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setLogs((prev) => [{ time: timeStr, text, type }, ...prev]);
  };

  // Helper count for each phase badge
  const countFase = (status: ProcurementRequest["status"]) => {
    return requests.filter((r) => r.status === status).length;
  };

  // Filter requests based on Search Query and active role permissions
  const filteredRequests = useMemo(() => {
    let result = requests;
    
    // Apply search query first
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.item.toLowerCase().includes(query) ||
          r.requester.toLowerCase().includes(query) ||
          (r.itemModel || "").toLowerCase().includes(query) ||
          (r.itemBrand || "").toLowerCase().includes(query) ||
          r.target.toLowerCase().includes(query) ||
          r.id.toString().includes(query)
      );
    }

    // Role-based filtering of data scope: "E com isso essas, terão acesso somente as suas informações;"
    if (activeUser !== "Administrador Geral") {
      if (abaAtiva === "solicitacao") {
        // Solicitant only sees requests they created
        result = result.filter((r) => r.requester.toLowerCase().includes(activeUser.toLowerCase()));
      } else if (abaAtiva === "cotacoes" || abaAtiva === "efetivar") {
        // Buyer only sees requests allocated to them
        result = result.filter((r) => r.buyer.toLowerCase().includes(activeUser.toLowerCase()));
      }
    }

    return result;
  }, [requests, searchQuery, activeUser, abaAtiva]);

  // Step 1: Cadastrar Solicitação (Request Creation)
  const handleCadastrarSolicitacao = (e: FormEvent) => {
    e.preventDefault();
    if (!formRequester || !formItem || formQty < 1) return;

    const newId = Math.floor(Math.random() * 900) + 400;
    const automatedCC = COST_CENTERS[formDept] || "";
    const assignedBuyer = BUYERS[formDept] || "Patrícia Melo (Geral)";

    const newRequest: ProcurementRequest = {
      id: newId,
      source: formSource,
      requester: formRequester,
      target: formTarget,
      dept: formDept,
      item: formItem,
      itemModel: formItemModel || undefined,
      itemBrand: formItemBrand || undefined,
      qty: formQty,
      status: "Pendente Cotação",
      costCenter: automatedCC,
      needsCCManualInput: !automatedCC, // Trigger Step 3 manual check if no matching CC
      manualCC: "",
      timestamp: new Date().toLocaleString("pt-BR"),
      auditLink: generateAuditId(),
      buyer: assignedBuyer,
      cotacoes: {
        a: { fornecedor: "", valor: null },
        b: { fornecedor: "", valor: null },
        c: { fornecedor: "", valor: null },
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
      photoUrl: formPhoto || undefined,
      history: [
        {
          status: "Pendente Cotação",
          date: new Date().toLocaleString("pt-BR"),
          user: `${formRequester} (${formSource})`,
          description: `Solicitação criada para o ativo: ${formTarget}.` + 
            (formItemModel ? ` Modelo: ${formItemModel}.` : "") + 
            (formItemBrand ? ` Marca: ${formItemBrand}.` : "") + 
            (formPhoto ? " Foto técnica capturada." : ""),
        },
      ],
    };

    setRequests((prev) => [newRequest, ...prev]);
    addLog(`Nova solicitação #${newId} (${formItem}) enviada para a fila de cotações de ${assignedBuyer}.`, "success");
    addNotification(
      "Nova Solicitação de Compra",
      `Solicitação #${newId} (${formQty}x ${formItem}) gerada por ${formRequester} para o ativo ${formTarget}.`,
      "info",
      "cotacoes",
      newId
    );

    // Reset inputs
    setFormRequester("");
    setFormItem("");
    setFormItemModel("");
    setFormItemBrand("");
    setFormQty(1);
    setFormPhoto(null);
    setIsCameraActive(false);
  };

  // Step 2: Save Quotes and send to Approval
  const handleEnviarParaAutorizacao = (id: number) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;

    // Validate that at least Option A and B are filled (need at least 2 quotes to compare)
    const { a, b } = req.cotacoes;
    if (!a.fornecedor || !a.valor || !b.fornecedor || !b.valor) {
      alert("Por favor, preencha pelo menos as Cotações A e B com fornecedor e valor para prosseguir.");
      return;
    }

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updatedHistory = addHistory(
            r.history,
            "Aguardando Autorização",
            r.buyer,
            `Orçamentos recebidos de mercado. Documento de auditoria ${r.auditLink} gerado.`
          );
          return {
            ...r,
            status: "Aguardando Autorização",
            timestamp: new Date().toLocaleString("pt-BR"),
            history: updatedHistory,
          };
        }
        return r;
      })
    );

    addLog(`Cotações cadastradas e solicitação #${id} enviada para aprovação do gerente.`, "info");
    addNotification(
      "Cotações Enviadas para Aprovação",
      `Solicitação #${id} (${req.item}) foi cotada e enviada para aprovação de Roberto Diretor.`,
      "success",
      "autorizador",
      id
    );
  };

  // Step 2: Handle manual CC input
  const handleDefinirCCManual = (id: number) => {
    const req = requests.find((r) => r.id === id);
    if (!req || !req.manualCC.trim()) return;

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          return {
            ...r,
            costCenter: r.manualCC.trim().toUpperCase(),
            needsCCManualInput: false,
            history: addHistory(
              r.history,
              r.status,
              r.buyer,
              `Centro de Custo inserido manualmente: ${r.manualCC.trim().toUpperCase()}`
            ),
          };
        }
        return r;
      })
    );

    addLog(`Centro de custo para a solicitação #${id} definido manualmente.`, "success");
  };

  // Step 2: Quote value changing
  const handleQuoteChange = (
    id: number,
    option: "a" | "b" | "c",
    field: "fornecedor" | "valor",
    value: any
  ) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updatedCotacoes = { ...r.cotacoes };
          updatedCotacoes[option] = {
            ...updatedCotacoes[option],
            [field]: value,
          };
          return { ...r, cotacoes: updatedCotacoes };
        }
        return r;
      })
    );
  };

  // Real-time stock checker helper
  const checkStockAvailability = (
    item: string,
    model: string | undefined,
    qtyRequired: number
  ): { available: boolean; msg: string; sku: string } | null => {
    const match = stockItems.find(
      (s) =>
        s.item.toLowerCase().includes(item.toLowerCase()) ||
        item.toLowerCase().includes(s.item.toLowerCase())
    );

    if (!match) return null;

    if (match.qty >= qtyRequired) {
      return {
        available: true,
        msg: `Item disponível em estoque físico! Temos ${match.qty} un no SKU ${match.id} (Marca: ${match.brand || "N/A"}). Você pode optar por retirar o item diretamente economizando o caixa florestal!`,
        sku: match.id,
      };
    } else {
      return {
        available: false,
        msg: `Encontrado item correspondente "${match.item}" no SKU ${match.id}, porém o saldo é insuficiente (Apenas ${match.qty} un disponíveis, solicitado: ${qtyRequired} un). Prossiga com o fluxo de cotações convencionais.`,
        sku: match.id,
      };
    }
  };

  // Real-time historical quotation lookup helper
  const getLastHistoricalQuote = (
    item: string,
    brand: string | undefined
  ): { supplier: string; price: number; date: string; brand: string } | null => {
    const match = historicalQuotes.find(
      (h) =>
        h.item.toLowerCase().includes(item.toLowerCase()) ||
        item.toLowerCase().includes(h.item.toLowerCase())
    );

    if (!match) return null;

    return {
      supplier: match.fornecedor,
      price: match.valor,
      date: match.data,
      brand: match.brand,
    };
  };

  // Step 3: Approve/Authorize purchase selecting winning option
  const handleAutorizarCompra = (id: number) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;

    if (!req.opcaoVencedora) {
      alert("Por favor, selecione qual cotação de fornecedor foi aprovada (Opção A, B ou C) antes de autorizar.");
      return;
    }

    const winner = req.cotacoes[req.opcaoVencedora];
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updatedHistory = addHistory(
            r.history,
            "Autorizado - Emitir OC",
            "Roberto Diretor (Aprovador)",
            `Compra autorizada com o fornecedor ${winner.fornecedor} no valor de ${formatCurrency(winner.valor)}.`
          );
          return {
            ...r,
            status: "Autorizado - Emitir OC",
            history: updatedHistory,
          };
        }
        return r;
      })
    );

    addLog(`Compra #${id} AUTORIZADA com o fornecedor ${winner.fornecedor}.`, "success");
  };

  // Step 3: Cancel / Reject request
  const handleRejeitarPedido = (id: number, reason?: string) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const detail = reason ? ` Justificativa: "${reason}"` : " Sem justificativa informada.";
          return {
            ...r,
            status: "Cancelado",
            rejectionReason: reason || undefined,
            history: addHistory(
              r.history,
              "Cancelado",
              activeUser,
              `Solicitação rejeitada pelo gestor operacional.${detail}`
            ),
          };
        }
        return r;
      })
    );
    addLog(`Solicitação #${id} cancelada pelo gerente. Motivo: ${reason || "Não informado"}.`, "warn");
    addNotification(
      "Solicitação Recusada pelo Gerente",
      `O pedido #${id} foi recusado por ${activeUser}.` + (reason ? ` Motivo: ${reason}` : ""),
      "warn",
      "solicitacao",
      id
    );
    setRejectionRequestId(null);
    setRejectionReasonInput("");
  };

  // Step 4: Emit Purchase Order (OC) & Setup Installments/Payment info
  const handleEmitirOrdemCompra = (id: number) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;

    if (!req.paymentMethod) {
      alert("Selecione o meio de pagamento (Boleto, PIX ou TED) antes de efetivar.");
      return;
    }
    if (!req.paymentTerms) {
      alert("Informe a condição de pagamento (Ex: À vista, 30 dias, 30/60d).");
      return;
    }
    if (!req.deadline) {
      alert("Selecione ou digite um prazo de entrega.");
      return;
    }

    // Specific payment method validations
    if (req.paymentMethod === "PIX" && !req.pixKey.trim()) {
      alert("Por favor, informe a Chave PIX.");
      return;
    }
    if (req.paymentMethod === "Boleto" && !req.boletoBarcode.trim()) {
      alert("Por favor, preencha o código de barras do Boleto.");
      return;
    }
    if (
      req.paymentMethod === "TED" &&
      (!req.tedBank || !req.tedAgency || !req.tedAccount || !req.tedDoc)
    ) {
      alert("Preencha todos os dados bancários para o TED (Banco, Agência, Conta e CPF/CNPJ).");
      return;
    }

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const winnerPrice = r.cotacoes[r.opcaoVencedora].valor || 0;
          // Determine number of installments from terms string (rough estimation or defaults)
          let numInstallments = 1;
          if (r.paymentTerms.toLowerCase().includes("3 parcelas") || r.paymentTerms.includes("30/60/90")) {
            numInstallments = 3;
          } else if (
            r.paymentTerms.toLowerCase().includes("2 parcelas") ||
            r.paymentTerms.includes("30/60") ||
            r.paymentTerms.includes("duas")
          ) {
            numInstallments = 2;
          }

          const calculatedInstallments = generateInstallments(winnerPrice, r.paymentTerms, numInstallments);

          const updatedHistory = addHistory(
            r.history,
            "OC Emitida - Enviado ao Financeiro",
            r.buyer,
            `Ordem de Compra emitida via ${r.paymentMethod} (${r.paymentTerms}). Enviada ao financeiro para conferência física de Nota Fiscal.`
          );

          return {
            ...r,
            status: "OC Emitida - Enviado ao Financeiro",
            installments: calculatedInstallments,
            history: updatedHistory,
          };
        }
        return r;
      })
    );

    addLog(`Ordem de Compra #${id} gerada e enviada para o faturamento/pagamento do Financeiro.`, "success");
  };

  // Step 5: Finance Liquidates/Pays a request installment or entire PO
  const handleLiquidarCompra = (id: number) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;

    if (!req.invoiceNumber.trim()) {
      alert("Aviso: É obrigatório inserir o número da Nota Fiscal (NF-e) para realizar a conferência.");
      return;
    }

    if (!req.invoiceConfirmed) {
      alert("Aviso: Você deve marcar a caixa de confirmação dos dados físicos/XML da Nota Fiscal.");
      return;
    }

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updatedInstallments = r.installments.map((inst) => ({
            ...inst,
            status: "Pago" as const,
          }));

          const updatedHistory = addHistory(
            r.history,
            "Liquidado / Pago",
            "Flávia Financeiro (Contas a Pagar)",
            `Nota Fiscal ${r.invoiceNumber} validada e registrada. Pagamentos liquidados no fluxo de caixa.`
          );

          return {
            ...r,
            status: "Liquidado / Pago",
            installments: updatedInstallments,
            paymentDate: new Date().toLocaleString("pt-BR"),
            history: updatedHistory,
          };
        }
        return r;
      })
    );

    // Automatically replenish stock if CC is "Estoque"
    replenishStockFromPurchase(req);

    addLog(`Compra #${id} completamente liquidada e faturada via NF-${req.invoiceNumber}.`, "success");
  };

  // Step 5: Pay single installment
  const handlePagarParcela = (id: number, installmentNum: number) => {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const updatedInstallments = r.installments.map((inst) => {
            if (inst.number === installmentNum) {
              return { ...inst, status: "Pago" as const };
            }
            return inst;
          });

          const allPaid = updatedInstallments.every((inst) => inst.status === "Pago");

          return {
            ...r,
            installments: updatedInstallments,
            status: allPaid ? "Liquidado / Pago" : r.status,
            paymentDate: allPaid ? new Date().toLocaleString("pt-BR") : r.paymentDate,
            history: addHistory(
              r.history,
              allPaid ? "Liquidado / Pago" : r.status,
              "Flávia Financeiro",
              `Parcela ${installmentNum} paga individualmente.`
            ),
          };
        }
        return r;
      })
    );
    addLog(`Parcela ${installmentNum} do pedido #${id} liquidada pelo financeiro.`, "success");
  };

  // Toggle histories dropdown list
  const toggleHistory = (id: number) => {
    setExpandedHistories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Financial Dashboard calculation of paid / pending expenses
  const expenseMetrics = useMemo(() => {
    let totalPago = 0;
    let totalPendente = 0;

    const porCentroCusto: Record<string, number> = {
      "CC-MANUTENCAO-10": 0,
      "CC-FLORESTAL-20": 0,
      "CC-ABASTEC-30": 0,
      "OUTROS/GERAL": 0,
    };

    const porMeioPagamento: Record<string, number> = {
      PIX: 0,
      Boleto: 0,
      TED: 0,
    };

    requests.forEach((r) => {
      const winner = r.opcaoVencedora ? r.cotacoes[r.opcaoVencedora] : null;
      if (!winner || winner.valor === null) return;

      const valorTotal = winner.valor;

      if (r.status === "Liquidado / Pago") {
        totalPago += valorTotal;

        // Group by cost center
        const cc = r.costCenter;
        if (porCentroCusto[cc] !== undefined) {
          porCentroCusto[cc] += valorTotal;
        } else {
          porCentroCusto["OUTROS/GERAL"] += valorTotal;
        }

        // Group by payment method
        const pm = r.paymentMethod;
        if (porMeioPagamento[pm] !== undefined) {
          porMeioPagamento[pm] += valorTotal;
        }
      } else if (r.status === "OC Emitida - Enviado ao Financeiro") {
        totalPendente += valorTotal;
      }
    });

    return {
      totalPago,
      totalPendente,
      porCentroCusto,
      porMeioPagamento,
    };
  }, [requests]);

  // Status badges configuration helper
  const getBadgeClass = (status: ProcurementRequest["status"]) => {
    switch (status) {
      case "Pendente Cotação":
        return "bg-blue-50 text-blue-700 border border-blue-200/50";
      case "Aguardando Autorização":
        return "bg-amber-50 text-amber-700 border border-amber-200/50 animate-pulse";
      case "Autorizado - Emitir OC":
        return "bg-purple-50 text-purple-700 border border-purple-200/50";
      case "OC Emitida - Enviado ao Financeiro":
        return "bg-indigo-50 text-indigo-700 border border-indigo-200/50";
      case "Liquidado / Pago":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/50";
      case "Cancelado":
        return "bg-rose-50 text-rose-700 border border-rose-200/50";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  // Helper to get status title step string
  const getStatusStepTitle = (status: ProcurementRequest["status"]) => {
    switch (status) {
      case "Pendente Cotação":
        return "Fase 2: Cadastrar Cotações";
      case "Aguardando Autorização":
        return "Fase 3: Autorização do Gerente";
      case "Autorizado - Emitir OC":
        return "Fase 4: Efetivar Condições & Emitir OC";
      case "OC Emitida - Enviado ao Financeiro":
        return "Fase 5: Faturamento & Nota Fiscal";
      case "Liquidado / Pago":
        return "Concluído: Liquidado / Arquivado";
      case "Cancelado":
        return "Cancelado / Recusado";
    }
  };

  // Quick helper to filter status lists for render
  const filtrarStatus = (status: ProcurementRequest["status"]) => {
    return filteredRequests.filter((r) => r.status === status);
  };

  // Unified export buttons renderer for each stage
  const renderExportButtons = (stageName: string, itemsCount: number) => {
    const handleExportExcel = () => {
      alert(`Relatório consolidado de [${stageName}] contendo ${itemsCount} registros exportado com sucesso para EXCEL (.xlsx)!`);
      addLog(`Relatório da etapa [${stageName}] exportado em EXCEL pelo usuário.`, "success");
    };
    const handleExportPDF = () => {
      window.print();
      addLog(`Relatório da etapa [${stageName}] impresso em formato PDF pelo usuário.`, "success");
    };
    return (
      <div className="flex items-center space-x-2 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100 shadow-sm self-end sm:self-auto max-w-max">
        <span className="text-[10px] font-mono uppercase font-bold text-slate-500 px-1">Exportar ({itemsCount}):</span>
        <button
          onClick={handleExportExcel}
          className="bg-[#047857] hover:bg-[#064E3B] text-white font-bold px-2.5 py-1 rounded-lg transition text-[10px] flex items-center space-x-1 cursor-pointer"
          title="Exportar para planilha Excel"
        >
          <span>📥 Excel</span>
        </button>
        <button
          onClick={handleExportPDF}
          className="bg-slate-700 hover:bg-slate-900 text-white font-bold px-2.5 py-1 rounded-lg transition text-[10px] flex items-center space-x-1 cursor-pointer"
          title="Imprimir / Exportar PDF"
        >
          <span>🖨 PDF</span>
        </button>
      </div>
    );
  };

  return (
    <div id="portal-compras-florestais" className="flex flex-col min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#1E293B]">
      
      {/* ENTERPRISE APP HEADER */}
      <header className="sticky top-0 z-40 bg-gradient-to-r from-[#064E3B] via-[#022C22] to-[#0F172A] text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col lg:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <AraucariaLogo variant="light" className="w-10 h-10" />
            <span className="hidden sm:inline-block text-[9px] uppercase font-mono tracking-widest bg-emerald-800 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-700 font-semibold">
              Governança & Compras
            </span>
          </div>

          {/* SEQUENTIAL WORKFLOW SELECTOR */}
          <nav className="flex flex-wrap items-center gap-1.5 bg-[#022C22]/90 p-1 rounded-xl border border-emerald-800/50 shadow-inner">
            <button
              onClick={() => setAbaAtiva("solicitacao")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition duration-150 flex items-center space-x-1 ${
                abaAtiva === "solicitacao"
                  ? "bg-[#F59E0B] text-[#022C22] shadow"
                  : "text-emerald-100 hover:bg-emerald-800/40"
              }`}
            >
              <span>1) SOLICITAÇÃO</span>
            </button>

            <button
              onClick={() => setAbaAtiva("cotacoes")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition duration-150 flex items-center space-x-1 ${
                abaAtiva === "cotacoes"
                  ? "bg-[#F59E0B] text-[#022C22] shadow"
                  : "text-emerald-100 hover:bg-emerald-800/40"
              }`}
            >
              <span>2) COTAÇÕES</span>
              {countFase("Pendente Cotação") > 0 && (
                <span className="bg-[#3B82F6] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  {countFase("Pendente Cotação")}
                </span>
              )}
            </button>

            <button
              onClick={() => setAbaAtiva("autorizador")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition duration-150 flex items-center space-x-1 ${
                abaAtiva === "autorizador"
                  ? "bg-[#F59E0B] text-[#022C22] shadow"
                  : "text-emerald-100 hover:bg-emerald-800/40"
              }`}
            >
              <span>3) GERENTE</span>
              {countFase("Aguardando Autorização") > 0 && (
                <span className="bg-[#EF4444] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                  {countFase("Aguardando Autorização")}
                </span>
              )}
            </button>

            <button
              onClick={() => setAbaAtiva("efetivar")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition duration-150 flex items-center space-x-1 ${
                abaAtiva === "efetivar"
                  ? "bg-[#F59E0B] text-[#022C22] shadow"
                  : "text-emerald-100 hover:bg-emerald-800/40"
              }`}
            >
              <span>4) COMPRAS</span>
              {countFase("Autorizado - Emitir OC") > 0 && (
                <span className="bg-[#D97706] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  {countFase("Autorizado - Emitir OC")}
                </span>
              )}
            </button>

            <button
              onClick={() => setAbaAtiva("financeiro")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition duration-150 flex items-center space-x-1 ${
                abaAtiva === "financeiro"
                  ? "bg-[#F59E0B] text-[#022C22] shadow"
                  : "text-emerald-100 hover:bg-emerald-800/40"
              }`}
            >
              <span>5) FINANCEIRO</span>
              {countFase("OC Emitida - Enviado ao Financeiro") > 0 && (
                <span className="bg-[#10B981] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                  {countFase("OC Emitida - Enviado ao Financeiro")}
                </span>
              )}
            </button>

            <button
              onClick={() => setAbaAtiva("estoque")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition duration-150 flex items-center space-x-1 ${
                abaAtiva === "estoque"
                  ? "bg-[#F59E0B] text-[#022C22] shadow"
                  : "text-emerald-100 hover:bg-emerald-800/40"
              }`}
            >
              <span>6) ESTOQUE</span>
            </button>

            <button
              onClick={() => setAbaAtiva("cadastros")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition duration-150 flex items-center space-x-1 ${
                abaAtiva === "cadastros"
                  ? "bg-[#D97706] text-white shadow"
                  : "bg-emerald-900/40 text-emerald-100 hover:bg-emerald-800/40 border border-emerald-700/30"
              }`}
              title="Cadastro de Centro de Custo, Fornecedores, Itens e Marcas"
            >
              <span>⚙️ CADASTROS</span>
            </button>
          </nav>

          {/* IDENTITY SELECTOR & ACTIONS */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Identity select */}
            <div className="bg-slate-800/80 rounded-xl p-1 px-2 border border-slate-700/80 flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-medium">Usuário:</span>
              <select
                value={activeUser}
                onChange={(e) => {
                  setActiveUser(e.target.value);
                  addLog(`Identidade alterada para: ${e.target.value}`, "info");
                }}
                className="bg-transparent font-semibold text-amber-400 focus:outline-none cursor-pointer pr-1"
              >
                <option value="Administrador Geral" className="bg-[#0F172A] text-white font-bold">👑 Admin Geral</option>
                <option value="Daniel Silva" className="bg-[#0F172A] text-white">🚜 Daniel Silva (Solicitador)</option>
                <option value="Marcos Souza" className="bg-[#0F172A] text-white">🚜 Marcos Souza (Solicitador)</option>
                <option value="Márcio Souza" className="bg-[#0F172A] text-white">💼 Márcio Souza (Comprador)</option>
                <option value="Patrícia Melo" className="bg-[#0F172A] text-white">💼 Patrícia Melo (Compradora)</option>
                <option value="Roberto Diretor" className="bg-[#0F172A] text-white">👔 Roberto Diretor (Gerente)</option>
                <option value="Flávia Financeiro" className="bg-[#0F172A] text-white">💵 Flávia Finanças (Validador)</option>
              </select>
            </div>

            {/* Permissions button */}
            <button
              onClick={() => setShowPermissionsPanel(!showPermissionsPanel)}
              className={`p-2 rounded-xl border transition relative ${
                showPermissionsPanel 
                  ? "bg-amber-500 border-amber-600 text-[#022C22]" 
                  : "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
              }`}
              title="Configurar Acessos de Etapa"
            >
              ⚙
            </button>

            {/* Notification Bell with unread counter */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
                className="bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 p-2 rounded-xl transition relative flex items-center justify-center"
              >
                🔔
                {notifications.some(n => !n.read) && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-slate-900 animate-pulse"></span>
                )}
              </button>

              {showNotificationsMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
                  <div className="bg-[#064E3B] text-white px-4 py-2.5 flex justify-between items-center">
                    <span className="font-bold text-xs uppercase tracking-wider">Alertas de Solicitação</span>
                    <button 
                      onClick={() => {
                        setNotifications(prev => prev.map(n => ({...n, read: true})));
                        addLog("Todas as notificações lidas.", "info");
                      }}
                      className="text-[10px] text-emerald-200 hover:text-white font-semibold"
                    >
                      Lidas todas
                    </button>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                    {notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 ${!n.read ? "bg-amber-50/50" : ""}`}
                        onClick={() => {
                          setNotifications(prev => prev.map(item => item.id === n.id ? {...item, read: true} : item));
                          if (n.targetTab) {
                            setAbaAtiva(n.targetTab);
                          }
                          setShowNotificationsMenu(false);
                        }}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`font-bold uppercase text-[9px] ${
                            n.type === "warn" ? "text-rose-600" : n.type === "success" ? "text-emerald-700" : "text-blue-600"
                          }`}>{n.title}</span>
                          <span className="text-[8px] text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                        {n.targetTab && (
                          <span className="text-[9px] text-[#047857] hover:underline font-semibold mt-1 block">
                            → Navegar para esta etapa
                          </span>
                        )}
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="p-4 text-center text-slate-400">Nenhuma notificação recente.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* CORE INFO ALERTA / BANNER */}
      <div className="bg-[#E0F2FE] border-b border-[#BAE6FD] text-[#0369A1] text-xs px-6 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 font-medium">
          <div className="flex items-center space-x-2">
            <span className="bg-[#0284C7] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">INFO DE FLUXO</span>
            <p>
              Fluxo Sequencial Obrigatório: Apenas itens autorizados pelo Gerente passam à emissão de OC e faturamento financeiro.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">|</span>
            <span>Unidades da Operação: Oficina, Abastecimento, Florestas</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* GLOBAL SEARCH / CONTROLS SECTION */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por item, requisitante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F1F5F9] border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-xs font-semibold text-slate-500">
            <span>Legenda de Status:</span>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px]">Cotação</span>
              <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[10px]">Gerência</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px]">Faturamento</span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px]">Liquidado</span>
            </div>
          </div>
        </div>

        {/* ==============================================
            STEP 1: SOLICITAÇÃO (CAMPO & LOGS)
            ============================================== */}
        {/* ACCESS CONTROL INTERCEPT */}
        {!checkAbaAccess(abaAtiva) ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-rose-200 p-8 text-center max-w-xl mx-auto my-12 shadow-md">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-rose-50 text-rose-600 mb-4 border border-rose-100">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="font-display font-bold text-lg text-slate-950 mb-2">Acesso Restrito à Etapa</h2>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Você está logado como <strong className="text-slate-800 font-bold">{activeUser}</strong>.
              De acordo com a matriz de governança florestal da Araucária, você não possui autorização direta para acessar esta etapa.
            </p>
            
            <div className="bg-slate-50 rounded-xl p-4 text-left border border-slate-100 mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Profissionais Autorizados:</span>
              <div className="flex flex-wrap gap-1.5">
                {abaAtiva === "estoque" ? (
                  ["Administrador Geral", "Márcio Souza", "Patrícia Melo", "Flávia Financeiro"].map((name, i) => (
                    <span key={i} className="bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-100">
                      {name}
                    </span>
                  ))
                ) : (
                  stageAccess
                    .find((s) => 
                      s.stageId === (abaAtiva === "solicitacao" ? 1 : abaAtiva === "cotacoes" ? 2 : abaAtiva === "autorizador" ? 3 : abaAtiva === "efetivar" ? 4 : 5)
                    )
                    ?.authorizedNames.map((name, i) => (
                      <span key={i} className="bg-slate-200 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded">
                        {name}
                      </span>
                    )) || <span className="text-xs text-slate-400">Nenhum profissional cadastrado.</span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-amber-600 bg-amber-50 rounded-lg p-2.5 font-medium border border-amber-100">
              💡 Para testar esta etapa, mude sua identidade no menu suspenso de usuários localizado no canto superior direito do cabeçalho.
            </p>
          </div>
        ) : (
          <>
            {abaAtiva === "solicitacao" && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h2 className="font-display font-bold text-slate-900 text-base">Etapa 1: Solicitação de Compras & Logística</h2>
                    <p className="text-xs text-slate-500">Cadastre novas requisições e acompanhe o andamento em tempo real.</p>
                  </div>
                  {renderExportButtons("Etapa 1 - Solicitações", filteredRequests.length)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Input Form Column */}
            <div className="lg:col-span-1 space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-[#064E3B] to-[#047857] text-white px-5 py-4">
                  <h2 className="font-display font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                    <Plus className="w-4.5 h-4.5 text-[#F59E0B]" />
                    <span>Cadastrar Requisição</span>
                  </h2>
                  <p className="text-[10px] text-emerald-200 mt-1">Insira as especificações da peça ou serviço florestal</p>
                </div>

                <form onSubmit={handleCadastrarSolicitacao} className="p-5 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Origem do Pedido</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(["Portal de Campo", "E-mail", "Integração ERP"] as const).map((src) => (
                        <button
                          key={src}
                          type="button"
                          onClick={() => setFormSource(src)}
                          className={`py-1.5 rounded text-[10px] font-semibold border ${
                            formSource === src
                              ? "bg-emerald-50 border-emerald-600 text-emerald-800"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {src}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Nome do Requisitante</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: João da Oficina / Motorista Marcos"
                      value={formRequester}
                      onChange={(e) => setFormRequester(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Ativo de Destinação (Frota/Corte)</label>
                    <select
                      value={formTarget}
                      onChange={(e) => setFormTarget(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    >
                      <option value="Caminhão Scania Placa ABC-1234">Caminhão Scania Placa ABC-1234 (Madeireiro)</option>
                      <option value="Caminhão Volvo Placa XYZ-5678">Caminhão Volvo Placa XYZ-5678 (Cavaco)</option>
                      <option value="Trator Skidder John Deere 01">Trator Skidder John Deere 01 (Extração)</option>
                      <option value="Harvester Caterpillar 02">Harvester Caterpillar 02 (Corte Florestal)</option>
                      <option value="Manutenção Geral Oficina">Manutenção Geral / Oficina Mecânica</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Categoria de Compras</label>
                    <select
                      value={formDept}
                      onChange={(e) => setFormDept(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    >
                      <option value="Oficina Mecânica">Oficina Mecânica / Peças de Reposição</option>
                      <option value="Operação Florestal">Operação Florestal / Cabos e Arraste</option>
                      <option value="Abastecimento">Combustível & Lubrificantes</option>
                      <option value="Desconhecido">Sem Categoria Definida (Simular Ajuste Manual)</option>
                    </select>
                  </div>

                   <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Item / Peça / Serviço</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Comece a digitar. Ex: Mangueira, Pneu, Óleo..."
                        value={formItem}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormItem(val);
                          if (val.trim().length > 1) {
                            const suggestions = STANDARD_ITEMS_LIST.filter(item => 
                              item.item.toLowerCase().includes(val.toLowerCase())
                            );
                            setAutocompleteSuggestions(suggestions);
                            setShowSuggestions(true);
                          } else {
                            setAutocompleteSuggestions([]);
                            setShowSuggestions(false);
                          }
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                      />
                      {showSuggestions && autocompleteSuggestions.length > 0 && (
                        <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-40 overflow-y-auto text-xs divide-y divide-slate-100">
                          {autocompleteSuggestions.map((sug, idx) => (
                            <li 
                              key={idx}
                              onClick={() => {
                                setFormItem(sug);
                                setShowSuggestions(false);
                              }}
                              className="p-2 hover:bg-emerald-50 cursor-pointer font-medium text-slate-700 hover:text-emerald-900 transition"
                            >
                              {sug}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Modelo</label>
                      <input
                        type="text"
                        list="modelos-sugeridos"
                        placeholder="Ex: 295/80 R22.5, Scania R440"
                        value={formItemModel}
                        onChange={(e) => setFormItemModel(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Marca / Fabricante</label>
                      <input
                        type="text"
                        list="marcas-sugeridos"
                        placeholder="Ex: Michelin, Bosch, Mobil"
                        value={formItemBrand}
                        onChange={(e) => setFormItemBrand(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Quantidade Requerida</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formQty}
                      onChange={(e) => setFormQty(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                    />
                  </div>

                  {/* DOUBLE ACTION PHOTO COMPONENT */}
                  <div className="border border-slate-100 p-3 rounded-xl bg-slate-50/50 space-y-2">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Imagem / Evidência Visual</span>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCameraActive(!isCameraActive);
                          if (!isCameraActive) {
                            addLog("Ativando simulador de câmera do smartphone...", "info");
                          }
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition border flex items-center justify-center space-x-1 ${
                          isCameraActive 
                            ? "bg-rose-600 border-rose-600 text-white" 
                            : "bg-[#064E3B] border-[#064E3B] text-white hover:bg-[#042F1A]"
                        }`}
                      >
                        <span>{isCameraActive ? "⏹ Parar Câmera" : "📷 Tirar Foto (Celular)"}</span>
                      </button>

                      <label className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center justify-center space-x-1 cursor-pointer text-center">
                        <span>📁 Upload de Imagem</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                setFormPhoto(event.target?.result as string);
                                addLog(`Evidência de imagem carregada via arquivo: ${file.name}`, "success");
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>

                    {isCameraActive && (
                      <div className="bg-slate-900 rounded-lg p-3 text-center border border-slate-700 animate-pulse text-white space-y-2">
                        <div className="flex items-center justify-center space-x-1.5">
                          <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
                          <span className="text-[10px] font-semibold font-mono uppercase text-rose-400">CÂMERA ATIVA</span>
                        </div>
                        <p className="text-[10px] text-slate-400">Aponte para o código de barras ou placa de metal do ativo florestal.</p>
                        <button
                          type="button"
                          onClick={() => {
                            const sampleTechnicalPhoto = "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?q=80&w=300&auto=format&fit=crop";
                            setFormPhoto(sampleTechnicalPhoto);
                            setIsCameraActive(false);
                            addLog("Foto técnica de ativo capturada com sucesso!", "success");
                          }}
                          className="bg-emerald-600 text-white font-bold py-1 px-2.5 rounded text-[10px] hover:bg-emerald-700 transition"
                        >
                          ⚡ Disparar Obturador (Celular)
                        </button>
                      </div>
                    )}

                    {formPhoto && (
                      <div className="relative border border-slate-200 rounded-lg overflow-hidden h-20 bg-slate-100 flex items-center justify-center">
                        <img referrerPolicy="no-referrer" src={formPhoto} alt="Preview do Ativo" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormPhoto(null)}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-black text-white p-1 rounded-full text-[10px] leading-none"
                        >
                          ❌
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/70 text-emerald-400 font-mono text-[8px] px-1 rounded uppercase">
                          EVIDÊNCIA FOTOGRÁFICA
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-[#022C22] font-bold py-2.5 rounded-xl transition duration-150 text-xs shadow-md border border-[#FBBF24]/20 flex justify-center items-center space-x-2 cursor-pointer"
                  >
                    <span>Enviar para Cotação de Compras</span>
                  </button>
                </form>
              </div>

              {/* ROBOT LOGS PANEL */}
              <div className="bg-[#0F172A] rounded-2xl border border-slate-800 p-5 shadow-lg text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                    <h3 className="font-display font-bold text-xs uppercase tracking-wider text-slate-400">Atividades do Sistema</h3>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400">ONLINE</span>
                </div>
                <div className="space-y-2.5 max-h-48 overflow-y-auto font-mono text-[10px]">
                  {logs.map((log, index) => (
                    <div key={index} className="border-l-2 border-emerald-600 pl-2 py-0.5">
                      <span className="text-slate-500 font-semibold">[{log.time}]</span>{" "}
                      <span className={log.type === "warn" ? "text-rose-400" : log.type === "success" ? "text-emerald-400" : "text-slate-300"}>
                        {log.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* List Column */}
            <div className="lg:col-span-2 space-y-4">
              
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h2 className="font-display font-bold text-slate-900 text-sm">Controle de Progresso de Solicitações</h2>
                  <span className="text-[10px] text-slate-500 font-medium">Total de registros: {requests.length}</span>
                </div>

                <div className="space-y-4">
                  {filteredRequests.map((req) => (
                    <div key={req.id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition duration-150">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-slate-500 text-xs">#{req.id}</span>
                          <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {req.source}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-slate-400">{req.timestamp}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getBadgeClass(req.status)}`}>
                            {req.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wide">Item / Peça</span>
                          <span className="font-bold text-slate-800">{req.item}</span>
                          <span className="text-[10px] text-slate-500 block">Qtd: {req.qty}</span>
                          {(req.itemModel || req.itemBrand) && (
                            <span className="text-[10.5px] text-emerald-900 bg-emerald-50 px-1 py-0.2 rounded text-[9.5px] font-semibold block w-max mt-1">
                              {req.itemModel || "N/A"} {req.itemBrand ? `(${req.itemBrand})` : ""}
                            </span>
                          )}
                          {req.photo && (
                            <div className="mt-1.5 flex items-center space-x-1">
                              <span className="text-slate-400">📷</span>
                              <button
                                onClick={() => {
                                  // Create a clean user prompt with the photo
                                  const popup = window.open("", "_blank");
                                  if (popup) {
                                    popup.document.write(`
                                      <html>
                                        <head>
                                          <title>Evidência Fotográfica - Requisicao #${req.id}</title>
                                          <style>
                                            body { margin: 0; display: flex; align-items: center; justify-content: center; background: #0f172a; font-family: sans-serif; color: white; }
                                            img { max-width: 90%; max-height: 90vh; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
                                            .info { position: absolute; bottom: 20px; font-size: 14px; background: rgba(0,0,0,0.7); padding: 8px 16px; border-radius: 20px; }
                                          </style>
                                        </head>
                                        <body>
                                          <img src="${req.photo}" />
                                          <div class="info">Peça Florestal: ${req.item} (Requisition ID: #${req.id})</div>
                                        </body>
                                      </html>
                                    `);
                                  } else {
                                    alert(`Aqui está o link da evidência fotográfica técnica: ${req.photo}`);
                                  }
                                }}
                                className="text-[10px] text-emerald-800 hover:text-emerald-950 font-bold hover:underline"
                              >
                                Ver Imagem Capturada
                              </button>
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wide">Destinatário Ativo</span>
                          <span className="font-semibold text-slate-700 block">{req.target}</span>
                          <span className="text-[10px] text-[#064E3B] font-medium">{req.dept}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wide">Centro de Custo</span>
                          {req.costCenter ? (
                            <span className="font-mono bg-emerald-50 border border-emerald-200/50 text-[#064E3B] text-[10px] px-1.5 py-0.5 rounded font-bold">
                              {req.costCenter}
                            </span>
                          ) : (
                            <span className="italic text-rose-500 text-[10px]">Pendente de Atribuição</span>
                          )}
                        </div>
                        <div>
                          <span className="text-slate-400 block font-bold text-[9px] uppercase tracking-wide">Comprador</span>
                          <span className="font-medium text-slate-600 block">{req.buyer || "Aguardando"}</span>
                        </div>
                      </div>

                      {/* Expanding Histories Details */}
                      <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => toggleHistory(req.id)}
                          className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center space-x-1"
                        >
                          <History className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{expandedHistories[req.id] ? "Ocultar Histórico" : "Ver Rastreabilidade"}</span>
                        </button>

                        {/* Quick Action visual indicators */}
                        {req.status === "Pendente Cotação" && (
                          <span className="text-[10px] text-blue-600 font-bold flex items-center gap-1">
                            Aguardando Compras Cotar <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                        {req.status === "Aguardando Autorização" && (
                          <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                            Aguardando Aprovação do Gerente <ArrowRight className="w-3 h-3 animate-pulse" />
                          </span>
                        )}
                        {req.status === "Autorizado - Emitir OC" && (
                          <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1">
                            Aguardando Efetivação / Parcelamento <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                        {req.status === "OC Emitida - Enviado ao Financeiro" && (
                          <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1">
                            Aguardando Nota Fiscal no Financeiro <ArrowRight className="w-3 h-3" />
                          </span>
                        )}
                        {req.status === "Liquidado / Pago" && (
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            Processo Concluído com NF <Check className="w-3 h-3" />
                          </span>
                        )}
                      </div>

                      {/* HISTORY EXPANSION PANEL */}
                      {expandedHistories[req.id] && (
                        <div className="mt-3 bg-white border border-slate-200/60 p-3.5 rounded-lg space-y-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b pb-1">
                            Logs de Rastreabilidade Operacional
                          </p>
                          <div className="space-y-2.5 pt-1">
                            {req.history.map((hist, index) => (
                              <div key={index} className="flex items-start text-xs space-x-2">
                                <span className="bg-emerald-50 text-[#064E3B] p-1 rounded-full text-[9px] font-bold">
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                                    <span className="font-bold text-slate-600">{hist.user}</span>
                                    <span>{hist.date}</span>
                                  </div>
                                  <p className="text-slate-600 mt-0.5 text-xs font-medium">
                                    {hist.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ))}

                  {filteredRequests.length === 0 && (
                    <div className="text-center py-12 text-slate-400 text-xs">
                      <Truck className="w-10 h-10 mx-auto opacity-30 mb-2" />
                      Nenhum pedido encontrado.
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
          </div>
        )}

        {/* ==============================================
            STEP 2: COMPRAS (COTAÇÕES & CC AUTOMÁTICO)
            ============================================== */}
        {abaAtiva === "cotacoes" && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-slate-900 text-base">Fila de Cotação de Fornecedores</h2>
                <p className="text-xs text-slate-500">Mapeie 3 orçamentos no mercado antes de remeter ao autorizador.</p>
              </div>
              {renderExportButtons("Etapa 2 - Cotações", filtrarStatus("Pendente Cotação").length)}
            </div>

            <div className="space-y-6">
              {filtrarStatus("Pendente Cotação").map((req) => (
                <div key={req.id} className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/50">
                  
                  {/* Automated Cost Center Validation Check Banner */}
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-[#EEF2F6] p-3 rounded-lg border border-slate-200 mb-4 text-xs">
                    <div>
                      <span className="bg-[#0284C7] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider block w-max">
                        Robô de Validação (Etapa 3)
                      </span>
                      <p className="font-semibold text-[#1E293B] mt-1">
                        Cruzando categoria <span className="text-emerald-800">"{req.dept}"</span> com a tabela de Centros de Custo do ERP.
                      </p>
                    </div>
                    <div>
                      {req.costCenter ? (
                        <div className="flex items-center space-x-1 bg-emerald-50 border border-emerald-300 text-[#064E3B] px-2.5 py-1 rounded-md font-bold text-[10px]">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>SUCESSO: {req.costCenter}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 bg-amber-50 border border-amber-300 text-amber-800 px-2.5 py-1 rounded-md font-bold text-[10px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          <span>NÃO IDENTIFICADO - DEFINE MANUAL</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual CC definition prompt */}
                  {req.needsCCManualInput && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-4 text-xs space-y-2">
                      <p className="font-bold text-rose-800">
                        Atenção Comprador: Centro de Custo não mapeado de forma automática pelo robô de ERP!
                      </p>
                      <p className="text-slate-600 text-xs">
                        Para poder continuar, insira manualmente um Centro de Custo válido para as despesas (Ex: CC-ADMIN-01, CC-LOGISTICA-22).
                      </p>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Ex: CC-ADMIN-05"
                          value={req.manualCC}
                          onChange={(e) =>
                            setRequests((prev) =>
                              prev.map((r) => (r.id === req.id ? { ...r, manualCC: e.target.value } : r))
                            )
                          }
                          className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs flex-grow outline-none focus:ring-1 focus:ring-emerald-700"
                        />
                        <button
                          onClick={() => handleDefinirCCManual(req.id)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-4 py-1.5 rounded-lg text-xs"
                        >
                          Confirmar Centro de Custo
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Quotation entries inputs */}
                  {!req.needsCCManualInput && (
                    <div className="space-y-4">
                      
                      {/* AUTOMATED STOCK CHECKER AND HISTORICAL QUOTES LOOKUP (INTELLIGENT COMPRADOR ACCELERATION) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {/* Stock Check Highlight */}
                        {(() => {
                          const avail = checkStockAvailability(req.item, req.itemModel, req.qty);
                          if (avail) {
                            return (
                              <div className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start space-x-2.5 ${
                                avail.available 
                                  ? "bg-amber-50 border-amber-300 text-amber-900 shadow-sm animate-pulse" 
                                  : "bg-slate-50 border-slate-200 text-slate-600"
                              }`}>
                                <span className="text-lg">📦</span>
                                <div>
                                  <strong className="block font-bold text-slate-800">Verificação Automática de Almoxarifado:</strong>
                                  <p className="mt-1 font-medium">{avail.msg}</p>
                                  {avail.available && (
                                    <button 
                                      onClick={() => {
                                        setAbaAtiva("estoque");
                                        addLog(`Navegou ao almoxarifado para retirar o SKU ${avail.sku}.`, "info");
                                      }}
                                      className="mt-2 bg-[#022C22] text-white hover:bg-[#064E3B] font-bold px-2 py-1 rounded text-[9px] uppercase transition cursor-pointer"
                                    >
                                      Ir Retirar no Estoque Físico
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="p-3.5 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 leading-relaxed flex items-start space-x-2.5 bg-slate-50/20">
                                <span className="text-lg">🔍</span>
                                <div>
                                  <strong className="block font-medium text-slate-600">Verificação de Almoxarifado:</strong>
                                  <p className="mt-0.5">Nenhuma peça correspondente ativa ou cadastrada atualmente no estoque físico central.</p>
                                </div>
                              </div>
                            );
                          }
                        })()}

                        {/* Historical Quotes Lookup */}
                        {(() => {
                          const hist = getLastHistoricalQuote(req.item, req.itemBrand);
                          if (hist) {
                            return (
                              <div className="p-3.5 rounded-xl border border-blue-200 text-xs leading-relaxed flex items-start space-x-2.5 bg-blue-50/50 text-blue-900 shadow-sm">
                                <span className="text-lg">📊</span>
                                <div>
                                  <strong className="block font-bold text-blue-950">Histórico de Cotações Florestais Anteriores:</strong>
                                  <p className="mt-1 font-medium">
                                    Última compra idêntica registrada em <span className="underline">{hist.date}</span> com o fornecedor <strong className="font-bold text-slate-800">"{hist.supplier}"</strong> por <strong className="font-bold text-emerald-800">{formatCurrency(hist.price)}</strong> (Marca: {hist.brand}).
                                  </p>
                                  <button
                                    onClick={() => {
                                      handleQuoteChange(req.id, "a", "fornecedor", hist.supplier);
                                      handleQuoteChange(req.id, "a", "valor", hist.price);
                                      addLog(`Auto-preenchido orçamento da Opção A baseado no histórico da compra anterior de ${hist.supplier}.`, "success");
                                    }}
                                    className="mt-2 bg-blue-800 text-white hover:bg-blue-950 font-bold px-2.5 py-1 rounded text-[9px] uppercase transition cursor-pointer"
                                  >
                                    Auto-Copiar Orçamento Histórico
                                  </button>
                                </div>
                              </div>
                            );
                          } else {
                            return (
                              <div className="p-3.5 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500 leading-relaxed flex items-start space-x-2.5 bg-slate-50/20">
                                <span className="text-lg">📝</span>
                                <div>
                                  <strong className="block font-medium text-slate-600">Referencial de Custo:</strong>
                                  <p className="mt-0.5">Nenhuma cotação pretérita cadastrada para este item específico. Negociar livremente.</p>
                                </div>
                              </div>
                            );
                          }
                        })()}
                      </div>

                      {/* INTEGRATED SUPPLIER COMMUNICATION ASSISTANT (WHATSAPP & EMAIL INTEGRATION) */}
                      <div className="border border-emerald-100 bg-emerald-50/30 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-[#064E3B] text-xs uppercase tracking-wide flex items-center gap-1.5">
                            <span>💬 Assistente Integrado de Contato com Fornecedores</span>
                            <span className="text-[8px] bg-emerald-700 text-white px-1.5 rounded font-mono uppercase tracking-widest">Sem Copiar-Colar Manual</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => {
                              if (showShareModalId === req.id) {
                                setShowShareModalId(null);
                              } else {
                                setShowShareModalId(req.id);
                                setShareVendorName("Peças Florestais PR");
                                setShareVendorPhone("+5541999999999");
                                setShareVendorEmail("comercial@pecasflorestais.com.br");
                                setShareMessageType("padrao");
                              }
                            }}
                            className="text-[10px] text-emerald-800 font-bold hover:underline"
                          >
                            {showShareModalId === req.id ? "⏹ Ocultar Contatos" : "⚡ Ativar Assistente"}
                          </button>
                        </div>

                        {showShareModalId === req.id && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2.5 border-t border-emerald-200/50 text-xs text-slate-700">
                            {/* Inputs Column */}
                            <div className="space-y-2">
                              <div>
                                <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Nome Fornecedor</label>
                                <input
                                  type="text"
                                  value={shareVendorName}
                                  onChange={(e) => setShareVendorName(e.target.value)}
                                  className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-700"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">WhatsApp (DDI + DDD + Num)</label>
                                  <input
                                    type="text"
                                    value={shareVendorPhone}
                                    onChange={(e) => setShareVendorPhone(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-700"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">E-mail para Orçamento</label>
                                  <input
                                    type="email"
                                    value={shareVendorEmail}
                                    onChange={(e) => setShareVendorEmail(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-700"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[9px] font-bold uppercase text-slate-400 mb-1">Modelo de Solicitação</label>
                                <select
                                  value={shareMessageType}
                                  onChange={(e) => setShareMessageType(e.target.value as "padrao" | "urgente")}
                                  className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                                >
                                  <option value="padrao">Cotação Padrão Araucária</option>
                                  <option value="urgente">🚨 URGENTE: Ativo / Caminhão Parado</option>
                                </select>
                              </div>
                            </div>

                            {/* Preview & Dispatch Column */}
                            <div className="bg-white p-3 rounded-lg border border-slate-100 flex flex-col justify-between">
                              <div>
                                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Visualização do Texto Florestal:</span>
                                <div className="p-2 bg-slate-50 rounded text-[10.5px] font-mono text-slate-600 border border-slate-100 select-all max-h-24 overflow-y-auto whitespace-pre-wrap">
                                  {shareMessageType === "urgente" 
                                    ? `🚨 COTAÇÃO URGENTE - ARAUCÁRIA FLORESTAL S/A\n\nOlá, ${shareVendorName}. Temos um ativo de transporte crítico PARADO na oficina esperando manutenção!\n\nSolicitamos orçamento com extrema urgência de:\nItem: ${req.qty}x ${req.item} ${req.itemModel ? `(${req.itemModel})` : ""} ${req.itemBrand ? `[Marca: ${req.itemBrand}]` : ""}\n\nPode responder com o menor valor e prazo de entrega por favor? Obrigado!`
                                    : `Olá, ${shareVendorName}. Gostaríamos de solicitar uma proposta comercial de sua empresa para faturamento de compras da Araucária Florestal.\n\nItem requerido:\n- ${req.qty} un de: ${req.item} ${req.itemModel ? `(Modelo: ${req.itemModel})` : ""} ${req.itemBrand ? `[Marca recomendada: ${req.itemBrand}]` : ""}\n\nFavor enviar orçamento indicando prazo de entrega e as melhores condições de parcelamento comercial. Obrigado!`
                                  }
                                </div>
                              </div>

                              <div className="flex gap-2 mt-2">
                                <a
                                  href={`https://api.whatsapp.com/send?phone=${shareVendorPhone.replace(/[^0-9+]/g, "")}&text=${encodeURIComponent(
                                    shareMessageType === "urgente" 
                                      ? `🚨 COTAÇÃO URGENTE - ARAUCÁRIA FLORESTAL S/A\n\nOlá, ${shareVendorName}. Temos um ativo de transporte crítico PARADO na oficina esperando manutenção!\n\nSolicitamos orçamento com extrema urgência de:\nItem: ${req.qty}x ${req.item} ${req.itemModel ? `(${req.itemModel})` : ""} ${req.itemBrand ? `[Marca: ${req.itemBrand}]` : ""}\n\nPode responder com o menor valor e prazo de entrega por favor? Obrigado!`
                                      : `Olá, ${shareVendorName}. Gostaríamos de solicitar uma proposta comercial de sua empresa para faturamento de compras da Araucária Florestal.\n\nItem requerido:\n- ${req.qty} un de: ${req.item} ${req.itemModel ? `(Modelo: ${req.itemModel})` : ""} ${req.itemBrand ? `[Marca recomendada: ${req.itemBrand}]` : ""}\n\nFavor enviar orçamento indicando prazo de entrega e as melhores condições de parcelamento comercial. Obrigado!`
                                  )}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold p-2 rounded text-center transition flex items-center justify-center space-x-1"
                                >
                                  <span>Enviar WhatsApp 💬</span>
                                </a>

                                <a
                                  href={`mailto:${shareVendorEmail}?subject=${encodeURIComponent(
                                    shareMessageType === "urgente" ? "🚨 COTAÇÃO URGENTE - ARAUCÁRIA S/A" : "Solicitação de Proposta Comercial - Araucária Florestal"
                                  )}&body=${encodeURIComponent(
                                    shareMessageType === "urgente" 
                                      ? `🚨 COTAÇÃO URGENTE - ARAUCÁRIA FLORESTAL S/A\n\nOlá, ${shareVendorName}. Temos um ativo de transporte crítico PARADO na oficina esperando manutenção!\n\nSolicitamos orçamento com extrema urgência de:\nItem: ${req.qty}x ${req.item} ${req.itemModel ? `(${req.itemModel})` : ""} ${req.itemBrand ? `[Marca: ${req.itemBrand}]` : ""}\n\nPode responder com o menor valor e prazo de entrega por favor? Obrigado!`
                                      : `Olá, ${shareVendorName}. Gostaríamos de solicitar uma proposta comercial de sua empresa para faturamento de compras da Araucária Florestal.\n\nItem requerido:\n- ${req.qty} un de: ${req.item} ${req.itemModel ? `(Modelo: ${req.itemModel})` : ""} ${req.itemBrand ? `[Marca recomendada: ${req.itemBrand}]` : ""}\n\nFavor enviar orçamento indicando prazo de entrega e as melhores condições de parcelamento comercial. Obrigado!`
                                  )}`}
                                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold p-2 rounded text-center transition flex items-center justify-center space-x-1"
                                >
                                  <span>Enviar E-mail ✉</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex justify-between items-center border-b pb-2">
                        <div className="text-xs">
                          <span className="font-bold text-slate-800 text-sm">#{req.id} - {req.item}</span>{" "}
                          <span className="text-slate-500">({req.qty} un.)</span>
                          <span className="text-slate-400 block mt-0.5">Destinado ao Ativo: {req.target}</span>
                        </div>
                        <div className="text-right text-xs">
                          <span className="text-slate-400 block uppercase font-bold text-[9px]">Comprador Alocado</span>
                          <span className="font-bold text-emerald-800">{req.buyer}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Option A */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                          <p className="font-bold text-slate-600 text-xs border-b pb-1.5 mb-2 flex justify-between items-center">
                            <span>OPÇÃO A</span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded">Fornecedor local</span>
                          </p>
                          <div className="space-y-2 text-xs">
                            <input
                              type="text"
                              list="fornecedores-sugeridos"
                              placeholder="Nome do Fornecedor A"
                              value={req.cotacoes.a.fornecedor}
                              onChange={(e) => handleQuoteChange(req.id, "a", "fornecedor", e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded outline-none text-xs focus:bg-white"
                            />
                            <input
                              type="number"
                              placeholder="Preço Total (R$)"
                              value={req.cotacoes.a.valor || ""}
                              onChange={(e) => handleQuoteChange(req.id, "a", "valor", parseFloat(e.target.value) || null)}
                              className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded outline-none text-xs focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* Option B */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                          <p className="font-bold text-slate-600 text-xs border-b pb-1.5 mb-2 flex justify-between items-center">
                            <span>OPÇÃO B</span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded">Fornecedor distribuidora</span>
                          </p>
                          <div className="space-y-2 text-xs">
                            <input
                              type="text"
                              list="fornecedores-sugeridos"
                              placeholder="Nome do Fornecedor B"
                              value={req.cotacoes.b.fornecedor}
                              onChange={(e) => handleQuoteChange(req.id, "b", "fornecedor", e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded outline-none text-xs focus:bg-white"
                            />
                            <input
                              type="number"
                              placeholder="Preço Total (R$)"
                              value={req.cotacoes.b.valor || ""}
                              onChange={(e) => handleQuoteChange(req.id, "b", "valor", parseFloat(e.target.value) || null)}
                              className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded outline-none text-xs focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* Option C */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                          <p className="font-bold text-slate-600 text-xs border-b pb-1.5 mb-2 flex justify-between items-center">
                            <span>OPÇÃO C (Opcional)</span>
                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded">Outro concorrente</span>
                          </p>
                          <div className="space-y-2 text-xs">
                            <input
                              type="text"
                              list="fornecedores-sugeridos"
                              placeholder="Nome do Fornecedor C"
                              value={req.cotacoes.c.fornecedor}
                              onChange={(e) => handleQuoteChange(req.id, "c", "fornecedor", e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded outline-none text-xs focus:bg-white"
                            />
                            <input
                              type="number"
                              placeholder="Preço Total (R$)"
                              value={req.cotacoes.c.valor || ""}
                              onChange={(e) => handleQuoteChange(req.id, "c", "valor", parseFloat(e.target.value) || null)}
                              className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded outline-none text-xs focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs">
                        <span className="text-slate-500 italic">
                          * Insira ao menos duas propostas de fornecedores para que o gestor decida a melhor.
                        </span>
                        <button
                          onClick={() => handleEnviarParaAutorizacao(req.id)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-2 rounded-xl transition shadow"
                        >
                          Salvar Cotações & Enviar ao Gerente
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              ))}

              {filtrarStatus("Pendente Cotação").length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <CheckCircle className="w-10 h-10 mx-auto text-emerald-600 opacity-60 mb-2" />
                  Excelente! Todas as solicitações estão com cotações cadastradas.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==============================================
            STEP 3: GERENTE (AUTORIZADOR & COMPARATIVO)
            ============================================== */}
        {abaAtiva === "autorizador" && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-slate-900 text-base">Painel de Autorização do Gerente Operacional</h2>
                <p className="text-xs text-slate-500">Compare as cotações preenchidas pelo setor de compras e autorize a emissão da OC.</p>
              </div>
              {renderExportButtons("Etapa 3 - Autorizações", filtrarStatus("Aguardando Autorização").length)}
            </div>

            <div className="space-y-6">
              {filtrarStatus("Aguardando Autorização").map((req) => {
                // Determine cheaper quote to highlight automatically
                const options = [
                  { opt: "a" as const, val: req.cotacoes.a.valor, label: "Opção A", forn: req.cotacoes.a.fornecedor },
                  { opt: "b" as const, val: req.cotacoes.b.valor, label: "Opção B", forn: req.cotacoes.b.fornecedor },
                  { opt: "c" as const, val: req.cotacoes.c.valor, label: "Opção C", forn: req.cotacoes.c.fornecedor },
                ].filter((item) => item.val !== null);

                const cheaperOption = options.reduce((min, cur) => {
                  if (min.val === null) return cur;
                  if (cur.val === null) return min;
                  return cur.val < min.val ? cur : min;
                }, options[0]);

                return (
                  <div key={req.id} className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/50">
                    
                    {/* Visual Audit document header metadata representation (Step 4 of the flow chart) */}
                    <div className="bg-slate-900 text-white rounded-xl p-4 mb-4 font-mono text-xs shadow-inner">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-2 mb-3">
                        <span className="text-[#F59E0B] font-bold uppercase tracking-wider text-[10px]">
                          FICHA DE REQUISIÇÃO FORMATADA (AUDITORIA INTERNA FLORESTAL)
                        </span>
                        <span className="text-[10px] text-slate-400">Rastreabilidade Certificada</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-300 text-[11px]">
                        <div><strong>Número de Auditoria:</strong> {req.auditLink}</div>
                        <div><strong>Registro de Carimbo (Timestamp):</strong> {req.timestamp}</div>
                        <div><strong>Ativo de Destinação:</strong> {req.target}</div>
                        <div><strong>Centro de Custo de Débito:</strong> {req.costCenter}</div>
                        <div><strong>Requisitante Florestal:</strong> {req.requester}</div>
                        <div><strong>Item / Peça / Serviço:</strong> {req.item} (Qtd: {req.qty})</div>
                      </div>
                    </div>

                    {/* Compare options side-by-side */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wide">
                        Comparativo de Preços das Cotações
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {options.map((item) => {
                          const isCheapest = item.opt === cheaperOption?.opt;
                          return (
                            <div
                              key={item.opt}
                              className={`p-4 rounded-xl border transition ${
                                isCheapest
                                  ? "bg-emerald-50 border-emerald-400 shadow-sm"
                                  : "bg-white border-slate-200"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-slate-500 text-xs">{item.label}</span>
                                {isCheapest && (
                                  <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                                    Melhor Preço
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold text-slate-800 text-sm truncate">{item.forn}</p>
                              <p className="text-base font-bold text-slate-900 mt-2">
                                {formatCurrency(item.val)}
                              </p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Approval controls */}
                      <div className="bg-[#EEF2F6] p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-3 mt-4 text-xs">
                        <div className="flex items-center space-x-2">
                          <label className="font-bold text-slate-700">Eleger Fornecedor Vencedor:</label>
                          <select
                            value={req.opcaoVencedora}
                            onChange={(e) =>
                              setRequests((prev) =>
                                prev.map((r) =>
                                  r.id === req.id
                                    ? { ...r, opcaoVencedora: e.target.value as "a" | "b" | "c" | "" }
                                    : r
                                )
                              )
                            }
                            className="bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold focus:outline-none"
                          >
                            <option value="">Selecione...</option>
                            {req.cotacoes.a.fornecedor && (
                              <option value="a">Opção A: {req.cotacoes.a.fornecedor}</option>
                            )}
                            {req.cotacoes.b.fornecedor && (
                              <option value="b">Opção B: {req.cotacoes.b.fornecedor}</option>
                            )}
                            {req.cotacoes.c.fornecedor && (
                              <option value="c">Opção C: {req.cotacoes.c.fornecedor}</option>
                            )}
                          </select>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto justify-end">
                          <input
                            type="text"
                            placeholder="Motivo da recusa (opcional)..."
                            value={tempRejectionReasons[req.id] || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setTempRejectionReasons(prev => ({ ...prev, [req.id]: val }));
                            }}
                            className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs outline-none focus:ring-1 focus:ring-rose-500 w-full sm:w-56"
                          />
                          <button
                            onClick={() => {
                              const reason = tempRejectionReasons[req.id] || "";
                              handleRejeitarPedido(req.id, reason);
                            }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 py-2 rounded-xl font-bold transition whitespace-nowrap text-xs"
                          >
                            Recusar / Cancelar Compra
                          </button>
                          <button
                            onClick={() => handleAutorizarCompra(req.id)}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2 rounded-xl font-bold transition shadow text-xs whitespace-nowrap"
                          >
                            Autorizar Orçamento Selecionado
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                );
              })}

              {filtrarStatus("Aguardando Autorização").length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <CheckCircle className="w-10 h-10 mx-auto text-emerald-600 opacity-60 mb-2" />
                  Excelente! Nenhuma cotação pendente de aprovação de orçamento.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==============================================
            STEP 4: COMPRAS (EFETIVAR COMPRAS / COND. PAGAMENTO)
            ============================================== */}
        {abaAtiva === "efetivar" && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-slate-900 text-base">Efetivar Condições de Pagamento & Emissão de OC</h2>
                <p className="text-xs text-slate-500">Defina prazos de entrega, parcelamento automático, chave pix, boleto ou dados TED da compra autorizada.</p>
              </div>
              {renderExportButtons("Etapa 4 - Efetivação / OCs", filtrarStatus("Autorizado - Emitir OC").length)}
            </div>

            <div className="space-y-6">
              {filtrarStatus("Autorizado - Emitir OC").map((req) => {
                const winner = req.cotacoes[req.opcaoVencedora];
                return (
                  <div key={req.id} className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/50 space-y-4">
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          Aprovado pelo Diretor
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm mt-1">
                          #{req.id} - {req.item} (Qtd: {req.qty}) para {req.target}
                        </h3>
                      </div>
                      <div className="text-right text-xs">
                        <span className="text-slate-400 block font-bold text-[9px] uppercase">Orçamento Autorizado</span>
                        <span className="text-base font-bold text-slate-800">
                          {winner ? formatCurrency(winner.valor) : "R$ 0,00"} ({winner?.fornecedor})
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      {/* Payment Method and Terms Selection */}
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Meio de Pagamento
                        </label>
                        <select
                          value={req.paymentMethod}
                          onChange={(e) =>
                            setRequests((prev) =>
                              prev.map((r) =>
                                r.id === req.id ? { ...r, paymentMethod: e.target.value as PaymentMethod } : r
                              )
                            )
                          }
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none font-semibold text-slate-700"
                        >
                          <option value="">Selecione...</option>
                          <option value="PIX">PIX (Chave Pix)</option>
                          <option value="Boleto">Boleto Bancário</option>
                          <option value="TED">TED (Dados Bancários)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Condições de Pagamento / Parcelamento
                        </label>
                        <select
                          value={req.paymentTerms}
                          onChange={(e) =>
                            setRequests((prev) =>
                              prev.map((r) => (r.id === req.id ? { ...r, paymentTerms: e.target.value } : r))
                            )
                          }
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none font-semibold text-slate-700"
                        >
                          <option value="">Selecione...</option>
                          <option value="À Vista">À Vista (1 Parcela)</option>
                          <option value="2 Parcelas (30/60 dias)">2 Parcelas (30/60 dias)</option>
                          <option value="3 Parcelas (30/60/90 dias)">3 Parcelas (30/60/90 dias)</option>
                          <option value="Condição Especial (Contra Entrega)">Condição Especial (Contra Entrega)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          Prazo de Entrega Estimado
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 3 dias úteis, Imediato"
                          value={req.deadline}
                          onChange={(e) =>
                            setRequests((prev) =>
                              prev.map((r) => (r.id === req.id ? { ...r, deadline: e.target.value } : r))
                            )
                          }
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none text-slate-700 font-medium"
                        />
                      </div>
                    </div>

                    {/* Dynamic payment method details input */}
                    {req.paymentMethod === "PIX" && (
                      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-xs space-y-2">
                        <p className="font-bold text-emerald-800 flex items-center gap-1">
                          <CreditCard className="w-4 h-4 text-emerald-600" />
                          <span>Especificar Chave PIX Florestal</span>
                        </p>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Chave PIX (E-mail, CNPJ, Celular, etc.)</label>
                          <input
                            type="text"
                            placeholder="Ex: financeiro@fornecedordiesel.com.br ou CNPJ: 12.345.678/0001-99"
                            value={req.pixKey}
                            onChange={(e) =>
                              setRequests((prev) =>
                                prev.map((r) => (r.id === req.id ? { ...r, pixKey: e.target.value } : r))
                              )
                            }
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none text-slate-700"
                          />
                        </div>
                      </div>
                    )}

                    {req.paymentMethod === "Boleto" && (
                      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-xs space-y-2">
                        <p className="font-bold text-blue-800 flex items-center gap-1">
                          <FileText className="w-4 h-4 text-blue-600" />
                          <span>Especificar Boleto para Faturamento</span>
                        </p>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Código de Barras / Linha Digitável do Boleto</label>
                          <input
                            type="text"
                            placeholder="Ex: 34191.79001 01043.513184 91020.150008 7 97500000340000"
                            value={req.boletoBarcode}
                            onChange={(e) =>
                              setRequests((prev) =>
                                prev.map((r) => (r.id === req.id ? { ...r, boletoBarcode: e.target.value } : r))
                              )
                            }
                            className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none text-slate-700 font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {req.paymentMethod === "TED" && (
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-xs space-y-3">
                        <p className="font-bold text-amber-800 flex items-center gap-1">
                          <Building2 className="w-4 h-4 text-amber-600" />
                          <span>Especificar Dados Bancários TED / Transferência</span>
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Banco</label>
                            <input
                              type="text"
                              placeholder="Ex: Itaú (341)"
                              value={req.tedBank}
                              onChange={(e) =>
                                setRequests((prev) =>
                                  prev.map((r) => (r.id === req.id ? { ...r, tedBank: e.target.value } : r))
                                )
                              }
                              className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-700 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Agência</label>
                            <input
                              type="text"
                              placeholder="Ex: 0104"
                              value={req.tedAgency}
                              onChange={(e) =>
                                setRequests((prev) =>
                                  prev.map((r) => (r.id === req.id ? { ...r, tedAgency: e.target.value } : r))
                                )
                              }
                              className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-700 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Conta Corrente</label>
                            <input
                              type="text"
                              placeholder="Ex: 51318-4"
                              value={req.tedAccount}
                              onChange={(e) =>
                                setRequests((prev) =>
                                  prev.map((r) => (r.id === req.id ? { ...r, tedAccount: e.target.value } : r))
                                )
                              }
                              className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-700 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">CNPJ / CPF do Fornecedor</label>
                            <input
                              type="text"
                              placeholder="Ex: 12.345.678/0001-99"
                              value={req.tedDoc}
                              onChange={(e) =>
                                setRequests((prev) =>
                                  prev.map((r) => (r.id === req.id ? { ...r, tedDoc: e.target.value } : r))
                                )
                              }
                              className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs text-slate-700 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Submit Confirmation button */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => handleEmitirOrdemCompra(req.id)}
                        className="bg-[#D97706] hover:bg-[#B45309] text-white font-bold px-6 py-2.5 rounded-xl transition shadow flex items-center space-x-2 text-xs"
                      >
                        <span>Efetivar Ordem de Compra (OC) & Enviar ao Financeiro</span>
                      </button>
                    </div>

                  </div>
                );
              })}

              {filtrarStatus("Autorizado - Emitir OC").length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <CheckCircle className="w-10 h-10 mx-auto text-emerald-600 opacity-60 mb-2" />
                  Excelente! Nenhuma ordem de compra pendente de efetivação de parcelamento/condições.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==============================================
            STEP 5: FINANCEIRO (NF CONFERENCIA, COPIAR PIX/BOLETO, FLUXO DE CAIXA)
            ============================================== */}
        {abaAtiva === "financeiro" && (
          <div className="space-y-6">
            
            {/* Financial Pending Bills Fila */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display font-bold text-slate-900 text-base">Contas a Pagar - Conferência Física de Notas Fiscais (NF-e)</h2>
                  <p className="text-xs text-slate-500">
                    O financeiro deve validar o recebimento físico/XML da Nota Fiscal antes de agendar o PIX, Boleto ou TED.
                  </p>
                </div>
                {renderExportButtons("Etapa 5 - Financeiro", filtrarStatus("OC Emitida - Enviado ao Financeiro").length)}
              </div>

              <div className="space-y-6">
                {filtrarStatus("OC Emitida - Enviado ao Financeiro").map((req) => {
                  const winner = req.cotacoes[req.opcaoVencedora];
                  return (
                    <div key={req.id} className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/50 space-y-4">
                      
                      {/* Document details */}
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-200 pb-3">
                        <div>
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                            OC Emitida - Aguardando Nota Fiscal
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm mt-1">
                            #{req.id} - {req.item} (Qtd: {req.qty}) para {req.target}
                          </h3>
                          <p className="text-xs text-slate-500 mt-0.5">Centro de Custo Debitante: <strong>{req.costCenter}</strong></p>
                        </div>
                        <div className="text-right text-xs">
                          <span className="text-slate-400 block font-bold text-[9px] uppercase">Preço Total Autorizado</span>
                          <span className="text-lg font-mono font-bold text-emerald-800">
                            {winner ? formatCurrency(winner.valor) : "R$ 0,00"}
                          </span>
                        </div>
                      </div>

                      {/* PDF Format Tracking (Step 4 metadata details) */}
                      <div className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs space-y-2 font-mono">
                        <p className="text-emerald-400 font-bold border-b border-slate-800 pb-1 uppercase text-[10px]">
                          Ficha Técnica de Pagamento & Rastreabilidade
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                          <div><strong>Fornecedor Credor:</strong> {winner?.fornecedor}</div>
                          <div><strong>Condição de Pagamento:</strong> {req.paymentTerms}</div>
                          <div><strong>Prazo de Entrega:</strong> {req.deadline}</div>
                          <div><strong>Chave de Auditoria (Rastreabilidade):</strong> {req.auditLink}</div>
                        </div>
                      </div>

                      {/* PAYMENT INSTRUCTION PANEL (PIX, BOLETO or TED) */}
                      <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                        <p className="font-bold text-slate-700 uppercase tracking-wide text-[10px] border-b pb-1.5 flex items-center gap-1">
                          <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Dados de Pagamento para Copiar</span>
                        </p>
                        
                        {req.paymentMethod === "PIX" && (
                          <div className="flex flex-col sm:flex-row justify-between items-center bg-[#F1F5F9] p-3 rounded-lg gap-2">
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase font-bold">Chave PIX do Fornecedor</span>
                              <span className="font-mono text-emerald-800 font-bold text-xs">{req.pixKey}</span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(req.pixKey);
                                alert("Chave PIX copiada para a área de transferência!");
                              }}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded transition"
                            >
                              Copiar Chave PIX
                            </button>
                          </div>
                        )}

                        {req.paymentMethod === "Boleto" && (
                          <div className="flex flex-col sm:flex-row justify-between items-center bg-[#F1F5F9] p-3 rounded-lg gap-2">
                            <div className="w-full sm:flex-1">
                              <span className="text-[10px] text-slate-400 block uppercase font-bold">Código de Barras Boleto</span>
                              <span className="font-mono text-blue-900 text-[11px] block break-all font-bold">{req.boletoBarcode}</span>
                            </div>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(req.boletoBarcode);
                                alert("Código de barras copiado!");
                              }}
                              className="bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs px-3 py-1.5 rounded transition shrink-0"
                            >
                              Copiar Código
                            </button>
                          </div>
                        )}

                        {req.paymentMethod === "TED" && (
                          <div className="bg-[#F1F5F9] p-3 rounded-lg text-xs grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <span className="text-[10px] text-slate-400 block">Banco</span>
                              <strong className="text-slate-800">{req.tedBank}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Agência</span>
                              <strong className="text-slate-800">{req.tedAgency}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">Conta</span>
                              <strong className="text-slate-800">{req.tedAccount}</strong>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block">CPF / CNPJ</span>
                              <strong className="text-slate-800">{req.tedDoc}</strong>
                            </div>
                          </div>
                        )}

                        {/* Automated Split Installments Schedule table */}
                        <div className="mt-3.5 pt-2">
                          <p className="font-semibold text-slate-600 mb-1.5 text-[10px] uppercase">Cronograma de Parcelas do Contas a Pagar</p>
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left text-slate-500">
                              <thead className="text-[10px] text-slate-400 uppercase bg-slate-50">
                                <tr>
                                  <th className="py-1 px-2">Parcela</th>
                                  <th className="py-1 px-2">Data Vencimento</th>
                                  <th className="py-1 px-2">Valor</th>
                                  <th className="py-1 px-2 text-right">Ação</th>
                                </tr>
                              </thead>
                              <tbody>
                                {req.installments.map((inst) => (
                                  <tr key={inst.number} className="border-b border-slate-100 bg-white">
                                    <td className="py-1.5 px-2 font-bold text-slate-700">#{inst.number}</td>
                                    <td className="py-1.5 px-2 font-semibold text-slate-600">{inst.dueDate}</td>
                                    <td className="py-1.5 px-2 font-bold text-emerald-800">{formatCurrency(inst.value)}</td>
                                    <td className="py-1.5 px-2 text-right">
                                      {inst.status === "Pago" ? (
                                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                                          PAGO
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() => handlePagarParcela(req.id, inst.number)}
                                          disabled={!req.invoiceNumber.trim() || !req.invoiceConfirmed}
                                          className={`font-semibold px-2 py-0.5 rounded text-[10px] border transition ${
                                            req.invoiceNumber.trim() && req.invoiceConfirmed
                                              ? "bg-white border-emerald-500 text-emerald-700 hover:bg-emerald-50"
                                              : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
                                          }`}
                                        >
                                          Confirmar Pagamento
                                        </button>
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>

                      {/* CONFERENCIA DE NOTA FISCAL (MANDATORY IN FINANCE PHASE) */}
                      <div className="bg-[#FEF3C7] border border-[#FCD34D] p-4 rounded-xl text-xs space-y-3 shadow-inner">
                        <p className="font-bold text-amber-900 flex items-center gap-1">
                          <Lock className="w-4 h-4 text-[#D97706]" />
                          <span>CONFERÊNCIA DE NOTA FISCAL DE COMPRA (NF-e)</span>
                        </p>
                        <p className="text-amber-800 text-xs">
                          O faturamento e liquidação final do contas a pagar estão bloqueados até a inserção dos dados da Nota Fiscal recebida fisicamente ou XML.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <div className="w-full sm:w-1/3 text-left">
                            <label className="block text-[10px] text-amber-900 font-bold uppercase mb-1">
                              Número da Nota Fiscal (NF-e)
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="Ex: NF-44102, NF-5521"
                              value={req.invoiceNumber}
                              onChange={(e) =>
                                setRequests((prev) =>
                                  prev.map((r) => (r.id === req.id ? { ...r, invoiceNumber: e.target.value } : r))
                                )
                              }
                              className="bg-white border border-[#FCD34D] rounded-lg px-3 py-1.5 text-xs w-full outline-none focus:ring-1 focus:ring-emerald-700 font-bold"
                            />
                          </div>
                          <div className="w-full sm:flex-grow flex items-center space-x-2 pt-4">
                            <input
                              type="checkbox"
                              id={`check-nf-${req.id}`}
                              checked={req.invoiceConfirmed}
                              onChange={(e) =>
                                setRequests((prev) =>
                                  prev.map((r) =>
                                    r.id === req.id ? { ...r, invoiceConfirmed: e.target.checked } : r
                                  )
                                )
                              }
                              className="w-4 h-4 text-emerald-600 border-slate-300 rounded"
                            />
                            <label htmlFor={`check-nf-${req.id}`} className="text-amber-900 font-semibold select-none cursor-pointer text-xs">
                              Confirmo recebimento físico da peça e consistência do XML com a cotação aprovada.
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Complete liquidation control */}
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => handleLiquidarCompra(req.id)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-6 py-2.5 rounded-xl transition shadow flex items-center space-x-2 text-xs"
                        >
                          <CheckCircle className="w-4.5 h-4.5" />
                          <span>Liquidar Total & Arquivar Pedido faturado</span>
                        </button>
                      </div>

                    </div>
                  );
                })}

                {filtrarStatus("OC Emitida - Enviado ao Financeiro").length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    <CheckCircle className="w-10 h-10 mx-auto text-emerald-600 opacity-60 mb-2" />
                    Tudo pago! Não há Ordens de Compra faturadas pendentes de liquidação no contas a pagar.
                  </div>
                )}
              </div>
            </div>

            {/* CONTROLE DE DESPESAS / FLUXO DE CAIXA DASHBOARD */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-slate-900 text-base">Controle de Despesas & Fluxo Florestal de Caixa</h2>
                  <p className="text-xs text-slate-500">Mapeamento dinâmico de despesas liquidadas por categoria e tipo de pagamento.</p>
                </div>
                <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-100 font-bold text-xs flex items-center space-x-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-700" />
                  <span>Sincronizado</span>
                </div>
              </div>

              {/* High level financial numbers cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Pago / Liquidado</span>
                  <p className="text-2xl font-mono font-bold text-[#064E3B] mt-1">
                    {formatCurrency(expenseMetrics.totalPago)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Registrado no caixa faturado com Nota Fiscal</p>
                </div>

                <div className="bg-[#FFFBEB] border border-[#FDE68A] p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Pendente (Em Contas a Pagar)</span>
                  <p className="text-2xl font-mono font-bold text-[#B45309] mt-1">
                    {formatCurrency(expenseMetrics.totalPendente)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">Aguardando emissão de NF ou confirmação de faturamento</p>
                </div>
              </div>

              {/* Group breakdowns visual bars representations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                
                {/* Outflows by Cost Center */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wide">
                    Despesas por Centro de Custo (Liquidadas)
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1 font-semibold text-slate-600">
                        <span>CC-MANUTENCAO-10 (Oficina/Peças)</span>
                        <span>{formatCurrency(expenseMetrics.porCentroCusto["CC-MANUTENCAO-10"])}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${
                              expenseMetrics.totalPago > 0
                                ? (expenseMetrics.porCentroCusto["CC-MANUTENCAO-10"] / expenseMetrics.totalPago) * 100
                                : 0
                            }%`,
                          }}
                          className="bg-emerald-700 h-full transition-all duration-300"
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs mb-1 font-semibold text-slate-600">
                        <span>CC-FLORESTAL-20 (Cabos/Corte)</span>
                        <span>{formatCurrency(expenseMetrics.porCentroCusto["CC-FLORESTAL-20"])}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${
                              expenseMetrics.totalPago > 0
                                ? (expenseMetrics.porCentroCusto["CC-FLORESTAL-20"] / expenseMetrics.totalPago) * 100
                                : 0
                            }%`,
                          }}
                          className="bg-amber-600 h-full transition-all duration-300"
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs mb-1 font-semibold text-slate-600">
                        <span>CC-ABASTEC-30 (Combustível)</span>
                        <span>{formatCurrency(expenseMetrics.porCentroCusto["CC-ABASTEC-30"])}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${
                              expenseMetrics.totalPago > 0
                                ? (expenseMetrics.porCentroCusto["CC-ABASTEC-30"] / expenseMetrics.totalPago) * 100
                                : 0
                            }%`,
                          }}
                          className="bg-blue-600 h-full transition-all duration-300"
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs mb-1 font-semibold text-slate-600">
                        <span>OUTROS/GERAL (Manual/Ajustado)</span>
                        <span>{formatCurrency(expenseMetrics.porCentroCusto["OUTROS/GERAL"])}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${
                              expenseMetrics.totalPago > 0
                                ? (expenseMetrics.porCentroCusto["OUTROS/GERAL"] / expenseMetrics.totalPago) * 100
                                : 0
                            }%`,
                          }}
                          className="bg-slate-500 h-full transition-all duration-300"
                        ></div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Outflows by Payment Method */}
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wide">
                    Despesas por Meio de Pagamento (Liquidadas)
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between items-center text-xs mb-1 font-semibold text-slate-600">
                        <span>Boleto Bancário</span>
                        <span>{formatCurrency(expenseMetrics.porMeioPagamento["Boleto"])}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${
                              expenseMetrics.totalPago > 0
                                ? (expenseMetrics.porMeioPagamento["Boleto"] / expenseMetrics.totalPago) * 100
                                : 0
                            }%`,
                          }}
                          className="bg-blue-600 h-full transition-all"
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs mb-1 font-semibold text-slate-600">
                        <span>PIX</span>
                        <span>{formatCurrency(expenseMetrics.porMeioPagamento["PIX"])}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${
                              expenseMetrics.totalPago > 0
                                ? (expenseMetrics.porMeioPagamento["PIX"] / expenseMetrics.totalPago) * 100
                                : 0
                            }%`,
                          }}
                          className="bg-emerald-600 h-full transition-all"
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-xs mb-1 font-semibold text-slate-600">
                        <span>TED Bancário</span>
                        <span>{formatCurrency(expenseMetrics.porMeioPagamento["TED"])}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          style={{
                            width: `${
                              expenseMetrics.totalPago > 0
                                ? (expenseMetrics.porMeioPagamento["TED"] / expenseMetrics.totalPago) * 100
                                : 0
                            }%`,
                          }}
                          className="bg-amber-600 h-full transition-all"
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Clean informational card */}
                  <div className="bg-[#F8FAFC] border border-slate-200 p-3 rounded-lg text-xs flex items-start space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <p className="text-slate-500">
                      O faturamento florestal automatizado minimiza falhas humanas de digitação de chaves PIX ou TED. Os dados são transferidos integralmente de Compras para o Financeiro.
                    </p>
                  </div>

                </div>

              </div>
            </div>

          </div>
        )}

        {/* ==============================================
            STEP 6: CONTROLE DE ESTOQUE (INVENTÁRIO & MOVIMENTAÇÕES)
            ============================================== */}
        {abaAtiva === "estoque" && (
          <div className="space-y-6">
            
            {/* INVENTORY HEADER WITH GENERAL NUMBERS */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-4">
                <div>
                  <h2 className="font-display font-bold text-slate-900 text-base">Almoxarifado & Estoque Central Florestal</h2>
                  <p className="text-xs text-slate-500">
                    Importe inventários de outros sistemas e acompanhe a movimentação física de peças, lubrificantes e frotas.
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setShowManualStockForm(!showManualStockForm);
                      setShowImportArea(false);
                    }}
                    className="bg-[#0284C7] hover:bg-[#0369A1] text-white font-bold px-3.5 py-2 rounded-xl transition text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer"
                  >
                    <span>➕ Cadastrar Item Manual</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowImportArea(!showImportArea);
                      setShowManualStockForm(false);
                    }}
                    className="bg-[#064E3B] hover:bg-[#022C22] text-white font-bold px-3.5 py-2 rounded-xl transition text-xs flex items-center space-x-1.5 shadow-sm cursor-pointer"
                  >
                    <span>{showImportArea ? "Fechar Importador" : "📥 Importar Planilha"}</span>
                  </button>

                  {renderExportButtons("Estoque & Almoxarifado", stockItems.length)}
                </div>
              </div>

              {/* COLLAPSIBLE MANUAL STOCK ENTRY FORM */}
              {showManualStockForm && (
                <form onSubmit={handleSaveManualStockItem} className="mb-6 bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 space-y-4">
                  <div className="flex justify-between items-center border-b border-emerald-100 pb-2">
                    <h3 className="font-bold text-emerald-950 text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <span>➕ Cadastrar Novo Item de Forma Manual</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowManualStockForm(false)}
                      className="text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Nome do Item / Peça *</label>
                      <input
                        type="text"
                        list="itens-sugeridos"
                        required
                        placeholder="Ex: Filtro Hidráulico"
                        value={manualStockItem}
                        onChange={(e) => setManualStockItem(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Modelo de Peça</label>
                      <input
                        type="text"
                        list="modelos-sugeridos"
                        placeholder="Ex: FA-9912"
                        value={manualStockModel}
                        onChange={(e) => setManualStockModel(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Marca / Fabricante</label>
                      <input
                        type="text"
                        list="marcas-sugeridos"
                        placeholder="Ex: Donaldson"
                        value={manualStockBrand}
                        onChange={(e) => setManualStockBrand(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Quantidade Inicial *</label>
                      <input
                        type="number"
                        min="0"
                        required
                        placeholder="Ex: 10"
                        value={manualStockQty}
                        onChange={(e) => setManualStockQty(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-700 font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Valor Unitário (R$) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="Ex: 150.00"
                        value={manualStockUnitValue}
                        onChange={(e) => setManualStockUnitValue(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-emerald-700 font-mono text-emerald-800 font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowManualStockForm(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg text-xs transition font-semibold"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="bg-[#047857] hover:bg-[#064E3B] text-white px-5 py-1.5 rounded-lg text-xs transition font-bold shadow-sm"
                    >
                      ✓ Salvar Cadastro de Item
                    </button>
                  </div>
                </form>
              )}

              {/* IMPORT CSV AREA */}
              {showImportArea && (
                <div className="mb-6 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">Área de Importação Florestal de Estoque</h3>
                  <p className="text-[11px] text-slate-500">
                    Cole as linhas de sua planilha (Colunas: Item, Modelo, Marca, Quantidade, ValorUnitario) ou use o modelo para simulação de carga.
                  </p>
                  
                  <textarea
                    rows={4}
                    value={importCsvText}
                    onChange={(e) => setImportCsvText(e.target.value)}
                    placeholder="Filtro Ar, PA3905, Baldwin, 15, 230&#10;Óleo Lubrificante, 15W40, Mobil, 80, 28"
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 font-mono text-xs focus:ring-1 focus:ring-emerald-700 focus:outline-none"
                  />

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const template = "Filtro de Ar Secundário, PA3905, Baldwin, 12, 185.00\nAnel Borracha O-Ring, Parker, Parker, 250, 4.20\nPneu de Tracionador, Forest King, Nokian, 4, 4800.00";
                        setImportCsvText(template);
                        addLog("Template exemplo de importação carregado na área de texto.", "info");
                      }}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded text-[10px] font-bold cursor-pointer"
                    >
                      Preencher Exemplo Araucária
                    </button>

                    <button
                      onClick={() => {
                        if (!importCsvText.trim()) {
                          alert("Aviso: Por favor insira dados na caixa de texto.");
                          return;
                        }
                        const lines = importCsvText.trim().split("\n");
                        let addedCount = 0;
                        lines.forEach((line) => {
                          const parts = line.split(",");
                          if (parts.length >= 4) {
                            const item = parts[0]?.trim();
                            const model = parts[1]?.trim() || "S/M";
                            const brand = parts[2]?.trim() || "S/M";
                            const qty = parseInt(parts[3]?.trim()) || 0;
                            const unitValue = parseFloat(parts[4]?.trim()) || 0;

                            if (item && qty > 0) {
                              setStockItems((prev) => {
                                const index = prev.findIndex(
                                  (s) => s.item.toLowerCase() === item.toLowerCase() && s.model.toLowerCase() === model.toLowerCase()
                                );
                                if (index >= 0) {
                                  return prev.map((s, idx) => {
                                    if (idx === index) {
                                      const nQ = s.qty + qty;
                                      return { ...s, qty: nQ, totalValue: nQ * s.unitValue };
                                    }
                                    return s;
                                  });
                                } else {
                                  return [
                                    ...prev,
                                    {
                                      id: "STK-" + (prev.length + 1).toString().padStart(3, "0"),
                                      item,
                                      model,
                                      brand,
                                      qty,
                                      unitValue,
                                      totalValue: qty * unitValue,
                                      lastUpdated: new Date().toLocaleString("pt-BR"),
                                    },
                                  ];
                                }
                              });
                              addedCount++;
                            }
                          }
                        });
                        addLog(`${addedCount} itens importados e consolidados ao Almoxarifado Central.`, "success");
                        setImportCsvText("");
                        setShowImportArea(false);
                      }}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-1.5 rounded text-[10px] font-bold cursor-pointer"
                    >
                      Processar Carga de Itens
                    </button>
                  </div>
                </div>
              )}

              {/* STATS OVERVIEW */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-[#022C22] text-white p-4 rounded-xl border border-emerald-800">
                  <span className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider block">Valor Consolidado em Estoque</span>
                  <p className="text-2xl font-mono font-bold text-amber-400 mt-1">
                    {formatCurrency(stockItems.reduce((acc, curr) => acc + curr.totalValue, 0))}
                  </p>
                  <span className="text-[9px] text-emerald-200 mt-1 block">Soma de todos os itens cadastrados</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Gama de Itens Ativos</span>
                  <p className="text-2xl font-mono font-bold text-slate-800 mt-1">
                    {stockItems.length} SKU's
                  </p>
                  <span className="text-[9px] text-slate-400 mt-1 block">Categorias cadastradas no Almoxarifado</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Pecas Físicas Totais</span>
                  <p className="text-2xl font-mono font-bold text-slate-800 mt-1">
                    {stockItems.reduce((acc, curr) => acc + curr.qty, 0)} unidades
                  </p>
                  <span className="text-[9px] text-slate-400 mt-1 block">Quantidade consolidada física no galpão</span>
                </div>
              </div>

              {/* INVENTORY TABLE */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider">SKU ID</th>
                      <th className="px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider">Item / Descrição</th>
                      <th className="px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider">Modelo</th>
                      <th className="px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider">Marca</th>
                      <th className="px-4 py-2.5 text-right font-bold text-slate-500 uppercase tracking-wider">Quantidade</th>
                      <th className="px-4 py-2.5 text-right font-bold text-slate-500 uppercase tracking-wider">Valor Unitário</th>
                      <th className="px-4 py-2.5 text-right font-bold text-slate-500 uppercase tracking-wider">Valor de Inventário</th>
                      <th className="px-4 py-2.5 text-left font-bold text-slate-500 uppercase tracking-wider">Sincronia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {stockItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-600">{item.id}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{item.item}</td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{item.model}</td>
                        <td className="px-4 py-3 text-slate-600">{item.brand}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-mono font-bold ${item.qty < 5 ? "text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100" : "text-slate-800"}`}>
                            {item.qty} un
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">{formatCurrency(item.unitValue)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-800">{formatCurrency(item.totalValue)}</td>
                        <td className="px-4 py-3 text-[10px] text-slate-400 font-medium">{item.lastUpdated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PHYSICAL STOCK MOVEMENTS LOG */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <div className="border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-slate-900 text-sm">Histórico e Diário de Movimentação do Estoque (Auditoria)</h3>
                  <p className="text-xs text-slate-500">Fluxos físicos de Entrada (Carga/CC Estoque) e Saída (Ativos).</p>
                </div>
                
                <span className="text-[10px] bg-slate-100 px-2.5 py-1 rounded text-slate-600 font-semibold font-mono">
                  {stockMovements.length} Lançamentos
                </span>
              </div>

              <div className="space-y-3.5 max-h-96 overflow-y-auto">
                {stockMovements.map((mov) => (
                  <div key={mov.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider text-center shrink-0 ${
                        mov.type === "Entrada" ? "bg-emerald-50 text-emerald-800 border border-emerald-100" : "bg-rose-50 text-rose-800 border border-rose-100"
                      }`}>
                        {mov.type}
                      </span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 text-xs">
                            {mov.qty}x {mov.item}
                          </span>
                          <span className="text-[10px] text-slate-500">({mov.model} - {mov.brand})</span>
                        </div>
                        <p className="text-[10.5px] text-slate-500 mt-0.5 leading-relaxed">
                          Destino: <strong className="text-slate-700 font-bold">{mov.destination}</strong> | Solicitado por: <strong className="text-slate-700 font-medium">{mov.requester}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right font-mono space-y-0.5">
                      <span className="text-[9.5px] text-slate-400 block">{mov.timestamp}</span>
                      <strong className="text-xs text-slate-800 block">Total: {formatCurrency(mov.totalValue)}</strong>
                      <span className="text-[8.5px] text-slate-400 block">Aprovador: {mov.approver}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {abaAtiva === "cadastros" && (
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            
            {/* PANEL HEADER */}
            <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-slate-900 text-base">Painel de Cadastros e Padronização Araucária</h2>
                <p className="text-xs text-slate-500">
                  Gerencie as listas pré-selecionáveis de centros de custos, fornecedores, itens, marcas e modelos para manter a padronização e evitar redundâncias.
                </p>
              </div>
              {renderExportButtons("Base de Cadastros", costCentersList.length + suppliersList.length + catalogItems.length + modelsList.length + brandsList.length)}
            </div>

            {/* REGISTER SUB-TAB NAVIGATION */}
            <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-1.5">
              <button
                type="button"
                onClick={() => setCadastroSubTab("cc")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  cadastroSubTab === "cc"
                    ? "bg-[#064E3B] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                🏢 Centros de Custo ({costCentersList.length})
              </button>
              <button
                type="button"
                onClick={() => setCadastroSubTab("fornecedores")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  cadastroSubTab === "fornecedores"
                    ? "bg-[#064E3B] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                🚜 Fornecedores ({suppliersList.length})
              </button>
              <button
                type="button"
                onClick={() => setCadastroSubTab("itens")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  cadastroSubTab === "itens"
                    ? "bg-[#064E3B] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                ⚙️ Itens e Peças ({catalogItems.length})
              </button>
              <button
                type="button"
                onClick={() => setCadastroSubTab("servicos")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  cadastroSubTab === "servicos"
                    ? "bg-[#064E3B] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                🛠 Serviços ({servicesList.length})
              </button>
              <button
                type="button"
                onClick={() => setCadastroSubTab("modelos")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  cadastroSubTab === "modelos"
                    ? "bg-[#064E3B] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                📐 Modelos ({modelsList.length})
              </button>
              <button
                type="button"
                onClick={() => setCadastroSubTab("marcas")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  cadastroSubTab === "marcas"
                    ? "bg-[#064E3B] text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                🏷 Marcas ({brandsList.length})
              </button>
            </div>

            {/* CONTENT OF ACTIVE SUB-TAB */}
            <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-100">
              
              {/* SUB-TAB 1: CENTROS DE CUSTO */}
              {cadastroSubTab === "cc" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/55 pb-2.5 gap-2">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">🏢 Cadastro de Centros de Custo</h3>
                    <p className="text-[10px] text-slate-400">Padroniza a contabilidade física-suprimentos</p>
                  </div>

                  {/* Add form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newCcCode.trim() || !newCcName.trim()) {
                        alert("Preencha o código e o nome do Centro de Custo!");
                        return;
                      }
                      const dup = costCentersList.some(c => c.code.toLowerCase() === newCcCode.trim().toLowerCase());
                      if (dup) {
                        alert("Já existe um Centro de Custo com este código!");
                        return;
                      }
                      setCostCentersList(prev => [...prev, { code: newCcCode.trim().toUpperCase(), name: newCcName.trim() }]);
                      addLog(`Novo centro de custo cadastrado: ${newCcCode} - ${newCcName}`, "success");
                      setNewCcCode("");
                      setNewCcName("");
                    }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs"
                  >
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Código do Centro de Custo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: CC-FROTA-15"
                        value={newCcCode}
                        onChange={(e) => setNewCcCode(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs font-mono outline-none focus:ring-1 focus:ring-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Descrição / Nome do Setor *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Silvicultura Sul"
                        value={newCcName}
                        onChange={(e) => setNewCcName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-[#064E3B] hover:bg-[#022C22] text-white font-bold p-1.5 rounded text-xs transition shadow-sm cursor-pointer"
                      >
                        ➕ Cadastrar Centro de Custo
                      </button>
                    </div>
                  </form>

                  {/* Grid list of registered cost centers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {costCentersList.map((cc) => (
                      <div key={cc.code} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs shadow-xs">
                        <div>
                          <strong className="text-slate-800 font-mono block text-[11px]">{cc.code}</strong>
                          <span className="text-slate-500 block text-[10.5px]">{cc.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (cc.code === "CC-ESTOQUE-01") {
                              alert("Este centro de custo padrão não pode ser excluído por razões de governança.");
                              return;
                            }
                            if (confirm(`Deseja realmente excluir o centro de custo ${cc.code}?`)) {
                              setCostCentersList(prev => prev.filter(c => c.code !== cc.code));
                              addLog(`Centro de custo removido: ${cc.code}`, "warn");
                            }
                          }}
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-1.5 py-1 rounded transition text-[10px]"
                        >
                          Excluir
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: FORNECEDORES */}
              {cadastroSubTab === "fornecedores" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/55 pb-2.5 gap-2">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">🚜 Base de Fornecedores Homologados</h3>
                    <p className="text-[10px] text-slate-400">Parceiros comerciais para cotações de compras</p>
                  </div>

                  {/* Add form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newSupplierName.trim()) {
                        alert("Preencha o nome do Fornecedor!");
                        return;
                      }
                      const dup = suppliersList.some(s => s.toLowerCase() === newSupplierName.trim().toLowerCase());
                      if (dup) {
                        alert("Este fornecedor já está cadastrado!");
                        return;
                      }
                      setSuppliersList(prev => [...prev, newSupplierName.trim()]);
                      addLog(`Novo fornecedor cadastrado: ${newSupplierName}`, "success");
                      setNewSupplierName("");
                    }}
                    className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs"
                  >
                    <div className="flex-grow">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Razão Social / Nome Fantasia *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Comercial Araucária de Peças S.A."
                        value={newSupplierName}
                        onChange={(e) => setNewSupplierName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-500"
                      />
                    </div>
                    <div className="flex items-end sm:w-64">
                      <button
                        type="submit"
                        className="w-full bg-[#064E3B] hover:bg-[#022C22] text-white font-bold p-1.5 rounded text-xs transition shadow-sm cursor-pointer"
                      >
                        ➕ Cadastrar Fornecedor
                      </button>
                    </div>
                  </form>

                  {/* Grid list of registered suppliers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {suppliersList.map((sup) => (
                      <div key={sup} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs shadow-xs">
                        <span className="font-bold text-slate-800">{sup}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Deseja realmente remover o fornecedor "${sup}"?`)) {
                              setSuppliersList(prev => prev.filter(s => s !== sup));
                              addLog(`Fornecedor removido da base: ${sup}`, "warn");
                            }
                          }}
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-1.5 py-1 rounded transition text-[10px]"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: ITENS E PEÇAS */}
              {cadastroSubTab === "itens" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/55 pb-2.5 gap-2">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">⚙️ Catálogo Geral de Itens e Peças</h3>
                    <p className="text-[10px] text-slate-400">Lista oficial usada no formulário de solicitações</p>
                  </div>

                  {/* Add form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newItemName.trim()) {
                        alert("Preencha o nome do Item!");
                        return;
                      }
                      const dup = catalogItems.some(
                        c => c.item.toLowerCase() === newItemName.trim().toLowerCase() &&
                             (newItemModel ? c.model.toLowerCase() === newItemModel.trim().toLowerCase() : true)
                      );
                      if (dup) {
                        alert("Este item já existe no catálogo!");
                        return;
                      }
                      const newItem = {
                        item: newItemName.trim(),
                        model: newItemModel.trim() || "N/A",
                        brand: newItemBrand.trim() || "N/A"
                      };
                      setCatalogItems(prev => [newItem, ...prev]);
                      addLog(`Novo item adicionado ao catálogo geral: ${newItemName}`, "success");
                      setNewItemName("");
                      setNewItemModel("");
                      setNewItemBrand("");
                    }}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs"
                  >
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Nome do Item / Peça *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Filtro Lubrificante de Motor"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Modelo Comum (opcional)</label>
                      <input
                        type="text"
                        list="modelos-sugeridos"
                        placeholder="Ex: LOB-122"
                        value={newItemModel}
                        onChange={(e) => setNewItemModel(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Marca Comum (opcional)</label>
                      <input
                        type="text"
                        list="marcas-sugeridos"
                        placeholder="Ex: Tecfil"
                        value={newItemBrand}
                        onChange={(e) => setNewItemBrand(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-500"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full bg-[#064E3B] hover:bg-[#022C22] text-white font-bold p-1.5 rounded text-xs transition shadow-sm cursor-pointer"
                      >
                        ➕ Cadastrar no Catálogo
                      </button>
                    </div>
                  </form>

                  {/* List of Catalog Items */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="max-h-72 overflow-y-auto">
                      <table className="min-w-full divide-y divide-slate-100 text-[11px]">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-bold text-slate-500 uppercase">Item / Descrição</th>
                            <th className="px-4 py-2 text-left font-bold text-slate-500 uppercase">Modelo</th>
                            <th className="px-4 py-2 text-left font-bold text-slate-500 uppercase">Marca Recomendada</th>
                            <th className="px-4 py-2 text-right font-bold text-slate-500 uppercase">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {catalogItems.map((cat, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50">
                              <td className="px-4 py-2 font-bold text-slate-900">{cat.item}</td>
                              <td className="px-4 py-2 text-slate-600">{cat.model}</td>
                              <td className="px-4 py-2 text-slate-600">{cat.brand}</td>
                              <td className="px-4 py-2 text-right">
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Deseja remover "${cat.item}" do catálogo?`)) {
                                      setCatalogItems(prev => prev.filter((_, i) => i !== idx));
                                      addLog(`Item removido do catálogo: ${cat.item}`, "warn");
                                    }
                                  }}
                                  className="text-rose-500 hover:text-rose-700 font-bold"
                                >
                                  Excluir
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: SERVIÇOS */}
              {cadastroSubTab === "servicos" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/55 pb-2.5 gap-2">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">🛠 Lista de Serviços Padronizados</h3>
                    <p className="text-[10px] text-slate-400">Serviços técnicos ou operacionais para preenchimento</p>
                  </div>

                  {/* Add form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newServiceName.trim()) {
                        alert("Preencha o nome do Serviço!");
                        return;
                      }
                      const dup = servicesList.some(s => s.toLowerCase() === newServiceName.trim().toLowerCase());
                      if (dup) {
                        alert("Este serviço já está cadastrado!");
                        return;
                      }
                      setServicesList(prev => [...prev, newServiceName.trim()]);
                      addLog(`Novo serviço cadastrado: ${newServiceName}`, "success");
                      setNewServiceName("");
                    }}
                    className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs"
                  >
                    <div className="flex-grow">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Descrição do Serviço Técnico *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Conserto de Radiador e Sistema de Arrefecimento"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-500"
                      />
                    </div>
                    <div className="flex items-end sm:w-64">
                      <button
                        type="submit"
                        className="w-full bg-[#064E3B] hover:bg-[#022C22] text-white font-bold p-1.5 rounded text-xs transition shadow-sm cursor-pointer"
                      >
                        ➕ Cadastrar Serviço
                      </button>
                    </div>
                  </form>

                  {/* Grid list of registered services */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {servicesList.map((srv) => (
                      <div key={srv} className="bg-white p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs shadow-xs">
                        <span className="font-medium text-slate-800">{srv}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Deseja realmente remover o serviço "${srv}"?`)) {
                              setServicesList(prev => prev.filter(s => s !== srv));
                              addLog(`Serviço removido: ${srv}`, "warn");
                            }
                          }}
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-1.5 py-1 rounded transition text-[10px]"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 5: MODELOS */}
              {cadastroSubTab === "modelos" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/55 pb-2.5 gap-2">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">📐 Lista de Modelos Cadastrados</h3>
                    <p className="text-[10px] text-slate-400">Modelos de reposição, frotas e consumíveis</p>
                  </div>

                  {/* Add form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newModelName.trim()) {
                        alert("Preencha o nome do Modelo!");
                        return;
                      }
                      const dup = modelsList.some(m => m.toLowerCase() === newModelName.trim().toLowerCase());
                      if (dup) {
                        alert("Este modelo já está cadastrado!");
                        return;
                      }
                      setModelsList(prev => [...prev, newModelName.trim()]);
                      addLog(`Novo modelo cadastrado: ${newModelName}`, "success");
                      setNewModelName("");
                    }}
                    className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs"
                  >
                    <div className="flex-grow">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Modelo de Equipamento / Peça *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: FH-540 / D13"
                        value={newModelName}
                        onChange={(e) => setNewModelName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-500"
                      />
                    </div>
                    <div className="flex items-end sm:w-64">
                      <button
                        type="submit"
                        className="w-full bg-[#064E3B] hover:bg-[#022C22] text-white font-bold p-1.5 rounded text-xs transition shadow-sm cursor-pointer"
                      >
                        ➕ Cadastrar Modelo
                      </button>
                    </div>
                  </form>

                  {/* Grid list of registered models */}
                  <div className="flex flex-wrap gap-2">
                    {modelsList.map((mod) => (
                      <div key={mod} className="bg-white px-3 py-2 rounded-lg border border-slate-200 flex items-center space-x-2 text-xs shadow-xs">
                        <span className="font-mono font-bold text-slate-700">{mod}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Deseja remover o modelo "${mod}"?`)) {
                              setModelsList(prev => prev.filter(m => m !== mod));
                              addLog(`Modelo removido: ${mod}`, "warn");
                            }
                          }}
                          className="text-rose-500 hover:text-rose-700 font-bold text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUB-TAB 6: MARCAS */}
              {cadastroSubTab === "marcas" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200/55 pb-2.5 gap-2">
                    <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">🏷 Lista de Marcas e Fabricantes</h3>
                    <p className="text-[10px] text-slate-400">Padronização de parceiros industriais homologados</p>
                  </div>

                  {/* Add form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newBrandName.trim()) {
                        alert("Preencha o nome da Marca!");
                        return;
                      }
                      const dup = brandsList.some(b => b.toLowerCase() === newBrandName.trim().toLowerCase());
                      if (dup) {
                        alert("Esta marca já está cadastrada!");
                        return;
                      }
                      setBrandsList(prev => [...prev, newBrandName.trim()]);
                      addLog(`Nova marca cadastrada: ${newBrandName}`, "success");
                      setNewBrandName("");
                    }}
                    className="flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-lg border border-slate-200 text-xs"
                  >
                    <div className="flex-grow">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Nome da Marca / Fabricante *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Michelin, Bosch, Baldwin"
                        value={newBrandName}
                        onChange={(e) => setNewBrandName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded p-1.5 text-xs outline-none focus:ring-1 focus:ring-slate-500"
                      />
                    </div>
                    <div className="flex items-end sm:w-64">
                      <button
                        type="submit"
                        className="w-full bg-[#064E3B] hover:bg-[#022C22] text-white font-bold p-1.5 rounded text-xs transition shadow-sm cursor-pointer"
                      >
                        ➕ Cadastrar Marca
                      </button>
                    </div>
                  </form>

                  {/* Grid list of registered brands */}
                  <div className="flex flex-wrap gap-2">
                    {brandsList.map((brd) => (
                      <div key={brd} className="bg-white px-3 py-2 rounded-lg border border-slate-200 flex items-center space-x-2 text-xs shadow-xs">
                        <span className="font-bold text-slate-700">{brd}</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Deseja remover a marca "${brd}"?`)) {
                              setBrandsList(prev => prev.filter(b => b !== brd));
                              addLog(`Marca removida: ${brd}`, "warn");
                            }
                          }}
                          className="text-rose-500 hover:text-rose-700 font-bold text-[10px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          </div>
        )}
      </>
    )}

    {/* DATA LISTS PROVIDING STABLE UNIFIED AUTOCMPLETE SUGGESTIONS */}
    <datalist id="fornecedores-sugeridos">
      {suppliersList.map((sup, i) => (
        <option key={i} value={sup} />
      ))}
    </datalist>

    <datalist id="itens-sugeridos">
      {catalogItems.map((cat, i) => (
        <option key={i} value={cat.item} />
      ))}
    </datalist>

    <datalist id="modelos-sugeridos">
      {modelsList.map((mod, i) => (
        <option key={i} value={mod} />
      ))}
    </datalist>

    <datalist id="marcas-sugeridos">
      {brandsList.map((brd, i) => (
        <option key={i} value={brd} />
      ))}
    </datalist>

    <datalist id="servicos-sugeridos">
      {servicesList.map((srv, i) => (
        <option key={i} value={srv} />
      ))}
    </datalist>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <AraucariaLogo variant="light" showText={true} className="w-8 h-8 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" />
          </div>
          <div className="text-center sm:text-right text-[11px] space-y-0.5 text-slate-500">
            <p>© 2026 Araucária Florestal. Todos os direitos reservados.</p>
            <p className="text-[10px]">
              Sistema de Governança, Suprimentos & Almoxarifado Central • v2.4.0
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
