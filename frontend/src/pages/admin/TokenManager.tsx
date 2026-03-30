import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../../api/config';
import '../../index.css';

interface Rule {
  id: number;
  titulo: string;
}

export default function TokenManager() {
  const navigate = useNavigate();
  const [colaboradora, setColaboradora] = useState('');
  const [ruleId, setRuleId] = useState('');
  const [rules, setRules] = useState<Rule[]>([]);
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(ENDPOINTS.REGLAS)
      .then(res => res.json())
      .then(data => {
        if (data.status === "ok") setRules(data.data);
      });
  }, []);

  const handleGenerate = async () => {
    if (!colaboradora || !ruleId) return;
    
    setLoading(true);
    const fakeToken = `${colaboradora.substring(0,3).toUpperCase()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    try {
      const response = await fetch(ENDPOINTS.TOKENS_SAVE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_id: fakeToken,
          colaboradora_nombre: colaboradora
        })
      });

      const result = await response.json();
      if (result.status === "ok") {
        const url = `http://192.168.0.216/e/${fakeToken}`;
        setGeneratedLink(url);
        setCopied(false);
      }
    } catch (err) {
      console.error("Error saving token:", err);
    } finally {
      setLoading(false);
    }
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
            <option value="" disabled>Escoge una regla...</option>
            {rules.map(r => (
              <option key={r.id} value={r.id}>{r.titulo}</option>
            ))}
          </select>
        </div>

        <button 
          className="glass-button primary" 
          style={{ marginTop: '8px' }}
          onClick={handleGenerate}
          disabled={!colaboradora || !ruleId || loading}
        >
          {loading ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
          {loading ? 'Guardando en BD...' : 'Generar Link de Autenticación'}
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
