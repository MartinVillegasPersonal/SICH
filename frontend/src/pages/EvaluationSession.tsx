import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Timer, AlertTriangle, ShieldCheck, XCircle, BookOpen, Loader2 } from 'lucide-react';
import { ENDPOINTS } from '../api/config';
import '../index.css';

type Phase = 'reading' | 'testing' | 'success' | 'failure';

interface Rule {
  id: number;
  titulo: string;
  cuerpo: string;
  ha_entity: string;
  preguntas: {
    id: number;
    enunciado: string;
    opciones_json: string[];
    correcta_index: number;
  }[];
}

export default function EvaluationSession() {
  const { token } = useParams<{ token: string }>();
  const [phase, setPhase] = useState<Phase>('reading');
  const [rule, setRule] = useState<Rule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Test State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Timer State (3 minutes = 180 seconds)
  const [timeLeft, setTimeLeft] = useState(180);

  useEffect(() => {
    fetchRuleData();
  }, [token]);

  useEffect(() => {
    let timer: number | undefined;
    if (phase === 'testing' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && phase === 'testing') {
      submitEvaluation(true); 
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const fetchRuleData = async () => {
    try {
      setLoading(true);
      const response = await fetch(ENDPOINTS.REGLAS);
      let result = await response.json();
      
      // Fix for double JSON encoded response
      if (typeof result === "string") {
        try {
          result = JSON.parse(result);
        } catch (e) {
          console.error("Error parsing result", e);
        }
      }
      
      if (result.status === "ok" && result.data && result.data.length > 0) {
        // En lugar de tomar siempre el primero, intentamos buscar la regla basada en el token
        const matchedRule = result.data.find((r: Rule) => token && token.includes(String(r.id)));
        setRule(matchedRule || result.data[0]);
      } else {
        setError("No se encontraron normativas activas.");
      }
    } catch (err) {
      setError("Error conectando al Servidor HP");
    } finally {
      setLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (selectedOption === null || !rule) return;
    
    const questionId = rule.preguntas[currentQuestionIndex].id;
    const newAnswers = { ...answers, [questionId]: selectedOption };
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestionIndex < rule.preguntas.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitEvaluation(false, newAnswers);
    }
  };

  const submitEvaluation = async (timeOut: boolean = false, finalAnswers = answers) => {
    if (timeOut) {
      setPhase('failure');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        token_id: token,
        regla_id: rule?.id,
        respuestas: finalAnswers
      };

      const response = await fetch(ENDPOINTS.EVALUAR, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let result = await response.json();
      
      // Fix for double JSON encoded response
      if (typeof result === "string") {
        try {
          result = JSON.parse(result);
        } catch (e) {
          console.error("Error parsing result", e);
        }
      }
      
      if (result.status === "ok" && result.aprobado) {
        setPhase('success');
      } else {
        setPhase('failure');
      }
    } catch (err) {
      setError("Error enviando resultados al HP Server");
    } finally {
      setLoading(false);
    }
  };

  const restartFromReading = () => {
    setPhase('reading');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedOption(null);
    setTimeLeft(180);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading && phase !== 'success' && phase !== 'failure') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-color)" />
        <p style={{ color: 'var(--text-secondary)' }}>Comunicando con el HP Server...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <AlertTriangle size={48} color="var(--error-color)" style={{ marginBottom: '16px' }} />
        <h2 style={{ marginBottom: '8px' }}>Error Crítico</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
        <button className="glass-button" onClick={fetchRuleData}>Reintentar carga</button>
      </div>
    );
  }

  if (!rule) return null;

  if (phase === 'reading') {
    return (
      <div className="animate-slide-up" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7, marginBottom: '24px' }}>
            <BookOpen size={20} />
            <span style={{ fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Lectura de Norma</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '16px', color: 'var(--accent-color)' }}>
            {rule.titulo}
          </h1>
          <div style={{ 
            background: 'var(--glass-bg)', 
            border: '1px solid var(--glass-border)', 
            padding: '20px', 
            borderRadius: '16px',
            lineHeight: 1.6,
            fontSize: '1.05rem',
            whiteSpace: 'pre-wrap'
          }}>
            {rule.cuerpo}
          </div>
        </div>
        <div style={{ position: 'sticky', bottom: '0', background: 'var(--bg-color)', padding: '20px 0', borderTop: '1px solid var(--glass-border)', marginTop: '20px' }}>
            <button 
              className="glass-button primary" 
              onClick={() => setPhase('testing')}
            >
              Iniciar Evaluación
            </button>
        </div>
      </div>
    );
  }

  if (phase === 'testing') {
    const q = rule.preguntas[currentQuestionIndex];
    return (
      <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
             Pregunta {currentQuestionIndex + 1} de {rule.preguntas.length}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: timeLeft < 30 ? 'var(--error-color)' : 'var(--accent-color)' }}>
            <Timer size={20} />
            <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '1.2rem' }}>{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', lineHeight: 1.4 }}>{q.enunciado}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            {q.opciones_json.map((opt, i) => {
              const isSelected = selectedOption === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedOption(i)}
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

        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'var(--bg-color)', position: 'sticky', bottom: 0 }}>
          <button 
            className="glass-button primary"
            disabled={selectedOption === null}
            style={{ 
              opacity: selectedOption === null ? 0.5 : 1, 
              cursor: selectedOption === null ? 'not-allowed' : 'pointer'
            }}
            onClick={handleNextQuestion}
          >
            {currentQuestionIndex === rule.preguntas.length - 1 ? 'Finalizar' : 'Siguiente Pregunta'}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'success') {
    return (
      <div className="animate-slide-up" style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.15)', 
          padding: '24px', 
          borderRadius: '50%',
          marginBottom: '24px',
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.3)'
        }}>
          <ShieldCheck size={64} color="var(--success-color)" />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--success-color)' }}>¡Aprobado!</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '300px' }}>
          Has superado la evaluación con éxito. El acceso al recurso solicitado ya está habilitado en Home Assistant.
        </p>
        <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>Token: {token}</p>
        <p style={{ fontSize: '0.9rem', opacity: 0.5, marginTop: '8px' }}>Ya puedes cerrar esta pestaña.</p>
      </div>
    );
  }

  if (phase === 'failure') {
    return (
      <div className="animate-slide-up" style={{ padding: '40px 20px', display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
         <div style={{ 
          background: 'rgba(239, 68, 68, 0.15)', 
          padding: '24px', 
          borderRadius: '50%',
          marginBottom: '24px',
          boxShadow: '0 0 40px rgba(239, 68, 68, 0.3)'
        }}>
          <XCircle size={64} color="var(--error-color)" />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--error-color)' }}>Nivel Insuficiente</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '300px' }}>
          No has alcanzado el umbral del 80% necesario para esta normativa (o el tiempo expiró).
        </p>
        
        <button className="glass-button" onClick={restartFromReading}>
          <AlertTriangle size={20} color="var(--error-color)" />
          <span>Volver a Leer Norma</span>
        </button>
      </div>
    );
  }

  return null;
}
