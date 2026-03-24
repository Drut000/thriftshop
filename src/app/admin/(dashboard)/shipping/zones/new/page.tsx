"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button, Input, Label } from "@/components/ui";
import { ArrowLeft } from "lucide-react";

export default function NewShippingZonePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Zone name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/shipping/zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create zone");
      }

      toast.success("Shipping zone created");
      router.push("/admin/shipping");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create zone");
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
        New Shipping Zone
      </h1>

      <form onSubmit={handleSubmit} className="bg-cream-50 border border-cream-200 p-6 space-y-4">
        <div>
          <Label htmlFor="name" required>
            Zone Name
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Poland, EU, Worldwide"
            error={!!error}
          />
          {error && <p className="mt-1 text-sm text-rust-600">{error}</p>}
          <p className="mt-1 text-sm text-espresso-500">
            Name this zone based on the region it covers
          </p>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" isLoading={isSubmitting}>
            Create Zone
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
