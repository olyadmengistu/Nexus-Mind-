import React from 'react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onClick }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square bg-gray-200">
        <img 
          src={product.images[0]} 
          className="w-full h-full object-cover cursor-pointer" 
          alt={product.title}
          onClick={onClick}
        />
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-1 line-clamp-2 cursor-pointer hover:text-[#1877F2]" onClick={onClick}>
          {product.title}
        </h3>
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
          onClick={onAddToCart}
          className="w-full px-4 py-2 bg-[#1877F2] text-white rounded-lg hover:bg-[#166FE5] transition-colors"
        >
          <i className="fa-solid fa-cart-plus mr-2"></i>Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
