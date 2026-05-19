import { useState, useMemo } from "react";
import { organizations, getPipelineStage, getDocumentationLevel } from "@/data/organizations";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, FunnelChart, Funnel, LabelList
} from "recharts";
import { Users, Building2, PhoneCall, Video, MapPin, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";

const COLORS = ["#1d4ed8", "#16a34a", "#d97706", "#9333ea", "#dc2626", "#0891b2"];

const DEPT_COLORS: Record<string, string> = {
  "FRANCISCO MORAZAN": "#1d4ed8",
  "COMAYAGUA": "#16a34a",
  "CHOLUTECA": "#dc2626",
  "EL PARAISO": "#d97706",
  "OLANCHO": "#9333ea",
  "YORO": "#0891b2",
  "LA PAZ": "#059669",
  "CORTES": "#b45309",
  "COLON": "#7c3aed",
  "OCOTEPEQUE": "#db2777",
  "INTIBUCA": "#065f46",
  "LEMPIRA": "#92400e",
  "GRACIAS A DIOS": "#1e40af",
  "VALLE": "#15803d",
};

export default function Dashboard() {
  const [filterDept, setFilterDept] = useState<string>("Todos");

  const filtered = useMemo(() =>
    filterDept === "Todos"
      ? organizations
      : organizations.filter(o => o.departamento?.toUpperCase() === filterDept.toUpperCase()),
    [filterDept]
  );

  const total = filtered.length;
  const withSocios = filtered.filter(o => o.socios !== null);
  const totalSocios = withSocios.reduce((s, o) => s + (o.socios ?? 0), 0);
  const presented = filtered.filter(o => o.presented).length;
  const toPitch = filtered.filter(o => o.to_pitch && !o.presented).length;
  const contacted = filtered.filter(o => (o.video_llamada || o.visita_presencial) && !o.to_pitch && !o.presented).length;
  const noContact = filtered.filter(o => o.observaciones.includes("NO SE LOGRO")).length;
  const withPJ = filtered.filter(o => o.pj).length;

  const deptData = useMemo(() => {
    const map: Record<string, number> = {};
    organizations.forEach(o => {
      const dept = o.departamento ?? "Sin Departamento";
      map[dept] = (map[dept] ?? 0) + 1;
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }, []);

  const pipelineData = useMemo(() => {
    const stages = ["Presentado", "Por Pitch", "Contactado", "Prospecto", "Sin Contacto"];
    return stages.map(stage => ({
      name: stage,
      value: filtered.filter(o => getPipelineStage(o) === stage).length,
    })).filter(d => d.value > 0);
  }, [filtered]);

  const docData = useMemo(() => [
    { name: "PJ + RTN + CT", value: filtered.filter(o => o.pj && o.rtn && o.ct).length },
    { name: "PJ + RTN", value: filtered.filter(o => o.pj && o.rtn && !o.ct).length },
    { name: "Solo PJ", value: filtered.filter(o => o.pj && !o.rtn).length },
    { name: "Sin Docs", value: filtered.filter(o => !o.pj).length },
  ].filter(d => d.value > 0), [filtered]);

  const contactTypeData = useMemo(() => [
    { name: "Video Llamada", value: filtered.filter(o => o.video_llamada).length },
    { name: "Visita Presencial", value: filtered.filter(o => o.visita_presencial).length },
    { name: "Sin Contacto", value: filtered.filter(o => !o.video_llamada && !o.visita_presencial).length },
  ], [filtered]);

  const delegateData = useMemo(() => [
    { name: "Don Charlie", value: organizations.filter(o => o.delegado_charlie).length },
    { name: "Carlos", value: organizations.filter(o => o.delegado_carlos).length },
    { name: "Sin Asignar", value: organizations.filter(o => !o.delegado_charlie && !o.delegado_carlos).length },
  ], []);

  const depts = useMemo(() => {
    const set = new Set<string>();
    organizations.forEach(o => { if (o.departamento) set.add(o.departamento.toUpperCase()); });
    return ["Todos", ...Array.from(set).sort()];
  }, []);

  const funnelData = [
    { name: "Total Contactados", value: filtered.filter(o => o.video_llamada || o.visita_presencial).length, fill: "#1d4ed8" },
    { name: "To Pitch", value: filtered.filter(o => o.to_pitch).length, fill: "#0891b2" },
    { name: "Presentados", value: filtered.filter(o => o.presented).length, fill: "#16a34a" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Panel de Organizaciones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Pipeline de prospección — Honduras</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-muted-foreground">Departamento:</label>
          <select
            data-testid="select-departamento"
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={filterDept}
            onChange={e => setFilterDept(e.target.value)}
          >
            {depts.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={<Building2 className="w-5 h-5" />} label="Total Organizaciones" value={total} color="blue" data-testid="kpi-total" />
        <KPICard icon={<Users className="w-5 h-5" />} label="Total Socios" value={totalSocios.toLocaleString()} color="green" data-testid="kpi-socios" />
        <KPICard icon={<CheckCircle className="w-5 h-5" />} label="Presentadas" value={presented} color="emerald" badge={`${Math.round((presented / total) * 100)}%`} data-testid="kpi-presented" />
        <KPICard icon={<TrendingUp className="w-5 h-5" />} label="Por Pitchear" value={toPitch} color="amber" data-testid="kpi-pitch" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard icon={<Video className="w-5 h-5" />} label="Video Llamada" value={filtered.filter(o => o.video_llamada).length} color="purple" />
        <KPICard icon={<MapPin className="w-5 h-5" />} label="Visita Presencial" value={filtered.filter(o => o.visita_presencial).length} color="cyan" />
        <KPICard icon={<AlertCircle className="w-5 h-5" />} label="Sin Contacto" value={noContact} color="red" />
        <KPICard icon={<PhoneCall className="w-5 h-5" />} label="Con PJ" value={withPJ} color="indigo" badge={`${Math.round((withPJ / total) * 100)}%`} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Organizaciones por Departamento">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={130} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
              />
              <Bar dataKey="count" name="Orgs" radius={[0, 4, 4, 0]}>
                {deptData.map((entry, i) => (
                  <Cell key={entry.name} fill={DEPT_COLORS[entry.name] ?? COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Pipeline de Prospección">
          <ResponsiveContainer width="100%" height={280}>
            <FunnelChart>
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
              />
              <Funnel dataKey="value" data={funnelData} isAnimationActive>
                <LabelList position="right" fill="hsl(var(--foreground))" stroke="none" dataKey="name" style={{ fontSize: 12, fontWeight: 600 }} />
                <LabelList position="center" fill="#fff" stroke="none" dataKey="value" style={{ fontSize: 14, fontWeight: 700 }} />
              </Funnel>
            </FunnelChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChartCard title="Nivel de Documentación">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={docData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {docData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tipo de Contacto">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={contactTypeData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {contactTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Delegaciones">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={delegateData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {delegateData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Stage breakdown */}
      <ChartCard title="Estado del Pipeline por Etapa">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {[
            { label: "Presentado", count: presented, color: "bg-green-500" },
            { label: "Por Pitch", count: toPitch, color: "bg-blue-500" },
            { label: "Contactado", count: contacted, color: "bg-amber-500" },
            { label: "Prospecto", count: filtered.filter(o => getPipelineStage(o) === "Prospecto").length, color: "bg-purple-500" },
            { label: "Sin Contacto", count: noContact, color: "bg-red-500" },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center p-3 rounded-xl bg-muted/50 border border-border gap-1">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-2xl font-bold text-foreground">{item.count}</span>
              <span className="text-xs text-muted-foreground text-center">{item.label}</span>
              <span className="text-xs font-medium text-primary">{total > 0 ? Math.round((item.count / total) * 100) : 0}%</span>
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

function KPICard({ icon, label, value, color, badge, "data-testid": testId }: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  badge?: string;
  "data-testid"?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
    purple: "bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400",
    cyan: "bg-cyan-50 text-cyan-600 dark:bg-cyan-950 dark:text-cyan-400",
    red: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
    indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400",
  };
  return (
    <div className="bg-card border border-card-border rounded-xl p-4 flex items-start gap-3" data-testid={testId}>
      <div className={`p-2 rounded-lg shrink-0 ${colorMap[color]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground leading-tight">{label}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {badge && <span className="text-xs font-semibold text-primary">{badge}</span>}
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-card-border rounded-xl p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}
