import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, MessageCircle, Edit3, Eye, EyeOff, Image as ImageIcon, 
  DollarSign, Plus, ArrowLeft, Trash2, Loader2, Link as LinkIcon, Check, Upload, 
  LogOut, Lock, ArrowLeftRight, ChevronRight, ChevronLeft, X,
  Activity, Play, Monitor, Link2, UploadCloud, Settings, LayoutDashboard,
  Smartphone, MapPin, Wifi, BatteryMedium, Cpu, Zap, Sun, Moon, CalendarDays, RefreshCw, Info, Share2, Layers, Trophy, Heart, MessageSquarePlus, ThumbsUp, Maximize
} from 'lucide-react';
import { BrowserRouter, Routes, Route, useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

// =====================================================================
// 🚨 LLAVES DE SUPABASE
// =====================================================================
const supabaseUrl = 'https://pdyqdbmvhmqnzgoxtjfw.supabase.co';
const supabaseKey = 'sb_publishable_0JMVVW3e4hHqPYR2gXCR-g_XWI7MoSg';
const supabase = createClient(supabaseUrl, supabaseKey);

const CLARITY_PROJECT_ID = "wb6kh8g7tb"; 

const parsePrice = (str: string) => {
  if (!str) return 0;
  const cleaned = str.toString().replace(/[^0-9]/g, '');
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? 0 : parsed;
};

// Función global para Wpp Genérico (con truco anti-caché ?v=1)
const handleShareWpp = (id: string, e?: React.MouseEvent) => {
  if (e) e.stopPropagation();
  const url = `${window.location.origin}/ver/${id}?v=${Math.floor(Math.random() * 100)}`;
  const text = `¡Hola! Aquí tienes tu propuesta de diseño interactiva de STUDIO.MUD: \n\n${url}`;
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
};

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
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
              <button type="button" onClick={() => setVerPass(!verPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600">{verPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
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

// --- VISTA 1: DASHBOARD ---
function AdminDashboard() {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [copiedStates, setCopiedStates] = useState<any>({});
  const navigate = useNavigate();

  const fetchProyectos = async () => {
    const { data } = await supabase.from('proyectos').select('*').order('created_at', { ascending: false });
    if (data) setProyectos(data);
    setCargando(false);
  };

  useEffect(() => { fetchProyectos(); }, []);

  const nuevoProyecto = async () => {
    const ambienteInicial = {
      id: crypto.randomUUID(), tab: "Ambiente 1", titulo: "Cocina Principal",
      z3Title: "Variantes de Material", z3Subtitle: "Toca los puntos para detalles",
      galeriaObra: [], galeriaRender: [], lblIzq: "Antes", lblDer: "Render 3D", invertido: false, total: "0",
      items: [
        { id: crypto.randomUUID(), lbl: 'Materiales', val: 'USD 0', incluido: true },
        { id: crypto.randomUUID(), lbl: 'Diseño y Montaje', val: 'USD 0', incluido: true }
      ],
      variantes: [] 
    };
    const { data, error } = await supabase.from('proyectos').insert([{
      cliente: "Nuevo Cliente", whatsapp: "549",
      configuracion: { moneda: "USD", navegacion: "tabs", cantAmbientes: 1 },
      ambientes: [ambienteInicial]
    }]).select();
    if (data && data[0]) navigate(`/admin/editar/${data[0].id}`);
    if (error) alert("Error: " + error.message);
  };

  const handleCopy = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/ver/${id}?v=${Math.floor(Math.random() * 100)}`;
    navigator.clipboard.writeText(url);
    setCopiedStates({ ...copiedStates, [id]: true });
    setTimeout(() => setCopiedStates({ ...copiedStates, [id]: false }), 2000);
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin text-amber-600 w-10 h-10" /></div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12 font-sans text-zinc-900 animate-in fade-in duration-500">
      <div className="max-w-[1200px] mx-auto">
        <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-black tracking-tighter italic leading-none">STUDIO<span className="text-amber-600">.MUD</span></h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Gestor de Proyectos</p>
          </div>
          <div className="flex gap-3">
            <button onClick={nuevoProyecto} className="bg-zinc-900 text-white px-5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-zinc-800 shadow-xl shadow-zinc-900/20 transition-all active:scale-95">
              <Plus size={16} /> Nuevo Proyecto
            </button>
            <button onClick={() => supabase.auth.signOut()} className="bg-white border border-zinc-200 text-zinc-600 px-4 py-3 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {proyectos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-zinc-200 shadow-sm"><p className="text-zinc-400 font-bold">Aún no hay proyectos. ¡Creá tu primera carpeta!</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {proyectos.map(p => {
              const primerEnv = p.ambientes?.[0] || {};
              const thumbObra = primerEnv.galeriaObra?.[0] || primerEnv.obra || "";
              const thumbRender = primerEnv.galeriaRender?.[0] || primerEnv.render || "";
              const thumb = thumbRender || thumbObra || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800"; 
              
              return (
                <div key={p.id} className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-200 overflow-hidden hover:shadow-2xl hover:border-amber-300 transition-all duration-500 group flex flex-col">
                  <div onClick={() => window.open(`/ver/${p.id}`, '_blank')} className="h-56 bg-zinc-100 relative cursor-pointer overflow-hidden">
                    <img src={thumb} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-lg scale-110" alt="blur-bg"/>
                    <img src={thumb} className="absolute inset-0 w-full h-full object-contain z-10 group-hover:scale-105 transition-transform duration-700" alt="Vista" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px] z-20">
                      <div className="bg-white text-zinc-900 px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <Play size={14} fill="currentColor"/> Ver Propuesta
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-black text-2xl leading-tight tracking-tight text-zinc-900 truncate">{p.cliente}</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1 mb-4 truncate">{primerEnv.titulo || "Sin título"}</p>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-1.5 pt-4 border-t border-zinc-100">
                      <button onClick={() => navigate(`/admin/editar/${p.id}`)} className="flex flex-col items-center justify-center gap-1 py-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-colors">
                        <Edit3 size={14}/> <span className="text-[6px] font-black uppercase tracking-widest">Editar</span>
                      </button>
                      <button onClick={() => navigate(`/admin/analytics/${p.id}`)} className="flex flex-col items-center justify-center gap-1 py-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 bg-amber-50/50 rounded-xl transition-colors border border-amber-100">
                        <Activity size={14}/> <span className="text-[6px] font-black uppercase tracking-widest">Stats</span>
                      </button>
                      <button onClick={(e) => handleShareWpp(p.id, e)} className="flex flex-col items-center justify-center gap-1 py-2 text-[#25D366] hover:text-white hover:bg-[#25D366] bg-[#25D366]/10 rounded-xl transition-colors border border-[#25D366]/20">
                        <MessageCircle size={14}/> <span className="text-[6px] font-black uppercase tracking-widest">Wpp</span>
                      </button>
                      <button onClick={(e) => handleCopy(p.id, e)} className="flex flex-col items-center justify-center gap-1 py-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors relative">
                        {copiedStates[p.id] ? <Check size={14} className="text-green-500"/> : <Link2 size={14}/>}
                        <span className={`text-[6px] font-black uppercase tracking-widest ${copiedStates[p.id] ? 'text-green-500' : ''}`}>{copiedStates[p.id] ? 'OK' : 'Link'}</span>
                      </button>
                      <button onClick={() => { if(window.confirm('¿Borrar carpeta?')) supabase.from('proyectos').delete().eq('id', p.id).then(fetchProyectos); }} className="flex flex-col items-center justify-center gap-1 py-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={14}/> <span className="text-[6px] font-black uppercase tracking-widest">Borrar</span>
                      </button>
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

// --- VISTA 2: EDITOR MULTI-AMBIENTE Y Z3 ---
function AdminEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [activeVarTab, setActiveVarTab] = useState(0); 
  const [subiendo, setSubiendo] = useState({ obra: false, render: false, variante: false });
  const [copiedStates, setCopiedStates] = useState<any>({});
  
  const z3CanvasRef = useRef<HTMLDivElement>(null);
  const [editingPoint, setEditingPoint] = useState<string | null>(null);

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

  const handleCopy = () => {
    const url = `${window.location.origin}/ver/${id}?v=${Math.floor(Math.random() * 100)}`;
    navigator.clipboard.writeText(url);
    setCopiedStates({ editorLink: true });
    setTimeout(() => setCopiedStates({ editorLink: false }), 2000);
  };

  const addAmbiente = () => {
    const nuevo = {
      id: crypto.randomUUID(), tab: `Ambiente ${p.ambientes.length + 1}`, titulo: "Nuevo Ambiente",
      z3Title: "Variantes de Material", z3Subtitle: "Toca los puntos para detalles",
      galeriaObra: [], galeriaRender: [], lblIzq: "Antes", lblDer: "Render 3D", invertido: false, total: "0",
      items: [
        { id: crypto.randomUUID(), lbl: 'Materiales', val: '0', incluido: true },
        { id: crypto.randomUUID(), lbl: 'Diseño y Montaje', val: '0', incluido: true }
      ],
      variantes: []
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

  const handleFileUpload = async (e: any, tipo: 'obra' | 'render' | 'variante') => {
    const files = Array.from(e.target.files as FileList);
    if (!files.length) return;
    setSubiendo(prev => ({ ...prev, [tipo]: true }));
    const file = files[0]; 
    const ext = file.name.split('.').pop();
    const fileName = `${id}_${activeTab}_${tipo}_${Math.random()}.${ext}`;
    
    try {
      const { error } = await supabase.storage.from('proyectos').upload(fileName, file);
      if (!error) {
        const { data } = supabase.storage.from('proyectos').getPublicUrl(fileName);
        
        if (tipo === 'obra' || tipo === 'render') {
          const arrName = tipo === 'obra' ? 'galeriaObra' : 'galeriaRender';
          let currentArr = p.ambientes[activeTab][arrName] || [];
          updateEnv(arrName, [...currentArr, data.publicUrl]);
        } else if (tipo === 'variante') {
           const vars = p.ambientes[activeTab].variantes || [];
           if (vars[activeVarTab]) {
              const newVars = [...vars];
              newVars[activeVarTab].img = data.publicUrl;
              updateEnv('variantes', newVars);
           }
        }
      }
    } catch (err) { console.error("Error", err); }
    
    setSubiendo(prev => ({ ...prev, [tipo]: false }));
  };

  const handleAddVariante = () => {
    const envAt = p.ambientes[activeTab];
    const vars = envAt.variantes || [];
    const nueva = { id: crypto.randomUUID(), nombre: `Opción ${vars.length + 1}`, img: '', puntos: [] };
    updateEnv('variantes', [...vars, nueva]);
    setActiveVarTab(vars.length);
  };

  const handleRemoveVariante = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar variante?")) return;
    const envAt = p.ambientes[activeTab];
    const vars = envAt.variantes || [];
    const newVars = vars.filter((_:any, i:number) => i !== idx);
    updateEnv('variantes', newVars);
    setActiveVarTab(0);
  };

  const updateVarianteName = (val: string) => {
    const vars = [...(p.ambientes[activeTab].variantes || [])];
    if (vars[activeVarTab]) {
      vars[activeVarTab].nombre = val;
      updateEnv('variantes', vars);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (editingPoint || !z3CanvasRef.current) return;
    const envAt = p.ambientes[activeTab];
    const vars = envAt.variantes || [];
    const varActual = vars[activeVarTab];
    if (!varActual || !varActual.img) return;

    const rect = z3CanvasRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newPuntoId = crypto.randomUUID();
    const nuevoPunto = { id: newPuntoId, x, y, material: 'Nuevo Material' };
    
    const newVars = [...vars];
    newVars[activeVarTab].puntos = [...(varActual.puntos || []), nuevoPunto];
    updateEnv('variantes', newVars);
    setEditingPoint(newPuntoId); 
  };

  const updatePuntoMaterial = (puntoId: string, val: string) => {
    const vars = [...(p.ambientes[activeTab].variantes || [])];
    const varActual = vars[activeVarTab];
    if (varActual) {
      varActual.puntos = varActual.puntos.map((pt:any) => pt.id === puntoId ? { ...pt, material: val } : pt);
      updateEnv('variantes', vars);
    }
  };

  const removePunto = (puntoId: string) => {
    const vars = [...(p.ambientes[activeTab].variantes || [])];
    const varActual = vars[activeVarTab];
    if (varActual) {
      varActual.puntos = varActual.puntos.filter((pt:any) => pt.id !== puntoId);
      updateEnv('variantes', vars);
      setEditingPoint(null);
    }
  };

  const handleAddItem = () => {
    const envAt = p.ambientes[activeTab];
    const itemsActuales = envAt.items || [
      { id: crypto.randomUUID(), lbl: 'Materiales', val: '0', incluido: true },
      { id: crypto.randomUUID(), lbl: 'Diseño', val: '0', incluido: true }
    ];
    updateEnv('items', [...itemsActuales, { id: crypto.randomUUID(), lbl: 'Nuevo Ítem', val: '0', incluido: false }]);
  };

  const updateItem = (itemId: string, key: string, value: any) => {
    const itemsActuales = p.ambientes[activeTab].items || [];
    const nuevos = itemsActuales.map((it:any) => it.id === itemId ? { ...it, [key]: value } : it);
    updateEnv('items', nuevos);
  };

  const deleteItem = (itemId: string) => {
    const itemsActuales = p.ambientes[activeTab].items || [];
    updateEnv('items', itemsActuales.filter((it:any) => it.id !== itemId));
  };

  if (!p) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin text-amber-600 w-10 h-10" /></div>;

  const env = p.ambientes[activeTab] || {};
  const c = p.configuracion;
  const currentItems = env.items || [];
  const variantes = env.variantes || [];
  const varActual = variantes[activeVarTab];

  const renderDropzone = (tipo: 'obra' | 'render') => {
    const isObra = tipo === 'obra';
    const field = isObra ? 'galeriaObra' : 'galeriaRender';
    let fotos = env[field] || [];
    if(fotos.length === 0 && env[tipo]) fotos = [env[tipo]]; 

    const isFrente = (!env.invertido && isObra) || (env.invertido && !isObra);

    return (
      <div className="bg-white border-2 border-zinc-200 rounded-3xl p-4 flex flex-col min-h-[160px] shadow-sm">
        <div className="flex justify-between items-center mb-3 border-b border-zinc-100 pb-2">
          <span className={`text-[9px] font-black uppercase tracking-widest ${isFrente ? 'text-zinc-500' : 'text-amber-600'}`}>{isObra ? 'Fotos Obra' : 'Render 3D'} {isFrente ? '(Izq)' : '(Der)'}</span>
          <label className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition cursor-pointer flex items-center">
            {subiendo[tipo] ? <Loader2 size={10} className="animate-spin mr-1"/> : '+ Añadir'}
            <input type="file" multiple className="hidden" accept="image/*" onChange={e => handleFileUpload(e, tipo)} />
          </label>
        </div>
        {fotos.length === 0 ? (
          <label className="flex-1 flex flex-col items-center justify-center opacity-40 hover:opacity-100 cursor-pointer transition border-2 border-dashed rounded-xl border-zinc-200">
             <UploadCloud size={20} className="mb-1"/><span className="text-[9px] font-bold">Subir imágenes</span>
             <input type="file" multiple className="hidden" accept="image/*" onChange={e => handleFileUpload(e, tipo)} />
          </label>
        ) : (
          <div className="flex flex-wrap gap-2">
            {fotos.map((url:string, i:number) => (
              <div key={i} className="w-16 h-16 rounded-xl overflow-hidden relative group bg-zinc-900">
                <img src={url} className="absolute inset-0 w-full h-full object-cover blur-md opacity-50 scale-110" />
                <img src={url} className="absolute inset-0 w-full h-full object-contain z-10" alt="thumb"/>
                <div onClick={() => updateEnv(field, fotos.filter((_:any, idx:number) => idx !== i))} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20"><Trash2 size={14} className="text-white"/></div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8 pb-32 font-sans flex flex-col items-center animate-in fade-in duration-500">
      <div className="w-full max-w-[1200px] flex flex-col gap-6">
        
        <header className="flex flex-col md:flex-row md:justify-between md:items-center bg-white p-4 md:p-6 rounded-[2rem] shadow-sm border border-zinc-200">
          <button onClick={() => navigate('/admin')} className="text-zinc-500 hover:text-zinc-900 font-black text-[10px] uppercase tracking-widest flex items-center mb-4 md:mb-0 transition-colors">
            <ArrowLeft size={16} className="mr-2"/> Volver al Panel
          </button>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleCopy} className="px-5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-[10px] uppercase tracking-widest font-black text-zinc-600 hover:bg-zinc-100 transition flex items-center gap-2">
              {copiedStates['editorLink'] ? <Check size={14} className="text-green-500"/> : <Link2 size={14}/>} 
              {copiedStates['editorLink'] ? '¡Link Copiado!' : 'Copiar Link'}
            </button>
            <button onClick={() => handleShareWpp(id)} className="px-5 py-2.5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-xl text-[10px] uppercase tracking-widest font-black flex items-center gap-2 shadow-sm hover:bg-[#25D366] hover:text-white transition">
              <MessageCircle size={14}/> Enviar por Wpp
            </button>
            <button onClick={() => navigate(`/admin/analytics/${id}`)} className="px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-[10px] uppercase tracking-widest font-black flex items-center gap-2 shadow-md hover:bg-zinc-800 transition">
              <Activity size={14}/> Analíticas
            </button>
            <button onClick={() => window.open(`/ver/${id}`, '_blank')} className="px-5 py-2.5 bg-amber-600 text-white rounded-xl text-[10px] uppercase tracking-widest font-black flex items-center gap-2 shadow-md shadow-amber-600/20 hover:bg-amber-700 transition">
              <Play size={14}/> Ver App
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-zinc-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-[3rem] pointer-events-none"></div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2"><Settings size={14}/> Configuración Global</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1 block">Nombre Cliente</label>
                  <input className="w-full bg-zinc-50 px-4 py-3.5 rounded-xl font-bold text-zinc-900 outline-none border border-zinc-200 focus:border-amber-500 focus:bg-white transition" value={p.cliente} onChange={e=>updateGlobal({cliente: e.target.value})} />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1 block">WhatsApp (Botón Final)</label>
                  <input className="w-full bg-zinc-50 px-4 py-3.5 rounded-xl font-bold text-zinc-900 outline-none border border-zinc-200 focus:border-amber-500 focus:bg-white transition" value={p.whatsapp} onChange={e=>updateGlobal({whatsapp: e.target.value})} />
                </div>
                <div className="pt-4 border-t border-zinc-100">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-2 block">Estructura</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-zinc-50 p-1.5 rounded-xl border border-zinc-200 flex flex-col relative">
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2 text-[7px] font-black text-zinc-400 uppercase tracking-widest">Ambientes</span>
                      <div className="flex mt-2">
                        <button onClick={() => updateConfig('cantAmbientes', 1)} className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition ${c.cantAmbientes===1?'bg-white shadow-sm border border-zinc-200 text-zinc-900':'text-zinc-500'}`}>1 Solo</button>
                        <button onClick={() => updateConfig('cantAmbientes', 2)} className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition ${c.cantAmbientes===2?'bg-white shadow-sm border border-zinc-200 text-zinc-900':'text-zinc-500'}`}>Varios</button>
                      </div>
                    </div>
                    <div className="bg-zinc-50 p-1.5 rounded-xl border border-zinc-200 flex flex-col relative">
                      <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-white px-2 text-[7px] font-black text-zinc-400 uppercase tracking-widest">Moneda</span>
                      <div className="flex mt-2">
                        <button onClick={() => updateConfig('moneda', 'USD')} className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition ${c.moneda==='USD'?'bg-white shadow-sm border border-zinc-200 text-zinc-900':'text-zinc-500'}`}>USD</button>
                        <button onClick={() => updateConfig('moneda', 'ARS')} className={`flex-1 py-1.5 text-[9px] font-black rounded-lg transition ${c.moneda==='ARS'?'bg-white shadow-sm border border-zinc-200 text-zinc-900':'text-zinc-500'}`}>ARS</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="flex gap-2 overflow-x-auto hide-scroll">
              {p.ambientes.map((a:any, i:number) => (
                <button key={a.id} onClick={() => setActiveTab(i)} className={`shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab===i ? 'bg-zinc-900 text-white shadow-md' : 'bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50'}`}>{a.tab || `Ambiente ${i+1}`}</button>
              ))}
              {c.cantAmbientes === 2 && <button onClick={addAmbiente} className="shrink-0 px-4 py-3 rounded-2xl text-zinc-400 hover:text-amber-600 bg-white border border-zinc-200 border-dashed hover:border-amber-300 transition-colors flex items-center justify-center"><Plus size={16}/></button>}
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm relative">
              {c.cantAmbientes === 2 && p.ambientes.length > 1 && (
                <button onClick={() => removeAmbiente(activeTab)} className="absolute top-6 right-6 text-zinc-300 hover:text-red-500 bg-red-50 p-2 rounded-full"><Trash2 size={16}/></button>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {c.cantAmbientes === 2 && (
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-amber-600 ml-1 mb-2 block">Nombre en Índice</label>
                    <input className="w-full bg-amber-50/50 px-4 py-3.5 rounded-xl font-bold text-amber-900 outline-none border border-amber-200 focus:border-amber-500 focus:bg-white transition" value={env.tab} onChange={e=>updateEnv('tab', e.target.value)} placeholder="Ej: Cocina" />
                  </div>
                )}
                <div className={c.cantAmbientes === 1 ? 'col-span-2' : ''}>
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-2 block">Título del Banner</label>
                  <input className="w-full bg-zinc-50 px-4 py-3.5 rounded-xl font-black text-lg text-zinc-900 outline-none border border-zinc-200 focus:border-amber-500 focus:bg-white transition" value={env.titulo} onChange={e=>updateEnv('titulo', e.target.value)} placeholder="Ej: Cocina Principal" />
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2"><ImageIcon size={14}/> Render y Obra (Slider)</h3>
                <div className="flex gap-4 mb-4 bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                   <div className="flex-1">
                     <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-1 block mb-1">Texto Izquierda</label>
                     <input className="w-full bg-white px-3 py-2 rounded-lg text-xs font-bold outline-none border border-zinc-200 focus:border-amber-500" value={env.lblIzq} onChange={e=>updateEnv('lblIzq', e.target.value)} />
                   </div>
                   <div className="flex-1">
                     <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-1 block mb-1">Texto Derecha</label>
                     <input className="w-full bg-white px-3 py-2 rounded-lg text-xs font-bold outline-none border border-zinc-200 focus:border-amber-500" value={env.lblDer} onChange={e=>updateEnv('lblDer', e.target.value)} />
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative bg-zinc-50 p-4 rounded-[2rem] border border-zinc-100">
                  <button onClick={() => updateEnv('invertido', !env.invertido)} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-zinc-200 shadow-xl rounded-full p-3 text-zinc-400 hover:text-amber-600 z-10 hover:scale-110 transition-all"><ArrowLeftRight size={18}/></button>
                  {renderDropzone(!env.invertido ? 'obra' : 'render')}
                  {renderDropzone(env.invertido ? 'obra' : 'render')}
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2"><DollarSign size={14}/> Inversión</h3>
                
                <div className="bg-[#111] rounded-[2rem] p-8 relative overflow-hidden shadow-xl mb-6">
                   <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none"></div>
                   <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 block mb-2">Monto Total Base</label>
                   <div className="flex items-center gap-3 relative z-10">
                     <span className="text-amber-500 font-black text-3xl">{c.moneda === 'ARS' ? '$' : 'USD'}</span>
                     <input className="bg-transparent text-white font-black text-6xl outline-none w-full tracking-tighter" value={env.total} onChange={e=>updateEnv('total', e.target.value)} placeholder="0" />
                   </div>
                </div>

                <div className="space-y-4 bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 block mb-2">Desglose de Ítems</label>
                  {currentItems.map((item:any) => (
                    <div key={item.id} className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border transition-colors ${item.incluido ? 'bg-white border-zinc-200 shadow-sm' : 'bg-amber-50/50 border-amber-200 border-dashed'}`}>
                      <input className="flex-1 bg-transparent px-2 py-2 rounded-lg text-sm font-bold outline-none" value={item.lbl} onChange={e=>updateItem(item.id, 'lbl', e.target.value)} placeholder="Ej: Materiales" />
                      <div className="flex items-center justify-end gap-4 shrink-0">
                        <input className={`w-28 bg-transparent text-right text-sm font-black outline-none ${item.incluido ? 'text-zinc-900' : 'text-amber-600'}`} value={item.val} onChange={e=>updateItem(item.id, 'val', e.target.value)} placeholder="Valor" />
                        <div onClick={() => updateItem(item.id, 'incluido', !item.incluido)} className="flex items-center gap-2 cursor-pointer bg-white border border-zinc-200 p-1.5 rounded-xl w-[100px] shrink-0" title="¿Suma al total o es extra?">
                          <div className={`w-8 h-5 rounded-full p-0.5 transition-colors duration-300 ease-in-out ${item.incluido ? 'bg-emerald-500' : 'bg-zinc-300'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${item.incluido ? 'translate-x-3' : 'translate-x-0'}`}></div>
                          </div>
                          <span className={`text-[8px] font-black uppercase tracking-widest ${item.incluido ? 'text-emerald-600' : 'text-zinc-400'}`}>{item.incluido ? 'Suma' : 'Extra'}</span>
                        </div>
                        <button onClick={() => deleteItem(item.id)} className="text-zinc-300 hover:text-red-500 p-2"><Trash2 size={16}/></button>
                      </div>
                    </div>
                  ))}
                  <button onClick={handleAddItem} className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50/50 transition-all flex items-center justify-center gap-2 mt-2">
                    <Plus size={14}/> Agregar Ítem
                  </button>
                </div>
              </div>

              {/* EDITOR Z3 REAL CON OBJECT-CONTAIN Y FONDO BLUR */}
              <div className="pt-10 mt-10 border-t border-zinc-100">
                
                {/* Textos Editables de Z3 */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2"><Layers size={16} className="text-amber-500"/> Z3: Editor de Variantes</h3>
                  <div className="flex gap-4">
                     <div className="flex flex-col">
                        <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-1">Título de Sección</label>
                        <input className="bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-bold outline-none focus:border-amber-500" value={env.z3Title || 'Variantes de Material'} onChange={e => updateEnv('z3Title', e.target.value)} />
                     </div>
                     <div className="flex flex-col">
                        <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-1">Subtítulo</label>
                        <input className="bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-bold outline-none focus:border-amber-500" value={env.z3Subtitle || 'Toca los puntos para detalles'} onChange={e => updateEnv('z3Subtitle', e.target.value)} />
                     </div>
                  </div>
                </div>
                
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-6">Sube una imagen base y haz clic para agregar puntos interactivos con nombres editables.</p>
                
                <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-200 flex flex-col lg:flex-row gap-6">
                  
                  <div className="w-full lg:w-1/3 flex flex-col gap-3">
                     {variantes.map((v:any, idx:number) => (
                       <div key={v.id} onClick={() => setActiveVarTab(idx)} className={`p-4 rounded-2xl border transition-colors cursor-pointer group flex flex-col relative ${activeVarTab === idx ? 'bg-white border-amber-400 shadow-sm' : 'bg-transparent border-zinc-200 hover:bg-white'}`}>
                          {activeVarTab === idx && <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-amber-400 rounded-l-2xl"></div>}
                          <div className="flex justify-between items-center ml-2">
                             {activeVarTab === idx ? (
                               <input 
                                 className="font-black text-sm text-zinc-900 bg-zinc-50 px-2 py-1 rounded w-[85%] outline-none focus:border-amber-500 border border-transparent" 
                                 value={v.nombre} 
                                 onChange={(e) => updateVarianteName(e.target.value)} 
                               />
                             ) : (
                               <h4 className="font-bold text-sm text-zinc-500 group-hover:text-zinc-900 transition-colors truncate">{v.nombre}</h4>
                             )}
                             <button onClick={(e) => handleRemoveVariante(idx, e)} className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
                          </div>
                          <p className={`text-[9px] font-bold uppercase tracking-widest mt-2 ml-2 ${activeVarTab === idx ? 'text-amber-600' : 'text-zinc-400'}`}>{(v.puntos || []).length} Puntos agregados</p>
                       </div>
                     ))}
                     <button onClick={handleAddVariante} className="mt-2 py-4 border-2 border-dashed border-zinc-300 rounded-2xl text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-600 hover:border-amber-300 transition-all flex items-center justify-center gap-2">
                        <Plus size={14}/> Variante Nueva
                     </button>
                  </div>

                  <div className="w-full lg:w-2/3 relative aspect-[4/5] bg-zinc-900 rounded-[2rem] overflow-hidden border border-zinc-300 shadow-inner group flex items-center justify-center">
                     {!varActual ? (
                        <span className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Selecciona o crea una variante</span>
                     ) : !varActual.img ? (
                        <label className="flex flex-col items-center justify-center opacity-60 hover:opacity-100 cursor-pointer transition w-full h-full">
                           {subiendo.variante ? <Loader2 size={30} className="animate-spin text-amber-500 mb-2"/> : <UploadCloud size={30} className="mb-2 text-zinc-400"/>}
                           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Subir Imagen Base Z3</span>
                           <input type="file" className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'variante')} />
                        </label>
                     ) : (
                        <div className="w-full h-full relative cursor-crosshair" onClick={handleCanvasClick} ref={z3CanvasRef}>
                           {/* Blur de fondo para no tener franjas negras */}
                           <img src={varActual.img} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-xl scale-110 pointer-events-none" alt="blur" />
                           {/* Imagen real en object-contain para no cortar */}
                           <img src={varActual.img} className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none" alt="Z3 Canvas" />
                           
                           <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-xl pointer-events-none z-30">
                             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> Haz clic para colocar un punto
                           </div>
                           
                           {/* Renderizar Puntos Reales */}
                           {(varActual.puntos || []).map((pt:any) => (
                             <div key={pt.id} className="absolute z-20" style={{ top: `${pt.y}%`, left: `${pt.x}%`, transform: 'translate(-50%, -50%)' }}>
                                <div 
                                  onClick={(e) => { e.stopPropagation(); setEditingPoint(editingPoint === pt.id ? null : pt.id); }} 
                                  className={`relative w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110`}
                                >
                                   <span className={`absolute w-full h-full rounded-full animate-ping opacity-40 ${editingPoint === pt.id ? 'bg-red-400' : 'bg-amber-400'}`}></span>
                                   <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm relative z-10"></div>
                                </div>

                                {/* EDITAR PUNTO (MODAL FLOTANTE CENTRADO) */}
                                {editingPoint === pt.id && (
                                  <div onClick={(e) => { e.stopPropagation(); setEditingPoint(null); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-default">
                                    <div onClick={(e) => e.stopPropagation()} className="bg-white p-5 rounded-3xl shadow-2xl border border-zinc-200 w-72 animate-in zoom-in-95 duration-200">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Nombre del Material / Detalle</label>
                                      <input 
                                        className="w-full bg-zinc-100 px-4 py-3 rounded-xl text-sm font-bold text-zinc-900 border border-zinc-200 outline-none focus:border-amber-500 mb-4" 
                                        value={pt.material}
                                        onChange={(e) => updatePuntoMaterial(pt.id, e.target.value)}
                                        autoFocus 
                                      />
                                      <div className="flex justify-between items-center border-t border-zinc-100 pt-4">
                                        <button onClick={() => removePunto(pt.id)} className="text-[10px] text-red-500 font-black uppercase tracking-widest hover:text-red-700 flex items-center gap-1"><Trash2 size={14}/> Borrar</button>
                                        <button onClick={() => setEditingPoint(null)} className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-black">Guardar</button>
                                      </div>
                                    </div>
                                  </div>
                                )}
                             </div>
                           ))}
                        </div>
                     )}
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
// 🕵️ MOTOR ESPÍA V4 (CON DETECCIÓN MEJORADA)
// =====================================================================
function useAnalytics(proyectoId: string, ambienteTab: string) {
  const [sessionId] = useState(() => crypto.randomUUID());
  const maxScroll = useRef(0);
  const sliderMovs = useRef(0);
  const clickTimes = useRef<number[]>([]);
  const contextoCache = useRef<any>(null);
  const dwellTimes = useRef<{ [key: string]: number }>({ Z1: 0, Z2: 0, Z3: 0 });
  const entryTimes = useRef<{ [key: string]: number }>({ Z1: 0, Z2: 0, Z3: 0 });

  const buildContext = async () => {
    if (contextoCache.current) return contextoCache.current;
    let plat = "Web";
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) plat = "Android";
    else if (/iPhone|iPad|iPod/i.test(ua)) plat = "iOS";
    else if (/Mac/i.test(ua)) plat = "Mac";
    else if (/Win/i.test(ua)) plat = "Windows";
    else if (/Linux/i.test(ua)) plat = "Linux";

    let bat = "-"; let net = "Wi-Fi"; let geoStr = "Desconocido";
    try {
      if ('getBattery' in navigator) { const battery: any = await (navigator as any).getBattery(); bat = `${Math.round(battery.level * 100)}%`; }
      if ('connection' in navigator) { const conn = (navigator as any).connection; net = conn.effectiveType ? conn.effectiveType.toUpperCase() : "Wi-Fi"; }
    } catch (e) { }
    
    try {
      const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
      const geoData = await res.json();
      if (geoData.city) geoStr = `${geoData.city}, ${geoData.country_code}`;
    } catch (e) { }
    
    contextoCache.current = { userAgent: ua, pantalla: `${window.innerWidth}x${window.innerHeight}`, idioma: navigator.language, plataforma: plat, bateria: bat, red: net, geo: geoStr };
    return contextoCache.current;
  };

  const logEvent = async (tipo: string, detalle = {}) => {
    if (!proyectoId) return;
    try {
      const ctx = await buildContext();
      await supabase.from('eventos_analitica').insert([{ proyecto_id: proyectoId, sesion_id: sessionId, tipo: tipo, detalle: { ...detalle, ambiente: ambienteTab }, contexto: ctx }]);
    } catch(e) { console.error("Error logEvent", e); }
  };

  useEffect(() => {
    logEvent('SESSION_START', { url: window.location.href });
    const handleGlobalScroll = () => {
      const doc = document.documentElement; const max = doc.scrollHeight - doc.clientHeight;
      if (max > 0) { const pct = Math.round(((doc.scrollTop || document.body.scrollTop) / max) * 100); if (pct > maxScroll.current) maxScroll.current = pct; }
    };
    window.addEventListener('scroll', handleGlobalScroll);

    const heartbeat = setInterval(() => {
      const currentDwell = { ...dwellTimes.current };
      const now = Date.now();
      ['Z1', 'Z2', 'Z3'].forEach(z => { if (entryTimes.current[z] > 0) currentDwell[z] += (now - entryTimes.current[z]); });
      logEvent('SESSION_UPDATE', { tiempos: currentDwell, scroll_max: maxScroll.current, slider_total: sliderMovs.current });
    }, 5000);

    const handleUnload = () => {
      ['Z1', 'Z2', 'Z3'].forEach(z => { if (entryTimes.current[z] > 0) dwellTimes.current[z] += Date.now() - entryTimes.current[z]; });
      logEvent('SESSION_END', { scroll_max: maxScroll.current, slider_total: sliderMovs.current, tiempos: dwellTimes.current });
    };
    window.addEventListener('beforeunload', handleUnload);
    
    return () => { 
      window.removeEventListener('beforeunload', handleUnload); 
      window.removeEventListener('scroll', handleGlobalScroll); 
      clearInterval(heartbeat);
      handleUnload(); 
    }
  }, [proyectoId, ambienteTab]);

  const trackClick = (zona: string, e: React.MouseEvent, materialNombre?: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100); const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    logEvent('CLICK_ZONA', { zona, x, y, material: materialNombre });
    const now = Date.now(); clickTimes.current.push(now);
    if (clickTimes.current.length > 3) clickTimes.current.shift();
    if (clickTimes.current.length === 3 && (now - clickTimes.current[0] < 1500)) { logEvent('FRICCION', { zona, mensaje: "Rage click detectado" }); clickTimes.current = []; }
  };
  const trackScroll = (e: any) => { const el = e.target; const max = el.scrollHeight - el.clientHeight; if (max > 0) { const pct = Math.round((el.scrollTop / max) * 100); if (pct > maxScroll.current) maxScroll.current = pct; } };
  const trackSliderMove = () => { sliderMovs.current++; };

  const handleZoneEnter = (zona: string) => { entryTimes.current[zona] = Date.now(); };
  const handleZoneLeave = (zona: string) => { 
    if(entryTimes.current[zona] > 0) {
      dwellTimes.current[zona] += Date.now() - entryTimes.current[zona];
      entryTimes.current[zona] = 0;
    }
  };

  return { trackClick, trackScroll, trackSliderMove, logEvent, handleZoneEnter, handleZoneLeave };
}

// =====================================================================
// 📱 VISTA 3: CLIENTE FINAL (LIGHT MODE DEFAULT)
// =====================================================================
function VistaCliente() {
  const { id } = useParams();
  const [p, setP] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showIndex, setShowIndex] = useState(false);
  const [isSimulatingLoad, setIsSimulatingLoad] = useState(true);
  
  // TEMA CLARO POR DEFECTO
  const [clientTheme, setClientTheme] = useState('light');
  const isDark = clientTheme === 'dark';

  // PALETA ORGANIC LUXURY
  const colors = {
    bgMain: isDark ? 'bg-[#1C1A18]' : 'bg-[#EAE5DF]',
    bgCard: isDark ? 'bg-[#2A2622]/60 backdrop-blur-2xl border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)]' : 'bg-white/50 backdrop-blur-2xl border-white/70 shadow-[0_8px_30px_rgb(0,0,0,0.05)]',
    glassHeader: isDark ? 'bg-[#1C1A18]/70 backdrop-blur-xl border-white/5' : 'bg-[#EAE5DF]/70 backdrop-blur-xl border-black/5',
    textMain: isDark ? 'text-[#EBE6E0]' : 'text-[#1A1A1A]',
    textMuted: 'text-[#A87C4F]', // Bronce elegante
    borderMain: isDark ? 'border-zinc-800' : 'border-zinc-200',
    borderSub: isDark ? 'border-white/5' : 'border-black/5',
    accentColor: 'bg-[#A87C4F]',
    accentGlow: 'shadow-[0_0_30px_rgba(168,124,79,0.3)]',
  };
  


  useEffect(() => {
    if (CLARITY_PROJECT_ID && !(window as any).clarity) {
      (function(c:any,l,a,r,i,t,y){
          c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
          t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
          y=l.getElementsByTagName(r)[0];if(y && y.parentNode) y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", CLARITY_PROJECT_ID);
    }
  }, []);

  const { trackClick, trackScroll, trackSliderMove, logEvent, handleZoneEnter, handleZoneLeave } = useAnalytics(id || '', p?.ambientes?.[activeTab]?.tab || 'Global');

  useEffect(() => {
    if (!id) return;
    const fetchProyecto = async () => {
      const { data } = await supabase.from('proyectos').select('*').eq('id', id).single();
      if (data) {
        setP(data);
        if (data.configuracion?.cantAmbientes > 1 && data.configuracion?.navegacion === 'index') setShowIndex(true);
      }
      setTimeout(() => setIsSimulatingLoad(false), 1500); 
    };
    fetchProyecto();
  }, [id]);

  if (!p || isSimulatingLoad) return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center animate-in fade-in duration-300">
      <div className="w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(245,158,11,0.1)] ring-1 ring-white/5">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
      <h1 className="text-4xl font-black text-white tracking-tighter italic">STUDIO<span className="text-amber-500">.MUD</span></h1>
      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-4 animate-pulse">Preparando propuesta...</p>
    </div>
  );

  const c = p.configuracion;
  const env = p.ambientes[activeTab] || {};
  
  const hasMultipleEnvs = p.ambientes && p.ambientes.length > 1;
  const isMultipleDisplay = c.cantAmbientes > 1 && hasMultipleEnvs;
  
  let totalSuma = 0;
  if (isMultipleDisplay) { totalSuma = p.ambientes.reduce((acc: number, curr: any) => acc + parsePrice(curr.total), 0); }

  const currentItems = env.items || [];
  const variantes = env.variantes || [];

  const handleShareClient = async () => {
    logEvent('COMPARTIR_CLICK');
    if (navigator.share) {
      try { await navigator.share({ title: `Propuesta: ${env.titulo || 'STUDIO.MUD'}`, text: `Mirá esta propuesta de diseño de STUDIO.MUD`, url: window.location.href }); } catch (err) { }
    } else {
      navigator.clipboard.writeText(window.location.href); alert("Enlace copiado al portapapeles");
    }
  };

  return (
    <div className={`min-h-screen ${colors.bgMain} font-sans relative flex flex-col items-center justify-center overflow-hidden md:py-10 transition-colors duration-500`}>
      
      {/* Background PC Blur */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <img src={env.obra || env.galeriaObra?.[0] || env.render || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200"} className={`w-full h-full object-cover blur-3xl scale-110 transition-opacity duration-500 ${isDark ? 'opacity-10' : 'opacity-20'}`} alt="bg"/>
        <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? 'from-black/50 to-[#1C1A18]/90' : 'from-white/50 to-[#EAE5DF]/90'}`}></div>
      </div>

      <div className={`w-full md:max-w-[420px] min-h-screen md:min-h-[85vh] md:max-h-[900px] ${colors.bgMain} md:rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border-0 md:border-[6px] ${colors.borderMain} relative z-10 flex flex-col overflow-hidden ring-1 ${isDark ? 'ring-white/10' : 'ring-black/5'} transition-colors duration-500`}>
        
        {/* BLOBS DE LUZ PARA EL EFECTO GLASSMORPHISM */}
        <div className="absolute top-[20%] left-[-20%] w-[80%] h-[40%] rounded-full bg-white/40 blur-[80px] pointer-events-none transition-opacity duration-700" style={{opacity: isDark ? 0.05 : 0.6}}></div>
        <div className={`absolute top-[60%] right-[-30%] w-[90%] h-[50%] rounded-full bg-[#A87C4F] blur-[100px] pointer-events-none transition-opacity duration-700 ${isDark ? 'opacity-20' : 'opacity-20'}`}></div>

        {/* HEADER SÓLIDO COMPACTO -> STICKY GLASSMORPHISM */}
        <div className={`absolute top-0 left-0 w-full pt-8 md:pt-12 pb-3 px-5 z-50 flex justify-between items-center transition-colors duration-700 border-b ${colors.glassHeader}`}>
           <div>
             <h1 className={`font-black text-[20px] tracking-tighter italic ${colors.textMain} leading-none`}>STUDIO<span className="text-[#A87C4F]">.MUD</span></h1>
             <span className="text-[7px] text-[#A87C4F] uppercase tracking-widest font-bold mt-1 block">Diseño a Medida</span>
           </div>
           <div className="flex gap-3">
             <button onClick={handleShareClient} className={`${colors.textMuted} hover:${colors.textMain} transition-colors`} title="Compartir Proyecto">
               <Share2 size={18} />
             </button>
             <button onClick={() => setClientTheme(isDark ? 'light' : 'dark')} className="text-[#A87C4F] hover:opacity-80 transition-colors" title="Modo Claro / Oscuro">
               {isDark ? <Sun size={18} /> : <Moon size={18} />}
             </button>
           </div>
        </div>

        {/* INDEX MÚLTIPLES AMBIENTES */}
        {showIndex && (
          <div className={`flex-1 ${colors.bgMain} overflow-y-auto p-6 pt-24 transition-colors`}>
            <h2 className={`text-3xl font-serif font-black ${colors.textMain} tracking-tight leading-tight mb-2`}>Proyecto<br/><span className={colors.textMuted}>{p.cliente}</span></h2>
            <p className="text-xs text-[#A87C4F] font-bold uppercase tracking-widest mb-8">Selecciona un ambiente</p>
            <div className="space-y-4 relative z-10">
              {p.ambientes.map((a:any, i:number) => {
                const imgThumb = (a.invertido ? (a.galeriaObra || [a.obra]) : (a.galeriaRender || [a.render]))[0] || "";
                return (
                  <div key={i} onClick={() => {setActiveTab(i); setShowIndex(false);}} className={`${colors.glassCard} rounded-3xl p-3 border shadow-sm flex items-center gap-4 cursor-pointer transition-colors group`}>
                    <div className="w-20 h-20 rounded-2xl bg-zinc-900 overflow-hidden shrink-0 ring-1 ring-white/5">{imgThumb && <img src={imgThumb} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />}</div>
                    <div className="flex-1"><h3 className={`font-serif font-black text-lg ${colors.textMain}`}>{a.tab}</h3><p className="text-[#A87C4F] font-bold text-xs mt-1">{c.moneda === 'ARS' ? '$' : 'USD'} {a.total}</p></div>
                    <ChevronRight size={20} className={`${colors.textMuted} group-hover:text-[#A87C4F] mr-2 transition-colors`} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VISTA DE AMBIENTE INDIVIDUAL */}
        {!showIndex && (
          <div onScroll={trackScroll} className={`flex-1 overflow-y-auto pb-32 hide-scroll scroll-smooth relative transition-colors`}>
            <div className="h-20 md:h-24"></div> {/* Espaciador por header fijo */}

            {/* TABS SI HAY VARIOS Y NAVEGACION TABS */}
            {isMultipleDisplay && c.navegacion === 'tabs' && (
              <div className={`flex overflow-x-auto gap-2 items-end hide-scroll px-4 pt-2 mb-4 relative z-10`}>
                {p.ambientes.map((a:any, i:number) => (
                  <button key={i} onClick={() => {setActiveTab(i); setShowIndex(false);}} className={`shrink-0 px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === i ? `${colors.accentColor} text-[#F8F6F0] shadow-md` : `${isDark ? 'bg-white/5 border border-white/5 text-zinc-400' : 'bg-white/40 border border-white/60 text-zinc-500 backdrop-blur-md shadow-sm'}`}`}>{a.tab}</button>
                ))}
              </div>
            )}
            {isMultipleDisplay && c.navegacion === 'index' && (
              <div className="px-4 pt-2 mb-4 relative z-10"><button onClick={() => setShowIndex(true)} className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest ${colors.textMuted} ${colors.glassCard} px-4 py-2 rounded-full border transition`}><ArrowLeft size={14}/> Volver al Menú</button></div>
            )}

            {/* Z1: RENDER ORIGINAL RESTAURADO (OBJECT-COVER) */}
            <div 
              onMouseEnter={() => handleZoneEnter('Z1')} onMouseLeave={() => handleZoneLeave('Z1')} onTouchStart={() => handleZoneEnter('Z1')} onTouchEnd={() => handleZoneLeave('Z1')}
              onClick={(e) => trackClick('Z1_RENDER', e)} id="sensor-Z1" data-zona="Z1" className ="relative h-[60vh] min-h-[450px] w-full mb-6 cursor-default animate-in fade-in fill-mode-both"
            >
               <SliderAntesDespues env={env} activeTab={activeTab} onSliderMove={trackSliderMove} isDark={isDark} />
            </div>

            {/* Títulos Opción A Elegante */}
            <div className="px-6 mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both relative z-10">
              <p className={`font-sans text-[9px] uppercase tracking-[0.3em] font-semibold ${colors.textMuted} mb-1 transition-colors duration-700`}>{p.cliente}</p>
              <h2 className={`font-serif text-[2.2rem] ${colors.textMain} leading-tight tracking-wide transition-colors`}>{env.titulo}</h2>
            </div>

            <div className="px-5 space-y-6 relative z-10">
              {/* Z2: PRECIO GLASSMORPHISM */}
              <div 
                onMouseEnter={() => handleZoneEnter('Z2')} onMouseLeave={() => handleZoneLeave('Z2')} onTouchStart={() => handleZoneEnter('Z2')} onTouchEnd={() => handleZoneLeave('Z2')}
                onClick={(e) => trackClick('Z2_PRECIO', e)} id="sensor-Z2" data-zona="Z2" className={`rounded-[2.2rem] p-7 shadow-xl relative overflow-hidden border animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both transition-all ${colors.glassCard}`}
              >
                <p className={`${colors.textMuted} text-[8px] font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-1.5`}><Info size={12}/> Inversión del Ambiente</p>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className={`${colors.textMuted} font-serif italic text-2xl opacity-80`}>{c.moneda === 'ARS' ? '$' : 'USD'}</span>
                  <p className={`text-[3rem] leading-none font-serif tracking-tighter ${colors.textMain} pointer-events-none`}>{env.total}</p>
                </div>
                <div className={`space-y-4 border-t ${isDark ? 'border-white/10' : 'border-black/5'} pt-5 pointer-events-none transition-colors`}>
                  {currentItems.map((item:any) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        {item.incluido ? <div className={`w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center`}><CheckCircle2 size={12} className="text-emerald-600" /></div> : <div className={`w-5 h-5 rounded-full border ${isDark?'border-white/20':'border-black/20'}`}></div>}
                        <span className={`${item.incluido ? colors.textMain : colors.textMuted} font-serif text-sm`}>{item.lbl}</span>
                      </div>
                      <span className={`font-sans font-bold text-sm ${item.incluido ? 'text-[#A87C4F]' : colors.textMuted}`}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* TOTAL GENERAL */}
              {isMultipleDisplay && (
                <div onClick={(e) => trackClick('Z2_PRECIO', e)} className={`${isDark ? 'bg-[#A87C4F]/10 border-[#A87C4F]/20' : 'bg-[#A87C4F]/5 border-[#A87C4F]/10'} border rounded-[1.5rem] p-5 shadow-sm relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both backdrop-blur-md`}>
                  <div className="absolute right-0 top-0 w-16 h-16 bg-[#A87C4F]/20 blur-xl"></div>
                  <p className="text-[#A87C4F] text-[8px] font-black uppercase tracking-[0.2em] mb-1">Total General (Todos los ambientes)</p>
                  <span className={`${colors.textMain} font-serif text-2xl transition-colors`}>{c.moneda === 'ARS' ? '$' : 'USD'} {totalSuma.toLocaleString('es-AR')}</span>
                </div>
              )}

              {/* Z3 ALTERNATIVAS CON BOTONES GLASSMORPHISM Y TÍTULOS EDITABLES */}
              {variantes.length > 0 && (
                <div onMouseEnter={() => handleZoneEnter('Z3')} onMouseLeave={() => handleZoneLeave('Z3')} onTouchStart={() => handleZoneEnter('Z3')} onTouchEnd={() => handleZoneLeave('Z3')} className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700 fill-mode-both">
                   <Z3Alternativas variantes={variantes} trackClick={trackClick} logEvent={logEvent} wppNum={p.whatsapp} isDark={isDark} colors={colors} tituloZ3={env.z3Titulo} subtituloZ3={env.z3Subtitulo} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOTÓN FLOTANTE WPP FIJO */}
        <div className={`absolute bottom-0 left-0 w-full p-5 pb-8 pt-16 z-40 pointer-events-none transition-colors duration-700`}
             style={{ backgroundImage: `linear-gradient(to top, ${isDark ? '#1C1A18' : '#EAE5DF'} 20%, ${isDark ? 'rgba(28,26,24,0.8)' : 'rgba(234,229,223,0.8)'} 60%, transparent)` }}>
          <a href={`https://wa.me/${p.whatsapp}?text=Hola! Estuve viendo la propuesta y quiero avanzar.`} target="_blank" rel="noreferrer" onClick={() => logEvent('WPP_CLICK')} className={`pointer-events-auto w-full ${colors.accentColor} text-[#F8F6F0] py-4 rounded-full font-serif text-[1.1rem] tracking-wide flex items-center justify-center gap-3 ${colors.accentGlow} hover:scale-[1.02] transition-transform border border-white/20 shadow-xl`}>
            <Phone size={18} strokeWidth={1.5} fill="currentColor" /> Escribir por WhatsApp
          </a>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html:`.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }`}}/>
    </div>
  );
} 

// --- SUB-COMPONENTE: SLIDER MÁGICO CON GALERÍA FULLSCREEN ---
function SliderAntesDespues({ env, activeTab, onSliderMove, isDark, colors }: { env: any, activeTab: number, onSliderMove: () => void, isDark?: boolean, colors?: any }) {
  const [val, setVal] = useState(50);
  const [anim, setAnim] = useState('');
  const [idxIzq, setIdxIzq] = useState(0);
  const [idxDer, setIdxDer] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    setIdxIzq(0); setIdxDer(0); setAnim('transition-all duration-[450ms] cubic-bezier(0.25, 1, 0.5, 1)');
    setTimeout(() => setVal(70), 200); setTimeout(() => setVal(30), 650); setTimeout(() => setVal(50), 1100); setTimeout(() => setAnim(''), 1550);
  }, [activeTab]);

  const handleDrag = (e: any) => { setAnim(''); setVal(e.target.value); onSliderMove(); };
  const snap = (v: number) => { setAnim('transition-all duration-300 ease-out'); setVal(v); onSliderMove(); setTimeout(() => setAnim(''), 300); };

  let arrIzq = !env.invertido ? (env.galeriaObra || [env.obra]) : (env.galeriaRender || [env.render]);
  let arrDer = env.invertido ? (env.galeriaObra || [env.obra]) : (env.galeriaRender || [env.render]);
  if(!arrIzq[0]) arrIzq = ["https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=800"];
  if(!arrDer[0]) arrDer = ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800"];

  // Funciones para Fullscreen
  const allImages = [...arrIzq, ...arrDer]; 
  const [fullIdx, setFullIdx] = useState(0);
  
  const openFullscreen = (e: React.MouseEvent) => {
      e.stopPropagation();
      setFullIdx(0);
      setIsFullscreen(true);
  };

  const nextFull = (e:any) => { e.stopPropagation(); setFullIdx((i) => (i + 1) % allImages.length); };
  const prevFull = (e:any) => { e.stopPropagation(); setFullIdx((i) => (i - 1 + allImages.length) % allImages.length); };
  const nextIzq = (e:any) => { e.stopPropagation(); setIdxIzq((i) => (i + 1) % arrIzq.length); };
  const prevIzq = (e:any) => { e.stopPropagation(); setIdxIzq((i) => (i - 1 + arrIzq.length) % arrIzq.length); };
  const nextDer = (e:any) => { e.stopPropagation(); setIdxDer((i) => (i + 1) % arrDer.length); };
  const prevDer = (e:any) => { e.stopPropagation(); setIdxDer((i) => (i - 1 + arrDer.length) % arrDer.length); };

  return (
    <>
      {/* CARTA SLIDER */}
      <div className={`w-full h-full relative cursor-default pointer-events-auto transition-colors overflow-hidden ${isDark ? 'bg-zinc-900' : 'bg-zinc-200'} rounded-[2.5rem]`}>
        
        {/* IMAGEN DERECHA (RENDER) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <img src={arrDer[idxDer]} className="absolute inset-0 w-full h-full object-cover blur-xl opacity-40 scale-110" alt="blur-der" />
          <img src={arrDer[idxDer]} className="absolute inset-0 w-full h-full object-cover z-10" alt="render" />
          
          {arrDer.length > 1 && (
            <div className="absolute inset-0 pointer-events-none z-30">
              <button onClick={prevDer} className="pointer-events-auto absolute right-12 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/80 transition"><ChevronLeft size={18}/></button>
              <button onClick={nextDer} className="pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/80 transition"><ChevronRight size={18}/></button>
              <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md text-[8px] text-white font-bold tracking-widest border border-white/10">{idxDer+1}/{arrDer.length}</div>
            </div>
          )}
        </div>

        {/* IMAGEN IZQUIERDA (OBRA) */}
        <div className={`absolute inset-0 w-full h-full pointer-events-none ${anim}`} style={{ clipPath: `inset(0 ${100 - val}% 0 0)` }}>
          <img src={arrIzq[idxIzq]} className="absolute inset-0 w-full h-full object-cover" alt="obra" />
          {arrIzq.length > 1 && (
            <div className="absolute inset-0 pointer-events-none z-30">
              <button onClick={prevIzq} className="pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/80 transition"><ChevronLeft size={18}/></button>
              <button onClick={nextIzq} className="pointer-events-auto absolute left-12 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/60 backdrop-blur-md text-white rounded-full flex items-center justify-center hover:bg-black/80 transition"><ChevronRight size={18}/></button>
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md text-[8px] text-white font-bold tracking-widest border border-white/10">{idxIzq+1}/{arrIzq.length}</div>
            </div>
          )}
        </div>

        {/* LÍNEA DIVISORIA (ESTILO VIDRIO Y BRONCE) */}
        <div className={`absolute top-0 bottom-0 w-[1.5px] bg-white/80 z-10 -translate-x-1/2 shadow-sm ${anim} pointer-events-none`} style={{ left: `${val}%` }}>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/50 flex items-center justify-center backdrop-blur-md bg-black/10 shadow-[0_4px_15px_rgba(0,0,0,0.3)]">
            <div className={`w-2.5 h-2.5 bg-[#A87C4F] rounded-full`}></div>
          </div>
        </div>
        <input type="range" min="0" max="100" value={val} onChange={handleDrag} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20" />
        
        {/* BOTÓN MAXIMIZAR GALERÍA */}
        <button onClick={openFullscreen} className="absolute top-4 right-4 bg-black/40 backdrop-blur-xl border border-white/20 text-white p-2 rounded-full z-30 shadow-lg hover:scale-110 transition-transform">
            <Maximize size={16} />
        </button>

        {/* BOTONERA SLIDER (VIDRIO) */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex bg-black/40 backdrop-blur-xl p-1.5 rounded-full shadow-2xl border border-white/20 z-30 pointer-events-auto">
          <button onClick={(e)=>{ e.stopPropagation(); snap(100); }} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${val > 65 ? 'bg-[#F8F6F0] text-[#1A1A1A]' : 'text-zinc-300 hover:text-white'}`}>{env.lblIzq || 'Antes'}</button>
          <button onClick={(e)=>{ e.stopPropagation(); snap(0); }} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${val < 35 ? 'bg-[#F8F6F0] text-[#1A1A1A]' : 'text-zinc-300 hover:text-white'}`}>{env.lblDer || 'Render'}</button>
        </div>
      </div>

      {/* GALERÍA FULLSCREEN (Intacta) */}
      {isFullscreen && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center p-5 text-white z-50 bg-gradient-to-b from-black/80 to-transparent absolute top-0 left-0 w-full pointer-events-none">
                  <span className="text-xs font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">{fullIdx + 1} / {allImages.length}</span>
                  <button onClick={() => setIsFullscreen(false)} className="pointer-events-auto bg-white/10 p-2 rounded-full backdrop-blur-md hover:bg-white/20 transition-colors">
                      <X size={20} />
                  </button>
              </div>
              
              <div className="flex-1 relative flex items-center justify-center">
                  <img src={allImages[fullIdx]} className="w-full h-full object-contain" alt="Pantalla Completa" />
                  
                  {allImages.length > 1 && (
                    <>
                      <button onClick={prevFull} className="absolute left-4 bg-black/50 text-white p-3 rounded-full backdrop-blur-md hover:bg-black/80 transition-colors"><ChevronLeft size={24} /></button>
                      <button onClick={nextFull} className="absolute right-4 bg-black/50 text-white p-3 rounded-full backdrop-blur-md hover:bg-black/80 transition-colors"><ChevronRight size={24} /></button>
                    </>
                  )}

                  <div className="absolute bottom-10 bg-black/60 text-white/70 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 flex items-center gap-2 pointer-events-none">
                      <Maximize size={12}/> Pellizca para acercar
                  </div>
              </div>
          </div>
      )}
    </>
  );
}

// --- SUB-COMPONENTE: ZONA 3 ALTERNATIVAS (BOTONES DE CRISTAL SEPARADOS Y TÍTULOS EDITABLES) ---
function Z3Alternativas({ variantes, env, trackClick, logEvent, wppNum, isDark = true, colors }: { variantes: any[], env: any, trackClick: any, logEvent: any, wppNum: string, isDark?: boolean, colors?: any }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [likedMap, setLikedMap] = useState<{[key:string]: boolean}>({});
  const [isCommenting, setIsCommenting] = useState(false);
  const [noteText, setNoteText] = useState("");

  const nextSlide = () => { setActiveSlide((i) => (i + 1) % variantes.length); setActiveTooltip(null); setIsCommenting(false); setNoteText(""); };
  const prevSlide = () => { setActiveSlide((i) => (i - 1 + variantes.length) % variantes.length); setActiveTooltip(null); setIsCommenting(false); setNoteText(""); };
  const varActual = variantes[activeSlide];
  const isLiked = likedMap[varActual.id] || false;

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newLiked = !isLiked;
    setLikedMap(prev => ({...prev, [varActual.id]: newLiked}));
    if (newLiked) logEvent('Z3_LIKE', { material: varActual.nombre });
  };

  const handleDirectWpp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `¡Hola! Estuve viendo la propuesta y me encantó la opción de material: *${varActual.nombre}*. ¿Podemos avanzar con esta?`;
    logEvent('WPP_CLICK', { tipo: 'direct_z3', material: varActual.nombre });
    window.open(`https://wa.me/${wppNum}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSendNoteWpp = () => {
    const text = `Nota sobre opción *${varActual.nombre}*:\n\n"${noteText}"`;
    logEvent('Z3_NOTE_WPP', { material: varActual.nombre, nota: noteText });
    setIsCommenting(false);
    window.open(`https://wa.me/${wppNum}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareVar = async () => {
    logEvent('COMPARTIR_CLICK', { tipo: 'variante_z3', material: varActual.nombre });
    if (navigator.share) {
      try { await navigator.share({ title: `Mirá esta opción: ${varActual.nombre}`, url: window.location.href }); } catch(e){}
    } else {
      navigator.clipboard.writeText(window.location.href); alert("Link copiado al portapapeles.");
    }
  };

  if(!varActual) return null;

  // Estilos de botones Glass para la Z3
  const glassDockTooltip = isDark ? "bg-[#11100F]/70 backdrop-blur-xl border border-white/10" : "bg-white/70 backdrop-blur-xl border border-white/60";
  const glassSecondary = isDark ? "bg-[#1C1A18]/40 backdrop-blur-md border border-white/10" : "bg-white/40 backdrop-blur-md border border-white/60";
  const glassPrimary = isDark ? "bg-[#A87C4F]/70 backdrop-blur-md border border-white/20 shadow-[0_5px_15px_rgba(168,124,79,0.2)]" : "bg-[#A87C4F]/85 backdrop-blur-md border border-white/40 shadow-[0_5px_15px_rgba(168,124,79,0.3)]";

  return (
    <div id="sensor-Z3" data-zona="Z3" className="mt-6 mb-6">
      
      {/* TÍTULOS EDITABLES (Usando los keys correctos de tu editor: env.z3Title y env.z3Subtitle) */}
      <div className="mb-4 px-2 flex justify-between items-center">
          <h3 className={`text-xl font-serif ${colors?.textMain || 'text-zinc-900'} tracking-wide transition-colors`}>{env.z3Title || 'Variantes de Material'}</h3>
          <div className="flex items-center gap-1.5">
            <div className={`w-2.5 h-2.5 bg-[#A87C4F] rounded-full opacity-80 animate-pulse`}></div>
            <span className={`text-[7px] font-bold uppercase tracking-widest ${colors?.textMuted || 'text-zinc-500'}`}>{env.z3Subtitle || 'Toca los puntos'}</span>
          </div>
      </div>
      
      <div 
        onClick={(e) => trackClick('Z3_DETALLES', e, varActual.nombre)}
        className={`relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden transition-colors duration-700 ${colors?.glassCard || 'bg-white'} group cursor-default`}
      >
        
        <img key={`blur-${varActual.id}`} src={varActual.img} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 pointer-events-none ${isDark ? 'opacity-70' : 'opacity-90'}`} alt="blur-bg" />
        <img key={`img-${varActual.id}`} src={varActual.img} className={`absolute inset-0 w-full h-full object-contain transition-all duration-700 pointer-events-none z-10 ${isCommenting ? 'opacity-30 blur-md scale-105' : 'opacity-100'}`} alt="Variante" />
        <div className={`absolute inset-0 bg-[#A87C4F] opacity-[0.05] mix-blend-multiply pointer-events-none z-10`}></div>
        
        {/* NAVEGACIÓN SUPERIOR */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-full flex items-center gap-4 z-30 shadow-lg">
          <button onClick={(e) => { e.stopPropagation(); prevSlide(); trackClick('Z3_SWIPE', e); }} className="hover:scale-110 transition-transform"><ChevronLeft size={14} className="text-white"/></button>
          <div className="flex flex-col items-center pointer-events-none">
            <span className="text-[9px] text-[#F8F6F0] font-black uppercase tracking-widest drop-shadow-md truncate max-w-[120px]">{varActual.nombre}</span>
            <div className="flex gap-1 mt-1">{variantes.map((_, idx) => (<div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === activeSlide ? `w-3 bg-[#A87C4F]` : 'w-1 bg-white/30'}`}></div>))}</div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); nextSlide(); trackClick('Z3_SWIPE', e); }} className="hover:scale-110 transition-transform"><ChevronRight size={14} className="text-white"/></button>
        </div>

        {/* MODAL COMENTARIO */}
        {isCommenting && (
          <div className="absolute inset-0 z-40 bg-black/40 backdrop-blur-md p-5 flex flex-col justify-center animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className={`${colors?.glassCard || 'bg-white'} rounded-3xl p-5 shadow-2xl relative`}>
                <button onClick={(e) => { e.stopPropagation(); setIsCommenting(false); }} className={`absolute top-4 right-4 ${colors?.textMuted || 'text-zinc-500'} hover:${colors?.textMain || 'text-zinc-900'} bg-zinc-800/50 rounded-full p-1 transition-colors`}><X size={16}/></button>
                <h4 className={`${colors?.textMain || 'text-zinc-900'} font-black text-sm mb-1 flex items-center gap-2`}><MessageSquarePlus size={16} className={colors?.textMuted || "text-amber-500"}/> Dejar una nota</h4>
                <p className={`text-[9px] ${colors?.textMuted || 'text-zinc-500'} font-bold uppercase tracking-widest mb-4`}>Sobre: {varActual.nombre}</p>
                <textarea 
                  className={`w-full bg-black/30 ${colors?.textMain || 'text-zinc-900'} border ${colors?.borderMain || 'border-zinc-200'} rounded-2xl p-4 text-sm resize-none focus:outline-none mb-4 shadow-inner`} 
                  rows={3} placeholder="Ej: Me gusta esta opción..." autoFocus value={noteText} onChange={e=>setNoteText(e.target.value)}
                ></textarea>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleShareVar(); }} className={`bg-zinc-800/50 ${colors?.textMain || 'text-white'} px-4 py-3.5 rounded-xl hover:bg-zinc-700 transition-colors flex items-center justify-center shrink-0`} title="Compartir esta opción"><Share2 size={16}/></button>
                  <button onClick={(e) => { e.stopPropagation(); handleSendNoteWpp(); }} className={`flex-1 bg-[#A87C4F] text-[#F8F6F0] font-black text-[10px] uppercase tracking-widest py-3.5 rounded-xl shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 border border-white/20`}>Enviar Nota</button>
                </div>
            </div>
          </div>
        )}

        {/* PUNTOS INTERACTIVOS CON ESTILO GLASS Y LAZOS */}
        {!isCommenting && (varActual.puntos || []).map((punto:any) => (
          <div key={punto.id} className="absolute z-20" style={{ top: `${punto.y}%`, left: `${punto.x}%`, transform: 'translate(-50%, -50%)' }}>
            <button onClick={(e) => { e.stopPropagation(); setActiveTooltip(activeTooltip === punto.id ? null : punto.id); trackClick('Z3_DETALLES_PUNTO', e, punto.material); }} className={`relative flex items-center justify-center w-6 h-6 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95 group`}>
              <div className={`absolute w-[250%] h-[250%] bg-[#A87C4F] rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity`}></div>
              <div className={`w-3.5 h-3.5 bg-[#A87C4F] rounded-full relative z-10 border-2 ${isDark ? 'border-[#262320]' : 'border-[#F8F6F0]'}`}></div>
            </button>
            
            {activeTooltip === punto.id && (
              <>
                 <div className={`absolute ${punto.y > 50 ? 'bottom-5' : 'top-5'} left-1/2 -translate-x-1/2 w-[1px] h-8 bg-gradient-to-b ${punto.y > 50 ? `from-[#A87C4F]/60` : 'from-transparent'} ${punto.y > 50 ? 'to-transparent' : `to-[#A87C4F]/60`} z-40 animate-in fade-in duration-300`}></div>
                 <div className={`absolute ${punto.y > 50 ? 'bottom-12' : 'top-12'} ${punto.x > 70 ? 'right-[-10px]' : punto.x < 30 ? 'left-[-10px]' : 'left-1/2 -translate-x-1/2'} w-max min-w-[140px] max-w-[200px] ${glassDockTooltip} p-3 pr-6 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200`}>
                   <button onClick={(e) => { e.stopPropagation(); setActiveTooltip(null); }} className={`absolute top-2 right-2 ${colors?.textMuted || 'text-zinc-500'} opacity-70 hover:opacity-100 transition-opacity`}><X size={12} /></button>
                   <div className="flex flex-col">
                       <span className={`block text-[6px] font-bold uppercase tracking-[0.2em] ${colors?.textMuted || 'text-zinc-500'} mb-0.5`}>Material</span>
                       <span className={`block text-xs font-serif tracking-wide ${colors?.textMain || 'text-zinc-900'} leading-tight`}>{punto.material}</span>
                   </div>
                 </div>
              </>
            )}
          </div>
        ))}

        {/* DOCK INFERIOR (GLASSMORPHISM SEPARADO) */}
        <div className="absolute bottom-4 left-0 w-full px-4 flex justify-between items-center gap-2 z-30 transition-colors">
            <button onClick={handleLike} className={`w-10 h-10 rounded-full ${glassSecondary} flex items-center justify-center ${colors?.textMuted || 'text-zinc-500'} shadow-sm hover:scale-105 transition-transform shrink-0`} title="Me gusta">
              <Heart size={16} strokeWidth={1.5} className={isLiked ? `fill-[#A87C4F]` : ""} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setIsCommenting(!isCommenting); }} className={`w-10 h-10 rounded-full ${glassSecondary} flex items-center justify-center ${colors?.textMuted || 'text-zinc-500'} shadow-sm hover:scale-105 transition-transform shrink-0`} title="Dejar Nota">
              <MessageSquarePlus size={16} strokeWidth={1.5} />
            </button>
            <button onClick={handleDirectWpp} className={`flex-1 h-10 ${glassPrimary} text-[#F8F6F0] rounded-full flex items-center justify-center gap-2 font-bold text-[10px] uppercase tracking-widest hover:opacity-100 transition-opacity ml-1`}>
              <MessageCircle size={14} fill="currentColor" /> Consultar
            </button>
        </div>

      </div>
      {activeTooltip && <div className="fixed inset-0 z-10" onClick={() => setActiveTooltip(null)}></div>}
    </div>
  );
}

// =====================================================================
// 📊 VISTA 4: CENTRO ANALÍTICO (3 COLUMNAS Y 2 PODIOS)
// =====================================================================
function AdminAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [analytics, setAnalytics] = useState<any>(null);
  const [expandedUser, setExpandedUser] = useState<number | null>(0); 
  const [theme, setTheme] = useState('dark');
  const [timeFilter, setTimeFilter] = useState('24h');

  const isDark = theme === 'dark';
  const colors = {
    bgMain: isDark ? 'bg-zinc-950' : 'bg-zinc-50', textMain: isDark ? 'text-zinc-100' : 'text-zinc-900',
    textMuted: isDark ? 'text-zinc-400' : 'text-zinc-500', bgCard: isDark ? 'bg-zinc-900' : 'bg-white',
    borderCard: isDark ? 'border-zinc-800' : 'border-zinc-200', bgHover: isDark ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100',
    headerAcc: isDark ? 'bg-zinc-800/50' : 'bg-zinc-50',
  };

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const { data: proyecto } = await supabase.from('proyectos').select('*').eq('id', id).single();
      if (proyecto) setP(proyecto);
      const { data: eventos } = await supabase.from('eventos_analitica').select('*').eq('proyecto_id', id).order('created_at', { ascending: true });
      if (eventos && proyecto) procesarEventos(eventos, proyecto.ambientes[activeTab]?.tab || 'Global');
    };
    fetchData();
    const channel = supabase.channel('cambios-analitica').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'eventos_analitica', filter: `proyecto_id=eq.${id}` }, () => { fetchData(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, activeTab, timeFilter]);

  const purgarDatos = async () => {
    if (!window.confirm('⚠️ ATENCIÓN: ¿Estás seguro de resetear este tablero? Se borrará TODO el historial. Irreversible.')) return;
    await supabase.from('eventos_analitica').delete().eq('proyecto_id', id);
    window.location.reload();
  };

  const procesarEventos = (todosLosEventos: any[], ambienteActual: string) => {
    const now = new Date().getTime();
    const eventos = todosLosEventos.filter(e => {
      const eDate = new Date(e.created_at).getTime();
      if (timeFilter === '24h') return (now - eDate) < 24 * 60 * 60 * 1000;
      if (timeFilter === '7d') return (now - eDate) < 7 * 24 * 60 * 60 * 1000;
      return true;
    });

    const evsAmbiente = eventos.filter((e: any) => e.detalle?.ambiente === ambienteActual || e.tipo.includes('WPP') || e.tipo === 'Z3_LIKE');
    const sesiones = [...new Set(evsAmbiente.map((e: any) => e.sesion_id))];

    const endsAndUpdates = evsAmbiente.filter((e: any) => e.tipo === 'SESSION_END' || e.tipo === 'SESSION_UPDATE');
    const latestUpdatesMap: any = {};
    endsAndUpdates.forEach(e => {
        if (!latestUpdatesMap[e.sesion_id] || new Date(e.created_at) > new Date(latestUpdatesMap[e.sesion_id].created_at)) {
            latestUpdatesMap[e.sesion_id] = e;
        }
    });
    const latestUpdates = Object.values(latestUpdatesMap);

    const maxScroll = latestUpdates.length ? Math.max(...latestUpdates.map((e: any) => e.detalle?.scroll_max || 0)) : 0;
    const totalSliders = latestUpdates.reduce((acc: number, curr: any) => acc + (curr.detalle?.slider_total || 0), 0);
    const friccionEvents = evsAmbiente.filter((e: any) => e.tipo === 'FRICCION').length;
    
    // PODIO 1: CLICS (Exploración)
    const clicks = evsAmbiente.filter((e: any) => e.tipo === 'CLICK_ZONA');
    const getDots = (zonaId: string, colorClass: string) => clicks.filter((e: any) => e.detalle?.zona?.includes(zonaId)).map((c: any) => ({ x: c.detalle.x, y: c.detalle.y, c: colorClass }));
    const dotsZ1 = getDots('Z1_RENDER', 'dot-blue');
    const dotsZ2 = getDots('Z2_PRECIO', 'dot-red');
    const dotsZ3 = getDots('Z3_DETALLES', 'dot-yellow'); 
    
    const matsClics = clicks.filter((c:any) => c.detalle?.material).map((c:any) => c.detalle.material);
    const rankingClicsMap = matsClics.reduce((acc:any, curr:any) => ({...acc, [curr]: (acc[curr] || 0) + 1}), {});
    const rankingClics = Object.entries(rankingClicsMap).map(([n, c]) => ({ n, c })).sort((a:any, b:any) => (b.c as number) - (a.c as number));

    // PODIO 2: ME GUSTA (Corazones Z3)
    const likes = evsAmbiente.filter((e:any) => e.tipo === 'Z3_LIKE');
    const matsLikes = likes.filter((c:any) => c.detalle?.material).map((c:any) => c.detalle.material);
    const rankingLikesMap = matsLikes.reduce((acc:any, curr:any) => ({...acc, [curr]: (acc[curr] || 0) + 1}), {});
    const rankingLikes = Object.entries(rankingLikesMap).map(([n, c]) => ({ n, c })).sort((a:any, b:any) => (b.c as number) - (a.c as number));

    // Z4 MOCKS: Clics en Whatsapp
    const wppClicks = evsAmbiente.filter((e:any) => e.tipo.includes('WPP') || e.tipo === 'Z3_NOTE_WPP');

    const dataCruda = evsAmbiente.slice(-30).map((e: any) => {
      const time = new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      let txt = e.tipo; let color = "text-zinc-500";
      if (e.tipo === 'SESSION_START') { txt = `NEW_IP: ${e.contexto?.geo || 'Local'}`; color = "text-blue-400"; }
      if (e.tipo === 'CLICK_ZONA') { txt = `CLICK (${e.detalle?.zona?.replace('Z1_','')?.replace('Z2_','')?.replace('Z3_','')})`; color = "text-amber-400"; }
      if (e.tipo.includes('WPP')) { txt = "WPP_CONTACT"; color = "text-green-400"; }
      if (e.tipo === 'FRICCION') { txt = "RAGE CLICK"; color = "text-red-400"; }
      if (e.tipo === 'Z3_LIKE') { txt = `FAVORITO Z3 (${e.detalle?.material})`; color = "text-pink-400"; }
      return { time, txt, color };
    });

    const formatTime = (ms: number) => {
      if (!ms) return "00:00m";
      const totalSeconds = Math.floor(ms / 1000);
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}m`;
    };

    const totalTimes = latestUpdates.reduce((acc: any, curr: any) => {
      const t = curr.detalle?.tiempos || {};
      return { Z1: (acc.Z1 || 0) + (t.Z1 || 0), Z2: (acc.Z2 || 0) + (t.Z2 || 0), Z3: (acc.Z3 || 0) + (t.Z3 || 0) };
    }, { Z1: 0, Z2: 0, Z3: 0 });

    setAnalytics({
      scroll: `${maxScroll}%`, slider: totalSliders.toString(), friccion: friccionEvents.toString(), tiempoTotal: formatTime(totalTimes.Z1 + totalTimes.Z2 + totalTimes.Z3),
      espectadores: sesiones.map((s, i) => {
        const evsDeSesion = evsAmbiente.filter((e: any) => e.sesion_id === s);
        const startEv = evsDeSesion.find((e: any) => e.tipo === 'SESSION_START');
        const ultimoEvento = evsDeSesion[evsDeSesion.length - 1];
        const fechaUltimo = ultimoEvento ? new Date(ultimoEvento.created_at) : new Date();
        const diffMinutos = Math.floor((now - fechaUltimo.getTime()) / 60000);
        let statusRel = 'Hace ' + diffMinutos + 'm';
        if (diffMinutos < 2) statusRel = 'Online';
        if (diffMinutos > 1440) statusRel = 'Ayer+';
        const ctx = startEv?.contexto || {};
        return {
          id: s, rol: i === 0 ? "Titular" : `Visita #${i+1}`, disp: ctx.plataforma || "Web", geo: ctx.geo || "Desconocido", isp: ctx.red || "-", bat: ctx.bateria || "-",
          statusRel, statusAbs: fechaUltimo.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }), statusClass: diffMinutos < 2 ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" : (isDark ? "text-zinc-400 bg-zinc-800 border-zinc-700" : "text-zinc-600 bg-zinc-200 border-zinc-300")
        };
      }),
      rankingClics, rankingLikes, logs: dataCruda, wppClicks: wppClicks.length,
      z1: { t: formatTime(totalTimes.Z1), c: dotsZ1.length, dots: dotsZ1 },
      z2: { t: formatTime(totalTimes.Z2), c: dotsZ2.length, dots: dotsZ2 },
      z3: { t: formatTime(totalTimes.Z3), c: dotsZ3.length, dots: dotsZ3 }
    });
  };

  if (!p || !analytics) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin text-amber-600 w-10 h-10" /></div>;
  const env = p.ambientes[activeTab] || {};
  const imgBg = env.obra || env.galeriaObra?.[0] || env.render || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800";

  const renderDots = (dots: any[]) => dots.map((d, i) => {
    let ringColor = "border-blue-500"; let dotColor = "bg-blue-400";
    if (d.c === 'dot-red') { ringColor = "border-red-500"; dotColor = "bg-red-500"; }
    if (d.c === 'dot-yellow') { ringColor = "border-amber-400"; dotColor = "bg-amber-400"; }
    return (
      <div key={i} className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-50" style={{ left: `${d.x}%`, top: `${d.y}%` }}>
         <div className={`w-8 h-8 rounded-full border-[3px] ${ringColor} opacity-70 animate-pulse`}></div>
         <div className={`absolute w-2 h-2 rounded-full ${dotColor} shadow-[0_0_8px_currentColor]`}></div>
      </div>
    );
  });

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-start p-4 md:p-8 transition-colors duration-300 font-sans ${colors.bgMain} ${colors.textMain}`}>
      <div className={`w-full max-w-[1400px] mb-8 flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4 border-b pb-4 ${colors.borderCard}`}>
        <div>
          <button onClick={() => navigate(`/admin/editar/${id}`)} className={`${colors.textMuted} hover:${colors.textMain} font-black text-[10px] uppercase tracking-widest mb-2 transition-colors`}><ArrowLeft size={14} className="inline mr-1"/> Volver al Editor</button>
          <h1 className="text-3xl font-black tracking-tighter italic leading-none">STUDIO<span className="text-amber-500">.MUD</span></h1>
          <p className={`text-[10px] font-bold ${colors.textMuted} uppercase tracking-widest mt-1 flex items-center gap-2`}>
            Centro Analítico <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select value={timeFilter} onChange={e=>setTimeFilter(e.target.value)} className={`appearance-none pl-9 pr-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-colors outline-none cursor-pointer ${isDark ? 'bg-zinc-800 text-zinc-200 border-zinc-700 hover:bg-zinc-700' : 'bg-white text-zinc-700 border-zinc-200 shadow-sm hover:bg-zinc-50'}`}>
              <option value="24h">Últimas 24h</option>
              <option value="7d">Esta Semana</option>
              <option value="all">Histórico</option>
            </select>
            <CalendarDays size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-zinc-400' : 'text-zinc-500'} pointer-events-none`} />
            <ChevronRight size={12} className={`absolute right-3 top-1/2 -translate-y-1/2 rotate-90 ${isDark ? 'text-zinc-400' : 'text-zinc-500'} pointer-events-none`} />
          </div>
          <div className={`w-px h-6 mx-1 hidden md:block ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>
          <button onClick={() => setTheme(isDark ? 'light' : 'dark')} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest border ${isDark ? 'bg-zinc-800 text-amber-400 border-zinc-700 hover:bg-zinc-700' : 'bg-zinc-900 text-white border-zinc-900 shadow-sm hover:bg-zinc-800'}`}>
            {isDark ? <Sun size={14}/> : <Moon size={14}/>}
          </button>
          <button onClick={purgarDatos} className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors text-[10px] font-black uppercase tracking-widest border ${isDark ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white shadow-sm'}`}>
            <Trash2 size={14} /> Purgar
          </button>
        </div>
      </div>

      {/* 3 COLUMNAS PC */}
      <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="flex flex-col h-[850px]">
          <div className={`w-full h-full border-[8px] rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col ${isDark ? 'bg-black border-zinc-800 ring-1 ring-white/10' : 'bg-white border-zinc-900 ring-1 ring-black/5'}`}>
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 rounded-b-3xl z-50 ${isDark ? 'bg-zinc-800' : 'bg-zinc-900'}`}></div>
            <div className={`pt-10 pb-0 px-5 relative z-40 ${isDark ? 'bg-[#111] border-white/5' : 'bg-zinc-100'} border-b`}>
              <h1 className={`font-black text-2xl leading-none tracking-tight ${isDark ? 'text-white' : 'text-zinc-900'} px-1 truncate`}>{p.cliente}</h1>
              <div className="flex gap-1 overflow-x-auto hide-scroll mt-4 pb-0">
                {p.ambientes.map((a:any, i:number) => (
                  <button key={i} onClick={() => setActiveTab(i)} className={`px-5 py-3 rounded-t-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === i ? (isDark ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900 shadow-sm border border-b-0') : (isDark ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-200' : 'bg-zinc-200 text-zinc-500 hover:text-zinc-700')}`}>{a.tab}</button>
                ))}
              </div>
            </div>
            {/* LIENZO SCROLLEABLE */}
            <div className={`flex-1 overflow-y-auto hide-scroll relative ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'} scroll-smooth`}>
               <div className="relative z-10 flex flex-col pb-32">
                 <div className="relative h-[65vh] min-h-[500px] w-full mb-8 rounded-b-[3rem] overflow-hidden">
                    <img src={imgBg} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isDark ? 'opacity-30 blur-[1px]' : 'opacity-40 blur-[2px]'}`} alt="bg"/>
                    <div className="absolute inset-0 border-b-2 border-dashed border-blue-500/50 bg-blue-500/10"></div>
                    <div className="absolute top-6 left-4 backdrop-blur-md bg-black/80 border border-white/10 rounded-xl p-2 px-3 flex gap-3 items-center z-40 shadow-xl">
                      <span className="text-[8px] font-black uppercase text-blue-400 tracking-widest">Z1: Render</span>
                      <div className="text-white font-black text-xs">{analytics.z1.t} <span className="text-zinc-400 text-[8px] ml-1 font-bold">• {analytics.z1.c} clics</span></div>
                    </div>
                    {renderDots(analytics.z1.dots)}
                 </div>
                 <div className="px-6 mb-8 text-transparent blur-sm selection:bg-transparent"><h2 className="text-4xl font-black italic">{env.titulo}</h2></div>
                 <div className="relative w-full px-5 mb-10">
                    <div className="relative bg-red-500/10 border-2 border-dashed border-red-500/50 rounded-[2rem] h-40 overflow-hidden">
                      <div className="absolute top-3 left-3 backdrop-blur-md bg-black/80 border border-white/10 rounded-xl p-2 px-3 flex gap-3 items-center z-40 shadow-xl">
                        <span className="text-[8px] font-black uppercase text-red-400 tracking-widest">Z2: Precio</span>
                        <div className="text-white font-black text-xs">{analytics.z2.t} <span className="text-zinc-400 text-[8px] ml-1 font-bold">• {analytics.z2.c} clics</span></div>
                      </div>
                      {renderDots(analytics.z2.dots)}
                    </div>
                 </div>
                 <div className="relative w-full px-5 mb-24">
                    <div className="relative w-full aspect-[4/5] rounded-[2.5rem] border-2 border-dashed border-amber-500/50 bg-amber-500/10 overflow-hidden">
                      <div className="absolute top-3 left-3 backdrop-blur-md bg-black/80 border border-white/10 rounded-xl p-2 px-3 flex gap-3 items-center z-40 shadow-xl">
                        <span className="text-[8px] font-black uppercase text-amber-400 tracking-widest">Z3: Detalles</span>
                        <div className="text-white font-black text-xs">{analytics.z3.t} <span className="text-zinc-400 text-[8px] ml-1 font-bold">• {analytics.z3.c} clics</span></div>
                      </div>
                      {renderDots(analytics.z3.dots)}
                    </div>
                 </div>
                 {/* Z4 WHATSAPP AL FINAL DEL SCROLL */}
                 <div className="relative w-full px-5 pb-10">
                    <div className="w-full bg-[#25D366]/20 border-2 border-dashed border-[#25D366] text-[#25D366] py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 relative overflow-hidden">
                      <MessageCircle size={20} /> Z4: Botón WhatsApp
                      {analytics.wppClicks > 0 && (
                        <div className="absolute top-[50%] left-[80%] z-50">
                           <div className="w-12 h-12 rounded-full border-[3px] border-[#25D366] opacity-80 absolute -top-6 -left-6 animate-ping"></div>
                           <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_15px_#25D366] absolute -top-1 -left-1"></div>
                        </div>
                      )}
                    </div>
                 </div>
               </div>
               <div className="absolute top-2 right-1 w-1.5 h-24 bg-white/20 rounded-full pointer-events-none"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:h-[850px] overflow-y-auto pb-10 hide-scroll">
          <div className="grid grid-cols-2 gap-4 shrink-0">
            <div className={`${colors.bgCard} border ${colors.borderCard} p-5 rounded-3xl shadow-sm transition-colors`}><p className={`text-[9px] font-black uppercase tracking-widest ${colors.textMuted} mb-1`}>Total</p><span className="text-2xl font-black text-indigo-500">{analytics.tiempoTotal}</span></div>
            <div className={`${colors.bgCard} border ${colors.borderCard} p-5 rounded-3xl shadow-sm transition-colors`}><p className={`text-[9px] font-black uppercase tracking-widest ${colors.textMuted} mb-1`}>Scroll</p><span className="text-2xl font-black text-emerald-500">{analytics.scroll}</span></div>
            <div className={`${colors.bgCard} border ${colors.borderCard} p-5 rounded-3xl shadow-sm transition-colors`}><p className={`text-[9px] font-black uppercase tracking-widest ${colors.textMuted} mb-1`}>Slider</p><span className="text-2xl font-black text-blue-500">{analytics.slider}<span className="text-xs text-blue-500/50 ml-1">mv</span></span></div>
            <div className={`${isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-100'} p-5 rounded-3xl shadow-sm transition-colors`}><p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">Rage Clicks</p><span className="text-2xl font-black text-red-500">{analytics.friccion}</span></div>
          </div>

          <div className={`${colors.bgCard} border ${colors.borderCard} p-6 rounded-[2rem] shadow-sm flex flex-col shrink-0 transition-colors h-64`}>
             <div className="flex justify-between items-center mb-4">
               <h2 className={`text-[10px] font-black uppercase tracking-widest ${colors.textMuted} flex items-center gap-2`}><Activity size={14}/> Espectadores</h2>
               <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${isDark ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{analytics.espectadores.length} IPs</span>
             </div>
             <div className="space-y-3 overflow-y-auto pr-2 hide-scroll">
               {analytics.espectadores.map((e:any, idx:number) => {
                 const isExpanded = expandedUser === idx;
                 return (
                   <div key={idx} className={`rounded-2xl transition-all duration-300 overflow-hidden border ${isExpanded ? colors.headerAcc : colors.bgCard} ${colors.borderCard} ${colors.bgHover}`}>
                     <div onClick={() => setExpandedUser(isExpanded ? null : idx)} className="p-3.5 flex justify-between items-center cursor-pointer">
                       <div className="flex items-center gap-3">
                         <div className={`w-7 h-7 rounded-xl text-[10px] font-black flex items-center justify-center ${idx === 0 ? (isDark ? 'bg-amber-500/20 text-amber-500' : 'bg-amber-100 text-amber-600') : (isDark ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-100 text-zinc-500')}`}>{idx + 1}</div>
                         <div className="flex flex-col">
                            <span className={`text-sm font-black ${colors.textMain} leading-none`}>{e.rol}</span>
                            {!isExpanded && <span className={`text-[9px] font-bold ${colors.textMuted} mt-1`}><Smartphone size={10} className="inline mr-1 -mt-0.5"/>{e.disp}</span>}
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                         <span className={`text-[9px] font-black px-2.5 py-1.5 rounded-lg border ${e.statusClass}`}>{e.statusRel}</span>
                         <ChevronRight size={16} className={`${colors.textMuted} transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                       </div>
                     </div>
                     {isExpanded && (
                       <div className={`px-4 pb-4 pt-1 grid grid-cols-2 gap-y-4 gap-x-2 border-t ${isDark ? 'border-zinc-700/50' : 'border-zinc-200/60'} mt-1`}>
                         <div><span className={`text-[8px] font-black ${colors.textMuted} uppercase tracking-widest flex items-center gap-1 mb-1`}><Smartphone size={10}/> Disp.</span><span className={`text-xs font-bold ${colors.textMain}`}>{e.disp}</span></div>
                         <div><span className={`text-[8px] font-black ${colors.textMuted} uppercase tracking-widest flex items-center gap-1 mb-1`}><MapPin size={10}/> Ubi.</span><span className={`text-xs font-bold ${colors.textMain}`}>{e.geo}</span></div>
                         <div><span className={`text-[8px] font-black ${colors.textMuted} uppercase tracking-widest flex items-center gap-1 mb-1`}><Wifi size={10}/> Red</span><span className={`text-xs font-bold ${colors.textMain}`}>{e.isp}</span></div>
                         <div><span className={`text-[8px] font-black ${colors.textMuted} uppercase tracking-widest flex items-center gap-1 mb-1`}><BatteryMedium size={10}/> Bat.</span><span className={`text-xs font-bold ${colors.textMain}`}>{e.bat}</span></div>
                       </div>
                     )}
                   </div>
                 );
               })}
             </div>
          </div>

          <div className={`${colors.bgCard} border ${colors.borderCard} p-6 rounded-[2rem] shadow-sm flex-1 transition-colors flex flex-col`}>
            <h2 className={`text-[10px] font-black uppercase tracking-widest text-pink-500 mb-4 flex items-center gap-2`}><Heart size={14} className="fill-pink-500"/> Favoritos Z3 (Me Gusta)</h2>
            <div className="space-y-2 overflow-y-auto hide-scroll">
                {analytics.rankingLikes && analytics.rankingLikes.length > 0 ? analytics.rankingLikes.map((r:any, i:number) => (
                  <div key={i} className={`flex justify-between items-center p-3 rounded-xl border ${i === 0 ? (isDark ? 'bg-pink-500/10 border-pink-500/20' : 'bg-pink-50 border-pink-200') : (isDark ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-zinc-50 border-zinc-200')}`}>
                    <div className="flex items-center gap-3"><span className="text-lg">{i === 0 ? '🏆' : <span className={`text-xs font-black px-1 ${colors.textMuted}`}>{i+1}º</span>}</span><span className={`text-sm font-bold ${i === 0 ? (isDark?'text-pink-500':'text-pink-700') : colors.textMain}`}>{r.n}</span></div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md flex items-center gap-1 ${i === 0 ? (isDark ? 'bg-pink-500/20 text-pink-400' : 'bg-pink-200 text-pink-800') : (isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-600')}`}><Heart size={10} className={i===0?"fill-pink-400":""}/> {r.c}</span>
                  </div>
                )) : <div className={`text-center p-4 text-xs font-bold uppercase tracking-widest ${colors.textMuted}`}>Aún no hay "Me gusta"</div>}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:h-[850px] overflow-y-auto pb-10 hide-scroll">
          <div className={`${colors.bgCard} border ${colors.borderCard} p-6 rounded-[2rem] shadow-sm shrink-0 transition-colors`}>
            <h2 className={`text-[10px] font-black uppercase tracking-widest ${colors.textMuted} mb-4 flex items-center gap-2`}><Monitor size={14}/> Exploración Z3 (Clics)</h2>
            <div className="space-y-2">
                {analytics.rankingClics && analytics.rankingClics.length > 0 ? analytics.rankingClics.map((r:any, i:number) => (
                  <div key={i} className={`flex justify-between items-center p-3 rounded-xl border ${isDark ? 'bg-zinc-800/50 border-zinc-700/50' : 'bg-zinc-50 border-zinc-200'}`}>
                    <div className="flex items-center gap-3"><span className={`text-xs font-black px-1 ${colors.textMuted}`}>{i+1}º</span><span className={`text-sm font-bold ${colors.textMain}`}>{r.n}</span></div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md ${isDark ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-200 text-zinc-600'}`}>{r.c} clics</span>
                  </div>
                )) : <div className={`text-center p-4 text-xs font-bold uppercase tracking-widest ${colors.textMuted}`}>Sin clics en Z3</div>}
            </div>
          </div>

          <div className={`bg-indigo-950/40 border border-indigo-500/20 p-8 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col shrink-0 transition-colors ${!isDark && 'bg-indigo-50 border-indigo-200'}`}>
             <div className={`absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-500/20'}`}></div>
             <div className="flex items-center gap-4 mb-6 relative z-10">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isDark ? 'bg-indigo-500 text-white shadow-indigo-500/20 ring-1 ring-indigo-400/50' : 'bg-indigo-600 text-white shadow-indigo-200'}`}><Cpu size={28} strokeWidth={2}/></div>
                 <div><h3 className={`text-lg font-black uppercase tracking-widest leading-none mb-1 ${isDark ? 'text-white' : 'text-indigo-900'}`}>Asistente IA</h3><p className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-500'}`}>Estrategia</p></div>
             </div>
             <div className="relative z-10">
                 <p className={`text-[14px] leading-relaxed font-medium ${isDark ? 'text-indigo-200' : 'text-indigo-900/80'}`}>El cliente revisó los renders. {analytics.rankingLikes?.length > 0 ? `El material ${analytics.rankingLikes[0].n} es el favorito.` : 'Aún explorando materiales.'} Registramos {analytics.wppClicks} intentos de contacto Wpp.</p>
             </div>
          </div>

          <div className={`${isDark ? 'bg-black border-zinc-800' : 'bg-zinc-900 border-zinc-900'} border p-6 rounded-[2.5rem] shadow-sm flex-1 flex flex-col overflow-hidden`}>
             <div className="flex items-center gap-2 mb-4 pb-4 border-b border-zinc-800">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Data Cruda (En Vivo)</h3>
             </div>
             <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 font-mono text-[10px]">
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