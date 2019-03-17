function loadRunData() {
	if($("#filterSetting").prop("checked") == true)
		var filter = 1;
	else
		var filter = 0;
	
	$.getJSON("/runs/search", {			// Ask the server to search through the runs tables
		bot: $("#botName").val(),		// Pass the queried bot name, run name, and sensor type
		name: $("#runName").val(),
		type: $("#sensorType").val(),
		filter: filter
	}, (entries) => {
		let data = "";					//String to hold table information
		let limit = parseInt($("#dataLimit").val());
		let counter = 0;
		if(entries.length > 0) {		//If entries were found
			if(Number.isNaN(limit)) {			//If no limit was specified, display all rows
				$(entries).each((index, obj) => {		//For each entry, add it to the table string
					data += "<tr>" +
								"<td>"+obj.bot+"</td>" +
								"<td>"+obj.name+"</td>" +
								"<td>"+obj.time+"</td>" +
								"<td>"+obj.type+"</td>" +
								"<td>"+obj.value+"</td>" +
							"</tr>";
				});
			}
			else {						//If a limit was specified
				$(entries).each((index, obj) => {		//For each entry
					if(counter < limit){				//Add each entry to the table if the limit was not reached
						data += "<tr>" +
									"<td>"+obj.bot+"</td>" +
									"<td>"+obj.name+"</td>" +
									"<td>"+obj.time+"</td>" +
									"<td>"+obj.type+"</td>" +
									"<td>"+obj.value+"</td>" +
								"</tr>";
					}
					counter ++;							//Increment the counter
				});
			}
		} else {						//Else if no entries were found, notify the user
			data += "<tr>" +
						"<td colspan=5>No Data Found</td>" +
					"</tr>";
		}
		$("#tableData > *").replaceWith("");	//Remove the old table
		$("#tableData").append($(data));		//Append the new table
	});
}

function loadConfigList(){
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
	}).done(loadConfigDetails);
}

function loadConfigDetails(){
	$.ajax({
		type: "POST",
		url: "/configs/read",
		contentType: "application/json",
		data: JSON.stringify({	
			configName: $("#configList option:selected").text()
		}),
		success: function(config){	//Once the server is finished loading the config file, fill in the fields
			$("#modifyConfigName").val($("#configList option:selected").text());					//Fill in Config Name field
			$("#modifyOption").val(config.option);					//Fill in Option value
			$("#modifyDelayTime").val(config.delayTime);			//Fill in Time between Steps
			$("#modifyTotalSteps").val(config.totalSteps);			//Fill in Steps to Traverse Rail
			
			if(config.intervalFlag == 0)							//Convert Interval Flag integer to checkbox status
				$("#modifyIntervalFlag").prop("checked", false);
			else
				$("#modifyIntervalFlag").prop("checked", true);
			$("#modifyStops").val(config.stops);					//Fill in Number of Intervals
			$("#modifyIntervalSteps").val(config.intervalSteps);	//Fill in Steps per Interval
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

function executeRun() {
	var err = "";	//Strings to store error messages
	var optErr = "";
	var numErr = "";
	
	
	if($.trim($("#runNameInput").val()) == "")
		err += "Run Name, ";
	if($.trim($("#botNameInput").val()) == "")
		err += "Bot Name, ";
	
	if($("#modifyIntervalFlag").prop("checked") == false)	//Convert Interval flag checkbox status to integer
		var intervalFlag = 0;
	else
		var intervalFlag = 1;
		
	if($("#modifyOption").val() == "")					//Check if the option number is empty
		err += "Option, ";
	else if ($("#modifyOption").val() < 1 || $("#modifyOption").val() > 5)	//If not empty, check if it is between 1 and 5
		optErr += "Option must be an integer between 1 and 5.\n";
	
	if($("#modifyTotalSteps").val() == "")				//Check if the Steps to Traverse Rail is empty
		err += "Steps to Traverse Rail, ";
	else if ($("#modifyTotalSteps").val() < 0)			//If not empty, check if it is non-negative
		numErr += "Steps to Traverse Rail, ";
	
	if($("#modifyDelayTime").val() == "")				//Check if the Time between Steps is empty
		err += "Time between Steps, ";
	else if ($("#modifyDelayTime").val() < 0)			//If not empty, check if it is non-negative
		numErr += "Time between Steps, ";
	
	if(intervalFlag == 1){	//Interval settings only matter if intervals are used
		if($("#modifyStops").val() == "")				//Check if the Number of Intervals is empty
			err += "Number of Intervals, ";
		else if ($("#modifyStops").val() < 0)			//If not empty, check if it is non-negative
			numErr += "Number of Intervals, ";
		
		if($("#modifyIntervalSteps").val() == "")		//Check if the Steps per Intervals is empty
			err += "Steps per Interval, ";
		else if ($("#modifyIntervalSteps").val() < 0)	//If not empty, check if it is non-negative
			numErr += "Steps per Interval, ";
		
		if($("#modifyTimeInterval").val() == "")		//Check if the Time between Intervals is empty
			err += "Time between Intervals, ";
		else if ($("#modifyTimeInterval").val() < 0)	//If not empty, check if it is non-negative
			numErr += "Time between Intervals, ";
	}
	
	if(err != "" || optErr != "" || numErr != "") {		//If there were any errors specified
		if(err != ""){
			err = err.slice(0, -2) + " must be specified.";	//Format the error
			if(numErr != "")
				err += "\n";
		}
		if(numErr != "")
			numErr = numErr.slice(0, -2) + " must be a non-negative number.";	//Format number errors
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
	
	$.ajax({
		type: "POST",
		url: "/bots/execute",
		contentType: "application/json",
		data: JSON.stringify({	
			runName: $("#runNameInput").val(),
			botName: $("#botNameInput").val(),
			option: parseInt($("#modifyOption").val()),
			totalSteps: parseInt($("#modifyTotalSteps").val()),
			delayTime: parseInt($("#modifyDelayTime").val()),
			intervalFlag: intervalFlag,
			intervalSteps: parseInt($("#modifyIntervalSteps").val()),
			stops: parseInt($("#modifyStops").val()),
			luxActivated: luxActivated,
			co2Activated: co2Activated,
			particleActivated: particleActivated,
			humidityActivated: humidityActivated,
			temperatureActivated: temperatureActivated,
			timeInterval: parseInt($("#modifyTimeInterval").val())
		}),
		success: function(){	//Once the server is finished loading the config file, fill in the fields
			alert("Run execution successful.");
		},
		dataType: "json"
	});
}


$(document).ready(() => {
	loadConfigList();
	$("#runSearch").on("click", loadRunData);	//Search on button click
	
	$("#botName, #runName, #sensorType, #dataLimit").on("keypress", function(e){	//Search when enter is pressed
		if(e.which == 13)
			loadRunData();
	});
	
	$("#configList").on("change", loadConfigDetails);
	$("#executeRun").on("click", executeRun);
});