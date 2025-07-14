import React from 'react';
import { CERTIFICATIONS } from '../constants';

const CertificationsDebug = () => {
  console.log('CERTIFICATIONS data:', CERTIFICATIONS);
  console.log('Number of certifications:', CERTIFICATIONS?.length);
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#1a1a1a', 
      color: 'white',
      position: 'fixed',
      top: '100px',
      right: '20px',
      zIndex: 9999,
      maxWidth: '300px',
      borderRadius: '8px',
      border: '1px solid #333'
    }}>
      <h3>Certifications Debug</h3>
      <p>Total Certifications: {CERTIFICATIONS?.length || 0}</p>
      <div>
        {CERTIFICATIONS?.slice(0, 3).map((cert, index) => (
          <div key={index} style={{ marginBottom: '10px', fontSize: '12px' }}>
            <strong>{cert.title}</strong><br/>
            <span style={{ color: '#888' }}>{cert.issuer}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificationsDebug;

