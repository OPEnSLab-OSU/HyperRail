function loadRunData() {
	$.getJSON("/runs/search", {			//Ask the server to search through the runs tables
		botName: $("#botName").val(),	//Pass the queried bot name, run name, and sensor type
		runName: $("#runName").val(),
		type: $("#sensorType").val()
	}, (entries) => {
		var data = "";					//String to hold table information
		if(entries.length > 0) {		//If entries were found
			$(entries).each(() => {		//For each entry, add it to the table string
				var bot = this.botName;		//Save the bot name
				$(this.data).each(() => {	//For each data entry the sensor collected, create a row
					data += "<tr>" +
								"<td>"+bot+"</td>" +
								"<td>"+this.time+"</td>" +
								"<td>"+this.type+"</td>" +
								"<td>"+this.value+"</td>" +
							"</tr>";
				});
			});
		} else {						//Else if no entries were found, notify the user
			data += "<tr>" +
						"<td colspan=4>No Data Found</td>" +
					"</tr>";
		}
		var table = $(data);					//Convert the table string into an object
		$("#dataTable > *").replaceWith("");	//Remove the old table
		$("#dataTable").append(table);			//Append the new table
	});
}

$(document).ready(() => {
	$("#runSearch").on("click", loadRunData);	//Search on button click
});