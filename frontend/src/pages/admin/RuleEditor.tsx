import { useState } from 'react';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../index.css';

export default function RuleEditor() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [haEntity, setHaEntity] = useState('');

  return (
    <div className="animate-slide-up" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="glass-button" style={{ width: 'auto', padding: '12px' }} onClick={() => navigate('/admin')}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Crear Normativa</h2>
      </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Título de la Norma</label>
          <input 
            type="text" 
            placeholder="Ej: Uso del Quincho"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '1rem' }}
          />
        </div>

        <div>
           <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Mapeo Home Assistant</label>
          <input 
            type="text" 
            placeholder="Ej: switch.luces_quincho"
            value={haEntity}
            onChange={(e) => setHaEntity(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'var(--accent-color)', fontFamily: 'monospace', fontSize: '1rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Cuerpo de la Regla (texto a leer)</label>
          <textarea 
            placeholder="Redacta las normas aquí..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', fontFamily: 'Outfit', resize: 'vertical', fontSize: '1rem' }}
          />
        </div>
      </div>

      <h3 style={{ fontSize: '1.2rem', marginTop: '16px' }}>Evaluación</h3>

      <div className="glass-panel" style={{ border: '1px dashed var(--glass-border)', textAlign: 'center', opacity: 0.8, cursor: 'pointer' }}>
        <Plus size={24} color="var(--accent-color)" style={{ marginBottom: '8px' }} />
        <div style={{ color: 'var(--accent-color)', fontWeight: 600 }}>Agregar Pregunta</div>
        <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Requiere 4 opciones y seleccionar la correcta.</p>
      </div>

      <button className="glass-button primary" style={{ marginTop: '20px' }}>
        <Save size={20} />
        Guardar Normativa
      </button>

    </div>
  );
}
