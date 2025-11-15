import React, { useEffect, useRef } from 'react';
import { connectionPulse } from '../utils/animations';
import './ConnectionStatus.css';

const ConnectionStatus = ({ isConnected, error, onReset }) => {
  const statusDotRef = useRef(null);

  useEffect(() => {
    if (statusDotRef.current) {
      connectionPulse(statusDotRef.current, isConnected, {
        duration: 2000,
        connectedColor: '#00ff00',
        disconnectedColor: '#ff0000'
      });
    }
  }, [isConnected]);

  return (
    <div className="connection-status">
      <div className="status-bar">
        <div className="status-indicator">
          <span 
            ref={statusDotRef}
            className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}
          ></span>
          <span className="status-text">
            {isConnected ? '🟢 Connected to Server' : '🔴 Disconnected'}
          </span>
        </div>
        
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}
        
        <button 
          className="reset-button"
          onClick={onReset}
          disabled={!isConnected}
        >
          🔄 Reset Race
        </button>
      </div>
    </div>
  );
};

export default ConnectionStatus;
