function loadConfigList() {
	/*$.getJSON("/list", {}, (data) => {
		console.log(data);
		var configs = "";
		$(data).each(() => {
			configs += "<option>"+this.configName+"</option>";
		});
		var table = $(configs);
		$("#configList").append(table);
	});*/
}


function addSensorField(){
	var num = parseInt($("#createForm").attr("value")) + 1;
	$("#createForm").attr("value", num);
	var field = "<div class='pure-control-group sensor'>" +
					"<label for='sensor"+num+"'>Sensor "+num+"</label>" +
					"<select id='sensor"+num+"' class='form-control'></select>" +
				"</div>";
	$(field).insertBefore($("#createForm").find(".pure-controls"));
}


function createConfig() {
	var err = "";
	if(isNaN(parseFloat($("#railLength").val())))
		err = "Rail Length, ";
	if(isNaN(parseFloat($("#speed").val())))
		err += "Speed, ";
	if(isNaN(parseFloat($("#spool").val())))
		err += "Spool Radius, ";
	if(err != "") {
		err.slice(0, -2);
		alert(err + " must be numbers");
		return;
	}
	
	var sensors = [];
	
	$("#createForm .sensor input").each(function() {
		sensors.push($(this).val());
	});
	console.log(sensors);
	
	/*if($.post("/create", {
		configName: $("#configName").val(),
		railLength: parseFloat($("#railLength").val()),
		speed: parseFloat($("#speed").val()),
		spoolRadius: parseFloat($("#spool").val()),
		data: sensors
	}, function() {
		
	})) {}
	else {
		console.log("Something went wrong. Creating a config failed, please try again.");
		alert("Something went wrong. Creating a config failed, please try again.");
	}
	*/
}

function loadConfig() {
	console.log("Load");
}


function saveConfig() {
	console.log("Save");
}


$(document).ready(() => {
	loadConfigList();
	
	$("#addSensor").on("click", addSensorField);
	
	$("#createConfig").on("click", createConfig);
	$("#configList").on("change", loadConfig);
	$("#saveConfig").on("click", saveConfig);
});