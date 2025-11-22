'use client';

import { useEffect, useState } from 'react';

import { getBackendApiUrl } from '@/lib/api';

interface Product {
  id: string;
  name: string;
  price_cents: number;
  image_url?: string | null;
  description?: string | null;
  category?: string | null;
  allergens?: string | null;
  additives?: string | null;
  spice_level?: string | null;
  serving_size?: string | null;
  dietary_tags?: string | null;
  ingredients?: string | null;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value / 100);
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    unit_amount: '',
    currency: 'EUR',
    image_url: '',
    description: '',
    category: '',
    allergens: '',
    additives: '',
    spice_level: '',
    serving_size: '',
    dietary_tags: '',
    ingredients: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('restaurant_jwt_v1');
      const response = await fetch(getBackendApiUrl('/admin/products'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const message = await response.text();
        setError(message || 'Failed to load products');
        return;
      }

      const data = await response.json();
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      console.error(err);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData({
      id: '',
      name: '',
      unit_amount: '',
      currency: 'EUR',
      image_url: '',
      description: '',
      category: '',
      allergens: '',
      additives: '',
      spice_level: '',
      serving_size: '',
      dietary_tags: '',
      ingredients: '',
    });
    setEditingProduct(null);
    setShowAddForm(true);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      id: product.id,
      name: product.name,
      unit_amount: product.price_cents.toString(),
      currency: 'EUR',
      image_url: product.image_url || '',
      description: product.description || '',
      category: product.category || '',
      allergens: product.allergens || '',
      additives: product.additives || '',
      spice_level: product.spice_level || '',
      serving_size: product.serving_size || '',
      dietary_tags: product.dietary_tags || '',
      ingredients: product.ingredients || '',
    });
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm(`Are you sure you want to delete product "${productId}"?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('restaurant_jwt_v1');
      const response = await fetch(getBackendApiUrl(`/admin/products/${productId}`), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const message = await response.text();
        alert(`Failed to delete: ${message}`);
        return;
      }

      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Connection error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.id || !formData.name || !formData.unit_amount) {
      alert('Please fill in ID, name, and price');
      return;
    }

    try {
      const token = localStorage.getItem('restaurant_jwt_v1');
      const unitAmount = parseInt(formData.unit_amount, 10);
      
      if (isNaN(unitAmount) || unitAmount <= 0) {
        alert('Price must be a positive number (in cents)');
        return;
      }

      if (editingProduct) {
        // Update existing product
        const updatePayload: any = {};
        if (formData.name !== editingProduct.name) updatePayload.name = formData.name;
        if (unitAmount !== editingProduct.price_cents) updatePayload.unit_amount = unitAmount;
        if (formData.image_url !== (editingProduct.image_url || '')) updatePayload.image_url = formData.image_url || null;
        if (formData.description !== (editingProduct.description || '')) updatePayload.description = formData.description || null;
        if (formData.category !== (editingProduct.category || '')) updatePayload.category = formData.category || null;
        if (formData.allergens !== (editingProduct.allergens || '')) updatePayload.allergens = formData.allergens || null;
        if (formData.additives !== (editingProduct.additives || '')) updatePayload.additives = formData.additives || null;
        if (formData.spice_level !== (editingProduct.spice_level || '')) updatePayload.spice_level = formData.spice_level || null;
        if (formData.serving_size !== (editingProduct.serving_size || '')) updatePayload.serving_size = formData.serving_size || null;
        if (formData.dietary_tags !== (editingProduct.dietary_tags || '')) updatePayload.dietary_tags = formData.dietary_tags || null;
        if (formData.ingredients !== (editingProduct.ingredients || '')) updatePayload.ingredients = formData.ingredients || null;

        const response = await fetch(getBackendApiUrl(`/admin/products/${formData.id}`), {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload),
        });

        if (!response.ok) {
          const message = await response.text();
          alert(`Failed to update: ${message}`);
          return;
        }
      } else {
        // Add new product
        const response = await fetch(getBackendApiUrl('/admin/products'), {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: formData.id,
            name: formData.name,
            unit_amount: unitAmount,
            currency: formData.currency,
            image_url: formData.image_url || null,
            description: formData.description || null,
            category: formData.category || null,
            allergens: formData.allergens || null,
            additives: formData.additives || null,
            spice_level: formData.spice_level || null,
            serving_size: formData.serving_size || null,
            dietary_tags: formData.dietary_tags || null,
            ingredients: formData.ingredients || null,
          }),
        });

        if (!response.ok) {
          const message = await response.text();
          alert(`Failed to add: ${message}`);
          return;
        }
      }

      setShowAddForm(false);
      setEditingProduct(null);
      await fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Connection error');
    }
  };

  if (loading) return <div className="py-12 text-center text-gray-400">Loading products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-white">Products</h2>
        <button
          onClick={handleAdd}
          className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-yellow-400"
        >
          + Add Product
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-500 bg-red-500/10 px-4 py-3 text-red-400">{error}</div>}

      {showAddForm && (
        <div className="rounded-lg border border-gray-700 bg-gray-900 p-6">
          <h3 className="mb-4 text-lg font-semibold text-white">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Product ID *</label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                disabled={!!editingProduct}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none disabled:opacity-50"
                placeholder="e.g., pho-chay"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                placeholder="e.g., Pho Chay"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Price (cents) *</label>
                <input
                  type="number"
                  value={formData.unit_amount}
                  onChange={(e) => setFormData({ ...formData, unit_amount: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                  placeholder="2000"
                  min="1"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.unit_amount ? formatCurrency(parseInt(formData.unit_amount, 10) || 0) : ''}
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Currency</label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                  placeholder="EUR"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Image URL</label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                placeholder="/images/pho-chay.jpg"
              />
              <p className="mt-1 text-xs text-gray-500">Path to image in public folder</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                placeholder="Aromatische Reisnudelsuppe mit frischen Kräutern..."
                rows={3}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                placeholder="e.g., Suppen, Hauptgerichte, Vorspeisen"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Allergens</label>
                <input
                  type="text"
                  value={formData.allergens}
                  onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                  placeholder="a, c, d, e (comma-separated)"
                />
                <p className="mt-1 text-xs text-gray-500">Allergen codes: a-z</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Additives</label>
                <input
                  type="text"
                  value={formData.additives}
                  onChange={(e) => setFormData({ ...formData, additives: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                  placeholder="1, 2, 8 (comma-separated)"
                />
                <p className="mt-1 text-xs text-gray-500">Additive codes: 1-15</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Spice Level</label>
                <select
                  value={formData.spice_level}
                  onChange={(e) => setFormData({ ...formData, spice_level: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="">None</option>
                  <option value="nicht scharf">nicht scharf</option>
                  <option value="leicht scharf">leicht scharf</option>
                  <option value="mittel scharf">mittel scharf</option>
                  <option value="scharf">scharf</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-300">Serving Size</label>
                <select
                  value={formData.serving_size}
                  onChange={(e) => setFormData({ ...formData, serving_size: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                >
                  <option value="">None</option>
                  <option value="Vorspeise">Vorspeise</option>
                  <option value="Hauptspeise">Hauptspeise</option>
                  <option value="klein">klein</option>
                  <option value="große">große</option>
                  <option value="pro st">pro st</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Dietary Tags</label>
              <input
                type="text"
                value={formData.dietary_tags}
                onChange={(e) => setFormData({ ...formData, dietary_tags: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                placeholder="vegetarian, vegan (comma-separated)"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-300">Ingredients</label>
              <textarea
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                placeholder="Schweinehackfleisch, Morcheln, Karotten, Glasnudeln..."
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-yellow-400"
              >
                {editingProduct ? 'Update' : 'Add'} Product
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingProduct(null);
                }}
                className="rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-300 transition hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <div className="py-12 text-center text-gray-400">No products configured</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-900">
          <table className="w-full">
            <thead className="border-b border-gray-700 bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Image</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-yellow-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-800">
                  <td className="px-6 py-3 text-sm text-white">
                    <span className="font-mono text-xs uppercase tracking-widest text-gray-300">#{product.id}</span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-300">
                    <div className="font-medium">{product.name}</div>
                    {product.description && (
                      <div className="mt-1 text-xs text-gray-500">{product.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-300">{formatCurrency(product.price_cents)}</td>
                  <td className="px-6 py-3 text-sm text-gray-300">
                    {product.category || <span className="text-gray-500">—</span>}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-300">
                    {product.image_url ? (
                      <span className="font-mono text-xs text-gray-400">{product.image_url}</span>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="rounded px-2 py-1 text-xs font-medium text-yellow-500 transition hover:bg-yellow-500/10"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="rounded px-2 py-1 text-xs font-medium text-red-400 transition hover:bg-red-400/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
