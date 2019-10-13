App = {
	web3Provider: null,
	contracts: {},
	account: '0x0',
	hasVoted: false,

	init: function() {
		return App.initWeb3();
	},

	initWeb3: function() {
		// TODO: refactor conditional
		if (typeof web3 !== 'undefined') {
			// If a web3 instance is already provided by Meta Mask.
			App.web3Provider = web3.currentProvider;
			web3 = new Web3(web3.currentProvider);
		} else {
			// Specify default instance if no web3 instance provided
			App.web3Provider = new Web3.providers.HttpProvider('http://10.42.0.139:7545');
			web3 = new Web3(App.web3Provider);
		}
		return App.initContract();
	},

	initContract: function() {
		$.getJSON("Network.json", function(network) {
			// Instantiate a new truffle contract from the artifact
			App.contracts.Network = TruffleContract(network);
			// Connect provider to interact with contract
			App.contracts.Network.setProvider(App.web3Provider);
			web3.eth.defaultAccount = web3.eth.accounts[0]
			web3.eth.getCoinbase(function(err, account) {
				if (err === null) {
					if (account == null) {
						console.log('getting null account');
						App.account = 1;
					}
					else {
						App.account = account;
					}
					$("#accountAddress").html("Your Account: " + account);
				}
			});
			// window.ethereum.autoRefreshOnNetworkChange = false;
			// web3.personal.unlockAccount(web3.eth.defaultAccount, "", 0)
			window.ethereum.enable().then(function(instance) {
				console.log(instance);
				console.log("defaultAccount = " + web3.eth.defaultAccount)
				App.listenForEvents();
				App.contracts.Network.deployed().then(function(instance) {
					networkInstance = instance;
					return networkInstance.existUser({ from: App.account});
					 // return networkInstance.addUser("temp1", "temp1", { from: App.account});   //TODO: Make this function
					}).then(function(doesExist) {
						console.log(doesExist)
						if (!doesExist) {
							window.location.href = "login.html";
						}
						else {
							var ad = networkInstance.idAddress("temp2");
							return ad;
						}
					}).then(function(didExist) {
						return networkInstance.existUser({from: didExist});
					}).then(function(didExist) {
						console.log(didExist);
						App.render();
					}).catch(function(error) {
						console.error(error);
					});
				// $('#pointssTable').append("<tr> <td> Achieved this </td> <td> not verified </td> </tr>");
			});
		});
	},

	// Listen for events emitted from the contract
	listenForEvents: function() {
		App.contracts.Network.deployed().then(function(instance) {
			// Restart Chrome if you are unable to receive this event
			// This is a known issue with Metamask
			// https://github.com/MetaMask/metamask-extension/issues/2393
			instance.addUserEvent({}, {
				fromBlock: 0,
				toBlock: 'latest'
			}).watch(function(error, event) {
				console.log("event triggered adduser", error, event)
				// Reload when a new vote is recorded
				// window.location.reload();
			});
			instance.addPointEvent({}, {
				fromBlock: 0,
				toBlock: 'latest'
			}).watch(function(error, event) {
				console.log("event triggered addpoint", event)
				// Reload when a new vote is recorded
				// App.render();
			});
			instance.deletePointEvent({}, {
				fromBlock: 0,
				toBlock: 'latest'
			}).watch(function(error, event) {
				console.log("event triggered delete point", event)
				// Reload when a new vote is recorded
				// App.render();
			});
			instance.addVerifierEvent({}, {
				fromBlock: 0,
				toBlock: 'latest'
			}).watch(function(error, event) {
				console.log("event triggered add verifier", event)
				// Reload when a new vote is recorded
				// App.render();
			});
			instance.respondPointEvent({}, {
				fromBlock: 0,
				toBlock: 'latest'
			}).watch(function(error, event) {
				console.log("event triggered respond point 		", event)
				// Reload when a new vote is recorded
				// App.render();
			});
		});
	},

	render: function() {
		console.log("rendering")
		var networkInstance;
		var loader = $("#loader"); //TODO: add loader 
		var content = $("#content");

		App.contracts.Network.deployed().then(function(instance) {
			networkInstance = instance;
			return networkInstance.getPendingVerificationsLength({ from: App.account});   //TODO: Make this function
		}).then(function(userPointsCount) {
			console.log("getting")
			var verifications = $("#verifications");
			console.log("emptying");
			verifications.empty();
			console.log("displaying verifications");
			console.log(userPointsCount)
			// for (var i = 0; i < userPointsCount; i++) {
			// 	console.log("hello");
			// } 
			for (var i = 0; i < userPointsCount; i++) {
				networkInstance.getPendingVerificationByIndex(i, { from: App.account}).then(function(point) {
				var id = point[0];
				var name = point[1];
				var pointId = point[2];
				var heading = point[3];
				var section = point[4];
				var text = point[5];
				var date = point[6];
				var entry = verificationHTML(id, name, pointId, heading, section, text, date, i);
				var pointEntry = "<p id=\"pointPara" + pointId + "\">" + "\t" + pointText + "\t" + "<input type=\"text\" id=\"pointText" + pointId + "\"> </input>" + "<button id=\"pointButton" + pointId + "\" onclick=\"App.addVerifier(\'" + pointId + "\')\"> Add Verifier</button></p>";
				verifications.append(pointEntry);
		});   //TODO: Make this function
			}
		}).catch(function(error) {
			console.error(error);
		});
		loader.hide();
		content.show();
	},

	//index, bool
	//respondPoint
	respondPoint: function(index, response) {
		console.log("adding a verifier" + pointId);
		var paraId = "#pointPara" + pointId;
		var para = $(paraId);
		console.log(paraId);
		console.log(para);
		var textId = "#pointText" + pointId;
		var text = $(textId).val();
		console.log(textId);
		console.log(text);
		App.contracts.Network.deployed().then(function(instance) {
			networkInstance = instance;
			return networkInstance.respondPoint(index, response, { from: App.account});
		}).then(function(result) {
			console.log("Added a point to " + App.account)
			$("#content").hide();
			$("#loader").show();
			console.log(result);
			window.location.reload();
		}).catch(function(err) {
			console.error(err);
		});
	}
};

function verificationHTML(id, name, pointId, heading, section, text, date, index){

	var myvar = 
	'     <div class="hovhighlight" id="'+ verify- + id + '" >'+
	'        <div class="container">'+
	'          <div class="row">'+
	'            <div class="col-lg-6">'+
	'            <h3 id="vn1"><strong>' + name + '</strong></h3>'+
	'            </div>'+
	'          </div>'+
	'          <div class="row">'+
	'            <div class="col-lg-6">'+
	'              <h4 id="vh2"><strong>' + heading + '</strong></h4>'+
	'            </div>'+
	'            <div class="col-lg-6">'+
	'              <h5 class="text-right">' + date + '</h5>'+
	'            </div>'+
	'          </div>  '+
	'          <div class="row">'+
	'            <div class="col-lg-12">'+
	'              <p>'+
	'                ' + text +
	'              </p>'+
	'            </div>'+
	'          </div>    '+
	'          <br/>'+
	'        </div>'+
	'        <div class="container">'+
	'          <div class="row">'+
	'            <div class="col-lg-2">'+
	'            <button type="button" class="btn btn-success btn-block" onclick="App.respondPoint(' + index + ',' + true + ')">Verify</button>'+
	'            </div>'+
	'            <div class="col-lg-2">'+
	'            <button type="button" class="btn btn-danger btn-block" onclick="App.respondPoint(' + index + ',' + false + ')">Decline</button>'+
	'            </div>'+
	'          </div>'+
	'        </div>'+
	'        <br/>'+
	'      </div>';
	return myvar
}

$(function() {
	$(window).load(function() {
		App.init();
	});
}); 