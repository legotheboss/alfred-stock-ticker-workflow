const alfy = require("alfy");

//thanks to @MartinMuzatko's Github Gist: https://gist.github.com/MartinMuzatko/1060fe584d17c7b9ca6e
//enabled this function to convert long numbers into a friendly format. 
function commarize() {
	// Alter numbers larger than 1k
	if (this >= 1e3) {
	  var units = ["K", "M", "B", "T"];
	  
	  // Divide to get SI Unit engineering style numbers (1e3,1e6,1e9, etc)
	  let unit = Math.floor(((this).toFixed(0).length - 1) / 3) * 3
	  // Calculate the remainder
	  var num = (this / ('1e'+unit)).toFixed(2)
	  var unitname = units[Math.floor(unit / 3) - 1]
	  
	  // output number remainder + unitname
	  return num + unitname
	}
	// return formatted original number
	return this.toLocaleString()
}
Number.prototype.commarize = commarize
String.prototype.commarize = commarize

if (process.env.IEX_API.includes('DEFAULT') ){
	alfy.error("Configure your IEX API \n1. Open Workflows in Alfred Preferences\n2. Select the Stock Ticker Workflow\n3. Select the option to Configure Workflow and Variables.\n4. Configure the Workflow Environment Variable for IEX_API to contain your IEX API. If you do not have an IEX Cloud API, read the instructions to generate an API token.");
} else {
	alfy.fetch(`https://cloud.iexapis.com/stable/stock/${alfy.input}/quote?token=${process.env.IEX_API}`)
	.then(result => {
		if(result.companyName.length > 17){
			companyName = result.companyName.substring(0,17)+'...';
		}
		else companyName = result.companyName;
		if(result.isUSMarketOpen == true){
			output  = [{
				"title": result.companyName + ": $" + result.iexRealtimePrice.toFixed(2) + " | Current Change: " + (result.changePercent*100).toFixed(2)+"%",
				"subtitle": "Today's Volume: " + result.avgTotalVolume.commarize() + " | 52 Week Low/High: " + result.week52Low.toFixed(2) +" - " + result.week52High.toFixed(2),
			}];
		}
		else{
			output  = [{
				"title": companyName + ": $" + result.latestPrice.toFixed(2) + " | Today's Change: " + (result.changePercent*100).toFixed(2)+"%",
				"subtitle": "Today Low/High: " + result.low.toFixed(2) +" - " + result.high.toFixed(2) + 
				" | 52 Week Low/High: " + result.week52Low.toFixed(2) +" - " + result.week52High.toFixed(2),
			}];
		}
		
		alfy.output(output);
	})
	.catch((err) => {
		if(err.name.includes("Parse")){
			output  = [{
				"title": "Invalid Ticker Entered",
				"subtitle": "Error Fetching Ticker $" + alfy.input,
			}];
			alfy.output(output);
		}
		else{
			output  = [{
				"title": "Some other error",
				"subtitle": err.toString(),
			}];
			alfy.error(err);
		}
	});
}
