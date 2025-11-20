'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Plus, Trash2, RefreshCw } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProductUrl, setNewProductUrl] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);

    try {
      await api.createProduct(newProductUrl);
      setNewProductUrl('');
      setShowAddForm(false);
      loadProducts();
    } catch (error: any) {
      alert(error.message || 'Failed to add product');
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await api.deleteProduct(id);
      loadProducts();
    } catch (error: any) {
      alert(error.message || 'Failed to delete product');
    }
  };

  const handleRefreshPrices = async (id: string) => {
    try {
      await api.refreshProductPrices(id);
      loadProducts();
    } catch (error: any) {
      alert(error.message || 'Failed to refresh prices');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
          <p className="text-muted-foreground">
            Manage your product catalog and price comparisons
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Add Product Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Product</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <Label htmlFor="productUrl">Product URL (Lazada or Shopee)</Label>
                <Input
                  id="productUrl"
                  type="url"
                  placeholder="https://www.lazada.co.th/products/..."
                  value={newProductUrl}
                  onChange={(e) => setNewProductUrl(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={adding}>
                  {adding ? 'Adding...' : 'Add Product'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => {
          const bestOffer = product.offers?.length > 0 ? product.offers[0] : null;
          const hasBothMarketplaces = product.offers?.length >= 2;

          return (
            <Card key={product.id}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="relative h-48 w-full bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold line-clamp-2">{product.title}</h3>
                    {bestOffer && (
                      <div className="mt-2 flex items-center gap-2">
                        <Badge>Best Price</Badge>
                        <span className="text-lg font-bold">
                          {formatCurrency(product.bestPrice, bestOffer.currency)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Offers */}
                  <div className="space-y-2">
                    {product.offers?.map((offer: any) => (
                      <div
                        key={offer.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div>
                          <p className="text-sm font-medium">{offer.marketplace}</p>
                          <p className="text-xs text-muted-foreground">{offer.storeName}</p>
                        </div>
                        <p className="font-semibold">
                          {formatCurrency(offer.price, offer.currency)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {hasBothMarketplaces && (
                    <div className="pt-2 border-t">
                      <p className="text-sm text-green-600 font-medium">
                        Save {formatCurrency(
                          product.offers[product.offers.length - 1].price - product.bestPrice
                        )} on {bestOffer.marketplace}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleRefreshPrices(product.id)}
                    >
                      <RefreshCw className="mr-2 h-3 w-3" />
                      Refresh
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No products yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add your first product to get started
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Package({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>;
}

