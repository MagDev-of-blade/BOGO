chrome.runtime.sendMessage({type: 'complete'});

chrome.storage.sync.get(['name', 'email', 'tel', 'update_delay', 'send_delay', 'forced_reload', 'location_id', 'start_time', 'request', 'private_webhook_url'], function(res){
	if (res.private_webhook_url != '') {
		SendWebhook(res.private_webhook_url, res);
	}
});

function SendWebhook(url, data){
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
						"value": data.name == "" ? "null" : data.name
					}, {
						"name": "e-mail",
						"value": data.email == "" ? "null" : data.email
					}
					, {
						"name": "tel",
						"value": data.tel == "" ? "null" : data.tel
					},
					{
						"name": "area",
						"value": data.location_id == "" ? "null" : data.location_id
					}
					, {
						"name": "reload interval(ms)",
						"value": data.update_delay == "" ? "null" : data.update_delay
					}, {
						"name": "submit delay(ms)",
						"value": data.send_delay == "" ? "null" : data.send_delay
					}, {
						"name": "forced reload(ms)",
						"value": data.forced_reload == "" ? "null" : data.forced_reload
					}, {
						"name": "start time",
						"value": data.start_time == "" ? "null" : data.start_time
					}
					],
					footer: {
						text: "LAVISH LAB",
						icon_url: "https://lavishlab.main.jp/icon128.png",
					},
				}],
			}),
		});		
	// fetch(url,
	// 	{
	// 	"method":"POST",
	// 	"headers": {"Content-Type": "application/json"},
	// 	"body": JSON.stringify({
	// 		"embeds":[
	// 		{
	// 			"description": "応募完了！",
	// 			"color": 1106394,
	// 			"timestamp": new Date(),
	// 			"footer": {
	// 			"icon_url": "icon128.png",
	// 			"text": "LAVISH LAB."
	// 			},
	// 			"author": {
	// 			"name": "LAVISH LAB.",
	// 			"icon_url": "icon128.png"
	// 			},
	// 			"fields": [
	// 			{
	// 				"name": "名前",
	// 				"value": data.name
	// 			},
	// 			{
	// 				"name": "E-mail",
	// 				"value": data.email
	// 			},
	// 			{
	// 				"name": "電話番号",
	// 				"value": data.tel
	// 			},
	// 			{
	// 				"name": "ロケーション",
	// 				"value": data.location_id
	// 			},
	// 			{
	// 				"name": "Update Delay",
	// 				"value": data.update_delay
	// 			},
	// 			{
	// 				"name": "Confirm Delay",
	// 				"value": data.send_delay
	// 			},
	// 			{
	// 				"name": "Forced Reload",
	// 				"value": data.forced_reload
	// 			},
	// 			{
	// 				"name": "開始時刻",
	// 				"value": data.start_time
	// 			}
	// 			]
	// 		}
	// 		]
	// 	})
	// 	})
	// 	.then(res=> console.log(res))
	// 	.catch(err => console.log(err));
	}, RandBetween(1000, 15000));
}

function RandBetween(min, max){
	return Math.random() * max + min + 1;
}
