/*
  Openly Published Environmental Sensing Lab
  Oregon State University
  Written by: Manuel Lopez
  This code was based off Sparkfun's Big Easy Driver Basic Demo code
  https://github.com/sparkfun/Big_Easy_Driver

  This is the version that goes with Processing HyperRailGUI3

  This system's default will be 1/16 microstepping or 6400 steps per revolution
  using  a 0.9degree/step motor

This is the Feather M0 with LoRa
  
*/

//Declare pin functions on Arduino
#define stp 9
#define dir 10
//#define MS1 4
//#define MS2 5
//#define MS3 6
#define EN  11

//Declare variable for functions
char user_input;
String inString = " "; // string to hold input
float path_length = 0; // length of rail in meters
float spool_radius = 0;// Radius of the spool that is holding the line
long total_steps = 0; //Total steps calculated to move all the way down the length of the rail.
long x = 0;//counting variable8
bool entered_numberLength = false;//Flag variable to check whether or not the input was a number and not a word
bool entered_numberRadius = false;//Flag variable to check whether or not hte input was a nubmer and not a word
bool entered_RPM = false;//Flag variable to check whether or not hte input was a nubmer and not a word
float RPM_HyperRail = 0;//This variable will be used to store the rpm of the systme after it is converted in the rpmtodelay function
int delay_time = 0;
int inPos = 0;

int option = 0; //this will be used to store value from processing

char inData[20];//This will be used for the incoming data from processing


void setup() {
  pinMode(stp, OUTPUT);
  pinMode(dir, OUTPUT);
  //pinMode(MS1, OUTPUT);
  //pinMode(MS2, OUTPUT);
  //pinMode(MS3, OUTPUT);
  pinMode(EN, OUTPUT);
  resetBEDPins(); //Set step, direction, microstep and enable pins to default states
  //Serial.begin(9600); //Open Serial connection for debugging
  Serial.println("OPEnS Lab HyperRails");

  //Comment the next line to run without serial monitor
  //while(!Serial){
  //;//Do nothing. Just wait for the user to open the serial monitor.
  //}

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
    travelHyperRail(total_steps, delay_time);
    //user_input = Serial.read();//This will clear the buffer
  } else if (option == 2) {
    StepForwardDefault(total_steps, delay_time);
    //user_input = Serial.read();//This will clear the buffer
  } else if (option == 3) {
    StepBackwardDefault(total_steps, delay_time);
    //user_input = Serial.read();//This will clear the buffer
  } else {
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
    Serial.println(data_str);//For testing
    data_str.toCharArray(inData, 20);//converts the string into char array




  }

  /*

    char val = ' ' ;
    while(Serial.available() > 0 && val != ']')
    {
    val = Serial.read();
    Serial.println("val: ");// for testing
    Serial.println(val);// for testing

    if(val == '[')
    {
      inPos = 0;
      inData[inPos] = '\0';

      //read  to the end of the data
      while(val != ']' && inPos<20)
      {

        //Read the next letter
        val = Serial.read();
        Serial.println(val);//for testing
        if(val != ']')
        {
          inData[inPos] = val;
          inPos++;
          inData[inPos] = '\0';
        }
      }
    }
    }

  */
  //if(inPos > 0)
  //{
  int numVals = sscanf(inData, "[O:%d ,S:%ld ,D:%d", &option, &total_steps, &delay_time);
  Serial.print("Number of values parsed: ");
  Serial.println(numVals);
  Serial.print("total_steps: ");
  Serial.println(total_steps);
  Serial.print("delay_time: ");
  Serial.println(delay_time);

  //}
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
  digitalWrite(EN, HIGH);
}

/******************************Function: travelHyperRail()**********************************
   Description:This funciton will move the carriage the whole path length forwards and back.
   Parameters:
            -RPM?: Revolutions per minute at which the motor will be spinning
            -steps_total: This will be passed from the stepsper_length function.
                          This number dictates the total number of steps needed to
                          travel the whole rail.
   Returns: N/A. It moves the carriage up and down the rail.
*/
void travelHyperRail(long steps_total, int delay_time)
{
  Serial.println("Traveling the HyperRail!");

  Serial.print("My delay time is: " );//for testing
  Serial.println(delay_time);//For testing
  Serial.print("My total steps are: ");//for testing
  Serial.println(steps_total);//for testing

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

  unsigned long endTime = micros();//end time//for testing

  unsigned long totalTime = endTime - startTime;//for testing
  Serial.print("Microseconds: ");//for testing
  Serial.println(totalTime);//for testing
  Serial.print("Seconds: " );//for testing
  Serial.println(float(totalTime / (1 * pow(10,6)))); //for testing



  //Waits 100 milliseconds before going back the other way
  delay(500);
  Serial.println("I made it after the delay. Will now be going back");// for testing

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
  Serial.println("\nMoving carriage forward.");

  Serial.print("My delay time is: " );//for testing
  Serial.println(delay_time);//For testing
  Serial.print("My total steps are: ");//for testing
  Serial.println(steps_total);//for testing

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

/***************************** Function: StepBackwardDefault()***********************
   Description: This function will move the carriage all the way down and stay
                at the end of the line. NO return.
   Parameters: -RPM: The speed at which the motor will be turning
   Return: N/A. This function will only move the carriage forward, returns nothing.

*/
void StepBackwardDefault(long steps_total, int delay_time)
{
  Serial.println("\nMoving carriage backward.");
  Serial.print("My delay time is: " );//for testing
  Serial.println(delay_time);//For testing
  Serial.print("My total steps are: ");//for testing
  Serial.println(steps_total);//for testing
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




