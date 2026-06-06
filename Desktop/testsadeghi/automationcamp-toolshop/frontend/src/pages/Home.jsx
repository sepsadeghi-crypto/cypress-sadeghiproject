import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import client from '../api/client';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 9;

function getCategoryIdsWithDescendants(categoryId, categories) {
  const ids = new Set([categoryId]);
  const queue = [categoryId];
  while (queue.length) {
    const parentId = queue.shift();
    categories
      .filter(c => c.parent_id === parentId)
      .forEach(c => {
        ids.add(c.id);
        queue.push(c.id);
      });
  }
  return ids;
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const q = searchParams.get('q') || '';
  const category_id = searchParams.get('category_id') || '';
  const brand_id = searchParams.get('brand_id') || '';
  const is_rental = searchParams.get('is_rental') || '';
  const min_price = searchParams.get('min_price') || '';
  const max_price = searchParams.get('max_price') || '';
  const _sort = searchParams.get('_sort') || 'name';
  const _order = searchParams.get('_order') || 'asc';
  const _page = parseInt(searchParams.get('_page') || '1');

  useEffect(() => {
    client.get('/brands').then(r => setBrands(r.data)).catch(() => {});
    client.get('/categories').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  const categoryFilterIds = useMemo(() => {
    if (!category_id || categories.length === 0) return null;
    return getCategoryIdsWithDescendants(category_id, categories);
  }, [category_id, categories]);

  const fetchProducts = useCallback(async () => {
    if (category_id && categories.length === 0) return;

    setLoading(true);
    try {
      const params = { _sort, _order };
      if (q) params.q = q;
      if (brand_id) params.brand_id = brand_id;
      if (is_rental) params.is_rental = is_rental;
      if (min_price) params.min_price = min_price;
      if (max_price) params.max_price = max_price;

      const needsClientCategoryFilter =
        categoryFilterIds && categoryFilterIds.size > 1;

      if (needsClientCategoryFilter) {
        const { data } = await client.get('/products', {
          params: { ...params, _page: 1, _limit: 500 },
        });
        const filtered = data.data.filter(p => categoryFilterIds.has(p.category_id));
        const total = filtered.length;
        const start = (_page - 1) * PAGE_SIZE;
        setProducts(filtered.slice(start, start + PAGE_SIZE));
        setTotal(total);
        setLastPage(Math.max(1, Math.ceil(total / PAGE_SIZE)));
      } else {
        if (category_id) params.category_id = category_id;
        const { data } = await client.get('/products', {
          params: { ...params, _page, _limit: PAGE_SIZE },
        });
        setProducts(data.data);
        setTotal(data.total);
        setLastPage(data.last_page);
      }
    } catch {
      setProducts([]);
      setTotal(0);
      setLastPage(1);
    } finally {
      setLoading(false);
    }
  }, [q, category_id, brand_id, is_rental, min_price, max_price, _sort, _order, _page, categories.length, categoryFilterIds]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('_page');
    setSearchParams(next);
  };

  const clearFilters = () => setSearchParams({});

  const activeCategory = categories.find(c => c.id === category_id);
  const pageTitle = q ? `Search: "${q}"` : activeCategory ? activeCategory.name : is_rental === 'true' ? 'Rentals' : 'All Products';

  const topCategories = categories.filter(c => !c.parent_id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" data-id="page-home">
      <div className="flex gap-8">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-64 flex-shrink-0" data-id="filters-sidebar">
          <div className="card p-4 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900" data-id="filters-title">Filters</h2>
              {(q || category_id || brand_id || is_rental || min_price || max_price) && (
                <button onClick={clearFilters} className="text-xs text-primary-600 hover:text-primary-700" data-id="btn-clear-filters" data-testid="clear-filters">Clear all</button>
              )}
            </div>

            <div className="mb-6" data-id="filter-category">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Category</h3>
              <button onClick={() => updateParam('category_id', '')} className={`block w-full text-left text-sm px-2 py-1.5 rounded-md mb-1 ${!category_id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`} data-id="filter-category-all" data-testid="category-all">
                All Categories
              </button>
              {topCategories.map(cat => (
                <button key={cat.id} onClick={() => updateParam('category_id', cat.id)}
                  className={`block w-full text-left text-sm px-2 py-1.5 rounded-md mb-1 ${category_id === cat.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  data-id={`filter-category-${cat.slug}`}
                  data-testid={`category-${cat.slug}`}>
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="mb-6" data-id="filter-brand">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Brand</h3>
              <button onClick={() => updateParam('brand_id', '')} className={`block w-full text-left text-sm px-2 py-1.5 rounded-md mb-1 ${!brand_id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`} data-id="filter-brand-all" data-testid="brand-all">
                All Brands
              </button>
              {brands.map(brand => (
                <button key={brand.id} onClick={() => updateParam('brand_id', brand.id)}
                  className={`block w-full text-left text-sm px-2 py-1.5 rounded-md mb-1 ${brand_id === brand.id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                  data-id={`filter-brand-${brand.slug}`}
                  data-testid={`brand-${brand.slug}`}>
                  {brand.name}
                </button>
              ))}
            </div>

            <div className="mb-6" data-id="filter-price">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
              <div className="flex gap-2">
                <input type="number" placeholder="Min" value={min_price} onChange={(e) => updateParam('min_price', e.target.value)}
                  className="input-field text-xs" data-id="input-min-price" data-testid="min-price" />
                <input type="number" placeholder="Max" value={max_price} onChange={(e) => updateParam('max_price', e.target.value)}
                  className="input-field text-xs" data-id="input-max-price" data-testid="max-price" />
              </div>
            </div>

            <div data-id="filter-rental">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={is_rental === 'true'} onChange={(e) => updateParam('is_rental', e.target.checked ? 'true' : '')}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" data-id="checkbox-rental" data-testid="rental-filter" />
                <span className="text-sm text-gray-600">Rentals only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0" data-id="products-main">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900" data-id="page-title" data-testid="page-title">{pageTitle}</h1>
              {!loading && <p className="text-sm text-gray-500 mt-0.5" data-id="product-count">{total} {total === 1 ? 'product' : 'products'} found</p>}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 hidden sm:block">Sort by:</label>
              <select
                value={`${_sort}-${_order}`}
                onChange={(e) => {
                  const [sort, order] = e.target.value.split('-');
                  const next = new URLSearchParams(searchParams);
                  next.set('_sort', sort);
                  next.set('_order', order);
                  next.delete('_page');
                  setSearchParams(next);
                }}
                className="input-field text-sm w-auto"
                data-id="select-sort"
                data-testid="sort-select"
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low-High</option>
                <option value="price-desc">Price High-Low</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" data-id="products-skeleton">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="card overflow-hidden animate-pulse">
                  <div className="bg-gray-200 aspect-[4/3]" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
                    <div className="h-6 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16" data-id="empty-products">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">No products found</h3>
              <p className="mt-1 text-gray-500">Try adjusting your filters or search terms.</p>
              <button onClick={clearFilters} className="mt-4 btn-primary" data-id="btn-clear-filters-empty">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4" data-id="product-grid" data-testid="product-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination currentPage={_page} lastPage={lastPage} onPageChange={(page) => {
                const next = new URLSearchParams(searchParams);
                next.set('_page', String(page));
                setSearchParams(next);
              }} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
