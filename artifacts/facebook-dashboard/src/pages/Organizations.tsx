import { useState, useMemo } from "react";
import { organizations, getPipelineStage } from "@/data/organizations";
import { Search, Phone, MapPin, Users, CheckCircle, XCircle, FileText, AlertTriangle, X, ChevronDown } from "lucide-react";

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
  const [selectedDepts, setSelectedDepts] = useState<string[]>([]);
  const [filterDoc, setFilterDoc] = useState("Todos");
  const [filterNoAtendio, setFilterNoAtendio] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<typeof organizations[0] | null>(null);
  const [deptOpen, setDeptOpen] = useState(false);

  const allDepts = useMemo(() => {
    const set = new Set<string>();
    organizations.forEach(o => { if (o.departamento) set.add(o.departamento.toUpperCase()); });
    return Array.from(set).sort();
  }, []);

  const toggleDept = (dept: string) => {
    setSelectedDepts(prev =>
      prev.includes(dept) ? prev.filter(d => d !== dept) : [...prev, dept]
    );
  };

  const clearDepts = () => setSelectedDepts([]);

  const filtered = useMemo(() => {
    return organizations.filter(o => {
      const name = (o.nombre_caja ?? "").toLowerCase();
      const contact = (o.nombre_contacto ?? "").toLowerCase();
      const obs = o.observaciones.toLowerCase();
      const q = search.toLowerCase();
      const matchSearch = !q || name.includes(q) || contact.includes(q) || obs.includes(q);
      const stage = getPipelineStage(o);
      const matchStage = filterStage === "Todos" || stage === filterStage;
      const matchDept = selectedDepts.length === 0 || selectedDepts.includes((o.departamento ?? "").toUpperCase());
      const matchDoc =
        filterDoc === "Todos" ? true :
        filterDoc === "PJ+RTN+CT" ? o.pj && o.rtn && o.ct :
        filterDoc === "Con PJ" ? o.pj :
        filterDoc === "Sin PJ" ? !o.pj : true;
      const matchNoAtendio = !filterNoAtendio || !!o.no_atendieron;
      return matchSearch && matchStage && matchDept && matchDoc && matchNoAtendio;
    });
  }, [search, filterStage, selectedDepts, filterDoc, filterNoAtendio]);

  const noAtendieronCount = useMemo(() => organizations.filter(o => o.no_atendieron).length, []);

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

        <FilterSelect
          label="Etapa"
          value={filterStage}
          onChange={setFilterStage}
          options={["Todos", "Presentado", "Por Pitch", "Contactado", "Prospecto", "Sin Contacto"]}
          testId="select-stage"
        />

        {/* Multi-select Departamentos */}
        <div className="relative" data-testid="multiselect-dept">
          <button
            onClick={() => setDeptOpen(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors ${
              selectedDepts.length > 0
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-foreground hover:border-primary"
            }`}
          >
            <span>
              {selectedDepts.length === 0
                ? "Todos los Departamentos"
                : selectedDepts.length === 1
                ? selectedDepts[0]
                : `${selectedDepts.length} departamentos`}
            </span>
            {selectedDepts.length > 0 && (
              <button
                onClick={e => { e.stopPropagation(); clearDepts(); }}
                className="ml-1 text-primary hover:text-primary/70"
                data-testid="btn-clear-depts"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${deptOpen ? "rotate-180" : ""}`} />
          </button>

          {deptOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDeptOpen(false)} />
              <div className="absolute top-full left-0 mt-1 z-20 bg-card border border-border rounded-xl shadow-lg min-w-52 max-h-72 overflow-y-auto">
                <div className="p-2 border-b border-border flex items-center justify-between px-3">
                  <span className="text-xs font-semibold text-muted-foreground">Seleccionar departamentos</span>
                  {selectedDepts.length > 0 && (
                    <button onClick={clearDepts} className="text-xs text-primary hover:underline">Limpiar</button>
                  )}
                </div>
                <div className="p-1">
                  {allDepts.map(dept => (
                    <button
                      key={dept}
                      data-testid={`dept-option-${dept}`}
                      onClick={() => toggleDept(dept)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                        selectedDepts.includes(dept)
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        selectedDepts.includes(dept) ? "bg-primary border-primary" : "border-border"
                      }`}>
                        {selectedDepts.includes(dept) && <CheckCircle className="w-3 h-3 text-white fill-white" />}
                      </div>
                      {dept}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <FilterSelect
          label="Documentación"
          value={filterDoc}
          onChange={setFilterDoc}
          options={["Todos", "PJ+RTN+CT", "Con PJ", "Sin PJ"]}
          testId="select-doc"
        />

        {/* No atendieron filter */}
        <button
          data-testid="btn-filter-no-atendio"
          onClick={() => setFilterNoAtendio(v => !v)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
            filterNoAtendio
              ? "border-orange-400 bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400"
              : "border-border bg-card text-muted-foreground hover:border-orange-400 hover:text-orange-600"
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          No atendieron
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
            filterNoAtendio ? "bg-orange-200 text-orange-700 dark:bg-orange-900 dark:text-orange-300" : "bg-muted text-muted-foreground"
          }`}>
            {noAtendieronCount}
          </span>
        </button>
      </div>

      {/* Active filters chips */}
      {selectedDepts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedDepts.map(d => (
            <span
              key={d}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
            >
              {d}
              <button onClick={() => toggleDept(d)} className="hover:text-primary/70">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

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
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Alerta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((org, idx) => {
                const stage = getPipelineStage(org);
                return (
                  <tr
                    key={idx}
                    data-testid={`row-org-${org.no}`}
                    className={`hover:bg-muted/30 cursor-pointer transition-colors ${org.no_atendieron ? "bg-orange-50/50 dark:bg-orange-950/10" : ""}`}
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
                    <td className="px-4 py-3 text-center">
                      {org.no_atendieron ? (
                        <span
                          title={org.no_atendieron}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          No atendió
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
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

              {selectedOrg.no_atendieron && (
                <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-xl p-3">
                  <AlertTriangle className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-0.5">No asistió a la reunión programada</p>
                    <p className="text-sm text-orange-800 dark:text-orange-300">{selectedOrg.no_atendieron}</p>
                  </div>
                </div>
              )}

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

function FilterSelect({ label: _label, value, onChange, options, testId }: {
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
