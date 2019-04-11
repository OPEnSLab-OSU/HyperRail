function loadConfigList() {
	$.getJSON("/configs/list", (data) => {	//Load the list of configurations
		var configs = "";
		if(data.length > 0) {
			for(var i = 0; i < data.length; i++)		//Create an option for each configuration file found
				configs += "<option>"+data[i].slice(0, -5)+"</option>";
		}
		else { //If none were found
			configs = "<option value=-1>None Found</option>";
		}
		$("#configList > *").replaceWith("");	//Remove the old configuration list from the page
		$("#configList").append($(configs));	//Append the new configuration list to the page
	}).done(loadConfig);
}



function createConfig() {
	var err = "";	//Strings to store error messages
	var optErr = "";
	var numErr = "";
	
	if($("#intervalFlag").prop("checked") == false)	//Convert Interval flag checkbox status to integer
		var intervalFlag = 0;
	else
		var intervalFlag = 1;
	
	if($.trim($("#configName").val()) == "")		//Check if the Config Name is empty
		err = "Config Name, ";
		
	if($("#option").val() == "")					//Check if the option number is empty
		err += "Option, ";
	else if ($("#option").val() < 1 || $("#option").val() > 5)	//If not empty, check if it is between 1 and 5
		optErr = "Option must be an integer between 1 and 5.\n";
	
	if($("#railLength").val() == "")				//Check if the Rail Length is empty
		err += "Rail Length, ";
	else if ($("#railLength").val() <= 0)			//If not empty, check if it is 0 or less
		numErr += "Rail Length, ";
	
	if($("#spoolRadius").val() == "")				//Check if the Time between Steps is empty
		err += "Spool Radius, ";
	else if ($("#spoolRadius").val() <= 0)			//If not empty, check if it is 0 or less
		numErr += "Spool Radius, ";
		
	if($("#velocity").val() == "")					//Check if the Time between Steps is empty
		err += "Velocity, ";
	else if ($("#velocity").val() <= 0)				//If not empty, check if it is 0 or less
		numErr += "Velocity, ";
	
	if(intervalFlag == 1){	//Interval settings only matter if intervals are used
		if($("#stops").val() == "")					//Check if the Number of Intervals is empty
			err += "Number of Intervals, ";
		else if ($("#stops").val() <= 0)			//If not empty, check if it is 0 or less
			numErr += "Number of Intervals, ";
		
		if($("#intervalDistance").val() == "")		//Check if the Steps per Intervals is empty
			err += "Distance per Interval, ";
		else if ($("#intervalDistance").val() <= 0)	//If not empty, check if it is 0 or less
			numErr += "Distance per Interval, ";
		
		if($("#timeInterval").val() == "")			//Check if the Time between Intervals is empty
			err += "Time between Intervals, ";
		else if ($("#timeInterval").val() <= 0)		//If not empty, check if it is 0 or less
			numErr += "Time between Intervals, ";
	}

	if(err != "" || numErr != "" || optErr != "") {		//If there were any errors specified
		if(err != ""){
			err = err.slice(0, -2) + " must be specified.";	//Format the error
			if(numErr != "")
				err += "\n";
		}
		if(numErr != "")									//Format number errors
			numErr = numErr.slice(0, -2) + " must be greater than 0.";
		alert(optErr + err + numErr);		//Alert the user
		return;
	}
	
	if($("#luxActivated").prop("checked") == false)		//Convert Lux Sensor flag checkbox status to integer
		var luxActivated = 0;
	else
		var luxActivated = 1;
	
	if($("#co2Activated").prop("checked") == false)		//Convert CO2 Sensor flag checkbox status to integer
		var co2Activated = 0;
	else
		var co2Activated = 1;
	
	if($("#particleActivated").prop("checked") == false)	//Convert Particle Sensor flag checkbox status to integer
		var particleActivated = 0;
	else
		var particleActivated = 1;
	
	if($("#humidityActivated").prop("checked") == false)	//Convert Humidity Sensor flag checkbox status to integer
		var humidityActivated = 0;
	else
		var humidityActivated = 1;
	
	if($("#temperatureActivated").prop("checked") == false)	//Convert Temperature Sensor flag checkbox status to integer
		var temperatureActivated = 0;
	else
		var temperatureActivated = 1;
	
	var info = {	//Object to store ALL data, except config name, and pass to AJAX request
		option: parseInt($("#option").val()),
		railLength: parseFloat($("#railLength").val()),
		spoolRadius: parseFloat($("#spoolRadius").val()),
		velocity: parseFloat($("#velocity").val()),
		intervalFlag: intervalFlag,
		intervalDistance: parseFloat($("#intervalDistance").val()),
		stops: parseInt($("#stops").val()),
		luxActivated: luxActivated,
		co2Activated: co2Activated,
		particleActivated: particleActivated,
		humidityActivated: humidityActivated,
		temperatureActivated: temperatureActivated,
		timeInterval: parseInt($("#timeInterval").val())
	};
	
	$.ajax({
		type: "POST",
		url: "/configs/create",
		contentType: "application/json",
		data: JSON.stringify({	
			configName: $("#configName").val(),
			data: info
		}),
		success: null,
		dataType: "json"
	}).fail(function(){
		alert("Configuration "+$("#configName").val()+" already exists.");	//Alert the user if the config name is already taken
	}).done(function() {	//Once the server is finished creating the configuration
		alert("Configuration "+$("#configName").val()+" created.");
		clearConfig();		//Reset config creation form
		loadConfigList();	//Reload the configuration list on the page
	});
}

//Clear the create configuration form
function clearConfig() {
	$("#configName").val("");
	$("#option").val("");
	$("#railLength").val("");
	$("#spoolRadius").val("");
	$("#velocity").val("");
	
	
	$("#intervalFlag").prop("checked", false);
	$("#stops").val("");
	$("#intervalDistance").val(0);
	$("#timeInterval").val(0);
	
	$("#luxActivated").prop("checked", false);
	$("#co2Activated").prop("checked", false);
	$("#particleActivated").prop("checked", false);
	$("#humidityActivated").prop("checked", false);
	$("#temperatureActivated").prop("checked", false);
}

//Modify Configuration form functions
function loadConfig() {
	$.ajax({
		type: "POST",
		url: "/configs/read",
		contentType: "application/json",
		data: JSON.stringify({	
			configName: $("#configList option:selected").text()
		}),
		success: function(config){	//Once the server is finished loading the config file, fill in the fields
			$("#modifyConfigName").val($("#configList option:selected").text());					//Fill in Config Name field
			$("#modifyConfigName").prop("placeholder", $("#configList option:selected").text());	//Fill in Config Name field placeholder, used in server to delete old file
			$("#modifyOption").val(config.option);					//Fill in Option value
			$("#modifyRailLength").val(config.railLength);			//Fill in Rail Length
			$("#modifySpoolRadius").val(config.spoolRadius);		//Fill in Steps to Traverse Rail
			$("#modifyVelocity").val(config.velocity);				//Fill in Velocity
			
			if(config.intervalFlag == 0)							//Convert Interval Flag integer to checkbox status
				$("#modifyIntervalFlag").prop("checked", false);
			else
				$("#modifyIntervalFlag").prop("checked", true);
			$("#modifyStops").val(config.stops);					//Fill in Number of Intervals
			$("#modifyIntervalDistance").val(config.intervalDistance);	//Fill in Distance per Interval
			$("#modifyTimeInterval").val(config.timeInterval);		//Fill in Time between Intervals
			
			if(config.luxActivated == 0)							//Convert Lux Sensor Flag integer to checkbox status
				$("#modifyLuxActivated").prop("checked", false);
			else
				$("#modifyLuxActivated").prop("checked", true);
		
			if(config.co2Activated == 0)							//Convert CO2 Sensor Flag integer to checkbox status
				$("#modifyCo2Activated").prop("checked", false);
			else
				$("#modifyCo2Activated").prop("checked", true);
		
			if(config.particleActivated == 0)						//Convert Particle Sensor Flag integer to checkbox status
				$("#modifyParticleActivated").prop("checked", false);
			else
				$("#modifyParticleActivated").prop("checked", true);
		
			if(config.humidityActivated == 0)						//Convert Humidity Sensor Flag integer to checkbox status
				$("#modifyHumidityActivated").prop("checked", false);
			else
				$("#modifyHumidityActivated").prop("checked", true);
		
			if(config.temperatureActivated == 0)					//Convert Temperature Sensor Flag integer to checkbox status
				$("#modifyTemperatureActivated").prop("checked", false);
			else
				$("#modifyTemperatureActivated").prop("checked", true);
		},
		dataType: "json"
	});
}


function saveConfig() {
	var err = "";	//Strings to store error messages
	var optErr = "";
	var numErr = "";
	
	if($("#modifyIntervalFlag").prop("checked") == false)	//Convert Interval flag checkbox status to integer
		var intervalFlag = 0;
	else
		var intervalFlag = 1;
	
	if($.trim($("#modifyConfigName").val()) == "")		//Check if the Config Name is empty
		err = "Config Name, ";
		
	if($("#modifyOption").val() == "")					//Check if the option number is empty
		err += "Option, ";
	else if ($("#modifyOption").val() < 1 || $("#modifyOption").val() > 5)	//If not empty, check if it is between 1 and 5
		optErr += "Option must be an integer between 1 and 5.\n";
	
	if($("#modifyRailLength").val() == "")				//Check if the Rail Length is empty
		err += "Rail Length, ";
	else if ($("#modifyRailLength").val() <= 0)			//If not empty, check if it is 0 or less
		numErr += "Rail Length, ";
	
	if($("#modifySpoolRadius").val() == "")				//Check if the Spool Radius is empty
		err += "Spool Radius, ";
	else if ($("#modifySpoolRadius").val() <= 0)		//If not empty, check if it is 0 or less
		numErr += "Spool Radius, ";
	
	if($("#modifyVelocity").val() == "")				//Check if the Velocity is empty
		err += "Velocity, ";
	else if ($("#modifyVelocity").val() <= 0)			//If not empty, check if it is 0 or less
		numErr += "Velocity, ";
	
	if(intervalFlag == 1){	//Interval settings only matter if intervals are used
		if($("#modifyStops").val() == "")				//Check if the Number of Intervals is empty
			err += "Number of Intervals, ";
		else if ($("#modifyStops").val() <= 0)			//If not empty, check if it is 0 or less
			numErr += "Number of Intervals, ";
		
		if($("#modifyIntervalDistance").val() == "")	//Check if the Distance per Intervals is empty
			err += "Distance per Interval, ";
		else if ($("#modifyIntervalDistance").val() <= 0)//If not empty, check if it is 0 or less
			numErr += "Distance per Interval, ";
		
		if($("#modifyTimeInterval").val() == "")		//Check if the Time between Intervals is empty
			err += "Time between Intervals, ";
		else if ($("#modifyTimeInterval").val() <= 0)	//If not empty, check if it is 0 or less
			numErr += "Time between Intervals, ";
	}
	
	if(err != "" || optErr != "" || numErr != "") {		//If there were any errors specified
		if(err != ""){
			err = err.slice(0, -2) + " must be specified.";	//Format the error
			if(numErr != "")
				err += "\n";
		}
		if(numErr != "")
			numErr = numErr.slice(0, -2) + " must be greater than 0.";	//Format number errors
		alert(optErr + err + numErr);		//Alert the user
		return;
	}
	
	if($("#modifyLuxActivated").prop("checked") == false)	//Convert Lux Sensor flag checkbox status to integer
		var luxActivated = 0;
	else
		var luxActivated = 1;
	
	if($("#modifyCo2Activated").prop("checked") == false)	//Convert CO2 Sensor flag checkbox status to integer
		var co2Activated = 0;
	else
		var co2Activated = 1;
	
	if($("#modifyParticleActivated").prop("checked") == false)	//Convert Particle Sensor flag checkbox status to integer
		var particleActivated = 0;
	else
		var particleActivated = 1;
	
	if($("#modifyHumidityActivated").prop("checked") == false)	//Convert Humidity Sensor flag checkbox status to integer
		var humidityActivated = 0;
	else
		var humidityActivated = 1;
	
	if($("#modifyTemperatureActivated").prop("checked") == false)	//Convert Temperature Sensor flag checkbox status to integer
		var temperatureActivated = 0;
	else
		var temperatureActivated = 1;
	
	var info = {	//Object to store ALL data, except config name, and pass to AJAX request
		option: parseInt($("#modifyOption").val()),
		railLength: parseFloat($("#modifyRailLength").val()),
		spoolRadius: parseFloat($("#modifySpoolRadius").val()),
		velocity: parseFloat($("#modifyVelocity").val()),
		intervalFlag: intervalFlag,
		intervalDistance: parseFloat($("#modifyIntervalDistance").val()),
		stops: parseInt($("#modifyStops").val()),
		luxActivated: luxActivated,
		co2Activated: co2Activated,
		particleActivated: particleActivated,
		humidityActivated: humidityActivated,
		temperatureActivated: temperatureActivated,
		timeInterval: parseInt($("#modifyTimeInterval").val())
	};
	
	$.ajax({
		type: "POST",
		url: "/configs/edit",
		contentType: "application/json",
		data: JSON.stringify({
			oldConfigName: $("#modifyConfigName").prop("placeholder"),
			configName: $("#modifyConfigName").val(),
			data: info
		}),
		success: null,
		dataType: "json"
	}).done(function() {	//Once the server is finished creating the configuration
		alert("Configuration "+$("#modifyConfigName").val()+" was saved successfully.");
		$("#configList option:selected").text($("#modifyConfigName").val());		//Change the config name in the list to match the updated name
	}).fail(function(){
		alert("Configuration with name '"+$("#modifyConfigName").val()+"' already exists.");	//Alert the user if the config name is already taken
	});
}

function deleteConfig() {
	$.ajax({
		type: "POST",
		url: "/configs/delete",
		contentType: "application/json",
		data: JSON.stringify({
			configName: $("#configList option:selected").text()
		}),
		success: null,
		dataType: "json"
	}).done(function() {	//Once the server is finished deleting the configuration
		$("#deletePopUp").hide();
		alert("Configuration '"+$("#configList option:selected").text()+"' was successfully deleted.");	//Alert the user if the config was deleted
		loadConfigList()	//Reload the config list
	}).fail(function(){
		alert("Unable to delete configuration '"+$("#configList option:selected").text()+"'.");	//Alert the user if the config was unable to be deleted
	});
}


$(document).ready(() => {
	loadConfigList();
	$("#createConfig").on("click", createConfig);
	$("#clearConfig").on("click", clearConfig);
	
	$("#configList").on("change", loadConfig);
	$("#saveConfig").on("click", saveConfig);
	
	$("#deleteConfig").on("click", function(){
		$("#deleteConfigText").text($("#configList option:selected").text());
		$("#deletePopUp").show();
	});
	$(".close, #cancelDelete").on("click", function(){
		$("#deletePopUp").hide();
	});
	$("#confirmDelete").on("click", deleteConfig);
	
	window.onclick = function(event) {
		if(event.target == $("#deletePopUp")[0]) {
			$("#deletePopUp").hide();
		}
	}
});