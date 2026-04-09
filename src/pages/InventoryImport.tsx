import { useState, useCallback } from "react";
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ChevronRight,
  History,
  Trash2,
  Table as TableIcon
} from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

interface InventoryRow {
  item_name: string;
  category: string;
  gross_weight: number;
  net_weight: number;
  purity: string;
  making_charges: number;
  stone_charges: number;
  rate: number;
  barcode: string;
  quantity: number;
  branch?: string;
  supplier?: string;
  hsn_code?: string;
  description?: string;
  [key: string]: any;
}

export default function InventoryImport() {
  const { toast } = useToast();
  const [data, setData] = useState<InventoryRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Upload, 2: Preview, 3: Success

  const downloadTemplate = () => {
    const ws = XLSX.utils.json_to_sheet([
      {
        item_name: "Gold Ring",
        category: "jewelry",
        gross_weight: 5.2,
        net_weight: 4.8,
        purity: "22K",
        making_charges: 500,
        stone_charges: 0,
        rate: 6500,
        barcode: "GR001",
        quantity: 1,
        branch: "Main",
        supplier: "ABC Gold",
        hsn_code: "7113",
        description: "Standard 22K Ring"
      }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "Inventory_Template.xlsx");
  };

  const validateData = (rows: any[]): { validRows: InventoryRow[], errorList: string[] } => {
    const errorList: string[] = [];
    const validRows: InventoryRow[] = [];

    rows.forEach((row, index) => {
      const line = index + 2;
      if (!row.item_name) errorList.push(`Row ${line}: Missing Item Name`);
      if (!row.category) errorList.push(`Row ${line}: Missing Category`);
      if (!row.gross_weight) errorList.push(`Row ${line}: Missing Gross Weight`);
      if (!row.barcode) errorList.push(`Row ${line}: Missing Barcode`);

      validRows.push({
        ...row,
        gross_weight: parseFloat(row.gross_weight) || 0,
        net_weight: parseFloat(row.net_weight) || row.gross_weight || 0,
        making_charges: parseFloat(row.making_charges) || 0,
        stone_charges: parseFloat(row.stone_charges) || 0,
        rate: parseFloat(row.rate) || 0,
        quantity: parseInt(row.quantity) || 1,
      });
    });

    return { validRows, errorList };
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (file.name.endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const { validRows, errorList } = validateData(results.data);
            setData(validRows);
            setErrors(errorList);
            setStep(2);
          }
        });
      } else {
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json(ws);
        const { validRows, errorList } = validateData(rows);
        setData(validRows);
        setErrors(errorList);
        setStep(2);
      }
    };

    if (file.name.endsWith(".csv")) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  };

  const handleImport = async () => {
    if (errors.length > 0) {
      toast({
        title: "Validation Errors",
        description: "Please fix errors before importing.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();
      
      const recordsToInsert = data.map(row => ({
        name: row.item_name,
        category: row.category,
        gross_weight: row.gross_weight,
        net_weight: row.net_weight,
        purity: row.purity,
        price: row.rate,
        making_charges: row.making_charges,
        stone_weight: row.gross_weight - row.net_weight,
        stock: row.quantity,
        barcode: row.barcode,
        hsn_code: row.hsn_code || "7113",
        description: row.description || "",
        subcategory: row.category,
        company_id: session?.user?.user_metadata?.company_id,
        location_id: session?.user?.user_metadata?.location_id,
      }));

      // Upsert to inventory
      await upsertToSupabase('inventory', recordsToInsert);

      // Log import
      await upsertToSupabase('import_logs', {
        id: `import_${Date.now()}`,
        file_name: "inventory_bulk_import",
        import_type: "inventory",
        total_rows: data.length,
        success_rows: data.length,
        failed_rows: 0,
        created_at: new Date().toISOString()
      });

      setStep(3);
      toast({
        title: "Success",
        description: `Imported ${data.length} items successfully.`
      });
    } catch (err) {
      console.error(err);
      toast({
         title: "Import Failed",
         description: "Check logs for details.",
         variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bulk Inventory Upload</h1>
          <p className="text-muted-foreground">Import thousands of items instantly via Excel or CSV.</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate} className="gap-2">
           <Download className="h-4 w-4" /> Download Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
         {[1, 2, 3].map(s => (
           <div key={s} className="flex items-center gap-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold ${step === s ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}>
                {s}
              </div>
              <span className={`text-sm font-medium ${step === s ? "text-primary" : "text-gray-400"}`}>
                 {s === 1 ? "Upload File" : s === 2 ? "Preview & Validate" : "Import Report"}
              </span>
              {s < 3 && <ChevronRight className="h-4 w-4 text-gray-300" />}
           </div>
         ))}
      </div>

      {step === 1 && (
        <Card className="border-dashed border-2 py-12">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
             <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8" />
             </div>
             <div className="text-center">
                <h3 className="text-lg font-bold">Upload Inventory Spreadsheet</h3>
                <p className="text-sm text-muted-foreground">Supported formats: .XLSX, .XLS, .CSV</p>
             </div>
             <div className="w-full max-w-xs">
                <Input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
             </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <div className="space-y-6">
           {errors.length > 0 && (
              <Card className="bg-red-50 border-red-200">
                 <CardHeader>
                    <CardTitle className="text-red-700 flex items-center gap-2 text-sm">
                       <AlertCircle className="h-4 w-4" /> Validation Errors Found ({errors.length})
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <ul className="text-xs text-red-600 list-disc pl-5 space-y-1">
                       {errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                       {errors.length > 5 && <li>...and {errors.length - 5} more</li>}
                    </ul>
                 </CardContent>
              </Card>
           )}

           <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                 <CardTitle className="text-lg flex items-center gap-2">
                    <TableIcon className="h-5 w-5" /> Data Preview
                 </CardTitle>
                 <Badge variant="secondary">{data.length} records detected</Badge>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="overflow-auto max-h-[400px]">
                    <Table>
                       <TableHeader>
                          <TableRow>
                             <TableHead>Item Name</TableHead>
                             <TableHead>Category</TableHead>
                             <TableHead>Purity</TableHead>
                             <TableHead>Weight</TableHead>
                             <TableHead>Barcode</TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {data.slice(0, 10).map((row, i) => (
                             <TableRow key={i}>
                                <TableCell className="font-medium">{row.item_name}</TableCell>
                                <TableCell className="capitalize">{row.category}</TableCell>
                                <TableCell>{row.purity}</TableCell>
                                <TableCell>{row.gross_weight}g</TableCell>
                                <TableCell><Badge variant="outline">{row.barcode}</Badge></TableCell>
                             </TableRow>
                          ))}
                       </TableBody>
                    </Table>
                 </div>
              </CardContent>
           </Card>

           <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setStep(1)}>Cancel & Re-upload</Button>
              <Button onClick={handleImport} disabled={uploading || errors.length > 0}>
                 {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                 Import {data.length} Items Now
              </Button>
           </div>
        </div>
      )}

      {step === 3 && (
        <Card className="bg-green-50 border-green-200 py-12">
           <CardContent className="flex flex-col items-center justify-center space-y-4">
              <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl">
                 <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="text-center space-y-2">
                 <h2 className="text-2xl font-bold text-green-800">Import Completed!</h2>
                 <p className="text-green-700">Successfully synced {data.length} items to cloud inventory.</p>
              </div>
              <div className="flex gap-3">
                 <Button onClick={() => window.location.href = "/inventory"}>Go to Inventory</Button>
                 <Button variant="outline" onClick={() => setStep(1)}>Import More</Button>
              </div>
           </CardContent>
        </Card>
      )}
    </div>
  );
}
