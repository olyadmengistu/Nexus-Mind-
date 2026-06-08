import React, { useState, useEffect, useCallback } from 'react';
import { User, Product, CartItem, Order } from '../types';
import { searchProducts, debounce } from '../lib/searchApi';

interface MarketplaceProps {
  user: User;
}

const Marketplace: React.FC<MarketplaceProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'cart' | 'orders' | 'sell'>('browse');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const categories = ['All', 'Electronics', 'Books', 'Clothing', 'Home & Garden', 'Services', 'Digital'];

  useEffect(() => {
    // Load sample products
    const sampleProducts: Product[] = [
      {
        id: '1',
        sellerId: 'user1',
        sellerName: 'John Doe',
        sellerAvatar: 'https://picsum.photos/seed/johndoe/100/100',
        title: 'Problem Solving Guide Book',
        description: 'Comprehensive guide to effective problem solving techniques.',
        price: 29.99,
        category: 'Books',
        images: ['https://picsum.photos/seed/product1/300/300'],
        condition: 'new',
        stock: 50,
        rating: 4.5,
        reviews: 128,
        timestamp: Date.now() - 86400000,
        location: 'New York, USA'
      },
      {
        id: '2',
        sellerId: 'user2',
        sellerName: 'Jane Smith',
        sellerAvatar: 'https://picsum.photos/seed/johndoe/100/100',
        title: 'Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation.',
        price: 149.99,
        category: 'Electronics',
        images: ['https://picsum.photos/seed/product1/300/300'],
        condition: 'new',
        stock: 30,
        rating: 4.8,
        reviews: 256,
        timestamp: Date.now() - 172800000,
        location: 'Los Angeles, USA'
      },
      {
        id: '3',
        sellerId: 'user3',
        sellerName: 'Mike Johnson',
        sellerAvatar: 'https://picsum.photos/seed/johndoe/100/100',
        title: 'Consulting Services',
        description: 'Professional consulting for business problem solving.',
        price: 99.99,
        category: 'Services',
        images: ['https://picsum.photos/seed/product1/300/300'],
        condition: 'new',
        stock: 100,
        rating: 4.9,
        reviews: 89,
        timestamp: Date.now() - 259200000,
        location: 'Remote'
      },
      {
        id: '4',
        sellerId: 'user4',
        sellerName: 'Sarah Williams',
        sellerAvatar: 'https://picsum.photos/seed/johndoe/100/100',
        title: 'Smart Home Hub',
        description: 'Control your entire home with this smart hub device.',
        price: 79.99,
        category: 'Electronics',
        images: ['https://picsum.photos/seed/product1/300/300'],
        condition: 'new',
        stock: 45,
        rating: 4.3,
        reviews: 167,
        timestamp: Date.now() - 345600000,
        location: 'Chicago, USA'
      },
      {
        id: '5',
        sellerId: 'user5',
        sellerName: 'David Brown',
        sellerAvatar: 'https://picsum.photos/seed/johndoe/100/100',
        title: 'Team Building Workshop',
        description: 'Interactive workshop for team building and collaboration.',
        price: 249.99,
        category: 'Services',
        images: ['https://picsum.photos/seed/product1/300/300'],
        condition: 'new',
        stock: 20,
        rating: 4.7,
        reviews: 45,
        timestamp: Date.now() - 432000000,
        location: 'Remote'
      },
      {
        id: '6',
        sellerId: 'user6',
        sellerName: 'Emily Davis',
        sellerAvatar: 'https://picsum.photos/seed/johndoe/100/100',
        title: 'Productivity Planner',
        description: 'Physical planner for daily productivity tracking.',
        price: 19.99,
        category: 'Books',
        images: ['https://picsum.photos/seed/product1/300/300'],
        condition: 'new',
        stock: 100,
        rating: 4.6,
        reviews: 234,
        timestamp: Date.now() - 518400000,
        location: 'Boston, USA'
      }
    ];

    setProducts(sampleProducts);

    // Load sample orders
    const sampleOrders: Order[] = [
      {
        id: 'order1',
        buyerId: user.id,
        items: [],
        total: 59.98,
        status: 'delivered',
        timestamp: Date.now() - 604800000,
        shippingAddress: '123 Main St, City, Country'
      }
    ];

    setOrders(sampleOrders);
  }, [user.id]);

  // Debounced search function for products
  const debouncedProductSearch = useCallback(
    debounce(async (query: string, category: string) => {
      if (query.trim() || category !== 'All') {
        setIsSearching(true);
        try {
          const response = await searchProducts({ 
            query, 
            category: category === 'All' ? undefined : category,
            limit: 50
          });
          setFilteredProducts(response.data);
        } catch (error) {
          console.error('Product search error:', error);
          setFilteredProducts([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setFilteredProducts(products);
      }
    }, 300),
    [products]
  );

  // Trigger search when search parameters change
  useEffect(() => {
    debouncedProductSearch(searchQuery, selectedCategory);
  }, [searchQuery, selectedCategory, debouncedProductSearch]);

  // Initialize filteredProducts with all products on mount
  useEffect(() => {
    setFilteredProducts(products);
  }, [products]);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  const handleCheckout = () => {
    const newOrder: Order = {
      id: `order${Date.now()}`,
      buyerId: user.id,
      items: cart,
      total: cartTotal,
      status: 'pending',
      timestamp: Date.now(),
      shippingAddress: '123 Main St, City, Country'
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setActiveTab('orders');
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <button
          onClick={() => setShowProductModal(true)}
          className="px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
        >
          <i className="fa-solid fa-plus mr-2"></i>Sell Item
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'browse' ? 'text-[#1877F2]' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="fa-solid fa-store mr-2"></i>Browse
          {activeTab === 'browse' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2]"></span>}
        </button>
        <button
          onClick={() => setActiveTab('cart')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'cart' ? 'text-[#1877F2]' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="fa-solid fa-shopping-cart mr-2"></i>Cart
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {cart.length}
            </span>
          )}
          {activeTab === 'cart' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2]"></span>}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'orders' ? 'text-[#1877F2]' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="fa-solid fa-box mr-2"></i>Orders
          {activeTab === 'orders' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2]"></span>}
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`px-4 py-2 font-medium transition-colors relative ${
            activeTab === 'sell' ? 'text-[#1877F2]' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <i className="fa-solid fa-tag mr-2"></i>Sell
          {activeTab === 'sell' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1877F2]"></span>}
        </button>
      </div>

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <div>
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1877F2]"
              />
              {isSearching && (
                <i className="fa-solid fa-spinner fa-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#1877F2] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isSearching ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                <i className="fa-solid fa-spinner fa-spin text-4xl mb-4"></i>
                <p>Searching products...</p>
              </div>
            ) : filteredProducts.length > 0 ? filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-200">
                  <img src={product.images[0]} className="w-full h-full object-cover" alt={product.title} />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 line-clamp-2">{product.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <img src={product.sellerAvatar} className="w-6 h-6 rounded-full" alt="" />
                    <span className="text-sm text-gray-500">{product.sellerName}</span>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-[#1877F2]">${product.price}</span>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <i className="fa-solid fa-star text-yellow-500"></i>
                      <span>{product.rating}</span>
                      <span>({product.reviews})</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span><i className="fa-solid fa-box mr-1"></i>{product.stock} in stock</span>
                    <span className="capitalize">{product.condition}</span>
                  </div>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-full px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
                  >
                    <i className="fa-solid fa-cart-plus mr-2"></i>Add to Cart
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <i className="fa-solid fa-search text-4xl mb-4"></i>
                <p>No products found. Try adjusting your search or filters.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cart Tab */}
      {activeTab === 'cart' && (
        <div>
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <i className="fa-solid fa-shopping-cart text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {cart.map(item => (
                  <div key={item.product.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
                    <img src={item.product.images[0]} className="w-24 h-24 object-cover rounded-lg" alt="" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{item.product.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.product.sellerName}</p>
                      <p className="text-lg font-bold text-[#1877F2]">${item.product.price}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-100 rounded-full hover:bg-gray-200"
                        >
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-100 rounded-full hover:bg-gray-200"
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        <i className="fa-solid fa-trash mr-1"></i>Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg shadow p-6 h-fit">
                <h3 className="text-lg font-bold mb-4">Order Summary</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>$5.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${(cartTotal + 5).toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
                >
                  <i className="fa-solid fa-credit-card mr-2"></i>Checkout
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <i className="fa-solid fa-box text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Order #{order.id}</h3>
                      <p className="text-sm text-gray-500">{new Date(order.timestamp).toLocaleString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-gray-600">{order.items.length} items</p>
                      <p className="text-sm text-gray-500">{order.shippingAddress}</p>
                    </div>
                    <p className="text-xl font-bold text-[#1877F2]">${order.total.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sell Tab */}
      {activeTab === 'sell' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">List an Item for Sale</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input type="text" className="w-full px-3 py-2 border rounded-lg" placeholder="Product title" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea className="w-full px-3 py-2 border rounded-lg" rows={4} placeholder="Describe your product" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price ($)</label>
                  <input type="number" className="w-full px-3 py-2 border rounded-lg" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input type="number" className="w-full px-3 py-2 border rounded-lg" placeholder="Quantity" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>Electronics</option>
                    <option>Books</option>
                    <option>Clothing</option>
                    <option>Home & Garden</option>
                    <option>Services</option>
                    <option>Digital</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Condition</label>
                  <select className="w-full px-3 py-2 border rounded-lg">
                    <option>new</option>
                    <option>used</option>
                    <option>refurbished</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Images</label>
                <input type="file" multiple accept="image/*" className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <button
                type="button"
                className="w-full px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
              >
                <i className="fa-solid fa-tag mr-2"></i>List Item
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sell Item Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Sell Item</h2>
              <button
                onClick={() => setShowProductModal(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <button
              onClick={() => {
                setShowProductModal(false);
                setActiveTab('sell');
              }}
              className="w-full px-4 py-3 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
            >
              Go to Sell Page
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
