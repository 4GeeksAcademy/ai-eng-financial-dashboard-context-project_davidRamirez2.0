import { useEffect, useState, type FormEvent } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { IncomeOutcomeChart } from "@/components/dashboard/income-outcome-chart";
import { ProfitPercentChart } from "@/components/dashboard/profit-percent-chart";
import { BusinessComparisonPage } from "@/components/dashboard/business-comparison-page";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MetricsAlert,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import { computeKPIs, computeMonthlyData } from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const DEFAULT_ALERT_THRESHOLD = "0.3";

interface MetricsDateRange {
  min_date: string;
  max_date: string;
}

async function fetchFinancialData(
  startDate = "",
  endDate = "",
): Promise<FinancialMovement[]> {
  const params = new URLSearchParams();
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);
  const query = params.toString();
  const response = await fetch(
    `${API_BASE_URL}/api/metrics${query ? `?${query}` : ""}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

async function fetchMetricsDateRange(): Promise<MetricsDateRange> {
  const response = await fetch(`${API_BASE_URL}/api/metrics/facets`);
  if (!response.ok) {
    throw new Error(`Failed to fetch metrics date range: ${response.status}`);
  }
  return response.json();
}

async function fetchOutcomeAlerts(
  threshold: number,
  startDate = "",
  endDate = "",
): Promise<MetricsAlert[]> {
  const params = new URLSearchParams({ threshold: String(threshold) });
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);
  const response = await fetch(
    `${API_BASE_URL}/api/metrics/alerts?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch outcome alerts: ${response.status}`);
  }
  return response.json();
}

function App() {
  const [activePage, setActivePage] = useState<"dashboard" | "comparison">(
    "dashboard",
  );
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [outcomeAlerts, setOutcomeAlerts] = useState<MetricsAlert[]>([]);
  const [availableDateRange, setAvailableDateRange] =
    useState<MetricsDateRange | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [alertThreshold, setAlertThreshold] = useState(DEFAULT_ALERT_THRESHOLD);
  const [loading, setLoading] = useState(true);
  const [alertsLoading, setAlertsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchFinancialData(),
      fetchMetricsDateRange(),
      fetchOutcomeAlerts(Number(DEFAULT_ALERT_THRESHOLD)),
    ])
      .then(([movements, dateRange, alerts]) => {
        setMetrics(computeKPIs(movements));
        setMonthlyData(computeMonthlyData(movements));
        setAvailableDateRange(dateRange);
        setOutcomeAlerts(alerts);
      })
      .catch(() => {
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
      })
      .finally(() => {
        setLoading(false);
        setAlertsLoading(false);
      });
  }, []);

  async function applyDateFilter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setAlertsLoading(true);
    setError(null);
    try {
      const [movements, alerts] = await Promise.all([
        fetchFinancialData(startDate, endDate),
        fetchOutcomeAlerts(Number(alertThreshold), startDate, endDate),
      ]);
      setMetrics(computeKPIs(movements));
      setMonthlyData(computeMonthlyData(movements));
      setOutcomeAlerts(alerts);
      setAppliedStartDate(startDate);
      setAppliedEndDate(endDate);
    } catch {
      setError(
        "No se pudo cargar la informacion financiera. Revisa la API de backend.",
      );
    } finally {
      setLoading(false);
      setAlertsLoading(false);
    }
  }

  async function applyAlertThreshold(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAlertsLoading(true);
    setError(null);
    try {
      const alerts = await fetchOutcomeAlerts(
        Number(alertThreshold),
        appliedStartDate,
        appliedEndDate,
      );
      setOutcomeAlerts(alerts);
    } catch {
      setError(
        "No se pudo cargar la informacion financiera. Revisa la API de backend.",
      );
    } finally {
      setAlertsLoading(false);
    }
  }

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-4 focus:py-2 focus:text-foreground"
      >
        Skip to dashboard content
      </a>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period="2024 - Full Year" />

          <nav
            aria-label="Dashboard pages"
            className="flex flex-wrap gap-2 border-b border-border pb-3"
          >
            <button
              type="button"
              aria-current={activePage === "dashboard" ? "page" : undefined}
              onClick={() => setActivePage("dashboard")}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                activePage === "dashboard"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Financial overview
            </button>
            <button
              type="button"
              aria-current={activePage === "comparison" ? "page" : undefined}
              onClick={() => setActivePage("comparison")}
              className={`rounded-md px-4 py-2 text-sm font-medium ${
                activePage === "comparison"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              B2B vs B2C
            </button>
          </nav>

          {activePage === "comparison" ? (
            <BusinessComparisonPage />
          ) : (
            <>
          <form
            id="dashboard-content"
            tabIndex={-1}
            onSubmit={applyDateFilter}
            className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-end"
          >
            <label className="flex flex-col gap-1 text-sm">
              <span>Start date</span>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span>End date</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-foreground"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              Apply
            </button>
            <p className="min-h-10 text-sm text-muted-foreground sm:ml-auto sm:pb-2 lg:min-h-7">
              {availableDateRange
                ? `Available range: ${availableDateRange.min_date} – ${availableDateRange.max_date}`
                : null}
            </p>
          </form>

          {error ? (
            <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
              {error}
            </div>
          ) : null}

          <section aria-label="Key performance indicators">
            <KPIRow metrics={metrics} loading={loading} />
          </section>

          <section
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <IncomeOutcomeChart data={monthlyData} loading={loading} />
            <ProfitPercentChart data={monthlyData} loading={loading} />
          </section>

          <section
            aria-label="Unexpected spending alerts"
            aria-busy={alertsLoading}
            className="rounded-lg border border-border p-4"
          >
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-base font-semibold">
                  Unexpected spending increases
                </h2>
                <p className="text-sm text-muted-foreground">
                  Periods where outcome exceeds the previous three-period average.
                </p>
              </div>
              <form
                onSubmit={applyAlertThreshold}
                className="flex items-end gap-3"
              >
                <label className="flex flex-col gap-1 text-sm">
                  <span>Alert threshold (ratio)</span>
                  <input
                    type="number"
                    min="0.01"
                    max="1"
                    step="0.01"
                    required
                    value={alertThreshold}
                    onChange={(event) => setAlertThreshold(event.target.value)}
                    className="w-32 rounded-md border border-input bg-background px-3 py-2 text-foreground"
                  />
                </label>
                <button
                  type="submit"
                  disabled={alertsLoading || loading}
                  className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Update alerts
                </button>
              </form>
            </div>

            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {error
                ? ""
                : alertsLoading
                  ? "Loading outcome alerts."
                  : outcomeAlerts.length === 0
                    ? "No outcome alerts for the current threshold and date range."
                    : `${outcomeAlerts.length} outcome alert${outcomeAlerts.length === 1 ? "" : "s"} loaded.`}
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-3 py-2">Period</th>
                    <th scope="col" className="px-3 py-2">Recorded outcome</th>
                    <th scope="col" className="px-3 py-2">Previous 3-period average</th>
                    <th scope="col" className="px-3 py-2">Percentage increase</th>
                  </tr>
                </thead>
                <tbody>
                  {alertsLoading && outcomeAlerts.length === 0 ? (
                    Array.from({ length: 3 }, (_, index) => (
                      <tr key={`loading-${index}`}>
                        <td colSpan={4} className="px-3 py-3">
                          <Skeleton className="h-5 w-full" />
                        </td>
                      </tr>
                    ))
                  ) : outcomeAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">
                        No spending anomalies detected for the current threshold and date range.
                      </td>
                    </tr>
                  ) : (
                    outcomeAlerts.map((alert) => (
                      <tr key={alert.period} className="border-b border-border/60 last:border-0">
                        <td className="px-3 py-3">{alert.period}</td>
                        <td className="px-3 py-3">
                          {formatAlertCurrency(alert.outcome_total)}
                        </td>
                        <td className="px-3 py-3">
                          {formatAlertCurrency(alert.baseline_average)}
                        </td>
                        <td className="px-3 py-3">
                          {(alert.increase_ratio * 100).toFixed(2)}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function formatAlertCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default App;
