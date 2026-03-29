import { ShieldCheck } from 'lucide-react';
import '../index.css';

export default function Header() {
  return (
    <header style={{
      padding: '24px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderBottom: '1px solid var(--glass-border)',
      background: 'rgba(13, 14, 21, 0.8)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{
        background: 'var(--accent-glow)',
        padding: '8px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <ShieldCheck size={28} color="var(--accent-color)" />
      </div>
      <div>
        <h1 style={{ fontSize: '1.2rem', marginBottom: '2px' }}>S.I.C.H.</h1>
        <p style={{ fontSize: '0.8rem', opacity: 0.8, color: 'var(--text-secondary)' }}>Cumplimiento Hogareño</p>
      </div>
    </header>
  );
}
