import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle2, MessageCircle, Edit3, Eye, EyeOff, Image as ImageIcon, 
  DollarSign, Plus, ArrowLeft, Trash2, Loader2, Link as LinkIcon, Check, Upload, 
  LogOut, Lock, ArrowLeftRight, ChevronRight, ChevronLeft, X,
  Activity, Play, Monitor, Link2, UploadCloud, Settings, LayoutDashboard,
  Smartphone, MapPin, Wifi, BatteryMedium, Cpu, Zap, Sun, Moon, CalendarDays, RefreshCw, Info, Share2, Layers, Trophy, Heart, MessageSquarePlus, ThumbsUp, Maximize, Phone,
  Type, SlidersHorizontal, List, Columns, BookOpen, PenTool, Hammer, Truck, Box, Settings2, Paperclip, ArrowUpFromLine, ArrowDownToLine, AlignLeft
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
      
      // NUEVOS VALORES POR DEFECTO PARA EL SISTEMA AVANZADO
      mostrarSumaAmbiente: true,
      posicionTotalClasico: 'arriba',
      
      items: [
        { id: crypto.randomUUID(), lbl: 'Materiales', val: 'USD 0', incluido: true },
        { id: crypto.randomUUID(), lbl: 'Diseño y Montaje', val: 'USD 0', incluido: true }
      ],
      variantes: [],
      
      manifiesto: "Nuestro objetivo es cuidar tu inversión. Te cobramos únicamente por nuestro talento y horas de taller. Los materiales los pagás al costo real de fábrica.",
      honTitulo: "Tu Equipo de Diseño", honMonto: "9.225", honDesc: "Mano de obra, ingeniería milimétrica, mecanizado de precisión y montaje final en tu hogar.",
      honList: ['Ingeniería y Diseño 3D', 'Mecanizado en Taller', 'Montaje en Domicilio'], 
      matTitulo: "Materia Prima", matMonto: "9.225", matTag: "Al Costo", matDesc: "Placas, herrajes e insumos físicos pagados directamente de tu bolsillo al proveedor.",
      matList: ['Placas y Maderas', 'Herrajes Internos', 'Pago directo a fábrica'], 
      totalTitulo: "Inversión Final Estimada"
    };

    const configuracionInicial = {
      moneda: "USD", navegacion: "tabs", cantAmbientes: 1,
      brandName1: "STUDIO", brandName2: ".MUD", brandSubtitle: "Diseño a Medida",
      headerOpacity: 70, modeloVenta: "clasico", presetActivo: "socio",
      tipoDetalle: "lista", mostrarIconos: true, posicionTotalAvanzado: "abajo", mostrarTotalGlobal: true
    };

    const { data, error } = await supabase.from('proyectos').insert([{
      cliente: "Nuevo Cliente", whatsapp: "549",
      configuracion: configuracionInicial,
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

// --- VISTA 2: EDITOR AVANZADO ---
function AdminEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(0); // Ambiente Activo
  const [activeVarTab, setActiveVarTab] = useState(0); 
  const [subiendo, setSubiendo] = useState({ obra: false, render: false, variante: false });
  const [copiedStates, setCopiedStates] = useState<any>({});
  
  const z3CanvasRef = useRef<HTMLDivElement>(null);
  const [editingPoint, setEditingPoint] = useState<string | null>(null);

  useEffect(() => {
    const fetchProyecto = async () => {
      const { data } = await supabase.from('proyectos').select('*').eq('id', id).single();
      if (data) {
        // Migración de datos viejos si faltan
        if(!data.configuracion.modeloVenta) data.configuracion.modeloVenta = 'clasico';
        if(data.configuracion.headerOpacity === undefined) data.configuracion.headerOpacity = 70;
        
        data.ambientes.forEach((env:any) => {
          if(!env.honList) {
             env.honList = ['Diseño 3D y Planimetría', 'Manufactura en taller', 'Flete y Montaje in situ'];
             env.matList = ['Placas y Maderas', 'Herrajes Internos', 'Pago directo a fábrica'];
             env.honTitulo = "Servicio Integral"; env.matTitulo = "Materia Prima";
             env.posicionTotalClasico = 'arriba'; env.mostrarSumaAmbiente = true;
          }
        });
        setP(data);
      }
    };
    fetchProyecto();
  }, [id]);

  const updateGlobal = async (updates: any) => {
    const newP = { ...p, ...updates };
    setP(newP);
    await supabase.from('proyectos').update(updates).eq('id', id);
  };

  const updateConfig = (key: string, val: any) => updateGlobal({ configuracion: { ...p.configuracion, [key]: val } });
  const updateConfigMultiple = (updates: any) => updateGlobal({ configuracion: { ...p.configuracion, ...updates } });

  const updateEnv = (key: string, val: any) => {
    const nuevosAmb = [...p.ambientes];
    nuevosAmb[activeTab][key] = val;
    updateGlobal({ ambientes: nuevosAmb });
  };
  
  const updateEnvMultiple = (updates: any) => {
    const nuevosAmb = [...p.ambientes];
    nuevosAmb[activeTab] = { ...nuevosAmb[activeTab], ...updates };
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
      mostrarSumaAmbiente: true, posicionTotalClasico: 'arriba',
      items: [{ id: crypto.randomUUID(), lbl: 'Materiales', val: '0', incluido: true }, { id: crypto.randomUUID(), lbl: 'Diseño y Montaje', val: '0', incluido: true }],
      variantes: [],
      manifiesto: "Nuestro objetivo es cuidar tu inversión. Te cobramos únicamente por nuestro talento y horas de taller.",
      honTitulo: "Tu Equipo de Diseño", honMonto: "0", honDesc: "Mano de obra y montaje.", honList: ['Diseño 3D', 'Manufactura', 'Montaje'], 
      matTitulo: "Materia Prima", matMonto: "0", matTag: "Al Costo", matDesc: "Insumos físicos.", matList: ['Maderas', 'Herrajes', 'Insumos'], 
      totalTitulo: "Inversión Final Estimada"
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

  // Z3 Handlers
  const handleAddVariante = () => {
    const envAt = p.ambientes[activeTab];
    const vars = envAt.variantes || [];
    updateEnv('variantes', [...vars, { id: crypto.randomUUID(), nombre: `Opción ${vars.length + 1}`, img: '', puntos: [] }]);
    setActiveVarTab(vars.length);
  };
  const handleRemoveVariante = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("¿Eliminar variante?")) return;
    const envAt = p.ambientes[activeTab];
    const vars = envAt.variantes || [];
    updateEnv('variantes', vars.filter((_:any, i:number) => i !== idx));
    setActiveVarTab(0);
  };
  const updateVarianteName = (val: string) => {
    const vars = [...(p.ambientes[activeTab].variantes || [])];
    if (vars[activeVarTab]) { vars[activeVarTab].nombre = val; updateEnv('variantes', vars); }
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
    const newVars = [...vars];
    newVars[activeVarTab].puntos = [...(varActual.puntos || []), { id: newPuntoId, x, y, material: 'Nuevo Material' }];
    updateEnv('variantes', newVars);
    setEditingPoint(newPuntoId); 
  };
  const updatePuntoMaterial = (puntoId: string, val: string) => {
    const vars = [...(p.ambientes[activeTab].variantes || [])];
    if (vars[activeVarTab]) {
      vars[activeVarTab].puntos = vars[activeVarTab].puntos.map((pt:any) => pt.id === puntoId ? { ...pt, material: val } : pt);
      updateEnv('variantes', vars);
    }
  };
  const removePunto = (puntoId: string) => {
    const vars = [...(p.ambientes[activeTab].variantes || [])];
    if (vars[activeVarTab]) {
      vars[activeVarTab].puntos = vars[activeVarTab].puntos.filter((pt:any) => pt.id !== puntoId);
      updateEnv('variantes', vars);
      setEditingPoint(null);
    }
  };
  const handleKeyDownPunto = (e: React.KeyboardEvent, ptId: string) => { if (e.key === 'Enter') setEditingPoint(null); };

  // Items Z2 Clásico Handlers
  const handleAddItem = () => {
    const envAt = p.ambientes[activeTab];
    const itemsActuales = envAt.items || [];
    updateEnv('items', [...itemsActuales, { id: crypto.randomUUID(), lbl: 'Nuevo Ítem', val: '0', incluido: false }]);
  };
  const updateItem = (itemId: string, key: string, value: any) => {
    const itemsActuales = p.ambientes[activeTab].items || [];
    updateEnv('items', itemsActuales.map((it:any) => it.id === itemId ? { ...it, [key]: value } : it));
  };
  const deleteItem = (itemId: string) => {
    const itemsActuales = p.ambientes[activeTab].items || [];
    updateEnv('items', itemsActuales.filter((it:any) => it.id !== itemId));
  };

  // PRESETS MÁGICOS
  const aplicarPreset = (tipo: string, changeModelToPresets = false) => {
    const nextConf: any = { presetActivo: tipo };
    if (changeModelToPresets) nextConf.modeloVenta = 'presets';
    
    if (tipo === 'socio') { nextConf.tipoDetalle = 'texto'; nextConf.posicionTotalAvanzado = 'abajo'; } 
    else if (tipo === 'cero') { nextConf.tipoDetalle = 'lista'; nextConf.mostrarIconos = true; nextConf.posicionTotalAvanzado = 'arriba'; } 
    else if (tipo === 'premium') { nextConf.tipoDetalle = 'lista'; nextConf.mostrarIconos = false; nextConf.posicionTotalAvanzado = 'abajo'; }
    updateConfigMultiple(nextConf);

    if (tipo === 'socio') {
      updateEnvMultiple({
        manifiesto: "Nuestro objetivo es cuidar tu inversión. Te cobramos únicamente por nuestro talento y horas de taller. Los materiales los pagás al costo real de fábrica, sin intermediarios ni sobreprecios.",
        honTitulo: "Tu Equipo de Diseño", honDesc: "Mano de obra, ingeniería milimétrica, mecanizado de precisión y montaje final en tu hogar.", honList: ['Ingeniería y Diseño 3D', 'Mecanizado en Taller', 'Montaje en Domicilio'],
        matTitulo: "Materia Prima", matTag: "Al Costo", matDesc: "Placas, herrajes e insumos físicos pagados directamente de tu bolsillo al proveedor.", matList: ['Placas y Maderas', 'Herrajes Internos', 'Pago directo a fábrica'],
        totalTitulo: "Inversión Final Estimada"
      });
    } else if (tipo === 'cero') {
      updateEnvMultiple({
        manifiesto: "Separamos estrictamente nuestro trabajo de tus materiales. No aplicamos comisiones ocultas sobre la madera o herrajes. Abonás los insumos directo al proveedor y a nosotros, la mano de obra.",
        honTitulo: "Servicio Integral", honDesc: "Diseño 3D, planimetría de corte, armado de módulos en taller y logística de instalación.", honList: ['Diseño 3D y Planos', 'Mano de Obra', 'Logística e Instalación'],
        matTitulo: "Insumos Físicos", matTag: "0% Comisión", matDesc: "Maderas, cantos y perfilería comprada de forma directa utilizando nuestros descuentos.", matList: ['Maderas y Placas', 'Herrajes Premium', '0% Comisiones ocultas'],
        totalTitulo: "Total del Proyecto"
      });
    } else if (tipo === 'premium') {
      updateEnvMultiple({
        manifiesto: "Creemos que tu presupuesto debe invertirse en la calidad de tu casa, no en comisiones comerciales. Accedés a nuestra red de proveedores a precio de costo, pagando solo nuestro servicio integral.",
        honTitulo: "Honorarios Profesionales", honDesc: "Comprende el relevamiento espacial, desarrollo del modelo 3D, manufactura especializada y montaje.", honList: ['Relevamiento y 3D', 'Manufactura Especializada', 'Montaje de Alta Precisión'],
        matTitulo: "Calidad Estructural", matTag: "Red Directa", matDesc: "Cubre la totalidad de placas premium, herrajes con cierre suave y componentes estructurales.", matList: ['Materiales de Vanguardia', 'Cierres Suaves Blumotion', 'Estructura Garantizada'],
        totalTitulo: "Inversión Total"
      });
    }
  };

  const updateList = (listName: string, index: number, value: string) => {
    const envAt = p.ambientes[activeTab];
    const newList = [...(envAt[listName] || [])];
    newList[index] = value;
    updateEnv(listName, newList);
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
          
          {/* COLUMNA IZQUIERDA: CONFIGURACIÓN GLOBAL */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-zinc-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-[3rem] pointer-events-none"></div>
              <h2 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-6 flex items-center gap-2"><Settings size={14}/> Identidad & Configuración</h2>
              <div className="space-y-5">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1 block">Nombre Cliente</label>
                  <input className="w-full bg-zinc-50 px-4 py-3.5 rounded-xl font-bold text-zinc-900 outline-none border border-zinc-200 focus:border-amber-500 focus:bg-white transition" value={p.cliente} onChange={e=>updateGlobal({cliente: e.target.value})} />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-1 block">WhatsApp (Botón Final)</label>
                  <input className="w-full bg-zinc-50 px-4 py-3.5 rounded-xl font-bold text-zinc-900 outline-none border border-zinc-200 focus:border-amber-500 focus:bg-white transition" value={p.whatsapp} onChange={e=>updateGlobal({whatsapp: e.target.value})} />
                </div>
                
                {/* Branding Textos */}
                <div className="pt-4 border-t border-zinc-100">
                  <label className="text-[9px] font-black uppercase tracking-widest text-amber-600 ml-1 mb-2 block flex items-center gap-1.5"><Type size={12}/> Textos del Cabezal</label>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input className="w-full bg-zinc-50 px-3 py-2.5 rounded-xl font-black text-zinc-900 outline-none border border-zinc-200 focus:border-amber-500 transition text-sm" value={c.brandName1} onChange={e => updateConfig('brandName1', e.target.value)} placeholder="Ej: STUDIO" />
                    <input className="w-full bg-amber-50/50 px-3 py-2.5 rounded-xl font-black text-amber-700 outline-none border border-amber-200 focus:border-amber-500 transition text-sm" value={c.brandName2} onChange={e => updateConfig('brandName2', e.target.value)} placeholder="Ej: .MUD" />
                  </div>
                  <input className="w-full bg-zinc-50 px-3 py-2.5 rounded-xl font-bold text-zinc-600 outline-none border border-zinc-200 focus:border-amber-500 transition text-sm" value={c.brandSubtitle} onChange={e => updateConfig('brandSubtitle', e.target.value)} placeholder="Subtítulo (Ej: Diseño a Medida)" />
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
                
                {/* Opciones de Totales Globales */}
                <div className="pt-4 border-t border-zinc-100">
                   <div className="flex items-center justify-between bg-zinc-50 p-3 rounded-xl border border-zinc-200 h-[42px] mb-2">
                     <span className="text-xs font-bold text-zinc-700">Mostrar "Total General" al final</span>
                     <div onClick={() => updateConfig('mostrarTotalGlobal', !c.mostrarTotalGlobal)} className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 ${c.mostrarTotalGlobal ? 'bg-emerald-500' : 'bg-zinc-300'}`}>
                       <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${c.mostrarTotalGlobal ? 'translate-x-4' : 'translate-x-0'}`}></div>
                     </div>
                   </div>
                   <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 flex items-center gap-4">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest whitespace-nowrap">Banner Vidrio</span>
                      <input type="range" min="0" max="100" step="5" className="flex-1 accent-amber-500 h-2 bg-zinc-300 rounded-lg appearance-none cursor-pointer" value={c.headerOpacity} onChange={(e) => updateConfig('headerOpacity', Number(e.target.value))} />
                      <span className="text-[10px] font-black text-amber-600 bg-amber-100/50 px-2 py-0.5 rounded-md">{c.headerOpacity}%</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: EDITOR DEL AMBIENTE */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* TABS DE AMBIENTES */}
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

              {/* Z1: RENDER Y OBRA */}
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

              {/* Z2: INVERSIÓN (ARQUITECTURA PROGRESIVA) */}
              <div className="pt-10 border-t border-zinc-100">
                 
                 <div className="mb-6">
                   <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-3 ml-1 flex items-center gap-2"><DollarSign size={14}/> Estrategia de Precios (Z2)</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button onClick={() => updateConfig('modeloVenta', 'clasico')} className={`p-4 rounded-2xl border text-left transition-all ${c.modeloVenta === 'clasico' ? 'bg-amber-50 border-amber-400 shadow-md ring-1 ring-amber-400' : 'bg-zinc-50 border-zinc-200 hover:bg-white'}`}>
                        <List size={18} className={`mb-3 ${c.modeloVenta === 'clasico' ? 'text-amber-600' : 'text-zinc-400'}`} />
                        <h4 className={`text-sm font-black mb-1 ${c.modeloVenta === 'clasico' ? 'text-amber-900' : 'text-zinc-700'}`}>1. Clásico Flexible</h4>
                        <p className={`text-[9px] leading-relaxed font-bold uppercase tracking-wider ${c.modeloVenta === 'clasico' ? 'text-amber-600/70' : 'text-zinc-400'}`}>Precio global e ítems editables que se suman/restan.</p>
                      </button>
                      <button onClick={() => aplicarPreset('socio', true)} className={`p-4 rounded-2xl border text-left transition-all ${c.modeloVenta === 'presets' ? 'bg-amber-50 border-amber-400 shadow-md ring-1 ring-amber-400' : 'bg-zinc-50 border-zinc-200 hover:bg-white'}`}>
                        <Zap size={18} className={`mb-3 ${c.modeloVenta === 'presets' ? 'text-amber-600' : 'text-zinc-400'}`} />
                        <h4 className={`text-sm font-black mb-1 ${c.modeloVenta === 'presets' ? 'text-amber-900' : 'text-zinc-700'}`}>2. Presets Rápidos</h4>
                        <p className={`text-[9px] leading-relaxed font-bold uppercase tracking-wider ${c.modeloVenta === 'presets' ? 'text-amber-600/70' : 'text-zinc-400'}`}>Plantillas armadas (Socio, 0% Markup, Premium). 1 clic.</p>
                      </button>
                      <button onClick={() => updateConfig('modeloVenta', 'avanzado')} className={`p-4 rounded-2xl border text-left transition-all ${c.modeloVenta === 'avanzado' ? 'bg-amber-50 border-amber-400 shadow-md ring-1 ring-amber-400' : 'bg-zinc-50 border-zinc-200 hover:bg-white'}`}>
                        <Sliders size={18} className={`mb-3 ${c.modeloVenta === 'avanzado' ? 'text-amber-600' : 'text-zinc-400'}`} />
                        <h4 className={`text-sm font-black mb-1 ${c.modeloVenta === 'avanzado' ? 'text-amber-900' : 'text-zinc-700'}`}>3. Avanzado</h4>
                        <p className={`text-[9px] leading-relaxed font-bold uppercase tracking-wider ${c.modeloVenta === 'avanzado' ? 'text-amber-600/70' : 'text-zinc-400'}`}>100% Configurable. Posiciones, íconos y textos a medida.</p>
                      </button>
                   </div>
                 </div>

                 {/* TOTAL BASE */}
                 <div className="mb-6 p-5 bg-zinc-900 rounded-[2rem] flex items-center gap-4 shadow-inner border border-zinc-800">
                    <div className="flex-1">
                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-1 block">Suma Base (Afecta los totales)</label>
                      <input className="bg-transparent text-3xl font-black text-white outline-none w-full border-b border-zinc-700 focus:border-amber-500 pb-1 transition-colors" value={env.total} onChange={e => updateEnv('total', e.target.value)} />
                    </div>
                    <span className="text-amber-500 font-black text-xl px-4">{c.moneda}</span>
                 </div>

                 {/* EDITOR SEGÚN MODO */}
                 <div className="bg-zinc-50/50 p-6 rounded-[2rem] border border-zinc-200 animate-in fade-in duration-300">
                    
                    {c.modeloVenta === 'clasico' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                          <div>
                            <span className="text-xs font-bold text-zinc-800 block">Posición del Precio Total</span>
                            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">¿Arriba de la lista o abajo?</span>
                          </div>
                          <div className="flex bg-zinc-50 rounded-lg border border-zinc-200 p-1">
                            <button onClick={() => updateEnv('posicionTotalClasico', 'arriba')} className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${env.posicionTotalClasico === 'arriba' ? 'bg-amber-50 text-amber-700 font-black text-[9px] uppercase tracking-wider shadow-sm' : 'text-zinc-400 text-[9px] uppercase tracking-wider font-bold'}`}><ArrowUpFromLine size={12}/> Arriba</button>
                            <button onClick={() => updateEnv('posicionTotalClasico', 'abajo')} className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${env.posicionTotalClasico === 'abajo' ? 'bg-amber-50 text-amber-700 font-black text-[9px] uppercase tracking-wider shadow-sm' : 'text-zinc-400 text-[9px] uppercase tracking-wider font-bold'}`}><ArrowDownToLine size={12}/> Abajo</button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 block">Ítems (Checklist)</label>
                          {currentItems.map((item:any) => (
                            <div key={item.id} className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${item.incluido ? 'bg-white border-zinc-200 shadow-sm' : 'bg-amber-50/50 border-amber-200 border-dashed'}`}>
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
                          <button onClick={handleAddItem} className="w-full py-4 border-2 border-dashed border-zinc-300 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 transition-all flex items-center justify-center gap-2 mt-2"><Plus size={14}/> Agregar Ítem</button>
                        </div>
                      </div>
                    )}

                    {c.modeloVenta === 'presets' && (
                      <div className="space-y-6">
                        <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 flex flex-col gap-3">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2"><BookOpen size={14}/> Plantillas Preconfiguradas</h3>
                          <div className="flex gap-2">
                            <button onClick={() => aplicarPreset('socio')} className={`flex-1 py-3 border rounded-xl text-[9px] font-black uppercase tracking-widest transition shadow-sm flex justify-center items-center gap-1.5 ${c.presetActivo === 'socio' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'}`}><span className="text-sm">🫂</span> Socio</button>
                            <button onClick={() => aplicarPreset('cero')} className={`flex-1 py-3 border rounded-xl text-[9px] font-black uppercase tracking-widest transition shadow-sm flex justify-center items-center gap-1.5 ${c.presetActivo === 'cero' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'}`}><span className="text-sm">🛡️</span> 0% Markup</button>
                            <button onClick={() => aplicarPreset('premium')} className={`flex-1 py-3 border rounded-xl text-[9px] font-black uppercase tracking-widest transition shadow-sm flex justify-center items-center gap-1.5 ${c.presetActivo === 'premium' ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-amber-700 border-amber-200 hover:bg-amber-50'}`}><span className="text-sm">💎</span> Premium</button>
                          </div>
                        </div>
                        <div className="space-y-4 pt-4 border-t border-zinc-200">
                           <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 block">Edición rápida de textos</label>
                           <textarea className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-xl text-xs font-bold text-zinc-700 outline-none focus:border-amber-500 resize-none h-20 shadow-sm" value={env.manifiesto} onChange={e => updateEnv('manifiesto', e.target.value)} placeholder="Manifiesto..." />
                           <div className="grid grid-cols-2 gap-4">
                             <input className="bg-white shadow-sm border border-zinc-200 px-3 py-2.5 rounded-lg text-xs font-bold outline-none focus:border-amber-500" value={env.honTitulo} onChange={e => updateEnv('honTitulo', e.target.value)} placeholder="Título Servicio" />
                             <input className="bg-white shadow-sm border border-zinc-200 px-3 py-2.5 rounded-lg text-xs font-bold outline-none focus:border-amber-500" value={env.matTitulo} onChange={e => updateEnv('matTitulo', e.target.value)} placeholder="Título Materiales" />
                           </div>
                        </div>
                      </div>
                    )}

                    {c.modeloVenta === 'avanzado' && (
                      <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-amber-50/50 p-5 rounded-2xl border border-amber-100">
                          <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-amber-200/60 shadow-sm md:col-span-2">
                            <span className="text-xs font-bold text-zinc-700 px-2">Visualización de Detalles</span>
                            <div className="flex bg-zinc-50 rounded-md border border-zinc-200 p-0.5">
                              <button onClick={() => updateConfig('tipoDetalle', 'texto')} className={`px-4 py-1.5 rounded transition-colors flex items-center gap-1.5 ${c.tipoDetalle === 'texto' ? 'bg-amber-50 text-amber-700 font-black text-[9px] uppercase tracking-wider' : 'text-zinc-400 text-[9px] uppercase tracking-wider font-bold'}`}><AlignLeft size={12}/> Párrafo</button>
                              <button onClick={() => updateConfig('tipoDetalle', 'lista')} className={`px-4 py-1.5 rounded transition-colors flex items-center gap-1.5 ${c.tipoDetalle === 'lista' ? 'bg-amber-50 text-amber-700 font-black text-[9px] uppercase tracking-wider' : 'text-zinc-400 text-[9px] uppercase tracking-wider font-bold'}`}><List size={12}/> Lista</button>
                            </div>
                          </div>
                          
                          {c.tipoDetalle === 'lista' && (
                            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-amber-200/60 shadow-sm animate-in fade-in">
                              <span className="text-xs font-bold text-zinc-700">Íconos Visibles</span>
                              <div onClick={() => updateConfig('mostrarIconos', !c.mostrarIconos)} className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 shadow-inner ${c.mostrarIconos ? 'bg-emerald-500' : 'bg-zinc-300'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${c.mostrarIconos ? 'translate-x-4' : 'translate-x-0'}`}></div>
                              </div>
                            </div>
                          )}

                          <div className={`flex items-center justify-between bg-white p-2 rounded-lg border border-amber-200/60 shadow-sm ${c.tipoDetalle === 'texto' ? 'md:col-span-2' : ''}`}>
                            <span className="text-xs font-bold text-zinc-700 px-2">Posición Total</span>
                            <div className="flex bg-zinc-50 rounded-md border border-zinc-200 p-0.5">
                              <button onClick={() => updateConfig('posicionTotalAvanzado', 'arriba')} className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${c.posicionTotalAvanzado === 'arriba' ? 'bg-amber-50 text-amber-700 font-black text-[9px] uppercase tracking-wider' : 'text-zinc-400 text-[9px] uppercase tracking-wider font-bold'}`}><ArrowUpFromLine size={12}/> Arriba</button>
                              <button onClick={() => updateConfig('posicionTotalAvanzado', 'abajo')} className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${c.posicionTotalAvanzado === 'abajo' ? 'bg-amber-50 text-amber-700 font-black text-[9px] uppercase tracking-wider' : 'text-zinc-400 text-[9px] uppercase tracking-wider font-bold'}`}><ArrowDownToLine size={12}/> Abajo</button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6 pt-4 border-t border-zinc-200">
                          <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-2 block">Manifiesto de Transparencia</label>
                            <textarea className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-xl text-xs font-bold text-zinc-700 outline-none focus:border-amber-500 resize-none h-20 shadow-sm" value={env.manifiesto} onChange={e => updateEnv('manifiesto', e.target.value)} />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Pilar 1 */}
                            <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm space-y-3">
                               <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-800 mb-3 border-b border-zinc-100 pb-2">Bloque 1 (Servicio)</h4>
                               <input className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg text-sm font-bold outline-none focus:border-amber-500 focus:bg-white transition" value={env.honTitulo} onChange={e => updateEnv('honTitulo', e.target.value)} placeholder="Título"/>
                               <input className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg text-sm font-black text-amber-600 outline-none focus:border-amber-500 focus:bg-white transition" value={env.honMonto} onChange={e => updateEnv('honMonto', e.target.value)} placeholder="Monto" />
                               
                               {c.tipoDetalle === 'texto' ? (
                                 <textarea className="w-full bg-zinc-50 border border-zinc-200 px-3 py-3 rounded-lg text-xs outline-none focus:border-amber-500 focus:bg-white transition resize-none h-24 mt-2" value={env.honDesc} onChange={e => updateEnv('honDesc', e.target.value)} placeholder="Párrafo..." />
                               ) : (
                                 <div className="space-y-2 mt-2">
                                    <input className="w-full bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-amber-500 focus:bg-white transition" value={env.honList[0]} onChange={(e) => updateList('honList', 0, e.target.value)} />
                                    <input className="w-full bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-amber-500 focus:bg-white transition" value={env.honList[1]} onChange={(e) => updateList('honList', 1, e.target.value)} />
                                    <input className="w-full bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-amber-500 focus:bg-white transition" value={env.honList[2]} onChange={(e) => updateList('honList', 2, e.target.value)} />
                                 </div>
                               )}
                            </div>

                            {/* Pilar 2 */}
                            <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm space-y-3">
                               <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-800 mb-3 border-b border-zinc-100 pb-2">Bloque 2 (Materiales)</h4>
                               <div className="flex gap-2">
                                 <input className="flex-1 bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg text-sm font-bold outline-none focus:border-amber-500 focus:bg-white transition" value={env.matTitulo} onChange={e => updateEnv('matTitulo', e.target.value)} placeholder="Título"/>
                                 <input className="w-1/3 bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest outline-none focus:border-emerald-500 text-center" value={env.matTag} onChange={e => updateEnv('matTag', e.target.value)} placeholder="Tag" />
                               </div>
                               <input className="w-full bg-zinc-50 border border-zinc-200 px-3 py-2 rounded-lg text-sm font-black text-amber-600 outline-none focus:border-amber-500 focus:bg-white transition" value={env.matMonto} onChange={e => updateEnv('matMonto', e.target.value)} placeholder="Monto" />
                               
                               {c.tipoDetalle === 'texto' ? (
                                 <textarea className="w-full bg-zinc-50 border border-zinc-200 px-3 py-3 rounded-lg text-xs outline-none focus:border-amber-500 focus:bg-white transition resize-none h-24 mt-2" value={env.matDesc} onChange={e => updateEnv('matDesc', e.target.value)} placeholder="Párrafo..." />
                               ) : (
                                 <div className="space-y-2 mt-2">
                                    <input className="w-full bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-amber-500 focus:bg-white transition" value={env.matList[0]} onChange={(e) => updateList('matList', 0, e.target.value)} />
                                    <input className="w-full bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-amber-500 focus:bg-white transition" value={env.matList[1]} onChange={(e) => updateList('matList', 1, e.target.value)} />
                                    <input className="w-full bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-lg text-xs outline-none focus:border-amber-500 focus:bg-white transition" value={env.matList[2]} onChange={(e) => updateList('matList', 2, e.target.value)} />
                                 </div>
                               )}
                            </div>
                          </div>

                          <div>
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-2 block">Título Total Inferior</label>
                            <input className="w-full bg-white border border-zinc-200 px-4 py-3 rounded-xl text-sm font-bold text-zinc-900 outline-none focus:border-amber-500 shadow-sm" value={env.totalTitulo} onChange={e => updateEnv('totalTitulo', e.target.value)} />
                          </div>
                        </div>
                      </div>
                    )}
                 </div>

                 {/* Mostrar Total de Este Ambiente (Solo aplicable si no es clásico) */}
                 {c.modeloVenta !== 'clasico' && (
                   <div className="mt-4 flex items-center justify-between bg-white p-4 rounded-xl border border-zinc-200 shadow-sm">
                      <div>
                        <span className="text-xs font-bold text-zinc-800 block">Total de este Ambiente</span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Muestra la suma calculada en la Z2</span>
                      </div>
                      <div onClick={() => updateEnv('mostrarSumaAmbiente', !env.mostrarSumaAmbiente)} className={`w-10 h-6 rounded-full p-1 cursor-pointer transition-colors duration-300 shadow-inner ${env.mostrarSumaAmbiente ? 'bg-emerald-500' : 'bg-zinc-300'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${env.mostrarSumaAmbiente ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                   </div>
                 )}
              </div>

              {/* Z3: EDITOR DE MATERIALES INTERACTIVOS */}
              <div className="pt-10 mt-10 border-t border-zinc-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <h3 className="text-[12px] font-black uppercase tracking-widest text-zinc-900 flex items-center gap-2"><Layers size={16} className="text-amber-500"/> Z3: Editor de Variantes</h3>
                  <div className="flex gap-4">
                     <div className="flex flex-col">
                        <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-1">Título de Sección</label>
                        <input className="bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-bold outline-none focus:border-amber-500 shadow-sm" value={env.z3Title || 'Variantes de Material'} onChange={e => updateEnv('z3Title', e.target.value)} />
                     </div>
                     <div className="flex flex-col">
                        <label className="text-[8px] font-black uppercase tracking-widest text-zinc-400 ml-1 mb-1">Subtítulo</label>
                        <input className="bg-white border border-zinc-200 px-3 py-1.5 rounded-lg text-xs font-bold outline-none focus:border-amber-500 shadow-sm" value={env.z3Subtitle || 'Toca los puntos para detalles'} onChange={e => updateEnv('z3Subtitle', e.target.value)} />
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
                           <img src={varActual.img} className="absolute inset-0 w-full h-full object-cover opacity-40 blur-xl scale-110 pointer-events-none" alt="blur" />
                           <img src={varActual.img} className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none" alt="Z3 Canvas" />
                           
                           <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-2 shadow-xl pointer-events-none z-30">
                             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div> Haz clic para colocar un punto
                           </div>
                           
                           {(varActual.puntos || []).map((pt:any) => (
                             <div key={pt.id} className="absolute z-20" style={{ top: `${pt.y}%`, left: `${pt.x}%`, transform: 'translate(-50%, -50%)' }}>
                                <div 
                                  onClick={(e) => { e.stopPropagation(); setEditingPoint(editingPoint === pt.id ? null : pt.id); }} 
                                  className={`relative w-5 h-5 rounded-full flex items-center justify-center cursor-pointer transition-transform hover:scale-110`}
                                >
                                   <span className={`absolute w-full h-full rounded-full animate-ping opacity-40 ${editingPoint === pt.id ? 'bg-red-400' : 'bg-amber-400'}`}></span>
                                   <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm relative z-10"></div>
                                </div>

                                {editingPoint === pt.id && (
                                  <div onClick={(e) => { e.stopPropagation(); setEditingPoint(null); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-default">
                                    <div onClick={(e) => e.stopPropagation()} className="bg-white p-5 rounded-3xl shadow-2xl border border-zinc-200 w-72 animate-in zoom-in-95 duration-200">
                                      <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Nombre del Material / Detalle</label>
                                      <input 
                                        className="w-full bg-zinc-100 px-4 py-3 rounded-xl text-sm font-bold text-zinc-900 border border-zinc-200 outline-none focus:border-amber-500 mb-4" 
                                        value={pt.material}
                                        onChange={(e) => updatePuntoMaterial(pt.id, e.target.value)}
                                        onKeyDown={(e) => handleKeyDownPunto(e, pt.id)}
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
// 📊 VISTA 4: CENTRO ANALÍTICO 
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