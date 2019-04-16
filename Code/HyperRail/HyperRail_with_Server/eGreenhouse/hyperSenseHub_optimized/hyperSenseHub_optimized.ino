/*
  Openly Published Environmental Sensing Lab
  Oregon State University
  Written by: Jose Manuel Lopez Alcala + Lars Larson
  This code was based off Sparkfun's Big Easy Driver Basic Demo code
  https://github.com/sparkfun/Big_Easy_Driver

  This is the version that goes with Processing HyperSenseGUI

  This system's default will be 1/16 microstepping or 6180 steps per revolution
  using  a 0.9degree/step motor

This is the Feather M0

*/


//Import libraries
#include <RF24Network.h>
#include <RF24.h>
#include <SPI.h>
#include <OSCBundle.h>

#define LOOM_DEBUG 1 // enables serial printing (ethernet)
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

//Define nRF stuff
//RF24 radio(5,6);
//RF24Network network(radio);


const uint16_t hyperRail_node = 00;
const uint16_t sensor_node = 01;
const uint16_t ethernet_hub_node = 02;
char message_received[300];

//Declare pin functions on MO
#define stp 9
#define dir 12
//#define MS1 4
//#define MS2 5
//#define MS3 6
#define EN  11

//Declare variable for functions
char user_input;
String inString = " "; // string to hold input
float path_length = 0; // length of rail in meters
float spool_radius = 10;// Radius of the spool that is holding the line
long total_steps = 0; //Total steps calculated to move all the way down the length of the rail.
long x = 0;//counting variable8
bool entered_numberLength = false;//Flag variable to check whether or not the input was a number and not a word
bool entered_numberRadius = false;//Flag variable to check whether or not hte input was a nubmer and not a word
bool entered_RPM = false;//Flag variable to check whether or not hte input was a nubmer and not a word
float RPM_HyperRail = 0;//This variable will be used to store the rpm of the systme after it is converted in the rpmtodelay function
int delay_time = 0;
int inPos = 0;
int intervals_flag = false;//Option for intervals
long interval_steps = 0;//# of steps per interval
int time_interval = 0; // # of seconds to wait before each interval
int stops = 0;//# of intervals
//ints to activate sensors
int co2_activated  = 0;
int lux_activated = 0;
int particle_activated = 0;
int humidity_activated = 0;
int temperature_activated = 0;
int steps_per_revolution = 6180;
float location = 0.;
int option = 0; //this will be used to store value from processing

char inData[80];//This will be used for the incoming data from processing
int current_step = 0;

void setup() {
  pinMode(stp, OUTPUT);
  pinMode(dir, OUTPUT);
  //pinMode(MS1, OUTPUT);
  //pinMode(MS2, OUTPUT);
  //pinMode(MS3, OUTPUT);
  pinMode(EN, OUTPUT);
  resetBEDPins(); //Set step, direction, microstep and enable pins to default states
  //Serial.begin(9600); //Open Serial connection for debugging
  //Serial.println("OPEnS Lab HyperRails");

  //Comment the next line to run without serial monitor
  //while(!Serial){
  //;//Do nothing. Just wait for the user to open the serial monitor.
  //}

  SPI.begin();
  radio.begin();
  radio.setChannel(77);
  //radio.setCRCLength(RF24_CRC_16);
  //radio.setDataRate(RF24_1MBPS);
  network.begin(hyperRail_node);

  int count = 0;
}

//Main loop
void loop() {

  //delay(1500);//for testing
  //Serial.print("This is what is the value of Serial.available(): " );//for testing
  //Serial.println(Serial.available());//for testing

  //Wee need to wait for the serial port to start reading
  //beacuse otherwise we don't see the "R"
  //This is beause the M0 is REALLY FAST!
  while(!Serial)
  {
    ;
  }


  //Tell Processing that we're ready
  Serial.println("R");

  while (Serial.available() == 0)
  {
    ;//Serial.println("Waiting");//for testing
  }

  //while(Serial.available() >= 2){
  //Serial.println("This is what is stored in \"user_input\" before the read : " );// for testing
  //Serial.println(user_input);//for testing
  //user_input = Serial.read(); //Read user input and trigger appropriate function
  //Serial.println("This is what is stored in \"user_input\" after the read : " );//for testing
  //Serial.println(user_input);//for testing

  decoder();//This is where the data gets parsed to get the values from the GUI



  digitalWrite(EN, LOW); //Pull enable pin low to set FETs active and allow motor control
  if (option == 1) {
    if(delay_time >= 5100){ //if this evaluates to true, then it will go slower than 1mm/s
      travelHyperRail_slow(total_steps, delay_time);
    }else{
      if(intervals_flag == 1){
        //Serial.println("Inside if");//for testing
        intervals_travelHyperRail(total_steps,delay_time,interval_steps,stops);
      }else{
      travelHyperRail(total_steps, delay_time);// Traveling faster than 1mm/s
        }
    }
  } else if (option == 2 || option == 5) {
    if(delay_time>=5100){//if this evaluates to true, then it will go slower than 1mm/s
      StepForwardDefault_slow(total_steps, delay_time);
    }else{
      StepForwardDefault(total_steps, delay_time);// Traveling faster than 1mm/s
    }
  }else if (option == 3 || option == 4) {
    if(delay_time >=5100){//if this evaluates to true, then it will go slower than 1mm/s
      StepBackwardDefault_slow(total_steps, delay_time);
    }else{
      StepBackwardDefault(total_steps, delay_time);// Traveling faster than 1mm/s
    }
    //user_input = Serial.read();//This will clear the buffer
  }else{
    Serial.println("Invalid input");
  }
  //Serial.print("This is what is the value of Serial.available() after if statments: " );//for testing
  //Serial.println(Serial.available());//for testing

  delay(1000);//Making sure it stops completeley before cutting current to motor.s
  resetBEDPins();
  //}
}

/******************* Function: decoder()*********************
   Description: This function will parse the message from processing
                into the corresponding varibles.These will be: option,
                steps, and delay time.
   Parameters: NONE
   Returns: VOID
*/
void decoder()
{

  if (Serial.available() > 0)
  {
    String data_str = Serial.readString();//reads in the string
    Serial.print("From uC side: ");// for testing
    Serial.println(data_str);//For testing
    Serial.print("String length: ");// for testing
    Serial.println(data_str.length());// for testing
    data_str.toCharArray(inData, 80);//converts the string into char array

  }
  //Serial.print("Here");// for testing
  //int numVals = sscanf(inData, "[O:%d,S:%ld,D:%d,I:%d,IS:%ld,ST:%d,CO2:%d,Lux:%d,Part:%d,HT:%d*/ ", &option, &total_steps, &delay_time, &intervals_flag, &interval_steps, &stops, &co2_activated, &lux_activated, &particle_activated, &humidity_activated);
  int numVals = sscanf(inData, "[O:%d,S:%ld,D:%d,I:%d,IS:%ld,ST:%d,CO2:%d,Lux:%d,Part:%d,H:%d,T:%d,TI:%d",
                                &option, &total_steps, &delay_time, &intervals_flag, &interval_steps,
                                &stops, &co2_activated, &lux_activated, &particle_activated, &humidity_activated,
                                &temperature_activated, &time_interval);
  Serial.print("Number of values parsed: ");//for testing
  Serial.println(numVals);// for testing
  //Serial.print("total_steps: ");//for testing
  //Serial.println(total_steps);//for testing
  //Serial.print("delay_time_A: ");// for testing
  //Serial.println(delay_time);// for testing
  Serial.print("intervals_flag: ");// for testing
  Serial.println(intervals_flag); // for testing
  //Serial.print("interval_steps: ");// for testing
  //Serial.println(interval_steps);//for testing
  Serial.print("Stops: ");// for testing
  Serial.println(stops);//for testing
  Serial.print("CO2: ");// for testing
  Serial.println(co2_activated);// for testing
  Serial.print("Lux: ");// for testing
  Serial.println(lux_activated);// for testing
  Serial.print("Particle: " );// for testing
  Serial.println(particle_activated);//for testing
  Serial.print("Humidity: ");// for testing
  Serial.println(humidity_activated);// for testing
  Serial.print("Temperature: " );// for testing
  Serial.println(temperature_activated);// for testing
  Serial.print("Time Interval Received: " );// for testing
  Serial.println(time_interval);// for testing
}



/******************* Function: resetBEDPins()*********************
   Description: This function resets the varialbe used for the states back to
                their original values
   Parameters: NONE
   Returns: VOID
*/
void resetBEDPins()
{
  digitalWrite(stp, LOW);
  digitalWrite(dir, LOW);
  //digitalWrite(MS1, LOW);
  //digitalWrite(MS2, LOW);
  //digitalWrite(MS3, LOW);
  digitalWrite(EN,HIGH); //If this is low, the motor will always be on holding its position.
}


/******************* Function: transmit_nRF_sensors()*********************
   Description: This function sends an OSC bundle to the sensor package over nRF, receives
    sensor readings and sends them on to the next node, in this case the ethernet hub. 
   Parameters: NONE
   Returns: VOID
*/

void transmit_nRF_sensors()
{
  
  //network.update();                        // Check the network regularly
  //Serial.println("network updated");//for testing
//  bool sent_flag = false;
//  int attempts = 0;
//
//    Serial.println("Sending...");

    OSCBundle bndl;
    bndl.add("addr").add((int) co2_activated ).add((int) lux_activated).add((int) temperature_activated).add((int) humidity_activated).add( (int) particle_activated).add( (float)(location/1000.));

    //LOOM_DEBUG_Println("To Sensors");  
    //LOOM_DEBUG_Println2("Location: ", location);
    //print_bundle(&bndl);
    
    bool is_sent = nrf_send_bundle(&bndl, sensor_node);
    while(!is_sent){
      network.update();
      is_sent = nrf_send_bundle(&bndl, sensor_node);
      Serial.println("Attempting to reach sensors");
      delay(1000);
    }
   if(is_sent){
    Serial.println("Send to sensors success!");
//   
  //delay(2000); //for testing fail states
  unsigned long start_listening = millis();
   
  
  network.update();
  while(  (!network.available()) && millis()-start_listening <10000  ) {
      network.update();
      //LOOM_DEBUG_Println2("time waiting: ", millis()-start_listening);
      Serial.println("Waiting to receive something on sensors end.");
      delay(500);
  
  }
   }

   OSCBundle sensor_bundle;
   nrf_receive_bundle(&sensor_bundle);
   print_bundle(&sensor_bundle);
   Serial.println("Received sensor data!");
   
   bool is_uploaded = nrf_send_bundle(&sensor_bundle,ethernet_hub_node);
   if(is_uploaded){
    Serial.println("Send to ethernet hub success!");
   }
    else{
      nrf_send_bundle(&sensor_bundle,ethernet_hub_node);
      Serial.println("Attempting to reach ethernet hub");
    }

   

  }
   //}
   
//   while(network.available()){
//    RF24NetworkHeader header_from_sensors;
//    memset(message_received, '\0', 300);
//    network.read(header_from_sensors, &message_received, 299);
//    Serial.print("Message size: ");
//    Serial.println(strlen(message_received));
//
//    //OSCBundle bndl_received;
//    RF24NetworkHeader header_to_hub(/*to node*/ ethernet_hub_node);
//    bool ok_ok = network.write(header_to_hub,message_received,strlen(message_received));
//
//    if(ok_ok = true){
//      Serial.println("Sent to ethernet hub!");
//      //sent_flag = true;
//      
//      
//    }else{
//      
//      Serial.println("ethernet node fail");
//    }
//  }

   




/******************************Function: travelHyperRail()**********************************
   Description:This funciton will move the carriage the whole path length forwards and back.
   Parameters:
            -steps_total: This will be passed from the stepsper_length function.
                          This number dictates the total number of steps needed to
                          travel the whole rail.
   Returns: N/A. It moves the carriage up and down the rail.
*/
void travelHyperRail(long steps_total, int delay_time)
{
  //Serial.println("Traveling the HyperRail!");// for testing

  //Serial.print("My delay time is: " );//for testing
  //Serial.println(delay_time);//For testing
  //Serial.print("My total steps are: ");//for testing
  //Serial.println(steps_total);//for testing

  digitalWrite(dir, LOW); //Pull direction pin low to move "forward"
  unsigned long startTime = micros();// start time // for testing
  for (x = 1; x <= steps_total; x++) //Loop the forward stepping enough times for motion to be visible
  {
    digitalWrite(stp, HIGH); //Trigger one step forward
    delayMicroseconds(delay_time);
    digitalWrite(stp, LOW); //Pull step pin low so it can be triggered again
    delayMicroseconds(delay_time);

    //Serial.println(x);
  }

//// update location of sensors along the rail ////
    current_step = steps_total;
    location = sensors_position(current_step);


//// send data before returning ////
transmit_nRF_sensors();
/*
  unsigned long endTime = micros();//end time//for testing

  unsigned long totalTime = endTime - startTime;//for testing
  Serial.print("Microseconds: ");//for testing
  Serial.println(totalTime);//for testing
  Serial.print("Seconds: " );//for testing
  Serial.println(float(totalTime / (1 * pow(10,6)))); //for testing
*/


  //Waits 100 milliseconds before going back the other way
  delay(500);
  //Serial.println("I made it after the delay. Will now be going back");// for testing

  //This for loop will bring the carriage back to
  // the orignal postion
  digitalWrite(dir, HIGH);//Pull direction pin to HIGH to move "Backward"
  x = 0;
  for (x = 1; x <= steps_total; x++)
  {
    digitalWrite(stp, HIGH);
    delayMicroseconds(delay_time);
    digitalWrite(stp, LOW);
    delayMicroseconds(delay_time);

    //Serial.println(x);//for testing


  }
  current_step = 0;
  location = sensors_position(current_step);
  transmit_nRF_sensors();

  //Serial.println("Enter new option!");
}



/******************************Function: travelHyperRail_slow()**********************************
   Description:This funciton will move the carriage the whole path length forwards and back. The
               main difference between this function and the other one is that this one will be used
               for speeds less than 1mm/s.
   Parameters:
            -steps_total: This will be passed from the stepsper_length function.
                          This number dictates the total number of steps needed to
                          travel the whole rail.
            - delay_time: This will tell the microcontroller how long to pause in between steps.
   Returns: N/A. It moves the carriage up and down the rail.
*/
void travelHyperRail_slow(long steps_total, int delay_time)
{
  //Serial.println("Using slow version");//for testing
  int delay_time_milli = delay_time/1000;
  //Serial.println("Traveling the HyperRail!");// for testing

  //Serial.print("My delay time is: " );//for testing
  //Serial.println(delay_time);//For testing
  //Serial.print("My total steps are: ");//for testing
  //Serial.println(steps_total);//for testing

  digitalWrite(dir, LOW); //Pull direction pin low to move "forward"
  unsigned long startTime = micros();// start time // for testing
  for (x = 1; x <= steps_total; x++) //Loop the forward stepping enough times for motion to be visible
  {
    digitalWrite(stp, HIGH); //Trigger one step forward
    delay(delay_time_milli);
    digitalWrite(stp, LOW); //Pull step pin low so it can be triggered again
    delay(delay_time_milli);
    //Serial.println(x);
  }

  unsigned long endTime = micros();//end time//for testing

  unsigned long totalTime = endTime - startTime;//for testing
  Serial.print("Microseconds: ");//for testing
  Serial.println(totalTime);//for testing
  Serial.print("Seconds: " );//for testing
  Serial.println(float(totalTime / (1 * pow(10,6)))); //for testing



  //Waits 100 milliseconds before going back the other way
  delay(500);
  //Serial.println("I made it after the delay. Will now be going back");// for testing

  //This for loop will bring the carriage back to
  // the orignal postion
  digitalWrite(dir, HIGH);//Pull direction pin to HIGH to move "Backward"
  x = 0;
  for (x = 1; x <= steps_total; x++)
  {
    digitalWrite(stp, HIGH);
    delay(delay_time_milli);
    digitalWrite(stp, LOW);
    delay(delay_time_milli);
    //Serial.println(x);//for testing
  }
  //Serial.println("Enter new option!");
}



/***************************** Function: StepForwardDefault()***********************
   Description: This function will move the carriage all the way down and stay
                at the end of the line. NO return.
   Parameters: -RPM: The speed at which the motor will be turning
   Return: N/A. This function will only move the carriage forward, returns nothing.

*/
void StepForwardDefault(long steps_total, int delay_time)
{
  //Serial.println("\nMoving carriage forward.");// for testing

  //Serial.print("My delay time is: " );//for testing
  //Serial.println(delay_time);//For testing
  //Serial.print("My total steps are: ");//for testing
  //Serial.println(steps_total);//for testing

  digitalWrite(dir, LOW); //Pull direction pin low to move "forward"
  for (x = 1; x < steps_total; x++) //Loop the forward stepping enough times for motion to be visible
  {
    digitalWrite(stp, HIGH); //Trigger one step forward
    delayMicroseconds(delay_time);
    digitalWrite(stp, LOW); //Pull step pin low so it can be triggered again
    delayMicroseconds(delay_time);
    //Serial.println(x);
  }
  //Serial.println("Enter new option");
}



/***************************** Function: StepForwardDefault_slow()***********************
   Description: This function will move the carriage all the way down and stay
                at the end of the line. NO return. This function is for when the carriage is
                moving slower than 1mm/s.
   Parameters: -RPM: The speed at which the motor will be turning
   Return: N/A. This function will only move the carriage forward, returns nothing.

*/
void StepForwardDefault_slow(long steps_total, int delay_time)
{
  int delay_time_milli = delay_time/1000;
  //Serial.println("\nMoving carriage forward.");// for testing

  //Serial.print("My delay time is: " );//for testing
  //Serial.println(delay_time);//For testing
  //Serial.print("My total steps are: ");//for testing
  //Serial.println(steps_total);//for testing

  digitalWrite(dir, LOW); //Pull direction pin low to move "forward"
  for (x = 1; x < steps_total; x++) //Loop the forward stepping enough times for motion to be visible
  {
    digitalWrite(stp, HIGH); //Trigger one step forward
    delay(delay_time_milli);
    digitalWrite(stp, LOW); //Pull step pin low so it can be triggered again
    delay(delay_time_milli);
    //Serial.println(x);
  }
  //Serial.println("Enter new option");
}

/***************************** Function: StepBackwardDefault()***********************
   Description: This function will move the carriage all the way down and stay
                at the end of the line. NO return.
   Parameters: steps, delay time
   Return: N/A. This function will only move the carriage forward, returns nothing.

*/
void StepBackwardDefault(long steps_total, int delay_time)
{
  int delay_time_milli = delay_time/1000;
  //Serial.println("\nMoving carriage backward.");// for testing
  //Serial.print("My delay time is: " );//for testing
  //Serial.println(delay_time);//For testing
  //Serial.print("My total steps are: ");//for testing
  //Serial.println(steps_total);//for testing
  digitalWrite(dir, HIGH); //Pull direction pin high to move "backward"
  for (x = 1; x < steps_total; x++) //Loop the forward stepping enough times for motion to be visible
  {
    digitalWrite(stp, HIGH); //Trigger one step forward
    delayMicroseconds(delay_time);
    digitalWrite(stp, LOW); //Pull step pin low so it can be triggered again
    delayMicroseconds(delay_time);
    //Serial.println(x);
  }
  //Serial.println("Enter new option");
}


/***************************** Function: StepBackwardDefault_slow()***********************
   Description: This function will move the carriage all the way down and stay
                at the end of the line. NO return. This function will be used when the
                carriage is moving at speeds lower than 1mm/s.
   Parameters: steps, delay time
   Return: N/A. This function will only move the carriage forward, returns nothing.

*/
void StepBackwardDefault_slow(long steps_total, int delay_time)
{
  int delay_time_milli = delay_time/1000;
  //Serial.println("\nMoving carriage backward.");// for testing
  //Serial.print("My delay time is: " );//for testing
  //Serial.println(delay_time);//For testing
  //Serial.print("My total steps are: ");//for testing
  //Serial.println(steps_total);//for testing
  digitalWrite(dir, HIGH); //Pull direction pin high to move "backward"
  for (x = 1; x < steps_total; x++) //Loop the forward stepping enough times for motion to be visible
  {
    digitalWrite(stp, HIGH); //Trigger one step forward
    delay(delay_time_milli);
    digitalWrite(stp, LOW); //Pull step pin low so it can be triggered again
    delay(delay_time_milli);
    //Serial.println(x);
  }
  //Serial.println("Enter new option");
}

/******************************Function: sensors_position****************************************
  Description: This function calculates the current position of the sensor package along the rail
  Parameters: current_step
  Returns: int (because we want to round to nearest millimeter)
*/

int sensors_position(int current_step){
  return ceil(((current_step*2*3.1415926535*spool_radius)/steps_per_revolution));
}


/******************************Function: intervals_travelHyperRail()**********************************
   Description:This funciton will move the carriage the whole path length forwards by interval and then
               go back the origin of the rail.
   Parameters:
            -steps_total: This will be passed from the stepsper_length function.
                          This number dictates the total number of steps needed to
                          travel the whole rail.
            -delay_time: this is time delay for each steps
   Returns: N/A. It moves the carriage up and down the rail.
*/
void intervals_travelHyperRail(long steps_total, int delay_time, long interval_steps, int stops )
{
  for(;;){

/// Take a reading at starting position ///

transmit_nRF_sensors();
   //int count = count+=1;
   //Serial.print("Index: ");
   //Serial.println(count);
Serial.println("Moving Rail...");
/// move HyperRail forward ///
  current_step = 0;
  for(int s = 1; s <= stops; s++){
    digitalWrite(dir, LOW); //Pull direction pin low to move "forward"
    current_step += interval_steps;
    location = sensors_position(current_step);

    for (x = 1; x <= interval_steps; x++) //Loop the forward stepping enough times for motion to be visible
    {
      digitalWrite(stp, HIGH); //Trigger one step forward
      delayMicroseconds(delay_time);
      digitalWrite(stp, LOW); //Pull step pin low so it can be triggered again
      delayMicroseconds(delay_time);
      //Serial.println(x);// for testing
    }
    //Serial.println("Finished Interval");//

  transmit_nRF_sensors();
  }
  
  //count = count+=1;
   //Serial.print("Index: ");






   
   //Serial.println(count);
   
  //This for loop will bring the carriage back to
  // the orignal postion
  digitalWrite(dir, HIGH);//Pull direction pin to HIGH to move "Backward"
  x = 0;
  for (x = 1; x <= steps_total; x++)
  {
    digitalWrite(stp, HIGH);
    delayMicroseconds(delay_time);
    digitalWrite(stp, LOW);
    delayMicroseconds(delay_time);
    //Serial.println(x);//for testing
  }

current_step = 0;
location = sensors_position(current_step);
delay(time_interval*1000);

//Serial.println("interval test");
//Serial.println(time_interval*1000);
  }
}
