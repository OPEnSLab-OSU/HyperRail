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


$(document).ready(() => {
	$("#runSearch").on("click", loadRunData);	//Search on button click
	
	$("#botName, #runName, #sensorType, #dataLimit").on("keypress", function(e){	//Search when enter is pressed
		if(e.which == 13)
			loadRunData();
	});
});