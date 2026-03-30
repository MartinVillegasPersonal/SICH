import { useState, useEffect } from 'react';
import { BookOpen, KeyRound, Activity, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../../api/config';
import '../../index.css';

interface Recent {
  colaboradora: string;
  fecha: string;
  nota: number;
}

interface Stats {
  reglas: number;
  aprobados: number;
  recientes: Recent[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(ENDPOINTS.DASHBOARD)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching dashboard:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-color)" />
        <p style={{ color: 'var(--text-secondary)' }}>Cargando Centro de Mando...</p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <section>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Panel de Control</h2>
        <p>Resumen de cumplimiento S.I.C.H.</p>
      </section>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>Normativas</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-color)' }}>{stats?.reglas || 0}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>Reglas cargadas</div>
        </div>
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>Éxitos</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--success-color)' }}>{stats?.aprobados || 0}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '4px' }}>Aprobados</div>
        </div>
      </div>

      {/* Recent Activity */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', opacity: 0.7 }}>
          <Activity size={18} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Actividad Reciente</h3>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stats?.recientes.map((act, i) => (
             <div key={i} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{act.colaboradora}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{act.fecha}</div>
                </div>
                <div style={{ color: act.nota >= 80 ? 'var(--success-color)' : 'var(--error-color)', fontWeight: 700 }}>{act.nota}%</div>
             </div>
          ))}
          {(!stats || stats.recientes.length === 0) && <p style={{ opacity: 0.5, textAlign: 'center' }}>Sin registros aún.</p>}
        </div>
      </section>

      <h3 style={{ fontSize: '1.2rem', marginTop: '8px' }}>Módulos de Gestión</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <button className="glass-button card-hover" style={{ justifyContent: 'flex-start', padding: '20px' }} onClick={() => navigate('/admin/rules')}>
          <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '12px', borderRadius: '12px', marginRight: '16px' }}>
             <BookOpen size={24} color="var(--accent-color)" />
          </div>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Editor de Reglas</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Crear o modificar normativas y mapeo HA</span>
          </div>
          <ChevronRight size={20} opacity={0.3} />
        </button>

        <button className="glass-button card-hover" style={{ justifyContent: 'flex-start', padding: '20px' }} onClick={() => navigate('/admin/tokens')}>
          <div style={{ background: 'rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '12px', marginRight: '16px' }}>
             <KeyRound size={24} color="var(--success-color)" />
          </div>
          <div style={{ textAlign: 'left', flex: 1 }}>
            <h4 style={{ fontSize: '1.1rem', margin: 0 }}>Generador de Tokens</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Crear enlaces para Martina y Alfonsina</span>
          </div>
          <ChevronRight size={20} opacity={0.3} />
        </button>
      </div>
    </div>
  );
}
