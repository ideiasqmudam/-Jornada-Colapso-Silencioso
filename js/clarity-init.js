export function claritySetPage(page) {
  try { if (typeof clarity !== 'undefined') clarity('set', 'page', page); } catch (_) {}
}

export function claritySetSession(sid) {
  try { if (typeof clarity !== 'undefined') clarity('set', 'session_id', sid); } catch (_) {}
}

export function clarityIdentify(email) {
  try { if (typeof clarity !== 'undefined' && email) clarity('identify', email); } catch (_) {}
}
