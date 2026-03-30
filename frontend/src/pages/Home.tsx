import { useState, useEffect } from 'react';
import { Shield, BookOpen, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../api/config';
import '../index.css';

interface Rule {
  id: number;
  titulo: string;
  cuerpo: string;
  ha_entity: string;
  status?: 'pending' | 'success' | 'locked';
}

export default function Home() {
  const navigate = useNavigate();
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const response = await fetch(ENDPOINTS.REGLAS);
      const result = await response.json();
      
      if (result.status === "ok") {
        const enhancedRules = result.data.map((r: Rule) => ({
          ...r,
          status: 'pending' 
        }));
        setRules(enhancedRules);
      } else {
        setError("Error en respuesta de API");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor HP");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const statusIcons = {
    pending: <Clock className="text-blue-400" size={20} />,
    success: <CheckCircle className="text-emerald-400" size={20} />,
    locked: <AlertCircle className="text-amber-400" size={20} />
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-color)" />
        <p style={{ color: 'var(--text-secondary)' }}>Conectando al HP Server...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--error-color)" style={{ marginBottom: '16px' }} />
        <h2 style={{ marginBottom: '8px' }}>Error de Conexión</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
        <button className="glass-button" onClick={fetchRules}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ padding: '24px 20px' }}>
      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7, marginBottom: '8px' }}>
          <Shield size={16} />
          <span style={{ fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Estado del Hogar</span>
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>¡Hola Martin!</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
          {rules.length} normativas encontradas en el sistema.
        </p>
      </section>

      <div style={{ display: 'grid', gap: '16px' }}>
        {rules.map((rule) => (
          <div 
            key={rule.id}
            className="glass-panel card-hover"
            style={{ display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }}
            onClick={() => navigate('/test')}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '12px' }}>
                <BookOpen size={24} color="var(--accent-color)" />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {statusIcons[rule.status || 'pending']}
                <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{rule.status}</span>
              </div>
            </div>
            
            <div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{rule.titulo}</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {rule.cuerpo.substring(0, 80)}...
              </p>
            </div>

            <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>HA: {rule.ha_entity}</span>
               <span style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: 600 }}>Cuestionario →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
