"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, Select, Input, Label } from "@/components/ui";

interface OrderStatusFormProps {
  orderId: string;
  currentStatus: string;
  currentTracking: string | null;
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  shippingMethod: string;
}

const STATUS_OPTIONS = [
  { value: "pending_payment", label: "Pending Payment" },
  { value: "paid", label: "Paid" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export function OrderStatusForm({
  orderId,
  currentStatus,
  currentTracking,
  customerEmail,
  customerName,
  orderNumber,
  shippingMethod,
}: OrderStatusFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [trackingNumber, setTrackingNumber] = useState(currentTracking || "");
  const [sendEmail, setSendEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showTrackingField = status === "shipped";
  const trackingChanged = trackingNumber !== (currentTracking || "");
  const statusChanged = status !== currentStatus;
  const hasChanges = statusChanged || trackingChanged;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!hasChanges) {
      toast.info("No changes to save");
      return;
    }

    if (status === "shipped" && !trackingNumber.trim()) {
      toast.error("Tracking number is required for shipped status");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber.trim() || null,
          sendEmail: sendEmail && status === "shipped" && trackingNumber.trim(),
          customerEmail,
          customerName,
          orderNumber,
          shippingMethod,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update order");
      }

      toast.success("Order updated successfully");
      
      if (sendEmail && status === "shipped" && trackingNumber.trim()) {
        toast.success("Shipping notification email sent");
      }

      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="status">Order Status</Label>
        <Select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>

      {showTrackingField && (
        <div>
          <Label htmlFor="tracking">Tracking Number</Label>
          <Input
            id="tracking"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
          />
          <p className="mt-1 text-sm text-espresso-500">
            Required when marking as shipped
          </p>
        </div>
      )}

      {showTrackingField && trackingNumber.trim() && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sendEmail"
            checked={sendEmail}
            onChange={(e) => setSendEmail(e.target.checked)}
            className="w-4 h-4"
          />
          <Label htmlFor="sendEmail" className="mb-0">
            Send shipping notification to customer
          </Label>
        </div>
      )}

      <Button type="submit" isLoading={isSubmitting} disabled={!hasChanges}>
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
