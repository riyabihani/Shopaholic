const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

function extractFilters(message = "") {
  const m = message.toLowerCase();

  let gender = null;
  if (/\bwomen\b|\bwoman\b|\bgirl(s)?\b/.test(m)) gender = "Women";
  else if (/\bmen\b|\bman\b|\bguy(s)?\b/.test(m)) gender = "Men";

  const sizeMatch = m.match(/\b(xs|s|m|l|xl|xxl)\b/i);
  const size = sizeMatch ? sizeMatch[1].toUpperCase() : null;

  let maxPrice = null;
  const maxMatch =
    m.match(/\b(under|below|max)\s*\$?\s*(\d+(\.\d+)?)\b/) ||
    m.match(/\b\$?\s*(\d+(\.\d+)?)\s*(or less|and under)\b/);
  if (maxMatch) maxPrice = Number(maxMatch[2] || maxMatch[1]);

  const colorList = [
    "black",
    "white",
    "navy",
    "blue",
    "red",
    "gray",
    "grey",
    "olive",
    "beige",
    "brown",
    "pink",
    "charcoal",
    "burgundy",
    "khaki",
    "lavender",
    "yellow",
  ];
  const colorFound = colorList.find((c) => m.includes(c));
  const color = colorFound
    ? colorFound === "grey"
      ? "Gray"
      : colorFound[0].toUpperCase() + colorFound.slice(1)
    : null;

  let category = null;
  if (
    m.includes("shirt") ||
    m.includes("tee") ||
    m.includes("t-shirt") ||
    m.includes("blouse") ||
    m.includes("top")
  )
    category = "Top Wear";
  if (
    m.includes("pants") ||
    m.includes("jeans") ||
    m.includes("trousers") ||
    m.includes("joggers") ||
    m.includes("skirt") ||
    m.includes("shorts") ||
    m.includes("leggings")
  )
    category = "Bottom Wear";

  let collection = null;
  if (m.includes("formal") || m.includes("office") || m.includes("work"))
    collection = "Formal";
  else if (
    m.includes("vacation") ||
    m.includes("beach") ||
    m.includes("resort")
  )
    collection = "Vacation";
  else if (m.includes("streetwear")) collection = "Streetwear";
  else if (m.includes("casual")) collection = "Casual";

  return {
    gender,
    size,
    maxPrice,
    color,
    category,
    collection,
    mustBeInStock: true,
  };
}

function buildMongoFilter(filters) {
  const q = {};
  if (filters.mustBeInStock) q.countInStock = { $gt: 0 };
  if (filters.gender) q.gender = filters.gender;
  if (filters.category) q.category = filters.category;
  if (filters.size) q.sizes = { $in: [filters.size] };
  if (filters.color) q.colors = { $in: [filters.color] };
  if (filters.collection)
    q.collections = { $regex: filters.collection, $options: "i" };

  // Price: your schema has price + discountPrice. We'll accept either <= maxPrice.
  if (typeof filters.maxPrice === "number") {
    q.$or = [
      { discountPrice: { $lte: filters.maxPrice } },
      {
        $and: [
          { discountPrice: { $exists: false } },
          { price: { $lte: filters.maxPrice } },
        ],
      },
      {
        $and: [{ discountPrice: null }, { price: { $lte: filters.maxPrice } }],
      },
    ];
  }
  return q;
}

// POST /api/chat/recommend
router.post("/recommend", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message || typeof message !== "string") {
      return res.status(400).json({ message: "message is required" });
    }

    const filters = extractFilters(message);

    // 1) Ask Python for semantic candidates
    const pythonUrl = process.env.PYTHON_VECTOR_URL || "http://127.0.0.1:8001";
    const pyResp = await fetch(`${pythonUrl}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: message, top_k: 40, filters }),
    });

    if (!pyResp.ok) {
      const errText = await pyResp.text();
      return res
        .status(500)
        .json({ message: "Vector service error", detail: errText });
    }

    const pyData = await pyResp.json();
    const candidates = pyData.results || [];

    // 2) Keep order by semantic score
    const candidateIds = candidates.map((x) => x.productId);
    if (candidateIds.length === 0) {
      return res.json({ filtersApplied: filters, results: [] });
    }

    // 3) Apply strict MongoDB filter on the candidate set
    const mongoFilter = buildMongoFilter(filters);
    mongoFilter._id = { $in: candidateIds }; // candidates are string IDs

    // Fetch products
    const products = await Product.find(mongoFilter).lean();

    // 4) Re-order results to match semantic ranking
    const scoreMap = new Map(candidates.map((c) => [c.productId, c.score]));
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    const ordered = [];
    for (const c of candidates) {
      const p = productMap.get(c.productId);
      if (p) {
        ordered.push({
          ...p,
          semanticScore: c.score,
        });
      }
    }

    // 5) Return top N with quick “why”
    const top = ordered.slice(0, 6).map((p) => {
      const reasons = [];
      if (filters.category && p.category === filters.category)
        reasons.push(filters.category);
      if (filters.gender && p.gender === filters.gender)
        reasons.push(filters.gender);
      if (filters.color && (p.colors || []).includes(filters.color))
        reasons.push(`in ${filters.color}`);
      if (filters.size && (p.sizes || []).includes(filters.size))
        reasons.push(`size ${filters.size}`);
      if (filters.maxPrice && (p.discountPrice ?? p.price) <= filters.maxPrice)
        reasons.push(`under $${filters.maxPrice}`);

      return {
        ...p,
        why: reasons.length
          ? reasons.join(" • ")
          : "Matches your vibe & description",
      };
    });

    return res.json({ filtersApplied: filters, results: top });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Chat recommend error" });
  }
});

module.exports = router;
