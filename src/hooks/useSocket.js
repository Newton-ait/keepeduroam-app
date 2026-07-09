import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useApp } from '../context/AppContext';
import { saveToken } from '../utils/storage';

const WORKER_URL = 'https://keepeduroam.aitdevlabs.workers.dev';

export function useSocket() {
  const { deviceId, mode, setIsConnected, updatePoints } = useApp();
  const socketRef = useRef(null);
  const modeRef = useRef(mode);
  const didConnectOnceRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const [lastRelayResult, setLastRelayResult] = useState(null);

  // Keep a ref in sync so the 'connect' handler (created once per
  // connection) always registers with whatever mode is current at the
  // moment it fires, without needing `mode` in its own closure.
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // Connection lifecycle: depends only on deviceId. Previously this also
  // depended on `mode`, which meant switching between the Store and Use
  // tabs tore down and fully recreated the socket connection on every
  // tab change — visible to users as the app "resetting." Mode changes
  // after the initial connection are now handled by the effect below,
  // which re-registers on the *existing* socket instead of reconnecting.
  useEffect(() => {
    if (!deviceId) return;

    const socket = io(WORKER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setIsReady(true);

      if (modeRef.current === 'store') {
        socket.emit('register_provider', { id: deviceId });
      } else {
        socket.emit('register_consumer', { id: deviceId });
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setIsReady(false);
    });

    socket.on('registered', (data) => {
      console.log('Registered:', data);
      if (data.token) {
        saveToken(data.token);
      }
      if (data.role === 'provider') {
        socket.emit('provider_ready', {});
      }
    });

    socket.on('update_providers', (data) => {
      console.log('Providers online:', Object.keys(data).length);
    });

    socket.on('update_consumers', (data) => {
      console.log('Consumers online:', Object.keys(data).length);
    });

    socket.on('error', (data) => {
      console.log('Socket error:', data);
    });

    // Provider side: forward the consumer's request to the local target
    // and relay the result back through the socket.
    socket.on('relay_request', async (data) => {
      console.log('Relay request received:', data);
      if (modeRef.current === 'store') {
        await forwardRequest(socket, data);
      }
    });

    // Consumer side: result of a relayed request comes back here.
    socket.on('relay_result', (data) => {
      console.log('Relay result received:', data);
      setLastRelayResult(data);
    });

    // Either side: points balance changed (e.g. after storing/using time).
    socket.on('points_updated', (data) => {
      console.log('Points updated:', data);
      updatePoints(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [deviceId]);

  // Mode changes after the initial connection: re-register on the same
  // socket rather than reconnecting. Skips the very first run, since the
  // initial registration is already handled by the 'connect' handler
  // above via modeRef.
  useEffect(() => {
    if (!didConnectOnceRef.current) {
      didConnectOnceRef.current = true;
      return;
    }
    if (!socketRef.current || !isReady || !deviceId) return;

    if (mode === 'store') {
      socketRef.current.emit('register_provider', { id: deviceId });
    } else {
      socketRef.current.emit('register_consumer', { id: deviceId });
    }
  }, [mode]);

  const forwardRequest = async (socket, data) => {
    try {
      const response = await fetch(`http://${data.target}:${data.port}`, {
        method: 'POST',
        body: data.payload,
      });
      const result = await response.text();
      socket.emit('relay_response', { id: data.id, result });
    } catch (error) {
      socket.emit('relay_response', { id: data.id, result: `Error: ${error.message}` });
    }
  };

  const sendRelayRequest = (target, port, payload) => {
    if (!socketRef.current) return false;
    socketRef.current.emit('consumer_request', {
      target,
      port,
      payload,
    });
    return true;
  };

  const sendRelayResponse = (requestId, result) => {
    if (!socketRef.current) return false;
    socketRef.current.emit('relay_response', {
      id: requestId,
      result,
    });
    return true;
  };

  const sendPing = () => {
    if (!socketRef.current) return;
    socketRef.current.emit('ping', {});
  };

  return {
    socket: socketRef.current,
    isReady,
    lastRelayResult,
    sendRelayRequest,
    sendRelayResponse,
    sendPing,
  };
}
