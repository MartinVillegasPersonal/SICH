import { useState, useEffect } from 'react';
import { Shield, BookOpen, Clock, CheckCircle, AlertCircle, Loader2, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../api/config';
import '../index.css';

interface Rule {
  id: number;
  titulo: string;
  cuerpo: string;
  ha_entity: string;
  estado?: 'aprobado' | 'pendiente';
  token?: string | null;
}

export default function Home() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<string | null>(() => {
    const saved = localStorage.getItem('sich_profile');
    if (saved === 'Admin') {
      localStorage.removeItem('sich_profile');
      return null;
    }
    return saved;
  });

  useEffect(() => {
    if (profile) {
      fetchNenaStatus(profile);
    }
  }, [profile]);

  const fetchNenaStatus = async (colab: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${ENDPOINTS.NENA_STATUS}?colaboradora=${colab}`);
      let result = await response.json();
      
      if (typeof result === "string") {
        try { result = JSON.parse(result); } catch (e) {}
      }
      
      if (result && result.status === "ok") {
        setRules(result.data || []);
      } else {
        setError(result?.message || "Error en respuesta de API");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor HP");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = (p: string) => {
    if (p === 'Admin') {
      navigate('/admin');
      return;
    }
    localStorage.setItem('sich_profile', p);
    setProfile(p);
  };

  const logout = () => {
    localStorage.removeItem('sich_profile');
    setProfile(null);
    setRules([]);
  };

  if (!profile) {
    return (
      <div className="animate-slide-up" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <Shield size={64} color="var(--accent-color)" style={{ marginBottom: '24px' }} />
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '32px' }}>¿Quién eres?</h1>
        
        <div style={{ display: 'grid', gap: '16px', width: '100%', maxWidth: '300px' }}>
          {['Martina', 'Alfonsina'].map(p => (
            <button 
              key={p} 
              className="glass-button" 
              style={{ padding: '20px', fontSize: '1.2rem' }}
              onClick={() => handleSelectProfile(p)}
            >
              <User size={24} />
              Soy {p}
            </button>
          ))}
          <div style={{ height: '20px' }}></div>
          <button 
            className="glass-button" 
            style={{ padding: '16px', fontSize: '1rem', background: 'rgba(255,255,255,0.05)' }}
            onClick={() => handleSelectProfile('Admin')}
          >
            Adultos / Admin
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-color)" />
        <p style={{ color: 'var(--text-secondary)' }}>Cargando perfil de {profile}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <AlertCircle size={48} color="var(--error-color)" style={{ marginBottom: '16px' }} />
        <h2 style={{ marginBottom: '8px' }}>Error de Conexión</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
        <button className="glass-button" onClick={() => fetchNenaStatus(profile)}>Reintentar</button>
        <button className="glass-button" style={{ marginTop: '16px' }} onClick={logout}>Cambiar Perfil</button>
      </div>
    );
  }

  return (
    <div className="animate-slide-up" style={{ padding: '24px 20px' }}>
      <section style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7, marginBottom: '8px' }}>
            <User size={16} />
            <span style={{ fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Dashboard Personal</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>¡Hola {profile}!</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Tienes {rules.filter(r => r.estado === 'pendiente').length} exámenes pendientes.
          </p>
        </div>
        <button onClick={logout} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px' }}>
          <LogOut size={20} />
        </button>
      </section>

      <div style={{ display: 'grid', gap: '16px' }}>
        {rules.map((rule) => {
          const isAprobado = rule.estado === 'aprobado';
          
          return (
            <div 
              key={rule.id}
              className={`glass-panel ${!isAprobado ? 'card-hover' : ''}`}
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '16px', 
                cursor: isAprobado ? 'default' : 'pointer',
                opacity: isAprobado ? 0.7 : 1,
                border: isAprobado ? '1px solid rgba(16, 185, 129, 0.3)' : undefined
              }}
              onClick={() => {
                if (!isAprobado && rule.token) {
                  navigate(`/e/${rule.token}`);
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ background: isAprobado ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', padding: '10px', borderRadius: '12px' }}>
                  <BookOpen size={24} color={isAprobado ? "var(--success-color)" : "var(--accent-color)"} />
                </div>
                <div style={{ 
                  background: isAprobado ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)', 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  color: isAprobado ? "var(--success-color)" : "var(--text-primary)"
                }}>
                  {isAprobado ? <CheckCircle size={16} /> : <Clock size={16} />}
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>{rule.estado}</span>
                </div>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>{rule.titulo}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {rule.cuerpo.substring(0, 80)}...
                </p>
              </div>

              {!isAprobado && (
                <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Id: {rule.id}</span>
                  <span style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: 600 }}>Hacer Examen →</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
