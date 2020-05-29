
// #include <Loom.h>

// // Include configuration
// const char* json_config = 
//  "{\"general\":{\"device_name\":\"Device\",\"family\":\"Loom\",\"instance_num\":1,\"family_num\":0},\"components\":[{\"name\":\"DS3231\",\"params\":[11,true]},{\"name\":\"Interrupt_Manager\",\"params\":[0]},{\"name\":\"Sleep_Manager\",\"params\":[true,false,1]}]}"

// ;

// // Set enabled modules
// LoomFactory<
//   Enable::Internet::Disabled,
//   Enable::Sensors::Enabled,
//   Enable::Radios::Disabled,
//   Enable::Actuators::Disabled,
//   Enable::Max::Disabled
// > ModuleFactory{};

// LoomManager Loom{ &ModuleFactory };

#define swA_Pin 1
#define swB_Pin 14
#define C_Pin 0
#define D_Pin 6
#define E_Pin 18
#define F_Pin 20
#define G_Pin 21
#define H_Pin 15

bool swA_Flag = false; 
bool swB_Flag = false; 
bool C_Flag = false; 
bool D_Flag = false; 
bool E_Flag = false; 
bool F_Flag = false; 
bool G_Flag = false; 
bool H_Flag = false; 


void swA_ISR()
{
  delay(10); 
  if(swA_Flag == false)
  swA_Flag = true; 
}

void swB_ISR()
{
  delay(10); 
  if(swB_Flag == false)
  swB_Flag = true; 
}

void C_ISR()
{
  delay(10); 
  if(C_Flag == false)
  C_Flag = true; 
}

void D_ISR()
{
  delay(10); 
  if(D_Flag == false)
  D_Flag = true; 
}

void E_ISR()
{
  delay(10); 
  if(E_Flag == false)
  E_Flag = true; 
}

void F_ISR()
{
  delay(10); 
  if(F_Flag == false)
  F_Flag = true; 
}

void G_ISR()
{
  delay(10); 
  if(G_Flag == false)
  G_Flag = true; 
}

void H_ISR()
{
  delay(10); 
  if(H_Flag == false)
  H_Flag = true; 
}




void setup() {
  // put your setup code here, to run once:

  Loom.begin_serial(true);
  Loom.parse_config(json_config);

  pinMode(swA_Pin, INPUT_PULLUP); 
  pinMode(swB_Pin, INPUT_PULLUP); 
  pinMode(C_Pin, INPUT_PULLUP); 
  pinMode(D_Pin, INPUT_PULLUP); 
  pinMode(E_Pin, INPUT_PULLUP); 
  pinMode(F_Pin, INPUT_PULLUP);
  pinMode(G_Pin, INPUT_PULLUP); 
  pinMode(H_Pin, INPUT_PULLUP);

  //Loom.InterruptManager().register_ISR(F_Pin, F_ISR, FALLING , ISR_Type::IMMEDIATE);



//   Loom.InterruptManager().register_ISR(swA_Pin, swA_ISR, FALLING , ISR_Type::IMMEDIATE);


//   Loom.InterruptManager().register_ISR(swB_Pin, swB_ISR, FALLING, ISR_Type::IMMEDIATE);

//   Loom.InterruptManager().register_ISR(C_Pin, C_ISR, FALLING , ISR_Type::IMMEDIATE);

//   Loom.InterruptManager().register_ISR(D_Pin, D_ISR, FALLING  , ISR_Type::IMMEDIATE);


// //Loom.InterruptManager().register_ISR(E_Pin, E_ISR, FALLING , ISR_Type::IMMEDIATE);

 attachInterrupt(digitalPinToInterrupt(swA_Pin), swA_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(swB_Pin), swB_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(C_Pin), C_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(D_Pin), D_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(E_Pin), E_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(F_Pin), F_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(G_Pin), G_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(H_Pin), H_ISR, FALLING);




}

void loop() {
  // put your main code here, to run repeatedly:

  if(swA_Flag == true) 
  {
    delay(5); 
    Serial.println("Switch A has been Pressed"); 
    swA_Flag = false; 
  }

  if(swB_Flag == true) 
  {
    delay(5);
    Serial.println("Switch B has been Pressed"); 
    swB_Flag = false; 
  }

  if(C_Flag == true) 
  {
    delay(5);
    Serial.println("Switch C has been Pressed"); 
    C_Flag = false; 
  }

  if(D_Flag == true) 
  {
    delay(5);
    Serial.println("Switch D has been Pressed"); 
    D_Flag = false; 
  }

  if(E_Flag == true) 
  {
    delay(5);
    Serial.println("Switch E has been Pressed"); 
    E_Flag = false; 
  }

  if(F_Flag == true) 
  {
    delay(5);
    Serial.println("Switch F has been Pressed"); 
    F_Flag = false; 
  }

    if(G_Flag == true) 
  {
    delay(5);
    Serial.println("Switch G has been Pressed"); 
    G_Flag = false; 
  }

    if(H_Flag == true) 
  {
    delay(5);
    Serial.println("Switch H has been Pressed"); 
    H_Flag = false; 
  }

  //Serial.println("Test"); 

}
