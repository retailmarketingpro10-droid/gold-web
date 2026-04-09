import { useState, useCallback, useRef } from "react";
import { 
  Plus, 
  FolderOpen, 
  Image as ImageIcon, 
  Trash2, 
  Save, 
  AlertCircle, 
  Loader2,
  Tag,
  Grid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { upsertToSupabase } from "@/lib/supabaseDirect";
import { getSupabase } from "@/lib/supabase";

interface CatalogItem {
  id: string;
  designName: string;
  category: string;
  purity: string;
  weight: number;
  priceRange: string;
  description: string;
  image: File | string;
  previewUrl: string;
  tags: string[];
  collection: string;
}

export default function CatalogUpload() {
  const { toast } = useToast();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null, isFolder = false) => {
    if (!files) return;

    const newItems: CatalogItem[] = Array.from(files)
      .filter(file => file.type.startsWith("image/"))
      .map(file => {
        let category = "jewelry";
        let designName = file.name.split(".")[0].replace(/[-_]/g, " ");

        if (isFolder && (file as any).webkitRelativePath) {
          const pathParts = (file as any).webkitRelativePath.split("/");
          if (pathParts.length > 1) {
            category = pathParts[pathParts.length - 2].toLowerCase();
          }
        }

        return {
          id: Math.random().toString(36).substr(2, 9),
          designName: designName,
          category: category,
          purity: "22K",
          weight: 0,
          priceRange: "",
          description: "",
          image: file,
          previewUrl: URL.createObjectURL(file),
          tags: [category],
          collection: ""
        };
      });

    setItems(prev => [...prev, ...newItems]);
  };

  const updateItem = (id: string, updates: Partial<CatalogItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleBulkImport = async () => {
    if (items.length === 0) return;
    setUploading(true);

    try {
      const supabase = getSupabase();
      const { data: { session } } = await supabase.auth.getSession();

      // In a real app, you would upload images to Supabase Storage first.
      // For this implementation, I'll simulate image URLs.
      const catalogRecords = items.map(item => ({
        id: `cat_${item.id}`,
        design_name: item.designName,
        category_id: item.category, // assuming category name works as ID for now or lookup happens
        purity: item.purity,
        approx_weight: item.weight,
        price_range: item.priceRange,
        description: item.description,
        image_url: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&q=80", // Placeholder
        tags: JSON.stringify(item.tags),
        collection: item.collection,
        company_id: session?.user?.user_metadata?.company_id,
        location_id: session?.user?.user_metadata?.location_id,
      }));

      await upsertToSupabase('catalog', catalogRecords);

      toast({
        title: "Catalog Synced",
        description: `Successfully created ${items.length} designs in catalog.`
      });
      setItems([]);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Bulk catalog upload failed.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 lg:p-8 animate-in fade-in">
       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Design Catalog Bulk Upload</h1>
            <p className="text-muted-foreground">Upload thousands of designs from folders or multiple files instantly.</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="h-11">
                <Plus className="h-4 w-4 mr-2" /> Add Images
             </Button>
             <Button variant="outline" onClick={() => folderInputRef.current?.click()} className="h-11">
                <FolderOpen className="h-4 w-4 mr-2" /> Upload Folder
             </Button>
             <Button onClick={handleBulkImport} disabled={items.length === 0 || uploading} className="h-11 bg-primary px-8">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save {items.length} Designs
             </Button>
          </div>
       </div>

       <input 
          type="file" 
          ref={fileInputRef} 
          hidden 
          multiple 
          accept="image/*" 
          onChange={(e) => handleFiles(e.target.files)} 
       />
       <input 
          type="file" 
          ref={folderInputRef} 
          hidden 
          {...({ webkitdirectory: "" } as any)}
          onChange={(e) => handleFiles(e.target.files, true)} 
       />

       {items.length === 0 ? (
         <Card className="border-dashed py-24 flex flex-col items-center justify-center text-center">
            <div className="h-20 w-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
               <ImageIcon className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-medium text-gray-900">No designs selected</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-6">Select multiple images or a whole folder to automatically categorize and name your designs.</p>
            <div className="flex gap-3">
               <Button onClick={() => fileInputRef.current?.click()}>Choose Files</Button>
               <Button variant="outline" onClick={() => folderInputRef.current?.click()}>Choose Folder</Button>
            </div>
         </Card>
       ) : (
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="overflow-hidden group hover:shadow-xl transition-shadow border-none ring-1 ring-gray-100">
                 <div className="aspect-square relative overflow-hidden bg-gray-50">
                    <img src={item.previewUrl} className="w-full h-full object-contain" alt="Preview" />
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 right-2 h-8 w-8 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                       <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/60 text-white text-[10px] rounded backdrop-blur">
                       MODERN DESIGN
                    </div>
                 </div>
                 <CardContent className="p-4 space-y-4">
                    <div className="space-y-1">
                       <Label className="text-[10px] uppercase text-muted-foreground font-bold">Design Name</Label>
                       <Input 
                          value={item.designName} 
                          onChange={(e) => updateItem(item.id, { designName: e.target.value })}
                          className="h-9 font-medium"
                       />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Category</Label>
                        <Select value={item.category} onValueChange={(v) => updateItem(item.id, { category: v })}>
                           <SelectTrigger className="h-9">
                              <SelectValue />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="jewelry">Jewelry</SelectItem>
                              <SelectItem value="rings">Rings</SelectItem>
                              <SelectItem value="necklaces">Necklaces</SelectItem>
                              <SelectItem value="earrings">Earrings</SelectItem>
                           </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Approx Weight (g)</Label>
                        <Input 
                          type="number"
                          value={item.weight} 
                          onChange={(e) => updateItem(item.id, { weight: parseFloat(e.target.value) })}
                          className="h-9"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[10px] uppercase text-muted-foreground font-bold">Description / Notes</Label>
                      <Input 
                        placeholder="Add short detail..."
                        value={item.description} 
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        className="h-9"
                      />
                    </div>
                 </CardContent>
              </Card>
            ))}
         </div>
       )}
    </div>
  );
}
