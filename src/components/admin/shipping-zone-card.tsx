"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button, Badge } from "@/components/ui";
import { formatPrice } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Pencil,
  Trash2,
  Truck,
} from "lucide-react";
import type { ShippingZoneWithMethods } from "@/types";

interface ShippingZoneCardProps {
  zone: ShippingZoneWithMethods;
}

export function ShippingZoneCard({ zone }: ShippingZoneCardProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);

  async function handleDeleteMethod(methodId: string, methodName: string) {
    if (!confirm(`Delete shipping method "${methodName}"?`)) return;

    setDeletingMethodId(methodId);

    try {
      const res = await fetch(`/api/admin/shipping/methods/${methodId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Shipping method deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete shipping method");
    } finally {
      setDeletingMethodId(null);
    }
  }

  async function handleDeleteZone() {
    if (zone.methods.length > 0) {
      toast.error("Remove all shipping methods first");
      return;
    }

    if (!confirm(`Delete zone "${zone.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/shipping/zones/${zone.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Shipping zone deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete shipping zone");
    }
  }

  return (
    <div className="bg-cream-50 border border-cream-200">
      {/* Zone header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 text-left"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-espresso-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-espresso-400" />
          )}
          <div>
            <h3 className="font-medium text-espresso-900">{zone.name}</h3>
            <p className="text-sm text-espresso-500">
              {zone.countries.length > 0
                ? zone.countries.join(", ")
                : "No countries assigned"}
              {" · "}
              {zone.methods.length} method{zone.methods.length !== 1 ? "s" : ""}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <Link
            href={`/admin/shipping/zones/${zone.id}`}
            className="p-2 text-espresso-500 hover:text-espresso-700 hover:bg-cream-200 rounded transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={handleDeleteZone}
            className="p-2 text-espresso-500 hover:text-rust-600 hover:bg-rust-50 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Methods list */}
      {isExpanded && (
        <div className="p-4">
          {zone.methods.length === 0 ? (
            <div className="text-center py-6 text-espresso-500">
              <Truck className="w-8 h-8 mx-auto mb-2 text-espresso-300" />
              <p className="mb-3">No shipping methods in this zone</p>
              <Link href={`/admin/shipping/methods/new?zoneId=${zone.id}`}>
                <Button size="sm" variant="secondary">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Method
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {zone.methods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between p-3 bg-cream-100 rounded"
                >
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-espresso-400" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-espresso-900">
                          {method.name}
                        </span>
                        {!method.active && (
                          <Badge variant="warning">Inactive</Badge>
                        )}
                      </div>
                      {method.description && (
                        <p className="text-sm text-espresso-500">
                          {method.description}
                        </p>
                      )}
                      {method.estimatedDays && (
                        <p className="text-sm text-espresso-400">
                          {method.estimatedDays}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-medium text-espresso-900">
                      {formatPrice(Number(method.price))}
                    </span>

                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/shipping/methods/${method.id}`}
                        className="p-1.5 text-espresso-500 hover:text-espresso-700 hover:bg-cream-200 rounded transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteMethod(method.id, method.name)}
                        disabled={deletingMethodId === method.id}
                        className="p-1.5 text-espresso-500 hover:text-rust-600 hover:bg-rust-50 rounded transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <Link
                href={`/admin/shipping/methods/new?zoneId=${zone.id}`}
                className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-cream-300 text-espresso-500 hover:border-espresso-400 hover:text-espresso-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add shipping method
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
