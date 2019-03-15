function loadConfigList() {
	$.getJSON("/configs/list", (data) => {	//Load the list of configurations
		var configs = "";
		if(data.length > 0) {
			$(data).each(() => {		//Create an option for each configuration file found
				configs += "<option>"+this.configName+"</option>";
			});
		}
		else { //If none were found
			configs = "<option value=-1>None Found</option>";
		}
		$("#configList > *").replaceWith("");	//Remove the old configuration list from the page
		$("#configList").append($(configs));	//Append the new configuration list to the page
	});
}

function loadSensors() {
	$.getJSON("/configs/getSensors", (data) => {	//Load the list of sensors
		var sensors = "";
		$(data).each(function() {				//Create an option for each sensor found
			sensors += "<option>"+this.SensorName+"</option>";
		});
		$("#sensor1").append($(sensors));	//Append the new configuration list to the page
	});
}



//Create Configuration form functions
function addSensorField(){
	var sensors = "<option value=-1 selected>Select a Sensor</option>";	//String to hold list of sensors in JSON file
	$.getJSON("/configs/getSensors", (data) => {		//Get the list of sensors from the server
		$(data).each(function() {				//Create an option for each sensor found
			sensors += "<option>"+this.SensorName+"</option>";
		});
	}).done(function() {						//After done getting list of sensors
		var num = parseInt($("#createForm").attr("value")) + 1;	//Get the current number of sensors in the list and increment it
		$("#createForm").attr("value", num);					//Update the number
		var field = "<div class='pure-control-group sensor'>" +	//Create a new field for the sensor selection
						"<label for='sensor"+num+"'>Sensor "+num+"</label>" +
						"<select id='sensor"+num+"'>"+sensors+"</select>" +	//Add the list of sensors to the select list
					"</div>";
		$(field).insertBefore($("#createForm").find(".pure-controls"));		//Add the sensor field to the form
	});
}

function createConfig() {
	var sensorErr = "";	//Strings to store error messages
	var nameErr = "";
	var floatErr = "";
	var sensors = {};	//Object to store the list of sensors
	var count = 1;
	
	$("#createForm .sensor option:selected").each(function() {	//Get the list of selected sensors
		if($(this).val() != -1){
			sensors["sensor"+count] = $(this).text();
			count++;
		}
	});
	if(Object.keys(sensors).length == 0)
		sensorErr = "At least one sensor must be selected.";
	if($.trim($("#configName").val()) == "")		//Check if the name is empty
		nameErr = "Config Name must be specified.\n";
	if(isNaN(parseFloat($("#railLength").val())))	//Check if the rail length is a valid float
		floatErr = "Rail Length, ";
	if(isNaN(parseFloat($("#speed").val())))		//Check if the speed is a valid float
		floatErr += "Speed, ";
	if(isNaN(parseFloat($("#spool").val())))		//Check if the spool radius is a valid float
		floatErr += "Spool Radius, ";
	if(nameErr != "" || floatErr != "" || sensorErr != "") {		//If there were any errors specified
		if(floatErr != "")											//If there were number errors
			floatErr = floatErr.slice(0, -2) + " must be numbers.\n";//Format the number errors
		alert(nameErr + floatErr + sensorErr);		//Alert the user
		return;
	}
	
	sensors["railLength"] = $("#railLength").val();
	sensors["speed"] = $("#speed").val();
	sensors["spoolRadius"] = $("#spool").val();
	//console.log(sensors);
	
	if($.post("/configs/create", {	//Send the form data to the server
		configName: $("#configName").val(),
		data: sensors
	}, function(){}).done(function() {	//Once the server is finished creating the configuration
		alert("Configuration "+$("#configName").val()+" created.");
		$("#configName").val("");		//Empty the creation form
		$("#railLength").val("");
		$("#speed").val("");
		$("#spool").val("");
		$("#createForm .sensor").not(":first").remove(); //Remove all extra sensor fields
		$("#createForm .sensor").val(-1);	//Select the default option for the sensor select
		loadConfigList();	//Reload the configuration list on the page
	})){}
	else {	//If the creation failed, alert the user
		console.log("Something went wrong. Creating a config failed, please try again.");
		alert("Something went wrong. Creating a config failed, please try again.");
	}
}

//Modify Configuration form functions
function loadConfig() {
	var sensors = "";
	$.getJSON("/configs/getSensors", (data) => {		//Get the list of sensors from the server
		$(data).each(function() {				//Create an option for each sensor found
			sensors += "<option>"+this.SensorName+"</option>";
		});
	}).done(function() {						//After done getting list of sensors
		$.getJSON("/configs/read", {configName: $("#configList option:selected").text()}, (config) => {
			console.log(config);
			$("#configName").val(config.configName);
			$("#railLength").val(config.railLength);
			$("#speed").val(config.speed);
			$("#spool").val(config.spoolRadius);
			$(config.data).each(function(){
				var num = 1;
				var field = "<div class='pure-control-group sensor'>" +	//Create a new field for the sensor selection
								"<label for='sensor"+num+"'>Sensor "+num+"</label>" +
								"<select id='sensor"+num+"'>"+sensors+"</select>" +	//Add the list of sensors to the select list
							"</div>";
				var sensorField = $(field);
				sensorField.find("option:contains("+this.sensor+")").attr("selected", "selected");	//Find the sensor that matches the configuration and select it
				sensorField.insertBefore($("#modifyForm").find(".pure-controls"));		//Add the sensor field to the form
				num ++;
			});
		});
	});
}


function saveConfig() {
	var sensorErr = "";	//Strings to store error messages
	var nameErr = "";
	var floatErr = "";
	var sensors = [];	//Array to store the list of sensors
	
	$("#modifyForm .sensor option:selected").each(function() {	//Get the list of selected sensors
		if($(this).val() != -1)
			sensors.push({sensor: $(this).text()});
	});
	if(sensors.length == 0)
		sensorErr = "At least one sensor must be selected.";
	if($.trim($("#modifyConfigName").val()) == "")		//Check if the name is empty
		nameErr = "Config Name must be specified.\n";
	if(isNaN(parseFloat($("#modifyRailLength").val())))	//Check if the rail length is a valid float
		floatErr = "Rail Length, ";
	if(isNaN(parseFloat($("#modifySpeed").val())))		//Check if the speed is a valid float
		floatErr += "Speed, ";
	if(isNaN(parseFloat($("#modifySpool").val())))		//Check if the spool radius is a valid float
		floatErr += "Spool Radius, ";
	if(nameErr != "" || floatErr != "" || sensorErr != "") {		//If there were any errors specified
		if(floatErr != "")											//If there were number errors
			floatErr = floatErr.slice(0, -2) + " must be numbers.\n";//Format the number errors
		alert(nameErr + floatErr + sensorErr);		//Alert the user
		return;
	}
	
	if($.post("/configs/save", {
		configName: $("#modifyConfigName").val(),
		railLength: parseFloat($("#modifyRailLength").val()),
		speed: parseFloat($("#modifySpeed").val()),
		spoolRadius: parseFloat($("#modifySpool").val()),
		data: sensors
	}, function(){}).done(function(){
		alert("Configuration "+$("#modifyConfigName").val()+" was saved successfully.");	//Alert the user that the save was successful
		$("#configList option:selected").text($("#modifyConfigName").val());				//Change the config name in the list to match the updated name
	})){}
	else{
		console.log("Something went wrong. Saving config edits failed, please try again.");
		alert("Something went wrong. Saving config edits failed, please try again.");
	}
}


$(document).ready(() => {
	loadConfigList();
	loadSensors();
	$("#addSensor").on("click", addSensorField);
	$("#createConfig").on("click", createConfig);
	
	$("#configList").on("change", loadConfig);
	$("#saveConfig").on("click", saveConfig);
});