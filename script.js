var $ = require('jquery');
var totp = require('steam-totp');

$(function() {
  var keys = localStorage.getItem('keys');

  if(keys) {
    var values = JSON.parse(keys);

    $('input[name="shared-secret"]').val(values.sharedSecret),
    $('input[name="identity-secret"]').val(values.identitySecret),
    $('input[name="time-offset"]').val(values.offset);
  }
});

$('input[name="save"]').click(function() {
  var values = {
    sharedSecret: $('input[name="shared-secret"]').val(),
    identitySecret: $('input[name="identity-secret"]').val(),
    offset: $('input[name="time-offset"]').val()
  };

  localStorage.setItem('keys', JSON.stringify(values));
});

$('input[name="clear"]').click(function() {
  localStorage.clear();
});

setInterval(function() {
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
    $('#auth-code').text('???');
    $('#auth-code-countdown').text('???');
  }

  if(identitySecret && identitySecret !== '') {
    var time = totp.time(offset);

    var confKey = totp.getConfirmationKey(identitySecret, time, 'conf');
    var detailsKey = totp.getConfirmationKey(identitySecret, time, 'details');
    var allowKey = totp.getConfirmationKey(identitySecret, time, 'allow');
    var cancelKey = totp.getConfirmationKey(identitySecret, time, 'cancel');

    $('#conf-key').text(confKey);
    $('#details-key').text(detailsKey);
    $('#allow-key').text(allowKey);
    $('#cancel-key').text(cancelKey);
  } else {
    $('#conf-key').text('???');
    $('#details-key').text('???');
    $('#allow-key').text('???');
    $('#cancel-key').text('???');
  }
}, 1000);
