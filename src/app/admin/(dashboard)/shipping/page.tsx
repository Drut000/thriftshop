import Link from "next/link";
import { db } from "@/lib/db";
import { Button, Badge } from "@/components/ui";
import { ShippingZoneCard } from "@/components/admin/shipping-zone-card";
import { Plus, Globe } from "lucide-react";

async function getShippingData() {
  return db.shippingZone.findMany({
    orderBy: { name: "asc" },
    include: {
      methods: {
        orderBy: { price: "asc" },
      },
    },
  });
}

export default async function ShippingPage() {
  const zones = await getShippingData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-espresso-600">
          {zones.length} shipping zone{zones.length !== 1 ? "s" : ""}
        </p>
        <Link href="/admin/shipping/zones/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Zone
          </Button>
        </Link>
      </div>

      {/* Zones list */}
      {zones.length === 0 ? (
        <div className="bg-cream-50 border border-cream-200 px-6 py-12 text-center">
          <Globe className="w-12 h-12 mx-auto text-espresso-300 mb-4" />
          <p className="text-espresso-500 mb-4">No shipping zones yet</p>
          <Link href="/admin/shipping/zones/new">
            <Button>Create your first zone</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {zones.map((zone) => (
            <ShippingZoneCard key={zone.id} zone={zone} />
          ))}
        </div>
      )}

      {/* Info box */}
      <div className="bg-sage-50 border border-sage-200 p-4">
        <h3 className="font-medium text-sage-800 mb-2">How shipping zones work</h3>
        <ul className="text-sm text-sage-700 space-y-1">
          <li>• Create zones for different regions (e.g., Poland, EU, World)</li>
          <li>• Add shipping methods to each zone with prices</li>
          <li>• Customers see methods based on their delivery country</li>
          <li>• Currently only Poland is supported (more coming soon)</li>
        </ul>
      </div>
    </div>
  );
}
