import { useState } from 'react';
import { ArrowLeft, Save, Plus, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ENDPOINTS } from '../../api/config';
import '../../index.css';

interface Question {
  enunciado: string;
  opciones_json: string[];
  correcta_index: number;
}

export default function RuleEditor() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [haEntity, setHaEntity] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { enunciado: '', opciones_json: ['', '', '', ''], correcta_index: 0 }]);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQs = [...questions];
    newQs[index] = { ...newQs[index], [field]: value };
    setQuestions(newQs);
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    const newQs = [...questions];
    newQs[qIndex].opciones_json[oIndex] = value;
    setQuestions(newQs);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!title || !content || questions.length === 0) {
      alert("Faltan campos obligatorios o preguntas.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(ENDPOINTS.REGLAS_SAVE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: title,
          cuerpo: content,
          ha_entity: haEntity,
          preguntas: questions
        })
      });

      const result = await response.json();
      if (result.status === "ok") {
        navigate('/admin');
      }
    } catch (err) {
      console.error("Error saving rule:", err);
      alert("Error al guardar en el servidor HP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide-up" style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '100px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="glass-button" style={{ width: 'auto', padding: '12px' }} onClick={() => navigate('/admin')}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Crear Normativa</h2>
      </div>

      <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Título de la Norma</label>
          <input 
            type="text" 
            placeholder="Ej: Uso del Quincho"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '1rem' }}
          />
        </div>

        <div>
           <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Mapeo Home Assistant (ID Entidad)</label>
          <input 
            type="text" 
            placeholder="Ej: switch.luz_quincho"
            value={haEntity}
            onChange={(e) => setHaEntity(e.target.value)}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'var(--accent-color)', fontFamily: 'monospace', fontSize: '1rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Texto de la Regla (lo que leerán las niñas)</label>
          <textarea 
            placeholder="Escribe la normativa detallada..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', fontFamily: 'Outfit', resize: 'vertical', fontSize: '1rem' }}
          />
        </div>
      </div>

      <h3 style={{ fontSize: '1.2rem', marginTop: '16px' }}>Cuestionario de Evaluación</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {questions.map((q, qIdx) => (
          <div key={qIdx} className="glass-panel" style={{ position: 'relative' }}>
            <button 
              onClick={() => removeQuestion(qIdx)}
              style={{ position: 'absolute', top: '16px', right: '16px', color: 'var(--error-color)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Trash2 size={20} />
            </button>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', opacity: 0.6, fontSize: '0.9rem' }}>Enunciado Pregunta {qIdx+1}</label>
              <input 
                value={q.enunciado}
                onChange={(e) => updateQuestion(qIdx, 'enunciado', e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              />
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              {q.opciones_json.map((opt, oIdx) => (
                <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button 
                    onClick={() => updateQuestion(qIdx, 'correcta_index', oIdx)}
                    style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', 
                      background: q.correcta_index === oIdx ? 'var(--success-color)' : 'rgba(255,255,255,0.05)',
                      border: '2px solid rgba(255,255,255,0.1)', cursor: 'pointer'
                    }}
                  >
                    {q.correcta_index === oIdx && <CheckCircle size={14} color="white" />}
                  </button>
                  <input 
                    placeholder={`Opción ${oIdx+1}`}
                    value={opt}
                    onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                    style={{ flex: 1, padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', fontSize: '0.9rem' }}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button 
        className="glass-button" 
        style={{ border: '1px dashed var(--glass-border)', background: 'rgba(59, 130, 246, 0.05)' }} 
        onClick={addQuestion}
      >
        <Plus size={20} color="var(--accent-color)" />
        <span style={{ color: 'var(--accent-color)' }}>Añadir Pregunta</span>
      </button>

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '20px', background: 'rgba(10, 10, 18, 0.8)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--glass-border)', zIndex: 100 }}>
        <button 
          className="glass-button primary" 
          onClick={handleSave}
          disabled={loading}
          style={{ maxWidth: '600px', margin: '0 auto' }}
        >
          {loading ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
          {loading ? 'Guardando...' : 'Publicar Normativa'}
        </button>
      </div>
    </div>
  );
}
