import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface BookSessionModalProps {
  open: boolean;
  onClose: () => void;
  expert: {
    name: string;
    specialty: string;
  } | null;
}

export default function BookSessionModal({
  open,
  onClose,
  expert,
}: BookSessionModalProps) {
  if (!expert) return null;

  const handleConfirm = () => {
    alert(
      `Session booked with ${expert.name} (${expert.specialty})!\n\nWe will contact you soon.`
    );
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book Session</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="font-semibold">{expert.name}</p>
            <p className="text-sm text-muted-foreground">
              {expert.specialty}
            </p>
          </div>

          <div>
            <Label>Date</Label>
            <Input type="date" />
          </div>

          <div>
            <Label>Preferred Time</Label>
            <Input type="time" />
          </div>

          <div>
            <Label>Message (optional)</Label>
            <Textarea placeholder="Describe your issue or requirements..." />
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
