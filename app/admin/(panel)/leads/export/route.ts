import { isAdmin } from "@/lib/admin-auth";
import { leadsStore } from "@/lib/leads";

// The requests as a CSV file that opens in Excel (UTF-8 with BOM so Arabic shows right).
export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const show = new URL(req.url).searchParams.get("show");
  const all = await leadsStore.read();
  const leads = show === "new" || show === "done" ? all.filter((l) => l.status === show) : all;

  const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const rows = [
    ["التاريخ", "الاسم", "الشركة", "الموبايل", "الإيميل", "القسم", "القطع والكميات", "عدد الملفات", "الحالة"],
    ...leads.map((l) => [
      new Date(l.createdAt).toLocaleString("en-GB", { timeZone: "Africa/Cairo" }),
      l.name,
      l.company,
      // A leading tab keeps Excel from turning the number into 1.0E+10 or dropping the 0.
      `\t${l.phone}`,
      l.email,
      l.category,
      l.details,
      String(l.photos.length),
      l.status === "new" ? "جديد" : "اتردّ عليه",
    ]),
  ];
  const csv = "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
  const day = new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Cairo" });
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="mackine-requests-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
