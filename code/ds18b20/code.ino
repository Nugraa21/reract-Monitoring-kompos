#include <WiFi.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// --- Konfigurasi WiFi ---
#define WIFI_SSID "nugra"
#define WIFI_PASSWORD "081328400060"

// --- Konfigurasi MQTT ---
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_topic = "kompos/monitoring";

WiFiClient espClient;
PubSubClient client(espClient);

// --- Sensor Suhu DS18B20 ---
#define ONE_WIRE_BUS 12
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// --- 2 Sensor HC-SR04 ---
#define TRIG1_PIN 22
#define ECHO1_PIN 23
#define TRIG2_PIN 18
#define ECHO2_PIN 19

// --- Fungsi koneksi MQTT ---
void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Mencoba terhubung ke MQTT Broker...");
    String clientId = "ESP32Client-";
    clientId += String(random(0xffff), HEX);

    if (client.connect(clientId.c_str())) {
      Serial.println("terhubung!");
    } else {
      Serial.print("gagal, rc=");
      Serial.print(client.state());
      Serial.println(" coba lagi dalam 5 detik");
      delay(5000);
    }
  }
}

// --- Setup awal ---
void setup() {
  Serial.begin(115200);
  sensors.begin();

  pinMode(TRIG1_PIN, OUTPUT);
  pinMode(ECHO1_PIN, INPUT);
  pinMode(TRIG2_PIN, OUTPUT);
  pinMode(ECHO2_PIN, INPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Menghubungkan WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Terhubung!");
  Serial.print("Alamat IP: ");
  Serial.println(WiFi.localIP());

  client.setServer(mqtt_server, mqtt_port);
}

// --- Fungsi pembaca jarak ---
float bacaJarak(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long durasi = pulseIn(echoPin, HIGH, 30000); // timeout 30ms
  float jarak = durasi * 0.034 / 2;
  return jarak;
}

// --- Loop utama ---
void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();

  sensors.requestTemperatures();
  float suhu = sensors.getTempCByIndex(0);
  float jarak1 = bacaJarak(TRIG1_PIN, ECHO1_PIN);
  float jarak2 = bacaJarak(TRIG2_PIN, ECHO2_PIN);

  char suhuStr[8];
  char jarak1Str[8];
  char jarak2Str[8];

  // Jika suhu tidak terbaca, kirim "error"
  if (suhu == DEVICE_DISCONNECTED_C) {
    strcpy(suhuStr, "error");
  } else {
    dtostrf(suhu, 1, 2, suhuStr);
  }

  dtostrf(jarak1, 1, 2, jarak1Str);
  dtostrf(jarak2, 1, 2, jarak2Str);

  // Gabungkan ke format JSON
  char jsonPayload[128];
  snprintf(jsonPayload, sizeof(jsonPayload),
           "{\"suhu\":\"%s\",\"jarak1\":\"%s\",\"jarak2\":\"%s\"}",
           suhuStr, jarak1Str, jarak2Str);

  Serial.println(jsonPayload); // Untuk debug

  // Kirim ke topik utama MQTT
  client.publish(mqtt_topic, jsonPayload);

  delay(5000); // Kirim data tiap 5 detik
}