import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, MessageCircle, Edit3, Eye, Image as ImageIcon, 
  DollarSign, Plus, ArrowLeft, Trash2, Loader2, Link as LinkIcon, Check, Upload, LogOut, Lock
} from 'lucide-react';
import { BrowserRouter, Routes, Route, useParams, useNavigate, Link, Navigate } from 'react-router-dom';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.39.3/+esm';

// =====================================================================
// 🚨 TUS LLAVES DE SUPABASE
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-900"><Loader2 className="animate-spin text-amber-600 w-10 h-10" /></div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* RUTAS PROTEGIDAS (Solo vos podés entrar) */}
        <Route path="/admin" element={session ? <AdminDashboard /> : <Login />} />
        <Route path="/admin/editar/:id" element={session ? <AdminEditor /> : <Login />} />
        
        {/* RUTA PÚBLICA (La que le pasás al cliente) */}
        <Route path="/ver/:id" element={<VistaCliente />} />
      </Routes>
    </BrowserRouter>
  );
}

// --- VISTA 0: LOGIN (NUEVO) ---
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) setError('Usuario o contraseña incorrectos');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-2xl w-full max-w-md">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-amber-600">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tighter italic">STUDIO<span className="text-amber-600">.MUD</span></h1>
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mt-2">Acceso Privado</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold text-center border border-red-100">{error}</div>}
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-500 transition" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Contraseña</label>
            <input 
              type="password" 
              required
              className="w-full bg-zinc-50 border-none p-4 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-amber-500 transition" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition disabled:opacity-50 flex justify-center mt-8 shadow-xl shadow-zinc-200"
          >
            {loading ? <Loader2 size={16} className="animate-spin text-white" /> : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- VISTA 1: PANEL DE ADMINISTRACIÓN ---
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
    const { data, error } = await supabase.from('proyectos').insert([
      {
        cliente: "Nuevo Cliente",
        titulo: "Proyecto MUD",
        imagenes: { obra: "", propuestas: [""] },
        presupuesto: { total: "0", anticipo: "0" },
        whatsapp: "549"
      }
    ]).select();
    
    if (data && data[0]) navigate(`/admin/editar/${data[0].id}`);
    if (error) alert("Error al crear: " + error.message);
  };

  const borrarProyecto = async (id: string) => {
    if(window.confirm('¿Borrar propuesta definitivamente?')) {
      await supabase.from('proyectos').delete().eq('id', id);
      fetchProyectos();
    }
  };

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
  };

  if (cargando) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin text-amber-600 w-10 h-10" /></div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tighter italic">STUDIO<span className="text-amber-600">.MUD</span></h1>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Gestor de Proyectos</p>
          </div>
          <div className="flex gap-4">
            <button onClick={nuevoProyecto} className="bg-amber-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-amber-700 transition shadow-xl shadow-amber-200">
              <Plus size={16} /> Nueva Propuesta
            </button>
            <button onClick={cerrarSesion} className="bg-zinc-200 text-zinc-600 px-4 py-3 rounded-2xl hover:bg-red-100 hover:text-red-600 transition" title="Cerrar Sesión">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {proyectos.map(p => (
            <div key={p.id} className="bg-white rounded-[2.5rem] shadow-sm border border-zinc-100 overflow-hidden hover:shadow-2xl transition-all duration-500 group">
              <div className="h-56 bg-zinc-100 relative">
                {p.imagenes?.propuestas?.[0] ? (
                  <img src={p.imagenes.propuestas[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Vista" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300 italic text-xs">Sin imagen</div>
                )}
                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-zinc-900 shadow-sm border border-white/50">
                  {p.cliente}
                </div>
              </div>
              <div className="p-8">
                <h3 className="font-black text-xl leading-tight mb-6 tracking-tight text-zinc-900">{p.titulo}</h3>
                <div className="flex justify-between items-center pt-6 border-t border-zinc-50">
                  <Link to={`/admin/editar/${p.id}`} className="text-amber-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:opacity-70 transition">
                    <Edit3 size={14}/> Editar
                  </Link>
                  <button onClick={() => borrarProyecto(p.id)} className="text-zinc-200 hover:text-red-500 transition">
                    <Trash2 size={20}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- VISTA 2: EDITOR CON CARGA A SUPABASE ---
function AdminEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState<any>(null);
  const [subiendo, setSubiendo] = useState({ obra: false, propuesta: false });
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    const fetchProyecto = async () => {
      const { data } = await supabase.from('proyectos').select('*').eq('id', id).single();
      if (data) setP(data);
    };
    fetchProyecto();
  }, [id]);

  const update = async (dataToUpdate: any) => {
    setP((prev: any) => ({ ...prev, ...dataToUpdate }));
    await supabase.from('proyectos').update(dataToUpdate).eq('id', id);
  };

  const handleFileUpload = async (e: any, tipo: string) => {
    const file = e.target.files[0];
    if (!file) return;

    setSubiendo(prev => ({ ...prev, [tipo]: true }));
    const fileExt = file.name.split('.').pop();
    const fileName = `${id}_${tipo}_${Math.random()}.${fileExt}`;

    try {
      const { error: uploadError } = await supabase.storage.from('proyectos').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('proyectos').getPublicUrl(fileName);
      const url = data.publicUrl;

      if (tipo === 'obra') {
        update({ imagenes: { ...p.imagenes, obra: url } });
      } else {
        update({ imagenes: { ...p.imagenes, propuestas: [url] } });
      }
    } catch (error) {
      alert("Error al subir archivo. Avisale a tu programador 😅");
    } finally {
      setSubiendo(prev => ({ ...prev, [tipo]: false }));
    }
  };

  if (!p) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin text-amber-600 w-10 h-10" /></div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8 pb-32 font-sans">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/admin')} className="flex items-center gap-2 text-zinc-400 mb-8 hover:text-zinc-900 transition font-black text-[10px] uppercase tracking-widest">
          <ArrowLeft size={16}/> Volver al Panel
        </button>
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white p-8 rounded-[3rem] border border-zinc-100 shadow-sm gap-6">
          <div className="text-center md:text-left">
            <p className="text-[10px] text-amber-600 font-black uppercase tracking-[0.3em] mb-2">Edición de Propuesta</p>
            <h1 className="text-3xl font-black text-zinc-900 tracking-tighter italic">{p.cliente}</h1>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={() => {
                const url = `${window.location.origin}/ver/${id}`;
                const el = document.createElement('textarea'); el.value = url;
                document.body.appendChild(el); el.select(); document.execCommand('copy');
                document.body.removeChild(el); setCopiado(true);
                setTimeout(() => setCopiado(false), 2000);
              }} 
              className={`flex-1 md:flex-none px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest border transition-all ${copiado ? 'bg-green-50 text-green-600 border-green-200 shadow-inner' : 'bg-white text-zinc-900 hover:bg-zinc-50 border-zinc-100 shadow-sm'}`}
            >
              {copiado ? <Check size={16} className="inline mr-2"/> : <LinkIcon size={16} className="inline mr-2"/>}
              {copiado ? 'Copiado' : 'Copiar Link'}
            </button>
            <Link to={`/ver/${id}`} target="_blank" className="flex-1 md:flex-none bg-zinc-900 text-white px-8 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-800 transition shadow-xl shadow-zinc-200">
              <Eye size={18}/> Vista Cliente
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[3.5rem] border border-zinc-100 shadow-sm space-y-8">
            <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-3">
              <ImageIcon size={18} className="text-amber-600"/> Archivos Visuales
            </h2>
            
            <div className="space-y-4">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Foto Obra Cruda</label>
              {p.imagenes.obra && (
                <img src={p.imagenes.obra} className="w-full h-32 object-cover rounded-2xl mb-2 border border-zinc-200" alt="Obra" />
              )}
              <div className="flex gap-2">
                <input className="flex-1 border p-3 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-amber-500 transition" placeholder="Pegar URL de la foto..." value={p.imagenes.obra} onChange={e => update({imagenes: {...p.imagenes, obra: e.target.value}})} />
                <label className="bg-zinc-100 hover:bg-zinc-200 text-zinc-600 px-4 py-2 rounded-2xl cursor-pointer flex items-center justify-center transition shadow-sm">
                  {subiendo.obra ? <Loader2 size={20} className="animate-spin text-amber-600"/> : <Upload size={20}/>}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'obra')} />
                </label>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest block">Render MUD</label>
              {p.imagenes.propuestas[0] && (
                <img src={p.imagenes.propuestas[0]} className="w-full h-32 object-cover rounded-2xl mb-2 border-2 border-amber-200" alt="Render" />
              )}
              <div className="flex gap-2">
                <input className="flex-1 border-2 border-amber-100 bg-amber-50/50 p-3 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-amber-500 transition" placeholder="Pegar URL del render..." value={p.imagenes.propuestas[0]} onChange={e => update({imagenes: {...p.imagenes, propuestas: [e.target.value]}})} />
                <label className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2 rounded-2xl cursor-pointer flex items-center justify-center transition shadow-sm">
                  {subiendo.propuesta ? <Loader2 size={20} className="animate-spin text-amber-600"/> : <Upload size={20}/>}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'propuesta')} />
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-10 rounded-[3.5rem] border border-zinc-100 shadow-sm space-y-8">
            <h2 className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-400 flex items-center gap-3">
              <DollarSign size={18} className="text-amber-600"/> Presupuesto & Datos
            </h2>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cliente</label>
                <input className="w-full border-b border-zinc-100 py-3 font-black text-xl outline-none focus:border-amber-500 transition" value={p.cliente} onChange={e => update({cliente: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Mueble / Espacio</label>
                <input className="w-full border-b border-zinc-100 py-3 font-bold text-zinc-600 outline-none focus:border-amber-500 transition" value={p.titulo} onChange={e => update({titulo: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-xs">Total ($)</label>
                  <input className="w-full bg-zinc-50 border-none p-4 rounded-2xl font-black text-2xl outline-none focus:ring-2 focus:ring-zinc-900 transition" value={p.presupuesto.total} onChange={e => update({presupuesto: {...p.presupuesto, total: e.target.value}})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-amber-600 uppercase tracking-widest text-xs">Seña ($)</label>
                  <input className="w-full bg-amber-50 border-none p-4 rounded-2xl font-black text-2xl text-amber-600 outline-none focus:ring-2 focus:ring-amber-500 transition" value={p.presupuesto.anticipo} onChange={e => update({presupuesto: {...p.presupuesto, anticipo: e.target.value}})} />
                </div>
              </div>
              <div className="space-y-2 pt-4">
                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">WhatsApp Cliente</label>
                <input className="w-full border-b border-zinc-100 py-3 outline-none focus:border-amber-500 transition text-zinc-500" value={p.whatsapp} onChange={e => update({whatsapp: e.target.value})} placeholder="549..." />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- VISTA CLIENTE ---
function VistaCliente() {
  const { id } = useParams();
  const [p, setP] = useState<any>(null);
  const [modo, setModo] = useState('propuesta');

  useEffect(() => {
    const fetchProyecto = async () => {
      const { data } = await supabase.from('proyectos').select('*').eq('id', id).single();
      if (data) setP(data);
    };
    fetchProyecto();
  }, [id]);

  if (!p) return <div className="min-h-screen flex items-center justify-center bg-zinc-900"><Loader2 className="animate-spin text-white w-10 h-10" /></div>;

  return (
    <div className="min-h-screen bg-zinc-950 flex justify-center items-start md:py-10 font-sans">
      <div className="w-full max-w-md bg-white min-h-screen md:min-h-[90vh] md:rounded-[4rem] overflow-hidden flex flex-col shadow-[0_50px_100px_rgba(0,0,0,0.9)] relative">
        <header className="p-10 flex justify-between items-center bg-white/90 backdrop-blur-2xl sticky top-0 z-10">
          <h1 className="font-black text-3xl tracking-tighter italic">STUDIO<span className="text-amber-600">.MUD</span></h1>
          <div className="w-10 h-10 bg-zinc-900 rounded-2xl flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto pb-48 px-10">
          <div className="py-8">
            <h2 className="text-5xl font-black text-zinc-900 leading-[0.85] tracking-tighter mb-4">{p.titulo}</h2>
            <p className="text-zinc-400 font-black text-[10px] uppercase tracking-[0.3em]">Presentación para {p.cliente}</p>
          </div>

          <div className="relative aspect-[4/5] mb-12 group">
            <div className="absolute inset-0 bg-zinc-200 rounded-[3.5rem] animate-pulse"></div>
            {modo === 'obra' && p.imagenes.obra ? (
              <img src={p.imagenes.obra} className="absolute inset-0 w-full h-full object-cover rounded-[3.5rem] shadow-2xl transition-all duration-1000 ease-out" alt="Obra" />
            ) : p.imagenes.propuestas[0] ? (
              <img src={p.imagenes.propuestas[0]} className="absolute inset-0 w-full h-full object-cover rounded-[3.5rem] shadow-2xl transition-all duration-1000 ease-out" alt="Render" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-bold">Sin imagen cargada</div>
            )}
            
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex bg-zinc-900 p-2.5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.4)] scale-110 border border-white/10">
              <button onClick={() => setModo('obra')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${modo === 'obra' ? 'bg-white text-zinc-900' : 'text-zinc-500'}`}>Antes</button>
              <button onClick={() => setModo('propuesta')} className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${modo === 'propuesta' ? 'bg-amber-600 text-white' : 'text-zinc-500'}`}>Render</button>
            </div>
          </div>

          <div className="bg-zinc-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/20 rounded-full blur-[60px]"></div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Monto de Inversión</p>
            <p className="text-6xl font-black tracking-tighter text-white mb-10">$ {p.presupuesto.total}</p>
            
            <div className="pt-10 border-t border-zinc-800 flex justify-between items-end">
              <div>
                <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest block mb-2 italic">Seña de Inicio</span>
                <span className="text-amber-500 font-black text-3xl tracking-tight italic">$ {p.presupuesto.anticipo}</span>
              </div>
              <div className="text-right">
                <CheckCircle2 size={32} className="text-amber-600/30 ml-auto mb-2" />
                <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest block leading-tight">Proyecto<br/>Verificado</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 w-full p-10 bg-white/95 backdrop-blur-3xl border-t border-zinc-50">
          <a 
            href={`https://wa.me/${p.whatsapp}?text=Hola! Estuve viendo la propuesta de ${p.titulo} y quiero avanzar con el proyecto.`} 
            target="_blank" rel="noreferrer"
            className="bg-[#25D366] text-white w-full py-7 rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center gap-4 shadow-[0_25px_50px_rgba(37,211,102,0.4)] hover:scale-[1.03] active:scale-95 transition-all"
          >
            <MessageCircle size={28} fill="white" /> Aprobar Proyecto
          </a>
        </div>
      </div>
    </div>
  );
}