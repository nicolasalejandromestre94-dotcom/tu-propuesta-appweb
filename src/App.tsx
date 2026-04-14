import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, MessageCircle, Edit3, Eye, EyeOff, Image as ImageIcon, 
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

// Función auxiliar para parsear y sumar precios
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
        <Route path="/admin/analytics/:id" element={session ? <AdminAnalytics /> : <Login />} />
        <Route path="/ver/:id" element={<VistaCliente />} />
      </Routes>
    </BrowserRouter>
  );
}

// --- VISTA 0: LOGIN ---
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verPass, setVerPass] = useState(false);
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
            <div className="relative">
              <input type={verPass ? "text" : "password"} required className="w-full bg-zinc-50 border-none p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-500 pr-12" value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button" onClick={() => setVerPass(!verPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">
                {verPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
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
            <Link to={`/admin/analytics/${id}`} className="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md hover:bg-zinc-800 transition">
           <Eye size={14}/> Analíticas
         </Link>
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

// =====================================================================
// 🕵️ MOTOR ESPÍA v3.0 (TIEMPO DE PERMANENCIA Y REAL-TIME)
// =====================================================================
function useAnalytics(proyectoId: string, ambienteTab: string) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const maxScroll = useRef(0);
  const sliderMovs = useRef(0);
  const clickTimes = useRef<number[]>([]);
  const contextoCache = useRef<any>(null);

  // Cronómetros para cada zona
  const dwellTimes = useRef<{ [key: string]: number }>({ Z1: 0, Z2: 0, Z3: 0 });
  const entryTimes = useRef<{ [key: string]: number }>({ Z1: 0, Z2: 0, Z3: 0 });

  const buildContext = async () => {
    if (contextoCache.current) return contextoCache.current;
    let bat = "-"; let net = "Wi-Fi"; let geoStr = "Local";
    try {
      if ('getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        bat = `${Math.round(battery.level * 100)}%`;
      }
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        net = conn.effectiveType ? conn.effectiveType.toUpperCase() : "Wi-Fi";
      }
      const res = await fetch('https://ipapi.co/json/');
      const geoData = await res.json();
      if (geoData.city) geoStr = `${geoData.city}, ${geoData.region_code}`;
    } catch (e) { console.warn("Sensores avanzados bloqueados."); }

    contextoCache.current = {
      userAgent: navigator.userAgent,
      pantalla: `${window.innerWidth}x${window.innerHeight}`,
      idioma: navigator.language,
      plataforma: navigator.platform,
      bateria: bat,
      red: net,
      geo: geoStr
    };
    return contextoCache.current;
  };

  const logEvent = async (tipo: string, detalle = {}) => {
    if (!proyectoId) return;
    try {
      const ctx = await buildContext();
      await supabase.from('eventos_analitica').insert([{
        proyecto_id: proyectoId,
        sesion_id: sessionId,
        tipo: tipo,
        detalle: { ...detalle, ambiente: ambienteTab },
        contexto: ctx
      }]);
    } catch(e) { console.error('Error silencioso', e); }
  };

  useEffect(() => {
    logEvent('SESSION_START', { url: window.location.href });
    
    // SENSOR DE PERMANENCIA
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const zona = entry.target.getAttribute('data-zona');
        if (!zona) return;
        if (entry.isIntersecting) {
          entryTimes.current[zona] = Date.now();
        } else if (entryTimes.current[zona] > 0) {
          dwellTimes.current[zona] += Date.now() - entryTimes.current[zona];
          entryTimes.current[zona] = 0;
        }
      });
    }, { threshold: 0.6 }); 

    setTimeout(() => {
      ['Z1', 'Z2', 'Z3'].forEach(z => {
        const el = document.getElementById(`sensor-${z}`);
        if (el) observer.observe(el);
      });
    }, 1000);

    const handleGlobalScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      if (max > 0) {
        const pct = Math.round(((doc.scrollTop || document.body.scrollTop) / max) * 100);
        if (pct > maxScroll.current) maxScroll.current = pct;
      }
    };
    window.addEventListener('scroll', handleGlobalScroll);

    const handleUnload = () => {
      ['Z1', 'Z2', 'Z3'].forEach(z => {
        if (entryTimes.current[z] > 0) dwellTimes.current[z] += Date.now() - entryTimes.current[z];
      });
      logEvent('SESSION_END', { scroll_max: maxScroll.current, slider_total: sliderMovs.current, tiempos: dwellTimes.current });
    };
    
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('scroll', handleGlobalScroll);
      observer.disconnect();
      handleUnload();
    }
  }, [proyectoId, ambienteTab]);

  const trackClick = (zona: string, e: React.MouseEvent, materialNombre?: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    logEvent('CLICK_ZONA', { zona, x, y, material: materialNombre });
    const now = Date.now();
    clickTimes.current.push(now);
    if (clickTimes.current.length > 3) clickTimes.current.shift();
    if (clickTimes.current.length === 3 && (now - clickTimes.current[0] < 1500)) {
       logEvent('FRICCION', { zona, mensaje: "Rage click detectado" });
       clickTimes.current = [];
    }
  };

  const trackScroll = (e: any) => {
    const el = e.target;
    const max = el.scrollHeight - el.clientHeight;
    if (max > 0) {
      const pct = Math.round((el.scrollTop / max) * 100);
      if (pct > maxScroll.current) maxScroll.current = pct;
    }
  };

  const trackSliderMove = () => { sliderMovs.current++; };

  return { trackClick, trackScroll, trackSliderMove, logEvent };
}

// --- VISTA 3: CLIENTE (SIMULADOR CELULAR REAL CON GALERÍAS Y ESPÍA) ---
function VistaCliente() {
  const { id } = useParams();
  const [p, setP] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showIndex, setShowIndex] = useState(false);

  const { trackClick, trackScroll, trackSliderMove, logEvent } = useAnalytics(
    id || '', 
    p?.ambientes?.[activeTab]?.tab || 'Global'
  );

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
          <div onScroll={trackScroll} className="flex-1 overflow-y-auto bg-white pb-32 hide-scroll scroll-smooth relative">
            
            {isMultiple && c.navegacion === 'index' && (
              <div className="px-4 pt-4 pb-2">
                <button onClick={() => setShowIndex(true)} className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-50 hover:bg-zinc-100 px-4 py-2 rounded-full border border-zinc-200 transition">
                  <ArrowLeft size={14} strokeWidth={2.5}/> Volver al Menú
                </button>
              </div>
            )}

            {/* ZONA 1: RENDER Y SLIDER */}
            <div onClick={(e) => trackClick('Z1_RENDER', e)} id="sensor-Z1" data-zona="Z1" className ="relative aspect-[4/5] w-full mb-5 mt-2 px-2 cursor-default">
              <SliderAntesDespues env={env} activeTab={activeTab} onSliderMove={trackSliderMove} />
            </div>

            <div className="px-6 mb-6 reveal-elem opacity-0 translate-y-4 transition-all duration-500">
              <h2 className="text-3xl font-black text-zinc-900 leading-tight tracking-tighter italic">{env.titulo}</h2>
              <p className="text-zinc-500 font-medium text-xs mt-1">{p.cliente}</p>
            </div>

            <div className="px-6 space-y-3">
              {/* ZONA 2: PRECIO E INVERSIÓN */}
              <div onClick={(e) => trackClick('Z2_PRECIO', e)} id="sensor-Z2" data-zona="Z2" className="bg-[#1a1a1a] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden reveal-elem opacity-0 translate-y-4 transition-all duration-500 delay-100 cursor-default active:scale-[0.98]">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>
                <p className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.3em] mb-1">Costo de este Ambiente</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-amber-500 font-black text-sm">{c.moneda === 'ARS' ? '$' : 'USD'}</span>
                  <p className="text-4xl font-black tracking-tighter text-white pointer-events-none">{env.total}</p>
                </div>
                <div className="space-y-2 border-t border-zinc-800 pt-4 pointer-events-none">
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
                <div onClick={(e) => trackClick('Z2_PRECIO', e)} className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-2xl p-5 flex justify-between items-center shadow-sm reveal-elem opacity-0 translate-y-4 transition-all duration-500 delay-200">
                  <span className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em]">Total Proyecto</span>
                  <span className="text-zinc-900 font-black text-lg">{c.moneda === 'ARS' ? '$' : 'USD'} {totalSuma.toLocaleString('es-AR')}</span>
                </div>
              )}

              {/* INYECTAMOS LA NUEVA ZONA 3 (Alternativas) */}
              <Z3Alternativas trackClick={trackClick} />
            </div>
          </div>
        )}

        <div className="absolute bottom-0 w-full p-4 bg-white/95 backdrop-blur-md border-t border-zinc-100 z-30">
          <a 
            href={`https://wa.me/${p.whatsapp}?text=Hola! Estuve viendo la propuesta del proyecto y quiero avanzar.`} 
            target="_blank" 
            rel="noreferrer" 
            onClick={() => logEvent('WPP_CLICK', { action: 'Intento de Contacto' })}
            className="w-full bg-[#25D366] text-white py-4 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg shadow-green-500/20 hover:scale-[1.02] transition-transform"
          >
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

// --- SUB-COMPONENTE: SLIDER MÁGICO CON SENSOR ---
function SliderAntesDespues({ env, activeTab, onSliderMove }: { env: any, activeTab: number, onSliderMove: () => void }) {
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

  const handleDrag = (e: any) => { 
    setAnim(''); 
    setVal(e.target.value); 
    onSliderMove();
  };
  const snap = (v: number) => { 
    setAnim('transition-all duration-300 ease-out');
    setVal(v); 
    onSliderMove();
    setTimeout(() => setAnim(''), 300); 
  };

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
    <div className="relative w-full h-full overflow-hidden rounded-[2.5rem] shadow-md border-4 border-white ring-1 ring-black/5 cursor-default pointer-events-auto">
      
      {/* FONDO (Derecha) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <img src={imgDer} className="w-full h-full object-cover object-center" />
        {arrDer.length > 1 && (
          <div className="absolute inset-0 pointer-events-none z-30">
            <button onClick={prevDer} className="pointer-events-auto absolute right-12 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition"><ChevronLeft size={18}/></button>
            <button onClick={nextDer} className="pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/60 transition"><ChevronRight size={18}/></button>
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-2 py-1 rounded-md text-[8px] text-white font-bold tracking-widest">{idxDer+1}/{arrDer.length}</div>
          </div>
        )}
      </div>
      
      {/* FRENTE (Izquierda, Recortado) */}
      <div className={`absolute top-0 left-0 h-full overflow-hidden pointer-events-none ${anim}`} style={{ width: `${val}%` }}>
        <img src={imgIzq} className="absolute top-0 left-0 w-[100vw] h-full object-cover object-center max-w-none md:w-[400px]" />
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
        <button onClick={(e)=>{ e.stopPropagation(); snap(100); }} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${val > 65 ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900'}`}>{env.lblIzq || 'Antes'}</button>
        <button onClick={(e)=>{ e.stopPropagation(); snap(0); }} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${val < 35 ? 'bg-zinc-900 text-white shadow-md' : 'text-zinc-500 hover:text-zinc-900'}`}>{env.lblDer || 'Render'}</button>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTE: ZONA 3 (ALTERNATIVAS Y MATERIALES INTERACTIVOS) ---
function Z3Alternativas({ trackClick }: { trackClick: (zona: string, e: React.MouseEvent, material?: string) => void }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTooltip, setActiveTooltip] = useState<number | null>(null);

  const variantes = [
    {
      id: "v1", nombre: "Madera Natural",
      img: "https://images.unsplash.com/photo-1556910103-1c02745a872f?q=80&w=800",
      puntos: [
        { id: 1, x: 30, y: 50, material: "MDF Enchapado Roble", codigo: "ROB-450", color: "bg-amber-500", shadow: "shadow-amber-500/50" },
        { id: 2, x: 70, y: 65, material: "Mesada Silestone", codigo: "BLANCO-N", color: "bg-zinc-200", shadow: "shadow-white/50" }
      ]
    },
    {
      id: "v2", nombre: "Laca Oscura",
      img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=800",
      puntos: [
        { id: 3, x: 45, y: 55, material: "Laca Poliuretánica Negra", codigo: "LAK-900", color: "bg-zinc-800", shadow: "shadow-black/50" },
        { id: 4, x: 80, y: 40, material: "Herrajes Cobre", codigo: "CU-100", color: "bg-orange-400", shadow: "shadow-orange-500/50" }
      ]
    }
  ];

  const nextSlide = () => { setActiveSlide((i) => (i + 1) % variantes.length); setActiveTooltip(null); };
  const prevSlide = () => { setActiveSlide((i) => (i - 1 + variantes.length) % variantes.length); setActiveTooltip(null); };
  const varianteActual = variantes[activeSlide];

  return (
    <div id="sensor-Z3" data-zona="Z3" className="mt-6 mb-6 reveal-elem opacity-0 translate-y-4 transition-all duration-500 delay-300">
      <div className="px-2 mb-4">
        <h3 className="text-2xl font-black text-zinc-900 italic tracking-tight leading-none">Variantes y Materiales</h3>
        <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Toca los puntos para ver opciones</p>
      </div>

      <div className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden shadow-xl border-4 border-white ring-1 ring-black/5 bg-zinc-100">
        <img key={varianteActual.id} src={varianteActual.img} className="w-full h-full object-cover animate-in fade-in duration-500" alt="Variante" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

        {varianteActual.puntos.map((punto) => (
          <div key={punto.id} className="absolute z-20" style={{ top: `${punto.y}%`, left: `${punto.x}%`, transform: 'translate(-50%, -50%)' }}>
            <button onClick={(e) => { e.stopPropagation();
              setActiveTooltip(activeTooltip === punto.id ? null : punto.id); trackClick('Z3_DETALLES', e, punto.material);
            }} className={`relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg ring-2 ring-white transition-all hover:scale-110 active:scale-95 ${punto.color} ${punto.shadow}`}>
              <span className="absolute w-full h-full rounded-full animate-ping opacity-60 bg-white"></span>
              <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
            </button>

            {activeTooltip === punto.id && (
              <div className={`absolute left-1/2 -translate-x-1/2 w-48 bg-zinc-900/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl z-50 border border-zinc-700/50 animate-in fade-in zoom-in-95 duration-200 ${punto.y > 50 ? 'bottom-12 origin-bottom' : 'top-12 origin-top'}`}>
                <button onClick={(e) => { e.stopPropagation(); setActiveTooltip(null); }} className="absolute top-2 right-2 text-zinc-500 hover:text-white"><X size={14} /></button>
                <span className="block text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">Material</span>
                <span className="block text-sm font-bold text-white leading-tight">{punto.material}</span>
                <span className="inline-block mt-2 text-[9px] bg-amber-500/10 text-amber-500 px-2 py-1 rounded-md font-mono border border-amber-500/20">{punto.codigo}</span>
              </div>
            )}
          </div>
        ))}

        <div className="absolute bottom-6 left-0 w-full px-4 flex justify-between items-end pointer-events-none z-10">
          <button onClick={(e) => { e.stopPropagation(); prevSlide(); trackClick('Z3_SWIPE', e); }} className="pointer-events-auto w-10 h-10 bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:text-black transition-all active:scale-95"><ChevronLeft size={20}/></button>
          
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full pointer-events-auto flex flex-col items-center border border-white/10">
            <span className="text-[9px] text-white font-black uppercase tracking-widest">{varianteActual.nombre}</span>
            <div className="flex gap-1.5 mt-1.5">
              {variantes.map((_, idx) => (
                <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeSlide ? 'w-4 bg-amber-500' : 'w-1.5 bg-white/30'}`}></div>
              ))}
            </div>
          </div>

          <button onClick={(e) => { e.stopPropagation(); nextSlide(); trackClick('Z3_SWIPE', e); }} className="pointer-events-auto w-10 h-10 bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-white hover:text-black transition-all active:scale-95"><ChevronRight size={20}/></button>
        </div>
      </div>
      {activeTooltip && <div className="fixed inset-0 z-10" onClick={() => setActiveTooltip(null)}></div>}
    </div>
  );
}

// =====================================================================
// 📊 VISTA 4: CENTRO DE COMANDO (ANALYTICS v2.0 - NUEVA INTERFAZ)
// =====================================================================
function AdminAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [analytics, setAnalytics] = useState<any>(null);
  const [expandedUser, setExpandedUser] = useState<number | null>(0); 

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      const { data: proyecto } = await supabase.from('proyectos').select('*').eq('id', id).single();
      if (proyecto) setP(proyecto);

      const { data: eventos } = await supabase.from('eventos_analitica')
        .select('*')
        .eq('proyecto_id', id)
        .order('created_at', { ascending: true });

      if (eventos && proyecto) {
        procesarEventos(eventos, proyecto.ambientes[activeTab]?.tab || 'Global');
      }
    };

    fetchData();

    const channel = supabase
      .channel('cambios-analitica')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'eventos_analitica', filter: `proyecto_id=eq.${id}` }, 
      () => { fetchData(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id, activeTab]);

  const procesarEventos = (eventos: any[], ambienteActual: string) => {
    const evsAmbiente = eventos.filter((e: any) => e.detalle?.ambiente === ambienteActual || e.tipo === 'WPP_CLICK');
    const sesiones = [...new Set(evsAmbiente.map((e: any) => e.sesion_id))];

    const ends = evsAmbiente.filter((e: any) => e.tipo === 'SESSION_END');
    const maxScroll = ends.length ? Math.max(...ends.map((e: any) => e.detalle?.scroll_max || 0)) : 0;
    const totalSliders = ends.reduce((acc: number, curr: any) => acc + (curr.detalle?.slider_total || 0), 0);
    const friccionEvents = evsAmbiente.filter((e: any) => e.tipo === 'FRICCION').length;
    const clicks = evsAmbiente.filter((e: any) => e.tipo === 'CLICK_ZONA');
    
    const getDots = (zonaId: string, colorClass: string) => 
      clicks.filter((e: any) => e.detalle?.zona === zonaId).map((c: any) => ({ x: c.detalle.x, y: c.detalle.y, c: colorClass }));

    const dotsZ1 = getDots('Z1_RENDER', 'dot-orange');
    const dotsZ2 = getDots('Z2_PRECIO', 'dot-red');
    const dotsZ3 = getDots('Z3_DETALLES', 'dot-yellow');
    
    const materiales = clicks.filter((c:any) => c.detalle?.material).map((c:any) => c.detalle.material);
    const rankingMap = materiales.reduce((acc:any, curr:any) => ({...acc, [curr]: (acc[curr] || 0) + 1}), {});
    const rankingArray = Object.entries(rankingMap).map(([n, c]) => ({ n, c })).sort((a:any, b:any) => b.c - a.c);

    const dataCruda = evsAmbiente.slice(-30).map((e: any) => {
      const time = new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let txt = e.tipo; let color = "text-zinc-500";
      if (e.tipo === 'SESSION_START') { txt = `NEW_IP: ${e.contexto?.geo || 'Local'}`; color = "text-blue-400"; }
      if (e.tipo === 'CLICK_ZONA') { txt = `CLICK (${e.detalle?.zona?.replace('Z1_','')?.replace('Z2_','')?.replace('Z3_','')})`; color = "text-amber-400"; }
      if (e.tipo === 'WPP_CLICK') { txt = "INTENTO DE CONTACTO"; color = "text-green-400"; }
      if (e.tipo === 'FRICCION') { txt = "RAGE CLICK"; color = "text-red-400"; }
      return { time, txt, color };
    });

    const wppClicks = eventos.filter((e: any) => e.tipo === 'WPP_CLICK').length;

    const formatTime = (ms: number) => {
      if (!ms) return "00:00m";
      const totalSeconds = Math.floor(ms / 1000);
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}m`;
    };

    const totalTimes = ends.reduce((acc: any, curr: any) => {
      const t = curr.detalle?.tiempos || {};
      return { Z1: (acc.Z1 || 0) + (t.Z1 || 0), Z2: (acc.Z2 || 0) + (t.Z2 || 0), Z3: (acc.Z3 || 0) + (t.Z3 || 0) };
    }, { Z1: 0, Z2: 0, Z3: 0 });

    const granTotalMs = totalTimes.Z1 + totalTimes.Z2 + totalTimes.Z3;

    setAnalytics({
      scroll: `${maxScroll}%`,
      slider: totalSliders.toString(),
      friccion: friccionEvents.toString(),
      tiempoTotal: formatTime(granTotalMs),
      espectadores: sesiones.map((s, i) => {
        const evsDeSesion = evsAmbiente.filter((e: any) => e.sesion_id === s);
        const startEv = evsDeSesion.find((e: any) => e.tipo === 'SESSION_START');
        const ultimoEvento = evsDeSesion[evsDeSesion.length - 1];
        
        const horaUltimaActividad = ultimoEvento ? new Date(ultimoEvento.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
        const ctx = startEv?.contexto || {};
        
        return {
          id: s,
          rol: i === 0 ? "Titular" : `Visita #${i+1}`,
          disp: ctx.plataforma || "Web",
          geo: ctx.geo || "Desconocido",
          isp: ctx.red || "-", bat: ctx.bateria || "-",
          status: i === 0 ? "Online" : `Visto ${horaUltimaActividad}`,
          statusClass: i === 0 ? "text-green-600 bg-green-100" : "text-zinc-500 bg-zinc-100"
        };
      }),
      ranking: rankingArray,
      logs: dataCruda,
      wppEstado: wppClicks > 0 ? "Dudó en Comprar" : "Observación",
      wppDesc: wppClicks > 0 ? `Tocó 'Aprobar' ${wppClicks} veces pero cerró sin confirmar.` : "Aún no interactuó.",
      z1: { t: formatTime(totalTimes.Z1), c: dotsZ1.length, dots: dotsZ1 },
      z2: { t: formatTime(totalTimes.Z2), c: dotsZ2.length, dots: dotsZ2 },
      z3: { t: formatTime(totalTimes.Z3), c: dotsZ3.length, dots: dotsZ3 }
    });
  };

  if (!p || !analytics) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin text-amber-600 w-10 h-10" /></div>;

  const env = p.ambientes[activeTab] || {};
  
  const renderDots = (dots: any[]) => dots.map((d, i) => (
    <div key={i} className={`absolute rounded-full pointer-events-none mix-blend-screen -translate-x-1/2 -translate-y-1/2 ${d.c === 'dot-red' ? 'bg-[radial-gradient(circle,rgba(255,50,50,1)_0%,rgba(255,50,50,0)_70%)] w-14 h-14' : d.c === 'dot-orange' ? 'bg-[radial-gradient(circle,rgba(255,120,0,0.9)_0%,rgba(255,120,0,0)_70%)] w-11 h-11' : 'bg-[radial-gradient(circle,rgba(255,200,0,0.8)_0%,rgba(255,200,0,0)_70%)] w-10 h-10'}`} style={{ left: `${d.x}%`, top: `${d.y}%` }} />
  ));

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-4 md:p-8 bg-zinc-50 font-sans">
      <div className="w-full max-w-[1400px] mb-8 flex justify-between items-end border-b border-zinc-200 pb-4">
        <div>
          <button onClick={() => navigate(`/admin/editar/${id}`)} className="text-zinc-400 hover:text-zinc-900 font-black text-[10px] uppercase tracking-widest mb-2"><ArrowLeft size={14} className="inline mr-1"/> Volver al Editor</button>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tighter italic leading-none">STUDIO<span className="text-amber-600">.MUD</span></h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Centro de Comando Analítico</p>
        </div>
      </div>

      <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLUMNA 1: CELULAR (Ahora con Z3) */}
        <div className="lg:col-span-4 flex flex-col h-[850px]">
          <div className="w-full h-full bg-white border-[10px] border-zinc-900 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col">
            <div className="bg-[#111111] pt-10 pb-0 px-5 relative z-50 flex flex-col">
              <div className="mb-6">
                <h1 className="font-black text-2xl text-white leading-none tracking-tight">{p.cliente}</h1>
                <p className="text-[9px] text-amber-500 uppercase tracking-widest font-bold mt-2">Análisis Visual en vivo</p>
              </div>
              <div className="flex overflow-x-auto gap-2 items-end hide-scroll">
                {p.ambientes.map((a:any, i:number) => (
                  <button key={i} onClick={() => setActiveTab(i)} className={`shrink-0 px-5 py-3 rounded-t-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === i ? 'bg-white text-zinc-900' : 'bg-zinc-800 text-zinc-400'}`}>{a.tab || `Amb 1`}</button>
                ))}
              </div>
            </div>

            <div className="flex-1 bg-zinc-50 relative hide-scroll overflow-y-auto pb-10">
              <div className="relative w-full h-[380px] mb-6">
                <div className="absolute inset-0 bg-zinc-100 rounded-b-[2rem] overflow-hidden"><img src={env.obra || env.galeriaObra?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c'} className="w-full h-full object-cover" /></div>
                <div className="absolute inset-0 z-40 pointer-events-none bg-black/40 backdrop-blur-[1px] rounded-b-[2rem]">
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md rounded-xl p-3 shadow-2xl border-l-2 border-blue-500">
                    <span className="text-[8px] font-black uppercase text-blue-400 tracking-widest mb-1 block">Z1: Render</span>
                    <div className="flex items-baseline gap-2"><span className="text-base font-black text-white">{analytics.z1.t}</span><span className="text-[10px] font-bold text-zinc-400">• {analytics.z1.c} clics</span></div>
                  </div>
                  {renderDots(analytics.z1.dots)}
                </div>
              </div>
              
              <div className="px-6 mb-6 relative">
                <div className="bg-[#1a1a1a] rounded-[2rem] p-6 opacity-40"><p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest mb-2">Inversión Total</p><p className="text-4xl font-black text-white">{env.total}</p></div>
                <div className="absolute inset-0 z-40 mx-6 pointer-events-none bg-black/40 backdrop-blur-[1px] rounded-[2rem]">
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md rounded-xl p-3 shadow-2xl border-l-2 border-red-500">
                    <span className="text-[8px] font-black uppercase text-red-400 tracking-widest mb-1 block">Z2: Precio</span>
                    <div className="flex items-baseline gap-2"><span className="text-base font-black text-white">{analytics.z2.t}</span><span className="text-[10px] font-bold text-zinc-400">• {analytics.z2.c} clics</span></div>
                  </div>
                  {renderDots(analytics.z2.dots)}
                </div>
              </div>

              {/* Caja Z3 en el panel */}
              <div className="px-6 mb-6 relative">
                <div className="bg-[#1a1a1a] rounded-[2rem] p-6 opacity-40 h-24"></div>
                <div className="absolute inset-0 z-40 mx-6 pointer-events-none bg-black/40 backdrop-blur-[1px] rounded-[2rem]">
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md rounded-xl p-3 shadow-2xl border-l-2 border-yellow-500">
                    <span className="text-[8px] font-black uppercase text-yellow-400 tracking-widest mb-1 block">Z3: Detalles</span>
                    <div className="flex items-baseline gap-2"><span className="text-base font-black text-white">{analytics.z3.t}</span><span className="text-[10px] font-bold text-zinc-400">• {analytics.z3.c} clics</span></div>
                  </div>
                  {renderDots(analytics.z3.dots)}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* COLUMNA 2: KPIS Y ACORDEÓN */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:h-[850px] overflow-y-auto hide-scroll pb-10">
          <div className="grid grid-cols-4 gap-3 shrink-0">
            <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm flex flex-col justify-center"><p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total</p><span className="text-xl font-black text-indigo-500">{analytics.tiempoTotal}</span></div>
            <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm flex flex-col justify-center"><p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">Scroll</p><span className="text-xl font-black text-emerald-500">{analytics.scroll}</span></div>
            <div className="bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm flex flex-col justify-center"><p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">Slider</p><span className="text-xl font-black text-blue-600">{analytics.slider}<span className="text-[10px] text-blue-400 ml-1">mv</span></span></div>
            <div className="bg-red-50 p-4 rounded-3xl border border-red-100 flex flex-col justify-center"><p className="text-[8px] font-black uppercase tracking-widest text-red-500 mb-1">Rage</p><span className="text-xl font-black text-red-600">{analytics.friccion}</span></div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm relative shrink-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Espectadores Detectados</h2>
              <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-amber-700">{analytics.espectadores.length} IPs Activas</div>
            </div>
            
            {/* EL ACORDEÓN */}
            <div className="space-y-2">
              {analytics.espectadores.map((e:any, idx:number) => {
                const isExpanded = expandedUser === idx;
                return (
                  <div key={idx} className="bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden transition-all">
                    <div onClick={() => setExpandedUser(isExpanded ? null : idx)} className="p-4 flex justify-between items-center cursor-pointer hover:bg-zinc-100">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-white border border-zinc-200 rounded-lg text-xs font-black text-zinc-500 flex items-center justify-center">{idx + 1}</div>
                        <span className="text-sm font-black text-zinc-900">{e.rol}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-md border ${e.statusClass}`}>{e.status}</span>
                        <ChevronRight size={16} className={`text-zinc-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                    
                    {/* CONTENIDO DESPLEGABLE */}
                    {isExpanded && (
                      <div className="p-4 pt-0 border-t border-zinc-200/50 bg-white grid grid-cols-2 gap-4 mt-2">
                        <div><span className="text-[8px] font-black text-zinc-400 block uppercase tracking-widest mb-1">Dispositivo</span><span className="text-xs font-bold text-zinc-800">{e.disp}</span></div>
                        <div><span className="text-[8px] font-black text-zinc-400 block uppercase tracking-widest mb-1">Ubicación</span><span className="text-xs font-bold text-zinc-800">{e.geo}</span></div>
                        <div><span className="text-[8px] font-black text-zinc-400 block uppercase tracking-widest mb-1">Red & ISP</span><span className="text-xs font-bold text-zinc-800">{e.isp}</span></div>
                        <div><span className="text-[8px] font-black text-zinc-400 block uppercase tracking-widest mb-1">Batería</span><span className="text-xs font-bold text-zinc-800">{e.bat}</span></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[2.5rem] border border-zinc-200 shadow-sm shrink-0">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6">Ranking Materiales</h2>
            <div className="space-y-2">
              {analytics.ranking.length > 0 ? analytics.ranking.map((r:any, i:number) => (
                <div key={i} className={`flex justify-between items-center p-3 rounded-xl ${i === 0 ? 'bg-amber-50 border border-amber-200' : 'bg-zinc-50 border border-zinc-100'}`}>
                  <div className="flex items-center gap-3"><span className="text-lg">{i === 0 ? '🏆' : <span className="text-xs text-zinc-400 font-black px-1">{i+1}º</span>}</span><span className="text-sm font-bold text-zinc-900">{r.n}</span></div>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md ${i === 0 ? 'bg-amber-200 text-amber-800' : 'bg-zinc-200 text-zinc-600'}`}>{r.c} clics</span>
                </div>
              )) : <div className="text-center p-4 text-xs text-zinc-500 font-bold uppercase tracking-widest">Sin datos aún</div>}
            </div>
          </div>

          <div className="bg-[#111111] p-6 rounded-[2.5rem] border border-zinc-800 shrink-0">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Acción Final (Embudo)</h2>
            <p className="text-xl font-black text-amber-500 leading-none mb-2">{analytics.wppEstado}</p>
            <p className="text-[10px] font-bold text-zinc-400 leading-relaxed">{analytics.wppDesc}</p>
          </div>
        </div>

        {/* COLUMNA 3: IA Y DATA CRUDA */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:h-[850px]">
          <div className="bg-[#1C1A3B] rounded-[3rem] p-8 shadow-2xl border border-indigo-900/50 relative overflow-hidden flex flex-col shrink-0">
            <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"><CheckCircle2 size={24} strokeWidth={2.5}/></div>
                <div><h3 className="text-base font-black text-white uppercase tracking-widest leading-none mb-1">Asistente IA</h3><p className="text-[9px] text-indigo-300 uppercase tracking-widest font-bold">Estrategia de Ventas</p></div>
            </div>
            <div className="space-y-6 relative z-10">
                <div><span className="bg-indigo-900/40 border border-indigo-700/50 text-indigo-200 text-[10px] font-black tracking-widest uppercase px-4 py-2 rounded-xl inline-block">Analítico / Fricción Precio</span></div>
                <div><p className="text-sm text-indigo-100/90 leading-relaxed font-medium">Se detectó Alta Viralidad ({analytics.espectadores.length} espectadores). El titular interactuó extensamente con el slider y evaluó los detalles. La Acción Final indica intención de compra trabada por costo.</p></div>
                <div className="bg-[#0D1D20] border border-emerald-900/50 p-6 rounded-2xl mt-4"><span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-3">Acción Sugerida</span><p className="text-xs text-emerald-100/80 font-medium leading-relaxed">Toma la iniciativa. Ofréceles un plan de financiación para destrabar el cierre.</p></div>
            </div>
          </div>

          <div className="bg-[#0A0A0A] rounded-[3rem] p-8 shadow-2xl border border-zinc-800 flex-1 flex flex-col overflow-hidden min-h-[300px]">
             <div className="flex items-center gap-2 mb-6"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div><h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Data Cruda (En Vivo)</h3></div>
             <div className="flex-1 overflow-y-auto hide-scroll space-y-2 font-mono text-[10px]">
                {analytics.logs.length > 0 ? analytics.logs.map((log:any, i:number) => (
                  <div key={i} className="flex gap-3"><span className="text-zinc-600 shrink-0">[{log.time}]</span><span className={`${log.color} break-words`}>{log.txt}</span></div>
                )) : <div className="text-zinc-600 italic">Esperando eventos...</div>}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}