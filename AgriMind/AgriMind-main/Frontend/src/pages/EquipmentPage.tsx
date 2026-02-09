import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

/* ---------------- DATA (UNCHANGED – ALL 6) ---------------- */

const equipmentData = [
  {
    name: "Tractor",
    image:
      "https://magmedia.machines4u.com.au/wp-content/uploads/2017/02/26094110/r4d073222-5E-762x458.jpg",
    type: "Rental / Buy",
    priceRent: "₹1500/day",
    priceBuy: "₹250000",
    description: "Heavy-duty tractor for plowing and tilling large fields.",
  },
  {
    name: "Combine Harvester",
    image:
      "https://www.mechanicalpower.net/wp-content/uploads/2023/05/Combine-Harvester.jpg",
    type: "Rental",
    priceRent: "₹300/day",
    description: "Efficiently harvest crops like wheat, corn, and rice.",
  },
  {
    name: "Seed Drill",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcHEr-yv5jkRKIii7VxDz5P2RoAf8IzwL20HGvCsv57FYQD8N5ak5jZWWCY-qAJON2_6c&usqp=CAU",
    type: "Rental / Buy",
    priceRent: "₹80/day",
    priceBuy: "₹5,000",
    description: "Automated seed planter for precise and uniform sowing.",
  },
  {
    name: "Irrigation Sprinkler",
    image:
      "https://www.shutterstock.com/shutterstock/videos/31570960/thumb/8.jpg?ip=x480",
    type: "Buy",
    priceBuy: "₹1,200",
    description: "Automated sprinkler system for efficient irrigation.",
  },
  {
    name: "Pesticide Sprayer",
    image:
      "https://imgs.search.brave.com/vfiZJl8mqHMNt_IzyKeGyRVHfR-38-3Xw5PWvbDsJws/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4u/Y3JlYXRlLnZpc3Rh/LmNvbS9hcGkvbWVk/aWEvc21hbGwvNjcw/MzcxODgwL3N0b2Nr/LXBob3RvLXBsYXN0/aWMtZ3JlZW4tYmFj/a3BhY2stY29udGFp/bmVyLXNwcmF5ZXIt/bGlxdWlkLXBlc3Rp/Y2lkZS1oZXJiaWNp/ZGUtcHJvdGVjdGlu/Zy1wbGFudHM",
    type: "Rental",
    priceRent: "₹50/day",
    description: "Portable sprayer for pesticides and fertilizers.",
  },
  {
    name: "Rotary Tiller",
    image:
      "https://www.goodworkstractors.com/wp-content/uploads/2020/11/Rhino-Rebel-Rotary-Tiller-02.jpg",
    type: "Rental / Buy",
    priceRent: "₹70/day",
    priceBuy: "₹2,500",
    description: "Prepares soil by breaking hard ground.",
  },
];

/* ---------------- COMPONENT ---------------- */

const EquipmentPage = () => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [mode, setMode] = useState<"Rent" | "Buy">("Rent");

  const [date, setDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleAction = (item: any, action: "Rent" | "Buy") => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to continue.",
        variant: "destructive",
      });
      return;
    }

    setSelectedItem(item);
    setMode(action);
    setOpen(true);
  };

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 pb-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Equipment Rentals & Sales
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find the right tools for your farm.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {equipmentData.map((item, index) => (
            <Card key={index} className="flex flex-col hover:shadow-lg">
              <CardHeader className="p-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-48 w-full object-cover"
                />
              </CardHeader>

              <CardContent className="p-6 flex-grow">
                <Badge className="mb-2">{item.type}</Badge>
                <CardTitle className="mb-2">{item.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {item.description}
                </p>

                <div className="mt-4 font-semibold">
                  {item.priceRent && <span>Rent: {item.priceRent}</span>}
                  {item.priceRent && item.priceBuy && <span className="mx-2">|</span>}
                  {item.priceBuy && <span>Buy: {item.priceBuy}</span>}
                </div>
              </CardContent>

              <CardFooter className="p-6 flex gap-4">
                {item.priceBuy && (
                  <Button
                    className="w-full"
                    onClick={() => handleAction(item, "Buy")}
                  >
                    Buy Now
                  </Button>
                )}
                {item.priceRent && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAction(item, "Rent")}
                  >
                    Rent Now
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* -------- MODAL -------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {mode} {selectedItem?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <Label>{mode === "Rent" ? "Duration (days)" : "Quantity"}</Label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <div>
              <Label>Message</Label>
              <Textarea
                placeholder="Any special requirements..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast({
                  title: "Success",
                  description: `${mode} request submitted successfully.`,
                });
                setOpen(false);
                setDate("");
                setQuantity(1);
                setMessage("");
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EquipmentPage;
