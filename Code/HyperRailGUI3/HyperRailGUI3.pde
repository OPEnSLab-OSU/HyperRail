 /*****************************************************************************
 *Openly Published Environmental Sensing Lab
 *Oregon State University
 *Written by: Jose Manuel Lopez Alcala
 *Winter 2018
 *
 *                            HyperRail GUI
 *
 *This code was modified from the HyperRail original code
 *This system's default will be 1/16 microstepping or 6400 steps per revolution
 *using a 0.9 degree/step motor
 *
 ******************************************************************************/


/****************************************
*********Importing Libraries*************
****************************************/
import controlP5.*;//GUI
import processing.serial.*;//Serial
import cc.arduino.*;

/****************************************
*********Declaring instances*************
****************************************/
ControlP5 HyperGUI; // GUI instance
Serial myPort;//The serial port
Arduino arduino;

/****************************************
*****Declare variable for functions******
****************************************/
boolean arduino_ready = false;//Wether we've heard from the microcontroller
boolean data_ready = false;//Whether or not all the inputs are in
boolean length_input = false;
boolean radius_input = false;
boolean distance_input = false;
boolean go_to_location_safe = false;
boolean intervals = false;


String railLength = "";// String to hold the rail length
String spoolRadius = "";//String to hold the radius of spool
String velocity_str = "";//String to hold the velocity of the carriage
String d_steps_str = "";//string steps to move a distance d
String d_distance_str = "";//string distance to move from relative position
String total_Steps_str = "";//String total steps
String delay_time_str = "" ;//delay time string version
String option_str = "";//String version of option
String current_step_str = "";//sting version of current step
String running_steps_str = "";//string version of the actual steps the motors will move
String desired_location_str = "";//string version of the desired location
String distance_interval_str = "";// string version fo the distance interval
String hyperspectral_activated = "0"; // toggle the hyperspectral camera data collection



float path_Length = 0; // length of rail in milllimeters
float spool_Radius = 0;// Radius of the spool that is holding the line
float velocity_var = 0 ;// velocity of the carriage
float RPM = 0;// RPM of the HyperRail
float d_distance = 0;//distance to move from relative position in mm
float desired_location = 0;// desired location in meters
float distance_interval = 0;// distance invertal at which the rail will move

int total_Steps = 0; // This is the total number of steps to travel the HyperRail
int d_steps = 0; //This is the steps to move a distance d
int delay_time = 0;//delay for pulses used for moving the motor
int x = 0; //counting variable;
int option = 0;//option variable
int current_step = 0;//current step
int running_steps = 0;//actual steps the motor will turn

final int steps_per_revolution = 6180;






void setup()
{

  /*************************************************
   *******This is the Arduino serial setup**********
   ************************************************/
  // Prints out the available serial ports.
  println(Serial.list());

  // Modify this line, by changing the "0" to the index of the serial
  // port corresponding to your Arduino board (as it appears in the list
  // printed by the line above)
  myPort = new Serial(this, Serial.list()[1], 9600);

  // Alternatively, use the name of the serial port corresponding to your
  // Arduino (in double-quotes), as in the following line.
  //arduino = new Arduino(this, "/dev/tty.usbmodem1421", 9600);



  /*******************************************************
   ***********Here is the setup for the GUI***************
   ******************************************************/
  size(900, 600);
  PFont font = createFont("Arial", 15);
  //Initilize the new instance
  HyperGUI = new ControlP5(this);


  //******************Slider*************************
  //HyperGUI.addSlider("Position", 0,path_Length, 1, 100, 400, 700, 20);
  HyperGUI.addSlider("Position")
    .setSize(700,20)
    .setPosition(100,225)
    .setRange(0,1)
    .setValue(0)
    //.setNumberOfTickMarks(21)
    ;


  //*****************Rail Lenght Input Box***********
  HyperGUI.addTextfield("Rail_Length")
    .setPosition(75, 20)
    .setSize(200, 40)
    .setFont(font)
    .setFocus(true)
    .setColor(color(240, 255, 255))
    ;

  //*****************Radius Diameter Input Box ***********
  //This is the input text box for the spool Radius/Diameter
  HyperGUI.addTextfield("Spool_Radius")
    //.setValue(10)//This will be the default 10mm
    .setPosition(350, 20)
    .setSize(200, 40)
    .setFont(font)
    .setFocus(true)
    .setColor(color(240, 255, 255))
    ;

  //*****************Velocity Input Box ***********
  HyperGUI.addTextfield("Velocity")
    .setPosition(625, 20)
    .setSize(200, 40)
    .setFont(font)
    .setFocus(true)
    .setColor(color(240, 255, 255))
    ;

  //*****************Go To Location Input Box ***********
  HyperGUI.addTextfield("Go_to_location")
    .setPosition(550, 275)
    .setSize(100, 40)
    .setFont(font)
    .setFocus(true)
    .setColor(color(240, 255, 255))
    ;

  //*****************Move Distance Input Box ***********
  HyperGUI.addTextfield("Distance")
    .setPosition(225, 275)
    .setSize(100, 40)
    .setFont(font)
    .setFocus(true)
    .setColor(color(240, 255, 255))
    ;

  //******************* Interval Distance Input Box*********
  HyperGUI.addTextfield("interval")
  .setPosition(175,390)
  .setSize(100,40)
  .setFont(font)
  .setFocus(true)
  .setColor(color(240,255,255))
  ;

  //*****************Travel Option Button***********
  //This is the button for the "Travel" option
  HyperGUI.addBang("Travel")
    .setPosition(125, 150)
    .setSize(100, 40)
    .getCaptionLabel().align(ControlP5.CENTER, ControlP5.CENTER)
    ;

  //*****************End of Rail Option Button***********
  HyperGUI.addBang("End_of_Rail")
    .setPosition(400, 150)
    .setSize(100, 40)
    .getCaptionLabel().align(ControlP5.CENTER, ControlP5.CENTER)
    ;

  //*****************Start of Rail Option Button***********
  HyperGUI.addBang("Start_of_Rail")
    .setPosition(675, 150)
    .setSize(100, 40)
    .getCaptionLabel().align(ControlP5.CENTER, ControlP5.CENTER)
    ;

  //*****************Go to Location Option Button***********
  HyperGUI.addBang("Go")
    .setPosition(700, 275)
    .setSize(100, 40)
    .getCaptionLabel().align(ControlP5.CENTER, ControlP5.CENTER)
    ;

  //****************Move Back Button ************************
  HyperGUI.addBang("Back")
  .setPosition(100,275)
  .setSize(100,40)
  .getCaptionLabel().align(ControlP5.CENTER, ControlP5.CENTER)
  ;

  //********************Move Forward Button*********************
  HyperGUI.addBang("Forward")
  .setPosition(350, 275)
  .setSize(100,40)
  .getCaptionLabel().align(ControlP5.CENTER, ControlP5.CENTER)
  ;

  //******************* Interval Toggle Button******************
  HyperGUI.addToggle("Interval_ON_OFF")
  .setPosition(75,400)
  .setSize(70,20)
  ;

  HyperGUI.addToggle("HyperSpectral_Camera")
  .setPosition(400,400)
  .setSize(20,20)
  ;


  println("GUI setup complete.");


  textFont(font);
}

void draw()
{
  background(0);

  //This will update the text on the screen automatically RAIL LENGTH
  //in METERS
  text("Current Rail Length: " + (path_Length/1000) + " m", 75, 120);

  //This will update the text on the screen automatically for RADIUS
  text("Current Spool Radius: " + spool_Radius + " mm", 350, 120);

  //This will update the text on the screen automatically for VELOCITY
  //This also uses the velocit_str instead of velocity_var because
  //otherwise the user would see the compensated version
  text("Current Velocity: " + velocity_str + " mm/sec", 625, 120);

  //This will update the text on the screen automaticaly for Distance(MM)
  text("Current Distance:  " + d_distance + " mm", 225, 350);

  //This will update the text on the screen automaticall for the intevals(meters)
  text("Current Interval: " + distance_interval + " m", 175, 465);



  //println("Arduino is: " + arduino_ready);// for testing

  if(arduino_ready == true){
    text("Microcontroller is READY!", 650, 550);
  }else{
    text("Busy or not connected.",650,550);
  }


  HyperGUI.getController("Position").setValue(distance_from_origin(current_step));
}



/************************Function: transmit_Data()*******************
 * Description: This function will be in charge of sending the inputs
 *              over to the arduino
 * Parameters: None
 * Return: void
 ****************************************************************/
void transmit_Data(String option, String steps, String delay)
{
  //if microntroller is ready...
  if (arduino_ready && data_ready)
  {
    String msg = "[O:" + option + ",S:" + steps + ",D:" +delay + ",H:" +hyperspectral_activated + "]";
    println("What is being sent: " + msg);
    myPort.write(msg);
    arduino_ready = false;// reset the status the arduino to false until it responds back
  }else if(arduino_ready == false){
    println("Microcontroller is not ready; wait for it to be done.");
  }

}


/************************Function:dataReady()*******************
 * Description: This will check to make sure that the data is readys
 *              to be transmitted
 * Parameters: option, total steps, and delay time
 * Return: boolean(wheter or not the data is ready to  be sent)
 ****************************************************************/
boolean dataReady(String option, String steps, String delay)
{
  if (option.equals("0") == false && steps.equals("0") == false && delay.equals("0") == false)
  {
    return true;
  }

  return false;

}


/************************Function: serialEvent()*******************
 * Description: This function will be checking the serial port
 *              to see if the micrcontroller is ready
 * Parameters: Serial myPort
 * Return: void
 ****************************************************************/
void serialEvent(Serial myPort)
{

  char inChar = myPort.readChar();
  //print("From serial port: " );// for testing
  print(inChar);// for testing

  if (arduino_ready == false)//false if we haven't heard from the arduino/microcontroller
  {
    if (inChar == 'R')
    {
      myPort.clear();
      //myPort.readChar();
      arduino_ready = true;
    }
  }
}

/************************Function: Travel()*******************
 * Description: This function will be called to set the option to
 *               number one.
 * Parameters: None
 * Return: void
 ****************************************************************/
public void Travel()
{
  println("Option 1 was selected");//for testing
  option = 1;
  option_str = str(option);//String version of option
  println("Option 1: " + option);// for testing

  if(current_step == 0 && arduino_ready){
    running_steps = total_Steps;
    running_steps_str = total_Steps_str;
    data_ready = dataReady(option_str, running_steps_str, delay_time_str);
    println("Data ready: " + data_ready);// for testing
    transmit_Data(option_str, running_steps_str, delay_time_str);
    current_step = 0;//just to make sure.
    arduino_ready = false;
  }

}

/************************Function:End_of_Rail()*******************
 * Description: This function will be called to set the option to
 *               number two.
 * Parameters: None
 * Return: void
 ****************************************************************/
public void End_of_Rail()
{
  println("Option 2 was selected");//for testing
  option = 2;
  option_str = str(option);//String version of option

  int steps_to_end = total_Steps-current_step;//relative to the current position
  if(steps_to_end != 0 && arduino_ready){
    println("steps_to_end: " + steps_to_end);
    running_steps_str = str(steps_to_end);
    running_steps = steps_to_end;

    data_ready = dataReady(option_str, running_steps_str, delay_time_str);
    transmit_Data(option_str, running_steps_str, delay_time_str);
    current_step = total_Steps;//This is when the carriage is all the way at the end
    arduino_ready = false;
  }else{
    println("You are already at the end.");
  }


}

/************************Function:Start_of_Rail()*******************
 * Description: This function will be called to set the option to
 *              number three.
 * Parameters: None
 * Return: void
 ****************************************************************/
public void Start_of_Rail()
{
  println("Option 3 was selected");//for testing
  option = 3;
  option_str = str(option);//String version of option

  if(current_step != 0 && arduino_ready){
    running_steps_str = str(current_step);
    running_steps = current_step;

    data_ready = dataReady(option_str, running_steps_str, delay_time_str);
    transmit_Data(option_str, running_steps_str, delay_time_str);
    current_step = 0;
    arduino_ready = false;
  }else{
    println("You are already at the start.");
  }


}

/************************Function:Back()*******************
 * Description: This function will be called to set the option to
 *              number four.
 * Parameters: None
 * Return: void
 ****************************************************************/
public void Back(){
  println("Option 4 was selected");// for testing
  option = 4;
  option_str = str(option);//string version of option

  if( (current_step - running_steps ) >= 0 && arduino_ready){
    data_ready = dataReady(option_str, running_steps_str, delay_time_str);
    transmit_Data(option_str, running_steps_str, delay_time_str);
    current_step -= running_steps;//This will update the carriages location
    arduino_ready = false;
  }else{
    println("You are going to hit the motor. I will not move.");
  }


}

/************************Function:Forward()*******************
 * Description: This function will be called to set the option to
 *              number four.
 * Parameters: None
 * Return: void
 ****************************************************************/
public void Forward(){
  println("Option 5 was selected");// for testing
  option = 5;
  option_str = str(option);//string version of option
  if((current_step + running_steps) <= total_Steps && arduino_ready){
    data_ready = dataReady(option_str, running_steps_str, delay_time_str);
    transmit_Data(option_str, running_steps_str, delay_time_str);
    current_step += running_steps;//This will update the carriages location
    arduino_ready = false;
  }else{
    println("You are going to hit the end. I will not move.");
  }


}

/************************Function: Velocity()*******************
 * Description: This function will get the value input from the
 *              the textbox and then update the corresponding string
 *              variable and float value. The parameter passed to the function
 *              will be compensated for in this function using a linear function.
 * Parameters: string theVelocity ( should be in mm/s)
 * Return: void
 ****************************************************************/
public void Velocity(String theVelocity)
{
  println("The velocity has changed to: " + theVelocity);
  velocity_str = theVelocity; // sets the string variable to the input
  println("Velocity String: "  + velocity_str);//for testing

  if( float(theVelocity) <= 10.0 ){
    //2nd order compensatoin
    velocity_var = (1.0/2.0) *(9933 - sqrt(98664573-40000*float(theVelocity)));
    println("velocity_var: " + velocity_var);// for testing
  }else{

    /*
    //1st order compensation (only use one, comment other out)
    velocity_var = (float(theVelocity)-0.3815)/0.9716;// converts the string to float and compensates
    println("velocity_var: " + velocity_var);// for testing
    */

    //2nd order compensation (only use one, comment other out)(better and 1st order)
    velocity_var = 2474 - sqrt( (12241855/2) - (5000*float(theVelocity)));
    println("velocity_var: " + velocity_var);// for testing

  }

  RPM = speed_to_RPM( velocity_var, spool_Radius);//this will update the RPM

  delay_time = RPM_to_Time(RPM);//This is where the delay time gets calculated
  delay_time_str = str(delay_time);//delay time string version
}


/*************************Function: Rail_Length()*****************
 * Description: This function will get the value input from the
 *              textbox and then update the corresponding string
 *              variable and float value
 * Parameters: string theLength
 * Return: VOID
 ******************************************************************/
public void Rail_Length(String theLength)
{
  println("The rail length changed to: "  + theLength);
  railLength = theLength;//sets the parameter input to the string variable
  println(" Length String: " + railLength);//for testing

  //This section of the code will update the length variable
  path_Length = float(theLength) * 1000;//converts it to a float and mm
  println("This is the path length: " + path_Length);

  length_input = true;//lets the program know that it has a length input

  HyperGUI.getController("Position").setMax(path_Length);//updates the max value of the slider
  //println("I made it here");//testing

  //The followin line updates the steps of the rail
  updateSteps(length_input, radius_input, path_Length, spool_Radius);
}



/*************************Function: Spool_Radius()*****************
 * Description: This function will get the value input from the
 *              textbox and then update the corresponding string
 *              variable and float value
 * Parameters: string theLength
 * Return: VOID
 ******************************************************************/
public void Spool_Radius(String theRadius)
{
  println("The spool radius changed to: "  + theRadius);
  spoolRadius = theRadius;//sets the parameter input to the string variable
  println("String: " + spoolRadius);//for testing
  //This section of the code will update the length variable
  spool_Radius = float(theRadius);// converts it to a string
  println("This is the spool radius: " + spool_Radius);

  radius_input = true;

  updateSteps(length_input, radius_input, path_Length, spool_Radius);
}

/*************************Function: Distance()*****************
 * Description: This function will get the value input from the
 *              textbox and then update the corresponding string
 *              variable and float value
 * Parameters: string theDistance
 * Return: VOID
 ******************************************************************/
public void Distance(String theDistance){
  println("The distance changed to: "  + theDistance);
  d_distance_str = theDistance;//sets parameter input ot the string variable
  //This section of the code will update the d_distance variable
  d_distance = float(theDistance);//converts string
  println("This is the distance to move: " + d_distance);

  distance_input = true;

  d_steps = move_distance_steps(d_distance);
  d_steps_str = str(d_steps);
  running_steps = d_steps;
  running_steps_str = d_steps_str;
}

/*************************Function: go_to_location()*****************
 * Description: This function will get the value from input box and then
                 update the corresonding string variable and float value
 * Parameters: string thelocation
 * Return: VOID
 ******************************************************************/
 public void Go_to_location(String theLocation){
   println("The desired location changed to: " + theLocation);
   desired_location_str =theLocation;
   //This section of the code will update the desired_locaiton float variable
   desired_location = float(theLocation);
   println("This is the desired location: " + desired_location);
 }

 /*************************Function: interval()*****************
  * Description: This function will get the value from input box and then
                  update the corresonding string variable and float value
  * Parameters: string theInterval
  * Return: VOID
  ******************************************************************/
  public void interval(String theInterval){

    //println( float(theInterval));//for testing
    //println( path_Length);//for testing

    if(float(theInterval)*1000 <= path_Length )  {
      println("The desired interval change to: " + theInterval);
      distance_interval_str = theInterval;
      distance_interval = float(theInterval);
      println("This is the interval: " + distance_interval);
    }else{
      println("The interval is larger than the rail length. Try something else.");
    }




  }





/************************Function: stepsper_length()*****************************
 *Description:This function will return the total number of steps that will
 *            be required to travel the whole length of the rail.
 * Parameters:
 *      *float path_length: is the length of the path that the
 *                          carriage will travel
 *      *spool_radius: is the radius of the spool holding the line
 *                     that is running the whole system.
 */
void stepsper_length(float path_Length, float spool_Radius)
{

  /*Serial.print("This is the path_length: ");//For testing
   Serial.println(path_length);// for testing
   Serial.print("This is the spool_radius: " );//for testing
   Serial.println(spool_radius);//For testing
   long steps_numerator = (long)6400 * (long)path_length;// for testing
   Serial.println(steps_numerator);//for testing*/
  float steps = ( steps_per_revolution  * path_Length)/(2 * 3.1415926535 * spool_Radius); // 6400 steps for 1 rev
  print("These are the total steps (inside function): " );//For testing
  println(steps);//For testing

  print("These are the steps assigned to total_steps:  " );
  total_Steps = int(steps); //------- THIS is where the total steps actually get updated.
  println(total_Steps);

  total_Steps_str = str(total_Steps);//String version of total_steps

  //return (int)steps; //Returns the steps needed for travel
}

/*******************Function: updateSteps()*******************
 * Description: This function will check if the rail length and the
 *              spool radius have a value(set to true) and if they do, then
 *             it will update the totals steps to travel the rail
 * Paramters: Boolean rail length input, boolean radius input
 * Returns: Void
 * Post-Conditions: Updated value of total steps
 ****************************************************************/
void updateSteps(boolean length_input, boolean radius_input, float path_Length, float spool_Radius)
{
  if (length_input == true && radius_input == true)
  {
    stepsper_length(path_Length, spool_Radius);
  } else
  {
    println("Can't update total steps. Either rail_length or radius input is  missing.");
  }
}

/****************Function: speed_to_RPM()*********************************
 *Description: This funtion will convert the input velocity into RPM
 *              so that the program can compute the delay time for each step
 *              needed to achive the desired speed.
 * Parameters: float velocity in mm/sec
 * Returns: float value of RPM
 */
float speed_to_RPM(float velocity, float spool_Radius )
{
  float RPM = 0;
  RPM = (velocity * 60)/(2 * 3.1415926535 * spool_Radius);
  println("RPM: " + RPM);//for testing

  return RPM;
}

/************************************ Function: RPM_to_Time()*******************************
 * Description: This function will convert the RPM to the corresponding time required for that speed
 * Parameters:
 *RPM: This parameter will come from a variable
 * Return:It will return an int corresponding to the time requried for the input RPM
 */
int RPM_to_Time(float RPM)
{
  //print("This is the value of rpm: " );//for testing
  println(RPM);//for testing
  //float denominator = RPM * 6400;//for testing
  //print("This is the value of the denominator: " ) ;//for testing
  //println(denominator);//for testing

  float delay_time = ((60)/(RPM * steps_per_revolution ) * pow(10, 6))/2;

  //println("Delay_time: " + delay_time);//for testing
  println("Delay_time: " + int(delay_time));
  return int(delay_time);
}

/**************************** Function: move_distance_steps()**************************************
* Description: This function will set the steps needed to move the HyperRail a certain distance
*              relative to its position.
* Parameters:
*        * int d, distance to move in mm
* Return: int
*/
int move_distance_steps(float d)
{
  float temp_steps =1/( velocity_var*60/(d*RPM*steps_per_revolution )) ;//conversion to steps
  println("d_steps: " + (int)temp_steps);//for testing
  return (int)temp_steps;
}

/**************************** Function: distance_from_origin()**************************************
* Description: This function will calculate the distance from the begining of the rail in mm.
* Parameters:
*        * int current steps, the step at which it is currently located
* Return: float
*/
int distance_from_origin(int current_step){
  //The returned value is rounded up
  return ceil(((current_step*2*3.1415926535*spool_Radius)/steps_per_revolution));
}


/**************************** Function: distance_to_steps()**************************************
* Description: this function will take a distance, relative from the origin, and return the locaiton in
*              steps.
* Parameters:
*        * float d, the desired distance from origin in meters
* Return: int, the equivalent steps for that distance.
*/

public int distance_to_steps(float d){

  float steps = (d * 1000 *  steps_per_revolution)/(2 * 3.141592635 * spool_Radius);// Multiplied by 1000 to convert to mm
  if(steps <= total_Steps){
    go_to_location_safe = true;
  }

  return int(steps);
}


/**************************** Function: go()**************************************
* Description: This function will move the carriage from the current location to the desired
*              location.
* Parameters: NONE
* Return: void
* Post-Condition: The carriage should be at the desired location.
*/
public void Go(){

  int desired_location_step = distance_to_steps(desired_location);

  running_steps = desired_location_step - current_step;
  running_steps_str = str(running_steps);

  if(go_to_location_safe == true){
    if( running_steps > 0){
      Forward();
      go_to_location_safe = false;
    }else if ( running_steps < 0){
      Back();
      go_to_location_safe = false;
    }else{
      print("You are already at location");
      go_to_location_safe = false;
    }
  }else{
    print("The desired location is out of bounds");
    go_to_location_safe = false;
  }

}

/**************************** Function: Interval_ON_OFF()**************************************
* Description: This function will be automatically when the interval toggle button is
*              set to the one state
* Parameters: NONE
* Return: void
* Post-Condition: Boolean value for interval should be true
*/
public void Interval_ON_OFF(boolean theFlag){
  if(theFlag == true){
    intervals = true;
    println(intervals);// for testing
  }else{
    intervals = false;
    println(intervals);//for testing
  }
}

/**************************** Function: HyperSpectral_Camera()**************************************
* Description: This function will be automatically when the hyperspectral camera toggle button is
*              set to the one state
* Parameters: NONE
* Return: void
* Post-Condition: Boolean value for interval should be true
*/

public void HyperSpectral_Camera(boolean theFlag) {
   
  if (theFlag) {
    hyperspectral_activated = "1";
  }
  else {
    hyperspectral_activated = "0";
  }
  println(hyperspectral_activated); //for testing

}
