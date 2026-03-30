import { BookOpen, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../index.css';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="animate-slide-up" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <section>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Panel de Control</h2>
        <p>Centro de Gobierno S.I.C.H.</p>
      </section>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>Novedades</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-color)' }}>3</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>Reglas cargadas</div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>Certificados</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success-color)' }}>12</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>Histórico</div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.2rem', marginTop: '8px' }}>Módulos de Gestión</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button className="glass-button" style={{ justifyContent: 'flex-start', padding: '20px' }} onClick={() => navigate('/admin/rules')}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '12px', borderRadius: '12px', marginRight: '8px' }}>
             <BookOpen size={24} color="var(--accent-color)" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Editor de Reglas</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Crear o modificar normativas y mapeo HA</span>
          </div>
        </button>

        <button className="glass-button" style={{ justifyContent: 'flex-start', padding: '20px' }} onClick={() => navigate('/admin/tokens')}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '12px', marginRight: '8px' }}>
             <KeyRound size={24} color="var(--success-color)" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Generador de Tokens</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Crear enlaces para Martina y Alfonsina</span>
          </div>
        </button>
      </div>

    </div>
  );
}
