import { useState, useMemo } from "react";
import { organizations, getPipelineStage } from "@/data/organizations";
import { Search, Phone, MapPin, Users, CheckCircle, XCircle, FileText } from "lucide-react";

const STAGE_COLORS: Record<string, string> = {
  "Presentado": "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400",
  "Por Pitch": "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  "Contactado": "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  "Sin Contacto": "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
  "Prospecto": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
};

export default function Organizations() {
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("Todos");
  const [filterDept, setFilterDept] = useState("Todos");
  const [filterDoc, setFilterDoc] = useState("Todos");
  const [selectedOrg, setSelectedOrg] = useState<typeof organizations[0] | null>(null);

  const depts = useMemo(() => {
    const set = new Set<string>();
    organizations.forEach(o => { if (o.departamento) set.add(o.departamento.toUpperCase()); });
    return ["Todos", ...Array.from(set).sort()];
  }, []);

  const filtered = useMemo(() => {
    return organizations.filter(o => {
      const name = (o.nombre_caja ?? "").toLowerCase();
      const contact = (o.nombre_contacto ?? "").toLowerCase();
      const obs = o.observaciones.toLowerCase();
      const q = search.toLowerCase();
      const matchSearch = !q || name.includes(q) || contact.includes(q) || obs.includes(q);
      const stage = getPipelineStage(o);
      const matchStage = filterStage === "Todos" || stage === filterStage;
      const matchDept = filterDept === "Todos" || (o.departamento ?? "").toUpperCase() === filterDept;
      const matchDoc =
        filterDoc === "Todos" ? true :
        filterDoc === "PJ+RTN+CT" ? o.pj && o.rtn && o.ct :
        filterDoc === "Con PJ" ? o.pj :
        filterDoc === "Sin PJ" ? !o.pj : true;
      return matchSearch && matchStage && matchDept && matchDoc;
    });
  }, [search, filterStage, filterDept, filterDoc]);

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Organizaciones</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} de {organizations.length} registros</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            data-testid="input-search"
            type="search"
            placeholder="Buscar organización o contacto..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <FilterSelect label="Etapa" value={filterStage} onChange={setFilterStage}
          options={["Todos", "Presentado", "Por Pitch", "Contactado", "Prospecto", "Sin Contacto"]} testId="select-stage" />
        <FilterSelect label="Departamento" value={filterDept} onChange={setFilterDept} options={depts} testId="select-dept" />
        <FilterSelect label="Documentación" value={filterDoc} onChange={setFilterDoc}
          options={["Todos", "PJ+RTN+CT", "Con PJ", "Sin PJ"]} testId="select-doc" />
      </div>

      {/* Table */}
      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground min-w-52">Organización</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Departamento</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Contacto</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Socios</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Años</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Docs</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Etapa</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Delegado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((org, idx) => {
                const stage = getPipelineStage(org);
                return (
                  <tr
                    key={idx}
                    data-testid={`row-org-${org.no}`}
                    className="hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => setSelectedOrg(org)}
                  >
                    <td className="px-4 py-3 text-muted-foreground">{org.no}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground leading-tight">{org.nombre_caja ?? "—"}</p>
                      {org.municipio && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3" />{org.municipio}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground">{org.departamento ?? "—"}</td>
                    <td className="px-4 py-3">
                      <p className="text-foreground">{org.nombre_contacto ?? "—"}</p>
                      {org.cargo && <p className="text-xs text-muted-foreground">{org.cargo}</p>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {org.socios !== null ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />{org.socios}
                        </span>
                      ) : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground">{org.anos ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <DocBadge label="PJ" active={org.pj} />
                        <DocBadge label="RTN" active={org.rtn} />
                        <DocBadge label="CT" active={org.ct} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${STAGE_COLORS[stage]}`}>
                        {stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                      {org.delegado_charlie ? "Don Charlie" : org.delegado_carlos ? "Carlos" : "—"}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground">
                    No se encontraron organizaciones con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedOrg(null)}>
          <div
            className="bg-card border border-card-border rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
            data-testid="modal-org-detail"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-foreground">{selectedOrg.nombre_caja ?? "Sin nombre"}</h2>
                  <p className="text-sm text-muted-foreground">{selectedOrg.municipio}{selectedOrg.departamento ? `, ${selectedOrg.departamento}` : ""}</p>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${STAGE_COLORS[getPipelineStage(selectedOrg)]}`}>
                  {getPipelineStage(selectedOrg)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <DetailItem label="Contacto" value={selectedOrg.nombre_contacto} />
                <DetailItem label="Cargo" value={selectedOrg.cargo} />
                <DetailItem label="Celular" value={selectedOrg.celular} icon={<Phone className="w-3.5 h-3.5" />} />
                <DetailItem label="Socios" value={selectedOrg.socios?.toString()} icon={<Users className="w-3.5 h-3.5" />} />
                <DetailItem label="Años operando" value={selectedOrg.anos?.toString()} />
                <DetailItem label="Aldea" value={selectedOrg.aldea} icon={<MapPin className="w-3.5 h-3.5" />} />
              </div>

              <div className="rounded-xl bg-muted/40 p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Documentación</p>
                <div className="flex gap-2">
                  <FullDocBadge label="Personería Jurídica" active={selectedOrg.pj} />
                  <FullDocBadge label="RTN" active={selectedOrg.rtn} />
                  <FullDocBadge label="CT" active={selectedOrg.ct} />
                </div>
              </div>

              <div className="rounded-xl bg-muted/40 p-3 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actividad</p>
                <div className="grid grid-cols-2 gap-1.5 text-sm">
                  <ContactBadge label="Video Llamada" active={selectedOrg.video_llamada} />
                  <ContactBadge label="Visita Presencial" active={selectedOrg.visita_presencial} />
                  <ContactBadge label="To Pitch" active={selectedOrg.to_pitch} />
                  <ContactBadge label="Presentado" active={selectedOrg.presented} />
                </div>
              </div>

              {selectedOrg.observaciones && (
                <div className="rounded-xl bg-muted/40 p-3 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Observaciones
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{selectedOrg.observaciones}</p>
                </div>
              )}

              {selectedOrg.fecha_socializacion && (
                <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-3">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-0.5">Fecha de Socialización</p>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">{selectedOrg.fecha_socializacion}</p>
                </div>
              )}

              {(selectedOrg.delegado_charlie || selectedOrg.delegado_carlos) && (
                <div className="rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 p-3">
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-0.5">Delegado a</p>
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
                    {selectedOrg.delegado_charlie ? "Don Charlie" : "Carlos"}
                  </p>
                </div>
              )}

              <button
                data-testid="button-close-modal"
                className="w-full py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm font-medium text-foreground transition-colors"
                onClick={() => setSelectedOrg(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, onChange, options, testId }: {
  label: string; value: string; onChange: (v: string) => void; options: string[]; testId?: string;
}) {
  return (
    <select
      data-testid={testId}
      className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      value={value}
      onChange={e => onChange(e.target.value)}
    >
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );
}

function DocBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${active ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-muted text-muted-foreground line-through"}`}>
      {label}
    </span>
  );
}

function FullDocBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${active ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" : "bg-muted text-muted-foreground"}`}>
      {active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
      {label}
    </div>
  );
}

function ContactBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${active ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 font-medium" : "bg-muted text-muted-foreground"}`}>
      {active ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string; value?: string | null; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground flex items-center gap-1">
        {icon}{value ?? "—"}
      </p>
    </div>
  );
}
