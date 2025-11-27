import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for WebSocket connection with auto-reconnect
 * @param {string} url - WebSocket URL
 * @returns {Object} - Connection state, data, and control functions
 */
export const useWebSocket = (url) => {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    console.log('🔌 [WebSocket] Attempting to connect to:', url);
    try {
      const ws = new WebSocket(url);
      console.log('🔌 [WebSocket] WebSocket object created, waiting for connection...');

      ws.onopen = () => {
        console.log('✅ [WebSocket] Connection established successfully!');
        console.log('✅ [WebSocket] Ready state:', ws.readyState);
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);
          // Debug: Log WebSocket messages to help diagnose car visibility issues
          if (parsedData.cars !== undefined) {
            console.log(`📡 [WebSocket] Received race state:`, {
              cars: parsedData.cars?.length || 0,
              time: parsedData.time,
              race_started: parsedData.race_started,
              race_finished: parsedData.race_finished,
              hasCarsWithCoords: parsedData.cars?.filter(c => c.x !== undefined && c.y !== undefined).length || 0
            });
          } else if (parsedData.type === 'track') {
            console.log('🛤️ [WebSocket] Received track data:', {
              points: parsedData.data?.points?.length || 0,
              total_length: parsedData.data?.total_length
            });
          } else {
            console.log('📡 [WebSocket] Received unknown message type:', parsedData);
          }
          setData(parsedData);
        } catch (err) {
          console.error('❌ [WebSocket] Failed to parse message:', err, event.data);
        }
      };

      ws.onerror = (event) => {
        console.error('❌ [WebSocket] Error occurred:', {
          event,
          readyState: ws.readyState,
          url
        });
        setError('Connection error occurred');
      };

      ws.onclose = (event) => {
        console.log('🔌 [WebSocket] Connection closed:', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean
        });
        setIsConnected(false);
        
        // Auto-reconnect with exponential backoff
        if (reconnectAttemptsRef.current < 10) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          console.log(`🔄 [WebSocket] Reconnecting in ${delay}ms... (attempt ${reconnectAttemptsRef.current + 1}/10)`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current += 1;
            connect();
          }, delay);
        } else {
          console.error('❌ [WebSocket] Max reconnection attempts reached');
          setError('Max reconnection attempts reached');
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('❌ [WebSocket] Failed to create WebSocket:', err);
      setError(err.message);
    }
  }, [url]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    }
    console.warn('WebSocket is not connected');
    return false;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    data,
    error,
    sendMessage,
    reconnect: connect,
  };
};
