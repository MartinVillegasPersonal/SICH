import { useState } from 'react';
import { ArrowLeft, RefreshCw, Copy, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../index.css';

export default function TokenManager() {
  const navigate = useNavigate();
  const [colaboradora, setColaboradora] = useState('');
  const [ruleId, setRuleId] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    if (!colaboradora || !ruleId) return;
    
    // Simulating token generation
    const fakeToken = `${colaboradora.substring(0,3).toUpperCase()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const url = `http://192.168.0.216/e/${fakeToken}`;
    
    setGeneratedLink(url);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-slide-up" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="glass-button" style={{ width: 'auto', padding: '12px' }} onClick={() => navigate('/admin')}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Emitir Token</h2>
      </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Seleccionar Colaboradora</label>
          <select 
            value={colaboradora}
            onChange={(e) => setColaboradora(e.target.value)}
            style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '1rem', appearance: 'none', fontFamily: 'Outfit' }}
          >
            <option value="" disabled>Elige a una niña...</option>
            <option value="Martina">Martina (12)</option>
            <option value="Alfonsina">Alfonsina (10)</option>
          </select>
        </div>

        <div>
           <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Seleccionar Normativa a Evaluar</label>
           <select 
            value={ruleId}
            onChange={(e) => setRuleId(e.target.value)}
            style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '1rem', appearance: 'none', fontFamily: 'Outfit' }}
          >
            <option value="" disabled>Selecciona la ruta...</option>
            <option value="1">Uso del Quincho y Parrilla</option>
            <option value="2">Mantenimiento de Notebook Dell</option>
            <option value="3">Horarios de Salidas</option>
          </select>
        </div>

        <button 
          className="glass-button primary" 
          style={{ marginTop: '8px' }}
          onClick={handleGenerate}
          disabled={!colaboradora || !ruleId}
        >
          <RefreshCw size={20} />
          Generar Link de Autenticación
        </button>
      </div>

      {generatedLink && (
        <div className="animate-slide-up glass-panel" style={{ border: '2px solid var(--success-color)', background: 'rgba(16, 185, 129, 0.05)' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: 'var(--success-color)' }}>¡URL Lista para WhatsApp!</h3>
          <div style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '12px', fontFamily: 'monospace', color: 'var(--text-primary)', wordBreak: 'break-all', marginBottom: '16px' }}>
            {generatedLink}
          </div>

          <button className="glass-button" style={{ background: copied ? 'var(--success-color)' : 'var(--glass-bg)', color: copied ? 'white' : 'var(--text-primary)' }} onClick={copyToClipboard}>
            {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
            {copied ? '¡Copiado!' : 'Copiar al Portapapeles'}
          </button>
        </div>
      )}

    </div>
  );
}
