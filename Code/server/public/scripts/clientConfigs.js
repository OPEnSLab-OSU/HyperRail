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
	
	if($.trim($("#configName").val()) == "")		//Check if the name is empty
		err = "Config Name, ";
	if($("#option").val() == "")
		err += "Option, ";
	if($("#delayTime").val() == "")
		err += "Delay Time, ";
	if($("#totalSteps").val() == "")
		err += "Steps to Traverse Rail, ";
	if($("#stops").val() == "")
		err += "Number of Intervals, ";
	if($("#intervalSteps").val() == "")
		err += "Steps per Interval, ";
	if($("#timeInterval").val() == "")
		err += "Time between Intervals, ";

	if(err != "") {		//If there were any errors specified
		err = err.slice(0, -2);
		alert(err + " must be specified.");		//Alert the user
		return;
	}
	
	if($("#intervalFlag").prop("checked") == false)
		var intervalFlag = 0;
	else
		var intervalFlag = 1;
	if($("#luxActivated").prop("checked") == false)
		var luxActivated = 0;
	else
		var luxActivated = 1;	
	if($("#co2Activated").prop("checked") == false)
		var co2Activated = 0;
	else
		var co2Activated = 1;
	if($("#particleActivated").prop("checked") == false)
		var particleActivated = 0;
	else
		var particleActivated = 1;
	if($("#humidityActivated").prop("checked") == false)
		var humidityActivated = 0;
	else
		var humidityActivated = 1;
	if($("#temperatureActivated").prop("checked") == false)
		var temperatureActivated = 0;
	else
		var temperatureActivated = 1;
	
	var info = {	//Object to store data
		option: parseInt($("#option").val()),
		totalSteps: parseInt($("#totalSteps").val()),
		delayTime: parseInt($("#delayTime").val()),
		intervalFlag: intervalFlag,
		intervalSteps: parseInt($("#intervalSteps").val()),
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
	$("#delayTime").val("");
	$("#totalSteps").val("");
	
	
	$("#intervalFlag").prop("checked", false);
	$("#stops").val("");
	$("#intervalSteps").val(0);
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
			$("#modifyConfigName").val($("#configList option:selected").text());
			$("#modifyConfigName").prop("placeholder", $("#configList option:selected").text());
			$("#modifyOption").val(config.option);
			$("#modifyDelayTime").val(config.delayTime);
			$("#modifyTotalSteps").val(config.totalSteps);
			
			if(config.intervalFlag == 0)
				$("#modifyIntervalFlag").prop("checked", false);
			else
				$("#modifyIntervalFlag").prop("checked", true);
			$("#modifyStops").val(config.stops);
			$("#modifyIntervalSteps").val(config.intervalSteps);
			$("#modifyTimeInterval").val(config.timeInterval);
			
			if(config.luxActivated == 0)
				$("#modifyLuxActivated").prop("checked", false);
			else
				$("#modifyLuxActivated").prop("checked", true);
		
			if(config.co2Activated == 0)
				$("#modifyCo2Activated").prop("checked", false);
			else
				$("#modifyCo2Activated").prop("checked", true);
		
			if(config.particleActivated == 0)
				$("#modifyParticleActivated").prop("checked", false);
			else
				$("#modifyParticleActivated").prop("checked", true);
		
			if(config.humidityActivated == 0)
				$("#modifyHumidityActivated").prop("checked", false);
			else
				$("#modifyHumidityActivated").prop("checked", true);
		
			if(config.temperatureActivated == 0)
				$("#modifyTemperatureActivated").prop("checked", false);
			else
				$("#modifyTemperatureActivated").prop("checked", true);
		},
		dataType: "json"
	});
}


function saveConfig() {
	var err = "";	//Strings to store error messages
	var nameErr = "";
	
	if($.trim($("#modifyConfigName").val()) == "")		//Check if the name is empty
		err = "Config Name, ";
	if($("#modifyOption").val() == "")
		err += "Option, ";
	if($("#modifyDelayTime").val() == "")
		err += "Delay Time, ";
	if($("#modifyTotalSteps").val() == "")
		err += "Steps to Traverse Rail, ";
	if($("#modifyStops").val() == "")
		err += "Number of Intervals, ";
	if($("#modifyIntervalSteps").val() == "")
		err += "Steps per Interval, ";
	if($("#modifyTimeInterval").val() == "")
		err += "Time between Intervals, ";

	if($.trim($("#modifyConfigName").val()) == $("#modifyConfigName").prop("placeholder"))		//Check if the name is the same
		nameErr = "Please change the Config Name.";
	
	if(err != "" || nameErr != "") {		//If there were any errors specified
		if(err != "")
			err = err.slice(0, -2) + " must be specified.\n";
		alert(err + nameErr);		//Alert the user
		return;
	}
	
	if($("#modifyIntervalFlag").prop("checked") == false)
		var intervalFlag = 0;
	else
		var intervalFlag = 1;
	if($("#modifyLuxActivated").prop("checked") == false)
		var luxActivated = 0;
	else
		var luxActivated = 1;	
	if($("#modifyCo2Activated").prop("checked") == false)
		var co2Activated = 0;
	else
		var co2Activated = 1;
	if($("#modifyParticleActivated").prop("checked") == false)
		var particleActivated = 0;
	else
		var particleActivated = 1;
	if($("#modifyHumidityActivated").prop("checked") == false)
		var humidityActivated = 0;
	else
		var humidityActivated = 1;
	if($("#modifyTemperatureActivated").prop("checked") == false)
		var temperatureActivated = 0;
	else
		var temperatureActivated = 1;
	
	var info = {	//Object to store data
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


$(document).ready(() => {
	loadConfigList();
	$("#createConfig").on("click", createConfig);
	$("#clearConfig").on("click", clearConfig);
	
	$("#configList").on("change", loadConfig);
	$("#saveConfig").on("click", saveConfig);
});