import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  MessageCircle,
  Download,
  Info,
  Edit3,
  Eye,
  Save,
  Image as ImageIcon,
  DollarSign,
  Plus,
  ArrowLeft,
  Trash2,
  Loader2,
  Link as LinkIcon,
  Check,
  Copy,
} from 'lucide-react';

// --- CONFIGURACIÓN DE FIREBASE ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import {
  BrowserRouter,
  Routes,
  Route,
  useParams,
  useNavigate,
  Link,
} from 'react-router-dom';

// !!! TUS LLAVES EXACTAS !!!
const firebaseConfig = {
  apiKey: 'AIzaSyBNq_hlQ2Z3Yo3V3W5F80pWeYgw90QAEoI',
  authDomain: 'tupropuesta-401e6.firebaseapp.com',
  projectId: 'tupropuesta-401e6',
  storageBucket: 'tupropuesta-401e6.firebasestorage.app',
  messagingSenderId: '299373521821',
  appId: '1:299373521821:web:4df18bbeb2ebe956ad1d74',
  measurementId: 'G-R8R5XSLD9K',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- COMPONENTE PRINCIPAL ---
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/editar/:id" element={<AdminEditor />} />
        <Route path="/ver/:id" element={<VistaCliente />} />
      </Routes>
    </BrowserRouter>
  );
}

// --- VISTA 1: PANEL DE ADMINISTRACIÓN (LISTA DE PROYECTOS) ---
function AdminDashboard() {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    signInAnonymously(auth);
    const q = collection(db, 'proyectos');
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProyectos(data);
        setCargando(false);
      },
      (error) => {
        console.error('Error al leer proyectos:', error);
        setCargando(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const nuevoProyecto = async () => {
    try {
      const docRef = await addDoc(collection(db, 'proyectos'), {
        cliente: 'Nuevo Cliente',
        titulo: 'Mueble de TV / Cocina',
        fecha: new Date().toLocaleDateString(),
        estado: 'Borrador',
        imagenes: {
          obra: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800',
          propuestas: [
            'https://images.unsplash.com/photo-1600607686527-6fb886090705?w=800',
          ],
        },
        presupuesto: {
          total: '0',
          anticipo: '0',
          detalle: [{ item: 'Muebles', valor: '0' }],
        },
        materiales: [
          { nombre: 'Melamina', tipo: 'Frentes', color: 'bg-stone-300' },
        ],
        whatsapp: '549',
      });
      navigate(`/admin/editar/${docRef.id}`);
    } catch (error) {
      console.error('Error al crear proyecto:', error);
    }
  };

  if (cargando)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-amber-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900">
              STUDIO<span className="text-amber-600">.MUD</span>
            </h1>
            <p className="text-zinc-500">Gestor de Proyectos e IA</p>
          </div>
          <button
            onClick={nuevoProyecto}
            className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-zinc-800 transition"
          >
            <Plus size={18} /> Nuevo Proyecto
          </button>
        </header>

        {proyectos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-zinc-300">
            <p className="text-zinc-400">
              No hay proyectos aún. ¡Creá el primero!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {proyectos.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl shadow-sm border border-zinc-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="h-40 bg-zinc-100">
                  <img
                    src={p.imagenes?.propuestas?.[0] || p.imagenes?.obra}
                    className="w-full h-full object-cover"
                    alt="Render"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg leading-tight">
                    {p.titulo}
                  </h3>
                  <p className="text-sm text-zinc-500 mb-4">{p.cliente}</p>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <Link
                      to={`/admin/editar/${p.id}`}
                      className="text-amber-600 font-bold flex items-center gap-1 hover:underline"
                    >
                      <Edit3 size={16} /> Editar
                    </Link>
                    <button
                      onClick={() => deleteDoc(doc(db, 'proyectos', p.id))}
                      className="text-red-400 p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// --- VISTA 2: EDITOR DE CADA PROYECTO ---
function AdminEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState<any>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'proyectos', id), (doc) => {
      if (doc.exists()) setP({ id: doc.id, ...doc.data() });
    });
    return () => unsubscribe();
  }, [id]);

  const update = async (data: any) => {
    if (!id) return;
    try {
      await setDoc(doc(db, 'proyectos', id), { ...p, ...data });
    } catch (error) {
      console.error('Error al actualizar:', error);
    }
  };

  const copiarLink = () => {
    const url = `${window.location.origin}/ver/${id}`;
    const el = document.createElement('textarea');
    el.value = url;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);

    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  if (!p)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <Loader2 className="animate-spin text-amber-600" />
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8 pb-32 font-sans">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-zinc-500 mb-6 hover:text-zinc-900 transition font-medium"
        >
          <ArrowLeft size={18} /> Volver al Panel
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-5 rounded-3xl border shadow-sm gap-4">
          <div>
            <h1 className="text-xl font-bold">Cliente: {p.cliente}</h1>
            <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">
              Modo Edición
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={copiarLink}
              className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl font-bold border flex items-center justify-center gap-2 transition ${
                copiado
                  ? 'bg-green-50 text-green-700 border-green-200 shadow-inner'
                  : 'bg-white text-zinc-700 hover:bg-zinc-50'
              }`}
            >
              {copiado ? <Check size={18} /> : <LinkIcon size={18} />}{' '}
              {copiado ? '¡Copiado!' : 'Copiar Link'}
            </button>
            <Link
              to={`/ver/${id}`}
              target="_blank"
              className="flex-1 md:flex-none bg-amber-600 text-white px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-amber-700 transition shadow-lg shadow-amber-600/20"
            >
              <Eye size={18} /> Vista Cliente
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <h2 className="font-bold border-b pb-3 flex items-center gap-2">
              <ImageIcon size={18} className="text-zinc-400" /> Datos Visuales
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase">
                  Nombre Cliente
                </label>
                <input
                  className="w-full border p-2 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500 transition"
                  value={p.cliente}
                  onChange={(e) => update({ cliente: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase">
                  Título del Proyecto
                </label>
                <input
                  className="w-full border p-2 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500 transition"
                  value={p.titulo || ''}
                  onChange={(e) => update({ titulo: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">
                  URL Foto Obra Cruda
                </label>
                <input
                  className="w-full border p-2 rounded-xl mt-1 text-xs outline-none focus:ring-2 focus:ring-amber-500 transition"
                  value={p.imagenes.obra}
                  onChange={(e) =>
                    update({
                      imagenes: { ...p.imagenes, obra: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-amber-600 uppercase tracking-tighter underline">
                  URL Render IA (Principal)
                </label>
                <input
                  className="w-full border-2 border-amber-200 bg-amber-50 p-2 rounded-xl mt-1 text-xs outline-none focus:ring-2 focus:ring-amber-500 transition"
                  value={p.imagenes.propuestas[0]}
                  onChange={(e) =>
                    update({
                      imagenes: { ...p.imagenes, propuestas: [e.target.value] },
                    })
                  }
                />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
            <h2 className="font-bold border-b pb-3 flex items-center gap-2">
              <DollarSign size={18} className="text-zinc-400" /> Presupuesto
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">
                  Inversión Total ($)
                </label>
                <input
                  className="w-full border p-2 rounded-xl mt-1 font-bold text-lg outline-none focus:ring-2 focus:ring-amber-500 transition"
                  value={p.presupuesto.total}
                  onChange={(e) =>
                    update({
                      presupuesto: { ...p.presupuesto, total: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">
                  Monto Seña ($)
                </label>
                <input
                  className="w-full border p-2 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500 transition"
                  value={p.presupuesto.anticipo}
                  onChange={(e) =>
                    update({
                      presupuesto: {
                        ...p.presupuesto,
                        anticipo: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">
                  WhatsApp (Sin '+', ej: 54911...)
                </label>
                <input
                  className="w-full border p-2 rounded-xl mt-1 outline-none focus:ring-2 focus:ring-amber-500 transition"
                  value={p.whatsapp}
                  onChange={(e) => update({ whatsapp: e.target.value })}
                  placeholder="54911..."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- VISTA 3: VISTA INTERACTIVA PARA EL CLIENTE ---
function VistaCliente() {
  const { id } = useParams();
  const [p, setP] = useState<any>(null);
  const [modo, setModo] = useState('propuesta');

  useEffect(() => {
    if (!id) return;
    const unsubscribe = onSnapshot(doc(db, 'proyectos', id), (doc) => {
      if (doc.exists()) setP(doc.data());
    });
    return () => unsubscribe();
  }, [id]);

  if (!p)
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-900">
        <Loader2 className="animate-spin text-white" />
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-950 flex justify-center items-start md:py-10 font-sans">
      <div className="w-full max-w-md bg-white min-h-screen md:min-h-[90vh] md:rounded-[3rem] overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)] relative">
        <header className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <h1 className="font-bold text-xl tracking-tighter">
            STUDIO<span className="text-amber-600">.MUD</span>
          </h1>
          <span className="text-[10px] bg-zinc-100 px-3 py-1.5 rounded-full text-zinc-500 uppercase font-black tracking-widest">
            Digital Proposal
          </span>
        </header>

        <div className="flex-1 overflow-y-auto pb-40">
          <div className="p-6">
            <h2 className="text-3xl font-black text-zinc-900 leading-none tracking-tight">
              {p.titulo}
            </h2>
            <p className="text-zinc-400 font-medium text-sm mt-1">
              Presentado a: {p.cliente}
            </p>
          </div>

          <div className="px-4 relative aspect-square group">
            <img
              src={modo === 'obra' ? p.imagenes.obra : p.imagenes.propuestas[0]}
              className="w-full h-full object-cover rounded-3xl shadow-2xl transition-all duration-700 ease-in-out transform"
              alt="Preview"
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex bg-white/90 backdrop-blur-xl p-1.5 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-white/50 scale-110">
              <button
                onClick={() => setModo('obra')}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  modo === 'obra'
                    ? 'bg-zinc-900 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                Obra
              </button>
              <button
                onClick={() => setModo('propuesta')}
                className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  modo === 'propuesta'
                    ? 'bg-amber-600 text-white shadow-lg'
                    : 'text-zinc-400 hover:text-zinc-600'
                }`}
              >
                Render 3D
              </button>
            </div>
          </div>

          <div className="p-6 mt-6">
            <div className="bg-zinc-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-[60px]"></div>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">
                Inversión Final
              </p>
              <p className="text-4xl font-black tracking-tight text-white">
                $ {p.presupuesto.total}
              </p>

              <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-between items-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block">
                    Reserva
                  </span>
                  <span className="text-amber-500 font-black text-xl tracking-tight">
                    $ {p.presupuesto.anticipo}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest block italic">
                    Saldo contra entrega
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 w-full p-6 bg-white/90 backdrop-blur-2xl border-t border-zinc-100 flex flex-col gap-3">
          <a
            href={`https://wa.me/${p.whatsapp}?text=Hola! Estuve viendo la propuesta interactiva de ${p.titulo} y quiero avanzar con el proyecto.`}
            className="bg-[#25D366] text-white w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_15px_30px_rgba(37,211,102,0.3)] hover:translate-y-[-2px] active:scale-95 transition-all duration-300"
          >
            <MessageCircle size={22} fill="white" /> Aprobar y Señar
          </a>
        </div>
      </div>
    </div>
  );
}
