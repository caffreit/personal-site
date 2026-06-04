import { mortgageAffordabilityData } from "@/components/tools/mortgageAffordabilityData";

const columns = [
  "year",
  "housePrice",
  "annualWage",
  "priceToWage",
  "initialRatePct",
  "initialMonthlyPayment",
  "totalPayments25yr",
  "totalEarnings25yr",
  "lifetimeBurdenPct",
  "wageGrowthPct",
] as const;

function csvEscape(value: number) {
  return String(value);
}

export function GET() {
  const rows = [
    columns.join(","),
    ...mortgageAffordabilityData.map((row) =>
      columns.map((column) => csvEscape(row[column])).join(",")
    ),
  ];

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Disposition": 'attachment; filename="mortgage-data-table.csv"',
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
