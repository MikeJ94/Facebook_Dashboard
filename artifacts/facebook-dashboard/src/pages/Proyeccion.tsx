import { useState, useMemo } from "react";
import { organizations, isEligibleForInvestee } from "@/data/organizations";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { TrendingUp, Target, CheckCircle, AlertTriangle, Info } from "lucide-react";

const COLORS = ["#1d4ed8", "#16a34a", "#d97706", "#9333ea", "#dc2626", "#0891b2"];

const CONVERSION_PRESETS = [
  { label: "Conservadora (15%)", value: 15 },
  { label: "Moderada (25%)", value: 25 },
  { label: "Optimista (40%)", value: 40 },
];

export default function Proyeccion() {
  const [conversionRate, setConversionRate] = useState(25);

  const elegibles = useMemo(() => organizations.filter(isEligibleForInvestee), []);
  const noElegibles = useMemo(() => organizations.filter(o => !isEligibleForInvestee(o)), []);

  const presentados = useMemo(() => elegibles.filter(o => o.presented), [elegibles]);
  const porPitch = useMemo(() => elegibles.filter(o => o.to_pitch && !o.presented), [elegibles]);
  const contactados = useMemo(() => elegibles.filter(o => (o.video_llamada || o.visita_presencial) && !o.to_pitch && !o.presented), [elegibles]);
  const prospectos = useMemo(() => elegibles.filter(o => !o.video_llamada && !o.visita_presencial && !o.to_pitch && !o.presented), [elegibles]);

  const proyectados = Math.round(elegibles.length * (conversionRate / 100));
  const proyectadosSocios = useMemo(() => {
    const withSocios = elegibles.filter(o => o.socios !== null);
    const avgSocios = withSocios.length > 0
      ? withSocios.reduce((s, o) => s + (o.socios ?? 0), 0) / withSocios.length
      : 0;
    return Math.round(proyectados * avgSocios);
  }, [elegibles, proyectados]);

  const blockingReasons = useMemo(() => {
    const sinPJ = noElegibles.filter(o => !o.pj).length;
    const sinRTN = noElegibles.filter(o => o.pj && !o.rtn).length;
    const sinCT = noElegibles.filter(o => o.pj && o.rtn && !o.ct).length;
    return [
      { label: "Sin PJ", count: sinPJ, color: "#dc2626" },
      { label: "Tiene PJ, sin RTN", count: sinRTN, color: "#d97706" },
      { label: "Tiene PJ+RTN, sin CT", count: sinCT, color: "#9333ea" },
    ].filter(d => d.count > 0);
  }, [noElegibles]);

  const byDeptData = useMemo(() => {
    const map: Record<string, number> = {};
    elegibles.forEach(o => {
      const dept = o.departamento ?? "Sin Depto";
      map[dept] = (map[dept] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  }, [elegibles]);

  const pipelineElegiblesData = [
    { name: "Presentados", value: presentados.length, fill: "#16a34a" },
    { name: "Por Pitch", value: porPitch.length, fill: "#1d4ed8" },
    { name: "Contactados", value: contactados.length, fill: "#d97706" },
    { name: "Prospectos", value: prospectos.length, fill: "#9333ea" },
  ].filter(d => d.value > 0);

  const overallPieData = [
    { name: "Elegibles (PJ+RTN+CT)", value: elegibles.length },
    { name: "No elegibles", value: noElegibles.length },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Proyección de Investees</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Basado en organizaciones con documentación completa (PJ + RTN + CT) y tasa de conversión de colocaciones 2025
        </p>
      </div>

      {/* Conversion rate control */}
      <div className="bg-card border border-card-border rounded-xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Tasa de Conversión 2025
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ajusta el porcentaje esperado de conversión de leads a investees
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CONVERSION_PRESETS.map(p => (
              <button
                key={p.value}
                data-testid={`btn-preset-${p.value}`}
                onClick={() => setConversionRate(p.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  conversionRate === p.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted text-muted-foreground border-border hover:border-primary hover:text-primary"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Tasa personalizada</span>
            <span className="text-2xl font-bold text-primary">{conversionRate}%</span>
          </div>
          <input
            data-testid="slider-conversion"
            type="range"
            min={5}
            max={80}
            step={1}
            value={conversionRate}
            onChange={e => setConversionRate(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>5% (muy conservadora)</span>
            <span>80% (muy optimista)</span>
          </div>
        </div>
      </div>

      {/* Projection KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ProjCard
          icon={<CheckCircle className="w-5 h-5" />}
          label="Elegibles Totales"
          value={elegibles.length}
          sub={`de ${organizations.length} organizaciones`}
          color="blue"
          testId="kpi-elegibles"
        />
        <ProjCard
          icon={<Target className="w-5 h-5" />}
          label="Investees Proyectados"
          value={proyectados}
          sub={`a tasa del ${conversionRate}%`}
          color="green"
          highlight
          testId="kpi-proyectados"
        />
        <ProjCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Socios Alcanzados"
          value={proyectadosSocios.toLocaleString()}
          sub="socios estimados"
          color="emerald"
          testId="kpi-socios"
        />
        <ProjCard
          icon={<AlertTriangle className="w-5 h-5" />}
          label="Ya Presentados"
          value={presentados.length}
          sub="con docs completos"
          color="amber"
          testId="kpi-presentados"
        />
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Criterio de elegibilidad:</strong> Solo se consideran organizaciones con <strong>Personería Jurídica (PJ)</strong>, <strong>RTN</strong> y <strong>CT</strong> completos — requerimiento mínimo para ser investee.
          De {organizations.length} prospectos totales, <strong>{elegibles.length} ({Math.round((elegibles.length / organizations.length) * 100)}%)</strong> cumplen este criterio.
          Aplicando la tasa de conversión del <strong>{conversionRate}%</strong>, se proyectan <strong>{proyectados} investees</strong>.
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-card-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Elegibles por Departamento</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={byDeptData} layout="vertical" margin={{ left: 8, right: 40, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={140} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                formatter={(val: number) => [val, "Elegibles"]}
              />
              <Bar dataKey="count" name="Elegibles" radius={[0, 4, 4, 0]}>
                {byDeptData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-card-border rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Distribución de Elegibilidad</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={overallPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {overallPieData.map((_, i) => <Cell key={i} fill={i === 0 ? "#16a34a" : "#e5e7eb"} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>

          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">¿Qué falta para ser elegibles?</p>
            <div className="space-y-2">
              {blockingReasons.map(r => (
                <div key={r.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                    <span className="text-sm text-foreground">{r.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 rounded-full bg-muted overflow-hidden w-24">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(r.count / noElegibles.length) * 100}%`, background: r.color }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground w-5 text-right">{r.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline of elegibles */}
      <div className="bg-card border border-card-border rounded-xl p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Pipeline de Elegibles (PJ+RTN+CT)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Presentados", count: presentados.length, color: "bg-green-500", pct: elegibles.length > 0 ? Math.round((presentados.length / elegibles.length) * 100) : 0 },
            { label: "Por Pitch", count: porPitch.length, color: "bg-blue-500", pct: elegibles.length > 0 ? Math.round((porPitch.length / elegibles.length) * 100) : 0 },
            { label: "Contactados", count: contactados.length, color: "bg-amber-500", pct: elegibles.length > 0 ? Math.round((contactados.length / elegibles.length) * 100) : 0 },
            { label: "Prospectos", count: prospectos.length, color: "bg-purple-500", pct: elegibles.length > 0 ? Math.round((prospectos.length / elegibles.length) * 100) : 0 },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center p-4 rounded-xl bg-muted/50 border border-border gap-1">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-2xl font-bold text-foreground">{item.count}</span>
              <span className="text-xs text-muted-foreground text-center">{item.label}</span>
              <span className="text-xs font-semibold text-primary">{item.pct}% del pool</span>
            </div>
          ))}
        </div>
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Proyección de conversión a investees ({conversionRate}%)</span>
            <span className="text-sm font-bold text-primary">{proyectados} / {elegibles.length}</span>
          </div>
          <div className="h-4 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${conversionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Eligible organizations table */}
      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Organizaciones Elegibles ({elegibles.length})</h3>
          <span className="text-xs text-muted-foreground">Todas tienen PJ + RTN + CT</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">#</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground min-w-48">Organización</th>
                <th className="px-4 py-2.5 text-left font-semibold text-muted-foreground">Departamento</th>
                <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground">Socios</th>
                <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground">Años</th>
                <th className="px-4 py-2.5 text-center font-semibold text-muted-foreground">Etapa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {elegibles.map((org, i) => {
                const stage = org.presented ? "Presentado" : org.to_pitch ? "Por Pitch" : (org.video_llamada || org.visita_presencial) ? "Contactado" : "Prospecto";
                const stageColor: Record<string, string> = {
                  Presentado: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
                  "Por Pitch": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
                  Contactado: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
                  Prospecto: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
                };
                return (
                  <tr key={i} data-testid={`row-eligible-${org.no}`} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 text-muted-foreground">{org.no}</td>
                    <td className="px-4 py-2.5 font-medium text-foreground">{org.nombre_caja ?? "—"}</td>
                    <td className="px-4 py-2.5 text-foreground">{org.departamento ?? "—"}</td>
                    <td className="px-4 py-2.5 text-center text-foreground">{org.socios ?? "—"}</td>
                    <td className="px-4 py-2.5 text-center text-foreground">{org.anos ?? "—"}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${stageColor[stage]}`}>{stage}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ProjCard({ icon, label, value, sub, color, highlight, testId }: {
  icon: React.ReactNode; label: string; value: number | string; sub: string;
  color: string; highlight?: boolean; testId?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  };
  return (
    <div
      className={`bg-card border rounded-xl p-4 flex items-start gap-3 ${highlight ? "border-primary ring-1 ring-primary/20" : "border-card-border"}`}
      data-testid={testId}
    >
      <div className={`p-2 rounded-lg shrink-0 ${colorMap[color]}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground leading-tight">{label}</p>
        <p className={`text-2xl font-bold mt-0.5 ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}
