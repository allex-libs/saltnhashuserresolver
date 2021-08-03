function createLib (execlib) {
  'use strict';
  return execlib.loadDependencies('client', ['allex_userresolverlib', 'allex_saltandhashlib'], creator.bind(null, execlib));
}

function creator(execlib, userresolverlib, saltandhashlib) {
  'use strict';
  var ret = {
    fetchingjobs: userresolverlib.fetchingjobs,
    Base: userresolverlib.Base,
    PlainManipulator: userresolverlib.PlainManipulator,
    Crypter: require('./saltnhashcryptercreator')(execlib.lib, userresolverlib.Crypter, saltandhashlib)
  };
  return ret;
}
module.exports = createLib;
