import { db } from "../../../db";

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const companyId = Number(id);

    if (!companyId) {
      return Response.json({ message: "Invalid companyId" }, { status: 400 });
    }

    const body = await req.json();
    const { companyName, shortName, charges } = body;

    // ✅ company name REQUIRED
    const name = companyName?.trim();
    if (!name) {
      return Response.json(
        { message: "Company name required" },
        { status: 400 }
      );
    }

    // ✅ short name REQUIRED
    const short = shortName?.trim().toUpperCase();
    if (!short) {
      return Response.json(
        { message: "Short name required" },
        { status: 400 }
      );
    }

    // ✅ duplicate short check (exclude current)
    const [[exists]] = await db.query(
      `SELECT id FROM companies 
       WHERE short_name = ? AND id <> ?`,
      [short, companyId]
    );

    if (exists) {
      return Response.json(
        { message: "Short name already exists" },
        { status: 400 }
      );
    }

    // ✅ update company
    await db.query(
      `UPDATE companies 
       SET company_name = ?, short_name = ?
       WHERE id = ?`,
      [name, short, companyId]
    );

    // ✅ replace charges
    await db.query(
      `DELETE FROM company_charges WHERE company_id = ?`,
      [companyId]
    );

    if (Array.isArray(charges) && charges.length > 0) {
      const values = charges.map((c) => [
        companyId,
        c.label,
        c.amount || 0,
        c.taxPercent || 0,
      ]);

      await db.query(
        `INSERT INTO company_charges 
         (company_id, label, amount, tax_percent)
         VALUES ?`,
        [values]
      );
    }

    return Response.json({ message: "Company updated" }, { status: 200 });
  } catch (err) {
    console.error("PATCH /api/companies/[id] error:", err);
    return Response.json({ message: "Server error" }, { status: 500 });
  }
}


/* ✅ delete company (with dependent cleanup) */
/* ✅ FULL SAFE COMPANY DELETE */
export async function DELETE(req, { params }) {
  const connection = await db.getConnection();

  try {
    const { id } = await params;
    const companyId = Number(id);

    if (!companyId) {
      return Response.json({ message: "Invalid companyId" }, { status: 400 });
    }

    await connection.beginTransaction();

    /* 1️⃣ branches */
    const [branches] = await connection.query(
      `SELECT id FROM company_branches WHERE company_id = ?`,
      [companyId]
    );
    const branchIds = branches.map(b => b.id);

    if (branchIds.length) {

      /* 2️⃣ invoices + items */
      const [invoices] = await connection.query(
        `SELECT id FROM invoices WHERE buyer_branch_id IN (?)`,
        [branchIds]
      );
      const invoiceIds = invoices.map(i => i.id);

      if (invoiceIds.length) {
        await connection.query(
          `DELETE FROM invoice_items WHERE invoice_id IN (?)`,
          [invoiceIds]
        );
        await connection.query(
          `DELETE FROM invoices WHERE id IN (?)`,
          [invoiceIds]
        );
      }

      /* 3️⃣ proposals + items + charges */
      const [proposals] = await connection.query(
        `SELECT id FROM proposals WHERE branch_id IN (?)`,
        [branchIds]
      );
      const proposalIds = proposals.map(p => p.id);

      if (proposalIds.length) {
        await connection.query(
          `DELETE FROM proposal_items WHERE proposal_id IN (?)`,
          [proposalIds]
        );
        await connection.query(
          `DELETE FROM proposal_charges WHERE proposal_id IN (?)`,
          [proposalIds]
        );
        await connection.query(
          `DELETE FROM proposals WHERE id IN (?)`,
          [proposalIds]
        );
      }

      /* 4️⃣ rfqs */
      await connection.query(
        `DELETE FROM rfqs WHERE branch_id IN (?)`,
        [branchIds]
      );

      /* 5️⃣ branches */
      await connection.query(
        `DELETE FROM company_branches WHERE company_id = ?`,
        [companyId]
      );
    }

    /* 6️⃣ company charges */
    await connection.query(
      `DELETE FROM company_charges WHERE company_id = ?`,
      [companyId]
    );

    /* 7️⃣ company */
    await connection.query(
      `DELETE FROM companies WHERE id = ?`,
      [companyId]
    );

    await connection.commit();

    return Response.json({ message: "Company deleted successfully" });

  } catch (err) {
    await connection.rollback();
    console.error("DELETE company error:", err);
    return Response.json({ message: err.message }, { status: 500 });
  } finally {
    connection.release();
  }
}

