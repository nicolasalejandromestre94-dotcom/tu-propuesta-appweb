import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, MessageCircle, Edit3, Eye, Image as ImageIcon, 
  DollarSign, Plus, ArrowLeft, Trash2, Loader2, Link as LinkIcon, Check, Upload, LogOut, Lock, ArrowLeftRight, ChevronRight, ChevronLeft, X
} from 'lucide-react';
import { BrowserRouter, Routes, Route, useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

// =====================================================================
// 🚨 LLAVES DE SUPABASE
// =====================================================================
const supabaseUrl = 'https://pdyqdbmvhmqnzgoxtjfw.supabase.co';
const supabaseKey = 'sb_publishable_0JMVVW3e4hHqPYR2gXCR-g_XWI7MoSg';

const supabase = createClient(supabaseUrl, supabaseKey);

// Función auxiliar para parsear y sumar precios (remueve puntos)
const parsePrice = (str: string) => {
  if (!str) return 0;
  const cleaned = str.toString().replace(/\./g, '').replace(/,/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
};

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
      tab: "Ambiente 1", titulo: "Cocina Principal",
      galeriaObra: [], galeriaRender: [],
      lbl1: "Costo Materiales", val1: "0", lbl2: "Diseño y Montaje", val2: "0",
      lblIzq: "Antes", lblDer: "Render 3D", invertido: false, total: "0"
    };

    const { data, error } = await supabase.from('proyectos').insert([{
      cliente: "Nuevo Cliente", whatsapp: "549",
      configuracion: { moneda: "ARS", navegacion: "tabs", cantAmbientes: 1 },
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

        {proyectos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-200">
            <p className="text-zinc-400 font-bold">Aún no hay proyectos. ¡Creá tu primera carpeta!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {proyectos.map(p => {
              const primerEnv = p.ambientes?.[0] || {};
              const thumbObra = primerEnv.galeriaObra?.[0] || primerEnv.obra || "";
              const thumbRender = primerEnv.galeriaRender?.[0] || primerEnv.render || "";
              const thumb = thumbRender || thumbObra;
              
              return (
                <div key={p.id} className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 overflow-hidden hover:shadow-2xl transition-all duration-500 group">
                  <div className="h-48 bg-zinc-100 relative">
                    {thumb ? <img src={thumb} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" alt="Vista" /> : <div className="w-full h-full flex items-center justify-center text-zinc-300 italic text-xs">Sin imagen</div>}
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
        )}
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
      galeriaObra: [], galeriaRender: [],
      lbl1: "Costo Materiales", val1: "0", lbl2: "Diseño y Montaje", val2: "0",
      lblIzq: "Antes", lblDer: "Render 3D", invertido: false, total: "0"
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

  const handleFileUpload = async (e: any, tipo: 'obra' | 'render') => {
    const files = Array.from(e.target.files as FileList);
    if (!files.length) return;
    
    setSubiendo(prev => ({ ...prev, [tipo]: true }));
    const nuevasUrls: string[] = [];

    for (let file of files) {
      const ext = file.name.split('.').pop();
      const fileName = `${id}_${activeTab}_${tipo}_${Math.random()}.${ext}`;

      try {
        const { error } = await supabase.storage.from('proyectos').upload(fileName, file);
        if (!error) {
          const { data } = supabase.storage.from('proyectos').getPublicUrl(fileName);
          nuevasUrls.push(data.publicUrl);
        }
      } catch (err) {
        console.error("Error subiendo foto", err);
      }
    }

    if (nuevasUrls.length > 0) {
      const arrName = tipo === 'obra' ? 'galeriaObra' : 'galeriaRender';
      const fallbackOldStr = tipo === 'obra' ? p.ambientes[activeTab].obra : p.ambientes[activeTab].render;
      
      let currentArr = p.ambientes[activeTab][arrName];
      if (!currentArr && fallbackOldStr) currentArr = [fallbackOldStr];
      if (!currentArr) currentArr = [];

      updateEnv(arrName, [...currentArr, ...nuevasUrls]);
    }
    
    setSubiendo(prev => ({ ...prev, [tipo]: false }));
  };

  if (!p) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin text-amber-600 w-10 h-10" /></div>;

  const env = p.ambientes[activeTab] || {};
  const c = p.configuracion;

  const renderGaleriaAdmin = (tipo: 'obra' | 'render') => {
    const isObra = tipo === 'obra';
    const arrField = isObra ? 'galeriaObra' : 'galeriaRender';
    
    let fotos = env[arrField];
    if (!fotos && env[tipo]) fotos = [env[tipo]];
    if (!fotos) fotos = [];

    const invertido = env.invertido;
    const isFrente = (!invertido && isObra) || (invertido && !isObra);

    return (
      <div className={`space-y-4 p-5 rounded-3xl border ${isFrente ? 'bg-zinc-50 border-zinc-200/60' : 'bg-amber-50/30 border-amber-200/50'}`}>
        <div className="flex justify-between items-center">
          <span className={`text-[10px] font-black uppercase tracking-widest ${isFrente ? 'text-zinc-500' : 'text-amber-600'}`}>
            Galería {isObra ? 'Antes (Obra)' : 'Render 3D'} {isFrente ? '(Frente/Izq)' : '(Fondo/Der)'}
          </span>
          <label className={`px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest cursor-pointer transition shadow-sm ${isFrente ? 'border-zinc-300 text-zinc-500 hover:bg-zinc-200 bg-white' : 'border-amber-300 text-amber-600 hover:bg-amber-100 bg-white'}`}>
            {subiendo[tipo] ? <Loader2 size={12} className="animate-spin inline mr-1"/> : <Plus size={12} className="inline mr-1"/>}
            Añadir Fotos
            <input type="file" multiple className="hidden" accept="image/*" onChange={e => handleFileUpload(e, tipo)} />
          </label>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {fotos.map((url: string, i: number) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group shadow-sm ring-1 ring-black/5">
              {/* Bug 3 Corregido: object-center para que la miniatura no se deforme feo */}
              <img src={url} className="w-full h-full object-cover object-center" />
              <button onClick={() => {
                const nuevas = fotos.filter((_:any, idx:number) => idx !== i);
                updateEnv(arrField, nuevas);
              }} className="absolute inset-0 bg-red-500/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
                <Trash2 size={18}/>
              </button>
            </div>
          ))}
          {fotos.length === 0 && (
             <div className="w-full h-20 border-2 border-dashed rounded-xl flex items-center justify-center text-xs font-bold text-black/20 italic">No hay fotos</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8 pb-32 font-sans flex flex-col md:flex-row gap-8">
      
      <div className="flex-1 max-w-3xl space-y-8 mx-auto">
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

        <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>
          <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Configuración de Carpeta</h2>
          
          <div className="grid grid-cols-2 gap-6 border-b border-zinc-100 pb-6 mb-6">
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Nombre Cliente</label>
              <input className="w-full mt-1 bg-zinc-100 px-4 py-3 rounded-xl font-bold outline-none focus:bg-white border-2 border-transparent focus:border-amber-500 transition" value={p.cliente} onChange={e=>updateGlobal({cliente: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">WhatsApp</label>
              <input className="w-full mt-1 bg-zinc-100 px-4 py-3 rounded-xl font-bold text-zinc-600 outline-none focus:bg-white border-2 border-transparent focus:border-amber-500 transition" value={p.whatsapp} onChange={e=>updateGlobal({whatsapp: e.target.value})} placeholder="549..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[9px] font-black uppercase text-zinc-500 block mb-2 ml-1">Cantidad Ambientes</label>
              <div className="flex bg-zinc-100 p-1.5 rounded-xl">
                <button onClick={() => updateConfig('cantAmbientes', 1)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition ${c.cantAmbientes===1?'bg-white shadow-md text-zinc-900':'text-zinc-500 hover:text-zinc-700'}`}>1 Solo</button>
                <button onClick={() => updateConfig('cantAmbientes', 2)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition ${c.cantAmbientes===2?'bg-white shadow-md text-zinc-900':'text-zinc-500 hover:text-zinc-700'}`}>Varios</button>
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-zinc-500 block mb-2 ml-1">Moneda</label>
              <div className="flex bg-zinc-100 p-1.5 rounded-xl">
                <button onClick={() => updateConfig('moneda', 'USD')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition ${c.moneda==='USD'?'bg-white shadow-md text-zinc-900':'text-zinc-500 hover:text-zinc-700'}`}>USD</button>
                <button onClick={() => updateConfig('moneda', 'ARS')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition ${c.moneda==='ARS'?'bg-white shadow-md text-zinc-900':'text-zinc-500 hover:text-zinc-700'}`}>ARS</button>
              </div>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-zinc-500 block mb-2 ml-1">Diseño (Si hay varios)</label>
              <div className="flex bg-zinc-100 p-1.5 rounded-xl">
                <button onClick={() => updateConfig('navegacion', 'tabs')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition ${c.navegacion==='tabs'?'bg-white shadow-md text-zinc-900':'text-zinc-500 hover:text-zinc-700'}`}>Pestañas</button>
                <button onClick={() => updateConfig('navegacion', 'index')} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition ${c.navegacion==='index'?'bg-white shadow-md text-zinc-900':'text-zinc-500 hover:text-zinc-700'}`}>Índice</button>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-xl font-black text-zinc-900">Editor de Ambientes</h2>
            {c.cantAmbientes === 2 && <button onClick={addAmbiente} className="text-amber-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition"><Plus size={14}/> Agregar Ambiente</button>}
          </div>

          {c.cantAmbientes === 2 && (
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 hide-scroll">
              {p.ambientes.map((a:any, i:number) => (
                <button key={a.id} onClick={() => setActiveTab(i)} className={`shrink-0 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition ${activeTab===i ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'}`}>
                  {a.tab || `Ambiente ${i+1}`}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm space-y-8 relative">
            {c.cantAmbientes === 2 && p.ambientes.length > 1 && (
              <button onClick={() => removeAmbiente(activeTab)} className="absolute top-6 right-6 text-zinc-300 hover:text-red-500 bg-red-50 p-2 rounded-full"><Trash2 size={16}/></button>
            )}

            <div className="grid grid-cols-2 gap-6">
              {c.cantAmbientes === 2 && (
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Nombre Pestaña / Índice</label>
                  <input className="w-full mt-1 bg-amber-50 px-4 py-3 rounded-xl font-bold text-amber-700 outline-none focus:bg-white border-2 border-transparent focus:border-amber-500 transition" value={env.tab} onChange={e=>updateEnv('tab', e.target.value)} placeholder="Ej: Cocina" />
                </div>
              )}
              <div className={c.cantAmbientes === 1 ? 'col-span-2' : ''}>
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Título del Banner (App)</label>
                <input className="w-full mt-1 bg-zinc-100 px-4 py-3 rounded-xl font-black text-xl text-zinc-900 outline-none focus:bg-white border-2 border-transparent focus:border-amber-500 transition" value={env.titulo} onChange={e=>updateEnv('titulo', e.target.value)} placeholder="Ej: Cocina Principal" />
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100">
              <h3 className="text-[10px] font-black uppercase text-zinc-400 mb-4">Fotos & Slider interactivo</h3>
              
              <div className="grid grid-cols-2 gap-6 mb-8 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <div>
                  <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1">Texto Botón Izquierdo</label>
                  <input className="w-full mt-1 bg-white border border-zinc-200 px-3 py-2 rounded-lg text-xs font-bold outline-none focus:border-amber-500 text-zinc-800 transition" value={env.lblIzq} onChange={e=>updateEnv('lblIzq', e.target.value)} />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1">Texto Botón Derecho</label>
                  <input className="w-full mt-1 bg-white border border-zinc-200 px-3 py-2 rounded-lg text-xs font-bold outline-none focus:border-amber-500 text-zinc-800 transition" value={env.lblDer} onChange={e=>updateEnv('lblDer', e.target.value)} />
                </div>
              </div>

              <div className="relative">
                {/* Bug 2 Corregido: Ahora cruza las letras además de la foto */}
                <button onClick={() => {
                  const nuevosAmb = [...p.ambientes];
                  const ambiente = nuevosAmb[activeTab];
                  ambiente.invertido = !ambiente.invertido;
                  const tempLbl = ambiente.lblIzq;
                  ambiente.lblIzq = ambiente.lblDer;
                  ambiente.lblDer = tempLbl;
                  updateGlobal({ ambientes: nuevosAmb });
                }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-zinc-200 shadow-xl rounded-full p-3 text-zinc-400 hover:text-amber-600 hover:border-amber-400 z-10 hover:scale-110 active:scale-95 transition-all flex flex-col items-center" title="Invertir Posición Izq/Der">
                  <ArrowLeftRight size={20}/>
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderGaleriaAdmin(!env.invertido ? 'obra' : 'render')}
                  {renderGaleriaAdmin(env.invertido ? 'obra' : 'render')}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-100">
              <h3 className="text-[10px] font-black uppercase text-zinc-400 mb-4">Presupuesto en {c.moneda}</h3>
              <div className="mb-6">
                <label className="text-[10px] font-black uppercase text-zinc-500 ml-1">Monto Total del Ambiente</label>
                <div className="relative mt-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-400">{c.moneda === 'ARS' ? '$' : 'USD'}</span>
                  <input className="w-full bg-zinc-100 pl-12 pr-4 py-4 rounded-xl font-black text-2xl outline-none focus:bg-white border-2 border-transparent focus:border-amber-500 transition text-zinc-900" value={env.total} onChange={e=>updateEnv('total', e.target.value)} />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-50 p-6 rounded-3xl border border-zinc-100">
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1">Concepto 1 (Etiqueta)</label>
                    <input className="w-full mt-1 bg-white border border-zinc-200 px-4 py-2 rounded-xl text-xs font-bold outline-none focus:border-amber-500 transition" value={env.lbl1} onChange={e=>updateEnv('lbl1', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-amber-600 uppercase ml-1">Valor 1</label>
                    <input className="w-full mt-1 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-xs font-black text-amber-600 outline-none focus:border-amber-500 transition" value={env.val1} onChange={e=>updateEnv('val1', e.target.value)} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1">Concepto 2 (Etiqueta)</label>
                    <input className="w-full mt-1 bg-white border border-zinc-200 px-4 py-2 rounded-xl text-xs font-bold outline-none focus:border-amber-500 transition" value={env.lbl2} onChange={e=>updateEnv('lbl2', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase ml-1">Valor 2</label>
                    <input className="w-full mt-1 bg-white border border-zinc-200 px-4 py-2 rounded-xl text-xs font-black text-zinc-600 outline-none focus:border-amber-500 transition" value={env.val2} onChange={e=>updateEnv('val2', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

// --- VISTA 3: CLIENTE (SIMULADOR CELULAR REAL CON GALERÍAS) ---
function VistaCliente() {
  const { id } = useParams();
  const [p, setP] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showIndex, setShowIndex] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProyecto = async () => {
      const { data } = await supabase.from('proyectos').select('*').eq('id', id).single();
      if (data) {
        setP(data);
        if (data.configuracion?.cantAmbientes > 1 && data.configuracion?.navegacion === 'index') {
          setShowIndex(true);
        }
      }
    };
    fetchProyecto();
  }, [id]);

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

  let totalSuma = 0;
  if (isMultiple) {
    totalSuma = p.ambientes.reduce((acc: number, curr: any) => acc + parsePrice(curr.total), 0);
  }

  const selectEnvFromIndex = (i: number) => {
    setActiveTab(i);
    setShowIndex(false);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex justify-center items-start md:py-10 font-sans">
      <div className="w-full max-w-md bg-white min-h-screen md:min-h-[90vh] md:rounded-[3rem] overflow-hidden flex flex-col shadow-[0_50px_100px_rgba(0,0,0,0.9)] relative">
        
        <div className={`bg-[#111111] pt-6 px-4 rounded-b-2xl z-20 flex flex-col shadow-lg transition-all ${(!isMultiple || showIndex) ? 'pb-4' : 'pb-0'}`}>
          <header className="flex justify-between items-center mb-4 px-2">
            <h1 className="font-black text-[26px] tracking-tighter italic text-white leading-none">STUDIO<span className="text-amber-500">.MUD</span></h1>
            <span className="text-[7px] bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-1 rounded-full uppercase tracking-widest font-bold">
              {isMultiple ? 'Proyecto Integral' : 'Diseño a Medida'}
            </span>
          </header>
          
          {isMultiple && !showIndex && c.navegacion === 'tabs' && (
            <div className="flex overflow-x-auto gap-1.5 items-end hide-scroll">
              {p.ambientes.map((a:any, i:number) => (
                <button key={i} onClick={() => setActiveTab(i)} className={`shrink-0 px-4 py-2 rounded-t-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === i ? 'bg-white text-zinc-900 shadow-sm' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                  {a.tab}
                </button>
              ))}
            </div>
          )}
        </div>

        {showIndex && (
          <div className="flex-1 bg-zinc-50 overflow-y-auto p-6 pt-10">
            <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-tight mb-2">Proyecto<br/>{p.cliente}</h2>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-8">Selecciona un ambiente</p>
            <div className="space-y-4">
              {p.ambientes.map((a:any, i:number) => {
                const fotosParaThumb = a.invertido ? (a.galeriaObra || [a.obra]) : (a.galeriaRender || [a.render]);
                const imgThumb = fotosParaThumb[0] || "";
                
                return (
                  <div key={i} onClick={() => selectEnvFromIndex(i)} className="bg-white rounded-3xl p-3 border border-zinc-200 shadow-sm flex items-center gap-4 cursor-pointer hover:border-amber-300 transition-colors group">
                    <div className="w-20 h-20 rounded-2xl bg-zinc-100 overflow-hidden shrink-0 ring-1 ring-black/5">
                      {imgThumb && <img src={imgThumb} className="w-full h-full object-cover object-center group-hover:scale-110 transition duration-500" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-lg text-zinc-900">{a.tab}</h3>
                      <p className="text-amber-600 font-bold text-xs mt-1">{c.moneda === 'ARS' ? '$' : 'USD'} {a.total}</p>
                    </div>
                    <ChevronRight size={20} className="text-zinc-300 group-hover:text-amber-500 mr-2 transition-colors" />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!showIndex && (
          <div className="flex-1 overflow-y-auto bg-white pb-32 hide-scroll scroll-smooth">
            
            {isMultiple && c.navegacion === 'index' && (
              <div className="px-4 pt-4 pb-2">
                <button onClick={() => setShowIndex(true)} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 hover:bg-zinc-100 px-4 py-2 rounded-full border border-zinc-200 transition">
                  <ArrowLeft size={14} strokeWidth={2.5}/> Volver al Menú
                </button>
              </div>
            )}

            <div className="relative aspect-[4/5] w-full mb-5 mt-2 px-2">
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
                  <span className="text-amber-500 font-black text-sm">{c.moneda === 'ARS' ? '$' : 'USD'}</span>
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
                  <span className="text-zinc-900 font-black text-lg">{c.moneda === 'ARS' ? '$' : 'USD'} {totalSuma.toLocaleString('es-AR')}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="absolute bottom-0 w-full p-4 bg-white/95 backdrop-blur-md border-t border-zinc-100 z-30">
          <a href={`https://wa.me/${p.whatsapp}?text=Hola! Estuve viendo la propuesta del proyecto y quiero avanzar.`} target="_blank" rel="noreferrer" className="w-full bg-[#25D366] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-transform">
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

// --- SUB-COMPONENTE: SLIDER MÁGICO CON SOPORTE PARA GALERÍAS CORREGIDO ---
function SliderAntesDespues({ env, activeTab }: { env: any, activeTab: number }) {
  const [val, setVal] = useState(50);
  const [anim, setAnim] = useState('');
  const [idxIzq, setIdxIzq] = useState(0);
  const [idxDer, setIdxDer] = useState(0);

  useEffect(() => {
    setIdxIzq(0); setIdxDer(0);
    setAnim('transition-all duration-[450ms] cubic-bezier(0.25, 1, 0.5, 1)');
    setTimeout(() => setVal(70), 200);
    setTimeout(() => setVal(30), 650);
    setTimeout(() => setVal(50), 1100);
    setTimeout(() => setAnim(''), 1550);
  }, [activeTab]);

  const handleDrag = (e: any) => { setAnim(''); setVal(e.target.value); };
  const snap = (v: number) => { setAnim('transition-all duration-300 ease-out'); setVal(v); setTimeout(() => setAnim(''), 300); };

  let baseArrObra = env.galeriaObra || [];
  if (baseArrObra.length === 0 && env.obra) baseArrObra = [env.obra];
  let baseArrRender = env.galeriaRender || [];
  if (baseArrRender.length === 0 && env.render) baseArrRender = [env.render];

  const arrIzq = !env.invertido ? baseArrObra : baseArrRender;
  const arrDer = env.invertido ? baseArrObra : baseArrRender;

  const imgIzq = arrIzq[idxIzq] || "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800";
  const imgDer = arrDer[idxDer] || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800";

  const nextIzq = (e:any) => { e.stopPropagation(); setIdxIzq((i) => (i + 1) % arrIzq.length); };
  const prevIzq = (e:any) => { e.stopPropagation(); setIdxIzq((i) => (i - 1 + arrIzq.length) % arrIzq.length); };
  const nextDer = (e:any) => { e.stopPropagation(); setIdxDer((i) => (i + 1) % arrDer.length); };
  const prevDer = (e:any) => { e.stopPropagation(); setIdxDer((i) => (i - 1 + arrDer.length) % arrDer.length); };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-[2.5rem] shadow-md border-4 border-white ring-1 ring-black/5">
      
      {/* FONDO (Derecha) */}
      <div className="absolute inset-0 w-full h-full">
        <img src={imgDer} className="w-full h-full object-cover object-center" />
        {/* Bug 1 Corregido: z-30 para las flechas */}
        {arrDer.length > 1 && (
          <div className="absolute inset-0 pointer-events-none z-30">
            <button onClick={prevDer} className="pointer-events-auto absolute right-12 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition"><ChevronLeft size={18}/></button>
            <button onClick={nextDer} className="pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition"><ChevronRight size={18}/></button>
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-[8px] text-white font-bold tracking-widest">{idxDer+1}/{arrDer.length}</div>
          </div>
        )}
      </div>
      
      {/* FRENTE (Izquierda, Recortado) */}
      <div className={`absolute top-0 left-0 h-full overflow-hidden ${anim}`} style={{ width: `${val}%` }}>
        <img src={imgIzq} className="absolute top-0 left-0 w-[100vw] h-full object-cover object-center max-w-none md:w-[400px]" />
        {/* Bug 1 Corregido: z-30 para las flechas */}
        {arrIzq.length > 1 && (
          <div className="absolute top-0 left-0 w-[100vw] h-full pointer-events-none md:w-[400px] z-30">
            <button onClick={prevIzq} className="pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition"><ChevronLeft size={18}/></button>
            <button onClick={nextIzq} className="pointer-events-auto absolute left-12 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition"><ChevronRight size={18}/></button>
            <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-[8px] text-white font-bold tracking-widest">{idxIzq+1}/{arrIzq.length}</div>
          </div>
        )}
      </div>
      
      {/* MANIJA DEL SLIDER */}
      <div className={`absolute top-0 bottom-0 w-[3px] bg-white z-10 -translate-x-1/2 shadow-[0_0_15px_rgba(0,0,0,0.5)] ${anim} pointer-events-none`} style={{ left: `${val}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-10 bg-white rounded-md shadow-md flex items-center justify-center gap-1">
          <div className="w-0.5 h-4 bg-zinc-300 rounded-full"></div>
          <div className="w-0.5 h-4 bg-zinc-300 rounded-full"></div>
        </div>
      </div>
      
      <input type="range" min="0" max="100" value={val} onChange={handleDrag} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20" />

      {/* PÍLDORA DE BOTONES */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex bg-white/95 backdrop-blur-md p-1 rounded-full shadow-xl border border-zinc-200 z-30 pointer-events-auto">
        <button onClick={()=>snap(100)} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${val > 65 ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900'}`}>{env.lblIzq || 'Antes'}</button>
        <button onClick={()=>snap(0)} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${val < 35 ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900'}`}>{env.lblDer || 'Render'}</button>
      </div>
    </div>
  );
}