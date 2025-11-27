import { useState, useEffect } from 'react';
import { useWebSocket } from './useWebSocket';

/**
 * Custom hook for managing Toyota GR race data from WebSocket
 * @param {string} wsUrl - WebSocket server URL
 * @returns {Object} - Race state and functions
 */
export const useRaceData = (wsUrl) => {
  const { isConnected, data, error, sendMessage } = useWebSocket(wsUrl);
  
  const [trackData, setTrackData] = useState(null);
  const [raceState, setRaceState] = useState({
    time: 0,
    cars: [],
    weather: { rain: 0, track_temp: 25, wind: 0 },
    total_laps: 36, // Default to backend value (36 laps)
    tyre_distribution: {}
  });

  // Fetch track data via HTTP as fallback
  useEffect(() => {
    const fetchTrackData = async () => {
      try {
        const baseUrl = wsUrl.replace('/ws', '').replace('ws://', 'http://').replace('wss://', 'https://');
        const response = await fetch(`${baseUrl}/api/track`);
        if (response.ok) {
          const track = await response.json();
          setTrackData({
            points: track.points || [],
            total_length: track.total_length || 0
          });
        }
      } catch (err) {
        console.error('Failed to fetch track data:', err);
      }
    };

    if (!trackData) {
      fetchTrackData();
    }
  }, [trackData, wsUrl]);

  useEffect(() => {
    if (data) {
      console.log('📦 [useRaceData] Received data:', {
        type: data.type,
        hasTrack: !!data.data,
        hasTime: data.time !== undefined,
        hasCars: !!data.cars,
        carsCount: data.cars?.length || 0,
        race_started: data.race_started,
        race_finished: data.race_finished
      });
      
      if (data.type === 'track' && data.data) {
        console.log('🛤️ [useRaceData] Setting track data:', {
          points: data.data.points?.length || 0,
          total_length: data.data.total_length
        });
        setTrackData(data.data);
      } else if (data.time !== undefined) {
        // Regular race state update - ensure total_laps is preserved from backend
        console.log('🏁 [useRaceData] Race state update:', {
          time: data.time,
          cars: data.cars?.length || 0,
          race_started: data.race_started,
          race_finished: data.race_finished
        });
        
        setRaceState(prevState => ({
          ...prevState,
          ...data,
          // Always use backend's total_laps if provided, otherwise keep current value
          total_laps: data.total_laps !== undefined ? data.total_laps : prevState.total_laps
        }));
        
        // Debug logging for cars visibility
        if (data.cars && data.cars.length > 0) {
          const carsWithCoords = data.cars.filter(c => c.x !== undefined && c.y !== undefined);
          console.log(`✅ [useRaceData] Race state update: ${data.cars.length} total cars, ${carsWithCoords.length} with coordinates`);
          if (carsWithCoords.length === 0) {
            console.warn('⚠️ [useRaceData] No cars have x/y coordinates!', data.cars[0]);
          } else {
            console.log('📍 [useRaceData] Sample car position:', {
              name: data.cars[0].name,
              x: data.cars[0].x,
              y: data.cars[0].y,
              speed: data.cars[0].speed
            });
          }
        } else {
          console.warn('⚠️ [useRaceData] Race state update received but cars array is empty or missing');
        }
      }
    } else {
      console.log('❌ [useRaceData] Received null/undefined data');
    }
  }, [data]);

  const resetRace = () => {
    sendMessage({ type: 'reset' });
    // Immediately update local state to prevent UI flicker
    setRaceState(prevState => ({
      ...prevState,
      race_finished: false,
      race_started: false,
      time: 0
    }));
  };

  return {
    isConnected,
    error,
    trackData,
    raceState,
    resetRace,
  };
};
