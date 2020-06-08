#define A_Pin 1
#define B_Pin 14
#define C_Pin 0
#define D_Pin 6
#define E_Pin 18
#define F_Pin 20
#define G_Pin 21
#define H_Pin 15

bool A_Flag = false; 
bool B_Flag = false; 
bool C_Flag = false; 
bool D_Flag = false; 
bool E_Flag = false; 
bool F_Flag = false; 
bool G_Flag = false; 
bool H_Flag = false; 


void A_ISR()
{
  if(A_Flag == false)
  A_Flag = true; 
}

void B_ISR()
{
 if(B_Flag == false)
  B_Flag = true; 
}

void C_ISR()
{
  if(C_Flag == false)
  C_Flag = true; 
}

void D_ISR()
{
  if(D_Flag == false)
  D_Flag = true; 
}

void E_ISR()
{
  if(E_Flag == false)
  E_Flag = true; 
}

void F_ISR()
{
  if(F_Flag == false)
  F_Flag = true; 
}

void G_ISR()
{
  if(G_Flag == false)
  G_Flag = true; 
}

void H_ISR()
{
  if(H_Flag == false)
  H_Flag = true; 
}




void setup() {

  Serial.begin(9600); 

  pinMode(A_Pin, INPUT_PULLUP); 
  pinMode(B_Pin, INPUT_PULLUP); 
  pinMode(C_Pin, INPUT_PULLUP); 
  pinMode(D_Pin, INPUT_PULLUP); 
  pinMode(E_Pin, INPUT_PULLUP); 
  pinMode(F_Pin, INPUT_PULLUP);
  pinMode(G_Pin, INPUT_PULLUP); 
  pinMode(H_Pin, INPUT_PULLUP);

 attachInterrupt(digitalPinToInterrupt(A_Pin), A_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(B_Pin), B_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(C_Pin), C_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(D_Pin), D_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(E_Pin), E_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(F_Pin), F_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(G_Pin), G_ISR, FALLING);

 attachInterrupt(digitalPinToInterrupt(H_Pin), H_ISR, FALLING);

}

void loop() {
  // put your main code here, to run repeatedly:

  if(A_Flag == true) 
  {
    delay(5); 
    
    if(digitalRead(A_Pin) == LOW)
    Serial.println("Switch A has been Pressed"); 
    
    A_Flag = false; 
  }

  if(B_Flag == true) 
  {
    delay(5);

    if(digitalRead(B_Pin) == LOW)
    Serial.println("Switch B has been Pressed"); 
    
    B_Flag = false; 
  }

  if(C_Flag == true) 
  {
    delay(5);

    if(digitalRead(C_Pin) == LOW)
    Serial.println("Switch C has been Pressed"); 
    
    C_Flag = false; 
  }

  if(D_Flag == true) 
  {
    delay(5);

    if(digitalRead(D_Pin) == LOW)
    Serial.println("Switch D has been Pressed"); 
    
    D_Flag = false; 
  }

  if(E_Flag == true) 
  {
    delay(5);    
    
    if(digitalRead(E_Pin) == LOW)
    Serial.println("Switch E has been Pressed"); 
    
    E_Flag = false; 
  }

  if(F_Flag == true) 
  {
    delay(5);    
    if(digitalRead(F_Pin) == LOW)
    Serial.println("Switch F has been Pressed"); 
    
    F_Flag = false; 
  }

    if(G_Flag == true) 
  {
    delay(5);   
    if(digitalRead(G_Pin) == LOW)
    Serial.println("Switch G has been Pressed"); 
    
    G_Flag = false; 
  }

    if(H_Flag == true) 
  {
    delay(5);    
    if(digitalRead(H_Pin) == LOW)
    Serial.println("Switch H has been Pressed"); 
    
    H_Flag = false; 
  }

  //Serial.println("Test"); 

}
