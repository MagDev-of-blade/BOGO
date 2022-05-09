var running = false;
var interval;
var request = false;
var send_data = {};
var name_name = "";
var name = "";
var email_name = "";
var email = "";
var tel_name = "";
var tel = "";
var area = "";
var token = "";
var formid = "";
var update_delay = 0;
var send_delay = 0;
var start_time = 0;

var status = "";
var log = "";
var logCache = "";

var updateWaitLog;
var waitStart;

function run (){
  running = true;
  clearInterval(updateWaitLog);
  clearTimeout(waitStart);
  chrome.storage.sync.get(['name', 'email', 'tel', 'update_delay', 'send_delay', 'forced_reload', 'location_id', 'running', 'start_time'],function (res){
    name = res.name;
    email = res.email;
    tel = res.tel;
    area = res.location_id;
    update_delay = parseInt(res.update_delay);
    send_delay = parseInt(res.send_delay);
    forced_reload = parseInt(res.forced_reload);
    start_time = res.start_time;
    
      
    var start = new Date(start_time).getTime();
    var now = new Date().getTime();
    var wait = start - now;
    
    logCache = log;
    updateWaitLog = setInterval(() => {
      addLogCache("Waiting");
    }, 1000);
    
    status = "wait";
    waitStart = setTimeout(()=>{
      clearInterval(updateWaitLog);
      addLog("Start");
      logCache = log;
      status = "run";
      waitUpdate();
    }, wait);
  });
  chrome.storage.sync.set({running:true});
}

function stop(){
  running = false;
  clearInterval(interval);
  clearInterval(updateWaitLog);
  addLog("Stop");
  status = "";
}

function waitUpdate(){
  if(running){
    try{
      $.ajax({
        url: 'https://japan.supremenewyork.com/',
        type:'GET',
      }).done(function(data) {
        addLogCache("Reload Wait");
        var submit_button = $(data).find('input[name="commit"]');
        if($(submit_button).val() != "Sign Up"){
          if(request){
            name_name = $(data).find('input[placeholder*="your name"]').attr('name');
            email_name = $(data).find('input[placeholder*="email"]').attr('name');
            tel_name = $(data).find('input[placeholder*="mobile phone"]').attr('name');
            token = $(data).find('input[name="token"]').val();
            formid = $(data).find('input[name="formid"]').val();
            send_data.agree = "on";
            send_data[name_name] = name;
            send_data[email_name] = email;
            send_data[tel_name] = tel;
            send_data.area = area;
            send_data.token = token;
            send_data.formid = formid;
            send_data.langage = "ja";
            send_data.commit = "Continue";
            
            clearInterval(interval);
            setTimeout(()=>{
              sendRequest();
              chrome.runtime.sendMessage({type: 'sendRequest'});
            }, send_delay);
          }else{
              addLog("Reload");
              openSupremePage();
          }
          running = false;
        }else{
          setTimeout(()=>{
            waitUpdate();
          }, update_delay);
        }
      }).fail(function(XMLHttpRequest, textStatus, errorThrown) {
        console.log(XMLHttpRequest);
        console.log(textStatus);
        console.log(errorThrown);
        addLog("Network Error");
        setTimeout(()=>{
          waitUpdate();
        }, update_delay);
      });
    }catch(e){
      console.log(e);
      addLog("Network Error");
      setTimeout(()=>{
        waitUpdate();
      }, update_delay);
    }
  }else{
    clearInterval(interval);
  }
}

function sendRequest(){
  $.ajax({
    url: 'https://japan.supremenewyork.com/',
    type:'POST',
    data : send_data,
  }).done(function(data, textStatus, jqXHR){
    console.log(data);
    console.log(textStatus);
    console.log(jqXHR.status);
    if($(data).find('.copy')[0].innerHTML === "Thank you."){
      chrome.runtime.sendMessage({type: 'requestComplete'});
      stop();
    }
  }).fail(function(XMLHttpRequest, textStatus, errorThrown){
    console.log(XMLHttpRequest.status);
    console.log(textStatus);
    console.log(errorThrown);
  });
}

function openSupremePage(){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.update(tabs[0].id, {url: "https://japan.supremenewyork.com/"});
  });
}

function logClear(){
      log = "";
      chrome.runtime.sendMessage({type: 'logUpdate'});
}

function addLog(text){
  var logDate = new Date();
  var logDateText = logDate.getHours() + ":" + logDate.getMinutes() + ":" + logDate.getSeconds() + ":" + logDate.getMilliseconds();
  log += text + " : " + logDateText + "<br>";
  chrome.runtime.sendMessage({type: 'logUpdate'});
}

function addLogCache(text){
  var logDate = new Date();
  var logDateText = logDate.getHours() + ":" + logDate.getMinutes() + ":" + logDate.getSeconds() + ":" + logDate.getMilliseconds();
  log = logCache + text + " : " + logDateText + "<br>";
  chrome.runtime.sendMessage({type: 'logUpdate'});
}

