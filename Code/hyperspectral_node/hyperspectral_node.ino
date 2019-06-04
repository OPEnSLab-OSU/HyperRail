/*
 * Openly Published Environmental Sensing Lab
 * Oregon State University
 * Written by: Eli Winkelman, Lars Larson, Manuel Lopez
 * 
 * This is written for the Adafruit Feather M0 LoRa
 * It recieves a signal from the hyperrail hub to start collecting hyperspectral data.
 */
 
//Import libraries

#include <OSCBundle.h>

#define STR_HELPER(x) #x
#define STR(x) STR_HELPER(x) //to concatenate a predefined number to a string literal, use STR(x)
#define FAMILY "/LOOM"
#define DEVICE "/Ishield"
#define INSTANCE_NUM 0  // Unique instance number for this device, useful when using more than one of the same device type in same space
#define IDString FAMILY DEVICE STR(INSTANCE_NUM) // C interprets subsequent string literals as concatenation: "/Loom" "/Ishield" "0" becomes "/Loom/Ishield0"


#define LOOM_DEBUG 1 // enables serial printing (ethernet)
#define LOOM_DEBUG_Print(X)          (LOOM_DEBUG==0) ? :  Serial.print(X)
#define LOOM_DEBUG_Println(X)        (LOOM_DEBUG==0) ? :  Serial.println(X)
#define LOOM_DEBUG_Print2(X,Y)       LOOM_DEBUG_Print(X); LOOM_DEBUG_Print(Y)
#define LOOM_DEBUG_Println2(X,Y)     LOOM_DEBUG_Print(X); LOOM_DEBUG_Println(Y)
#define LOOM_DEBUG_Print3(X,Y,Z)     LOOM_DEBUG_Print(X); LOOM_DEBUG_Print(Y); LOOM_DEBUG_Print(Z)
#define LOOM_DEBUG_Println3(X,Y,Z)   LOOM_DEBUG_Print(X); LOOM_DEBUG_Print(Y); LOOM_DEBUG_Println(Z)
#define LOOM_DEBUG_Print4(W,X,Y,Z)   LOOM_DEBUG_Print(W); LOOM_DEBUG_Print(X); LOOM_DEBUG_Print(Y); LOOM_DEBUG_Print(Z)
#define LOOM_DEBUG_Println4(W,X,Y,Z) LOOM_DEBUG_Print(W); LOOM_DEBUG_Print(X); LOOM_DEBUG_Print(Y); LOOM_DEBUG_Println(Z)


#include "loom_translator.h"

//////Define LoRa stuff////////
#include "loom_lora.h"

void setup() {
  // put your setup code here, to run once:

  //setup the lora
  pinMode(RFM95_RST, OUTPUT);
  digitalWrite(RFM95_RST, HIGH);
  setup_lora(&rf95, &manager);
  rf95.setModemConfig(RH_RF95::Bw500Cr45Sf128);

  Serial.begin(9600);     //Opens the main serial port to communicate with the computer

}

void loop() {

  OSCBundle bndl;


  //// LoRa receive from HUB ////

  unsigned long start_listening = millis();
  // put your main code here, to run repeatedly:
 lora_receive_bundle(&bndl);

  if ( (bndl.size() > 0) && (bndl.size() < 1000) ) {

    Serial.println("Friendly bundle received from hub!");

    OSCMessage *msg = bndl.getOSCMessage(0);  // the zero index means it's the first message in the bundle
    bool hyperspectral_camera = msg->getInt(0);  // if the first index of the messsage is a 1, take a CO2 reading
    //Serial.println(millis());

    if (hyperspectral_camera) {
      startHyperspectralCamera();
    }
  }
}

/**
 * A function to start the hyperspectral camera data collection.
 * Parameters: None
 * Return: None
 */
 
void startHyperspectralCamera() {
  //put code to start the hyperspectral camera here.
  Serial.println("Starting hyperspectral camera");
}
