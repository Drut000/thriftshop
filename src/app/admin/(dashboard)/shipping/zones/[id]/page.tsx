"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button, Input, Label } from "@/components/ui";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function EditShippingZonePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Load zone
  useEffect(() => {
    async function loadZone() {
      try {
        const res = await fetch(`/api/admin/shipping/zones/${id}`);
        if (!res.ok) throw new Error("Zone not found");
        const data = await res.json();
        setName(data.name);
      } catch (err) {
        toast.error("Failed to load zone");
        router.push("/admin/shipping");
      } finally {
        setIsLoading(false);
      }
    }
    loadZone();
  }, [id, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Zone name is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/shipping/zones/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update zone");
      }

      toast.success("Shipping zone updated");
      router.push("/admin/shipping");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update zone");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-espresso-400" />
      </div>
    );
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
        Edit Shipping Zone
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
        </div>

        <div className="flex items-center gap-4 pt-4">
          <Button type="submit" isLoading={isSubmitting}>
            Save Changes
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
