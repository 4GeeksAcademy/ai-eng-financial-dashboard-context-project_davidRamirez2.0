import { useEffect, useState, type FormEvent } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type BusinessType,
  type Category,
  type FinancialMovement,
} from "@/lib/financial-types";
import { formatCurrency } from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

interface MetricsFacets {
  business_types: BusinessType[];
  categories: Category[];
  min_date: string;
  max_date: string;
}

interface TopCategory {
  category: Category;
  operation_type: "income";
  total_amount: number;
}

interface CategoryIncome {
  category: Category;
  totalIncome: number;
  percentage: number;
}

interface BusinessIncome {
  businessType: BusinessType;
  totalIncome: number;
  categories: CategoryIncome[];
}

interface ComparisonData {
  b2b: BusinessIncome;
  b2c: BusinessIncome;
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch business comparison data: ${response.status}`);
  }
  return response.json();
}

function buildDateParams(startDate: string, endDate: string): URLSearchParams {
  const params = new URLSearchParams();
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);
  return params;
}

async function fetchComparisonData(
  startDate: string,
  endDate: string,
  availableCategories: Category[],
): Promise<ComparisonData> {
  const dateParams = buildDateParams(startDate, endDate);
  const topParams = (businessType: BusinessType) => {
    const params = new URLSearchParams(dateParams);
    params.set("operation_type", "income");
    params.set("limit", "5");
    params.set("business_type", businessType);
    return params.toString();
  };
  const movementParams = new URLSearchParams(dateParams);
  movementParams.set("operation_type", "income");

  const [b2bTop, b2cTop, b2bMovements, b2cMovements] = await Promise.all([
    fetchJson<TopCategory[]>(
      `/api/metrics/categories/top?${topParams("B2B")}`,
    ),
    fetchJson<TopCategory[]>(
      `/api/metrics/categories/top?${topParams("B2C")}`,
    ),
    fetchJson<FinancialMovement[]>(
      `/api/metrics/b2b?${movementParams.toString()}`,
    ),
    fetchJson<FinancialMovement[]>(
      `/api/metrics/b2c?${movementParams.toString()}`,
    ),
  ]);

  const allowedCategories = new Set(availableCategories);
  const buildBusinessIncome = (
    businessType: BusinessType,
    topCategories: TopCategory[],
    movements: FinancialMovement[],
  ): BusinessIncome => {
    const totalIncome = movements
      .filter((movement) => movement.operation_type === "income")
      .reduce((total, movement) => total + movement.amount, 0);

    return {
      businessType,
      totalIncome,
      categories: topCategories
        .filter((item) => allowedCategories.has(item.category))
        .map((item) => ({
          category: item.category,
          totalIncome: item.total_amount,
          percentage:
            totalIncome > 0 ? (item.total_amount / totalIncome) * 100 : 0,
        })),
    };
  };

  return {
    b2b: buildBusinessIncome("B2B", b2bTop, b2bMovements),
    b2c: buildBusinessIncome("B2C", b2cTop, b2cMovements),
  };
}

function CategoryTable({ business }: { business: BusinessIncome }) {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <h3 className="leading-none font-semibold">
          {business.businessType} income
        </h3>
        <CardDescription>
          Top 5 income categories · Total income:{" "}
          {formatCurrency(business.totalIncome)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th scope="col" className="px-3 py-2">Category</th>
                <th scope="col" className="px-3 py-2 text-right">Income</th>
                <th scope="col" className="px-3 py-2 text-right">% of group</th>
              </tr>
            </thead>
            <tbody>
              {business.categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-6 text-center text-muted-foreground"
                  >
                    No income categories available for this date range.
                  </td>
                </tr>
              ) : (
                business.categories.map((item) => (
                  <tr
                    key={item.category}
                    className="border-b border-border/60 last:border-0"
                  >
                    <td className="px-3 py-3 capitalize">{item.category}</td>
                    <td className="px-3 py-3 text-right">
                      {formatCurrency(item.totalIncome)}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {item.percentage.toFixed(1)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryTableSkeleton() {
  return (
    <Card aria-hidden="true" className="border-border/60">
      <CardHeader>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-60 sm:h-5" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[minmax(0,1fr)_5rem_5.5rem] gap-3 border-b border-border px-3 py-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-14" />
        </div>
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="grid grid-cols-[minmax(0,1fr)_5rem_5.5rem] gap-3 border-b border-border/60 px-3 py-3 last:border-0"
          >
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function BusinessComparisonPage() {
  const [facets, setFacets] = useState<MetricsFacets | null>(null);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadInitialComparison() {
      try {
        const availableFacets =
          await fetchJson<MetricsFacets>("/api/metrics/facets");
        const initialComparison = await fetchComparisonData(
          "",
          "",
          availableFacets.categories,
        );
        if (active) {
          setFacets(availableFacets);
          setComparison(initialComparison);
        }
      } catch {
        if (active) {
          setError("Could not load the business comparison. Please check the backend API.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadInitialComparison();

    return () => {
      active = false;
    };
  }, []);

  async function applyDateFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!facets) return;

    setLoading(true);
    setError(null);
    try {
      const nextComparison = await fetchComparisonData(
        startDate,
        endDate,
        facets.categories,
      );
      setComparison(nextComparison);
      setAppliedStartDate(startDate);
      setAppliedEndDate(endDate);
    } catch {
      setError("Could not load the business comparison. Please check the backend API.");
    } finally {
      setLoading(false);
    }
  }

  const invalidDateRange = Boolean(startDate && endDate && startDate > endDate);
  const chartData = comparison
    ? [
        { businessType: "B2B", totalIncome: comparison.b2b.totalIncome },
        { businessType: "B2C", totalIncome: comparison.b2c.totalIncome },
      ]
    : [];

  return (
    <section id="dashboard-content" tabIndex={-1} aria-labelledby="business-comparison-title" className="flex flex-col gap-6">
      <div>
        <h2 id="business-comparison-title" className="text-2xl font-semibold">
          Business income comparison
        </h2>
        <p className="text-sm text-muted-foreground">
          Compare income performance across B2B and B2C.
        </p>
      </div>

      <form
        onSubmit={applyDateFilter}
        className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-end"
      >
        <label className="flex flex-col gap-1 text-sm">
          <span>Start date</span>
          <input
            type="date"
            min={facets?.min_date}
            max={facets?.max_date}
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span>End date</span>
          <input
            type="date"
            min={facets?.min_date}
            max={facets?.max_date}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
          />
        </label>
        <button
          type="submit"
          disabled={loading || invalidDateRange || !facets}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          Apply
        </button>
        <p className="min-h-10 text-sm text-muted-foreground sm:ml-auto sm:pb-2 lg:min-h-7">
          {facets
            ? `Available range: ${facets.min_date} – ${facets.max_date}`
            : null}
        </p>
      </form>

      {invalidDateRange ? (
        <p role="alert" className="text-sm text-destructive-foreground">
          Start date must be on or before end date.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {loading && !comparison ? (
          <>
            <p className="sr-only" role="status">Loading business income.</p>
            <CategoryTableSkeleton />
            <CategoryTableSkeleton />
          </>
        ) : comparison ? (
          <>
            <CategoryTable business={comparison.b2b} />
            <CategoryTable business={comparison.b2c} />
          </>
        ) : null}
      </div>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle>Total income by business line</CardTitle>
          <CardDescription>
            {appliedStartDate || appliedEndDate
              ? `Date range: ${appliedStartDate || "earliest"} – ${appliedEndDate || "latest"}`
              : "All available dates"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !comparison ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              Loading chart...
            </div>
          ) : !comparison ? (
            <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
              Income comparison is unavailable.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                title="Total income by business line"
                desc="Compare B2B and B2C income. Use the arrow keys to explore data points."
                margin={{ top: 8, right: 12, left: 8, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--color-border)"
                  strokeOpacity={0.6}
                  vertical={false}
                />
                <XAxis
                  dataKey="businessType"
                  tick={{ fontSize: 12, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value: number) => `$${(value / 1000).toFixed(0)}k`}
                  width={56}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    backgroundColor: "var(--color-card)",
                    borderColor: "var(--color-border)",
                    borderRadius: "0.5rem",
                  }}
                />
                <Bar dataKey="totalIncome" name="Total income" radius={[4, 4, 0, 0]}>
                  <Cell fill="var(--chart-income)" />
                  <Cell fill="var(--chart-profit)" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
