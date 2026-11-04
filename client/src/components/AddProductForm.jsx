import React, { useState } from 'react';
import { PlusCircle, AlertCircle, CheckCircle2, ImageIcon, ScrollText, Package } from 'lucide-react';
import api from '../services/api';

const DECADAS = ['1930s', '1940s', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

const EMPTY_FORM = {
  nombre: '',
  franquicia: '',
  categoria: '',
  decada: '1980s',
  precio: '',
  estado_conservacion: '',
  stock: '1',
  imagen_url: '',
  ano_fabricacion: '',
  tirada_produccion: '',
  procedencia: '',
  variantes_diseno: '',
  relevancia_cultural: '',
  nivel_autenticidad: '',
};

const inputClass =
  'w-full px-3.5 py-2.5 bg-noir-950 border border-white/10 rounded-xl text-xs text-white placeholder-platinum-500 focus:outline-none focus:border-gold-500 transition-colors font-sans';
const labelClass = 'block text-[10px] font-mono font-bold uppercase tracking-wider text-platinum-300 mb-1.5';

/**
 * CU-09: Formulario de alta de producto para Vendedores.
 * Envía a POST /api/products; el backend valida y asigna el vendedor desde el token.
 */
export default function AddProductForm({ metadata = {}, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [fieldErrors, setFieldErrors] = useState([]);
  const [created, setCreated] = useState(null);
  const [imageOk, setImageOk] = useState(true);

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (key === 'imagen_url') setImageOk(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setFieldErrors([]);
    setCreated(null);
    setSaving(true);

    try {
      const payload = {
        ...form,
        precio: Number(form.precio),
        stock: parseInt(form.stock, 10),
        ano_fabricacion: parseInt(form.ano_fabricacion, 10),
      };
      const res = await api.post('/products', payload);
      setCreated(res.data.data);
      setForm(EMPTY_FORM);
      if (onCreated) onCreated(res.data.data);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'No se pudo publicar la pieza.');
      setFieldErrors(err.response?.data?.errores || []);
    } finally {
      setSaving(false);
    }
  };

  const showPreview = /^https:\/\/\S+$/i.test(form.imagen_url.trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 text-gold-400 text-[11px] font-mono tracking-widest uppercase mb-1">
          <PlusCircle className="w-3.5 h-3.5 text-gold-500" />
          <span>Nueva pieza</span>
        </div>
        <h2 className="font-serif text-xl text-white">Publicar un coleccionable</h2>
        <p className="text-xs text-platinum-400 mt-1 font-light">
          La pieza aparecerá en el catálogo en cuanto la publiques. Los campos con * son obligatorios.
        </p>
      </div>

      {created && (
        <div className="p-3.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-300 text-xs flex items-center space-x-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-gold-400" />
          <span>
            «{created.nombre}» se publicó con el ID #{created.producto_id}. Ya está visible en el catálogo.
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-crimson-600/10 border border-crimson-600/30 text-rose-300 text-xs space-y-1">
          <div className="flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-crimson-500" />
            <span>{errorMsg}</span>
          </div>
          {fieldErrors.length > 0 && (
            <ul className="list-disc pl-10 space-y-0.5">
              {fieldErrors.map((fe) => (
                <li key={fe.campo + fe.mensaje}>
                  <strong>{fe.campo}:</strong> {fe.mensaje}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Datos comerciales */}
      <section className="p-5 rounded-2xl bg-noir-950/60 border border-white/10 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-platinum-300">
          <Package className="w-4 h-4 text-gold-400" />
          <span>Datos de la pieza</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={labelClass}>Nombre *</label>
            <input required minLength={3} maxLength={150} value={form.nombre} onChange={set('nombre')}
              placeholder="ej. Darth Vader Kenner 1978" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Franquicia *</label>
            <input required maxLength={100} list="franquicias-list" value={form.franquicia} onChange={set('franquicia')}
              placeholder="ej. Star Wars" className={inputClass} />
            <datalist id="franquicias-list">
              {(metadata.franquicias || []).map((f) => <option key={f} value={f} />)}
            </datalist>
          </div>

          <div>
            <label className={labelClass}>Categoría *</label>
            <input required maxLength={50} list="categorias-list" value={form.categoria} onChange={set('categoria')}
              placeholder="ej. Figuras de Acción" className={inputClass} />
            <datalist id="categorias-list">
              {(metadata.categorias || []).map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div>
            <label className={labelClass}>Década *</label>
            <select value={form.decada} onChange={set('decada')} className={`${inputClass} cursor-pointer`}>
              {DECADAS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Estado de conservación *</label>
            <input required maxLength={30} value={form.estado_conservacion} onChange={set('estado_conservacion')}
              placeholder="ej. Near Mint C-9" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Precio (USD) *</label>
            <input required type="number" min="0.01" step="0.01" value={form.precio} onChange={set('precio')}
              placeholder="ej. 450.00" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Stock *</label>
            <input required type="number" min="1" max="9999" step="1" value={form.stock} onChange={set('stock')}
              className={inputClass} />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>URL de la imagen (https)</label>
            <div className="flex gap-3 items-start">
              <input type="url" maxLength={255} value={form.imagen_url} onChange={set('imagen_url')}
                placeholder="https://..." className={inputClass} />
              <div className="w-16 h-16 shrink-0 rounded-xl bg-noir-950 border border-white/10 overflow-hidden flex items-center justify-center">
                {showPreview && imageOk ? (
                  <img src={form.imagen_url.trim()} alt="Vista previa" className="w-full h-full object-cover"
                    onError={() => setImageOk(false)} />
                ) : (
                  <ImageIcon className="w-5 h-5 text-platinum-500" />
                )}
              </div>
            </div>
            {showPreview && !imageOk && (
              <p className="text-[11px] text-rose-300 mt-1">No se pudo cargar la imagen desde esa URL.</p>
            )}
          </div>
        </div>
      </section>

      {/* Contexto histórico */}
      <section className="p-5 rounded-2xl bg-noir-950/60 border border-white/10 space-y-4">
        <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-platinum-300">
          <ScrollText className="w-4 h-4 text-gold-400" />
          <span>Contexto histórico</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Año de fabricación *</label>
            <input required type="number" min="1800" max={new Date().getFullYear() + 1} step="1"
              value={form.ano_fabricacion} onChange={set('ano_fabricacion')} placeholder="ej. 1984" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Nivel de autenticidad</label>
            <input maxLength={50} value={form.nivel_autenticidad} onChange={set('nivel_autenticidad')}
              placeholder="ej. Certificado AFA 85" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Tirada de producción</label>
            <input maxLength={100} value={form.tirada_produccion} onChange={set('tirada_produccion')}
              placeholder="ej. Primera tirada, aprox. 5,000 unidades" className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Procedencia</label>
            <input maxLength={150} value={form.procedencia} onChange={set('procedencia')}
              placeholder="ej. Kenner Products, Cincinnati, EE.UU." className={inputClass} />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Variantes de diseño</label>
            <textarea rows={2} maxLength={4000} value={form.variantes_diseno} onChange={set('variantes_diseno')}
              placeholder="Detalles de empaque, errores de tirada, variantes..." className={`${inputClass} resize-y`} />
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Relevancia cultural</label>
            <textarea rows={3} maxLength={4000} value={form.relevancia_cultural} onChange={set('relevancia_cultural')}
              placeholder="Por qué esta pieza es importante para los coleccionistas..." className={`${inputClass} resize-y`} />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 hover:from-gold-400 hover:to-gold-300 text-noir-950 font-black text-xs uppercase tracking-widest transition-all shadow-gold-glow disabled:opacity-50"
        >
          {saving ? 'Publicando...' : 'Publicar pieza'}
        </button>
      </div>
    </form>
  );
}
