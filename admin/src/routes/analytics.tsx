import { createFileRoute } from "@tanstack/react-router";
import { monthlyTrend, roleDistribution, recruiters } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/analytics")({
  component: AnalyticsPage,
});

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

const topHospitals = [...recruiters].sort((a, b) => b.jobsPosted - a.jobsPosted).slice(0, 5).map((r) => ({ name: r.hospital, jobs: r.jobsPosted }));

function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Platform insights and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Jobs vs Applications */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Jobs vs Applications Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
              <YAxis tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="jobsPosted" name="Jobs" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="applications" name="Applications" fill="var(--color-chart-2)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Role Distribution */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Role / Category Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={roleDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }: Record<string, any>) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {roleDistribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Hiring Hospitals */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Top Hiring Hospitals</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topHospitals} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" tick={{ fontSize: 12 }} stroke="var(--color-muted-foreground)" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid var(--color-border)", fontSize: 12 }} />
              <Bar dataKey="jobs" name="Jobs Posted" fill="var(--color-chart-1)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Most Active Candidates */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Most Active Candidates</h3>
          <div className="space-y-3">
            {[
              { name: "Dr. Priya Sharma", apps: 8, role: "Cardiology" },
              { name: "Dr. Deepak Joshi", apps: 6, role: "General Surgery" },
              { name: "Anjali Patel", apps: 5, role: "ICU Nurse" },
              { name: "Dr. Amit Verma", apps: 4, role: "Neurology" },
              { name: "Kavitha Nair", apps: 3, role: "Physiotherapy" },
            ].map((c, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-50 text-xs font-bold text-primary">{i + 1}</div>
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.role}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold">{c.apps} apps</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
