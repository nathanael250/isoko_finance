const crypto = require('crypto')

const sec_key = crypto.randomBytes(64).toString('hex');
console.log(sec_key)