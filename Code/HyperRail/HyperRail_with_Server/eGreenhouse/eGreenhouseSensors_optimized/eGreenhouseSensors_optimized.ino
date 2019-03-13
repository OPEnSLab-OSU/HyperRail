// eGreenhouse Feather Proto M0 + Adalogger + nRF

//////// Adalogger SD /////////
/* analog sensors on analog ins 0, 1, and 2
  SD card attached to SPI bus as follows:
  MOSI - pin 11
  MISO - pin 12
  CLK - pin 13
  CS - pin 4 (for MKRZero SD: SDCARD_SS_PIN)
*/


#include <Arduino.h>
#include "wiring_private.h"
#include <Wire.h>
#include "Adafruit_SHT31.h" //for the SHT31-D sensors (temperature and hummidity)
#include <Adafruit_Sensor.h> // for the TSL2561 sensor (luminosity sensor)
#include <SPI.h>
#include <SD.h> // for datalogging
#include <Adafruit_TSL2561_U.h> // for the TSL2561 sensor (luminosity sensor)
#include <SDS011-select-serial.h> // for SDS-011 dust sensor
// for MO, create new UART SERCOM on Serial2

#include "wiring_private.h" // pinPeripheral() function
#include <RF24Network.h> // for nRF
#include <RF24.h>
#include <OSCBundle.h>
#include "RTClib.h" // for the RTC

RTC_DS3231 rtc;
#define STR_HELPER(x) #x
#define STR(x) STR_HELPER(x) //to concatenate a predefined number to a string literal, use STR(x)
#define FAMILY "/LOOM"
#define DEVICE "/Ishield"
#define INSTANCE_NUM 0  // Unique instance number for this device, useful when using more than one of the same device type in same space
#define IDString FAMILY DEVICE STR(INSTANCE_NUM) // C interprets subsequent string literals as concatenation: "/Loom" "/Ishield" "0" becomes "/Loom/Ishield0"

#define LOOM_DEBUG 1
#define LOOM_DEBUG_Print(X)          (LOOM_DEBUG==0) ? :  Serial.print(X)
#define LOOM_DEBUG_Println(X)        (LOOM_DEBUG==0) ? :  Serial.println(X)
#define LOOM_DEBUG_Print2(X,Y)       LOOM_DEBUG_Print(X); LOOM_DEBUG_Print(Y)
#define LOOM_DEBUG_Println2(X,Y)     LOOM_DEBUG_Print(X); LOOM_DEBUG_Println(Y)
#define LOOM_DEBUG_Print3(X,Y,Z)     LOOM_DEBUG_Print(X); LOOM_DEBUG_Print(Y); LOOM_DEBUG_Print(Z)
#define LOOM_DEBUG_Println3(X,Y,Z)   LOOM_DEBUG_Print(X); LOOM_DEBUG_Print(Y); LOOM_DEBUG_Println(Z)
#define LOOM_DEBUG_Print4(W,X,Y,Z)   LOOM_DEBUG_Print(W); LOOM_DEBUG_Print(X); LOOM_DEBUG_Print(Y); LOOM_DEBUG_Print(Z)
#define LOOM_DEBUG_Println4(W,X,Y,Z) LOOM_DEBUG_Print(W); LOOM_DEBUG_Print(X); LOOM_DEBUG_Print(Y); LOOM_DEBUG_Println(Z)

// Node addresses should be 00-05
#define NRF_SELF_ADDRESS  00  // Self
#define NRF_OTHER_ADDRESS 01  // Default node to communicate with 
#define NRF_OTHER_OTHER_ADDRESS 02
#define nrf_subnet_scope      4 // 1 for subnet, 2 for global/family, 3 for global only (not recommended), 4 for any message. (use 2 if unsure)


#define nrf_data_rate -1 // 1: 250kbs, 2: 1Mbps, 3: 2Mbps
// -1: use default (1Mbps)
// setting RF24_250KBPS will fail for non-plus units (not sure what this means)

#define nrf_power_level 4  // 1: RF24_PA_MIN (-18dBm), 2: RF24_PA_LOW (-12dBm), 3: RF24_PA_HIGH (-6dBM), 4: RF24_PA_MAX (0dBm)
// -1 to use default (-18dBm)

// Both of the next two options have to be set for them to take effect
#define nrf_retry_delay -1  // How long to wait between each retry, in multiples of 250us, max is 15. 0 means 250us, 15 means 4000us.
// -1 to use default (5) 
#define nrf_retry_count -1  // How many retries before giving up, max 15
// -1 to use default (15)

#include "loom_translator.h"
#include "loom_nrf.h"
//// define nRF communication ////
//RF24 radio(5,6);                    // nRF24L01(+) radio attached using Getting Started board
//RF24Network network(radio);          // Network uses that radio
const uint16_t sensors_node = 01;        // Address of our node in Octal format
const uint16_t hyperRail_node = 00;       // Address of the other node in Octal format
const unsigned long interval = 5000; //ms  // How often to send 'hello world to the other unit
unsigned long last_sent;             // When did we last send?
unsigned long packets_sent;          // How many have we sent already
char message[300]; 

#define VBATPIN A7

// Create Serial SERCOM for CO2 sensor: RX pin 12, TX pin 11
Uart Serial2 (&sercom1, 12, 11, SERCOM_RX_PAD_3, UART_TX_PAD_0);
void SERCOM1_Handler()
{
  Serial2.IrqHandler();
}

byte readCO2[] = {0xFE, 0X44, 0X00, 0X08, 0X02, 0X9F, 0X25};  //Command packet to read Co2 (see app note)
byte response[] = {0,0,0,0,0,0,0};  //create an array to store the response
//multiplier for value. default is 1. set to 3 for K-30 3% and 10 for K-33 ICB
int valMultiplier = 1;

const int chipSelect = 4;  // chip select for adalogger

// define temp/RH //
Adafruit_SHT31 sht31 = Adafruit_SHT31();

// define sensor variables //
unsigned long valCO2 ;
sensors_event_t event;
float t = 0;  // temp
float h = 0;  // humidity
float dust = 0;
float p10,p25;  //particles less than 10 micrometers, 2.5 micrometers (PM10 and PM2.5 air quality standard)
int error;
float meters = 0;
unsigned long time;

SDS011 my_sds(Serial1); // initialize serial to talk to dust sensor

///// configurion section for the the luminosity sensor//////
Adafruit_TSL2561_Unified tsl = Adafruit_TSL2561_Unified(TSL2561_ADDR_FLOAT, 12345);
void configureSensor(void)
{
  /* You can manually set the gain or enable auto-gain support */
  //tsl.setGain(TSL2561_GAIN_1X);      /* No gain ... use in bright light to avoid sensor saturation */
  //tsl.setGain(TSL2561_GAIN_16X);     /* 16x gain ... use in low light to boost sensitivity */
  tsl.enableAutoRange(true);            /* Auto-gain ... switches automatically between 1x and 16x */
  /* Changing the integration time gives you better sensor resolution (402ms = 16-bit data) */
  tsl.setIntegrationTime(TSL2561_INTEGRATIONTIME_13MS);      /* fast but low resolution */
  //tsl.setIntegrationTime(TSL2561_INTEGRATIONTIME_101MS);  /* medium resolution and speed   */
  //  tsl.setIntegrationTime(TSL2561_INTEGRATIONTIME_402MS);  /* 16-bit data but slowest conversions */
  /* Update these values depending on what you've set above! */
  //Serial.print  (F("Gain:         ")); Serial.println(F("Auto"));
  //Serial.print  (F("Timing:       ")); Serial.println(F("13 ms"));
}

void setup() {

  // Open serial communications and wait for port to open:
  Serial.begin(9600);     //Opens the main serial port to communicate with the computer
  Serial1.begin(9600);    // Opens serial port for SDS-011
  Serial2.begin(9600);    //Opens serial port for the K-30 CO2
  // Assign pins 10 & 11 SERCOM functionality
  pinPeripheral(11, PIO_SERCOM);
  pinPeripheral(12, PIO_SERCOM);

  //while (!Serial) {
    //; // wait for serial port to connect. Needed for native USB port only
  //}

if (! rtc.begin()) {
    Serial.println("Couldn't find RTC");
    //while (1);  //uncomment this line if you only want to proceed when there's a functioning RTC
}
//if (rtc.lostPower())   // resets time if RTC loses power
    //Serial.println("RTC lost power, lets set the time!");
    // following line sets the RTC to the date & time this sketch was compiled
    rtc.adjust(DateTime(F(__DATE__), F(__TIME__)));


  Serial.print("Initializing SD card...");
  // see if the card is present and can be initialized:
  if (!SD.begin(chipSelect)) {
    Serial.println("Card failed, or not present");
    // don't do anything more:
    //while (1);  // uncomment this line if you want the code to stop when the SD can't be initialized

  }
  Serial.println("card initialized.");

  Serial.println(F("Initializing SHT31"));
  if (! sht31.begin(0x44)) {   // Set to 0x45 for alternate i2c addr
    Serial.println(F("Couldn't find SHT31"));
  //while (1) delay(1);  // uncomment if you only whish to proceed when there's a functioning temp/RH sensor
  }

  Serial.println("...SHT31 initialized");

  SPI.begin();
  radio.begin();  // start up nRF
  radio.setPALevel( RF24_PA_MAX );
  radio.setChannel(77);
  //radio.setCRCLength(RF24_CRC_16);
  //radio.setDataRate(RF24_1MBPS);
  network.begin(sensors_node);  // be careful which node each nRF chip is defined as
}

// ===================================================================
// ===               Receive nRF from HyperRail Hub                ===
// ===================================================================

void loop() {
  OSCBundle bndl;
//// nRF receive from HUB ////

  network.update();
  while(network.available() == 0 ){
    network.update();// update the netowrk until we have something
    Serial.println("Waiting to receive something from hub.");
    delay(1000);
  }
  nrf_receive_bundle(&bndl);
//  while ( network.available() ) {     // Is there anything ready for us?
//
//    RF24NetworkHeader header;        // If so, grab it and print it out
//    memset(message, '\0', 300);
//    network.read(header,&message,299);
//
//    OSCBundle bndl;
//    convert_OSC_string_to_bundle(message, &bndl);

//// decode message to find out which sensors to activate as indicated by the hub ////
// message indices: CO2 = 0, Lux = 1, Temp = 2, RH = 3, Dust = 4

  OSCMessage *msg = bndl.getOSCMessage(0);  // the zero index means it's the first message in the bundle
  bool co2_use = msg->getInt(0);  // if the first index of the messsage is a 1, take a CO2 reading
//Serial.println(millis());
  if(co2_use == true) {
    sendRequest(readCO2);  // get CO2

    valCO2 = getValue(response);

  } else {
    valCO2 = 0;  // if you receive a zero, simply send back a zero
  }

  bool lux_use = msg->getInt(1);
//Serial.println(millis());
  if(lux_use == true) {
    tsl.getEvent(&event); // get lux
  } else {
    event.light = 0;
  }

  bool temp_use = msg->getInt(2);
//Serial.println(millis());
  if(temp_use == true) {
    t = sht31.readTemperature(); //get temperature
  }else{
    t = 0;
  }

  bool RH_use = msg->getInt(3);
//Serial.println(millis());
  if(RH_use == true) {
    h = sht31.readHumidity(); //get humidity
  }else{
    h = 0;
  }

  bool dust_use = msg->getInt(4);
  //Serial.println(dust_use);
  //Serial.println(millis());
  if(dust_use == true) {
    error = my_sds.read(&p25,&p10);
    dust = p10;
  } else {
    dust = 0;
  }

// the HyperRail hub will send a position value indicating where the sensors are one the rail
  meters = msg->getFloat(5);
  LOOM_DEBUG_Println2("Sensor Meters: ", meters);
  //}
//float testKVP = 2.23;

  float measuredvbat = analogRead(VBATPIN);   //Measure the battery voltage at pin A7
  measuredvbat *= 2;    // we divided by 2, so multiply back
  measuredvbat *= 3.3;  // Multiply by 3.3V, our reference voltage
  measuredvbat /= 1024; // convert to voltage

  float vbat = measuredvbat;

  //delay(2000); // for testing fail states
  OSCBundle bndl_send;  // create an OSC bundle filled with sensor data to send back to the hub
//  bndl_send.add("randomaddress").add("CO2").add((int) valCO2).add("Lux").add((int)(event.light)).add("Temp").add((int)t).add("Humidity").add((int)h).add("Location").add(String(meters).c_str()).add("Vbat").add(String(vbat).c_str());//.add("Test").add((int)testKVP);//.add("Particle").add((int)dust)//.add("Test").add((int)testKVP);//.add((int)dust).add("Test").add(1);//.add("Location").add(location);

//  bndl_send.add("addr").add("C").add((int) valCO2).add("L").add((int)(event.light)).add("T").add((int)t).add("H").add((int)h).add("Lo").add(String(meters).c_str()).add("Vbat").add(String(vbat).c_str());//.add("Test").add((int)testKVP);//.add("Particle").add((int)dust)//.add("Test").add((int)testKVP);//.add((int)dust).add("Test").add(1);//.add("Location").add(location);
  bndl_send.add("a")
    .add("C").add((int) valCO2)
    .add("L").add((int)(event.light))
    .add("T").add((int)t)
    .add("H").add((int)h)
    .add("Lo").add(meters)
    .add("Vbat").add(vbat);//.add("Test").add((int)testKVP);//.add("Particle").add((int)dust)//.add("Test").add((int)testKVP);//.add((int)dust).add("Test").add(1);//.add("Location").add(location);

//    append_to_bundle_key_value(&bndl_send, "test", "test");
//
//  append_to_bundle_key_value(&bndl_send, "C", valCO2);
//  append_to_bundle_key_value(&bndl_send, "L", event.light);
//  append_to_bundle_key_value(&bndl_send, "T", t);
//  append_to_bundle_key_value(&bndl_send, "H", h);
//  append_to_bundle_key_value(&bndl_send, "Lo", meters);
//  append_to_bundle_key_value(&bndl_send, "V", vbat);

  print_bundle(&bndl_send);

//  Serial.println(meters);
  bool is_sent = (bool)nrf_send_bundle(&bndl_send,hyperRail_node);
  unsigned long start_listening = millis();
  
  network.update();
  while(  (!is_sent) && millis()-start_listening <1000  ) {
    (bool)nrf_send_bundle(&bndl_send,hyperRail_node);
    //LOOM_DEBUG_Println2("time waiting: ", millis()-start_listening);
    Serial.println("Attempting to reach the hyperRail hub");
    delay(1000);
  }
  
  if(is_sent){
    Serial.println("Sensor data sent to hub!");
  }
  
// ===================================================================
// ===            Save to microSD and Print to Serial              ===
// ===================================================================
  DateTime now = rtc.now(); // get dateTime for saving to microSD

  // open the SD file. note that only one file can be open at a time, so you have to close this one before opening another.
  File dataFile = SD.open("datalog.txt", FILE_WRITE);
  // if the file is available, write to it:
  if (dataFile) {
    dataFile.print(now.day(), DEC);  //save sensor values as comma separated file for easy spreadsheet use
    dataFile.print(',');
    dataFile.print(now.month(), DEC);
    dataFile.print(',');
    dataFile.print(now.year(), DEC);
    dataFile.print(',');
    dataFile.print(now.hour(), DEC);
    dataFile.print(',');
    dataFile.print(now.minute(), DEC);
    dataFile.print(',');
    dataFile.print(now.second(), DEC);
    dataFile.print(',');
    dataFile.print(valCO2);
    dataFile.print(',');
    dataFile.print(event.light);
    dataFile.print(',');
    dataFile.print(t);
    dataFile.print(',');
    dataFile.print(h);
    dataFile.print(',');
    dataFile.print(dust);
    dataFile.print(',');
    dataFile.println(meters);
    dataFile.close();

  }
  // if the file isn't open, pop up an error:
  else {
    Serial.println(F("error opening datalog.txt"));
  }

  /////// print to the serial port too: ////////
  Serial.print(now.day(), DEC);
  Serial.print(',');
  Serial.print(now.month(), DEC);
  Serial.print(',');
  Serial.print(now.year(), DEC);
  Serial.print(',');
  Serial.print(now.hour(), DEC);
  Serial.print(',');
  Serial.print(now.minute(), DEC);
  Serial.print(',');
  Serial.println(now.second(), DEC);
  Serial.print(valCO2);
  Serial.print(',');
  Serial.print(event.light);
  Serial.print(',');
  Serial.print(t);
  Serial.print(',');
  Serial.print(h);
  Serial.print(',');
  Serial.print(dust);
  Serial.print(',');
  Serial.println(meters);

//  bool sent_flag = false;
//  int attempts = 0;
//
//    OSCBundle bndl_send;  // create an OSC bundle filled with sensor data to send back to the hub
//    bndl_send.add("randomaddress").add((int) valCO2).add((int)(event.light)).add((int)t).add((int)h).add((int)dust);
//
//    char message_send[300];
//    memset(message_send, '\0', 300);
//
//    convert_OSC_bundle_to_string(&bndl_send,message_send);  // convert the bundle to string format for sending over nRF
//
//    //print_bundle(&bndl_send);
//
//    RF24NetworkHeader header_send(hyperRail_node);  // define header, tell it which node we're sending to
//    bool ok = network.write(header_send, message_send,strlen(message_send));  // write to the network
//
//    if(ok == false){
//      Serial.println("Total fail...resending.");
//      
//    }else{
//      Serial.println("Sent!");
//      sent_flag = true;
//    }

  //delay(500);
//  OSCBundle bndl_send;  // create an OSC bundle filled with sensor data to send back to the hub
//  bndl_send.add("randomaddress").add((int) valCO2).add((int)(event.light)).add((int)t).add((int)h).add((int)dust);
//  nrf_send_bundle(&bndl_send,hyperRail_node);
}

void sendRequest(byte packet[])  
{
  while(!Serial2.available())  //keep sending request until we start to get a response
  {
    Serial2.write(readCO2,7);
    delay(50);
  }

  int timeout=0;  //set a timeoute counter
  while(Serial2.available() < 7 ) //Wait to get a 7 byte response
  {
    timeout++;
    if(timeout > 10)    //if it takes to long there was probably an error
      {
        while(Serial2.available())  //flush whatever we have
          Serial2.read();
          break;                        //exit and try again
      }
      delay(50);
  }
  for (int i=0; i < 7; i++)
  {
    response[i] = Serial2.read();
  }
}

unsigned long getValue(byte packet[])
{
    int high = packet[3];                        //high byte for value is 4th byte in packet in the packet
    int low = packet[4];                         //low byte for value is 5th byte in the packet
    unsigned long val = high*256 + low;          //Combine high byte and low byte with this formula to get value
    return val* valMultiplier;
}
