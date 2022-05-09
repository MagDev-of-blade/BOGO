var bgPage = chrome.extension.getBackgroundPage();
$(function() {
	console.log("debug: loginCheck");
	// ログインチェック
	loginCheck();
	$('#login_form').hide();
	$('#main_contents').show();
	var timer;
	var datetime = "";
	var localtime = "";
	var localmillsec = "";
	var nowdatetime = "";
	var start_time = 0;
	var update_time;
	var update_delay = 0;
	var send_delay = 0;
	var forced_reload = 0;
	$('#log').html(bgPage.log);
	update_time = new Date();
	$('#current-time').text(update_time.toLocaleString());
	setInterval(() => {
		update_time = new Date();
		$('#current-time').text(update_time.toLocaleString());
	}, 1000);
	chrome.storage.sync.get([
		'start_time',
		'send_delay',
		'forced_reload',
		'update_delay',
		'name',
		'email',
		'tel',
		'location_id'
	], function(res) {
		datetime = res.start_time;
		localtime = new Date(datetime);
		localmillsec = localtime.getTime();
		nowdatetime = new Date().getTime();
		start_time = (localmillsec - nowdatetime);
		$('#start-time').text(localtime.toLocaleString());
		$('#name').text(res.name);
		$('#email').text(res.email);
		$('#tel').text(res.tel);
		$('#area').text(res.location_id);
		update_delay = res.update_delay !== null && res.update_delay !==
			undefined && res.update_delay !== "" ? res.update_delay : 0;
		send_delay = res.send_delay !== null && res.send_delay !== undefined &&
			res.send_delay !== "" ? res.send_delay : 0;
		forced_reload = res.forced_reload !== null && res.forced_reload !== undefined &&
			res.forced_reload !== "" ? res.forced_reload : 0;
		$('#update_delay').text(update_delay + "ms");
		$('#send_delay').text(send_delay + "ms");
		$('#forced_reload').text(forced_reload + "ms");
	});
	$('#tab_main').show();
	$('#tab_profile').hide();
	$('#btn_tab_main').click(function() {
		$('#tab_main').show();
		$('#tab_profile').hide();
		changeTab('#btn_tab_main', '#btn_tab_profile');
	});
	$('#btn_tab_profile').click(function() {
		$('#tab_main').hide();
		$('#tab_profile').show();
		changeTab('#btn_tab_profile', '#btn_tab_main');
	});
	$("#start-btn").click(function() {
		if (start_time > 0) {
			$('#ready').show();
			$('#stoptext').hide();
		} else {
			$('#ready').hide();
			$('#stoptext').hide();
		}
		bgPage.openSupremePage();
		bgPage.run();
	});
	$('#stop-btn').click(function() {
		$('#ready').hide();
		$('#stoptext').show();
		clearTimeout(timer);
		var bgPage = chrome.extension.getBackgroundPage();
		bgPage.stop();
	});
	$('#auth_btn').click(() => {
		var email = $('#login_email').val();
		var password = $('#login_password').val();
		signInWithEmailPassword(email, password);
	});
	$('#logCopy_btn').click(() => {
		execCopy(bgPage.log);
	});
	$('#logClear_btn').click(() => {
		bgPage.logClear();
	});
	chrome.runtime.onMessage.addListener(function(req, sender, res) {
		if (req.type == 'logUpdate') {
			$('#log').html(bgPage.log);
			var log = document.getElementById('log');
			log.scrollTop = log.scrollHeight;
		}
		if (req.type == 'commit') {
			bgPage.addLog("Submit");
		}
		if (req.type == 'complete') {
			bgPage.addLog("Complete");
		}
	});
});

function changeTab(activeTabName, diactiveTabName) {
	$(activeTabName).removeClass('btn-outline-light');
	$(activeTabName).addClass('btn-light');
	$(diactiveTabName).removeClass('btn-light');
	$(diactiveTabName).addClass('btn-outline-light');
}

function loginCheck() {
	chrome.storage.sync.get([
		"expirationDate",
		"login_email",
		"password"
	], (res) => {

		$('#login_form').hide();
		$('#main_contents').hide();

		$('#login_email').val(res.login_email);
		$('#login_password').val(res.password);
		$('#login_form').show();
	});
}

function signInWithEmailPassword(email, password) {
	var commaCount = 0;
	const maxCommaCount = 3;
	var commaAnimation = setInterval(() => {
		var buttonText = "認証中";
		for (var i = 0; i < commaCount; i++) {
			buttonText += ".";
		}
		commaCount++;
		if (commaCount > maxCommaCount) {
			commaCount = 0;
		}
		$('#auth_btn').text(buttonText);
	}, 100);
	$.ajax({
		url: "https://lavishlab.main.jp/main.php?act=login",
		data: {
			bot_id: 'AC492478347FEA6ECB64B76836585FB08319E529',
			email: email,
			pass: password,
		},
		dataType: "json",
	}).done(function(r) {
		clearInterval(commaAnimation);
		if (r.success) {

			chrome.storage.sync.set({
				"login_email": email,
				"password": password,
				"token": r.token
			}, function() {
			});
		
			if (email != "admin@lavishlab.main.jp") {
				$("#log_title").hide();
				bgPage.logClear();
			}

			$('#main_contents').show();
			$('#login_form').hide();
		} else {
			$('#auth_btn').text("認証失敗");
			setTimeout(() => {
				$('#auth_btn').text("認証");
			}, 1000);
		}
	});
}

function execCopy(string) {
	// 空div 生成
	var tmp = document.createElement("div");
	// 選択用のタグ生成
	var pre = document.createElement('pre');
	// 親要素のCSSで user-select: none だとコピーできないので書き換える
	pre.style.webkitUserSelect = 'auto';
	pre.style.userSelect = 'auto';
	tmp.appendChild(pre).innerHTML = string;
	// 要素を画面外へ
	var s = tmp.style;
	s.position = 'fixed';
	s.right = '200%';
	// body に追加
	document.body.appendChild(tmp);
	// 要素を選択
	document.getSelection().selectAllChildren(tmp);
	// クリップボードにコピー
	var result = document.execCommand("copy");
	// 要素削除
	document.body.removeChild(tmp);
	return result;
}
