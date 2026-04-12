import { db } from "../../../db";


// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { products } = body;

//     /* ================= VALIDATION ================= */
//     if (!Array.isArray(products) || products.length === 0) {
//       return Response.json(
//         { message: "Products array required" },
//         { status: 400 }
//       );
//     }

//     /* ================= MAP DATA ================= */
//     const rows = products.map((p) => ({
//       product_name: p.productName?.trim() || "",
//       sku: p.sku?.trim() || "",
//       barcode: p.barcode?.trim() || null,
//       hsn: p.hsn?.trim() || null,
//       size: p.size?.trim() || null,         
//       weight: p.weight?.trim() || null,    
//       description: p.description?.trim() || null,
//       stock_qty: Number(p.stockQty ?? 0),
//       base_price: Number(p.basePrice ?? 0),
//       status: p.status?.trim() || "Available",
//       cgst_rate: Number(p.cgst ?? 0),
//       sgst_rate: Number(p.sgst ?? 0),
//       igst_rate: Number(p.igst ?? 0),
//     }));

//     console.log("📦 Import rows:", rows);

//     /* ================= ROW-LEVEL VALIDATION ================= */
//   rows.forEach((r, i) => {
//   if (!r.product_name || isNaN(r.base_price)) {
//     throw new Error(
//       `Row ${i + 2}: Product Name, Category and Base Price are required`
//     );
//   }
// });


//     /* ================= PREPARE SQL VALUES ================= */
//     const values = rows.map((r) => [
//       r.product_name,
//       r.sku,
//       r.barcode,
//       r.hsn,
//       r.size,         
//       r.weight,      
//       r.description,
//       r.stock_qty,
//       r.base_price,
//       r.status,
//       r.cgst_rate,
//       r.sgst_rate,
//       r.igst_rate,
//     ]);

//     /* ================= INSERT ================= */
//     await db.query(
//       `
//       INSERT INTO products
//       (
//         product_name,
//         sku,
//         barcode,
//         hsn,
//         size,
//         weight,
//         description,
//         stock_qty,
//         base_price,
//         status,
//         cgst_rate,
//         sgst_rate,
//         igst_rate
//       )
//       VALUES ?
//       `,
//       [values]
//     );

//     return Response.json(
//       { message: `✅ ${rows.length} products imported successfully` },
//       { status: 201 }
//     );
//   } catch (err) {
//     console.error("❌ POST /api/products/bulk-import error:", err);
//     return Response.json(
//       { message: "Server error", error: err.message },
//       { status: 500 }
//     );
//   }
// }

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { products } = body;

//     if (!Array.isArray(products) || products.length === 0) {
//       return Response.json(
//         { message: "Products required" },
//         { status: 400 }
//       );
//     }

//     for (const p of products) {
//       const id = Number(p.id);
//       if (!id) continue;

//       const fields = [];
//       const values = [];

//       // 🔥 COMMON HELPER
//       const addField = (column, value) => {
//         if (
//           value !== undefined &&
//           value !== null &&
//           value.toString().trim() !== ""
//         ) {
//           fields.push(`${column} = ?`);
//           values.push(value);
//         }
//       };

//       // ✅ ALL FIELDS COVERED
//       addField("product_name", p.productName?.trim());
//       addField("sku", p.sku?.trim());
//       addField("barcode", p.barcode?.trim());
//       addField("hsn", p.hsn?.trim());
//       addField("size", p.size?.trim());
//       addField("weight", p.weight?.trim());
//       addField("description", p.description?.trim());
//       addField("status", p.status?.trim());

//       if (p.stockQty !== undefined && p.stockQty !== "") {
//         fields.push("stock_qty = ?");
//         values.push(Number(p.stockQty));
//       }

//       if (p.basePrice !== undefined && p.basePrice !== "") {
//         fields.push("base_price = ?");
//         values.push(Number(p.basePrice));
//       }

//       if (p.cgst !== undefined && p.cgst !== "") {
//         fields.push("cgst_rate = ?");
//         values.push(Number(p.cgst));
//       }

//       if (p.sgst !== undefined && p.sgst !== "") {
//         fields.push("sgst_rate = ?");
//         values.push(Number(p.sgst));
//       }

//       if (p.igst !== undefined && p.igst !== "") {
//         fields.push("igst_rate = ?");
//         values.push(Number(p.igst));
//       }

//       // 👉 nothing to update → skip
//       if (fields.length === 0) continue;

//       values.push(id);

//       await db.query(
//         `
//         UPDATE products
//         SET ${fields.join(", ")}
//         WHERE id = ?
//         `,
//         values
//       );
//     }

//     return Response.json(
//       { message: "✅ Products updated successfully (partial safe update)" },
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error("❌ Import error:", err);
//     return Response.json(
//       { message: "Server error", error: err.message },
//       { status: 500 }
//     );
//   }
// }


export async function POST(req) {
  try {
    const body = await req.json();
    const { products } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return Response.json(
        { message: "Products required" },
        { status: 400 }
      );
    }

    // 🔥 helper → normalize keys (handles Excel column mismatch)
    const getVal = (obj, keys) => {
      const normalized = {};

      Object.keys(obj).forEach((k) => {
        normalized[k.trim().toLowerCase()] = obj[k];
      });

      for (const key of keys) {
        const val = normalized[key.toLowerCase()];
        if (val !== undefined) return val;
      }

      return null;
    };


    
    // 🔥 number parser (safe)
    const parseNumber = (val) => {
      if (val === undefined || val === null) return 0;
      const num = Number(val);
      return isNaN(num) ? 0 : num;
    };

    
    
    
    for (const p of products) {
 const stockVal = parseNumber(getVal(p, ["stockQty", "stock_qty"])); // ✅ MOVE HERE

  const rawId = getVal(p, ["id"]);
  const id = rawId ? Number(rawId) : null;

      const fields = [];
      const values = [];

      // 🔥 COMMON HELPER
      const addField = (column, value) => {
        if (
          value !== undefined &&
          value !== null &&
          value.toString().trim() !== ""
        ) {
          fields.push(`${column} = ?`);
          values.push(value);
        }
      };

      // ================= COMMON FIELD MAPPING =================

      addField("product_name", getVal(p, ["productName", "product_name"]));
      addField("sku", getVal(p, ["sku"]));
      addField("barcode", getVal(p, ["barcode"]));
      addField("hsn", getVal(p, ["hsn"]));
      addField("size", getVal(p, ["size"]));
      addField("weight", getVal(p, ["weight"]));
      addField("description", getVal(p, ["description"]));

      const stock = getVal(p, ["stockQty", "stock_qty"]);
      if (stock !== null && stock !== "") {
        fields.push("stock_qty = ?");
        values.push(parseNumber(stock));
      }

   const price = getVal(p, ["basePrice", "base_price"]);

if (price !== null && price !== "") {
  fields.push("base_price = ?");
  values.push(price.toString().trim()); // ✅ string store
}

      // ================= 🔥 TAX (ALWAYS UPDATE) =================

      const cgst = parseNumber(getVal(p, ["cgst_rate", "cgst", "cgst %", "CGST"]));
      fields.push("cgst_rate = ?");
      values.push(cgst);

      const sgst = parseNumber(getVal(p, ["sgst_rate", "sgst", "sgst %", "SGST"]));
      fields.push("sgst_rate = ?");
      values.push(sgst);

      const igst = parseNumber(getVal(p, ["igst_rate", "igst", "igst %", "IGST"]));
      fields.push("igst_rate = ?");
      values.push(igst);

    // ================= UPDATE =================
if (id) {

  let finalStatus = "Out of Stock";
  if (stockVal > 0) finalStatus = "Available";

  fields.push("status = ?");
  values.push(finalStatus);

  if (fields.length > 0) {
    values.push(id);

    await db.query(
      `
      UPDATE products
      SET ${fields.join(", ")},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
      `,
      values
    );
  }
}

    // ================= INSERT =================
else {
  const cgst = parseNumber(getVal(p, ["cgst_rate", "cgst", "cgst %", "CGST"]));
  const sgst = parseNumber(getVal(p, ["sgst_rate", "sgst", "sgst %", "SGST"]));
  const igst = parseNumber(getVal(p, ["igst_rate", "igst", "igst %", "IGST"]));



  
let finalStatus = "Out of Stock";
if (stockVal > 0) finalStatus = "Available";

const data = {
  product_name: getVal(p, ["productName", "product_name"]) || "",
  sku: getVal(p, ["sku"]) || "",
  barcode: getVal(p, ["barcode"]) || null,
  hsn: getVal(p, ["hsn"]) || null,
  size: getVal(p, ["size"]) || null,
  weight: getVal(p, ["weight"]) || null,
  description: getVal(p, ["description"]) || null,
  stock_qty: parseNumber(getVal(p, ["stockQty", "stock_qty"])),
  base_price: (getVal(p, ["basePrice", "base_price"]) || "").toString().trim(),
  status: finalStatus, // ✅ NOW CORRECT
  cgst_rate: cgst,
  sgst_rate: sgst,
  igst_rate: igst,
};

  // ✅ validation (optional for now)
  if (!data.product_name) continue;

  await db.query(
    `
    INSERT INTO products
    (
      product_name,
      sku,
      barcode,
      hsn,
      size,
      weight,
      description,
      stock_qty,
      base_price,
      status,
      cgst_rate,
      sgst_rate,
      igst_rate
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      data.product_name,
      data.sku,
      data.barcode,
      data.hsn,
      data.size,
      data.weight,
      data.description,
      data.stock_qty,
      data.base_price,
      data.status,
      data.cgst_rate,
      data.sgst_rate,
      data.igst_rate,
    ]
  );
}
    }

    return Response.json(
      { message: "✅ Products imported (update + insert done)" },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Import error:", err);
    return Response.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}


