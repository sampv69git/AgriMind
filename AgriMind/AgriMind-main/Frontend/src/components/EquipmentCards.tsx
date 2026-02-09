import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface EquipmentItem {
  id: number;
  name: string;
  description: string;
  price: number;
  listingType: "Rent" | "Buy";
  imageUrl: string;
  category: string;
  condition: string;
  location: string;
  rating: number;
}

const EquipmentCard: React.FC<{ item: EquipmentItem }> = ({ item }) => {
  const [showModal, setShowModal] = useState(false);
  const [date, setDate] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const today = new Date().toISOString().split("T")[0];

  const handleActionClick = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to continue.",
        variant: "destructive",
      });
      return;
    }
    setShowModal(true);
  };

  const handleConfirm = () => {
    toast({
      title: "Success",
      description:
        item.listingType === "Rent"
          ? `Rental booked for ${item.name}`
          : `Purchase confirmed for ${item.name}`,
    });

    setShowModal(false);
    setDate("");
    setQuantity(1);
  };

  const getConditionBadge = (condition: string) => {
    const map: Record<string, string> = {
      New: "bg-green-100 text-green-800",
      Excellent: "bg-blue-100 text-blue-800",
      "Very Good": "bg-teal-100 text-teal-800",
      Good: "bg-amber-100 text-amber-800",
      Fair: "bg-orange-100 text-orange-800",
      Poor: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs ${
          map[condition] || "bg-gray-100 text-gray-800"
        }`}
      >
        {condition}
      </span>
    );
  };

  return (
    <>
      <Card className="overflow-hidden transition-all hover:shadow-lg h-full flex flex-col">
        <div className="h-48 relative overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/placeholder-equipment.jpg";
            }}
          />
          <div className="absolute top-2 right-2">
            {getConditionBadge(item.condition)}
          </div>
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-sm text-gray-600 mb-3">
            {item.description}
          </p>

          <div className="mt-auto">
            <p className="text-2xl font-bold">
              ₹{item.price.toLocaleString()}
              {item.listingType === "Rent" && (
                <span className="text-sm text-gray-500"> / month</span>
              )}
            </p>

            <Button
              className="w-full mt-4 bg-green-600 hover:bg-green-700"
              onClick={handleActionClick}
            >
              {item.listingType === "Rent" ? "Rent Now" : "Buy Now"}
            </Button>
          </div>
        </div>
      </Card>

      {/* -------- MODAL -------- */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {item.listingType === "Rent"
                ? "Rent Equipment"
                : "Buy Equipment"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <Label>
                {item.listingType === "Rent"
                  ? "Duration (months)"
                  : "Quantity"}
              </Label>
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Number(e.target.value))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EquipmentCard;
