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

//Importing Libraries
import controlP5.*;//GUI
import processing.serial.*;//Serial

//Declaring instances
ControlP5 HyperGUI; // GUI instance
Serial myPort;//The serial port 


import cc.arduino.*;

Arduino arduino;


//Declare variable for functions
boolean arduino_ready = false;//Wether we've heard from the microcontroller
boolean data_ready = false;//Whether or not all the inputs are in 

String railLength = "";// String to hold the rail length
String spoolRadius = "";//String to hold the radius of spool
String velocity_str = "";//String to hold the velocity of hte carriage

float path_Length = 0; // length of rail in meters
float spool_Radius = 0;// Radius of the spool that is holding the line
float velocity_var = 0 ;// velocity of the carriage 


int total_Steps = 0; // This is the total number of steps to travel the HyperRail
String total_Steps_str = "";//String total steps
float RPM = 0;// RPM of the HyperRail


int delay_time = 0;//delay for pulses used for moving the motor
String delay_time_str = "" ;//delay time string version


boolean length_input = false;
boolean radius_input = false;

int x = 0; //counting variable;

int option = 0;//option variable
String option_str = "";//String version of option



void setup()
{
  /*************************************************
   *This is the Arduino serial setup  
   **************************************************/
  // Prints out the available serial ports.
  println(Serial.list());

  // Modify this line, by changing the "0" to the index of the serial
  // port corresponding to your Arduino board (as it appears in the list
  // printed by the line above).
  myPort = new Serial(this, Serial.list()[0], 9600);

  // Alternatively, use the name of the serial port corresponding to your
  // Arduino (in double-quotes), as in the following line.
  //arduino = new Arduino(this, "/dev/tty.usbmodem1421", 9600);



  /*******************************************************
   *Here is the setup for the GUI
   *********************************************************/
  size(900, 600);
  PFont font = createFont("Arial", 15);
  //Initilize the new instance
  HyperGUI = new ControlP5(this);

  //******************Slider*************************
  Slider position = HyperGUI.addSlider("Position", 0, 1000, 1, 100, 400, 700, 20);

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
  HyperGUI.addTextfield("Go to location")
    .setPosition(75, 500)
    .setSize(200, 40)
    .setFont(font)
    .setFocus(true)
    .setColor(color(240, 255, 255))
    ;

  //*****************Travel Option Button***********
  //This is the button for the "Travel" option
  HyperGUI.addBang("Travel")
    .setPosition(150, 200)
    .setSize(100, 40)
    .getCaptionLabel().align(ControlP5.CENTER, ControlP5.CENTER)
    ;

  //*****************End of Rail Option Button***********
  HyperGUI.addBang("End_of_Rail")
    .setPosition(400, 200)
    .setSize(100, 40)
    .getCaptionLabel().align(ControlP5.CENTER, ControlP5.CENTER)
    ;

  //*****************Start of Rail Option Button***********
  HyperGUI.addBang("Start_of_Rail")
    .setPosition(650, 200)
    .setSize(100, 40)
    .getCaptionLabel().align(ControlP5.CENTER, ControlP5.CENTER)
    ;

  //*****************Go to Location Option Button***********
  HyperGUI.addBang("GO!")
    .setPosition(300, 500)
    .setSize(100, 40)
    .getCaptionLabel().align(ControlP5.CENTER, ControlP5.CENTER)
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
  text("Current Velocity: " + velocity_var + " mm/sec", 625, 120);

  //println("Arduino is: " + arduino_ready);// for testing
}
/************************Function: transmit_Data()*******************
 * Description: This function will be in charge of sending the inputs over
 *              over to the arduino
 * Parameters: None
 * Return: void
 ****************************************************************/
void transmit_Data()
{
  //if microntroller is ready...
  if (arduino_ready && data_ready)
  {
    String msg = "[O:" + option_str + ",S:" +  total_Steps_str + ",D:" +delay_time_str + "]";
    println("What is being sent: " + msg);
    myPort.write(msg);
    arduino_ready = false;// reset the status the arduino to false until it responds back
  }
}

/************************Function:dataReady()*******************
 * Description: This will check to make sure that the data is ready
 *              to be transmitted
 * Parameters: option, total steps and delay time
 * Return: boolean(wheter or not the data is ready to  be sent
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
 * Description: This function will be checkging the serial port 
 *              to see if the micrcontroller is ready 
 * Parameters: Serial myPort
 * Return: void 
 ****************************************************************/
void serialEvent(Serial myPort)
{
  char inChar = myPort.readChar();
  print(inChar);// for testing

  if (arduino_ready == false)
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

  data_ready = dataReady(option_str, total_Steps_str, delay_time_str);
  println("Data ready: " +data_ready);
  transmit_Data();
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

  data_ready = dataReady(option_str, total_Steps_str, delay_time_str);
  transmit_Data();
}

/************************Function:Start_of_Rail()*******************
 * Description: This function will be called to set the option to
 *               number three. 
 * Parameters: None
 * Return: void 
 ****************************************************************/
public void Start_of_Rail()
{
  println("Option 3 was selected");//for testing
  option = 3;
  option_str = str(option);//String version of option

  data_ready = dataReady(option_str, total_Steps_str, delay_time_str);
  transmit_Data();
}


/************************Function: Velocity()*******************
 * Description: This function will get the value input from the 
 *              the textbox and then update the corresponding string
 *              variable and float value
 * Parameters: string theVelocity ( should be in mm/s)
 * Return: void 
 ****************************************************************/
public void Velocity(String theVelocity)
{
  println("The velocity has changed to: " + theVelocity);
  velocity_str = theVelocity; // sets the string variable to the input
  println("Velocity String: "  + velocity_str);//for testing

  //This section of the code will upadte the velocity variable
  velocity_var = float(theVelocity);// converts the string to float

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
  float steps = ( 6400 * path_Length)/(2 * 3.1415926 * spool_Radius); // 6400 steps for 1 rev
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
 *              spool radius have an input and if they do, then
 *             it will update the totals steps to travel the rail
 * Paramters: Boolean rail length input, boolean radius input
 * Returns: Void, but updates the value of the total steps 
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
  RPM = (velocity * 60)/(2 * 3.1415926 * spool_Radius);
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

  float delay_time = ((60)/(RPM * 6400) * pow(10, 6))/2;//--------------> THi was the last edit you made ( divided everyting by 2)

  //println("Delay_time: " + delay_time);//for testing
  println("Delay_time: " + int(delay_time));
  return int(delay_time);
}