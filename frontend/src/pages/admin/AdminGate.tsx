import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { Outlet } from 'react-router-dom';

const MOCK_PIN = "1234"; // Fake PIN for prototype

export default function AdminGate() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === MOCK_PIN) {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  if (isAuthenticated) {
    return <Outlet />;
  }

  return (
    <div className="animate-slide-up" style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '32px 24px', borderRadius: '20px', width: '100%', maxWidth: '320px', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '16px', borderRadius: '50%', display: 'inline-block', marginBottom: '20px' }}>
          {error ? <Lock size={32} color="var(--error-color)" /> : <Unlock size={32} color="var(--accent-color)" />}
        </div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Solo Director General</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Ingrese el PIN corporativo para acceder al gestor.
        </p>
        
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '16px', 
              borderRadius: '12px', 
              border: `1px solid ${error ? 'var(--error-color)' : 'rgba(255,255,255,0.2)'}`,
              background: 'rgba(0,0,0,0.2)',
              color: 'white',
              fontSize: '1.5rem',
              textAlign: 'center',
              letterSpacing: '8px',
              fontFamily: 'monospace',
              marginBottom: '20px'
            }}
            placeholder="****"
            maxLength={4}
            autoFocus
          />
          <button type="submit" className="glass-button primary">
            Desbloquear
          </button>
        </form>
      </div>
    </div>
  );
}
