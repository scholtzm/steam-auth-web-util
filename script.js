var $ = require('jquery');
var totp = require('steam-totp');

var GENERATION_DELAY = 1000;
var DUMMY_TEXT = '???';
var LOCALSTORAGE_KEY = 'sawu-keys';
var TAGS = ['conf', 'details', 'allow', 'cancel'];

function flashMessage(message, timeout) {
  timeout = timeout || 2000;
  var messageBox = $('.message');

  messageBox.text(message);
  setTimeout(function() {
    messageBox.text('');
  }, timeout);
}

function generate() {
  var sharedSecret = $('input[name="shared-secret"]').val();
  var identitySecret = $('input[name="identity-secret"]').val();
  var timeOffset = $('input[name="time-offset"]').val();

  var offset = parseInt(timeOffset, 10);
  if(offset === NaN) {
    offset = 0;
  }

  if(sharedSecret && sharedSecret !== '') {
    var countDown = 30 - (totp.time() % 30);
    var authCode = totp.generateAuthCode(sharedSecret, offset);

    $('#auth-code').text(authCode);
    $('#auth-code-countdown').text(countDown);
  } else {
    $('#auth-code').text(DUMMY_TEXT);
    $('#auth-code-countdown').text(DUMMY_TEXT);
  }

  if(identitySecret && identitySecret !== '') {
    var time = totp.time(offset);
    var keys = [];

    TAGS.forEach(function(tag) {
      keys.push(totp.getConfirmationKey(identitySecret, time, tag));
    });

    for(var i = 0; i < TAGS.length; i++) {
      $('#' + TAGS[i] + '-key').text(keys[i]);
    }
  } else {
    TAGS.forEach(function(tag) {
      $('#' + tag + '-key').text(DUMMY_TEXT);
    });
  }
}

$(function() {
  var keys = localStorage.getItem(LOCALSTORAGE_KEY);

  if(keys) {
    try {
      var values = JSON.parse(keys);

      $('input[name="shared-secret"]').val(values.sharedSecret),
      $('input[name="identity-secret"]').val(values.identitySecret),
      $('input[name="time-offset"]').val(values.offset);
    } catch(error) {
      // this should hopefully not happen
      console.log(error);
    }
  }

  generate();
  setInterval(generate, GENERATION_DELAY);
});

$('input[name="save"]').click(function() {
  var values = {
    sharedSecret: $('input[name="shared-secret"]').val(),
    identitySecret: $('input[name="identity-secret"]').val(),
    offset: $('input[name="time-offset"]').val()
  };

  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(values));
  flashMessage('Saved.');
});

$('input[name="clear"]').click(function() {
  localStorage.removeItem(LOCALSTORAGE_KEY);
  flashMessage('Cleared.');
});
