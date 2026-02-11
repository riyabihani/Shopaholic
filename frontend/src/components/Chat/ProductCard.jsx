import React from "react";
import ProductDetails from "../Products/ProductDetails";
import { Link } from "react-router-dom";

function formatPrice(p) {
  const v = p.discountPrice ?? p.price;
  return typeof v === "number" ? `$${v.toFixed(2)}` : "";
};

const ProductCard = ({ p }) => {
  const img = p.images?.[0]?.url;

  return (
    <div className="flex gap-3 border border-gray-200 rounded-xl bg-white overflow-hidden">
      <div className="w-24 h-24 bg-gray-100 shrink-0">
        {img ? (
          <img src={img} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">No images</div>
        )}
      </div>

      <div className="p-3 flex-1">
        <div className="text-sm font-semibold text-gray-900 leading-snug">{p.name}</div>
        <div className="flwx items-baseline gap-2 mt-2">
          <div className="text-sm font-extrabold text-gray-900">{formatPrice(p)}</div>
          {p.discountPrice != null && typeof p.price === "number" && (
            <div className="text-sm text-gray-500 line-through">${p.price.toFixed(2)}</div>
          )}
        </div>

        {p.why && <div className="mt-2 text-xs text-gray-500">{p.why}</div>}

        <div className="mt-2 text-xs text-gray-500 space-y-0.5">
          {p.sizes?.length > 0 ? <div>Sizes: {p.sizes.join(", ")}</div> : null}
          {p.colors?.length > 0 ? <div>Colors: {p.colors.join(", ")}</div> : null}
        </div>

        <Link to={`/product/${p._id}`} className="nt-3 text-xs font-semibold text-gray-900 hover:underline">View Product</Link>

      </div>
    </div>
  )
}

export default ProductCard;