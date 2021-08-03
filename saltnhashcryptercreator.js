function createSaltNHashCrypter (lib, Crypter, saltandhashlib) {
  'use strict';
  var q = lib.q,
    qlib = lib.qlib;

  function SaltNHashCrypter (prophash) {
    Crypter.call(this, prophash);
  }
  lib.inherit(SaltNHashCrypter, Crypter);
  SaltNHashCrypter.prototype.onDbSink = function (sink) {
    if (!(sink && sink.visibleFields && sink.visibleFields.indexOf('salt')>=0)){
      throw new lib.Error('NO_SALT_IN_DB_VISIBLE_FIELDS');
    }
    return Crypter.prototype.onDbSink.call(this, sink);
  };
  SaltNHashCrypter.prototype.match = function (credentials, dbhash) {
    var password;
    if (!dbhash) {
      return q(false);
    }
    if (!dbhash.salt) {
      return q(false);
    }
    password = this.passwordValueOf(credentials);
    if (!lib.isVal(password)) {
      return q(false);
    }
    return saltandhashlib.verifyPasswordOuter(
      password,
      dbhash.salt,
      Buffer(this.passwordValueOf(dbhash), 'hex')
    );
  };
  SaltNHashCrypter.prototype.encrypt = function (datahash) {
    return saltandhashlib.saltAndHashOuter(datahash[this.passwordcolumn], datahash, this.passwordcolumn).then(this.onSaltAndHash.bind(this));
  };
  SaltNHashCrypter.prototype.onSaltAndHash = function (datahash) {
    datahash[this.passwordcolumn] = datahash[this.passwordcolumn].toString('hex');
    return datahash;
  };
  SaltNHashCrypter.prototype.publicHash = function (datahash) {
    return lib.pickExcept(datahash, [this.passwordcolumn, 'salt']);
  };

  SaltNHashCrypter.prototype.dbChannelName = function () {
    return 'crypto';
  };

  return SaltNHashCrypter;
}
module.exports = createSaltNHashCrypter;
