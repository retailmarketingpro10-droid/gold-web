import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Scan, 
  Trash2, 
  Save, 
  AlertCircle, 
  Loader2, 
  Package, 
  ChevronDown,
  Volume2,
  ListRestart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { upsertToSupabase } from "@/lib/supabaseDirect";
import { getSupabase } from "@/lib/supabase";

interface StockEntry {
  id: string;
  barcode: string;
  name: string;
  gross_weight: number;
  net_weight: number;
  purity: string;
  making: number;
}

export default function BarcodeStockEntry() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<StockEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({
    category: "jewelry",
    purity: "22K",
    making: 500
  });

  // Current Input State
  const [current, setCurrent] = useState({
    barcode: "",
    name: "",
    gross_weight: "",
    net_weight: "",
    purity: "22K",
    making: ""
  });

  const barcodeRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  const makingRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  const playSuccess = () => {
    // Simple beep sound if available or logic to play audio
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = context.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, context.currentTime);
    osc.connect(context.destination);
    osc.start();
    osc.stop(context.currentTime + 0.1);
  };

  const handleAdd = useCallback(() => {
    if (!current.barcode) return;

    const newEntry: StockEntry = {
      id: Math.random().toString(36).substr(2, 9),
      barcode: current.barcode,
      name: current.name || `Jewelry Item ${entries.length + 1}`,
      gross_weight: parseFloat(current.gross_weight) || 0,
      net_weight: parseFloat(current.net_weight) || parseFloat(current.gross_weight) || 0,
      purity: current.purity,
      making: parseFloat(current.making) || globalSettings.making
    };

    setEntries(prev => [newEntry, ...prev]);
    playSuccess();
    
    // Reset inputs for next scan
    setCurrent({
      barcode: "",
      name: "",
      gross_weight: "",
      net_weight: "",
      purity: globalSettings.purity,
      making: globalSettings.making.toString()
    });
    
    // Refocus barcode
    setTimeout(() => barcodeRef.current?.focus(), 10);
  }, [current, entries, globalSettings]);

  const handleKeyPress = (e: React.KeyboardEvent, field: string) => {
    if (e.key === "Enter") {
      if (field === "barcode" && current.barcode) weightRef.current?.focus();
      else if (field === "weight") makingRef.current?.focus();
      else if (field === "making") handleAdd();
    }
  };

  const saveAll = async () => {
    if (entries.length === 0) return;
    setLoading(true);

    try {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      const records = entries.map(e => ({
        name: e.name,
        category: globalSettings.category,
        gross_weight: e.gross_weight,
        net_weight: e.net_weight,
        purity: e.purity,
        making_charges: e.making,
        barcode: e.barcode,
        price: 6500 * e.net_weight + e.making, // Auto-calc or manual
        stock: 1,
        subcategory: globalSettings.category,
        company_id: session?.user?.user_metadata?.company_id,
        location_id: session?.user?.user_metadata?.location_id,
      }));

      await upsertToSupabase('inventory', records);
      toast({
        title: "Stock Entry Saved",
        description: `Successfully added ${entries.length} items to inventory via barcode entry.`
      });
      setEntries([]);
      barcodeRef.current?.focus();
    } catch (err) {
      console.error(err);
      toast({ title: "Error Saving Stock", description: "Storage sync failed.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 lg:p-8 animate-in fade-in">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Barcode Stock Entry</h1>
            <p className="text-muted-foreground">Industrial-standard mass entry mode for new jewelry stock arriving.</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" onClick={() => setEntries([])} className="h-11">
                <ListRestart className="h-4 w-4 mr-2" /> Reset Session
             </Button>
             <Button onClick={saveAll} disabled={entries.length === 0 || loading} className="h-11 bg-primary px-8">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Post {entries.length} Items to Cloud
             </Button>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1 shadow-lg border-primary/20 ring-1 ring-primary/10">
             <CardHeader className="bg-primary/5 py-4">
                <CardTitle className="text-sm flex items-center gap-2">
                   <Scan className="h-4 w-4 text-primary" /> Active Scan Mode
                </CardTitle>
             </CardHeader>
             <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                   <Label className="text-xs">Barcode (Scan Now)</Label>
                   <Input 
                      ref={barcodeRef}
                      value={current.barcode}
                      onChange={(e) => setCurrent({...current, barcode: e.target.value})}
                      onKeyPress={(e) => handleKeyPress(e, "barcode")}
                      placeholder="SCAN HERE"
                      className="h-12 border-2 border-primary focus-visible:ring-primary font-mono text-lg"
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-xs">Gross Weight (g)</Label>
                   <Input 
                      ref={weightRef}
                      type="number"
                      value={current.gross_weight}
                      onChange={(e) => setCurrent({...current, gross_weight: e.target.value})}
                      onKeyPress={(e) => handleKeyPress(e, "weight")}
                      className="h-10 text-xl font-bold"
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-xs">Making Charges (₹)</Label>
                   <Input 
                      ref={makingRef}
                      type="number"
                      value={current.making}
                      onChange={(e) => setCurrent({...current, making: e.target.value})}
                      onKeyPress={(e) => handleKeyPress(e, "making")}
                      className="h-10"
                   />
                </div>
                <div className="space-y-2">
                   <Label className="text-xs">Purity</Label>
                   <Select value={current.purity} onValueChange={(v) => setCurrent({...current, purity: v})}>
                      <SelectTrigger className="h-10">
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="24K">24K (999)</SelectItem>
                         <SelectItem value="22K">22K (916)</SelectItem>
                         <SelectItem value="20K">20K (833)</SelectItem>
                         <SelectItem value="18K">18K (750)</SelectItem>
                      </SelectContent>
                   </Select>
                </div>
                <Button className="w-full h-11 mt-4" onClick={handleAdd}>Add Next (Enter)</Button>
             </CardContent>
          </Card>

          <Card className="md:col-span-3 min-h-[500px]">
             <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="flex items-center gap-4">
                   <CardTitle className="text-lg">Scanned Queue</CardTitle>
                   <Badge variant="outline" className="bg-blue-50 text-blue-700">{entries.length} items</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                   <Volume2 className="h-3 w-3" /> Audio feedback active
                </div>
             </CardHeader>
             <CardContent className="p-0">
                <Table>
                   <TableHeader>
                      <TableRow className="bg-gray-50/50">
                         <TableHead className="w-[150px]">Barcode</TableHead>
                         <TableHead>Purity</TableHead>
                         <TableHead>Weight</TableHead>
                         <TableHead>Making</TableHead>
                         <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {entries.length === 0 ? (
                        <TableRow>
                           <TableCell colSpan={5} className="h-80 text-center">
                              <div className="flex flex-col items-center justify-center space-y-2 opacity-30">
                                 <Scan className="h-12 w-12" />
                                 <p className="text-lg font-medium">Ready for scanning...</p>
                              </div>
                           </TableCell>
                        </TableRow>
                      ) : (
                        entries.map((entry) => (
                           <TableRow key={entry.id} className="animate-in slide-in-from-top-2">
                              <TableCell className="font-mono font-bold">{entry.barcode}</TableCell>
                              <TableCell><Badge variant="secondary">{entry.purity}</Badge></TableCell>
                              <TableCell className="font-bold">{entry.gross_weight}g</TableCell>
                              <TableCell>₹{entry.making}</TableCell>
                              <TableCell className="text-right">
                                 <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setEntries(prev => prev.filter(e => e.id !== entry.id))}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                 >
                                    <Trash2 className="h-4 w-4" />
                                 </Button>
                              </TableCell>
                           </TableRow>
                        ))
                      )}
                   </TableBody>
                </Table>
             </CardContent>
          </Card>
       </div>
    </div>
  );
}
