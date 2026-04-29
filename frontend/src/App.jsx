import React, { useState } from 'react';

// Refined KPI Badge
const KPIBadge = ({ name }) => (
  <span style={{
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    color: '#a5b4fc',
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    border: '1px solid rgba(129, 140, 248, 0.3)',
    letterSpacing: '0.025em'
  }}>
    {name}
  </span>
);

function App() {
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      });
      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      alert("Check if backend is running on port 3001!");
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      backgroundColor: '#0f172a', 
      color: '#f8fafc', 
      minHeight: '100vh', 
      fontFamily: "'Inter', sans-serif",
      padding: '40px 60px'
    }}>
      {/* Header */}
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', margin: 0, color: '#6366f1' }}>
          Trinethra <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '18px' }}>| Supervisor Feedback Analyzer</span>
        </h1>
        <p style={{ color: '#64748b', marginTop: '8px' }}>AI-assisted behavioral mapping for Fellow performance reviews.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '40px', alignItems: 'start' }}>
        
        {/* LEFT: Input Section */}
        <section style={{ position: 'sticky', top: '40px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Input Transcript</h3>
            <textarea 
              style={{ 
                width: '100%', minHeight: '450px', backgroundColor: '#0f172a', color: '#e2e8f0', border: '1px solid #334155', borderRadius: '12px', padding: '16px', fontSize: '14px', lineHeight: '1.6', outline: 'none', transition: 'border-color 0.2s', resize: 'none'
              }}
              placeholder="Paste the supervisor conversation here..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
            <button 
              onClick={handleAnalyze}
              disabled={loading || !transcript}
              style={{ 
                width: '100%', marginTop: '20px', padding: '14px', backgroundColor: loading ? '#334155' : '#4f46e5', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: 'transform 0.1s'
              }}
            >
              {loading ? 'Analyzing Content...' : 'Generate Analysis'}
            </button>
          </div>
        </section>

        {/* RIGHT: Results Section */}
        <section>
          {!analysis ? (
            <div style={{ height: '500px', border: '2px dashed #334155', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
              Pending transcript input for diagnostic output...
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Score Card */}
              <div style={{ backgroundColor: '#1e293b', padding: '30px', borderRadius: '16px', borderLeft: '6px solid #4f46e5' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                   <h2 style={{ margin: 0, fontSize: '14px', color: '#94a3b8', textTransform: 'uppercase' }}>Suggested Score</h2>
                   <span style={{ fontSize: '24px', fontWeight: '800', color: '#818cf8' }}>
                     <span contentEditable suppressContentEditableWarning>{analysis.score}</span>/10
                   </span>
                </div>
                <div contentEditable suppressContentEditableWarning style={{ fontSize: '16px', lineHeight: '1.6', color: '#cbd5e1', fontStyle: 'italic' }}>
                  "{analysis.justification}"
                </div>
              </div>

              {/* KPI Section */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {analysis.kpis.map((kpi, i) => <KPIBadge key={i} name={kpi} />)}
              </div>

              {/* Evidence Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ backgroundColor: '#064e3b22', padding: '20px', borderRadius: '12px', border: '1px solid #065f46' }}>
                  <h4 style={{ color: '#34d399', fontSize: '14px', marginTop: 0 }}>Positive Evidence</h4>
                  {analysis.evidence.filter(e => e.sentiment === 'positive').map((e, i) => (
                    <p key={i} style={{ fontSize: '13px', color: '#a7f3d0', borderBottom: '1px solid #064e3b', paddingBottom: '8px' }}>• {e.quote}</p>
                  ))}
                </div>
                <div style={{ backgroundColor: '#451a1a22', padding: '20px', borderRadius: '12px', border: '1px solid #991b1b' }}>
                  <h4 style={{ color: '#f87171', fontSize: '14px', marginTop: 0 }}>Negative Evidence</h4>
                  {analysis.evidence.filter(e => e.sentiment === 'negative').map((e, i) => (
                    <p key={i} style={{ fontSize: '13px', color: '#fecaca', borderBottom: '1px solid #451a1a', paddingBottom: '8px' }}>• {e.quote}</p>
                  ))}
                </div>
              </div>

              {/* Gaps & Next Steps */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', backgroundColor: '#1e293b', padding: '24px', borderRadius: '16px', border: '1px solid #334155' }}>
                <div>
                  <h4 style={{ color: '#fbbf24', fontSize: '14px', marginTop: 0 }}>Information Gaps</h4>
                  <ul style={{ fontSize: '13px', color: '#94a3b8', paddingLeft: '18px' }}>
                    {analysis.gaps.map((gap, i) => <li key={i} style={{ marginBottom: '8px' }}>{gap}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 style={{ color: '#60a5fa', fontSize: '14px', marginTop: 0 }}>Next Call Strategy</h4>
                  <ul style={{ fontSize: '13px', color: '#94a3b8', paddingLeft: '18px' }}>
                    {analysis.followUp.map((q, i) => <li key={i} style={{ marginBottom: '8px' }}>{q}</li>)}
                  </ul>
                </div>
              </div>

            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;