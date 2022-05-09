init();

function save_options() {
	var name = $('#name').val();
	var email = $('#email').val();
	var tel = $('#tel').val();
	var location = $('input[name="location"]:checked').val();
	var location_id = $('input[name="location"]:checked').attr('id');
	var private_webhook_url = $('#private_webhook_url').val();
	var update_delay = $('#update_delay').val();
	var send_delay = $('#send_delay').val();
	var forced_reload = $('#forced_reload').val();
	var start_time = $('#start_date').val() + " " + $('#start_time').val();

	chrome.storage.sync.set({
		name: name,
		email: email,
		tel: tel,
		location: location,
		location_id: location_id,
		private_webhook_url: private_webhook_url,
		update_delay: update_delay,
		send_delay: send_delay,
		forced_reload: forced_reload,
		start_time: start_time
	}, function() {
		$('#status').text("Saving...");
		setTimeout(function() {
			$('#status').text("");
		}, 1000);
	});
}

$('#save_button').click(() => {
	save_options();
});

function RandBetween(min, max) {
	return Math.random() * max + min + 1;
}


function SendWebhook(url) {

	setTimeout(() => {
		fetch(url, {
			method: "post",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				allowed_mentions: {
					parse: ["users", "roles"],
				},
				embeds: [{
					color: 11730954,
					author: {
						name: "LAVISH LAB.",
						icon_url: "https://lavishlab.main.jp/icon128.png",
					},
					description: "Test Webhook",
					"fields": [{
						"name": "name",
						"value": $("#name").val() == "" ? "null" : $("#name").val()
					}, {
						"name": "e-mail",
						"value": $("#email").val() == "" ? "null" : $("#email").val()
					}
					, {
						"name": "tel",
						"value": $("#tel").val() == "" ? "null" : $("#tel").val()
					},
					{
						"name": "area",
						"value": (typeof $("input[name=location]:checked").val() == "undefined") ? "null" : $("input[name=location]:checked").val()
					}
					, {
						"name": "reload interval(ms)",
						"value": $("#update_delay").val() == "" ? "null" : $("#update_delay").val()
					}, {
						"name": "submit delay(ms)",
						"value": $("#send_delay").val() == "" ? "null" : $("#send_delay").val()
					}, {
						"name": "forced reload(ms)",
						"value": $("#forced_reload").val() == "" ? "null" : $("#forced_reload").val()
					}, {
						"name": "start time",
						"value": $("#start_date").val() == "" ? "null" : $("#start_date").val()
					}
					],
					footer: {
						text: "LAVISH LAB",
						icon_url: "https://lavishlab.main.jp/icon128.png",
					},
				}],
			}),
		});
		
/*
		fetch(url, {
				"method": "POST",
				"headers": {
					"Content-Type": "application/json"
				},
				"body": JSON.stringify({
					"embeds": [{
						"description": "Test Webhook",
						"color": 1106394,
						"timestamp": new Date(),
						"footer": {
							"icon_url": "icon128.png",
							"text": "LAVISH LAB."
						},
						"author": {
							"name": "LAVISH LAB.",
							"icon_url": "icon128.png"
						},
						"fields": [{
							"name": "名前",
							"value": $('#name').val()
						}, {
							"name": "E-mail",
							"value": $('#email').val()
						}, {
							"name": "電話番号",
							"value": $('#tel').val()
						}, {
							"name": "ロケーション",
							"value": $('input[name="location"]:checked').attr('id')
						}, {
							"name": "Update Delay",
							"value": $('#update_delay').val()
						}, {
							"name": "Confirm Delay",
							"value": $('#send_delay').val()
						}, {
							"name": "Forced Reload",
							"value": $('#forced_reload').val()
						}, {
							"name": "開始時刻",
							"value": $('#start_date').val() + " " + $('#start_time').val()
							// "value": $('#start_time').val().replace('T', ' ')
						}]
					}]
				})
			})
			.then(res => console.log(res))
			.catch(err => console.log(err));
*/
	}, RandBetween(1000, 15000));
}

function init() {

	$('#test_webhook_button').click(() => {
		if ($('#private_webhook_url').val() != "") {
			SendWebhook($('#private_webhook_url').val());
		}
	});
	

	$(document).on("click focus", "input", function () {
		$(this).select();
	});

	$(document).on('keyup', '#start_time', function (e) {
		console.log(e.keyCode);
		if (e.keyCode == 8) {
			return;
		}
		if ($(this).val().length == 2 || $(this).val().length == 5) {
			$(this).val($(this).val() + ":");
		}
	});

	chrome.storage.sync.get({
		name: '',
		email: '',
		tel: '',
		location: '',
		location_id: '',
		private_webhook_url: '',
		update_delay: '0',
		send_delay: '0',
		forced_reload: '0',
		start_time: ''
	}, function(res) {
		$('#name').val(res.name);
		$('#email').val(res.email);
		$('#tel').val(res.tel);
		if (res.location_id) {
			$("#" + res.location_id).prop("checked", true);
		}
		$('#private_webhook_url').val(res.private_webhook_url);
		$('#update_delay').val(res.update_delay);
		$('#send_delay').val(res.send_delay);
		$('#forced_reload').val(res.forced_reload);

		if (res.start_time.indexOf(" ") != -1) {
			var dt_tm = res.start_time.split(" ");
			$('#start_date').val(dt_tm[0]);
			$('#start_time').val(dt_tm[1]);
		}
	});
}
