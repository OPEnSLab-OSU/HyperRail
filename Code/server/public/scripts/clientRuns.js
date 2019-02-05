function loadRunData() {
	$.getJSON("/runs/search", {			// Ask the server to search through the runs tables
		bot: $("#botName").val(),		// Pass the queried bot name, run name, and sensor type
		name: $("#runName").val(),
		type: $("#sensorType").val()
	}, (entries) => {
		let data = "";					//String to hold table information
		console.log(entries);
		if(entries.length > 0) {		//If entries were found
			$(entries).each((index, obj) => {		//For each entry, add it to the table string
				console.log(obj);
				data += "<tr>" +
							"<td>"+obj.bot+"</td>" +
							"<td>"+obj.name+"</td>" +
							"<td>"+obj.time+"</td>" +
							"<td>"+obj.type+"</td>" +
							"<td>"+obj.value+"</td>" +
						"</tr>";
				
			});
		} else {						//Else if no entries were found, notify the user
			data += "<tr>" +
						"<td colspan=5>No Data Found</td>" +
					"</tr>";
		}
		let table = $(data);					//Convert the table string into an object
		$("#dataTable > *").replaceWith("");	//Remove the old table
		$("#dataTable").append(table);			//Append the new table
	});
}


$(document).ready(() => {
	$("#runSearch").on("click", loadRunData);	//Search on button click
});