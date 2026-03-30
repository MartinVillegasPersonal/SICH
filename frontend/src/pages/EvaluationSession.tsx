import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Check, Timer, AlertTriangle, ShieldCheck, XCircle, BookOpen } from 'lucide-react';
import '../index.css';

type Phase = 'reading' | 'testing' | 'success' | 'failure';

// Mock data (en el futuro esto vendrá de la API basado en el :token)
const RULE_DATA = {
  title: "Uso del Quincho y Parrilla",
  content: `El quincho es un área de uso compartido. Para garantizar la seguridad y el orden, se deben seguir las siguientes normas:
  
1. **Limpieza posterior:** Es obligatorio dejar las parrillas limpias sin restos de carbón ni grasa visible antes de retirarse.
2. **Seguridad del gas:** El paso fundamental antes de encender cualquier quemador o acercar fuego es asegurar la apertura de la válvula general en el patio.
3. **Residuos:** Bolsas de basura deben sacarse al contenedor de la calle inmediatamente terminada la cena.
4. **Horarios:** Las luces principales se apagarán automáticamente a las 02:00 AM mediante Home Assistant.

Presiona el botón inferior cuando hayas comprendido estas reglas para comenzar la evaluación cronometrada.`,
  questions: [
    {
      q: "¿Cuál es el paso OBLIGATORIO antes de encender la parrilla del quincho?",
      options: [
        "Abrir la válvula general de gas en el patio trasero.",
        "Comprobar el nivel de carbón en la despensa interior.",
        "Asegurarse de que el extractor de humo esté encendido.",
        "Activar el modo 'Fiesta' en el Home Assistant."
      ],
      correct: 0
    },
    {
      q: "¿A qué hora se apagarán automáticamente las luces del quincho?",
      options: [
        "A la medianoche (00:00).",
        "A las 01:00 AM.",
        "A las 02:00 AM mediante Home Assistant.",
        "No se apagan, debes hacerlo manualmente."
      ],
      correct: 2
    }
  ]
};

export default function EvaluationSession() {
  const { token } = useParams<{ token: string }>();
  const [phase, setPhase] = useState<Phase>('reading');
  
  // Test State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Timer State (3 minutes = 180 seconds)
  const [timeLeft, setTimeLeft] = useState(180);

  useEffect(() => {
    // Simulando que validamos el token
    console.log("Visualizando evaluación con token:", token);

    let timer: number | undefined;
    if (phase === 'testing' && timeLeft > 0) {
      timer = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && phase === 'testing') {
      finishTest(true); // Forzado por tiempo
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft, token]);

  const handleNextQuestion = () => {
    if (selectedOption === null) return;
    
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestionIndex < RULE_DATA.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishTest(false, newAnswers);
    }
  };

  const finishTest = (timeOut: boolean = false, finalAnswers = answers) => {
    if (timeOut) {
      setPhase('failure');
      return;
    }

    // Calcular score
    let correctCount = 0;
    finalAnswers.forEach((ans, idx) => {
      if (ans === RULE_DATA.questions[idx].correct) correctCount++;
    });
    
    const score = (correctCount / RULE_DATA.questions.length) * 100;
    
    if (score >= 80) {
      setPhase('success');
      // Aca iría un fetch a la API para activar Home Assistant
    } else {
      setPhase('failure');
    }
  };

  const restartFromReading = () => {
    setPhase('reading');
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setTimeLeft(180);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (phase === 'reading') {
    return (
      <div className="animate-slide-up" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.7, marginBottom: '24px' }}>
            <BookOpen size={20} />
            <span style={{ fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>Lectura de Norma</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: '16px', color: 'var(--accent-color)' }}>
            {RULE_DATA.title}
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
            {RULE_DATA.content}
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
    const q = RULE_DATA.questions[currentQuestionIndex];
    return (
      <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <div style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
             Pregunta {currentQuestionIndex + 1} de {RULE_DATA.questions.length}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: timeLeft < 30 ? 'var(--error-color)' : 'var(--accent-color)' }}>
            <Timer size={20} />
            <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '1.2rem' }}>{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div style={{ padding: '24px 20px', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <h2 style={{ fontSize: '1.4rem', lineHeight: 1.4 }}>{q.q}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            {q.options.map((opt, i) => {
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
            {currentQuestionIndex === RULE_DATA.questions.length - 1 ? 'Finalizar' : 'Siguiente Pregunta'}
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
        <h1 style={{ fontSize: '2rem', marginBottom: '16px', color: 'var(--success-color)' }}>¡Token Verificado!</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '32px', maxWidth: '300px' }}>
          Has comprendido correctamente las normativas. El privilegio solicitados se encuentra habilitado en el Centro de Mando.
        </p>
        <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>Ya puedes cerrar esta pestaña.</p>
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
