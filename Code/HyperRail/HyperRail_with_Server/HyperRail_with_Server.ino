#include <ArduinoJson.h>
#include <SPI.h>
#include <WiFi101.h>
//#include "arduino_secrets.h" 

#define SECRET_SSID "HyperRail AP"
#define SECRET_PASS "password"
#define DELAY       5

struct Config {
  int length;
  int duration;
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

char ssid[] = SECRET_SSID;        // your network SSID (name)
char pass[] = SECRET_PASS;    // your network password (use for WPA, or use as key for WEP)
int keyIndex = 0;                // your network key Index number (needed only for WEP)

int status = WL_IDLE_STATUS;
WiFiServer server(80);

void setup() {
  // Initialize serial and wait for port to open:
  Serial.begin(9600);
  while (!Serial) {
    ; // Wait for serial port to connect. Needed for native USB port only
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
  Config *config;
  while(true) {
    WiFiClient client = server.available();   // listen for incoming clients

    // Response from Master server
    if(client) {
      // Read in data from Master 
      String request = getRequest(client);

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
          client.println("HTTP/1.1 200 OK");
          client.println("Content-type:application/json");
          client.println();

          // the content of the HTTP response follows the header:
          client.print("{\"Status\": \"Recieved\"}");

          // The HTTP response ends with another blank line:
          client.println();
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
Config *parseRequest(String request) {
  Config* config = new Config;
  config->length = 4;
  return config;
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
