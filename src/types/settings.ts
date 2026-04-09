export interface AppSettings {
  general: {
    businessName: string;
    logo: string;
    address: string;
    gstin: string;
    phone: string;
    email: string;
    timezone: string;
    language: string;
    dateFormat: string;
    currency: string;
  };
  branches: {
    enabled: boolean;
    multiBranchSetup: boolean;
    stockTransferRules: "strict" | "flexible";
    invoicePrefix: string;
  };
  pos: {
    defaultPaymentMode: string;
    allowSplitPayment: boolean;
    roundingEnabled: boolean;
    discountPermission: "admin" | "manager" | "cashier";
    quickSaleMode: boolean;
    holdResumeBill: boolean;
    returnWindowDays: number;
    receiptTemplate: string;
    invoicePrefix: string;
    invoiceSeries: string;
  };
  inventory: {
    lowStockThreshold: number;
    allowNegativeStock: boolean;
    expiryAlerts: boolean;
    batchTracking: boolean;
    barcodeAutoGenerate: boolean;
    reorderQuantity: number;
    stockValuationMethod: "FIFO" | "Average" | "LIFO";
  };
  gstAccounts: {
    gstMode: "composite" | "regular";
    hsnSacDefaults: string;
    inclusiveTax: boolean;
    ledgerAutoPosting: boolean;
    roundOffLedger: string;
    expenseCategories: string[];
    autoDayClose: boolean;
  };
  staffPermissions: {
    rolesEnabled: boolean;
    cashierLimits: number;
    voidBillApproval: boolean;
    editSaleAfterSave: boolean;
    attendancePolicy: string;
    payrollVisibility: "admin" | "manager" | "all";
    auditLogAccess: "admin" | "manager";
  };
  notifications: {
    inApp: boolean;
    push: boolean;
    email: boolean;
    whatsapp: boolean;
    sms: boolean;
    alertTypes: string[];
    deliveryChannel: "primary" | "secondary";
    quietHoursStart: string;
    quietHoursEnd: string;
    dailySummary: boolean;
  };
  devices: {
    thermalPrinter: string;
    bluetoothPrinter: string;
    paperSize: "58mm" | "80mm" | "A4" | "A5";
    barcodeScanner: string;
    labelPrinter: string;
    cashDrawer: boolean;
    soundAlerts: boolean;
  };
  backupSync: {
    autoBackupFrequency: "daily" | "weekly" | "monthly" | "never";
    localBackupPath: string;
    cloudSync: boolean;
    wifiOnly: boolean;
    conflictRules: "manual" | "cloud-wins" | "local-wins";
    manualSyncEnabled: boolean;
  };
  security: {
    pinLock: boolean;
    biometricUnlock: boolean;
    sessionTimeoutMin: number;
    deviceWhitelist: string[];
    suspiciousLoginAlerts: boolean;
    backupRestoreApproval: boolean;
  };
  integrations: {
    upiProviders: string[];
    accountingExport: string;
    whatsappApi: string;
    googleCalendarSync: boolean;
    ecommerceSync: boolean;
    smsGateway: string;
  };
  aiAnalytics: {
    enabled: boolean;
    insightsAssistant: boolean;
    dailySummaryCards: boolean;
    anomalyAlerts: boolean;
    inventorySuggestions: boolean;
    businessInsights: boolean;
    assistantLanguage: string;
  };
}

export const DEFAULT_SETTINGS: AppSettings = {
  general: {
    businessName: "Golden Treasures",
    logo: "",
    address: "",
    gstin: "",
    phone: "",
    email: "",
    timezone: "Asia/Kolkata",
    language: "en",
    dateFormat: "DD/MM/YYYY",
    currency: "INR",
  },
  branches: {
    enabled: true,
    multiBranchSetup: false,
    stockTransferRules: "flexible",
    invoicePrefix: "INV",
  },
  pos: {
    defaultPaymentMode: "cash",
    allowSplitPayment: true,
    roundingEnabled: true,
    discountPermission: "manager",
    quickSaleMode: false,
    holdResumeBill: true,
    returnWindowDays: 30,
    receiptTemplate: "standard",
    invoicePrefix: "INV",
    invoiceSeries: "2024",
  },
  inventory: {
    lowStockThreshold: 5,
    allowNegativeStock: false,
    expiryAlerts: true,
    batchTracking: false,
    barcodeAutoGenerate: true,
    reorderQuantity: 10,
    stockValuationMethod: "FIFO",
  },
  gstAccounts: {
    gstMode: "regular",
    hsnSacDefaults: "7113",
    inclusiveTax: false,
    ledgerAutoPosting: true,
    roundOffLedger: "Round Off A/c",
    expenseCategories: ["Rent", "Salaries", "Utilities", "Marketing"],
    autoDayClose: false,
  },
  staffPermissions: {
    rolesEnabled: true,
    cashierLimits: 50000,
    voidBillApproval: true,
    editSaleAfterSave: false,
    attendancePolicy: "strict",
    payrollVisibility: "admin",
    auditLogAccess: "admin",
  },
  notifications: {
    inApp: true,
    push: true,
    email: true,
    whatsapp: false,
    sms: false,
    alertTypes: ["low-stock", "payment", "attendance"],
    deliveryChannel: "primary",
    quietHoursStart: "22:00",
    quietHoursEnd: "08:00",
    dailySummary: true,
  },
  devices: {
    thermalPrinter: "",
    bluetoothPrinter: "",
    paperSize: "80mm",
    barcodeScanner: "",
    labelPrinter: "",
    cashDrawer: false,
    soundAlerts: true,
  },
  backupSync: {
    autoBackupFrequency: "daily",
    localBackupPath: "",
    cloudSync: true,
    wifiOnly: false,
    conflictRules: "cloud-wins",
    manualSyncEnabled: true,
  },
  security: {
    pinLock: false,
    biometricUnlock: false,
    sessionTimeoutMin: 30,
    deviceWhitelist: [],
    suspiciousLoginAlerts: true,
    backupRestoreApproval: true,
  },
  integrations: {
    upiProviders: ["Paytm", "PhonePe", "GPay"],
    accountingExport: "Tally",
    whatsappApi: "",
    googleCalendarSync: false,
    ecommerceSync: false,
    smsGateway: "",
  },
  aiAnalytics: {
    enabled: true,
    insightsAssistant: true,
    dailySummaryCards: true,
    anomalyAlerts: true,
    inventorySuggestions: true,
    businessInsights: true,
    assistantLanguage: "en",
  },
};
