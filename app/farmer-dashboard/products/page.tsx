"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { getFarmerProducts, createProduct, updateProduct, deleteProduct } from "@/lib/api/products";
import { Plus, Search, Edit2, Trash2, X, ImagePlus, Package } from "lucide-react";
import { toast } from "react-toastify";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  unit: string;
  status: string;
}

interface FormState {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  unit: string;
  image: File | null;
  imagePreview: string | null;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const CATEGORIES = ["Vegetables", "Fruits", "Grains", "Dairy", "Organic Certified", "Other"];
const UNITS = ["kg", "g", "lb", "piece", "bunch", "dozen", "liter", "ml"];

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "Vegetables",
  unit: "kg",
  image: null,
  imagePreview: null,
};

// ── Status Badge ───────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  available: { label: "Available", cls: "bg-green-100 text-green-700" },
  out_of_stock: { label: "Out of Stock", cls: "bg-red-100 text-red-700" },
  "out of stock": { label: "Out of Stock", cls: "bg-red-100 text-red-700" },
  disabled: { label: "Disabled", cls: "bg-gray-100 text-gray-600" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status?.toLowerCase()] || { label: status, cls: "bg-gray-100 text-gray-600" };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ── Product Card ───────────────────────────────────────────────────────────────
function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product;
  onEdit: (p: Product) => void;
  onDelete: (p: Product) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Image */}
      <div className="relative h-44 bg-gradient-to-br from-green-50 to-emerald-100 overflow-hidden">
        {product.image ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8088'}${product.image}`}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <Package className="w-10 h-10 text-emerald-300" />
            <span className="text-xs text-emerald-400 font-medium">No Image</span>
          </div>
        )}
        {/* Category badge */}
        <span className="absolute top-2 left-2 bg-[#1a4731]/80 backdrop-blur-sm text-white text-xs font-semibold px-2 py-0.5 rounded-md capitalize">
          {product.category}
        </span>
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={product.status || "available"} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base mb-1 truncate">{product.name}</h3>
        <p className="text-[#1a4731] font-semibold text-sm">
          Rs {product.price}/{product.unit}
        </p>
        <p className="text-gray-400 text-xs mt-0.5">
          Stock: <span className="text-gray-600 font-medium">{product.stock} {product.unit}</span>
        </p>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => onEdit(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#1a4731] text-[#1a4731] text-sm font-medium hover:bg-[#1a4731] hover:text-white transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={() => onDelete(product)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Product Modal ──────────────────────────────────────────────────────────────
function ProductModal({
  open,
  onClose,
  editingProduct,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        description: editingProduct.description || "",
        price: editingProduct.price.toString(),
        stock: editingProduct.stock.toString(),
        category: editingProduct.category,
        unit: editingProduct.unit,
        image: null,
        imagePreview: editingProduct.image
          ? `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8089'}${editingProduct.image}`
          : null,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, editingProduct]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      image: file,
      imagePreview: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("description", form.description);
      data.append("price", form.price);
      data.append("stock", form.stock);
      data.append("category", form.category);
      data.append("unit", form.unit);
      if (form.image) data.append("image", form.image);

      if (editingProduct) {
        await updateProduct(editingProduct._id, data);
        toast.success("Product updated successfully!");
      } else {
        await createProduct(data);
        toast.success("Product created successfully!");
      }
      onSaved();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-bold text-gray-900">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product Image
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative cursor-pointer group border-2 border-dashed border-gray-200 rounded-xl overflow-hidden h-40 flex items-center justify-center hover:border-[#1a4731] transition-colors"
            >
              {form.imagePreview ? (
                <img
                  src={form.imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400 group-hover:text-[#1a4731] transition-colors">
                  <ImagePlus className="w-8 h-8" />
                  <span className="text-xs font-medium">Click to upload image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs font-semibold bg-black/50 px-3 py-1 rounded-full">
                  Change Image
                </span>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Product Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Fresh Tomatoes"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 focus:border-[#1a4731] transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Describe your product..."
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 focus:border-[#1a4731] transition-colors resize-none"
            />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Price (Rs) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 focus:border-[#1a4731] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Stock Qty <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 focus:border-[#1a4731] transition-colors"
              />
            </div>
          </div>

          {/* Category + Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 focus:border-[#1a4731] transition-colors bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Unit <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 focus:border-[#1a4731] transition-colors bg-white"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 bg-[#1a4731] hover:bg-[#155628] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                editingProduct ? "Save Changes" : "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Dialog ──────────────────────────────────────────────────────────────
function DeleteDialog({
  product,
  onConfirm,
  onCancel,
  deleting,
}: {
  product: Product | null;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Product</h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Are you sure you want to delete{" "}
          <span className="font-semibold text-gray-800">{product.name}</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-gray-200 rounded-lg text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ProductsPage() {
  const { isAuthenticated, user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await getFarmerProducts();
      if (res?.success) {
        const d = res.data?.data || res.data || [];
        setProducts(Array.isArray(d) ? d : []);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "farmer") fetchProducts();
  }, [isAuthenticated, user]);

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProduct(deleteTarget._id);
      toast.success("Product deleted successfully!");
      setDeleteTarget(null);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  if (!isAuthenticated || user?.role !== "farmer") return null;

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "All" ||
      p.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchSearch && matchCategory;
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Product Listings</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {products.length} product{products.length !== 1 ? "s" : ""} listed
            </p>
          </div>
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-[#1a4731] hover:bg-[#155628] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 focus:border-[#1a4731] transition-colors"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a4731]/30 focus:border-[#1a4731] bg-white transition-colors"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-72 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 py-20 text-center">
            <Package className="w-14 h-14 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No products found</p>
            <p className="text-gray-400 text-sm mt-1">
              {search || categoryFilter !== "All"
                ? "Try adjusting your filters"
                : "Click \"Add Product\" to list your first product"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editingProduct={editingProduct}
        onSaved={fetchProducts}
      />
      <DeleteDialog
        product={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        deleting={deleting}
      />
    </div>
  );
}
