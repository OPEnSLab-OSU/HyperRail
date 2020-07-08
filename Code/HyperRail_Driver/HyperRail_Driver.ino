#include "HyperRail_Driver.h" 




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

 //attachInterrupt(digitalPinToInterrupt(X0ABump), X0A_ISR, FALLING);

 /* attachInterrupt(digitalPinToInterrupt(X0BBump), X0B_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(XMaxABump), XMaxA_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(XMaxBBump), XMaxB_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(Y0Bump), Y0_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(YMaxBump), YMax_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(Z0Bump), Z0_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(ZMaxBump), ZMax_ISR, FALLING); */


  X0AFlag = 0; 
  XmaxAFlag = 0; 
  X0BFlag = 0; 
  XmaxBFlag = 0; 
  Y0Flag = 0; 
  YMAXFlag = 0; 
  Z0Flag = 0; 
  ZMAXFlag = 0;
 

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
  
/*   Serial.print("GoTo = ");
  Serial.println(Goto); 
  Serial.print("Reset = "); 
  Serial.println(Reset); 
  Serial.print("loop = "); 
  Serial.println(looP); 
  Serial.print("Calibrate = ");
  Serial.println(calibrate); */


  // if(Goto == 1)
   GoTo(xsteps, ysteps, zsteps); 

 //if(looP == 1)
  // Loop(); 

//  if(Reset == 1 and calibrated == true)
//   GoTo(X0_pos, Y0_pos, Z0_pos);   

  // Serial.print(xAMove);

  // checkInts(); 


 // X0AFlag = checkInts(X0AFlag, X0ABump, X0A_pos, stepperX, xMove);

  // if rail is not calibrated then calibrate it 
// if(calibrate == 1)
  // Calibrate(); 

 }