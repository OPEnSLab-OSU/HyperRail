function loadRunData() {
	$.getJSON("/runs/search", {			// Ask the server to search through the runs tables
		bot: $("#botName").val(),		// Pass the queried bot name, run name, and sensor type
		name: $("#runName").val(),
		type: $("#sensorType").val()
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
		$("#dataTable > *").replaceWith("");	//Remove the old table
		$("#dataTable").append($(data));		//Append the new table
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
			$("#configName").text($("#configList option:selected").text());				//Fill in Config Name field
			$("#option").text(config.option);				//Fill in Option value
			$("#delayTime").text(config.delayTime);			//Fill in Time between Steps
			$("#totalSteps").text(config.totalSteps);		//Fill in Steps to Traverse Rail
			
			if(config.intervalFlag == 0)							//Convert Interval Flag integer to text status
				$("#intervalFlag").text("No");
			else
				$("#intervalFlag").text("Yes");
			$("#stops").text(config.stops);					//Fill in Number of Intervals
			$("#intervalSteps").text(config.intervalSteps);	//Fill in Steps per Interval
			$("#timeInterval").text(config.timeInterval);		//Fill in Time between Intervals
			
			if(config.luxActivated == 0)							//Convert Lux Sensor Flag integer to text status
				$("#luxActivated").text("No");
			else
				$("#luxActivated").text("Yes");
		
			if(config.co2Activated == 0)							//Convert CO2 Sensor Flag integer to text status
				$("#co2Activated").text("No");
			else
				$("#co2Activated").text("Yes");
		
			if(config.particleActivated == 0)						//Convert Particle Sensor Flag integer to text status
				$("#particleActivated").text("No");
			else
				$("#particleActivated").text("Yes");
		
			if(config.humidityActivated == 0)						//Convert Humidity Sensor Flag integer to text status
				$("#humidityActivated").text("No");
			else
				$("#humidityActivated").text("Yes");
		
			if(config.temperatureActivated == 0)					//Convert Temperature Sensor Flag integer to text status
				$("#temperatureActivated").text("No");
			else
				$("#temperatureActivated").text("Yes");
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
});