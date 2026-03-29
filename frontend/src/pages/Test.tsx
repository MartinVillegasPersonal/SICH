import { useState } from 'react';
import { ArrowLeft, Check, Timer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../index.css';

export default function TestPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<number | null>(null);

  // Mock data for demo
  const question = "¿Cuál es el paso OBLIGATORIO antes de encender la parrilla del quincho?";
  const options = [
    "Abrir la válvula general de gas en el patio trasero.",
    "Comprobar el nivel de carbón en la despensa interior.",
    "Asegurarse de que el extractor de humo esté encendido.",
    "Activar el modo 'Fiesta' en el Home Assistant."
  ];

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Test Header */}
      <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', padding: '8px' }}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-color)' }}>
          <Timer size={20} />
          <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '1.2rem' }}>04:59</span>
        </div>
      </div>

      {/* Test Body */}
      <div style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          {/* Progress dots */}
          {[1, 2, 3, 4, 5].map((dot, i) => (
            <div key={dot} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i === 0 ? 'var(--accent-color)' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>

        <div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
            Pregunta 1 de 5
          </span>
          <h2 style={{ fontSize: '1.4rem', marginTop: '12px', lineHeight: 1.4 }}>{question}</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          {options.map((opt, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={i}
                onClick={() => setSelected(i)}
                style={{
                  background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--glass-bg)',
                  border: `2px solid ${isSelected ? 'var(--accent-color)' : 'var(--glass-border)'}`,
                  color: 'var(--text-primary)',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  textAlign: 'left',
                  fontSize: '1rem',
                  fontFamily: 'Outfit',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 4px 15px rgba(59, 130, 246, 0.2)' : 'none'
                }}
              >
                <span style={{ paddingRight: '12px', lineHeight: 1.4, opacity: isSelected ? 1 : 0.8 }}>{opt}</span>
                {isSelected && (
                  <div style={{ background: 'var(--accent-color)', borderRadius: '50%', padding: '4px', display: 'flex' }}>
                    <Check size={16} color="white" strokeWidth={3} />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Fixed bottom button */}
      <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'var(--bg-color)', position: 'sticky', bottom: 0 }}>
        <button 
          className="glass-button primary"
          disabled={selected === null}
          style={{ 
            opacity: selected === null ? 0.5 : 1, 
            cursor: selected === null ? 'not-allowed' : 'pointer'
          }}
        >
          Confirmar Respuesta
        </button>
      </div>
    </div>
  );
}
