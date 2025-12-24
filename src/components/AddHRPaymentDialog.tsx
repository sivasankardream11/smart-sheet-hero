import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BadgeCheck } from "lucide-react";
import { months } from "@/data/expenseData";
import { toast } from "sonner";

interface AddHRPaymentDialogProps {
  pendingBalance: number;
  onAdd: (payment: {
    date: string;
    month: string;
    amount: number;
    notes: string;
  }) => void;
}

export const AddHRPaymentDialog = ({ pendingBalance, onAdd }: AddHRPaymentDialogProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [month, setMonth] = useState(months[months.length - 1]);
  const [amount, setAmount] = useState(Math.abs(pendingBalance).toString());
  const [notes, setNotes] = useState("Balance cleared by HR");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !month) {
      toast.error("Please fill required fields");
      return;
    }
    onAdd({
      date,
      month,
      amount: parseFloat(amount),
      notes
    });
    toast.success("HR Payment recorded - Balance cleared!");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          variant="outline" 
          className="gap-2 border-primary text-primary hover:bg-primary/10"
          disabled={pendingBalance >= 0}
        >
          <BadgeCheck className="h-4 w-4" />
          HR Paid
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Record HR Payment</DialogTitle>
        </DialogHeader>
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-4">
          <p className="text-sm text-muted-foreground">Current Pending Balance</p>
          <p className="text-2xl font-bold text-destructive">₹{Math.abs(pendingBalance).toLocaleString('en-IN')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Payment Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="month">For Month *</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount Paid (₹) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              placeholder="Balance cleared by HR"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};