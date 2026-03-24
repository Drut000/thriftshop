"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Button, Input, Label, Select } from "@/components/ui";
import { useCart, useMounted } from "@/hooks";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, ShoppingBag, Package, Loader2 } from "lucide-react";

interface ShippingMethod {
  id: string;
  name: string;
  description: string | null;
  price: number;
  estimatedDays: string | null;
}

interface ShippingZone {
  id: string;
  name: string;
  methods: ShippingMethod[];
}

export default function CheckoutPage() {
  const router = useRouter();
  const mounted = useMounted();
  const { items, getTotal, clearCart } = useCart();

  // Form state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country] = useState("PL"); // Only Poland for now

  // Shipping
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState("");
  const [loadingShipping, setLoadingShipping] = useState(true);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Hydrate cart
  useEffect(() => {
    useCart.persist.rehydrate();
  }, []);

  // Load shipping methods
  useEffect(() => {
    async function loadShipping() {
      try {
        const res = await fetch("/api/shipping");
        if (res.ok) {
          const data = await res.json();
          setShippingZones(data);
          // Select first method by default
          if (data.length > 0 && data[0].methods.length > 0) {
            setSelectedMethodId(data[0].methods[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load shipping:", error);
      } finally {
        setLoadingShipping(false);
      }
    }
    loadShipping();
  }, []);

  // Get selected shipping method
  const selectedMethod = shippingZones
    .flatMap((z) => z.methods)
    .find((m) => m.id === selectedMethodId);

  const shippingCost = selectedMethod?.price || 0;
  const subtotal = getTotal();
  const total = subtotal + shippingCost;

  // Validate form
  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email";
    }

    if (!name || name.length < 2) newErrors.name = "Name is required";
    if (!street || street.length < 3) newErrors.street = "Street address is required";
    if (!city || city.length < 2) newErrors.city = "City is required";
    if (!postalCode || postalCode.length < 3) newErrors.postalCode = "Postal code is required";
    if (!selectedMethodId) newErrors.shipping = "Select shipping method";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validate()) return;
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create checkout session
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            price: item.price,
          })),
          customerEmail: email,
          customerName: name,
          customerPhone: phone || undefined,
          shippingAddress: {
            street,
            city,
            postalCode,
            country,
          },
          shippingMethodId: selectedMethodId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.unavailable) {
          // Some products no longer available
          toast.error("Some items are no longer available");
          // Could remove them from cart here
          return;
        }
        throw new Error(data.error || "Checkout failed");
      }

      // Redirect to Stripe
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!mounted) {
    return (
      <div className="container-page py-12">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-espresso-400" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-12">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto text-espresso-300 mb-4" />
          <h1 className="font-display text-2xl text-espresso-900 mb-2">
            Your cart is empty
          </h1>
          <p className="text-espresso-500 mb-6">
            Add some items before checking out.
          </p>
          <Link href="/shop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-8 md:py-12">
      <Link
        href="/cart"
        className="inline-flex items-center gap-2 text-espresso-600 hover:text-espresso-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to cart
      </Link>

      <h1 className="font-display text-display-sm md:text-display-md text-espresso-900 mb-8">
        Checkout
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact */}
            <div className="bg-cream-50 border border-cream-200 p-6 space-y-4">
              <h2 className="font-display text-lg text-espresso-900">
                Contact Information
              </h2>

              <div>
                <Label htmlFor="email" required>
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  error={!!errors.email}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-rust-600">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="name" required>
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  error={!!errors.name}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-rust-600">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+48 123 456 789"
                />
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-cream-50 border border-cream-200 p-6 space-y-4">
              <h2 className="font-display text-lg text-espresso-900">
                Shipping Address
              </h2>

              <div>
                <Label htmlFor="street" required>
                  Street Address
                </Label>
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="ul. Przykładowa 123/45"
                  error={!!errors.street}
                />
                {errors.street && (
                  <p className="mt-1 text-sm text-rust-600">{errors.street}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" required>
                    City
                  </Label>
                  <Input
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Warszawa"
                    error={!!errors.city}
                  />
                  {errors.city && (
                    <p className="mt-1 text-sm text-rust-600">{errors.city}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="postalCode" required>
                    Postal Code
                  </Label>
                  <Input
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="00-000"
                    error={!!errors.postalCode}
                  />
                  {errors.postalCode && (
                    <p className="mt-1 text-sm text-rust-600">
                      {errors.postalCode}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Select id="country" value={country} disabled>
                  <option value="PL">Poland</option>
                </Select>
                <p className="mt-1 text-sm text-espresso-500">
                  Currently shipping only to Poland
                </p>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-cream-50 border border-cream-200 p-6 space-y-4">
              <h2 className="font-display text-lg text-espresso-900">
                Shipping Method
              </h2>

              {loadingShipping ? (
                <div className="flex items-center gap-2 text-espresso-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading shipping options...
                </div>
              ) : shippingZones.length === 0 ? (
                <p className="text-espresso-500">
                  No shipping methods available
                </p>
              ) : (
                <div className="space-y-3">
                  {shippingZones.map((zone) =>
                    zone.methods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${
                          selectedMethodId === method.id
                            ? "border-espresso-900 bg-cream-100"
                            : "border-cream-200 hover:border-cream-400"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="shipping"
                            value={method.id}
                            checked={selectedMethodId === method.id}
                            onChange={(e) => setSelectedMethodId(e.target.value)}
                            className="w-4 h-4 text-espresso-900"
                          />
                          <div>
                            <p className="font-medium text-espresso-900">
                              {method.name}
                            </p>
                            {method.description && (
                              <p className="text-sm text-espresso-500">
                                {method.description}
                              </p>
                            )}
                            {method.estimatedDays && (
                              <p className="text-sm text-espresso-500">
                                Delivery: {method.estimatedDays}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-medium text-espresso-900">
                          {formatPrice(method.price)}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              )}
              {errors.shipping && (
                <p className="text-sm text-rust-600">{errors.shipping}</p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-cream-100 border border-cream-200 p-6 sticky top-24">
              <h2 className="font-display text-xl text-espresso-900 mb-4">
                Order Summary
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-3">
                    <div className="relative w-16 h-16 bg-cream-200 flex-shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-espresso-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-espresso-900 truncate">
                        {item.name}
                      </p>
                      {item.size && (
                        <p className="text-xs text-espresso-500">
                          Size: {item.size}
                        </p>
                      )}
                      <p className="text-sm text-espresso-700">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 mb-6 pt-4 border-t border-cream-300">
                <div className="flex justify-between text-espresso-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-espresso-600">
                  <span>Shipping</span>
                  <span>
                    {selectedMethod
                      ? formatPrice(shippingCost)
                      : "Select method"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between font-medium text-espresso-900 pt-4 border-t border-cream-300 mb-6">
                <span>Total</span>
                <span className="font-display text-xl">
                  {formatPrice(total)}
                </span>
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
                size="lg"
              >
                Proceed to Payment
              </Button>

              <p className="text-xs text-espresso-500 text-center mt-4">
                You will be redirected to Stripe for secure payment
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
