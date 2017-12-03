import totp from 'steam-totp';

export function generate(sharedSecret, identitySecret, timestamp, timeOffset) {
  let result = {
    authCode: '???',
    countDown: '???',
    confKey: '???',
    detailsKey: '???',
    allowKey: '???',
    cancelKey: '???'
  };

  let offset = parseInt(timeOffset, 10);
  if (isNaN(offset)) {
    offset = 0;
  }

  if (sharedSecret) {
    let countDown = 30 - (totp.time(offset) % 30);
    let authCode = totp.generateAuthCode(sharedSecret, offset);

    result.authCode = authCode;
    result.countDown = countDown;
  }

  if (identitySecret) {
    timestamp = parseInt(timestamp, 10);
    let time = totp.time(offset);

    if (!isNaN(timestamp)) {
      time = timestamp + offset;
    }

    ['conf', 'details', 'allow', 'cancel'].forEach((tag) => {
      result[tag + 'Key'] = totp.getConfirmationKey(identitySecret, time, tag);
    });
  }

  return result;
}
