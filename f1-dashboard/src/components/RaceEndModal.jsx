import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Flag, Zap, Loader2 } from 'lucide-react';
import './RaceEndModal.css';

const RaceEndModal = ({ isOpen, onClose, raceState, onGenerateInsights }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('RaceEndModal render:', { isOpen, hasRaceState: !!raceState, raceFinished: raceState?.race_finished });
  }, [isOpen, raceState]);

  if (!isOpen || !raceState) {
    console.log('RaceEndModal not rendering:', { isOpen, hasRaceState: !!raceState });
    return null;
  }

  const sortedCars = [...(raceState.cars || [])].sort((a, b) => a.position - b.position);
  const winner = sortedCars[0];
  const fastestLap = sortedCars.reduce((fastest, car) => {
    // Calculate fastest lap (simplified - would need lap data)
    return fastest;
  }, null);

  const handleGenerateInsights = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      await onGenerateInsights();
    } catch (err) {
      const errorMsg = err.message || 'Failed to generate insights';
      setError(errorMsg);
      console.error('Insights generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="race-end-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="race-end-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="race-end-header">
              <Flag className="race-end-flag-icon" />
              <h2>Race Finished!</h2>
            </div>

            <div className="race-end-content">
              {winner && (
                <div className="race-winner-section">
                  <Trophy className="trophy-icon" />
                  <div className="winner-info">
                    <div className="winner-name">{winner.name}</div>
                    <div className="winner-position">P{winner.position}</div>
                    <div className="winner-time">
                      {formatTime(winner.total_time)}
                    </div>
                  </div>
                </div>
              )}

              <div className="race-stats-grid">
                <div className="stat-card">
                  <Clock className="stat-icon" />
                  <div className="stat-value">{formatTime(raceState.time || 0)}</div>
                  <div className="stat-label">Race Duration</div>
                </div>
                <div className="stat-card">
                  <Flag className="stat-icon" />
                  <div className="stat-value">{raceState.total_laps || 0}</div>
                  <div className="stat-label">Total Laps</div>
                </div>
                <div className="stat-card">
                  <Zap className="stat-icon" />
                  <div className="stat-value">
                    {sortedCars.reduce((sum, car) => sum + (car.pitstop_count || 0), 0)}
                  </div>
                  <div className="stat-label">Total Pit Stops</div>
                </div>
              </div>

              <div className="podium-section">
                <h3>Podium</h3>
                <div className="podium-container">
                  {sortedCars.slice(0, 3).map((car, index) => (
                    <div key={car.name} className={`podium-item podium-${index + 1}`}>
                      <div className="podium-position">P{car.position}</div>
                      <div className="podium-name">{car.name}</div>
                      <div className="podium-time">{formatTime(car.total_time)}</div>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="error-message">
                  {error}
                </div>
              )}

              <div className="insights-actions">
                <button
                  className="generate-insights-btn"
                  onClick={handleGenerateInsights}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="spinning-loader" />
                      <span>Generating ML Insights...</span>
                    </>
                  ) : (
                    <>
                      <Zap />
                      <span>Generate ML Insights</span>
                    </>
                  )}
                </button>
                <button className="close-btn" onClick={onClose}>
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '0:00.000';
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, '0')}`;
};

export default RaceEndModal;

