import React from 'react';
import { motion } from 'framer-motion';
import { Award, TrendingUp, AlertCircle, CheckCircle, RotateCcw, ArrowLeft, Trophy } from 'lucide-react';
import './RaceDashboard.css';

const RaceDashboard = ({ 
  insights = {}, 
  undercutSummary = [], 
  raceState = {},
  onReset,
  onBack
}) => {
  // Sort insights by final position (P1, P2, etc.)
  const sortedInsights = Object.values(insights).sort((a, b) => {
    return (a.final_position || 999) - (b.final_position || 999);
  });

  const getInsightIcon = (type) => {
    switch (type) {
      case 'undercut_success':
      case 'position_gain':
        return <CheckCircle size={16} className="insight-icon success" />;
      case 'undercut_failure':
      case 'position_loss':
        return <AlertCircle size={16} className="insight-icon warning" />;
      default:
        return <Award size={16} className="insight-icon" />;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="race-dashboard">
      <div className="race-dashboard-header">
        <div className="dashboard-title-section">
          <Trophy size={32} className="dashboard-trophy-icon" />
          <div>
            <h1>Race Complete</h1>
            <p className="dashboard-subtitle">Post-Race Analysis & Insights</p>
          </div>
        </div>
        <div className="dashboard-actions">
          {onBack && (
            <button className="back-button" onClick={onBack}>
              <ArrowLeft size={18} />
              Back to Race
            </button>
          )}
          {onReset && (
            <button className="reset-button" onClick={onReset}>
              <RotateCcw size={18} />
              Reset Race
            </button>
          )}
        </div>
      </div>

      <div className="race-dashboard-content">
        {/* Undercut Analysis Section */}
        {undercutSummary && undercutSummary.length > 0 && (
          <motion.section
            className="dashboard-section undercut-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="section-header">
              <Award size={24} />
              <h2>Undercut Analysis</h2>
            </div>
            <div className="undercut-grid">
              {undercutSummary.map((pitstop, idx) => (
                <motion.div
                  key={idx}
                  className="undercut-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="undercut-card-header">
                    <div>
                      <strong className="undercut-driver-name">{pitstop.car}</strong>
                      <span className="undercut-lap">Lap {pitstop.lap}</span>
                    </div>
                    <div className="undercut-tyre-change">
                      <span className="tyre-badge old">{pitstop.old_tyre}</span>
                      <span className="tyre-arrow">→</span>
                      <span className="tyre-badge new">{pitstop.new_tyre}</span>
                    </div>
                  </div>
                  <div className="undercut-card-body">
                    <div className="pit-time-info">
                      Pit Time: <strong>{pitstop.pit_time}s</strong>
                    </div>
                    <div className="undercut-list">
                      {pitstop.undercuts.map((undercut, uIdx) => (
                        <div key={uIdx} className="undercut-item">
                          <span className={`undercut-time ${undercut.time_gain > 0 ? 'gain' : 'loss'}`}>
                            {undercut.time_gain > 0 ? '+' : ''}{undercut.time_gain.toFixed(2)}s
                          </span>
                          <span className="undercut-vs">vs {undercut.vs}</span>
                          {undercut.position_change !== 0 && (
                            <span className="undercut-position">
                              (P{undercut.position_before} → P{undercut.position_after})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Driver Insights Section */}
        <motion.section
          className="dashboard-section insights-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="section-header">
            <TrendingUp size={24} />
            <h2>Driver Insights</h2>
          </div>
          <div className="insights-grid">
            {sortedInsights.map((driver, idx) => (
              <motion.div
                key={driver.name}
                className="driver-insight-card"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="driver-card-header">
                  <div className="driver-card-title">
                    <span className="driver-position-badge">P{driver.final_position}</span>
                    <h3>{driver.name}</h3>
                  </div>
                  <div className="driver-stats-mini">
                    <div className="mini-stat">
                      <span className="mini-stat-label">Time</span>
                      <span className="mini-stat-value">{formatTime(driver.total_time)}</span>
                    </div>
                    <div className="mini-stat">
                      <span className="mini-stat-label">Pitstops</span>
                      <span className="mini-stat-value">{driver.pitstops}</span>
                    </div>
                  </div>
                </div>

                {driver.insights && driver.insights.length > 0 && (
                  <div className="driver-insights-list">
                    <h4 className="insights-subheader">
                      <TrendingUp size={16} />
                      Key Insights
                    </h4>
                    {driver.insights.map((insight, iIdx) => (
                      <div key={iIdx} className="insight-item">
                        {getInsightIcon(insight.type)}
                        <div className="insight-content">
                          <div className="insight-message">{insight.message}</div>
                          <div className="insight-action">{insight.action}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {driver.recommendations && driver.recommendations.length > 0 && (
                  <div className="driver-recommendations-list">
                    <h4 className="recommendations-subheader">
                      <AlertCircle size={16} />
                      Recommendations
                    </h4>
                    <ul className="recommendations-list">
                      {driver.recommendations.map((rec, rIdx) => (
                        <li key={rIdx} className="recommendation-item">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {(!driver.insights || driver.insights.length === 0) && 
                 (!driver.recommendations || driver.recommendations.length === 0) && (
                  <div className="no-insights-message">
                    No significant insights for this driver.
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default RaceDashboard;

