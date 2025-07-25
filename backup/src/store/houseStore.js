import { create } from 'zustand';
import mqtt from 'mqtt';
import useSettingsStore from './settingsStore';
import useHistoryStore from './historyStore';

const useHouseStore = create((set, get) => ({
  houses: (() => {
    try {
      const savedHouses = localStorage.getItem('houses');
      const parsedHouses = savedHouses ? JSON.parse(savedHouses) : [];
      return parsedHouses.map((house) => ({
        id: house.id || `rmh${Math.floor(Math.random() * 10000).toString().padStart(2, '0')}`,
        name: house.name || 'Rumah Tanpa Nama',
        compostStatus: house.compostStatus || 'Normal',
        trashStatus: house.trashStatus || 'Normal',
        compostData: house.compostData || { suhu: 0, volume: 0 },
        trashData: house.trashData || { volume: 0 },
      }));
    } catch (error) {
      console.error('Gagal parsing houses dari localStorage:', error);
      return [];
    }
  })(),
  client: null,
  connectionStatus: 'disconnected',
  connectionError: '',
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  broker: localStorage.getItem('mqttBroker') || 'broker.emqx.io',
  port: parseInt(localStorage.getItem('mqttPort')) || 1883,
  topic: 'iot/monitoring',
  addHouse: (name) => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return { error: 'Nama rumah tidak boleh kosong' };
    }
    if (trimmedName.length > 50) {
      return { error: 'Nama rumah maksimal 50 karakter' };
    }
    const houses = get().houses;
    if (houses.some((house) => house.name.toLowerCase() === trimmedName.toLowerCase())) {
      return { error: 'Nama rumah sudah digunakan' };
    }
    return set((state) => {
      const newHouse = {
        id: `rmh${(state.houses.length + 1).toString().padStart(2, '0')}`,
        name: trimmedName,
        compostStatus: 'Normal',
        trashStatus: 'Normal',
        compostData: { suhu: 0, volume: 0 },
        trashData: { volume: 0 },
      };
      const newHouses = [...state.houses, newHouse];
      localStorage.setItem('houses', JSON.stringify(newHouses));
      return { houses: newHouses };
    });
  },
  editHouse: (id, name) => {
    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      return { error: 'Nama rumah tidak boleh kosong' };
    }
    if (trimmedName.length > 50) {
      return { error: 'Nama rumah maksimal 50 karakter' };
    }
    const houses = get().houses;
    if (houses.some((house) => house.name.toLowerCase() === trimmedName.toLowerCase() && house.id !== id)) {
      return { error: 'Nama rumah sudah digunakan' };
    }
    return set((state) => {
      const newHouses = state.houses.map((house) =>
        house.id === id
          ? {
              ...house,
              name: trimmedName,
              compostData: house.compostData || { suhu: 0, volume: 0 },
              trashData: house.trashData || { volume: 0 },
            }
          : house
      );
      localStorage.setItem('houses', JSON.stringify(newHouses));
      return { houses: newHouses };
    });
  },
  deleteHouse: (id) =>
    set((state) => {
      const newHouses = state.houses.filter((house) => house.id !== id);
      localStorage.setItem('houses', JSON.stringify(newHouses));
      return { houses: newHouses };
    }),
  setBrokerSettings: (broker, port) => {
    set({ broker, port, connectionError: '' });
    console.log('Broker settings updated:', { broker, port });
  },
  connectMqtt: () => {
    const { broker, port, client } = get();
    if (client && client.connected) {
      console.log('Already connected, skipping connect attempt');
      return;
    }

    set({ connectionStatus: 'connecting', connectionError: '' });
    const clientId = `react_kompos_sampah_${Date.now()}`;
    console.log(`Connecting to wss://${broker}:${port}/mqtt with clientId: ${clientId}`);
    
    const mqttClient = mqtt.connect(`wss://${broker}:${port}/mqtt`, {
      clientId,
      connectTimeout: 10000,
      keepalive: 20,
      reconnectPeriod: 0,
    });

    mqttClient.on('connect', () => {
      console.log('Successfully connected to MQTT broker');
      set({ connectionStatus: 'connected', reconnectAttempts: 0, connectionError: '' });
      mqttClient.subscribe('iot/monitoring', { qos: 0 }, (err) => {
        if (err) {
          console.error('Failed to subscribe to topic:', err);
          set({ connectionError: `Gagal subscribe ke topik: ${err.message}` });
          return;
        }
        console.log('Subscribed to iot/monitoring');
      });
    });

    mqttClient.on('message', (receivedTopic, message) => {
      if (receivedTopic !== 'iot/monitoring') return;
      console.log('Received message on topic:', receivedTopic, message.toString());
      try {
        const data = JSON.parse(message.toString());
        const houseName = data.houseName;

        if (!houseName) {
          console.error('Data tidak valid: houseName tidak ditemukan', data);
          if (Notification.permission === 'granted') {
            new Notification('Data MQTT Tidak Valid', { body: 'houseName tidak ditemukan.' });
          }
          return;
        }

        const house = get().houses.find((house) => house.name.toLowerCase() === houseName.toLowerCase());
        if (!house) {
          console.error(`Rumah dengan nama ${houseName} tidak ditemukan`);
          if (Notification.permission === 'granted') {
            new Notification('Rumah Tidak Ditemukan', { body: `Rumah ${houseName} tidak ada.` });
          }
          return;
        }

        if (
          !data.kompos ||
          !data.kompos.hasOwnProperty('suhu') ||
          !data.kompos.hasOwnProperty('volume') ||
          isNaN(data.kompos.suhu) ||
          isNaN(data.kompos.volume) ||
          data.kompos.suhu < 0 ||
          data.kompos.suhu > 100 ||
          data.kompos.volume < 0 ||
          data.kompos.volume > 100
        ) {
          console.error(
            `Data kompos tidak valid untuk ${houseName}:`,
            data.kompos,
            'Suhu dan volume harus angka antara 0-100'
          );
          if (Notification.permission === 'granted') {
            new Notification('Data Kompos Tidak Valid', { body: `Suhu/volume untuk ${houseName} tidak valid.` });
          }
          return;
        }
        if (
          !data.sampah ||
          !data.sampah.hasOwnProperty('volume') ||
          isNaN(data.sampah.volume) ||
          data.sampah.volume < 0 ||
          data.sampah.volume > 100
        ) {
          console.error(`Data sampah tidak valid untuk ${houseName}:`, data.sampah, 'Volume harus angka antara 0-100');
          if (Notification.permission === 'granted') {
            new Notification('Data Sampah Tidak Valid', { body: `Volume sampah untuk ${houseName} tidak valid.` });
          }
          return;
        }

        const { thresholds } = useSettingsStore.getState();

        const compostStatus =
          data.kompos.suhu > thresholds.compostTemp || data.kompos.volume > thresholds.compostVolume
            ? 'Penuh'
            : data.kompos.volume > thresholds.compostVolume * 0.8
            ? 'Perlu Diperiksa'
            : 'Normal';
        const trashStatus =
          data.sampah.volume > thresholds.trashVolume
            ? 'Penuh'
            : data.sampah.volume > thresholds.trashVolume * 0.8
            ? 'Perlu Diperiksa'
            : 'Normal';

        useHistoryStore.getState().addHistoryEntry({
          houseId: house.id,
          houseName: house.name,
          type: 'Kompos',
          suhu: data.kompos.suhu,
          volume: data.kompos.volume,
          status: compostStatus,
        });

        useHistoryStore.getState().addHistoryEntry({
          houseId: house.id,
          houseName: house.name,
          type: 'Sampah',
          suhu: undefined,
          volume: data.sampah.volume,
          status: trashStatus,
        });

        set((state) => {
          const newHouses = state.houses.map((h) =>
            h.name.toLowerCase() === houseName.toLowerCase()
              ? {
                  ...h,
                  compostData: { suhu: data.kompos.suhu, volume: data.kompos.volume },
                  trashData: { volume: data.sampah.volume },
                  compostStatus,
                  trashStatus,
                }
              : h
          );
          localStorage.setItem('houses', JSON.stringify(newHouses));
          return { houses: newHouses };
        });
      } catch (error) {
        console.error('Gagal memproses pesan MQTT:', error);
        if (Notification.permission === 'granted') {
          new Notification('Error Memproses Data MQTT', { body: error.message });
        }
      }
    });

    mqttClient.on('error', (err) => {
      console.error('MQTT Connection Error:', {
        message: err.message,
        stack: err.stack,
        code: err.code || 'N/A',
      });
      let errorMessage = `Gagal terhubung: ${err.message}`;
      if (err.message.includes('WebSocket')) {
        errorMessage = 'Koneksi WebSocket gagal. Periksa jaringan atau pengaturan broker.';
      }
      set({ connectionStatus: 'disconnected', connectionError: errorMessage });
      mqttClient.end();
      get().onDisconnected();
    });

    mqttClient.on('close', () => {
      if (get().connectionStatus === 'connected') return;
      console.warn('Disconnected from MQTT broker');
      set({ connectionStatus: 'disconnected', connectionError: 'Koneksi terputus. Mencoba reconnect...' });
      get().onDisconnected();
    });

    set({ client: mqttClient });
  },
  disconnectMqtt: () => {
    const client = get().client;
    if (client && client.connected) {
      client.end();
      console.log('Disconnected from MQTT broker');
    } else {
      console.log('No active connection to disconnect');
    }
    set({ client: null, connectionStatus: 'disconnected', connectionError: '' });
  },
  onDisconnected: () => {
    const { client, reconnectAttempts, maxReconnectAttempts, connectMqtt, broker, port } = get();
    if (client?.connected) return;
    if (reconnectAttempts < maxReconnectAttempts) {
      const delaySeconds = Math.min(Math.pow(2, reconnectAttempts), 32);
      console.log(`Scheduling reconnect attempt ${reconnectAttempts + 1} in ${delaySeconds} seconds`);
      setTimeout(() => {
        if (get().connectionStatus !== 'connected' && get().connectionStatus !== 'connecting') {
          console.log(`Attempting to reconnect... (Attempt ${reconnectAttempts + 1})`);
          set((state) => ({ reconnectAttempts: state.reconnectAttempts + 1 }));
          connectMqtt();
        }
      }, delaySeconds * 1000);
    } else {
      console.error('Max reconnect attempts reached. Please reconnect manually.');
      set({ connectionError: 'Maksimum percobaan reconnect tercapai. Silakan hubungkan kembali secara manual.' });
    }
  },
  initMqttConnection: () => {
    console.log('Initializing MQTT connection');
    get().connectMqtt();
  },
}));

// Mulai koneksi MQTT saat store dibuat
useHouseStore.getState().initMqttConnection();

export default useHouseStore;