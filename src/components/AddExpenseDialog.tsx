import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, X, Image } from "lucide-react";
import { categories } from "@/data/expenseData";
import { toast } from "sonner";

interface AddExpenseDialogProps {
  onAdd: (expense: {
    date: string;
    description: string;
    amount: number;
    category: string;
    paidBy: string;
    bill: string;
    notes: string;
  }) => void;
}

export const AddExpenseDialog = ({ onAdd }: AddExpenseDialogProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [paidBy, setPaidBy] = useState("siva");
  const [bill, setBill] = useState("");
  const [billPreview, setBillPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a data URL for preview and storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setBill(dataUrl);
        setBillPreview(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearBillImage = () => {
    setBill("");
    setBillPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) {
      toast.error("Please fill required fields");
      return;
    }
    onAdd({
      date,
      description,
      amount: parseFloat(amount),
      category,
      paidBy,
      bill,
      notes
    });
    toast.success("Expense added successfully!");
    setOpen(false);
    // Reset form
    setDescription("");
    setAmount("");
    setBill("");
    setBillPreview(null);
    setNotes("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="e.g., auto, dinner, rent"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidBy">Paid By</Label>
              <Input
                id="paidBy"
                placeholder="siva"
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Optional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Bill / GST Bill / Image (Optional)</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Enter URL or upload image"
                value={billPreview ? "Image uploaded" : bill}
                onChange={(e) => {
                  setBill(e.target.value);
                  setBillPreview(null);
                }}
                disabled={!!billPreview}
                className="flex-1"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              {(bill || billPreview) && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={clearBillImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {billPreview && (
              <div className="relative mt-2">
                <img 
                  src={billPreview} 
                  alt="Bill preview" 
                  className="w-full max-h-32 object-contain rounded border"
                />
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};