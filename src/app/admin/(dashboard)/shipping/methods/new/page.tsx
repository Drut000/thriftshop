"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button, Input, Label, Select } from "@/components/ui";
import { ArrowLeft } from "lucide-react";

interface ShippingZone {
  id: string;
  name: string;
}

export default function NewShippingMethodPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedZoneId = searchParams.get("zoneId") || "";

  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [zoneId, setZoneId] = useState(preselectedZoneId);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [active, setActive] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load zones
  useEffect(() => {
    async function loadZones() {
      try {
        const res = await fetch("/api/admin/shipping/zones");
        if (res.ok) {
          const data = await res.json();
          setZones(data);
        }
      } catch (error) {
        console.error("Failed to load zones:", error);
      }
    }
    loadZones();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    // Validate
    const newErrors: Record<string, string> = {};
    if (!zoneId) newErrors.zoneId = "Zone is required";
    if (!name.trim()) newErrors.name = "Name is required";
    if (!price || parseFloat(price) < 0) newErrors.price = "Valid price is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/shipping/methods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          zoneId,
          name: name.trim(),
          description: description.trim() || undefined,
          price: parseFloat(price),
          estimatedDays: estimatedDays.trim() || undefined,
          active,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create method");
      }

      toast.success("Shipping method created");
      router.push("/admin/shipping");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create method");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-xl">
      <Link
        href="/admin/shipping"
        className="inline-flex items-center gap-2 text-espresso-600 hover:text-espresso-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to shipping
      </Link>

      <h1 className="font-display text-2xl text-espresso-900 mb-6">
        New Shipping Method
      </h1>

      <form onSubmit={handleSubmit} className="bg-cream-50 border border-cream-200 p-6 space-y-4">
        <div>
          <Label htmlFor="zone" required>
            Shipping Zone
          </Label>
          <Select
            id="zone"
            value={zoneId}
            onChange={(e) => setZoneId(e.target.value)}
            error={!!errors.zoneId}
          >
            <option value="">Select zone...</option>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name}
              </option>
            ))}
          </Select>
          {errors.zoneId && (
            <p className="mt-1 text-sm text-rust-600">{errors.zoneId}</p>
          )}
        </div>

        <div>
          <Label htmlFor="name" required>
            Method Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., InPost Paczkomat, DHL Courier"
            error={!!errors.name}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-rust-600">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">
            Description (optional)
          </Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Delivery to parcel locker"
          />
        </div>

        <div>
          <Label htmlFor="price" required>
            Price (PLN)
          </Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            error={!!errors.price}
          />
          {errors.price && (
            <p className="mt-1 text-sm text-rust-600">{errors.price}</p>
          )}
        </div>

        <div>
          <Label htmlFor="estimatedDays">
            Estimated Delivery Time (optional)
          </Label>
          <Input
            id="estimatedDays"
            value={estimatedDays}
            onChange={(e) => setEstimatedDays(e.target.value)}
            placeholder="e.g., 1-2 business days"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4"
          />
          <Label htmlFor="active" className="mb-0">
            Active (visible to customers)
          </Label>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" isLoading={isSubmitting}>
            Create Method
          </Button>
          <Link href="/admin/shipping">
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
