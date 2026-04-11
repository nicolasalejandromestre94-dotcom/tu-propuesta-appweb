import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, MessageCircle, Edit3, Eye, Image as ImageIcon, 
  DollarSign, Plus, ArrowLeft, Trash2, Loader2, Link as LinkIcon, Check, Upload, LogOut, Lock, ArrowLeftRight, ChevronRight
} from 'lucide-react';
import { BrowserRouter, Routes, Route, useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

// =====================================================================
// 🚨 LLAVES DE SUPABASE
// =====================================================================
const supabaseUrl = 'https://pdyqdbmvhmqnzgoxtjfw.supabase.co';
const supabaseKey = 'sb_publishable_0JMVVW3e4hHqPYR2gXCR-g_XWI7MoSg';

const supabase = createClient(supabaseUrl, supabaseKey);

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-900"><Loader2 className="animate-spin text-amber-600 w-10 h-10" /></div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={session ? <AdminDashboard /> : <Login />} />
        <Route path="/admin/editar/:id" element={session ? <AdminEditor /> : <Login />} />
        <Route path="/ver/:id" element={<VistaCliente />} />
      </Routes>
    </BrowserRouter>
  );
}

// --- VISTA 0: LOGIN ---
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError('Usuario o contraseña incorrectos');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-2xl w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-600"><Lock size={32} /></div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tighter italic">STUDIO<span className="text-amber-600">.MUD</span></h1>
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-2">Acceso Privado</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold text-center">{error}</div>}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email</label>
            <input type="email" required className="w-full bg-zinc-50 border-none p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-500" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Contraseña</label>
            <input type="password" required className="w-full bg-zinc-50 border-none p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-500" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 flex justify-center shadow-xl">
            {loading ? <Loader2 size={16} className="animate-spin" /> : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- VISTA 1: PANEL DE DASHBOARD ---
function AdminDashboard() {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  const fetchProyectos = async () => {
    const { data } = await supabase.from('proyectos').select('*').order('created_at', { ascending: false });
    if (data) setProyectos(data);
    setCargando(false);
  };

  useEffect(() => { fetchProyectos(); }, []);

  const nuevoProyecto = async () => {
    const ambienteInicial = {
      id: crypto.randomUUID(),
      tab: "Ambiente 1", titulo: "Nuevo Ambiente",
      obra: "", render: "",
      lbl1: "Seña (50%)", val1: "0", lbl2: "Saldo", val2: "0",
      lblIzq: "Antes", lblDer: "Render", invertido: false, total: "0"
    };

    const { data, error } = await supabase.from('proyectos').insert([{
      cliente: "Nuevo Cliente", whatsapp: "549",
      configuracion: { moneda: "USD", navegacion: "tabs", cantAmbientes: 1 },
      ambientes: [ambienteInicial]
    }]).select();
    
    if (data && data[0]) navigate(`/admin/editar/${data[0].id}`);
    if (error) alert("Error: " + error.message);
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin text-amber-600 w-10 h-10" /></div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tighter italic">STUDIO<span className="text-amber-600">.MUD</span></h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Gestor Integral</p>
          </div>
          <div className="flex gap-4">
            <button onClick={nuevoProyecto} className="bg-amber-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-amber-700 shadow-xl shadow-amber-200">
              <Plus size={16} /> Nueva Carpeta
            </button>
            <button onClick={() => supabase.auth.signOut()} className="bg-zinc-200 text-zinc-600 px-4 py-3 rounded-2xl hover:bg-red-100 hover:text-red-600"><LogOut size={16} /></button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {proyectos.map(p => {
            const primerEnv = p.ambientes?.[0] || {};
            const thumb = primerEnv.render || primerEnv.obra || "";
            return (
              <div key={p.id} className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 overflow-hidden hover:shadow-2xl transition-all duration-500 group">
                <div className="h-48 bg-zinc-100 relative">
                  {thumb ? <img src={thumb} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Vista" /> : <div className="w-full h-full flex items-center justify-center text-zinc-300 italic text-xs">Sin imagen</div>}
                  <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-900 shadow-sm">{p.cliente}</div>
                </div>
                <div className="p-8">
                  <h3 className="font-black text-xl leading-tight mb-2 tracking-tight text-zinc-900">{primerEnv.titulo || "Carpeta sin título"}</h3>
                  <p className="text-xs text-zinc-400 font-bold mb-6">{p.ambientes?.length} {p.ambientes?.length === 1 ? 'Ambiente' : 'Ambientes'}</p>
                  <div className="flex justify-between items-center pt-6 border-t border-zinc-50">
                    <Link to={`/admin/editar/${p.id}`} className="text-amber-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:opacity-70"><Edit3 size={14}/> Editar</Link>
                    <button onClick={() => { if(window.confirm('¿Borrar carpeta?')) supabase.from('proyectos').delete().eq('id', p.id).then(fetchProyectos); }} className="text-zinc-200 hover:text-red-500"><Trash2 size={20}/></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- VISTA 2: EDITOR MULTI-AMBIENTE ---
function AdminEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [subiendo, setSubiendo] = useState({ obra: false, render: false });
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const fetchProyecto = async () => {
      const { data } = await supabase.from('proyectos').select('*').eq('id', id).single();
      if (data) setP(data);
    };
    fetchProyecto();
  }, [id]);

  const updateGlobal = async (updates: any) => {
    const newP = { ...p, ...updates };
    setP(newP);
    await supabase.from('proyectos').update(updates).eq('id', id);
  };

  const updateConfig = (key: string, val: any) => updateGlobal({ configuracion: { ...p.configuracion, [key]: val } });

  const updateEnv = (key: string, val: any) => {
    const nuevosAmb = [...p.ambientes];
    nuevosAmb[activeTab][key] = val;
    updateGlobal({ ambientes: nuevosAmb });
  };

  const addAmbiente = () => {
    const nuevo = {
      id: crypto.randomUUID(), tab: `Ambiente ${p.ambientes.length + 1}`, titulo: "Nuevo Ambiente",
      obra: "", render: "", lbl1: "Seña", val1: "0", lbl2: "Saldo", val2: "0",
      lblIzq: "Antes", lblDer: "Render", invertido: false, total: "0"
    };
    const nuevosAmb = [...p.ambientes, nuevo];
    updateGlobal({ ambientes: nuevosAmb, configuracion: { ...p.configuracion, cantAmbientes: nuevosAmb.length > 1 ? 2 : 1 } });
    setActiveTab(nuevosAmb.length - 1);
  };

  const removeAmbiente = (indexToRemove: number) => {
    if (p.ambientes.length <= 1) return alert("Debe quedar al menos un ambiente.");
    if (!window.confirm("¿Eliminar este ambiente?")) return;
    const nuevosAmb = p.ambientes.filter((_:any, i:number) => i !== indexToRemove);
    updateGlobal({ ambientes: nuevosAmb, configuracion: { ...p.configuracion, cantAmbientes: nuevosAmb.length > 1 ? 2 : 1 } });
    setActiveTab(0);
  };

  const handleFileUpload = async (e: any, tipo: string) => {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendo(prev => ({ ...prev, [tipo]: true }));
    const ext = file.name.split('.').pop();
    const fileName = `${id}_${activeTab}_${tipo}_${Math.random()}.${ext}`;

    try {
      const { error } = await supabase.storage.from('proyectos').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('proyectos').getPublicUrl(fileName);
      updateEnv(tipo, data.publicUrl);
    } catch (error) {
      alert("Error al subir archivo.");
    } finally {
      setSubiendo(prev => ({ ...prev, [tipo]: false }));
    }
  };

  if (!p) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin text-amber-600 w-10 h-10" /></div>;

  const env = p.ambientes[activeTab] || {};
  const c = p.configuracion;

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8 pb-32 font-sans flex flex-col md:flex-row gap-8">
      
      <div className="flex-1 max-w-3xl space-y-8">
        <header className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100">
          <button onClick={() => navigate('/admin')} className="text-zinc-400 hover:text-zinc-900 font-black text-[10px] uppercase tracking-widest"><ArrowLeft size={16} className="inline mr-1"/> Panel</button>
          <div className="flex gap-2">
            <button onClick={() => {
                const url = `${window.location.origin}/ver/${id}`;
                const el = document.createElement('textarea'); el.value = url; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el);
                setCopiado(true); setTimeout(() => setCopiado(false), 2000);
              }} 
              className="px-4 py-2 bg-zinc-100 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-200 transition"
            >{copiado ? '¡Copiado!' : 'Copiar Link'}</button>
            <Link to={`/ver/${id}`} target="_blank" className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:bg-amber-700 transition"><Eye size={14}/> Ver App</Link>
          </div>
        </header>

        {/* CONFIG GENERAL */}
        <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Configuración Carpeta</h2>
          
          <div className="grid grid-cols-2 gap-6 border-b border-zinc-100 pb-6 mb-6">
            <div><label className="text-[10px] font-black uppercase text-zinc-500">Cliente</label><input className="w-full mt-2 border-b border-zinc-200 py-1 font-bold outline-none focus:border-amber-500" value={p.cliente} onChange={e=>updateGlobal({cliente: e.target.value})} /></div>
            <div><label className="text-[10px] font-black uppercase text-zinc-500">WhatsApp</label><input className="w-full mt-2 border-b border-zinc-200 py-1 font-bold text-zinc-600 outline-none focus:border-amber-500" value={p.whatsapp} onChange={e=>updateGlobal({whatsapp: e.target.value})} placeholder="549..." /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[9px] font-black uppercase text-zinc-500 block mb-2">Ambientes</label>
              <div className="flex bg-zinc-100 p-1 rounded-xl">
                <button onClick={() => updateConfig('cantAmbientes', 1)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${c.cantAmbientes===1?'bg-white shadow-sm text-zinc-900':'text-zinc-500'}`}>1 Solo</button>
                <button onClick={() => updateConfig('cantAmbientes', 2)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${c.cantAmbientes===2?'bg-white shadow-sm text-zinc-900':'text-zinc-500'}`}>Varios</button>
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-zinc-500 block mb-2">Moneda</label>
              <div className="flex bg-zinc-100 p-1 rounded-xl">
                <button onClick={() => updateConfig('moneda', 'USD')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${c.moneda==='USD'?'bg-white shadow-sm text-zinc-900':'text-zinc-500'}`}>USD</button>
                <button onClick={() => updateConfig('moneda', 'ARS')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${c.moneda==='ARS'?'bg-white shadow-sm text-zinc-900':'text-zinc-500'}`}>ARS</button>
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-zinc-500 block mb-2">Diseño</label>
              <div className="flex bg-zinc-100 p-1 rounded-xl">
                <button onClick={() => updateConfig('navegacion', 'tabs')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${c.navegacion==='tabs'?'bg-white shadow-sm text-zinc-900':'text-zinc-500'}`}>Pestañas</button>
                <button onClick={() => updateConfig('navegacion', 'index')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition ${c.navegacion==='index'?'bg-white shadow-sm text-zinc-900':'text-zinc-500'}`}>Índice</button>
              </div>
            </div>
          </div>
        </div>

        {/* GESTOR MULTI AMBIENTE */}
        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-black text-zinc-900">Editor de Ambientes</h2>
            {c.cantAmbientes === 2 && <button onClick={addAmbiente} className="text-amber-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">+ Agregar</button>}
          </div>

          {c.cantAmbientes === 2 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {p.ambientes.map((a:any, i:number) => (
                <button key={a.id} onClick={() => setActiveTab(i)} className={`shrink-0 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition ${activeTab===i ? 'bg-zinc-900 text-white shadow-md' : 'bg-white text-zinc-500 border border-zinc-200'}`}>
                  {a.tab || `Ambiente ${i+1}`}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm space-y-8 relative">
            {c.cantAmbientes === 2 && p.ambientes.length > 1 && (
              <button onClick={() => removeAmbiente(activeTab)} className="absolute top-6 right-6 text-zinc-300 hover:text-red-500"><Trash2 size={18}/></button>
            )}

            <div className="grid grid-cols-2 gap-6">
              {c.cantAmbientes === 2 && (
                <div><label className="text-[10px] font-black uppercase text-zinc-400">Pestaña/Índice</label><input className="w-full mt-2 border-b-2 border-zinc-100 py-2 font-bold text-amber-600 outline-none" value={env.tab} onChange={e=>updateEnv('tab', e.target.value)} /></div>
              )}
              <div className={c.cantAmbientes === 1 ? 'col-span-2' : ''}><label className="text-[10px] font-black uppercase text-zinc-400">Título del Banner</label><input className="w-full mt-2 border-b-2 border-zinc-100 py-2 font-black text-xl text-zinc-900 outline-none" value={env.titulo} onChange={e=>updateEnv('titulo', e.target.value)} /></div>
            </div>

            {/* FOTOS SLIDER */}
            <div className="pt-6 border-t border-zinc-100">
              <h3 className="text-[10px] font-black uppercase text-zinc-400 mb-4">Fotos & Slider interactivo</h3>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div><label className="text-[9px] font-bold text-zinc-400 uppercase">Botón Izquierdo</label><input className="w-full border-b border-zinc-200 py-1 text-xs font-bold outline-none text-zinc-600" value={env.lblIzq} onChange={e=>updateEnv('lblIzq', e.target.value)} /></div>
                <div><label className="text-[9px] font-bold text-zinc-400 uppercase">Botón Derecho</label><input className="w-full border-b border-zinc-200 py-1 text-xs font-bold outline-none text-zinc-600" value={env.lblDer} onChange={e=>updateEnv('lblDer', e.target.value)} /></div>
              </div>

              <div className="grid grid-cols-2 gap-6 relative">
                <button onClick={() => updateEnv('invertido', !env.invertido)} className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 bg-white border border-zinc-200 shadow-lg rounded-full p-2.5 text-zinc-400 hover:text-amber-600 z-10 hover:scale-110 transition"><ArrowLeftRight size={18}/></button>

                <div className={`space-y-3 p-4 rounded-2xl border ${!env.invertido ? 'bg-zinc-50 border-zinc-200' : 'bg-amber-50/30 border-amber-200'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Img Izquierda (Frente)</span>
                  <div className="aspect-video w-full bg-zinc-200 rounded-xl overflow-hidden relative flex items-center justify-center">
                    {(!env.invertido ? env.obra : env.render) ? <img src={!env.invertido ? env.obra : env.render} className="w-full h-full object-cover"/> : <ImageIcon className="text-zinc-400"/>}
                  </div>
                  <label className="block w-full text-center bg-white border border-zinc-200 rounded-lg py-2 text-xs font-bold text-zinc-600 cursor-pointer hover:bg-zinc-50">
                    {subiendo[!env.invertido ? 'obra' : 'render'] ? <Loader2 size={14} className="animate-spin inline"/> : 'Cambiar'}
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, !env.invertido ? 'obra' : 'render')} />
                  </label>
                </div>

                <div className={`space-y-3 p-4 rounded-2xl border ${env.invertido ? 'bg-zinc-50 border-zinc-200' : 'bg-amber-50/30 border-amber-200'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Img Derecha (Fondo)</span>
                  <div className="aspect-video w-full bg-amber-100 rounded-xl overflow-hidden relative flex items-center justify-center">
                    {(env.invertido ? env.obra : env.render) ? <img src={env.invertido ? env.obra : env.render} className="w-full h-full object-cover"/> : <ImageIcon className="text-amber-400"/>}
                  </div>
                  <label className="block w-full text-center bg-white border border-zinc-200 rounded-lg py-2 text-xs font-bold text-zinc-600 cursor-pointer hover:bg-zinc-50">
                    {subiendo[env.invertido ? 'obra' : 'render'] ? <Loader2 size={14} className="animate-spin inline"/> : 'Cambiar'}
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, env.invertido ? 'obra' : 'render')} />
                  </label>
                </div>
              </div>
            </div>

            {/* PRESUPUESTO */}
            <div className="pt-6 border-t border-zinc-100">
              <h3 className="text-[10px] font-black uppercase text-zinc-400 mb-4">Presupuesto ({c.moneda})</h3>
              <div className="mb-4">
                <label className="text-[10px] font-black uppercase text-zinc-500">Monto Total</label>
                <input className="w-full mt-1 bg-zinc-100 p-3 rounded-xl font-black text-xl outline-none focus:ring-2 focus:ring-zinc-900" value={env.total} onChange={e=>updateEnv('total', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <div className="space-y-1"><label className="text-[9px] font-bold text-zinc-400 uppercase">Etiqueta 1</label><input className="w-full border-b border-zinc-200 py-1 text-xs font-bold bg-transparent outline-none" value={env.lbl1} onChange={e=>updateEnv('lbl1', e.target.value)} /></div>
                <div className="space-y-1"><label className="text-[9px] font-bold text-amber-600 uppercase">Valor 1</label><input className="w-full border-b border-amber-200 py-1 text-xs font-black text-amber-600 bg-transparent outline-none" value={env.val1} onChange={e=>updateEnv('val1', e.target.value)} /></div>
                <div className="space-y-1 pt-2"><label className="text-[9px] font-bold text-zinc-400 uppercase">Etiqueta 2</label><input className="w-full border-b border-zinc-200 py-1 text-xs font-bold bg-transparent outline-none" value={env.lbl2} onChange={e=>updateEnv('lbl2', e.target.value)} /></div>
                <div className="space-y-1 pt-2"><label className="text-[9px] font-bold text-zinc-500 uppercase">Valor 2</label><input className="w-full border-b border-zinc-200 py-1 text-xs font-black text-zinc-600 bg-transparent outline-none" value={env.val2} onChange={e=>updateEnv('val2', e.target.value)} /></div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

// --- VISTA 3: CLIENTE (SIMULADOR CELULAR REAL) ---
function VistaCliente() {
  const { id } = useParams();
  const [p, setP] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showIndex, setShowIndex] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'proyectos', id), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setP(data);
        if (data.configuracion?.cantAmbientes > 1 && data.configuracion?.navegacion === 'index') {
          setShowIndex(true);
        }
      }
    });
    return () => unsubscribe();
  }, [id]);

  // Hook simple para animar al scrollear
  useEffect(() => {
    if(!p || showIndex) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('opacity-100', 'translate-y-0'); });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-elem').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [p, showIndex, activeTab]);

  if (!p) return <div className="min-h-screen flex items-center justify-center bg-zinc-900"><Loader2 className="animate-spin text-white w-10 h-10" /></div>;

  const c = p.configuracion;
  const env = p.ambientes[activeTab] || {};
  const isMultiple = c.cantAmbientes > 1;

  // Calculo de Total
  let totalSuma = 0;
  if (isMultiple) {
    totalSuma = p.ambientes.reduce((acc: number, curr: any) => {
      const n = parseInt((curr.total||"").replace(/\./g, ''));
      return acc + (isNaN(n) ? 0 : n);
    }, 0);
  }

  const selectEnvFromIndex = (i: number) => {
    setActiveTab(i);
    setShowIndex(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex justify-center items-start md:py-10 font-sans">
      <div className="w-full max-w-md bg-white min-h-screen md:min-h-[90vh] md:rounded-[3rem] overflow-hidden flex flex-col shadow-[0_50px_100px_rgba(0,0,0,0.9)] relative">
        
        {/* HEADER */}
        <div className={`bg-[#111111] pt-6 px-4 rounded-b-2xl z-20 flex flex-col shadow-lg transition-all ${(!isMultiple || showIndex) ? 'pb-4' : 'pb-0'}`}>
          <header className="flex justify-between items-center mb-4 px-2">
            <h1 className="font-black text-[26px] tracking-tighter italic text-white leading-none">STUDIO<span className="text-amber-500">.MUD</span></h1>
            <span className="text-[7px] bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-1 rounded-full uppercase tracking-widest font-bold">
              {isMultiple ? 'Proyecto Integral' : 'Diseño a Medida'}
            </span>
          </header>
          
          {/* TABS VISUALES */}
          {isMultiple && !showIndex && c.navegacion === 'tabs' && (
            <div className="flex overflow-x-auto gap-1.5 items-end hide-scroll">
              {p.ambientes.map((a:any, i:number) => (
                <button key={i} onClick={() => setActiveTab(i)} className={`shrink-0 px-3 py-1.5 rounded-t-lg text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === i ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}>
                  {a.tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PANTALLA: ÍNDICE */}
        {showIndex && (
          <div className="flex-1 bg-zinc-50 overflow-y-auto p-6 pt-10">
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-tight mb-2">Proyecto<br/>{p.cliente}</h2>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-8">Selecciona un ambiente</p>
            <div className="space-y-4">
              {p.ambientes.map((a:any, i:number) => {
                const imgThumb = a.invertido ? a.obra : a.render;
                return (
                  <div key={i} onClick={() => selectEnvFromIndex(i)} className="bg-white rounded-2xl p-3 border border-zinc-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-amber-300 group">
                    <div className="w-20 h-20 rounded-xl bg-zinc-100 overflow-hidden shrink-0">
                      {imgThumb && <img src={imgThumb} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-lg text-zinc-900">{a.tab}</h3>
                      <p className="text-amber-600 font-bold text-xs mt-1">{c.moneda === 'ARS' ? 'ARS $' : 'USD'} {a.total}</p>
                    </div>
                    <ChevronRight size={20} className="text-zinc-300 group-hover:text-amber-500" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PANTALLA: DETALLE AMBIENTE */}
        {!showIndex && (
          <div className="flex-1 overflow-y-auto bg-white pb-32 hide-scroll scroll-smooth">
            
            {isMultiple && c.navegacion === 'index' && (
              <div className="px-4 pt-4 pb-2">
                <button onClick={() => setShowIndex(true)} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200">
                  <ArrowLeft size={12} strokeWidth={3}/> Volver al Índice
                </button>
              </div>
            )}

            {/* SLIDER MAGICO COMPONENTE */}
            <div className="relative aspect-[4/5] w-full mb-5 mt-2">
              <SliderAntesDespues env={env} activeTab={activeTab} />
            </div>

            <div className="px-6 mb-6 reveal-elem opacity-0 translate-y-4 transition-all duration-500">
              <h2 className="text-3xl font-black text-zinc-900 leading-tight tracking-tighter italic">{env.titulo}</h2>
              <p className="text-zinc-500 font-medium text-xs mt-1">{p.cliente}</p>
            </div>

            <div className="px-6 space-y-3">
              <div className="bg-[#1a1a1a] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden reveal-elem opacity-0 translate-y-4 transition-all duration-500 delay-100">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl"></div>
                <p className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.3em] mb-1">Costo de este Ambiente</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-amber-500 font-black text-sm">{c.moneda === 'ARS' ? 'ARS $' : 'USD'}</span>
                  <p className="text-4xl font-black tracking-tighter text-white">{env.total}</p>
                </div>
                <div className="space-y-2 border-t border-zinc-800 pt-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400 font-bold flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>{env.lbl1}</span>
                    <span className="font-black text-amber-500">{env.val1}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500 font-bold flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-zinc-600"></div>{env.lbl2}</span>
                    <span className="font-black text-zinc-400">{env.val2}</span>
                  </div>
                </div>
              </div>

              {isMultiple && (
                <div className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-2xl p-5 flex justify-between items-center shadow-sm reveal-elem opacity-0 translate-y-4 transition-all duration-500 delay-200">
                  <span className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em]">Total Proyecto</span>
                  <span className="text-zinc-900 font-black text-lg">{c.moneda === 'ARS' ? 'ARS $' : 'USD'} {totalSuma.toLocaleString('es-AR')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FOOTER WPP */}
        <div className="absolute bottom-0 w-full p-4 bg-white border-t border-zinc-100 z-30">
          <a href={`https://wa.me/${p.whatsapp}?text=Hola! Estuve viendo la propuesta del proyecto y quiero avanzar.`} target="_blank" rel="noreferrer" className="w-full bg-[#25D366] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] transition-transform">
            <MessageCircle size={20} fill="white" /> Aprobar Proyecto
          </a>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html:`
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}}/>
    </div>
  );
}

// --- SUB-COMPONENTE: SLIDER MÁGICO EN REACT ---
function SliderAntesDespues({ env, activeTab }: { env: any, activeTab: number }) {
  const [val, setVal] = useState(50);
  const [anim, setAnim] = useState('');

  // Animación Educativa Mantequilla
  useEffect(() => {
    setAnim('transition-all duration-[400ms] cubic-bezier(0.25, 1, 0.5, 1)');
    setTimeout(() => setVal(70), 200);
    setTimeout(() => setVal(30), 650);
    setTimeout(() => setVal(50), 1100);
    setTimeout(() => setAnim(''), 1550);
  }, [activeTab]); // Se ejecuta cada vez que cambia el tab

  const handleDrag = (e: any) => { setAnim(''); setVal(e.target.value); };
  const snap = (v: number) => { setAnim('transition-all duration-300 ease-out'); setVal(v); setTimeout(() => setAnim(''), 300); };

  const imgIzq = !env.invertido ? env.obra : env.render;
  const imgDer = env.invertido ? env.obra : env.render;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={imgDer} className="absolute inset-0 w-full h-full object-cover" />
      
      <div className={`absolute top-0 left-0 h-full overflow-hidden ${anim}`} style={{ width: `${val}%` }}>
        <img src={imgIzq} className="absolute top-0 left-0 w-[100vw] h-full object-cover max-w-none md:w-[400px]" />
      </div>
      
      <div className={`absolute top-0 bottom-0 w-[3px] bg-white z-10 -translate-x-1/2 shadow-[0_0_10px_rgba(0,0,0,0.3)] ${anim}`} style={{ left: `${val}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-10 bg-white rounded-md shadow-md flex items-center justify-center gap-1">
          <div className="w-0.5 h-4 bg-zinc-300 rounded-full"></div>
          <div className="w-0.5 h-4 bg-zinc-300 rounded-full"></div>
        </div>
      </div>
      
      <input type="range" min="0" max="100" value={val} onChange={handleDrag} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20" />

      <div className="absolute bottom-6 left-6 flex bg-white/90 backdrop-blur-md p-1 rounded-full shadow-xl border border-white z-30 pointer-events-auto">
        <button onClick={()=>snap(100)} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${val > 65 ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>{env.lblIzq}</button>
        <button onClick={()=>snap(0)} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${val < 35 ? 'bg-zinc-900 text-white' : 'text-zinc-500'}`}>{env.lblDer}</button>
      </div>
    </div>
  );
}