import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import logoNormal from '../assets/logoNormal.png';
import { ArrowLeft, Plus, Trash2, ChevronUp, ChevronDown, BookOpen, AlertCircle, CheckCircle2, FileText, Film, Volume2, Image as ImageIcon } from 'lucide-react';

interface ModuleInput {
  id: number;
  titulo_modulo: string;
  tipo_contenido: string;
  data_contenido: string;
}

const CreateCourseScreen: React.FC = () => {
  const context = useContext(AppContext);
  if (!context) return null;
  const { token, fetchCourses, fetchAdminMetrics, API_BASE_URL } = context;
  
  const navigate = useNavigate();

  // General course info state
  const [titulo, setTitulo] = useState<string>('');
  const [descripcion, setDescripcion] = useState<string>('');
  const [imagenUrl, setImagenUrl] = useState<string>('');
  const [imageError, setImageError] = useState<boolean>(false);

  // Modules list state
  const [modulos, setModulos] = useState<ModuleInput[]>([
    { id: Date.now(), titulo_modulo: '', tipo_contenido: 'Texto', data_contenido: '' }
  ]);

  // UI status states
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Handle image loading error to fallback on placeholder
  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageChange = (val: string) => {
    setImagenUrl(val);
    setImageError(false);
  };

  // Add new module to list
  const handleAddModule = () => {
    setModulos([
      ...modulos,
      { id: Date.now() + Math.random(), titulo_modulo: '', tipo_contenido: 'Texto', data_contenido: '' }
    ]);
  };

  // Remove module from list
  const handleRemoveModule = (id: number) => {
    if (modulos.length === 1) {
      setError('El curso debe tener al menos un módulo formativo.');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setModulos(modulos.filter(m => m.id !== id));
  };

  // Reorder modules (Up)
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newMods = [...modulos];
    const temp = newMods[index];
    newMods[index] = newMods[index - 1];
    newMods[index - 1] = temp;
    setModulos(newMods);
  };

  // Reorder modules (Down)
  const handleMoveDown = (index: number) => {
    if (index === modulos.length - 1) return;
    const newMods = [...modulos];
    const temp = newMods[index];
    newMods[index] = newMods[index + 1];
    newMods[index + 1] = temp;
    setModulos(newMods);
  };

  // Handle field change in module list
  const handleModuleChange = (id: number, field: keyof ModuleInput, value: string) => {
    setModulos(
      modulos.map(m => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const cleanTitle = titulo.trim();
    const cleanDesc = descripcion.trim();

    // 1. Validate general course info
    if (!cleanTitle) {
      setError('El título del curso es obligatorio.');
      setSubmitting(false);
      return;
    }

    // 2. Validate modules
    for (let i = 0; i < modulos.length; i++) {
      const m = modulos[i];
      const mTitle = m.titulo_modulo.trim();
      const mContent = m.data_contenido.trim();

      if (!mTitle) {
        setError(`El Módulo ${i + 1} no tiene un título definido.`);
        setSubmitting(false);
        return;
      }
      if (!mContent) {
        setError(`El contenido del Módulo ${i + 1} ("${mTitle || 'Sin título'}") está vacío.`);
        setSubmitting(false);
        return;
      }
    }

    // Prepare payload
    const payload = {
      titulo: cleanTitle,
      descripcion: cleanDesc,
      imagen_url: imagenUrl.trim(),
      modulos: modulos.map(m => ({
        titulo_modulo: m.titulo_modulo.trim(),
        tipo_contenido: m.tipo_contenido,
        data_contenido: m.data_contenido.trim()
      }))
    };

    try {
      const response = await fetch(`${API_BASE_URL}/admin/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al guardar el curso');
      }

      setSuccess('¡Curso creado exitosamente junto con todos sus módulos!');
      
      // Refresh admin data lists
      await Promise.all([fetchCourses(), fetchAdminMetrics()]);

      // Redirect back to Admin Dashboard after brief delay
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Error de red al crear el curso.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%', padding: '0 16px' }}>
      
      {/* Return header */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate('/admin/dashboard')}
          disabled={submitting}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--isn-blue)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.95rem',
            cursor: 'pointer',
            fontWeight: 700,
            transition: 'color 0.2s'
          }}
          className="btn-secondary-hover"
        >
          <ArrowLeft size={18} />
          <span>Volver al Panel de Administrador</span>
        </button>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h1 className="font-serif isn-title-solemn" style={{ fontSize: '2.25rem', marginBottom: '6px' }}>
          Crear Nuevo Curso Formativo
        </h1>
        <p style={{ color: 'var(--isn-charcoal)', fontSize: '1.05rem' }}>
          Diseña un curso completo desde cero agregando módulos independientes y contenido multimedia dinámico.
        </p>
      </div>

      {/* Main Grid: Form / Live Preview */}
      <div className="course-grid">
        
        {/* Left Side: Creation Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Messages */}
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.06)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--isn-danger)',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div style={{
              background: 'rgba(22, 163, 74, 0.06)',
              border: '1px solid rgba(22, 163, 74, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: 'var(--isn-success)',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}>
              <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
              <span>{success}</span>
            </div>
          )}

          {/* Section 1: General Info */}
          <div className="glass-panel isn-border-blue-2" style={{ padding: '28px', borderRadius: '16px' }}>
            <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--isn-blue)', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
              1. Información General del Curso
            </h3>

            {/* Title */}
            <div className="input-group">
              <label className="input-label" htmlFor="course-title">Título del Curso</label>
              <input
                id="course-title"
                type="text"
                placeholder="Ej. Buenas Prácticas de Higiene para Lacteos"
                className="input-field isn-input-focus"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            {/* Description */}
            <div className="input-group">
              <label className="input-label" htmlFor="course-desc">Descripción Corta</label>
              <textarea
                id="course-desc"
                placeholder="Describe brevemente de qué trata este curso..."
                className="input-field isn-input-focus"
                style={{ minHeight: '80px', resize: 'vertical' }}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={submitting}
              />
            </div>

            {/* Cover Image URL */}
            <div className="input-group" style={{ marginBottom: 0 }}>
              <label className="input-label" htmlFor="course-img">URL de Portada / Foto de Imagen</label>
              <input
                id="course-img"
                type="url"
                placeholder="Ej. https://images.unsplash.com/photo-..."
                className="input-field isn-input-focus"
                value={imagenUrl}
                onChange={(e) => handleImageChange(e.target.value)}
                disabled={submitting}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--isn-muted)', display: 'block', marginTop: '6px' }}>
                Utiliza una URL directa de imagen (.jpg, .png, etc.). Puedes usar Unsplash para imágenes profesionales de prueba.
              </span>
            </div>
          </div>

          {/* Section 2: Modules Manager */}
          <div className="glass-panel isn-border-blue-2" style={{ padding: '28px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
              <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--isn-blue)' }}>
                2. Gestor de Módulos Independientes
              </h3>
              
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddModule}
                disabled={submitting}
                style={{ padding: '8px 14px', fontSize: '0.85rem', background: 'var(--isn-blue)', color: '#FFFFFF' }}
              >
                <Plus size={16} />
                <span>+ Agregar Módulo</span>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {modulos.map((m, index) => (
                <div
                  key={m.id}
                  style={{
                    border: '1px solid var(--border-glass)',
                    borderRadius: '12px',
                    padding: '20px',
                    background: '#FAFBFD',
                    position: 'relative'
                  }}
                >
                  {/* Module Header Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span className="isn-badge-blue" style={{
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontWeight: 800
                    }}>
                      MÓDULO {index + 1}
                    </span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0 || submitting}
                        style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Subir orden"
                      >
                        <ChevronUp size={16} color="var(--isn-muted)" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === modulos.length - 1 || submitting}
                        style={{ background: 'white', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Bajar orden"
                      >
                        <ChevronDown size={16} color="var(--isn-muted)" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveModule(m.id)}
                        disabled={submitting}
                        style={{ background: 'white', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        title="Eliminar módulo"
                      >
                        <Trash2 size={16} color="var(--isn-danger)" />
                      </button>
                    </div>
                  </div>

                  {/* Module Inputs */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--isn-blue)', marginBottom: '6px' }}>
                        Título del Módulo
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Lavado de Manos y Desinfección"
                        className="input-field isn-input-focus"
                        style={{ padding: '10px 12px', fontSize: '0.9rem' }}
                        value={m.titulo_modulo}
                        onChange={(e) => handleModuleChange(m.id, 'titulo_modulo', e.target.value)}
                        disabled={submitting}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--isn-blue)', marginBottom: '6px' }}>
                        Tipo de Contenido
                      </label>
                      <select
                        className="input-field isn-input-focus"
                        style={{ padding: '10px 12px', fontSize: '0.9rem', cursor: 'pointer' }}
                        value={m.tipo_contenido}
                        onChange={(e) => handleModuleChange(m.id, 'tipo_contenido', e.target.value)}
                        disabled={submitting}
                      >
                        <option value="Texto">Texto</option>
                        <option value="Video">Video</option>
                        <option value="Audio">Audio</option>
                        <option value="Imagen">Imagen</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--isn-blue)', marginBottom: '6px' }}>
                      {m.tipo_contenido === 'Texto' 
                        ? 'Contenido (Cuerpo en HTML o Texto plano)' 
                        : `URL del Recurso (${m.tipo_contenido})`}
                    </label>
                    <textarea
                      placeholder={m.tipo_contenido === 'Texto' 
                        ? '<h3>Título secundario</h3><p>Escribe aquí toda la teoría formativa del módulo...</p>'
                        : `Ingresa el enlace directo al recurso de ${m.tipo_contenido.toLowerCase()} (Ej: https://...)`}
                      className="input-field isn-input-focus"
                      style={{ minHeight: '100px', padding: '10px 12px', fontSize: '0.9rem', resize: 'vertical', fontFamily: m.tipo_contenido === 'Texto' ? 'inherit' : 'monospace' }}
                      value={m.data_contenido}
                      onChange={(e) => handleModuleChange(m.id, 'data_contenido', e.target.value)}
                      disabled={submitting}
                      required
                    />
                  </div>

                </div>
              ))}
            </div>

            {/* Add module button bottom */}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddModule}
              disabled={submitting}
              style={{ width: '100%', marginTop: '16px', borderStyle: 'dashed', borderColor: '#CBD5E1', background: 'none' }}
            >
              <Plus size={18} />
              <span>Agregar Otro Módulo</span>
            </button>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/admin/dashboard')}
              disabled={submitting}
              style={{ flex: 1, height: '52px' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{ flex: 1, height: '52px', background: 'var(--isn-success)', color: '#FFFFFF' }}
            >
              {submitting ? 'Creando Curso...' : 'Guardar Curso Completo'}
            </button>
          </div>

        </form>

        {/* Right Side: Live Premium Preview Card */}
        <div style={{ position: 'sticky', top: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <h4 style={{ fontSize: '0.8rem', color: 'var(--isn-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 800 }}>
            Previsualización en tiempo real
          </h4>

          {/* Cover Card */}
          <div className="glass-panel isn-border-gold-2" style={{ overflow: 'hidden', borderRadius: '16px' }}>
            <div style={{ position: 'relative', height: '200px', background: 'linear-gradient(135deg, var(--isn-blue) 0%, var(--isn-blue-dark) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              
              {/* Cover Image rendering */}
              {imagenUrl.trim() && !imageError ? (
                <img
                  src={imagenUrl.trim()}
                  alt="Vista previa de portada"
                  onError={handleImageError}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', color: '#FFFFFF', opacity: 0.65 }}>
                  <BookOpen size={48} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Sin Portada Dinámica</span>
                </div>
              )}

              {/* Cover shadow overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(7, 25, 53, 0.85) 0%, rgba(7, 25, 53, 0.2) 60%, transparent 100%)'
              }} />

              {/* Overlay Tags */}
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', color: '#FFFFFF' }}>
                <span style={{
                  background: 'var(--isn-gold)',
                  color: '#FFFFFF',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  display: 'inline-block',
                  marginBottom: '8px',
                  textTransform: 'uppercase'
                }}>
                  NUEVO CURSO
                </span>
                <h3 className="font-serif" style={{ fontSize: '1.4rem', color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {titulo.trim() || 'Título del Curso'}
                </h3>
              </div>
            </div>

            {/* Course body details */}
            <div style={{ padding: '20px' }}>
              <p style={{ color: 'var(--isn-charcoal)', fontSize: '0.85rem', minHeight: '60px', maxHeight: '80px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', lineHeight: '1.5', marginBottom: '16px' }}>
                {descripcion.trim() || 'Descripción corta del curso. Escribe los detalles para ver cómo se renderizan de cara al estudiante.'}
              </p>

              {/* Micro specs */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '14px', fontSize: '0.75rem', color: 'var(--isn-muted)', fontWeight: 600 }}>
                <span>Módulos: {modulos.length}</span>
                <span>Creación: Hoy</span>
              </div>
            </div>
          </div>

          {/* Theme preview mockup of modules list */}
          <div className="glass-panel isn-border-blue-2" style={{ padding: '20px', borderRadius: '16px' }}>
            <h5 className="font-serif" style={{ fontSize: '0.75rem', color: 'var(--isn-blue)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', fontWeight: 800 }}>
              Estructura de Módulos ({modulos.length})
            </h5>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
              {modulos.map((mod, idx) => {
                const getIcon = () => {
                  switch (mod.tipo_contenido.toLowerCase()) {
                    case 'video': return <Film size={14} color="var(--isn-blue)" />;
                    case 'audio': return <Volume2 size={14} color="var(--isn-gold)" />;
                    case 'imagen': return <ImageIcon size={14} color="var(--isn-success)" />;
                    default: return <FileText size={14} color="var(--isn-muted)" />;
                  }
                };

                return (
                  <div
                    key={mod.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px',
                      borderRadius: '8px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      fontSize: '0.8rem'
                    }}
                  >
                    <span style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>
                      {idx + 1}. {mod.titulo_modulo.trim() || 'Sin título'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {getIcon()}
                      <span style={{ fontSize: '0.7rem', color: 'var(--isn-muted)', textTransform: 'uppercase', fontWeight: 800 }}>
                        {mod.tipo_contenido}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CreateCourseScreen;
