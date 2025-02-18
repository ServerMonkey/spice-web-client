/*
 eyeOS Spice Web Client
Copyright (c) 2015 eyeOS S.L.

Contact Jose Carlos Norte (jose@eyeos.com) for more information about this software.

This program is free software; you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License version 3 as published by the
Free Software Foundation.

This program is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.  See the GNU Affero General Public License for more
details.

You should have received a copy of the GNU Affero General Public License
version 3 along with this program in the file "LICENSE".  If not, see
<http://www.gnu.org/licenses/agpl-3.0.txt>.

See www.eyeos.org for more details. All requests should be sent to licensing@eyeos.org

The interactive user interfaces in modified source and object code versions
of this program must display Appropriate Legal Notices, as required under
Section 5 of the GNU Affero General Public License version 3.

In accordance with Section 7(b) of the GNU Affero General Public License version 3,
these Appropriate Legal Notices must retain the display of the "Powered by
eyeos" logo and retain the original copyright notice. If the display of the
logo is not reasonably feasible for technical reasons, the Appropriate Legal Notices
must display the words "Powered by eyeos" and retain the original copyright notice.
 */
function getURLParameter (name) {
	return decodeURIComponent(
		(new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)')
			.exec(location.search) || [, ""])[1]
			.replace(/\+/g, '%20')
	) || null;
}


wdi.Debug.debug = false; //enable logging to javascript console
wdi.exceptionHandling = false; //disable "global try catch" to improve debugging
//if enabled, console errors do not include line numbers
//wdi.SeamlessIntegration = false; //enable window integration. (if disabled, full desktop is received)

wdi.IntegrationBenchmarkEnabled = false;// MS Excel loading time benchmark

function translate() {
	var langs = navigator.languages || [navigator.language || navigator.userLanguage];
	for (var i in langs) {
		var lang = langs[i];
		if (typeof translations[lang] == 'undefined') {
			lang = lang.substr(0, 2);
			if (typeof translations[lang] == 'undefined') {
				continue;
			}
		}
		tr = translations[lang]
		break;
	}

	for (var key in tr) {
		console.log("Translate " + key)
		$('#' + key).html(tr[key]);
		$('.tr-' + key).html(tr[key]);
	}
}

function start () {
	var testSessionStarted = false;

	translate();

	window.startTime = new Date();

	$('#getStats').click(function() {
		if (!testSessionStarted) {
			testSessionStarted = true;
			alert("Starting test session");
			wdi.DataLogger.startTestSession();
		} else {
			wdi.DataLogger.stopTestSession();
			testSessionStarted = false;
			var stats = wdi.DataLogger.getStats();
			console.log(stats);
			alert(stats);
		}
	});

	wdi.graphicDebug = new wdi.GraphicDebug({debugMode: false});
	app = new Application();

	window.vdiLoadTest = getURLParameter('vdiLoadTest') || false;
	var performanceTest = getURLParameter('performanceTest') || false;

	var f = function (action, params) {
		if (action == 'windowClosed') {
			$(params.canvas).remove();
			$(params.eventLayer).remove();
		} else if (action == 'windowMoved') {
			$(params.canvas).css({
				'top': params.info.top + 'px',
				'left': params.info.left + 'px'
			});
			$(params.eventLayer).css({
				'top': params.info.top + 'px',
				'left': params.info.left + 'px'
			});
		} else if (action == 'init' || action == 'windowCreated') {
			var item = null;
			var canvas = null;
			var eventlayer = null;
			var body = $('body');

			for (var i in params) {
				item = params[i];
				var position = item.position * 2;
				canvas = $(item.canvas).css({
					'zIndex': 10000 - position - 1,
					'position': 'absolute',
					'top': item.info.top + 'px',
					'left': item.info.left + 'px'
				});
				eventlayer = $(item.eventLayer).css({
					'top': item.info.top + 'px',
					'left': item.info.left + 'px',
					'zIndex': 10000 - position
				})
				body.append(canvas);
				body.append(eventlayer);
			}
		} else if (action == 'ready') {
			var width = $(window).width();
			var height = $(window).height();

			// launch tests
			if (performanceTest) {
				width = 800;
				height = 600;

				window.setTimeout(function () {
					if (!testSessionStarted) {
						testSessionStarted = true;
						window.performanceTest.runner.startPerformanceTest()
					}
				}, 3000);
			}

			login = document.getElementById("login");
			/*
			if (login != null && login.className == "") {
				height -= 40;
			}*/

			app.sendCommand('setResolution', {
				'width': width,
				'height': height
			});
			if (wdi.IntegrationBenchmarkEnabled) {
				$('#integrationBenchmark').css({'display': 'inline'});
				$('#launchWordButton').prop('disabled', false);
			}
		} else if (action == 'resolution') {

		} else if (action == 'windowMinimized') {
			//in eyeos, this should minimize the window, not close it
			$(params.canvas).css({'display': 'none'});
			$(params.eventLayer).css({'display': 'none'});
		} else if (action == 'windowMaximized') {
			$(params.canvas).css({
				'top': params.info.top + 'px',
				'left': params.info.left + 'px'
			});
			$(params.eventLayer).css({
				'top': params.info.top + 'px',
				'left': params.info.left + 'px'
			});
		} else if (action == 'windowRestored') {
			//in eyeos, this should restore the window
			$(params.canvas).css({'display': 'block'});
			$(params.eventLayer).css({'display': 'block'});
			$(params.canvas).css({
				'top': params.info.top + 'px',
				'left': params.info.left + 'px'
			});
			$(params.eventLayer).css({
				'top': params.info.top + 'px',
				'left': params.info.left + 'px'
			});
		} else if (action == 'windowFocused') {
			//debugger; //eyeos should move the window to front!
		} else if (action == 'timeLapseDetected') {
			wdi.Debug.log('Detected time lapse of ', params, 'seconds');
		} else if (action == 'error') {
			//closeSession();
		} else if ("checkResults") {
			var cnv = $('#canvas_0')[0];
			var ctx = cnv.getContext('2d');
			var currentImgData = ctx.getImageData(0, 0, cnv.width, cnv.height);
			var currArr = new Uint32Array(currentImgData.data.buffer);
			var firstArr = new Uint32Array(firstImageData);

			var errors = 0;
			var l = firstArr.length;
			do {
				if (firstArr[l] !== currArr[l] ) {
					errors++;
					console.log("FAIL!!!!!!!!!!!!!", l , ~~(l/1920), l%1920, parseInt(firstArr[l]).toString(2), parseInt(currArr[l]).toString(2));
					currArr[l] = (255 << 24) | 255; //RED
				}
			} while (l--);

			ctx.putImageData(currentImgData, 0, 0);

			var msg = 'Test finished: ' + errors + ' error found';
			if (errors) {
				console.error(msg);
			} else {
				console.log(msg);
			}
		}
	};

	$(window)['resize'](function () {
		width = $(window).width();
		height = $(window).height();

		login = document.getElementById("login");
		/*if (login != null) {
			if (login.className == "") {
				height -= 40;
			}
		}*/
		app.sendCommand('setResolution', {
			'width': width,
			'height': height
		});
	});

	var useWorkers = true;

	if (performanceTest) {
		useWorkers = false;
		jQuery.getScript("performanceTests/lib/iopacketfactory.js");
		jQuery.getScript("performanceTests/lib/testlauncher.js");
		jQuery.getScript("performanceTests/tests/wordscroll.js");
	}

	var data = {};

	// Client Id only makes sense when called from flexVDI client
	var hwaddress = read_cookie("hwaddress");
	if (hwaddress == null) {
		document.getElementById("showclientid").style.display = "none";
	}

	$("title").text((document.location.hostname || 'unknown'));

	inactivityTimeout = data['inactivity_timeout'] || 0
	if (inactivityTimeout > 0) {
		if (inactivityTimeout < inactivityGrace + 10)
			inactivityTimeout = 10
		else inactivityTimeout -= inactivityGrace
	}

	app.run({
		'callback': f,
		'context': this,
		'host': document.location.hostname,
		'port': 7200,
		'protocol': 'ws',
		'token': window.crypto.getRandomValues(new Uint32Array(4)).join(''),
		'vmHost': false,
		'vmPort': false,
		'useBus': false,
		'busHost': '0.0.0.0',
		'busPort': 61613,
		'busSubscriptions': ['/topic/00000000-0000-0000-0000-000000000000'],
		'busUser': '00000000-0000-0000-0000-000000000000',
		'busPass': 'potato',
        // Connection Control
		'connectionControl': false,
        'heartbeatToken': 'heartbeat',
		'heartbeatTimeout': 4000,//miliseconds
		'busFileServerBaseUrl': 'https://0.0.0.0/fileserver/',
		'layout': 'us',
		'useWorkers': useWorkers,
		'seamlessDesktopIntegration': false,
		'externalClipboardHandling': false,
		'disableClipboard': false,
		'layer': document.getElementById('screen'),
		'vmInfoToken': getURLParameter('vmInfoToken'),
		'canvasMargin': {
			'x': 0,
			'y': 0
		},
		//'language': navigator.language
	});

	window.addEventListener("message", receiveMessage, false);

	function receiveMessage(event) {
		/*if (!/^https:\/\/\w+\.rangeforce\.com$/.test(event.origin)) {
			console.log('Invalid postMessage origin detected!');
			return;
		}*/

		if (!event.data || !event.data.type) {
			console.log('No postMessage type specified!');
			return;
		}

		switch (event.data.type) {
			case 'keys':
				app.sendKeyList(event.data.keys);
				break;
			case 'clipboard':
				console.log(event.data.clipboard)
				app.agent.clipboardContent = event.data.clipboard;
				app.agent.sendGrab();
				app.agent.sendPaste();
				break;
		}
	}
}

function restart() {
	location.hash = '#refreshed';
	location.reload();
}

function startBenchmark () {
	$('#launchWordButton').text('Benchmarking...').prop('disabled', true);
	wdi.IntegrationBenchmark.launchApp(app.busConnection, function (elapsed) {
		$('#launchWordButton').remove();
		$('#integrationBenchmark').append('<div class="result">Total: ' + elapsed + ' ms</div>');
	});
}

function closeIntegrationBenchmark () {
	$('#integrationBenchmark').hide();
}

$(document).ready(start);
