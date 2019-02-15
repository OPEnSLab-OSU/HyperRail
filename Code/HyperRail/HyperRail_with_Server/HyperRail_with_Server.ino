#include <ArduinoJson.h>
#include <SPI.h>
#include <WiFi101.h>
#include "secrets.h" 

#define DELAY           5
#define MASTER_ADDRESS  "localhost"
#define MASTER_PORT     3000

struct Config {
  int length;
  int duration;
};

struct Data {
  int timestamp;
  String sensor;
  String value;
};

/* Context:
 *  Although the Arduino acts as the access point, this device is controlled by the user's computer, therefore
 *  Master server == NodeJS server running off of user's computer
 *  Slave server == This Arduino
 *  
 *  The main loop of the Slave server is:
 *  1. Wait for Master server to send request
 *  2. Execute request
 *  3. Send results of run back to Master server
 */


const char ssid[] = SECRET_SSID;        // your network SSID (name)
const char pass[] = SECRET_PASS;        // your network password (use for WPA, or use as key for WEP)
const bool SERIAL_DEBUG = true;         // Set to true if you want to debug with a serial connection

int status = WL_IDLE_STATUS;
WiFiServer server(80);

void setup() {
  // Initialize serial and wait for port to open:
  if(SERIAL_DEBUG) {
    Serial.begin(9600);
    while (!Serial) {
      ; // Wait for serial port to connect. Needed for native USB port only
    }
  }

  // Check for the presence of the shield:
  if (WiFi.status() == WL_NO_SHIELD) {
    Serial.println("WiFi shield not present");
    // don't continue:
    while (true);
  }

  // Create open network. Change this line if you want to create an WEP network:
  status = WiFi.beginAP(ssid);
  if (status != WL_AP_LISTENING) {
    Serial.println("Creating access point failed");
    // don't continue
    while (true);
  }  

  delay(DELAY * 1000);
  // start the web server on port 80
  server.begin();
  printWiFiStatus();
}

void loop() {
  // Wait for instructions from client
  Config config;
  while(true) {
    WiFiClient inClient = server.available();   // listen for incoming clients

    // Response from Master server
    if(inClient) {
      // Read in data from Master 
      String request = getRequest(inClient);

      // Process request
      config = parseRequest(request);
      break;
    } else {
      // Wait a second before checking requests again.
      delay(1000);
    }
  }
  
  // Execute command
  while(true) {
    break;
  }

  // Send data to server
  while(true) {
    WiFiClient outClient;
    if(outClient.connect(MASTER_ADDRESS, MASTER_PORT)) {
      // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
      // and a content-type so the client knows what's coming, then a blank line:
      Data *data = new Data;

      String response = createResponse(data);          
      sendResponse(outClient, response);
    }
  }
}

String getRequest(WiFiClient client) {
  String line = "";
  while(client.connected()) {
    if (client.available()) {             // if there's bytes to read from the client,
      char c = client.read();             // read a byte, then
      Serial.write(c);                    // print it out the serial monitor
      if (c == '\n') {                    // if the byte is a newline character

        // if the current line is blank, you got two newline characters in a row.
        // that's the end of the client HTTP request, so send a response:
        if (line.length() == 0) {
          // HTTP headers always start with a response code (e.g. HTTP/1.1 200 OK)
          // and a content-type so the client knows what's coming, then a blank line:

          String data = "HTTP/1.1 200 OK\n"
                        "Content-type:application/json\n"
                        "\n"
                        "{\"Status\": \"Recieved\"}\n"
                        "\n";
          
          client.println(data);
          // break out of the while loop:
          break;
        }
        else {      // if you got a newline, then clear currentLine:
          line = "";
        }
      }
      else if (c != '\r') {    // if you got anything else but a carriage return character,
        line += c;      // add it to the end of the currentLine
      }
    }
  }
  return line;
}

// Take JSON string and convert to config
Config parseRequest(String request) {
  const int cap = JSON_OBJECT_SIZE(10);
  StaticJsonBuffer<cap> buffer;
  Config config;

  JsonObject& obj = buffer.parseObject(request.c_str());
  if(obj.success()) {
    config.length = obj["length"];
  } else {
    Serial.println("ERROR: Cannot parse request");
  }
  return config;
}

String createResponse(Data *data) {
  String str = "HTTP/1.1 200 OK\n"
               "Content-type:application/json\n"
               "\n"
               "{}\n"
               "\n";
  return str;
}

bool sendResponse(WiFiClient client, String response) {
  return true;
}

// Pretty print Wifi info
void printWiFiStatus() {
  // print the SSID of the network you're attached to:
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address:
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);
}

