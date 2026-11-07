import { Package, Plus, Minus, RefreshCw, ArrowRight, Calendar, Globe, Box, Tag } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useCompetitors } from '@/hooks/useCompetitors';
import { useProducts } from '@/hooks/useProducts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const Products = () => {
  const { competitors, isLoading: compLoading } = useCompetitors();
  const { data: products, isLoading: prodLoading } = useProducts();

  const isLoading = compLoading || prodLoading;
  
  // Group products by competitor
  const productsByCompetitor = (competitors || []).map(comp => {
    return {
      competitor: comp,
      products: (products || []).filter(p => p.competitor_id === comp.id)
    };
  });

  const totalProducts = products?.length || 0;

  return (
    <AppLayout>
      <Header
        title="Products & Offerings"
        subtitle="Catalog of all products and services extracted from your competitors"
      />
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="metric-card">
            <div className="flex items-center gap-2 text-primary mb-3">
              <Box className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">Total Scraped Products</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{totalProducts}</p>
            <p className="text-xs text-muted-foreground mt-1">Across all competitors</p>
          </div>
          <div className="metric-card">
            <div className="flex items-center gap-2 text-success mb-3">
              <Globe className="w-4 h-4" />
              <span className="text-sm text-muted-foreground">Competitors Tracked</span>
            </div>
            <p className="text-3xl font-bold text-foreground">{competitors?.length || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Active sources</p>
          </div>
        </div>

        {/* Product Catalog */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Loading products...</div>
          ) : productsByCompetitor.length === 0 ? (
            <div className="glass-card rounded-xl overflow-hidden py-12 text-center">
              <Globe className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Add competitors to begin extracting their products.</p>
            </div>
          ) : (
            productsByCompetitor.map(({ competitor, products: compProducts }) => (
              <div key={competitor.id} className="glass-card rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-secondary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center overflow-hidden">
                      <img
                        src={`https://s2.googleusercontent.com/s2/favicons?domain=${new URL(competitor.url).hostname}&sz=64`}
                        alt={competitor.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <h3 className="font-semibold text-foreground text-lg">{competitor.name}</h3>
                  </div>
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium">
                    {compProducts.length} Products Found
                  </span>
                </div>
                
                <div className="divide-y divide-border">
                  {compProducts.length === 0 ? (
                    <div className="py-8 text-center px-4">
                      <p className="text-muted-foreground italic">This competitor has no products or projects listed, or the crawler could not detect any Schema.org product data on their site.</p>
                    </div>
                  ) : (
                    compProducts.map((product) => (
                      <div key={product.id} className="px-5 py-5 hover:bg-secondary/50 transition-colors">
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="font-semibold text-foreground text-lg flex items-center gap-2">
                                  <Package className="w-4 h-4 text-primary" />
                                  {product.name}
                                </h4>
                                {product.description && (
                                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-3xl">
                                    {product.description}
                                  </p>
                                )}
                                
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {product.category && (
                                    <span className="text-xs px-2.5 py-1 rounded-md bg-secondary/80 border border-border text-foreground flex items-center gap-1">
                                      <Tag className="w-3 h-3" />
                                      {product.category}
                                    </span>
                                  )}
                                  {product.price && (
                                    <span className="text-xs px-2.5 py-1 rounded-md bg-success/10 text-success border border-success/20 font-medium">
                                      {product.currency} {product.price}
                                    </span>
                                  )}
                                </div>
                              </div>
                              
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="hover:bg-primary/10 hover:text-primary transition-colors border-border">
                                    Details
                                    <ArrowRight className="w-3 h-3 ml-2" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px]">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-3">
                                      <div>
                                        <span className="text-muted-foreground text-xs font-normal block">{competitor.name}</span>
                                        {product.name}
                                      </div>
                                    </DialogTitle>
                                    <DialogDescription className="pt-4">
                                      <div className="space-y-4">
                                        <div className="bg-secondary/30 p-4 rounded-lg border border-border">
                                          <h4 className="font-semibold text-sm mb-2 text-foreground">Description</h4>
                                          <p className="text-sm text-muted-foreground leading-relaxed">
                                            {product.description || "No description available."}
                                          </p>
                                        </div>

                                        {product.features && Array.isArray(product.features) && product.features.length > 0 && (
                                          <div>
                                            <h4 className="font-semibold text-sm mb-3 text-foreground">Features</h4>
                                            <ul className="space-y-2">
                                              {product.features.map((f: string, idx: number) => (
                                                <li key={idx} className="text-sm flex items-center gap-2 text-muted-foreground">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                  {f}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-border">
                                          <div>
                                            <span className="text-xs text-muted-foreground block mb-1">Price</span>
                                            <span className="text-sm font-medium text-foreground">
                                              {product.price ? `${product.currency || ''} ${product.price}` : 'Not listed'}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-xs text-muted-foreground block mb-1">Availability</span>
                                            <span className="text-sm font-medium text-foreground">
                                              {product.availability || 'Unknown'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </DialogDescription>
                                  </DialogHeader>
                                </DialogContent>
                              </Dialog>

                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Products;
