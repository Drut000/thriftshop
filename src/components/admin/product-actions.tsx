"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { MoreVertical, Pencil, Trash2, Eye, CheckCircle } from "lucide-react";
import type { Product } from "@prisma/client";

interface ProductActionsProps {
  product: Product;
}

export function ProductActions({ product }: ProductActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        const menu = document.getElementById(`menu-${product.id}`);
        if (menu && !menu.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
    }

    function handleScroll() {
      setIsOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [product.id]);

  function handleToggle() {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 200;
      
      setMenuPosition({
        top: spaceBelow < menuHeight ? rect.top - menuHeight : rect.bottom + 4,
        left: rect.right - 192, // 192px = w-48
      });
    }
    setIsOpen(!isOpen);
  }

  async function handleMarkAsSold() {
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "sold" }),
      });

      if (!res.ok) throw new Error("Failed to update");

      toast.success("Product marked as sold");
      router.refresh();
    } catch {
      toast.error("Failed to update product");
    }
    setIsOpen(false);
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      setIsOpen(false);
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete");

      toast.success("Product deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  }

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-2 text-espresso-500 hover:text-espresso-700 hover:bg-cream-200 rounded transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <div 
          id={`menu-${product.id}`}
          className="fixed w-48 bg-cream-50 border border-cream-200 shadow-lg z-[100]"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          <div className="py-1">
            <Link
              href={`/admin/products/${product.id}`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-espresso-700 hover:bg-cream-100"
              onClick={() => setIsOpen(false)}
            >
              <Pencil className="w-4 h-4" />
              Edit
            </Link>

            <Link
              href={`/product/${product.slug}`}
              target="_blank"
              className="flex items-center gap-2 px-4 py-2 text-sm text-espresso-700 hover:bg-cream-100"
              onClick={() => setIsOpen(false)}
            >
              <Eye className="w-4 h-4" />
              View on site
            </Link>

            {product.status === "available" && (
              <button
                onClick={handleMarkAsSold}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-espresso-700 hover:bg-cream-100"
              >
                <CheckCircle className="w-4 h-4" />
                Mark as sold
              </button>
            )}

            <hr className="my-1 border-cream-200" />

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-rust-600 hover:bg-rust-50 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
