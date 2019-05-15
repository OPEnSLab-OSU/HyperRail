//Letter code: sensor type (units)
let legend = {
	"C": "CO2 (ppm)",
	"L": "Lux (lumens)",
	"T": "Temperature (C)",
	"H": "Humidity (ppm)",
	"Lo": "Location (m)",
	"Vbat": "Battery Voltage (V)"
}

function loadRunData() {
	if($("#filterSetting").prop("checked") == true)
		var filter = 1;
	else
		var filter = 0;
	
	$.getJSON("/runs/search", {			// Ask the server to search through the runs tables
		botName: $("#botName").val(),		// Pass the queried bot name, run name, and sensor type
		runName: $("#runName").val(),
		filter: filter
	}, (entries) => {
		let table = "";					//String to hold table information
		let header= "<tr>" + 			//String to hold table header
						"<th class='cell'>Bot Name</th>" +
						"<th class='cell'>Run Name</th>" +
						"<th class='cell'>Timestamp</th>";
						
		let limit = parseInt($("#dataLimit").val());
		if(Number.isNaN(limit))			//If no limit was specified
			limit = entries.length;		//Set the limit equal to the number of entries	
		let counter = 0;				//Counter to check if limit is reached
		
		if(entries.length > 0) {		//If entries were found
			let columns = {};			//Object to store all columns
			
			//Generate the header row
			$(entries).each(function(){		//For each entry, add it to the table string
				if(counter < limit){				//If the limit was not reached
					$.each(this.data, function(index){	//For each entry, check for new column names
						if(!(columns.hasOwnProperty(index))){	//If there's a new column
							columns[index] = "";				//Store the new column as a property
							if(legend.hasOwnProperty(index))	//If the column has been given a unique name
								header += "<th class='cell'>"+legend[index]+"</th>";	//Display the unique name
							else
								header += "<th class='cell'>"+index+"</th>";			//Display the column name
						}
					});
				}
				counter ++;
			});
			header += "</tr>";	//End the header row
			
			//Populate the table
			counter = 0;		//Reset the counter
			$(entries).each(function(){		//For each entry
				if(counter < limit){				//Add each entry to the table if the limit was not reached
					table += "<tr>" +
							"<td class='cell'>"+this.botName+"</td>" +
							"<td class='cell'>"+this.runName+"</td>" +
							"<td class='cell'>"+this.timestamp+"</td>";
					let sensors = this.data;			//Store the row's sensor data
					$.each(columns, function(index){	//Check all possible columns
						if(sensors.hasOwnProperty(index))	//If the row has data for a defined column
							table += "<td class='cell'>"+sensors[index]+"</td>";	//Display the data
						else
							table += "<td class='cell'></td>";						//Else, display an empty data cell
					});
					table += "</tr>";		//End the row
				}
				counter ++;							//Increment the counter
			});
		} else {						//Else if no entries were found, append a row saying so
			table += "<tr>" +
						"<td colspan=100>No Data Found</td>" +
					"</tr>";
		}
		
		$("#tableHead > *").remove();			//Remove the old table header
		$("#tableHead").append($(header));		//Append the new table header
		
		$("#tableData > *").remove();			//Remove the old table
		$("#tableData").append($(table));		//Append the new table
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
			$("#modifyRailLength").val(config.railLength);			//Fill in Rail Length
			$("#modifySpoolRadius").val(config.spoolRadius);		//Fill in Spool Radius
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
		else if ($("#modifyIntervalDistance").val() <= 0)	//If not empty, check if it is 0 or less
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
	
	$.ajax({
		type: "POST",
		url: "/bots/execute",
		contentType: "application/json",
		data: JSON.stringify({	
			runName: $("#runNameInput").val(),
			botName: $("#botNameInput").val(),
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
		}),
		success: function(){	//Once the server is finished loading the config file, fill in the fields
			alert("Run execution successful.");
		},
		dataType: "json"
	}).fail(function(){
		alert("Run execution failed. Please check bot connection.");
	});
}


$(document).ready(() => {
	loadConfigList();
	$("#runSearch").on("click", loadRunData);	//Search on button click
	
	$("#botName, #runName, #dataLimit").on("keypress", function(e){	//Search when enter is pressed
		if(e.which == 13)
			loadRunData();
	});
	
	$("#configList").on("change", loadConfigDetails);
	$("#executeRun").on("click", executeRun);
});