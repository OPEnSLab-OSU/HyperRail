function createConfig() {
	console.log("Create");
	/*$.post("/create", {}, function(){
		
	});
	*/
}


function loadConfigList() {
	$.getJSON("/listConfigs", {}, (data) => {
		console.log(data);
		var configs = "";
		$(data).each(() => {
			configs += "<option>"+this.configName+"</option>";
		});
		var table = $(configs);
		$("#configList").append(table);
	});
}


function loadConfig() {
	console.log("Load");
}


function saveConfig() {
	console.log("Save");
}


$(document).on("ready", () => {
	loadConfigList();
	
	$("#createConfig").on("click", createConfig);
	$("#configList").on("change", loadConfig);
	$("#saveConfig").on("click", saveConfig);
});