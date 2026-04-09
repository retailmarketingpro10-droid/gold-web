import { useState, useMemo } from "react";
import { 
  Building2, 
  Receipt, 
  Package, 
  FileText, 
  Users, 
  Bell, 
  Monitor, 
  Database, 
  Shield, 
  Globe, 
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Landmark,
  Save,
  Check,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppSettings } from "@/hooks/useAppSettings";
import { AppSettings, DEFAULT_SETTINGS } from "@/types/settings";
import { BranchManagement } from "./BranchManagement";

const sections = [
  { id: "general", name: "Business Profile", icon: Building2, description: "Basic details, branding & GSTIN" },
  { id: "branches", name: "Branches", icon: Landmark, description: "Multi-location management" },
  { id: "pos", name: "POS & Billing", icon: Receipt, description: "Checkout behavior & invoicing" },
  { id: "inventory", name: "Inventory", icon: Package, description: "Stock rules & thresholds" },
  { id: "gstAccounts", name: "GST & Accounts", icon: FileText, description: "Taxes & accounting mapping" },
  { id: "staffPermissions", name: "Staff & Permissions", icon: Users, description: "Roles, limits & attendance" },
  { id: "notifications", name: "Notifications", icon: Bell, description: "Alert protocols & channels" },
  { id: "devices", name: "Devices & Printing", icon: Monitor, description: "Hardware & label setup" },
  { id: "backupSync", name: "Backup & Sync", icon: Database, description: "Cloud rules & safety" },
  { id: "security", name: "Security", icon: Shield, description: "PIN, Biometrics & session" },
  { id: {Integrations: "integrations"}, name: "Integrations", icon: Globe, description: "Payment gateways & APIs" },
  { id: "aiAnalytics", name: "AI & Analytics", icon: Sparkles, description: "Business insights & triggers" },
] as const;

export const BusinessSettings = () => {
  const { settings, loading, saving, updateSetting, updateSection, lastSyncTime } = useAppSettings();
  const [activeSection, setActiveSection] = useState<string>("general");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSections = useMemo(() => {
    return sections.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground animate-pulse">Loading settings control center...</p>
        </div>
      </div>
    );
  }

  const renderSettingRow = (
    label: string, 
    description: string, 
    control: React.ReactNode, 
    effectiveImmediately = true
  ) => (
    <div className="flex items-start justify-between py-4 border-b last:border-0">
      <div className="space-y-1 pr-4">
        <div className="flex items-center gap-2">
          <Label className="text-sm font-semibold">{label}</Label>
          {effectiveImmediately && (
            <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
              Effective immediately
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      <div className="flex-shrink-0">
        {control}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-full max-h-screen bg-gray-50/50 -m-6 rounded-none overflow-hidden border">
      {/* Settings Navigation Sidebar */}
      <div className="w-full lg:w-72 border-r bg-white flex flex-col shrink-0">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Control Center</h2>
            <div className="flex items-center gap-1">
               {saving ? (
                 <Badge variant="secondary" className="animate-pulse flex gap-1 items-center px-1">
                   <Loader2 className="h-3 w-3 animate-spin" /> Saving
                 </Badge>
               ) : (
                 <Badge variant="outline" className="flex gap-1 items-center text-xs px-1 text-muted-foreground font-normal border-none">
                   <Check className="h-3 w-3" /> All synced
                 </Badge>
               )}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search settings..." 
              className="pl-8 bg-gray-50/50" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <ScrollArea className="flex-1">
           <div className="p-2 space-y-1">
             {filteredSections.map((section) => (
               <button
                 key={typeof section.id === 'string' ? section.id : JSON.stringify(section.id)}
                 onClick={() => setActiveSection(typeof section.id === 'string' ? section.id : JSON.stringify(section.id))}
                 className={cn(
                   "w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all group",
                   activeSection === (typeof section.id === 'string' ? section.id : JSON.stringify(section.id))
                     ? "bg-primary text-white shadow-lg shadow-primary/20 ring-1 ring-primary/30"
                     : "hover:bg-gray-100 text-gray-600 hover:text-primary"
                 )}
               >
                 <section.icon className={cn(
                   "h-5 w-5 shrink-0 mt-0.5",
                   activeSection === (typeof section.id === 'string' ? section.id : JSON.stringify(section.id)) ? "text-white" : "text-muted-foreground group-hover:text-primary"
                 )} />
                 <div className="min-w-0">
                   <div className="text-sm font-bold truncate">{section.name}</div>
                   <div className={cn(
                     "text-[10px] truncate",
                     activeSection === (typeof section.id === 'string' ? section.id : JSON.stringify(section.id)) ? "text-white/70" : "text-muted-foreground"
                   )}>
                     {section.description}
                   </div>
                 </div>
               </button>
             ))}
           </div>
        </ScrollArea>

        <div className="p-4 border-t bg-gray-50/50">
           <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
             <RotateCcw className="h-3 w-3" />
             Last sync: {new Date(lastSyncTime).toLocaleTimeString()}
           </div>
        </div>
      </div>

      {/* Settings Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ScrollArea className="h-full">
          <div className="p-6 lg:p-10 max-w-4xl mx-auto space-y-8 pb-20">
             {/* General Section */}
             {activeSection === "general" && (
               <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                 <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight">Business Profile</h3>
                    <p className="text-muted-foreground">Manage your core store identity and tax information.</p>
                 </div>
                 <Card className="border-none shadow-sm ring-1 ring-gray-100">
                    <CardContent className="divide-y p-0">
                      <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Store Name</Label>
                            <Input 
                              value={settings.general.businessName} 
                              onChange={(e) => updateSetting("general", "businessName", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>GSTIN</Label>
                            <Input 
                              value={settings.general.gstin} 
                              onChange={(e) => updateSetting("general", "gstin", e.target.value)}
                              placeholder="27XXXXXXXXXXXXX"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Address</Label>
                          <Input 
                            value={settings.general.address} 
                            onChange={(e) => updateSetting("general", "address", e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input 
                              value={settings.general.phone} 
                              onChange={(e) => updateSetting("general", "phone", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input 
                              value={settings.general.email} 
                              onChange={(e) => updateSetting("general", "email", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="p-6">
                        {renderSettingRow(
                          "Currency", 
                          "Preferred currency for all financial records",
                          <Select value={settings.general.currency} onValueChange={(v) => updateSetting("general", "currency", v)}>
                            <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                              <SelectItem value="USD">US Dollar ($)</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        {renderSettingRow(
                          "Timezone", 
                          "Standardizes reporting and attendance cycles",
                          <Select value={settings.general.timezone} onValueChange={(v) => updateSetting("general", "timezone", v)}>
                            <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                              <SelectItem value="UTC">UTC / GMT</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </CardContent>
                 </Card>
               </div>
             )}

             {/* POS Section */}
             {activeSection === "pos" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight">POS & Billing</h3>
                    <p className="text-muted-foreground">Configure checkout workflow and receipt layout.</p>
                  </div>
                  <Card>
                    <CardContent className="p-6 space-y-2">
                      {renderSettingRow(
                        "Quick Sale Mode",
                        "Skips confirmation steps for faster billing at high volume counters",
                        <Switch checked={settings.pos.quickSaleMode} onCheckedChange={(v) => updateSetting("pos", "quickSaleMode", v)} />
                      )}
                      {renderSettingRow(
                        "Split Payment",
                        "Allow customers to pay using multiple modes in a single transaction",
                        <Switch checked={settings.pos.allowSplitPayment} onCheckedChange={(v) => updateSetting("pos", "allowSplitPayment", v)} />
                      )}
                      {renderSettingRow(
                         "Discount Permissions",
                         "Minimum role required to apply manual discounts",
                         <Select value={settings.pos.discountPermission} onValueChange={(v: any) => updateSetting("pos", "discountPermission", v)}>
                            <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin Only</SelectItem>
                              <SelectItem value="manager">Manager+</SelectItem>
                              <SelectItem value="cashier">Any Cashier</SelectItem>
                            </SelectContent>
                         </Select>
                      )}
                      {renderSettingRow(
                        "Automatic Rounding",
                        "Rounds off grand total to the nearest rupee automatically",
                        <Switch checked={settings.pos.roundingEnabled} onCheckedChange={(v) => updateSetting("pos", "roundingEnabled", v)} />
                      )}
                      {renderSettingRow(
                        "Return Window",
                        "Number of days within which a sale can be returned/exchanged",
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            className="w-20 h-9" 
                            value={settings.pos.returnWindowDays} 
                            onChange={(e) => updateSetting("pos", "returnWindowDays", parseInt(e.target.value))}
                          />
                          <span className="text-xs text-muted-foreground">Days</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Invoice Prefixing</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <Label>Global Prefix</Label>
                          <Input value={settings.pos.invoicePrefix} onChange={(e) => updateSetting("pos", "invoicePrefix", e.target.value)} />
                       </div>
                       <div className="space-y-2">
                          <Label>Global Series (Yearly)</Label>
                          <Input value={settings.pos.invoiceSeries} onChange={(e) => updateSetting("pos", "invoiceSeries", e.target.value)} />
                       </div>
                    </CardContent>
                  </Card>
                </div>
             )}

             {/* Inventory Section */}
             {activeSection === "inventory" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight">Inventory Rules</h3>
                    <p className="text-muted-foreground">Stock logic, barcode generation and valuation settings.</p>
                  </div>
                  <Card>
                    <CardContent className="p-6">
                       {renderSettingRow(
                         "Negative Stock", 
                         "Allow items to be sold even if quantity is zero (inventory will show negative)",
                         <Switch checked={settings.inventory.allowNegativeStock} onCheckedChange={(v) => updateSetting("inventory", "allowNegativeStock", v)} />
                       )}
                       {renderSettingRow(
                         "Low Stock Threshold", 
                         "Global alert level when quantity drops below this number",
                         <Input 
                            type="number" 
                            className="w-20 h-9" 
                            value={settings.inventory.lowStockThreshold} 
                            onChange={(e) => updateSetting("inventory", "lowStockThreshold", parseInt(e.target.value))}
                         />
                       )}
                       {renderSettingRow(
                         "Barcode Auto-Generation", 
                         "Automatically creates EAN-13 barcodes for new items",
                         <Switch checked={settings.inventory.barcodeAutoGenerate} onCheckedChange={(v) => updateSetting("inventory", "barcodeAutoGenerate", v)} />
                       )}
                       {renderSettingRow(
                         "Valuation Method", 
                         "How COGS and stock value shown in accounting reports",
                         <Select value={settings.inventory.stockValuationMethod} onValueChange={(v: any) => updateSetting("inventory", "stockValuationMethod", v)}>
                            <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="FIFO">FIFO (Recommended)</SelectItem>
                              <SelectItem value="Average">Weighted Average</SelectItem>
                              <SelectItem value="LIFO">LIFO</SelectItem>
                            </SelectContent>
                         </Select>
                       )}
                    </CardContent>
                  </Card>
                </div>
             )}

             {/* GST & Accounts Section */}
             {activeSection === "gstAccounts" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight">GST & Financials</h3>
                    <p className="text-muted-foreground">Set up tax rules and automated ledger posting logic.</p>
                  </div>
                  <Card>
                    <CardContent className="p-6">
                       {renderSettingRow(
                         "GST Mode", 
                         "Regular (Monthly 3B) or Composition (Quarterly CMP-08)",
                         <Select value={settings.gstAccounts.gstMode} onValueChange={(v: any) => updateSetting("gstAccounts", "gstMode", v)}>
                            <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="regular">Regular GST Dealer</SelectItem>
                              <SelectItem value="composite">Composition Dealer</SelectItem>
                            </SelectContent>
                         </Select>
                       )}
                       {renderSettingRow(
                         "Tax Inclusion", 
                         "When enabled, catalog prices are treated as GST inclusive",
                         <Switch checked={settings.gstAccounts.inclusiveTax} onCheckedChange={(v) => updateSetting("gstAccounts", "inclusiveTax", v)} />
                       )}
                       {renderSettingRow(
                         "Auto Ledger Posting", 
                         "Post entries to party ledgers immediately after sale/payment",
                         <Switch checked={settings.gstAccounts.ledgerAutoPosting} onCheckedChange={(v) => updateSetting("gstAccounts", "ledgerAutoPosting", v)} />
                       )}
                       {renderSettingRow(
                         "Daily Day-Close", 
                         "Lock financial entry for the day at midnight automatically",
                         <Switch checked={settings.gstAccounts.autoDayClose} onCheckedChange={(v) => updateSetting("gstAccounts", "autoDayClose", v)} />
                       )}
                    </CardContent>
                  </Card>
                </div>
             )}

             {/* AI & Analytics Section */}
             {activeSection === "aiAnalytics" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold tracking-tight">AI & Enterprise Insights</h3>
                      <Badge className="bg-primary/20 text-primary border-none">BETA</Badge>
                    </div>
                    <p className="text-muted-foreground">Empower your ERP with Google Gemini and professional GenAI reporting.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <Card className="bg-gradient-to-br from-indigo-50/50 to-white">
                        <CardHeader className="pb-2">
                           <div className="flex items-center justify-between">
                             <CardTitle className="text-sm font-bold flex items-center gap-2 italic">
                                <Sparkles className="h-4 w-4 text-primary" /> Gemini Assistant
                             </CardTitle>
                             <Switch checked={settings.aiAnalytics.insightsAssistant} onCheckedChange={(v) => updateSetting("aiAnalytics", "insightsAssistant", v)} />
                           </div>
                        </CardHeader>
                        <CardContent>
                           <p className="text-[11px] text-muted-foreground">Allows asking "Why is profit down?", "Which item is slow moving?" via voice or chat.</p>
                        </CardContent>
                     </Card>

                     <Card className="bg-gradient-to-br from-blue-50/50 to-white">
                        <CardHeader className="pb-2">
                           <div className="flex items-center justify-between">
                             <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Search className="h-4 w-4 text-blue-600" /> Anomaly Detection
                             </CardTitle>
                             <Switch checked={settings.aiAnalytics.anomalyAlerts} onCheckedChange={(v) => updateSetting("aiAnalytics", "anomalyAlerts", v)} />
                           </div>
                        </CardHeader>
                        <CardContent>
                           <p className="text-[11px] text-muted-foreground">AI scans daily transactions to find unusual loss or suspicious voided invoices.</p>
                        </CardContent>
                     </Card>
                  </div>

                  <Card>
                    <CardHeader><CardTitle>Global AI Preferences</CardTitle></CardHeader>
                    <CardContent className="p-0 border-t">
                       <div className="p-6">
                         {renderSettingRow(
                           "AI Insights Master", 
                           "Master switch for all Artificial Intelligence features across modules",
                           <Switch checked={settings.aiAnalytics.enabled} onCheckedChange={(v) => updateSetting("aiAnalytics", "enabled", v)} />
                         )}
                         {renderSettingRow(
                           "Daily Summary Cards", 
                           "Display AI-generated profit & stock cards on main dashboard",
                           <Switch checked={settings.aiAnalytics.dailySummaryCards} onCheckedChange={(v) => updateSetting("aiAnalytics", "dailySummaryCards", v)} />
                         )}
                         {renderSettingRow(
                           "Inventory Suggestions", 
                           "AI will suggest reorder quantities based on historical trends",
                           <Switch checked={settings.aiAnalytics.inventorySuggestions} onCheckedChange={(v) => updateSetting("aiAnalytics", "inventorySuggestions", v)} />
                         )}
                         {renderSettingRow(
                           "Assistant Language", 
                           "Voice response and text analysis primary language",
                           <Select value={settings.aiAnalytics.assistantLanguage} onValueChange={(v) => updateSetting("aiAnalytics", "assistantLanguage", v)}>
                              <SelectTrigger className="w-[140px] h-9"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="en">English (US/UK)</SelectItem>
                                <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                                <SelectItem value="mr">Marathi (मराठी)</SelectItem>
                                <SelectItem value="gu">Gujarati (ગુજરાતી)</SelectItem>
                              </SelectContent>
                           </Select>
                         )}
                       </div>
                    </CardContent>
                  </Card>
                </div>
             )}

             {/* Section Placeholders for remaining modules */}
             {!["general", "pos", "inventory", "gstAccounts", "aiAnalytics", "branches"].includes(activeSection) && (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4 animate-in fade-in">
                   <div className="p-6 bg-gray-100 rounded-full">
                      {sections.find(s => s.id === activeSection)?.icon && (
                        <div className="h-10 w-10 text-muted-foreground">
                           {/* Render icon if it exists */}
                        </div>
                      )}
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-xl font-bold">{sections.find(s => s.id === activeSection)?.name}</h3>
                     <p className="text-muted-foreground max-w-sm">This module is part of the Enterprise Settings update. Configuration rules for {sections.find(s => s.id === activeSection)?.name.toLowerCase()} are coming in the next build.</p>
                   </div>
                   <Button variant="outline" onClick={() => setActiveSection("general")}>Back to Profile</Button>
                </div>
             )}

             {/* Branch Management Section */}
             {activeSection === "branches" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold tracking-tight">Branches & Locations</h3>
                    <p className="text-muted-foreground">Manage your physical showrooms and stock transfer rules.</p>
                  </div>
                  <BranchManagement />
                </div>
             )}
          </div>
        </ScrollArea>

        {/* Global Action Footer (Optional, but user wanted status indicator) */}
        {!loading && (
          <div className="absolute bottom-6 right-6 flex items-center gap-3">
             {saving && (
               <div className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full shadow-2xl text-xs animate-bounce border border-white/20">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving changes...
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};
