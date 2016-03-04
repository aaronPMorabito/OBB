(function(angular){
	angular.module('rfduino-service', [])
	.service('rfduinoService', rfduinoService);

	rfduinoService.$inject = ['$q', '$timeout', '$window', 'settingsService'];
	function rfduinoService($q, $timeout, $window, settingsService) {
		var connectedDevice = {};
		var enabled = false;

		var service = {
			getConnectedDevice : getConnectedDevice,
			isEnabled : isEnabled,
			isConnected : isConnected,
			enable : enable,
			scanDevices : scanDevices,
			connect : function(device) {
				return connect(device);
			}
		};

		return service;

		function getConnectedDevice() {
			return connectedDevice;
		}

		function isEnabled() {
			var deferred = $q.defer();

			if ($window.rfduino && !enabled) {
				rfduino.isEnabled(function() {
					deferred.resolve("Bluetooth is enabled.");
					enabled = true;
				},
				function() {
					deferred.reject("Bluetooth is not enabled.");
					enabled = false;
				});
			}
			else if (enabled) {
				deferred.reslove("Bluetooth already enabled!");
			}
			else {
				deferred.reject("rfduino plug-in not loaded.");
			}

			return deferred.promise;
		}

		function isConnected() {
			var deferred = $q.defer();

			if ($window.rfduino && enabled) {
				rfduino.isConnected(function() {
					deferred.resolve("Device is connected.");
				},
				function() {
					deferred.reject("Device is not connected.");
				});
			}
			else if (!enabled) {
				deferred.reject("Bluetooth is not enabled!");
			}
			else {
				deferred.reject("rfduino plug-in not loaded.");
			}

			return deferred.promise;
		}

		function enable() {
			var deferred = $q.defer();

			if ($window.rfduino) {
				rfduino.list(function(devices) {
					deferred.resolve("Bluetooth enabled!");
					enabled = true;

					for (var index = 0; index < devices.length; index++) {
						if (devices[index].name === "OB 48") {
							rfduino.connectInsecure(devices[index].address, function() {
								console.log("yyay");
							}, function(reason) {
								console.log("fail : " + reason);
							});
						}
					}
				},
				function() {
					deferred.reject("Bluetooth was <b>not</b> enabled.");
				});
			}
			else if (enabled) {
				deferred.reslove("Bluetooth already enabled!");
			}
			else {
				deferred.reject("rfduino plug-in not loaded.");
			}

			return deferred.promise;
		}

		function scanDevices() {
			var deferred = $q.defer();

			if ($window.rfduino && enabled) {
				rfduino.discoverUnpaired(function(devices) {
					deferred.resolve(devices);
				},
				function() {
					deferred.reject("Could not find any devices.");
				});
			}
			else if (!enabled) {
				deferred.reject("Bluetooth is not enabled!");
			}
			else {
				deferred.reject("rfduino plug-in not loaded.");
			}

			return deferred.promise;
		}

		function connect(device) {
			var deferred = $q.defer();

			if ($window.rfduino && enabled) {
				rfduino.connect(device.address, function() {
					deferred.resolve("Connected to " + device.name + "!");
					connectedDevice = device;
					connected = true;

					/* Store MAC Address of connected device */
					settingsService.setSetting("mac_address", device.address);

					//rfduino.subscribe('\n', onReceive, onSubscribeFail);
				},
				function(error) {
					deferred.resolve("Failed to connected to " + device.name + "!");
					connectedDevice = {};
					connected = false;
				});
			}
			else if (!enabled) {
				deferred.reject("Bluetooth is not enabled!");
			}
			else {
				deferred.reject("rfduino plug-in not loaded.");
			}

			return deferred.promise;
		}

		function onReceive(data) {
			//TODO: Do something with the data
		}

		//TODO: Test subscribing with the device, otherwise may need read/timeouts
		function onSubscribeFail() {
			console.log("Failed to subscribe.");
		}
	};
})(angular);
