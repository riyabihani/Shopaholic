import React from "react";
import ProductCard from "./ProductCard";

const ChatMessage = ({ role, text, products }) => {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[86%] rounded-2xl border px-3 py-2 ${isUser ? 'bg-gray-900 text-white border-gray-900' : "bg-white text-gray-900 border-gray-200"}`}>
        <div className="text-sm whitespace-pre-wrap">{text}</div>

        {products.length > 0 && (
          <div className="mt-3 space-y-2">
            {products.map((p) => (
              <ProductCard key={p._id} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatMessage;