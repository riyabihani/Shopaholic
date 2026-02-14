import React, { useMemo, useRef, useState } from "react";
import ChatMessage from './ChatMessage'
import { useDispatch, useSelector } from "react-redux";
import { addUserMessage, fetchRecommendations } from "../../redux/slices/chatSlice";

// const MOCK_PRODUCTS = [
//   {
//     _id: "697147597a44fa2839e6618d",
//     name: "Classic Oxford Button-Down Shirt",
//     price: 59.99,
//     discountPrice: 34.99,
//     images: [{ url: "https://picsum.photos/seed/oxford/400/400", altText: "Oxford shirt" }],
//     sizes: ["S", "M", "L", "XL"],
//     colors: ["White", "Blue", "Navy"],
//     why: "Formal • Size M available • Under $60",
//   },
//   {
//     _id: "697147597a44fa2839e6618d",
//     name: "Relaxed Fit Chino Pants",
//     price: 64.99,
//     discountPrice: 49.99,
//     images: [{ url: "https://picsum.photos/seed/chino/400/400", altText: "Chinos" }],
//     sizes: ["M", "L", "XL"],
//     colors: ["Khaki", "Olive", "Black"],
//     why: "Comfy • Great for office • Multiple colors",
//   },
//   {
//     _id: "697147597a44fa2839e6618d",
//     name: "Minimal Crewneck Tee",
//     price: 24.99,
//     discountPrice: null,
//     images: [{ url: "https://picsum.photos/seed/tee/400/400", altText: "Tee" }],
//     sizes: ["XS", "S", "M", "L"],
//     colors: ["Black", "Gray", "White"],
//     why: "Casual staple • Soft cotton • Budget-friendly",
//   },
//   {
//     _id: "697147597a44fa2839e6618d",
//     name: "Vacation Linen Shirt",
//     price: 49.99,
//     discountPrice: 39.99,
//     images: [{ url: "https://picsum.photos/seed/linen/400/400", altText: "Linen shirt" }],
//     sizes: ["S", "M", "L"],
//     colors: ["Beige", "White", "Blue"],
//     why: "Breathable • Vacation vibe • Easy layering",
//   },
// ];

const ChatWidget = () => {
  const dispatch = useDispatch();
  const { messages, loading } = useSelector((state) => state.chat);
  const [input, setInput] = useState("");
  // const [isLoading, setIsLoading] = useState(false);
  // const [messages, setMessages] = useState(() => [{
  //   id: crypto.randomUUID(),
  //   role: 'assistant',
  //   text: "Tell me what you're looking for (budget, size, color, vibe) and I will recommend products.",
  //   products: []
  // }]);
  const listRef = useRef(null);
  
  const canSend = useMemo(() => {
    if (loading) return false;
    if (!input.trim()) return false;
    return true;
  }, [loading, input]);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });
  }

  const onSend = async (e, preset) => {
    e.preventDefault();
    const text = (preset ?? input).trim();
    if (!text || loading) return;
    setInput("");
    dispatch(addUserMessage(text))
    scrollToBottom();

    await dispatch(fetchRecommendations({message: text}));
   
    scrollToBottom();
  };

  const starterPrompts = [
    "formal black top under $60 size M",
    "something comfy for office",
    "vacation linen shirt",
  ];

  return (
    <div className="w-full m-4 h-[720px] rounded-2xl border border-gray-200 bg-white overflow-hidden flex flex-col shadow-sm">
      <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-center">
        <div className="text-md font-bold text-gray-900"> Shopaholic Recommendation Chatbot</div>
      </div>

      <div className="hidden sm:flex gap-2 mt-2 justify-center">
        {starterPrompts.map((p) => (
          <button key={p} onClick={(e) => onSend(e, p)} className="text-sm px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-100">{p}</button>
        ))}
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3">
        {messages.map((m) => (
          <ChatMessage key={m.id} role={m.role} text={m.text} products={m.products} />
        ))}
        {loading && <ChatMessage role='assistant' text='Thinking' products={[]} />}
      </div>

      {/* Input */}
      <form onSubmit={onSend} className="p-3 border-t border-gray-200 bg-white flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="Type here..."
          className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10" />

          <button type="submit" disabled={!canSend}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${canSend ? "bg-gray-900 hover:bg-black" : "bg-gray-400 cursor-not-allowed"}`}>Send</button>
      </form>
    </div>
  )
}

export default ChatWidget;