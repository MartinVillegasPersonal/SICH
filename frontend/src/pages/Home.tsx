import { BookOpen, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import '../index.css';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="animate-slide-up" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <section>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Bienvenida</h2>
        <p>Selecciona un módulo de capacitación para comenzar.</p>
      </section>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Module Card 1: Available */}
        <div className="glass-panel" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} onClick={() => navigate('/test')}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '10px', borderRadius: '12px' }}>
                <BookOpen size={24} color="var(--accent-color)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Uso del Quincho</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '12px' }}>Pendiente</span>
              </div>
            </div>
            <ChevronRight size={24} color="var(--text-secondary)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '0%', height: '100%', background: 'var(--accent-color)' }} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>0%</span>
          </div>
        </div>

        {/* Module Card 2: Completed */}
        <div className="glass-panel" style={{ border: '1px solid rgba(16, 185, 129, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '10px', borderRadius: '12px' }}>
                <CheckCircle2 size={24} color="var(--success-color)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--success-color)' }}>Notebook Dell</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Aprobado hace 2 días</span>
              </div>
            </div>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)', fontSize: '0.8rem', fontWeight: 700, padding: '6px 10px', borderRadius: '20px' }}>
              95%
            </div>
          </div>
        </div>

        {/* Module Card 3: Locked */}
        <div className="glass-panel" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>
                <Lock size={24} color="var(--text-secondary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Horario de Salidas</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nivel insuficiente</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
