/* ============================================================
   Store — the single persistence seam for the mini-games.
   get(key, default) / set(key, value) / remove(key) over
   localStorage. Every key is namespaced under PREFIX and every
   value is JSON. No game or the host touches localStorage
   directly, so the NEXT stage can swap this one module for a
   cloud-sync backend without touching any game.
   ============================================================ */
(function () {
  'use strict';

  var PREFIX = 'cg-';
  var SCHEMA_VERSION = 1;
  var mem = {};   // in-memory fallback when localStorage is unavailable (private mode, quota, etc.)

  function rawGet(k) {
    try { return localStorage.getItem(k); }
    catch (e) { return Object.prototype.hasOwnProperty.call(mem, k) ? mem[k] : null; }
  }
  function rawSet(k, v) {
    try { localStorage.setItem(k, v); }
    catch (e) { mem[k] = v; }
  }
  function rawRemove(k) {
    try { localStorage.removeItem(k); }
    catch (e) { delete mem[k]; }
  }

  function get(key, def) {
    var raw = rawGet(PREFIX + key);
    if (raw === null || raw === undefined) return def;
    try { return JSON.parse(raw); }
    catch (e) { return def; }
  }
  function set(key, value) { rawSet(PREFIX + key, JSON.stringify(value)); }
  function remove(key) { rawRemove(PREFIX + key); }

  // Stamp the schema version once, so a future migration can detect old saves.
  if (get('schemaVersion', null) === null) set('schemaVersion', SCHEMA_VERSION);

  window.Store = {
    get: get,
    set: set,
    remove: remove,
    PREFIX: PREFIX,
    schemaVersion: SCHEMA_VERSION
  };
})();
