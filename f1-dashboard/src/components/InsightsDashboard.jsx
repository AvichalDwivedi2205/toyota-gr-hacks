import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Award, ChevronRight, Brain } from 'lucide-react';
import DriverInsightsPage from './DriverInsightsPage';
import './InsightsDashboard.css';

const InsightsDashboard = ({ insights, raceData, onClose }) => {
  const [selectedDriver, setSelectedDriver] = useState(null);

  if (!insights || !insights.drivers) {
    const errorMsg = insights?.error || 'No insights data available';
    const errorType = insights?.error_type || 'unknown';
    
    return (
      <div className="insights-dashboard">
        <div className="insights-error">
          <h2>Error Loading Insights</h2>
          <p>{errorMsg}</p>
          {errorType && <p className="error-type">Error Type: {errorType}</p>}
          {insights?.response_preview && (
            <details className="error-details">
              <summary>Response Preview</summary>
              <pre>{insights.response_preview}</pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  if (selectedDriver) {
    return (
      <DriverInsightsPage
        driverName={selectedDriver}
        insights={insights.drivers[selectedDriver]}
        raceData={raceData}
        onBack={() => setSelectedDriver(null)}
      />
    );
  }

  const drivers = Object.keys(insights.drivers || {});
  const raceSummary = raceData?.race_summary || {};

  return (
    <div className="insights-dashboard">
      <div className="insights-header">
        <div className="ml-badge">
          <Brain className="brain-icon" />
          <span>ML-Powered Analysis</span>
        </div>
        <h1>Race Strategy Insights</h1>
        <p className="insights-subtitle">AI-generated performance analysis and recommendations</p>
        <button className="close-insights-btn" onClick={onClose}>Close</button>
      </div>

      <div className="race-overview">
        <div className="overview-card">
          <div className="overview-label">Race Duration</div>
          <div className="overview-value">{formatTime(raceSummary.race_duration || 0)}</div>
        </div>
        <div className="overview-card">
          <div className="overview-label">Total Laps</div>
          <div className="overview-value">{raceSummary.total_laps || 0}</div>
        </div>
        <div className="overview-card">
          <div className="overview-label">Winner</div>
          <div className="overview-value">{raceSummary.winner || 'N/A'}</div>
        </div>
      </div>

      <div className="drivers-grid">
        {drivers.map((driverName) => {
          const driverInsights = insights.drivers[driverName];
          const driverData = raceData?.drivers?.find(d => d.name === driverName);
          
          if (!driverInsights) return null;

          const overallScore = driverInsights.overall_assessment?.performance_score || 0;
          const strategyScore = driverInsights.overall_assessment?.strategy_score || 0;
          const executionScore = driverInsights.overall_assessment?.execution_score || 0;

          return (
            <motion.div
              key={driverName}
              className="driver-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedDriver(driverName)}
            >
              <div className="driver-card-header">
                <div className="driver-name">{driverName}</div>
                <div className="driver-position">P{driverData?.final_position || '?'}</div>
              </div>

              <div className="score-bars">
                <div className="score-item">
                  <div className="score-label">Performance</div>
                  <div className="score-bar-container">
                    <div 
                      className="score-bar performance-bar"
                      style={{ width: `${overallScore * 100}%` }}
                    />
                    <span className="score-value">{Math.round(overallScore * 100)}%</span>
                  </div>
                </div>
                <div className="score-item">
                  <div className="score-label">Strategy</div>
                  <div className="score-bar-container">
                    <div 
                      className="score-bar strategy-bar"
                      style={{ width: `${strategyScore * 100}%` }}
                    />
                    <span className="score-value">{Math.round(strategyScore * 100)}%</span>
                  </div>
                </div>
                <div className="score-item">
                  <div className="score-label">Execution</div>
                  <div className="score-bar-container">
                    <div 
                      className="score-bar execution-bar"
                      style={{ width: `${executionScore * 100}%` }}
                    />
                    <span className="score-value">{Math.round(executionScore * 100)}%</span>
                  </div>
                </div>
              </div>

              <div className="key-insights">
                <div className="insight-tag">
                  <Zap className="insight-icon" />
                  <span>
                    {driverInsights.pit_strategy_analysis?.optimal_strategy || 'N/A'} Strategy
                  </span>
                </div>
                {driverInsights.overall_assessment?.key_strengths?.[0] && (
                  <div className="insight-tag positive">
                    <TrendingUp className="insight-icon" />
                    <span>{driverInsights.overall_assessment.key_strengths[0]}</span>
                  </div>
                )}
              </div>

              <div className="driver-card-footer">
                <span className="view-details">View Full Analysis</span>
                <ChevronRight className="chevron-icon" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

const formatTime = (seconds) => {
  if (!seconds && seconds !== 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default InsightsDashboard;

