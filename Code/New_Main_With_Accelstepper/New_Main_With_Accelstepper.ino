 // File: HyperRail_Main_New.ino
 // Name: Liam Duncan 
 //        Made for OPEnS Lab 
 // Date: 1/21/2020
 // Description: Code to Drive the HyperRail, Interface with Processing GUI, and Receive data from eGreenhouse

 #include <ArduinoJson.h>
 #include <AccelStepper.h>

 // define the steps per revolution for X,Y and Z motors 
 #define X_SPR 1700
 #define YZ_SPR 400 

 // Use these variables to define your microstep values for the motors 
 // When there is nothing connected to the big easy driver pins the driver defaults to 1/16 step 
 #define YZ_Micro 1 // 1/16 step 
 #define X_Micro 1  // full step 


 // define all interrupt pins for bump switches
 int X0ABump = 1;
 int X0BBump = 14;

 int XMaxABump = 0;
 int XMaxBBump = 6;

 int Y0Bump = 18;
 int YMaxBump = 20;

 int Z0Bump = 21;
 int ZMaxBump = 15;

 // Define Motor Pins X A,B
 #define STEPXA 10
 #define DIRXA 11

 #define STEPXB 12
 #define DIRXB 13

 // Define Motor Pins for Y 
 #define STEPY 9
 #define DIRY 16

 // Define Motor Pins for Z
 #define STEPZ 17
 #define DIRZ 19

 // foreward and backward definitions
 #define FORWARD 0
 #define BACKWARD 1

 volatile int xAMove = 1; 
 volatile int xBMove = 1; 
 volatile int yMove = 1; 
 volatile int zMove = 1; 

 String JsonStr;   // Define a string object to receive JSON data from Processing GUI

 // Length of X,Y,Z axis in meters
 int X_Location = 0; 
 int Y_Location = 0; 
 int Z_Location = 0; 

 // velocity you would like the rail to move at
 int Velocity; 

 // variables to hold the spool radius for X, Y, Z axis;
 int Spool_Rad_X = 32; 
 int Spool_Rad_YZ = 32; 

 // Variables to select what the rail does
 int Goto = 0; 
 int looP = 0; 
 int Reset = 0; 
 int calibrate = 0; 

 // Variable for looping period in loop mode
 int periodX;
 int periodY; 
 int periodZ; 

 // Position of the back end of the rail set by the calibration function
 int X0A_pos; 
 int X0B_pos; 
 int Y0_pos; 
 int Z0_pos; 
 int X0_pos; 

 // Position of the front end of the rail set by the calibration function
 int XmaxA_pos; 
 int XmaxB_pos; 
 int Ymax_pos; 
 int Zmax_pos; 
 int Xmax_pos;

 // Make flags for the interrupts 
 volatile int XA0Flag = 0; 
 volatile int XmaxAFlag = 0; 
 volatile int X0BFlag = 0; 
 volatile int XmaxBFlag = 0; 
 volatile int Y0Flag = 0; 
 volatile int YMAXFlag = 0; 
 volatile int Z0Flag = 0; 
 volatile int ZMAXFlag = 0; 

 // Calibration Speeds
 int XCalSpeed = 300; 
 int YZCalSpeed = 200; 

 // Define the max stepper speed in Steps/second
 int MaxSpeed = 2500; 

 // calibration has happened or not
 bool calibrated = false; 

 // ensure that the interrupts do not trigger when switches are released 
 int Y0_Count = 0; 
 int XA0_Count = 0; 
 int XB0_Count = 0; 
 int Z0_Count = 0; 

 int YMAX_Count = 0;
 int XAMAX_Count = 0;
 int XBMAX_Count = 0; 
 int ZMAX_Count = 0; 


// One stepper Motor Step 
void onestep(int dir, int stepPin, int dirPin) {

// set the direction to turn
   if (dir == 1){ 
      digitalWrite(dirPin, HIGH);
   }
   else {
      digitalWrite(dirPin, LOW);
   }

   digitalWrite(stepPin, HIGH);
   delayMicroseconds(60);
   digitalWrite(stepPin, LOW);
   delayMicroseconds(60); 
}

// Functions for Stepper Motor Stepping 

void forwardXA() {
  onestep(FORWARD, STEPXA, DIRXA);
}

void backwardXA() {
  onestep(BACKWARD, STEPXA, DIRXA);
}

void forwardXB() {
  onestep(FORWARD, STEPXB, DIRXB);
}

void forwardX()
{
  onestep(BACKWARD, STEPXA, DIRXA);
  onestep(FORWARD, STEPXB, DIRXB);
}

void backwardX()
{
  onestep(FORWARD, STEPXA, DIRXA);
  onestep(BACKWARD, STEPXB, DIRXB);
}

void backwardXB() {
  onestep(BACKWARD, STEPXB, DIRXB);
}

void forwardY() {
  onestep(FORWARD, STEPY, DIRY);
}

void backwardY() {
  onestep(BACKWARD, STEPY, DIRY);
}


void forwardZ() {
  onestep(FORWARD, STEPZ, DIRZ);
}

void backwardZ() {
  onestep(BACKWARD, STEPZ, DIRZ);
}


   // construct Motor objects 
   AccelStepper stepperX(forwardX, backwardX);
   AccelStepper stepperY(forwardY, backwardY);
   AccelStepper stepperZ(forwardZ, backwardZ); 


 // put interrupt functions here 

  void X0A_ISR()
 {
   //Serial.println("A0");
   XA0Flag = 1; 
   xAMove = 0; 
 }



 void Y0_ISR()
 {
   Y0Flag = 1;
   yMove = 0; 
 }

 void X0B_ISR()
 {
   X0BFlag = 1; 
   xBMove = 0; 
 }


// ISR for Z0 
void Z0_ISR()
{
  Z0Flag = 1; 
  zMove = 0;
}



void XMaxA_ISR()
{
  XmaxAFlag = 1; 
  xAMove = 0;
}



void YMax_ISR()
{
  YMAXFlag = 1; 
  yMove = 0;
}



void XMaxB_ISR()
{
  XmaxBFlag = 1; 
  xBMove = 0;
}



void ZMax_ISR()
{
  ZMAXFlag = 1; 
  zMove = 0;
}
 


void setup() {

  Serial.begin(9600); 

  Serial.print("Arduino is Ready!"); 

  // set up interrupts and pins 

  // XA Bump Switches 
  pinMode(X0ABump, INPUT_PULLUP); 
  pinMode(XMaxABump, INPUT_PULLUP); 

  // XB Bump Switches 
  pinMode(X0BBump, INPUT_PULLUP); 
  pinMode(XMaxBBump, INPUT_PULLUP); 

  // Y axis Bump Switches 
  pinMode(Y0Bump, INPUT_PULLUP); 
  pinMode(YMaxBump, INPUT_PULLUP); 

  // Z Axis Bump Switches 
  pinMode(Z0Bump, INPUT_PULLUP); 
  pinMode(ZMaxBump, INPUT_PULLUP);  

  // XA Motor Control Pins
  pinMode(STEPXA, OUTPUT); 
  pinMode(DIRXA, OUTPUT); 

  // XB Motor Control Pins 
  pinMode(STEPXB, OUTPUT); 
  pinMode(DIRXB, OUTPUT); 

  // Y Motor Control Pins
  pinMode(STEPY, OUTPUT); 
  pinMode(DIRY, OUTPUT); 

  // Z Motor Control Pins
  pinMode(STEPZ, OUTPUT); 
  pinMode(DIRZ, OUTPUT); 

  // Set Max Speed For all Steppers 
  stepperX.setMaxSpeed(MaxSpeed); 
  stepperY.setMaxSpeed(MaxSpeed/4); 
  stepperZ.setMaxSpeed(MaxSpeed/4); 

  // Set the Acceleration for the stepper motors
  stepperX.setAcceleration(40); 
  stepperY.setAcceleration(80);
  stepperZ.setAcceleration(40);


  
 //  initialize all interrupts for Bump Switches 

 attachInterrupt(digitalPinToInterrupt(X0ABump), X0A_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(X0BBump), X0B_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(XMaxABump), XMaxA_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(XMaxBBump), XMaxB_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(Y0Bump), Y0_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(YMaxBump), YMax_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(Z0Bump), Z0_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(ZMaxBump), ZMax_ISR, FALLING);
 

}


int mmToSteps(double mm, int steps_per_revolution, double belt_radius, int micro) {

        // Serial.print("mm = ");
        // Serial.println(mm); 

        // Serial.print("steps per rev = "); 
        // Serial.println(steps_per_revolution); 

        // Serial.print("Radius = "); 
        // Serial.println(belt_radius); 
  
        return (int) round((mm*micro)/(2*3.14*belt_radius) * steps_per_revolution);
    }


// Function Gets data from serial port GUI, 
// turns it into a JSON object, and sets int  
// values 
void GetData()
{
  // create JSON object
  DynamicJsonDocument doc(400); 

  // receive Json String From Processing   
  JsonStr = Serial.readString(); 
  // Serial.println(JsonStr); 

  // Deserialize Object
  DeserializationError err = deserializeJson(doc, JsonStr); 

  // Print Error and Return From function if deserialization failed
  if (err) {
    Serial.print(F("deserializeJson() failed with code "));
    Serial.println(err.c_str());
        
    return;
  }

  // Pretty Serialization 
  serializeJsonPretty(doc, JsonStr); 


  // Store all Values from JSON file as Ints 
  X_Location = doc["X_Location"]; 
  Y_Location = doc["Y_Location"]; 
  Z_Location = doc["Z_Location"]; 
  MaxSpeed = doc["Velocity"]; 
  Spool_Rad_X = doc["SpoolRadX"]; 
  Spool_Rad_YZ = doc["SpoolRadYZ"]; 
  Goto = doc["GoTo"]; 

  looP = doc["Loop"]; 
  periodX = doc["periodX"]; 
  periodY = doc["periodY"]; 
  periodZ = doc["periodZ"]; 

  Reset = doc["Reset"]; 

  calibrate = doc["Calibrate"]; 

  // Set Max Speed For all Steppers 
  stepperX.setMaxSpeed(MaxSpeed); 
  stepperY.setMaxSpeed(MaxSpeed/2); 
  stepperZ.setMaxSpeed(MaxSpeed/2); 


  return; 
}




void GoTo(int x, int y, int z)
{

 // Use MoveTo Function to set desired position 
  stepperX.moveTo(x); 
  stepperY.moveTo(y);
  stepperZ.moveTo(z);

  int i = 1, j = 1, k = 1; 
  while(i == 1 or j == 1 or k == 1)
  {
    /* if(XA0Flag or XmaxAFlag or X0BFlag or XmaxBFlag or Y0Flag or YMAXFlag or Z0Flag or ZMAXFlag)
    {
      //Serial.println("Break");
      break;
    } */

    if(xAMove and xBMove)
    i =  stepperX.run(); 

    if(yMove)
    j =  stepperY.run();

    if(zMove)
    k =  stepperZ.run();
  }

  return; 
}


void Loop(int xperiod, int yperiod, int zperiod)
{
  
  if(XA0Flag or XmaxAFlag or X0BFlag or XmaxBFlag or Y0Flag or YMAXFlag or Z0Flag or ZMAXFlag)
  {
   //Serial.println("return");
   return;
  }

  GoTo(xperiod, yperiod, zperiod); 

  xperiod = -xperiod; 
  yperiod = -yperiod; 
  zperiod = -zperiod; 
  
}




// Function to calibrate all axis and set MAX and 
// 0 points for all axis individually 
void Calibrate()
{
  
    // Loop while not all of the switches have been pressed
    while(!XA0Flag or !XmaxAFlag or !X0BFlag or !XmaxBFlag or !Y0Flag or !YMAXFlag or !Z0Flag or !ZMAXFlag)
    {

      // XA 0 point calibration runs while the 0 switch has not been triggered
      if(!XA0Flag)
      {   
      stepperX.setSpeed(-XCalSpeed); 
      stepperX.runSpeed(); 
      }

      // XB 0 point calibration runs while the 0 switch has not been triggered
      if(!X0BFlag)
      {
        stepperX.setSpeed(-XCalSpeed); 
        stepperX.runSpeed(); 
      }

      // If both X axis switches have been triggered then 
      // set the 0 position and allow the axis to move again.  
      if(XA0Flag and X0BFlag)
      {
          X0_pos = stepperX.currentPosition() + 50; 
          xAMove = 1; 
          xBMove = 1; 
      }

     // Y 0 point calibration runs while Y0 switch has not been triggered
      if(!Y0Flag)
      {
        stepperY.setSpeed(-YZCalSpeed);
        stepperY.runSpeed();
      }

      // When switch is triggered set 0 position and allow the Y axis to move again
      if(Y0Flag)
      {
        Y0_pos = stepperY.currentPosition() + 50; 
        yMove = 1; 
      }

      // Z 0 point calibration runs while the Z0 flag has not been triggered 
      if(!Z0Flag)
      {
       stepperZ.setSpeed(-YZCalSpeed); 
       stepperZ.runSpeed(); 
      }

      // When Z0 flag is triggered set 0 position and allow the Z axis to move again
      if(Z0Flag)
      {
        Z0_pos = stepperZ.currentPosition() + 50; 
        zMove = 1; 
      }

     // XA Max Point calibration runs after X0 switches have been triggered 
     // and while Maximum flag has not been triggered
      if(XA0Flag and X0BFlag and !XmaxAFlag)
      {
        stepperX.setSpeed(XCalSpeed); 
        stepperX.runSpeed();
      }

      // XB Max Point Calibration runs after X0 switches have been triggered 
     // and while Maximum flag has not been triggered
      if(X0BFlag and XA0Flag and !XmaxBFlag)
      {
        stepperX.setSpeed(XCalSpeed); 
        stepperX.runSpeed();
      }


      // When both X motors reach the maximum switches, set Max position 
      // and allow the x motors to move again
      if(XmaxAFlag and XmaxBFlag)
      {
          Xmax_pos = stepperX.currentPosition() - 50; 
          xAMove = 1; 
          xBMove = 1; 
      }

      // Y Max Point Calibration runs while the Y0 switch 
      // has been triggered and before the Ymax switch is triggered
      if(Y0Flag and !YMAXFlag)
      {
        stepperY.setSpeed(YZCalSpeed); 
        stepperY.runSpeed();
      }

      // When Ymax switch is triggered, set max position 
      // and allow the Y motor to move again
      if(YMAXFlag)
      {
        Ymax_pos = stepperY.currentPosition() - 50; 
        yMove = 1; 
      }

      // Z max point calibration runs after Z0 switch has been pressed 
      // and before the Zmax switch is triggered
      if(Z0Flag and !ZMAXFlag)
      {
        stepperZ.setSpeed(YZCalSpeed); 
        stepperZ.runSpeed();
      }

      // When Zmax switch is triggered set max position and 
      // allow the Z motor to move again
      if(ZMAXFlag)
      {
        Zmax_pos = stepperZ.currentPosition() - 50; 
        zMove = 1; 
      }

    }

  // make motors move off of the max bump switch
  stepperX.moveTo(Xmax_pos); 
  stepperY.moveTo(Ymax_pos);
  stepperZ.moveTo(Zmax_pos);

  // This is nessecary because the GoTo function will 
  // not run while the flag is triggered

  int i = 1, j = 1, k = 1; 
  while(i == 1 or j == 1 or k == 1)
  {
    i =  stepperX.run(); 
    j =  stepperY.run();
    k =  stepperZ.run();
  }

    // Reset all of the bump switch flags
    XA0Flag = 0; 
    X0BFlag = 0; 
    XmaxAFlag = 0; 
    XmaxBFlag = 0; 
    Y0Flag = 0; 
    YMAXFlag = 0; 
    Z0Flag = 0; 
    ZMAXFlag = 0; 

    // set calibration flag 
    calibrated = true; 

    // Move motors to the 0 position
    GoTo(X0_pos, Y0_pos, Z0_pos); 
   
}


// Function to Check the validity of the interrupts and act accordingly
int checkInts(volatile int flag, int bump, int pos, AccelStepper stepper, bool move)
{
  if(flag == true)
  {
    delay(5); 

    if(digitalRead(bump) == LOW)
    {
    delay(10); 
    Serial.println("Switch has been Pressed"); 
    pos = stepper.currentPosition(); 
    move = false; 
    flag = 0; 
    }
    Serial.println("Flag");
    flag = 0; 
    Serial.println(XA0Flag); 
  }

  return flag; 
}



// main Loop 
void loop() {

  // Read Json Object from Processing
  if(Serial.available()) 
    GetData();   

// Convert Number of mm to steps for the GoTo Function
  int xsteps = mmToSteps(X_Location, X_SPR, Spool_Rad_X, X_Micro );
  int ysteps = mmToSteps(Y_Location, YZ_SPR, Spool_Rad_YZ, YZ_Micro );
  int zsteps = mmToSteps(Z_Location, YZ_SPR, Spool_Rad_YZ, YZ_Micro );
 
 if(Goto == 1)
  GoTo(xsteps, ysteps, zsteps); 

 if(looP == 1)
  Loop(periodX, periodY, periodZ); 

 if(Reset == 1 and calibrated == true)
  GoTo(X0_pos, Y0_pos, Z0_pos); 

 //XA0Flag = checkInts(XA0Flag, X0ABump, X0A_pos, stepperX, xMove); 

  // if rail is not calibrated then calibrate it 
 if(calibrate == 1)
   Calibrate(); 

 }
