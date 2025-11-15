import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Gauge as GaugeIcon, Zap } from 'lucide-react';
import './TelemetryPanel.css';

const TelemetryPanel = ({ selectedCar, cars = [] }) => {
  const [telemetryData, setTelemetryData] = useState([]);
  const maxDataPoints = 50;
  const timeRef = useRef(0);

  useEffect(() => {
    if (!selectedCar) return;
    
    const car = cars.find(c => c.name === selectedCar);
    if (!car) return;

    const newPoint = {
      time: timeRef.current++,
      speed: car.speed || 0,
      throttle: (car.throttle || 0) * 100,
      brake: (car.brake || 0) * 100,
      wear: (car.wear || 0) * 100
    };

    setTelemetryData(prev => {
      const updated = [...prev, newPoint];
      return updated.slice(-maxDataPoints);
    });
  }, [selectedCar, cars]);

  if (!selectedCar) {
    return (
      <div className="telemetry-panel">
        <div className="telemetry-placeholder">
          <p>Select a car to view telemetry</p>
        </div>
      </div>
    );
  }

  const car = cars.find(c => c.name === selectedCar);
  if (!car) return null;

  const wearPercentage = (car.wear || 0) * 100;
  const speedPercentage = ((car.speed || 0) / 350) * 100;

  return (
    <motion.div
      className="telemetry-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="telemetry-header">
        <h3>{car.name} - Telemetry</h3>
        <div className="car-indicator" style={{ backgroundColor: car.color }}></div>
      </div>

      <div className="telemetry-content">
        {/* Gauges */}
        <div className="gauges-row">
          <div className="gauge-container">
            <div className="gauge-label">Tyre Wear</div>
            <div className="gauge-wrapper">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={[{ value: wearPercentage }]}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={wearPercentage > 70 ? '#ff4444' : wearPercentage > 40 ? '#ffaa00' : '#44ff44'} 
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="gauge-value">{Math.round(wearPercentage)}</div>
              <div className="gauge-unit">%</div>
            </div>
          </div>

          <div className="gauge-container">
            <div className="gauge-label">Speed</div>
            <div className="gauge-wrapper">
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={[{ value: speedPercentage }]}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4a90e2" 
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="gauge-value">{Math.round(car.speed || 0)}</div>
              <div className="gauge-unit">km/h</div>
            </div>
          </div>

          <div className="gauge-container">
            <div className="gauge-label">Gear</div>
            <div className="gear-display">
              <div className={`gear-number gear-${car.gear || 1}`}>
                {car.gear || 1}
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-row">
          <div className="chart-container">
            <div className="chart-title">Speed vs Time</div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={telemetryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #4a6fa5' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="speed" 
                  stroke="#4a90e2" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-container">
            <div className="chart-title">Tyre Wear vs Time</div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={telemetryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a3f5f" />
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1f3a', border: '1px solid #4a6fa5' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="wear" 
                  stroke="#ff4444" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status indicators */}
        <div className="status-row">
          <div className="status-item">
            <span className="status-label">DRS:</span>
            <span className={`status-value ${car.drs_active ? 'active' : 'inactive'}`}>
              {car.drs_active ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Controller:</span>
            <span className="status-value">{car.controller_type || 'N/A'}</span>
          </div>
          <div className="status-item">
            <span className="status-label">Overtaking:</span>
            <span className={`status-value ${car.overtaking ? 'active' : 'inactive'}`}>
              {car.overtaking ? 'YES' : 'NO'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TelemetryPanel;

