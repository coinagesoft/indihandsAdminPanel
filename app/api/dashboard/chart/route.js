import { NextResponse } from "next/server";
import { db } from "../../../db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const view = searchParams.get("view") || "weekly";
    const month = parseInt(searchParams.get("month")) || new Date().getMonth();
    const year = parseInt(searchParams.get("year")) || new Date().getFullYear();

    let data = [];

    if (view === "weekly") {
      const [rows] = await db.query(`
        SELECT DAYOFWEEK(submitted_at) AS day, COUNT(*) AS count
        FROM rfqs
        WHERE submitted_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY day
      `);
      data = [1,2,3,4,5,6,7].map(d => {
        const item = rows.find(r => r.day === d);
        return item ? item.count : 0;
      });
    }

    if (view === "monthly") {
      const [rows] = await db.query(`
        SELECT FLOOR((DAY(submitted_at)-1)/7)+1 AS week, COUNT(*) AS count
        FROM rfqs
        WHERE MONTH(submitted_at) = ? AND YEAR(submitted_at)=?
        GROUP BY week
      `, [month + 1, year]);
      data = [1,2,3,4].map(w => {
        const item = rows.find(r => r.week === w);
        return item ? item.count : 0;
      });
    }

    if (view === "yearly") {
      const [rows] = await db.query(`
        SELECT MONTH(submitted_at) AS month, COUNT(*) AS count
        FROM rfqs
        WHERE YEAR(submitted_at) = ?
        GROUP BY month
      `, [year]);
      data = Array.from({length: 12}, (_, i) => {
        const item = rows.find(r => r.month === i+1);
        return item ? item.count : 0;
      });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
