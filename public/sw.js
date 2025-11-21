;(() => {
  'use strict'
  let e, t, a
  class s extends Error {
    details
    constructor(e, t) {
      ;(super(
        ((e, ...t) => {
          let a = e
          return (t.length > 0 && (a += ` :: ${JSON.stringify(t)}`), a)
        })(e, t)
      ),
        (this.name = e),
        (this.details = t))
    }
  }
  let r = {
      googleAnalytics: 'googleAnalytics',
      precache: 'precache-v2',
      prefix: 'serwist',
      runtime: 'runtime',
      suffix: 'undefined' != typeof registration ? registration.scope : '',
    },
    n = (e) => [r.prefix, e, r.suffix].filter((e) => e && e.length > 0).join('-'),
    i = {
      updateDetails: (e) => {
        var t = (t) => {
          let a = e[t]
          'string' == typeof a && (r[t] = a)
        }
        for (let e of Object.keys(r)) t(e)
      },
      getGoogleAnalyticsName: (e) => e || n(r.googleAnalytics),
      getPrecacheName: (e) => e || n(r.precache),
      getRuntimeName: (e) => e || n(r.runtime),
    }
  class c {
    promise
    resolve
    reject
    constructor() {
      this.promise = new Promise((e, t) => {
        ;((this.resolve = e), (this.reject = t))
      })
    }
  }
  function o(e, t) {
    let a = new URL(e)
    for (let e of t) a.searchParams.delete(e)
    return a.href
  }
  async function l(e, t, a, s) {
    let r = o(t.url, a)
    if (t.url === r) return e.match(t, s)
    let n = { ...s, ignoreSearch: !0 }
    for (let i of await e.keys(t, n)) if (r === o(i.url, a)) return e.match(i, s)
  }
  let h = new Set(),
    u = async () => {
      for (let e of h) await e()
    }
  function d(e) {
    return new Promise((t) => setTimeout(t, e))
  }
  let m = '-precache-',
    f = async (e, t = m) => {
      let a = (await self.caches.keys()).filter(
        (a) => a.includes(t) && a.includes(self.registration.scope) && a !== e
      )
      return (await Promise.all(a.map((e) => self.caches.delete(e))), a)
    },
    g = (e, t) => {
      let a = t()
      return (e.waitUntil(a), a)
    },
    p = (e, t) => t.some((t) => e instanceof t),
    w = new WeakMap(),
    y = new WeakMap(),
    _ = new WeakMap(),
    x = {
      get(e, t, a) {
        if (e instanceof IDBTransaction) {
          if ('done' === t) return w.get(e)
          if ('store' === t)
            return a.objectStoreNames[1] ? void 0 : a.objectStore(a.objectStoreNames[0])
        }
        return b(e[t])
      },
      set: (e, t, a) => ((e[t] = a), !0),
      has: (e, t) => (e instanceof IDBTransaction && ('done' === t || 'store' === t)) || t in e,
    }
  function b(e) {
    if (e instanceof IDBRequest) {
      let t = new Promise((t, a) => {
        let s = () => {
            ;(e.removeEventListener('success', r), e.removeEventListener('error', n))
          },
          r = () => {
            ;(t(b(e.result)), s())
          },
          n = () => {
            ;(a(e.error), s())
          }
        ;(e.addEventListener('success', r), e.addEventListener('error', n))
      })
      return (_.set(t, e), t)
    }
    if (y.has(e)) return y.get(e)
    let s = (function (e) {
      if ('function' == typeof e)
        return (
          a ||
          (a = [
            IDBCursor.prototype.advance,
            IDBCursor.prototype.continue,
            IDBCursor.prototype.continuePrimaryKey,
          ])
        ).includes(e)
          ? function (...t) {
              return (e.apply(R(this), t), b(this.request))
            }
          : function (...t) {
              return b(e.apply(R(this), t))
            }
      return (e instanceof IDBTransaction &&
        (function (e) {
          if (w.has(e)) return
          let t = new Promise((t, a) => {
            let s = () => {
                ;(e.removeEventListener('complete', r),
                  e.removeEventListener('error', n),
                  e.removeEventListener('abort', n))
              },
              r = () => {
                ;(t(), s())
              },
              n = () => {
                ;(a(e.error || new DOMException('AbortError', 'AbortError')), s())
              }
            ;(e.addEventListener('complete', r),
              e.addEventListener('error', n),
              e.addEventListener('abort', n))
          })
          w.set(e, t)
        })(e),
      p(e, t || (t = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction])))
        ? new Proxy(e, x)
        : e
    })(e)
    return (s !== e && (y.set(e, s), _.set(s, e)), s)
  }
  let R = (e) => _.get(e)
  function E(e, t, { blocked: a, upgrade: s, blocking: r, terminated: n } = {}) {
    let i = indexedDB.open(e, t),
      c = b(i)
    return (
      s &&
        i.addEventListener('upgradeneeded', (e) => {
          s(b(i.result), e.oldVersion, e.newVersion, b(i.transaction), e)
        }),
      a && i.addEventListener('blocked', (e) => a(e.oldVersion, e.newVersion, e)),
      c
        .then((e) => {
          ;(n && e.addEventListener('close', () => n()),
            r && e.addEventListener('versionchange', (e) => r(e.oldVersion, e.newVersion, e)))
        })
        .catch(() => {}),
      c
    )
  }
  let v = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'],
    q = ['put', 'add', 'delete', 'clear'],
    S = new Map()
  function D(e, t) {
    if (!(e instanceof IDBDatabase && !(t in e) && 'string' == typeof t)) return
    if (S.get(t)) return S.get(t)
    let a = t.replace(/FromIndex$/, ''),
      s = t !== a,
      r = q.includes(a)
    if (!(a in (s ? IDBIndex : IDBObjectStore).prototype) || !(r || v.includes(a))) return
    let n = async function (e, ...t) {
      let n = this.transaction(e, r ? 'readwrite' : 'readonly'),
        i = n.store
      return (s && (i = i.index(t.shift())), (await Promise.all([i[a](...t), r && n.done]))[0])
    }
    return (S.set(t, n), n)
  }
  x = ((e) => ({
    ...e,
    get: (t, a, s) => D(t, a) || e.get(t, a, s),
    has: (t, a) => !!D(t, a) || e.has(t, a),
  }))(x)
  let N = ['continue', 'continuePrimaryKey', 'advance'],
    P = {},
    T = new WeakMap(),
    C = new WeakMap(),
    k = {
      get(e, t) {
        if (!N.includes(t)) return e[t]
        let a = P[t]
        return (
          a ||
            (a = P[t] =
              function (...e) {
                T.set(this, C.get(this)[t](...e))
              }),
          a
        )
      },
    }
  async function* A(...e) {
    let t = this
    if ((t instanceof IDBCursor || (t = await t.openCursor(...e)), !t)) return
    let a = new Proxy(t, k)
    for (C.set(a, t), _.set(a, R(t)); t; )
      (yield a, (t = await (T.get(a) || t.continue())), T.delete(a))
  }
  function I(e, t) {
    return (
      (t === Symbol.asyncIterator && p(e, [IDBIndex, IDBObjectStore, IDBCursor])) ||
      ('iterate' === t && p(e, [IDBIndex, IDBObjectStore]))
    )
  }
  x = ((e) => ({
    ...e,
    get: (t, a, s) => (I(t, a) ? A : e.get(t, a, s)),
    has: (t, a) => I(t, a) || e.has(t, a),
  }))(x)
  let L = (e) => (e && 'object' == typeof e ? e : { handle: e })
  class U {
    handler
    match
    method
    catchHandler
    constructor(e, t, a = 'GET') {
      ;((this.handler = L(t)), (this.match = e), (this.method = a))
    }
    setCatchHandler(e) {
      this.catchHandler = L(e)
    }
  }
  class F extends U {
    _allowlist
    _denylist
    constructor(e, { allowlist: t = [/./], denylist: a = [] } = {}) {
      ;(super((e) => this._match(e), e), (this._allowlist = t), (this._denylist = a))
    }
    _match({ url: e, request: t }) {
      if (t && 'navigate' !== t.mode) return !1
      let a = e.pathname + e.search
      for (let e of this._denylist) if (e.test(a)) return !1
      return !!this._allowlist.some((e) => e.test(a))
    }
  }
  class M extends U {
    constructor(e, t, a) {
      super(
        ({ url: t }) => {
          let a = e.exec(t.href)
          if (a) return t.origin !== location.origin && 0 !== a.index ? void 0 : a.slice(1)
        },
        t,
        a
      )
    }
  }
  let O = async (e, t, a) => {
    let s = t.map((e, t) => ({ index: t, item: e })),
      r = async (e) => {
        let t = []
        for (;;) {
          let r = s.pop()
          if (!r) return e(t)
          let n = await a(r.item)
          t.push({ result: n, index: r.index })
        }
      },
      n = Array.from({ length: e }, () => new Promise(r))
    return (await Promise.all(n))
      .flat()
      .sort((e, t) => (e.index < t.index ? -1 : 1))
      .map((e) => e.result)
  }
  function B(e) {
    return 'string' == typeof e ? new Request(e) : e
  }
  class K {
    event
    request
    url
    params
    _cacheKeys = {}
    _strategy
    _handlerDeferred
    _extendLifetimePromises
    _plugins
    _pluginStateMap
    constructor(e, t) {
      for (let a of ((this.event = t.event),
      (this.request = t.request),
      t.url && ((this.url = t.url), (this.params = t.params)),
      (this._strategy = e),
      (this._handlerDeferred = new c()),
      (this._extendLifetimePromises = []),
      (this._plugins = [...e.plugins]),
      (this._pluginStateMap = new Map()),
      this._plugins))
        this._pluginStateMap.set(a, {})
      this.event.waitUntil(this._handlerDeferred.promise)
    }
    async fetch(e) {
      let { event: t } = this,
        a = B(e),
        r = await this.getPreloadResponse()
      if (r) return r
      let n = this.hasCallback('fetchDidFail') ? a.clone() : null
      try {
        for (let e of this.iterateCallbacks('requestWillFetch'))
          a = await e({ request: a.clone(), event: t })
      } catch (e) {
        if (e instanceof Error)
          throw new s('plugin-error-request-will-fetch', { thrownErrorMessage: e.message })
      }
      let i = a.clone()
      try {
        let e
        for (let s of ((e = await fetch(
          a,
          'navigate' === a.mode ? void 0 : this._strategy.fetchOptions
        )),
        this.iterateCallbacks('fetchDidSucceed')))
          e = await s({ event: t, request: i, response: e })
        return e
      } catch (e) {
        throw (
          n &&
            (await this.runCallbacks('fetchDidFail', {
              error: e,
              event: t,
              originalRequest: n.clone(),
              request: i.clone(),
            })),
          e
        )
      }
    }
    async fetchAndCachePut(e) {
      let t = await this.fetch(e),
        a = t.clone()
      return (this.waitUntil(this.cachePut(e, a)), t)
    }
    async cacheMatch(e) {
      let t,
        a = B(e),
        { cacheName: s, matchOptions: r } = this._strategy,
        n = await this.getCacheKey(a, 'read'),
        i = { ...r, cacheName: s }
      for (let e of ((t = await caches.match(n, i)),
      this.iterateCallbacks('cachedResponseWillBeUsed')))
        t =
          (await e({
            cacheName: s,
            matchOptions: r,
            cachedResponse: t,
            request: n,
            event: this.event,
          })) || void 0
      return t
    }
    async cachePut(e, t) {
      let a = B(e)
      await d(0)
      let r = await this.getCacheKey(a, 'write')
      if (!t)
        throw new s('cache-put-with-no-response', {
          url: new URL(String(r.url), location.href).href.replace(
            RegExp(`^${location.origin}`),
            ''
          ),
        })
      let n = await this._ensureResponseSafeToCache(t)
      if (!n) return !1
      let { cacheName: i, matchOptions: c } = this._strategy,
        o = await self.caches.open(i),
        h = this.hasCallback('cacheDidUpdate'),
        m = h ? await l(o, r.clone(), ['__WB_REVISION__'], c) : null
      try {
        await o.put(r, h ? n.clone() : n)
      } catch (e) {
        if (e instanceof Error) throw ('QuotaExceededError' === e.name && (await u()), e)
      }
      for (let e of this.iterateCallbacks('cacheDidUpdate'))
        await e({
          cacheName: i,
          oldResponse: m,
          newResponse: n.clone(),
          request: r,
          event: this.event,
        })
      return !0
    }
    async getCacheKey(e, t) {
      let a = `${e.url} | ${t}`
      if (!this._cacheKeys[a]) {
        let s = e
        for (let e of this.iterateCallbacks('cacheKeyWillBeUsed'))
          s = B(await e({ mode: t, request: s, event: this.event, params: this.params }))
        this._cacheKeys[a] = s
      }
      return this._cacheKeys[a]
    }
    hasCallback(e) {
      for (let t of this._strategy.plugins) if (e in t) return !0
      return !1
    }
    async runCallbacks(e, t) {
      for (let a of this.iterateCallbacks(e)) await a(t)
    }
    *iterateCallbacks(e) {
      for (let t of this._strategy.plugins)
        if ('function' == typeof t[e]) {
          let a = this._pluginStateMap.get(t),
            s = (s) => {
              let r = { ...s, state: a }
              return t[e](r)
            }
          yield s
        }
    }
    waitUntil(e) {
      return (this._extendLifetimePromises.push(e), e)
    }
    async doneWaiting() {
      let e
      for (; (e = this._extendLifetimePromises.shift()); ) await e
    }
    destroy() {
      this._handlerDeferred.resolve(null)
    }
    async getPreloadResponse() {
      if (
        this.event instanceof FetchEvent &&
        'navigate' === this.event.request.mode &&
        'preloadResponse' in this.event
      )
        try {
          let e = await this.event.preloadResponse
          if (e) return e
        } catch (e) {}
    }
    async _ensureResponseSafeToCache(e) {
      let t = e,
        a = !1
      for (let e of this.iterateCallbacks('cacheWillUpdate'))
        if (
          ((t = (await e({ request: this.request, response: t, event: this.event })) || void 0),
          (a = !0),
          !t)
        )
          break
      return (!a && t && 200 !== t.status && (t = void 0), t)
    }
  }
  class W {
    cacheName
    plugins
    fetchOptions
    matchOptions
    constructor(e = {}) {
      ;((this.cacheName = i.getRuntimeName(e.cacheName)),
        (this.plugins = e.plugins || []),
        (this.fetchOptions = e.fetchOptions),
        (this.matchOptions = e.matchOptions))
    }
    handle(e) {
      let [t] = this.handleAll(e)
      return t
    }
    handleAll(e) {
      e instanceof FetchEvent && (e = { event: e, request: e.request })
      let t = e.event,
        a = 'string' == typeof e.request ? new Request(e.request) : e.request,
        s = new K(
          this,
          e.url ? { event: t, request: a, url: e.url, params: e.params } : { event: t, request: a }
        ),
        r = this._getResponse(s, a, t),
        n = this._awaitComplete(r, s, a, t)
      return [r, n]
    }
    async _getResponse(e, t, a) {
      let r
      await e.runCallbacks('handlerWillStart', { event: a, request: t })
      try {
        if (((r = await this._handle(t, e)), void 0 === r || 'error' === r.type))
          throw new s('no-response', { url: t.url })
      } catch (s) {
        if (s instanceof Error) {
          for (let n of e.iterateCallbacks('handlerDidError'))
            if (void 0 !== (r = await n({ error: s, event: a, request: t }))) break
        }
        if (!r) throw s
      }
      for (let s of e.iterateCallbacks('handlerWillRespond'))
        r = await s({ event: a, request: t, response: r })
      return r
    }
    async _awaitComplete(e, t, a, s) {
      let r, n
      try {
        r = await e
      } catch {}
      try {
        ;(await t.runCallbacks('handlerDidRespond', { event: s, request: a, response: r }),
          await t.doneWaiting())
      } catch (e) {
        e instanceof Error && (n = e)
      }
      if (
        (await t.runCallbacks('handlerDidComplete', {
          event: s,
          request: a,
          response: r,
          error: n,
        }),
        t.destroy(),
        n)
      )
        throw n
    }
  }
  let j = {
    cacheWillUpdate: async ({ response: e }) => (200 === e.status || 0 === e.status ? e : null),
  }
  class $ extends W {
    _networkTimeoutSeconds
    constructor(e = {}) {
      ;(super(e),
        this.plugins.some((e) => 'cacheWillUpdate' in e) || this.plugins.unshift(j),
        (this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0))
    }
    async _handle(e, t) {
      let a,
        r = [],
        n = []
      if (this._networkTimeoutSeconds) {
        let { id: s, promise: i } = this._getTimeoutPromise({ request: e, logs: r, handler: t })
        ;((a = s), n.push(i))
      }
      let i = this._getNetworkPromise({ timeoutId: a, request: e, logs: r, handler: t })
      n.push(i)
      let c = await t.waitUntil((async () => (await t.waitUntil(Promise.race(n))) || (await i))())
      if (!c) throw new s('no-response', { url: e.url })
      return c
    }
    _getTimeoutPromise({ request: e, logs: t, handler: a }) {
      let s
      return {
        promise: new Promise((t) => {
          s = setTimeout(async () => {
            t(await a.cacheMatch(e))
          }, 1e3 * this._networkTimeoutSeconds)
        }),
        id: s,
      }
    }
    async _getNetworkPromise({ timeoutId: e, request: t, logs: a, handler: s }) {
      let r, n
      try {
        n = await s.fetchAndCachePut(t)
      } catch (e) {
        e instanceof Error && (r = e)
      }
      return (e && clearTimeout(e), (r || !n) && (n = await s.cacheMatch(t)), n)
    }
  }
  class H extends W {
    _networkTimeoutSeconds
    constructor(e = {}) {
      ;(super(e), (this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0))
    }
    async _handle(e, t) {
      let a, r
      try {
        let a = [t.fetch(e)]
        if (this._networkTimeoutSeconds) {
          let e = d(1e3 * this._networkTimeoutSeconds)
          a.push(e)
        }
        if (!(r = await Promise.race(a)))
          throw Error(
            `Timed out the network response after ${this._networkTimeoutSeconds} seconds.`
          )
      } catch (e) {
        e instanceof Error && (a = e)
      }
      if (!r) throw new s('no-response', { url: e.url, error: a })
      return r
    }
  }
  let G = 'requests',
    Q = 'queueName'
  class V {
    _db = null
    async addEntry(e) {
      let t = (await this.getDb()).transaction(G, 'readwrite', { durability: 'relaxed' })
      ;(await t.store.add(e), await t.done)
    }
    async getFirstEntryId() {
      let e = await this.getDb(),
        t = await e.transaction(G).store.openCursor()
      return t?.value.id
    }
    async getAllEntriesByQueueName(e) {
      let t = await this.getDb()
      return (await t.getAllFromIndex(G, Q, IDBKeyRange.only(e))) || []
    }
    async getEntryCountByQueueName(e) {
      return (await this.getDb()).countFromIndex(G, Q, IDBKeyRange.only(e))
    }
    async deleteEntry(e) {
      let t = await this.getDb()
      await t.delete(G, e)
    }
    async getFirstEntryByQueueName(e) {
      return await this.getEndEntryFromIndex(IDBKeyRange.only(e), 'next')
    }
    async getLastEntryByQueueName(e) {
      return await this.getEndEntryFromIndex(IDBKeyRange.only(e), 'prev')
    }
    async getEndEntryFromIndex(e, t) {
      let a = await this.getDb(),
        s = await a.transaction(G).store.index(Q).openCursor(e, t)
      return s?.value
    }
    async getDb() {
      return (
        this._db ||
          (this._db = await E('serwist-background-sync', 3, { upgrade: this._upgradeDb })),
        this._db
      )
    }
    _upgradeDb(e, t) {
      ;(t > 0 && t < 3 && e.objectStoreNames.contains(G) && e.deleteObjectStore(G),
        e
          .createObjectStore(G, { autoIncrement: !0, keyPath: 'id' })
          .createIndex(Q, Q, { unique: !1 }))
    }
  }
  class z {
    _queueName
    _queueDb
    constructor(e) {
      ;((this._queueName = e), (this._queueDb = new V()))
    }
    async pushEntry(e) {
      ;(delete e.id, (e.queueName = this._queueName), await this._queueDb.addEntry(e))
    }
    async unshiftEntry(e) {
      let t = await this._queueDb.getFirstEntryId()
      ;(t ? (e.id = t - 1) : delete e.id,
        (e.queueName = this._queueName),
        await this._queueDb.addEntry(e))
    }
    async popEntry() {
      return this._removeEntry(await this._queueDb.getLastEntryByQueueName(this._queueName))
    }
    async shiftEntry() {
      return this._removeEntry(await this._queueDb.getFirstEntryByQueueName(this._queueName))
    }
    async getAll() {
      return await this._queueDb.getAllEntriesByQueueName(this._queueName)
    }
    async size() {
      return await this._queueDb.getEntryCountByQueueName(this._queueName)
    }
    async deleteEntry(e) {
      await this._queueDb.deleteEntry(e)
    }
    async _removeEntry(e) {
      return (e && (await this.deleteEntry(e.id)), e)
    }
  }
  let J = [
    'method',
    'referrer',
    'referrerPolicy',
    'mode',
    'credentials',
    'cache',
    'redirect',
    'integrity',
    'keepalive',
  ]
  class X {
    _requestData
    static async fromRequest(e) {
      let t = { url: e.url, headers: {} }
      for (let a of ('GET' !== e.method && (t.body = await e.clone().arrayBuffer()),
      e.headers.forEach((e, a) => {
        t.headers[a] = e
      }),
      J))
        void 0 !== e[a] && (t[a] = e[a])
      return new X(t)
    }
    constructor(e) {
      ;('navigate' === e.mode && (e.mode = 'same-origin'), (this._requestData = e))
    }
    toObject() {
      let e = Object.assign({}, this._requestData)
      return (
        (e.headers = Object.assign({}, this._requestData.headers)),
        e.body && (e.body = e.body.slice(0)),
        e
      )
    }
    toRequest() {
      return new Request(this._requestData.url, this._requestData)
    }
    clone() {
      return new X(this.toObject())
    }
  }
  let Y = 'serwist-background-sync',
    Z = new Set(),
    ee = (e) => {
      let t = { request: new X(e.requestData).toRequest(), timestamp: e.timestamp }
      return (e.metadata && (t.metadata = e.metadata), t)
    }
  class et {
    _name
    _onSync
    _maxRetentionTime
    _queueStore
    _forceSyncFallback
    _syncInProgress = !1
    _requestsAddedDuringSync = !1
    constructor(e, { forceSyncFallback: t, onSync: a, maxRetentionTime: r } = {}) {
      if (Z.has(e)) throw new s('duplicate-queue-name', { name: e })
      ;(Z.add(e),
        (this._name = e),
        (this._onSync = a || this.replayRequests),
        (this._maxRetentionTime = r || 10080),
        (this._forceSyncFallback = !!t),
        (this._queueStore = new z(this._name)),
        this._addSyncListener())
    }
    get name() {
      return this._name
    }
    async pushRequest(e) {
      await this._addRequest(e, 'push')
    }
    async unshiftRequest(e) {
      await this._addRequest(e, 'unshift')
    }
    async popRequest() {
      return this._removeRequest('pop')
    }
    async shiftRequest() {
      return this._removeRequest('shift')
    }
    async getAll() {
      let e = await this._queueStore.getAll(),
        t = Date.now(),
        a = []
      for (let s of e) {
        let e = 60 * this._maxRetentionTime * 1e3
        t - s.timestamp > e ? await this._queueStore.deleteEntry(s.id) : a.push(ee(s))
      }
      return a
    }
    async size() {
      return await this._queueStore.size()
    }
    async _addRequest({ request: e, metadata: t, timestamp: a = Date.now() }, s) {
      let r = { requestData: (await X.fromRequest(e.clone())).toObject(), timestamp: a }
      switch ((t && (r.metadata = t), s)) {
        case 'push':
          await this._queueStore.pushEntry(r)
          break
        case 'unshift':
          await this._queueStore.unshiftEntry(r)
      }
      this._syncInProgress ? (this._requestsAddedDuringSync = !0) : await this.registerSync()
    }
    async _removeRequest(e) {
      let t,
        a = Date.now()
      switch (e) {
        case 'pop':
          t = await this._queueStore.popEntry()
          break
        case 'shift':
          t = await this._queueStore.shiftEntry()
      }
      if (t) {
        let s = 60 * this._maxRetentionTime * 1e3
        return a - t.timestamp > s ? this._removeRequest(e) : ee(t)
      }
    }
    async replayRequests() {
      let e
      for (; (e = await this.shiftRequest()); )
        try {
          await fetch(e.request.clone())
        } catch {
          throw (await this.unshiftRequest(e), new s('queue-replay-failed', { name: this._name }))
        }
    }
    async registerSync() {
      if ('sync' in self.registration && !this._forceSyncFallback)
        try {
          await self.registration.sync.register(`${Y}:${this._name}`)
        } catch (e) {}
    }
    _addSyncListener() {
      'sync' in self.registration && !this._forceSyncFallback
        ? self.addEventListener('sync', (e) => {
            if (e.tag === `${Y}:${this._name}`) {
              let t = async () => {
                let t
                this._syncInProgress = !0
                try {
                  await this._onSync({ queue: this })
                } catch (e) {
                  if (e instanceof Error) throw e
                } finally {
                  ;(this._requestsAddedDuringSync &&
                    !(t && !e.lastChance) &&
                    (await this.registerSync()),
                    (this._syncInProgress = !1),
                    (this._requestsAddedDuringSync = !1))
                }
              }
              e.waitUntil(t())
            }
          })
        : this._onSync({ queue: this })
    }
    static get _queueNames() {
      return Z
    }
  }
  class ea {
    _queue
    constructor(e, t) {
      this._queue = new et(e, t)
    }
    async fetchDidFail({ request: e }) {
      await this._queue.pushRequest({ request: e })
    }
  }
  let es = async (t, a) => {
    let r = null
    if ((t.url && (r = new URL(t.url).origin), r !== self.location.origin))
      throw new s('cross-origin-copy-response', { origin: r })
    let n = t.clone(),
      i = { headers: new Headers(n.headers), status: n.status, statusText: n.statusText },
      c = a ? a(i) : i,
      o = !(function () {
        if (void 0 === e) {
          let t = new Response('')
          if ('body' in t)
            try {
              ;(new Response(t.body), (e = !0))
            } catch {
              e = !1
            }
          e = !1
        }
        return e
      })()
        ? await n.blob()
        : n.body
    return new Response(o, c)
  }
  class er extends W {
    _fallbackToNetwork
    static defaultPrecacheCacheabilityPlugin = {
      cacheWillUpdate: async ({ response: e }) => (!e || e.status >= 400 ? null : e),
    }
    static copyRedirectedCacheableResponsesPlugin = {
      cacheWillUpdate: async ({ response: e }) => (e.redirected ? await es(e) : e),
    }
    constructor(e = {}) {
      ;((e.cacheName = i.getPrecacheName(e.cacheName)),
        super(e),
        (this._fallbackToNetwork = !1 !== e.fallbackToNetwork),
        this.plugins.push(er.copyRedirectedCacheableResponsesPlugin))
    }
    async _handle(e, t) {
      let a = await t.getPreloadResponse()
      if (a) return a
      let s = await t.cacheMatch(e)
      return (
        s ||
        (t.event && 'install' === t.event.type
          ? await this._handleInstall(e, t)
          : await this._handleFetch(e, t))
      )
    }
    async _handleFetch(e, t) {
      let a,
        r = t.params || {}
      if (this._fallbackToNetwork) {
        let s = r.integrity,
          n = e.integrity,
          i = !n || n === s
        ;((a = await t.fetch(
          new Request(e, { integrity: 'no-cors' !== e.mode ? n || s : void 0 })
        )),
          s &&
            i &&
            'no-cors' !== e.mode &&
            (this._useDefaultCacheabilityPluginIfNeeded(), await t.cachePut(e, a.clone())))
      } else throw new s('missing-precache-entry', { cacheName: this.cacheName, url: e.url })
      return a
    }
    async _handleInstall(e, t) {
      this._useDefaultCacheabilityPluginIfNeeded()
      let a = await t.fetch(e)
      if (!(await t.cachePut(e, a.clone())))
        throw new s('bad-precaching-response', { url: e.url, status: a.status })
      return a
    }
    _useDefaultCacheabilityPluginIfNeeded() {
      let e = null,
        t = 0
      for (let [a, s] of this.plugins.entries())
        s !== er.copyRedirectedCacheableResponsesPlugin &&
          (s === er.defaultPrecacheCacheabilityPlugin && (e = a), s.cacheWillUpdate && t++)
      0 === t
        ? this.plugins.push(er.defaultPrecacheCacheabilityPlugin)
        : t > 1 && null !== e && this.plugins.splice(e, 1)
    }
  }
  class en {
    updatedURLs = []
    notUpdatedURLs = []
    handlerWillStart = async ({ request: e, state: t }) => {
      t && (t.originalRequest = e)
    }
    cachedResponseWillBeUsed = async ({ event: e, state: t, cachedResponse: a }) => {
      if ('install' === e.type && t?.originalRequest && t.originalRequest instanceof Request) {
        let e = t.originalRequest.url
        a ? this.notUpdatedURLs.push(e) : this.updatedURLs.push(e)
      }
      return a
    }
  }
  let ei = (e) => {
    if (!e) throw new s('add-to-cache-list-unexpected-type', { entry: e })
    if ('string' == typeof e) {
      let t = new URL(e, location.href)
      return { cacheKey: t.href, url: t.href }
    }
    let { revision: t, url: a } = e
    if (!a) throw new s('add-to-cache-list-unexpected-type', { entry: e })
    if (!t) {
      let e = new URL(a, location.href)
      return { cacheKey: e.href, url: e.href }
    }
    let r = new URL(a, location.href),
      n = new URL(a, location.href)
    return (r.searchParams.set('__WB_REVISION__', t), { cacheKey: r.href, url: n.href })
  }
  class ec extends U {
    constructor(e, t) {
      super(({ request: a }) => {
        let s = e.getUrlsToPrecacheKeys()
        for (let r of (function* (
          e,
          {
            directoryIndex: t = 'index.html',
            ignoreURLParametersMatching: a = [/^utm_/, /^fbclid$/],
            cleanURLs: s = !0,
            urlManipulation: r,
          } = {}
        ) {
          let n = new URL(e, location.href)
          ;((n.hash = ''), yield n.href)
          let i = ((e, t = []) => {
            for (let a of [...e.searchParams.keys()])
              t.some((e) => e.test(a)) && e.searchParams.delete(a)
            return e
          })(n, a)
          if ((yield i.href, t && i.pathname.endsWith('/'))) {
            let e = new URL(i.href)
            ;((e.pathname += t), yield e.href)
          }
          if (s) {
            let e = new URL(i.href)
            ;((e.pathname += '.html'), yield e.href)
          }
          if (r) for (let e of r({ url: n })) yield e.href
        })(a.url, t)) {
          let t = s.get(r)
          if (t) {
            let a = e.getIntegrityForPrecacheKey(t)
            return { cacheKey: t, integrity: a }
          }
        }
      }, e.precacheStrategy)
    }
  }
  let eo = 'www.google-analytics.com',
    el = 'www.googletagmanager.com',
    eh = /^\/(\w+\/)?collect/,
    eu = ({ serwist: e, cacheName: t, ...a }) => {
      let s = i.getGoogleAnalyticsName(t),
        r = new ea('serwist-google-analytics', {
          maxRetentionTime: 2880,
          onSync: (
            (e) =>
            async ({ queue: t }) => {
              let a
              for (; (a = await t.shiftRequest()); ) {
                let { request: s, timestamp: r } = a,
                  n = new URL(s.url)
                try {
                  let t =
                      'POST' === s.method
                        ? new URLSearchParams(await s.clone().text())
                        : n.searchParams,
                    a = r - (Number(t.get('qt')) || 0),
                    i = Date.now() - a
                  if ((t.set('qt', String(i)), e.parameterOverrides))
                    for (let a of Object.keys(e.parameterOverrides)) {
                      let s = e.parameterOverrides[a]
                      t.set(a, s)
                    }
                  ;('function' == typeof e.hitFilter && e.hitFilter.call(null, t),
                    await fetch(
                      new Request(n.origin + n.pathname, {
                        body: t.toString(),
                        method: 'POST',
                        mode: 'cors',
                        credentials: 'omit',
                        headers: { 'Content-Type': 'text/plain' },
                      })
                    ))
                } catch (e) {
                  throw (await t.unshiftRequest(a), e)
                }
              }
            }
          )(a),
        })
      for (let t of [
        new U(
          ({ url: e }) => e.hostname === el && '/gtm.js' === e.pathname,
          new $({ cacheName: s }),
          'GET'
        ),
        new U(
          ({ url: e }) => e.hostname === eo && '/analytics.js' === e.pathname,
          new $({ cacheName: s }),
          'GET'
        ),
        new U(
          ({ url: e }) => e.hostname === el && '/gtag/js' === e.pathname,
          new $({ cacheName: s }),
          'GET'
        ),
        ...((e) => {
          let t = ({ url: e }) => e.hostname === eo && eh.test(e.pathname),
            a = new H({ plugins: [e] })
          return [new U(t, a, 'GET'), new U(t, a, 'POST')]
        })(r),
      ])
        e.registerRoute(t)
    }
  class ed {
    _fallbackUrls
    _serwist
    constructor({ fallbackUrls: e, serwist: t }) {
      ;((this._fallbackUrls = e), (this._serwist = t))
    }
    async handlerDidError(e) {
      for (let t of this._fallbackUrls)
        if ('string' == typeof t) {
          let e = await this._serwist.matchPrecache(t)
          if (void 0 !== e) return e
        } else if (t.matcher(e)) {
          let e = await this._serwist.matchPrecache(t.url)
          if (void 0 !== e) return e
        }
    }
  }
  class em {
    _precacheController
    constructor({ precacheController: e }) {
      this._precacheController = e
    }
    cacheKeyWillBeUsed = async ({ request: e, params: t }) => {
      let a = t?.cacheKey || this._precacheController.getPrecacheKeyForUrl(e.url)
      return a ? new Request(a, { headers: e.headers }) : e
    }
  }
  class ef {
    _urlsToCacheKeys = new Map()
    _urlsToCacheModes = new Map()
    _cacheKeysToIntegrities = new Map()
    _concurrentPrecaching
    _precacheStrategy
    _routes
    _defaultHandlerMap
    _catchHandler
    _requestRules
    constructor({
      precacheEntries: e,
      precacheOptions: t,
      skipWaiting: a = !1,
      importScripts: s,
      navigationPreload: r = !1,
      cacheId: n,
      clientsClaim: c = !1,
      runtimeCaching: o,
      offlineAnalyticsConfig: l,
      disableDevLogs: h = !1,
      fallbacks: u,
      requestRules: d,
    } = {}) {
      var m, g
      let {
        precacheStrategyOptions: p,
        precacheRouteOptions: w,
        precacheMiscOptions: y,
      } = ((e, t = {}) => {
        let {
          cacheName: a,
          plugins: s = [],
          fetchOptions: r,
          matchOptions: n,
          fallbackToNetwork: c,
          directoryIndex: o,
          ignoreURLParametersMatching: l,
          cleanURLs: h,
          urlManipulation: u,
          cleanupOutdatedCaches: d,
          concurrency: m = 10,
          navigateFallback: f,
          navigateFallbackAllowlist: g,
          navigateFallbackDenylist: p,
        } = t ?? {}
        return {
          precacheStrategyOptions: {
            cacheName: i.getPrecacheName(a),
            plugins: [...s, new em({ precacheController: e })],
            fetchOptions: r,
            matchOptions: n,
            fallbackToNetwork: c,
          },
          precacheRouteOptions: {
            directoryIndex: o,
            ignoreURLParametersMatching: l,
            cleanURLs: h,
            urlManipulation: u,
          },
          precacheMiscOptions: {
            cleanupOutdatedCaches: d,
            concurrency: m,
            navigateFallback: f,
            navigateFallbackAllowlist: g,
            navigateFallbackDenylist: p,
          },
        }
      })(this, t)
      if (
        ((this._concurrentPrecaching = y.concurrency),
        (this._precacheStrategy = new er(p)),
        (this._routes = new Map()),
        (this._defaultHandlerMap = new Map()),
        (this._requestRules = d),
        (this.handleInstall = this.handleInstall.bind(this)),
        (this.handleActivate = this.handleActivate.bind(this)),
        (this.handleFetch = this.handleFetch.bind(this)),
        (this.handleCache = this.handleCache.bind(this)),
        s && s.length > 0 && self.importScripts(...s),
        r &&
          self.registration?.navigationPreload &&
          self.addEventListener('activate', (e) => {
            e.waitUntil(self.registration.navigationPreload.enable().then(() => {}))
          }),
        void 0 !== n && ((m = { prefix: n }), i.updateDetails(m)),
        a
          ? self.skipWaiting()
          : self.addEventListener('message', (e) => {
              e.data && 'SKIP_WAITING' === e.data.type && self.skipWaiting()
            }),
        c && self.addEventListener('activate', () => self.clients.claim()),
        e && e.length > 0 && this.addToPrecacheList(e),
        y.cleanupOutdatedCaches &&
          ((g = p.cacheName),
          self.addEventListener('activate', (e) => {
            e.waitUntil(f(i.getPrecacheName(g)).then((e) => {}))
          })),
        this.registerRoute(new ec(this, w)),
        y.navigateFallback &&
          this.registerRoute(
            new F(this.createHandlerBoundToUrl(y.navigateFallback), {
              allowlist: y.navigateFallbackAllowlist,
              denylist: y.navigateFallbackDenylist,
            })
          ),
        void 0 !== l &&
          ('boolean' == typeof l ? l && eu({ serwist: this }) : eu({ ...l, serwist: this })),
        void 0 !== o)
      ) {
        if (void 0 !== u) {
          let e = new ed({ fallbackUrls: u.entries, serwist: this })
          o.forEach((t) => {
            t.handler instanceof W &&
              !t.handler.plugins.some((e) => 'handlerDidError' in e) &&
              t.handler.plugins.push(e)
          })
        }
        for (let e of o) this.registerCapture(e.matcher, e.handler, e.method)
      }
      h && (self.__WB_DISABLE_DEV_LOGS = !0)
    }
    get precacheStrategy() {
      return this._precacheStrategy
    }
    get routes() {
      return this._routes
    }
    addEventListeners() {
      ;(self.addEventListener('install', this.handleInstall),
        self.addEventListener('activate', this.handleActivate),
        self.addEventListener('fetch', this.handleFetch),
        self.addEventListener('message', this.handleCache))
    }
    addToPrecacheList(e) {
      let t = []
      for (let a of e) {
        'string' == typeof a
          ? t.push(a)
          : a && !a.integrity && void 0 === a.revision && t.push(a.url)
        let { cacheKey: e, url: r } = ei(a),
          n = 'string' != typeof a && a.revision ? 'reload' : 'default'
        if (this._urlsToCacheKeys.has(r) && this._urlsToCacheKeys.get(r) !== e)
          throw new s('add-to-cache-list-conflicting-entries', {
            firstEntry: this._urlsToCacheKeys.get(r),
            secondEntry: e,
          })
        if ('string' != typeof a && a.integrity) {
          if (
            this._cacheKeysToIntegrities.has(e) &&
            this._cacheKeysToIntegrities.get(e) !== a.integrity
          )
            throw new s('add-to-cache-list-conflicting-integrities', { url: r })
          this._cacheKeysToIntegrities.set(e, a.integrity)
        }
        ;(this._urlsToCacheKeys.set(r, e),
          this._urlsToCacheModes.set(r, n),
          t.length > 0 &&
            console.warn(`Serwist is precaching URLs without revision info: ${t.join(', ')}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`))
      }
    }
    handleInstall(e) {
      return (
        this.registerRequestRules(e),
        g(e, async () => {
          let t = new en()
          ;(this.precacheStrategy.plugins.push(t),
            await O(
              this._concurrentPrecaching,
              Array.from(this._urlsToCacheKeys.entries()),
              async ([t, a]) => {
                let s = this._cacheKeysToIntegrities.get(a),
                  r = this._urlsToCacheModes.get(t),
                  n = new Request(t, { integrity: s, cache: r, credentials: 'same-origin' })
                await Promise.all(
                  this.precacheStrategy.handleAll({
                    event: e,
                    request: n,
                    url: new URL(n.url),
                    params: { cacheKey: a },
                  })
                )
              }
            ))
          let { updatedURLs: a, notUpdatedURLs: s } = t
          return { updatedURLs: a, notUpdatedURLs: s }
        })
      )
    }
    async registerRequestRules(e) {
      if (this._requestRules && e?.addRoutes)
        try {
          ;(await e.addRoutes(this._requestRules), (this._requestRules = void 0))
        } catch (e) {
          throw e
        }
    }
    handleActivate(e) {
      return g(e, async () => {
        let e = await self.caches.open(this.precacheStrategy.cacheName),
          t = await e.keys(),
          a = new Set(this._urlsToCacheKeys.values()),
          s = []
        for (let r of t) a.has(r.url) || (await e.delete(r), s.push(r.url))
        return { deletedCacheRequests: s }
      })
    }
    handleFetch(e) {
      let { request: t } = e,
        a = this.handleRequest({ request: t, event: e })
      a && e.respondWith(a)
    }
    handleCache(e) {
      if (e.data && 'CACHE_URLS' === e.data.type) {
        let { payload: t } = e.data,
          a = Promise.all(
            t.urlsToCache.map((t) => {
              let a
              return (
                (a = 'string' == typeof t ? new Request(t) : new Request(...t)),
                this.handleRequest({ request: a, event: e })
              )
            })
          )
        ;(e.waitUntil(a), e.ports?.[0] && a.then(() => e.ports[0].postMessage(!0)))
      }
    }
    setDefaultHandler(e, t = 'GET') {
      this._defaultHandlerMap.set(t, L(e))
    }
    setCatchHandler(e) {
      this._catchHandler = L(e)
    }
    registerCapture(e, t, a) {
      let r = ((e, t, a) => {
        if ('string' == typeof e) {
          let s = new URL(e, location.href)
          return new U(({ url: e }) => e.href === s.href, t, a)
        }
        if (e instanceof RegExp) return new M(e, t, a)
        if ('function' == typeof e) return new U(e, t, a)
        if (e instanceof U) return e
        throw new s('unsupported-route-type', {
          moduleName: 'serwist',
          funcName: 'parseRoute',
          paramName: 'capture',
        })
      })(e, t, a)
      return (this.registerRoute(r), r)
    }
    registerRoute(e) {
      ;(this._routes.has(e.method) || this._routes.set(e.method, []),
        this._routes.get(e.method).push(e))
    }
    unregisterRoute(e) {
      if (!this._routes.has(e.method))
        throw new s('unregister-route-but-not-found-with-method', { method: e.method })
      let t = this._routes.get(e.method).indexOf(e)
      if (t > -1) this._routes.get(e.method).splice(t, 1)
      else throw new s('unregister-route-route-not-registered')
    }
    getUrlsToPrecacheKeys() {
      return this._urlsToCacheKeys
    }
    getPrecachedUrls() {
      return [...this._urlsToCacheKeys.keys()]
    }
    getPrecacheKeyForUrl(e) {
      let t = new URL(e, location.href)
      return this._urlsToCacheKeys.get(t.href)
    }
    getIntegrityForPrecacheKey(e) {
      return this._cacheKeysToIntegrities.get(e)
    }
    async matchPrecache(e) {
      let t = e instanceof Request ? e.url : e,
        a = this.getPrecacheKeyForUrl(t)
      if (a) return (await self.caches.open(this.precacheStrategy.cacheName)).match(a)
    }
    createHandlerBoundToUrl(e) {
      let t = this.getPrecacheKeyForUrl(e)
      if (!t) throw new s('non-precached-url', { url: e })
      return (a) => (
        (a.request = new Request(e)),
        (a.params = { cacheKey: t, ...a.params }),
        this.precacheStrategy.handle(a)
      )
    }
    handleRequest({ request: e, event: t }) {
      let a,
        s = new URL(e.url, location.href)
      if (!s.protocol.startsWith('http')) return
      let r = s.origin === location.origin,
        { params: n, route: i } = this.findMatchingRoute({
          event: t,
          request: e,
          sameOrigin: r,
          url: s,
        }),
        c = i?.handler,
        o = e.method
      if ((!c && this._defaultHandlerMap.has(o) && (c = this._defaultHandlerMap.get(o)), !c)) return
      try {
        a = c.handle({ url: s, request: e, event: t, params: n })
      } catch (e) {
        a = Promise.reject(e)
      }
      let l = i?.catchHandler
      return (
        a instanceof Promise &&
          (this._catchHandler || l) &&
          (a = a.catch(async (a) => {
            if (l)
              try {
                return await l.handle({ url: s, request: e, event: t, params: n })
              } catch (e) {
                e instanceof Error && (a = e)
              }
            if (this._catchHandler)
              return this._catchHandler.handle({ url: s, request: e, event: t })
            throw a
          })),
        a
      )
    }
    findMatchingRoute({ url: e, sameOrigin: t, request: a, event: s }) {
      for (let r of this._routes.get(a.method) || []) {
        let n,
          i = r.match({ url: e, sameOrigin: t, request: a, event: s })
        if (i)
          return (
            (Array.isArray((n = i)) && 0 === n.length) ||
            (i.constructor === Object && 0 === Object.keys(i).length)
              ? (n = void 0)
              : 'boolean' == typeof i && (n = void 0),
            { route: r, params: n }
          )
      }
      return {}
    }
  }
  'undefined' != typeof navigator && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  let eg = 'cache-entries',
    ep = (e) => {
      let t = new URL(e, location.href)
      return ((t.hash = ''), t.href)
    }
  class ew {
    _cacheName
    _db = null
    constructor(e) {
      this._cacheName = e
    }
    _getId(e) {
      return `${this._cacheName}|${ep(e)}`
    }
    _upgradeDb(e) {
      let t = e.createObjectStore(eg, { keyPath: 'id' })
      ;(t.createIndex('cacheName', 'cacheName', { unique: !1 }),
        t.createIndex('timestamp', 'timestamp', { unique: !1 }))
    }
    _upgradeDbAndDeleteOldDbs(e) {
      ;(this._upgradeDb(e),
        this._cacheName &&
          (function (e, { blocked: t } = {}) {
            let a = indexedDB.deleteDatabase(e)
            ;(t && a.addEventListener('blocked', (e) => t(e.oldVersion, e)),
              b(a).then(() => void 0))
          })(this._cacheName))
    }
    async setTimestamp(e, t) {
      e = ep(e)
      let a = { id: this._getId(e), cacheName: this._cacheName, url: e, timestamp: t },
        s = (await this.getDb()).transaction(eg, 'readwrite', { durability: 'relaxed' })
      ;(await s.store.put(a), await s.done)
    }
    async getTimestamp(e) {
      let t = await this.getDb(),
        a = await t.get(eg, this._getId(e))
      return a?.timestamp
    }
    async expireEntries(e, t) {
      let a = await this.getDb(),
        s = await a.transaction(eg, 'readwrite').store.index('timestamp').openCursor(null, 'prev'),
        r = [],
        n = 0
      for (; s; ) {
        let a = s.value
        ;(a.cacheName === this._cacheName &&
          ((e && a.timestamp < e) || (t && n >= t) ? (s.delete(), r.push(a.url)) : n++),
          (s = await s.continue()))
      }
      return r
    }
    async getDb() {
      return (
        this._db ||
          (this._db = await E('serwist-expiration', 1, {
            upgrade: this._upgradeDbAndDeleteOldDbs.bind(this),
          })),
        this._db
      )
    }
  }
  class ey {
    _isRunning = !1
    _rerunRequested = !1
    _maxEntries
    _maxAgeSeconds
    _matchOptions
    _cacheName
    _timestampModel
    constructor(e, t = {}) {
      ;((this._maxEntries = t.maxEntries),
        (this._maxAgeSeconds = t.maxAgeSeconds),
        (this._matchOptions = t.matchOptions),
        (this._cacheName = e),
        (this._timestampModel = new ew(e)))
    }
    async expireEntries() {
      if (this._isRunning) {
        this._rerunRequested = !0
        return
      }
      this._isRunning = !0
      let e = this._maxAgeSeconds ? Date.now() - 1e3 * this._maxAgeSeconds : 0,
        t = await this._timestampModel.expireEntries(e, this._maxEntries),
        a = await self.caches.open(this._cacheName)
      for (let e of t) await a.delete(e, this._matchOptions)
      ;((this._isRunning = !1),
        this._rerunRequested && ((this._rerunRequested = !1), this.expireEntries()))
    }
    async updateTimestamp(e) {
      await this._timestampModel.setTimestamp(e, Date.now())
    }
    async isURLExpired(e) {
      if (!this._maxAgeSeconds) return !1
      let t = await this._timestampModel.getTimestamp(e),
        a = Date.now() - 1e3 * this._maxAgeSeconds
      return void 0 === t || t < a
    }
    async delete() {
      ;((this._rerunRequested = !1), await this._timestampModel.expireEntries(1 / 0))
    }
  }
  class e_ {
    _config
    _cacheExpirations
    constructor(e = {}) {
      var t
      ;((this._config = e),
        (this._cacheExpirations = new Map()),
        this._config.maxAgeFrom || (this._config.maxAgeFrom = 'last-fetched'),
        this._config.purgeOnQuotaError && ((t = () => this.deleteCacheAndMetadata()), h.add(t)))
    }
    _getCacheExpiration(e) {
      if (e === i.getRuntimeName()) throw new s('expire-custom-caches-only')
      let t = this._cacheExpirations.get(e)
      return (t || ((t = new ey(e, this._config)), this._cacheExpirations.set(e, t)), t)
    }
    cachedResponseWillBeUsed({ event: e, cacheName: t, request: a, cachedResponse: s }) {
      if (!s) return null
      let r = this._isResponseDateFresh(s),
        n = this._getCacheExpiration(t),
        i = 'last-used' === this._config.maxAgeFrom,
        c = (async () => {
          ;(i && (await n.updateTimestamp(a.url)), await n.expireEntries())
        })()
      try {
        e.waitUntil(c)
      } catch {}
      return r ? s : null
    }
    _isResponseDateFresh(e) {
      if ('last-used' === this._config.maxAgeFrom) return !0
      let t = Date.now()
      if (!this._config.maxAgeSeconds) return !0
      let a = this._getDateHeaderTimestamp(e)
      return null === a || a >= t - 1e3 * this._config.maxAgeSeconds
    }
    _getDateHeaderTimestamp(e) {
      if (!e.headers.has('date')) return null
      let t = new Date(e.headers.get('date')).getTime()
      return Number.isNaN(t) ? null : t
    }
    async cacheDidUpdate({ cacheName: e, request: t }) {
      let a = this._getCacheExpiration(e)
      ;(await a.updateTimestamp(t.url), await a.expireEntries())
    }
    async deleteCacheAndMetadata() {
      for (let [e, t] of this._cacheExpirations) (await self.caches.delete(e), await t.delete())
      this._cacheExpirations = new Map()
    }
  }
  let ex = async (e, t) => {
    try {
      if (206 === t.status) return t
      let a = e.headers.get('range')
      if (!a) throw new s('no-range-header')
      let r = ((e) => {
          let t = e.trim().toLowerCase()
          if (!t.startsWith('bytes='))
            throw new s('unit-must-be-bytes', { normalizedRangeHeader: t })
          if (t.includes(',')) throw new s('single-range-only', { normalizedRangeHeader: t })
          let a = /(\d*)-(\d*)/.exec(t)
          if (!a || !(a[1] || a[2]))
            throw new s('invalid-range-values', { normalizedRangeHeader: t })
          return {
            start: '' === a[1] ? void 0 : Number(a[1]),
            end: '' === a[2] ? void 0 : Number(a[2]),
          }
        })(a),
        n = await t.blob(),
        i = ((e, t, a) => {
          let r,
            n,
            i = e.size
          if ((a && a > i) || (t && t < 0))
            throw new s('range-not-satisfiable', { size: i, end: a, start: t })
          return (
            void 0 !== t && void 0 !== a
              ? ((r = t), (n = a + 1))
              : void 0 !== t && void 0 === a
                ? ((r = t), (n = i))
                : void 0 !== a && void 0 === t && ((r = i - a), (n = i)),
            { start: r, end: n }
          )
        })(n, r.start, r.end),
        c = n.slice(i.start, i.end),
        o = c.size,
        l = new Response(c, { status: 206, statusText: 'Partial Content', headers: t.headers })
      return (
        l.headers.set('Content-Length', String(o)),
        l.headers.set('Content-Range', `bytes ${i.start}-${i.end - 1}/${n.size}`),
        l
      )
    } catch (e) {
      return new Response('', { status: 416, statusText: 'Range Not Satisfiable' })
    }
  }
  class eb {
    cachedResponseWillBeUsed = async ({ request: e, cachedResponse: t }) =>
      t && e.headers.has('range') ? await ex(e, t) : t
  }
  class eR extends W {
    async _handle(e, t) {
      let a,
        r = await t.cacheMatch(e)
      if (!r)
        try {
          r = await t.fetchAndCachePut(e)
        } catch (e) {
          e instanceof Error && (a = e)
        }
      if (!r) throw new s('no-response', { url: e.url, error: a })
      return r
    }
  }
  class eE extends W {
    constructor(e = {}) {
      ;(super(e), this.plugins.some((e) => 'cacheWillUpdate' in e) || this.plugins.unshift(j))
    }
    async _handle(e, t) {
      let a,
        r = t.fetchAndCachePut(e).catch(() => {})
      t.waitUntil(r)
      let n = await t.cacheMatch(e)
      if (n);
      else
        try {
          n = await r
        } catch (e) {
          e instanceof Error && (a = e)
        }
      if (!n) throw new s('no-response', { url: e.url, error: a })
      return n
    }
  }
  let ev = { rscPrefetch: 'pages-rsc-prefetch', rsc: 'pages-rsc', html: 'pages' },
    eq = [
      {
        matcher: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: new eR({
          cacheName: 'google-fonts-webfonts',
          plugins: [new e_({ maxEntries: 4, maxAgeSeconds: 31536e3, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: new eE({
          cacheName: 'google-fonts-stylesheets',
          plugins: [new e_({ maxEntries: 4, maxAgeSeconds: 604800, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
        handler: new eE({
          cacheName: 'static-font-assets',
          plugins: [new e_({ maxEntries: 4, maxAgeSeconds: 604800, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
        handler: new eE({
          cacheName: 'static-image-assets',
          plugins: [new e_({ maxEntries: 64, maxAgeSeconds: 2592e3, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\/_next\/static.+\.js$/i,
        handler: new eR({
          cacheName: 'next-static-js-assets',
          plugins: [new e_({ maxEntries: 64, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\/_next\/image\?url=.+$/i,
        handler: new eE({
          cacheName: 'next-image',
          plugins: [new e_({ maxEntries: 64, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\.(?:mp3|wav|ogg)$/i,
        handler: new eR({
          cacheName: 'static-audio-assets',
          plugins: [
            new e_({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' }),
            new eb(),
          ],
        }),
      },
      {
        matcher: /\.(?:mp4|webm)$/i,
        handler: new eR({
          cacheName: 'static-video-assets',
          plugins: [
            new e_({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' }),
            new eb(),
          ],
        }),
      },
      {
        matcher: /\.(?:js)$/i,
        handler: new eE({
          cacheName: 'static-js-assets',
          plugins: [new e_({ maxEntries: 48, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\.(?:css|less)$/i,
        handler: new eE({
          cacheName: 'static-style-assets',
          plugins: [new e_({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\/_next\/data\/.+\/.+\.json$/i,
        handler: new $({
          cacheName: 'next-data',
          plugins: [new e_({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      {
        matcher: /\.(?:json|xml|csv)$/i,
        handler: new $({
          cacheName: 'static-data-assets',
          plugins: [new e_({ maxEntries: 32, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
        }),
      },
      { matcher: /\/api\/auth\/.*/, handler: new H({ networkTimeoutSeconds: 10 }) },
      {
        matcher: ({ sameOrigin: e, url: { pathname: t } }) => e && t.startsWith('/api/'),
        method: 'GET',
        handler: new $({
          cacheName: 'apis',
          plugins: [new e_({ maxEntries: 16, maxAgeSeconds: 86400, maxAgeFrom: 'last-used' })],
          networkTimeoutSeconds: 10,
        }),
      },
      {
        matcher: ({ request: e, url: { pathname: t }, sameOrigin: a }) =>
          '1' === e.headers.get('RSC') &&
          '1' === e.headers.get('Next-Router-Prefetch') &&
          a &&
          !t.startsWith('/api/'),
        handler: new $({
          cacheName: ev.rscPrefetch,
          plugins: [new e_({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
      {
        matcher: ({ request: e, url: { pathname: t }, sameOrigin: a }) =>
          '1' === e.headers.get('RSC') && a && !t.startsWith('/api/'),
        handler: new $({
          cacheName: ev.rsc,
          plugins: [new e_({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
      {
        matcher: ({ request: e, url: { pathname: t }, sameOrigin: a }) =>
          e.headers.get('Content-Type')?.includes('text/html') && a && !t.startsWith('/api/'),
        handler: new $({
          cacheName: ev.html,
          plugins: [new e_({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
      {
        matcher: ({ url: { pathname: e }, sameOrigin: t }) => t && !e.startsWith('/api/'),
        handler: new $({
          cacheName: 'others',
          plugins: [new e_({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
      {
        matcher: ({ sameOrigin: e }) => !e,
        handler: new $({
          cacheName: 'cross-origin',
          plugins: [new e_({ maxEntries: 32, maxAgeSeconds: 3600 })],
          networkTimeoutSeconds: 10,
        }),
      },
      { matcher: /.*/i, method: 'GET', handler: new H() },
    ],
    eS = new ef({
      precacheEntries: [
        {
          revision: 'a25fc98704848104ee4b2bf32d633fb6',
          url: '/_next/static/WlpAsVBrLF3vmO4yVdSlb/_buildManifest.js',
        },
        {
          revision: 'b6652df95db52feb4daf4eca35380933',
          url: '/_next/static/WlpAsVBrLF3vmO4yVdSlb/_ssgManifest.js',
        },
        { revision: null, url: '/_next/static/chunks/1091.3e0f6ca343915ff4.js' },
        { revision: null, url: '/_next/static/chunks/1401.03ea562301633450.js' },
        { revision: null, url: '/_next/static/chunks/1555.28f005c9d5b223d2.js' },
        { revision: null, url: '/_next/static/chunks/2734.c54e8c4521886fc9.js' },
        { revision: null, url: '/_next/static/chunks/440.0aac126b2538078f.js' },
        { revision: null, url: '/_next/static/chunks/5538.8a1d222aa4464578.js' },
        { revision: null, url: '/_next/static/chunks/5618.6fcbdcd2474a39c6.js' },
        { revision: null, url: '/_next/static/chunks/6762.96525e4cffa539cb.js' },
        { revision: null, url: '/_next/static/chunks/7012.cdf6f12d35d1f581.js' },
        { revision: null, url: '/_next/static/chunks/7736.4b1a1ecde2a28337.js' },
        { revision: null, url: '/_next/static/chunks/7781.63a0f7cefa174de5.js' },
        { revision: null, url: '/_next/static/chunks/827.bf51314111519c40.js' },
        { revision: null, url: '/_next/static/chunks/966.50c1d8ebd75ec4e6.js' },
        { revision: null, url: '/_next/static/chunks/app/_not-found/page-13b71339cac3ea01.js' },
        {
          revision: null,
          url: '/_next/static/chunks/app/api/analytics/track/route-865928f052f9cc26.js',
        },
        { revision: null, url: '/_next/static/chunks/app/api/edge/chat/route-218f71e63cef4a44.js' },
        {
          revision: null,
          url: '/_next/static/chunks/app/api/edge/health/route-4a515925135e6891.js',
        },
        { revision: null, url: '/_next/static/chunks/app/api/metrics/route-6544ca00d978d810.js' },
        {
          revision: null,
          url: '/_next/static/chunks/app/api/monitoring/dashboard/route-a9aebf097bd7fd94.js',
        },
        {
          revision: null,
          url: '/_next/static/chunks/app/api/security/csp-report/route-e2d02ee7afb6b664.js',
        },
        {
          revision: null,
          url: '/_next/static/chunks/app/api/test-backend/route-31a6360d51c9fb89.js',
        },
        {
          revision: null,
          url: '/_next/static/chunks/app/api/web-vitals/route-c452eb01a97afb9b.js',
        },
        { revision: null, url: '/_next/static/chunks/app/auth/callback/route-0d127d5406f4ce0e.js' },
        { revision: null, url: '/_next/static/chunks/app/auth/error/page-a2597fe13a7093b7.js' },
        { revision: null, url: '/_next/static/chunks/app/en/about/page-7c79ae9284733f5b.js' },
        { revision: null, url: '/_next/static/chunks/app/en/agents/page-bcdcba73cb93f915.js' },
        { revision: null, url: '/_next/static/chunks/app/en/cookies/page-1fbd3a089b0b210c.js' },
        { revision: null, url: '/_next/static/chunks/app/en/layout-3f92e009ead8d8de.js' },
        { revision: null, url: '/_next/static/chunks/app/en/login/page-305c108b34a731ed.js' },
        { revision: null, url: '/_next/static/chunks/app/en/manifesto/page-1e943a45fcb5ac16.js' },
        { revision: null, url: '/_next/static/chunks/app/en/page-ca5ad78ebb4ee5a8.js' },
        { revision: null, url: '/_next/static/chunks/app/en/privacy/page-bebd2e3aea14851b.js' },
        { revision: null, url: '/_next/static/chunks/app/en/system/page-af4975217525f5a8.js' },
        { revision: null, url: '/_next/static/chunks/app/en/terms/page-946798d4a673f3db.js' },
        { revision: null, url: '/_next/static/chunks/app/layout-d13430aeff8e4f73.js' },
        { revision: null, url: '/_next/static/chunks/app/not-found-4845093b3a1938c4.js' },
        { revision: null, url: '/_next/static/chunks/app/page-56befa56576ecd51.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/about/page-4b8087e4d81c7886.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/agents/page-e0134ae17e31bf81.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/app/ajuda/page-2c4554da062c854f.js' },
        {
          revision: null,
          url: '/_next/static/chunks/app/pt/app/atividades/page-d7af66ffed71b98c.js',
        },
        { revision: null, url: '/_next/static/chunks/app/pt/app/chat/error-fc840b0bf1c8f498.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/app/chat/layout-acf6582e93f91a54.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/app/chat/page-410bb5eb13094cc9.js' },
        {
          revision: null,
          url: '/_next/static/chunks/app/pt/app/configuracoes/page-5f10adbbc3ce1de8.js',
        },
        {
          revision: null,
          url: '/_next/static/chunks/app/pt/app/dashboard/error-9e5c937672b73276.js',
        },
        {
          revision: null,
          url: '/_next/static/chunks/app/pt/app/dashboard/page-1f5b1f6b38a32f0a.js',
        },
        {
          revision: null,
          url: '/_next/static/chunks/app/pt/app/investigacoes/%5Bid%5D/page-a0e35349b4c62599.js',
        },
        {
          revision: null,
          url: '/_next/static/chunks/app/pt/app/investigacoes/error-0a3488364bb2ecee.js',
        },
        {
          revision: null,
          url: '/_next/static/chunks/app/pt/app/investigacoes/nova/page-aad2fd5223f7fa50.js',
        },
        {
          revision: null,
          url: '/_next/static/chunks/app/pt/app/investigacoes/page-af5b91e37348db5e.js',
        },
        { revision: null, url: '/_next/static/chunks/app/pt/app/layout-7e771f286ced5ed7.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/app/mapa/error-060aa0edae08daac.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/app/mapa/page-20852b21858864bf.js' },
        {
          revision: null,
          url: '/_next/static/chunks/app/pt/app/notificacoes/page-fa10627b74dd5c57.js',
        },
        { revision: null, url: '/_next/static/chunks/app/pt/app/page-7314265bc60f3865.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/app/perfil/page-2f3214533d0869b6.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/cookies/page-f7798ba376e302a5.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/debug/page-082d5d93f219695b.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/layout-8689a066642e3084.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/login/page-9c58da7c73f0f1fb.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/manifesto/page-e906041872808460.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/page-2c40e3554cc2c2ef.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/privacy/page-1e42cfec45bf180a.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/system/page-7eb120dfd0e36a97.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/terms/page-8839d1daf44d8438.js' },
        { revision: null, url: '/_next/static/chunks/app/pt/test-voice/page-1ae93ae918942775.js' },
        { revision: null, url: '/_next/static/chunks/commons-969154b10a817d3c.js' },
        { revision: null, url: '/_next/static/chunks/framework-b9fd9bcc3ecde907.js' },
        { revision: null, url: '/_next/static/chunks/main-388de7b2142a1859.js' },
        { revision: null, url: '/_next/static/chunks/main-app-c756c3415517cebc.js' },
        { revision: null, url: '/_next/static/chunks/npm.axios-52357ab39f878a5e.js' },
        { revision: null, url: '/_next/static/chunks/npm.buffer-8b931334c29c2077.js' },
        { revision: null, url: '/_next/static/chunks/npm.date-fns-21b41b03e7d3a9fc.js' },
        { revision: null, url: '/_next/static/chunks/npm.dompurify-37c071d742b7409f.js' },
        { revision: null, url: '/_next/static/chunks/npm.floating-ui-c40c518d78736d0f.js' },
        { revision: null, url: '/_next/static/chunks/npm.framer-motion-8b8b4a813d55c585.js' },
        { revision: null, url: '/_next/static/chunks/npm.lucide-react-7ab0f1ca7032675b.js' },
        {
          revision: null,
          url: '/_next/static/chunks/npm.mdast-util-from-markdown.42aba5244fb22042.js',
        },
        { revision: null, url: '/_next/static/chunks/npm.mdast-util-to-hast.337553d6ce49895b.js' },
        {
          revision: null,
          url: '/_next/static/chunks/npm.micromark-core-commonmark.e0d9b407d1fdf00f.js',
        },
        { revision: null, url: '/_next/static/chunks/npm.micromark.5483e8fa98861f71.js' },
        { revision: null, url: '/_next/static/chunks/npm.motion-dom-b4aec77698dec672.js' },
        { revision: null, url: '/_next/static/chunks/npm.next-dd8cd71f7cf70f05.js' },
        { revision: null, url: '/_next/static/chunks/npm.posthog-js-ffb89532afe4ae86.js' },
        {
          revision: null,
          url: '/_next/static/chunks/npm.property-information.0967aac879aa8a21.js',
        },
        { revision: null, url: '/_next/static/chunks/npm.radix-ui-7796d0ff80951e95.js' },
        { revision: null, url: '/_next/static/chunks/npm.sentry-143f520176879562.js' },
        { revision: null, url: '/_next/static/chunks/npm.sentry-internal-b9c3b1851d505a2f.js' },
        { revision: null, url: '/_next/static/chunks/npm.serwist-4e282398459c0078.js' },
        { revision: null, url: '/_next/static/chunks/npm.supabase-7764dfb5ba56fe88.js' },
        { revision: null, url: '/_next/static/chunks/npm.tailwind-merge-1e7679bd4d5737a0.js' },
        { revision: null, url: '/_next/static/chunks/npm.unified.fef57e3a9475b4c5.js' },
        { revision: null, url: '/_next/static/chunks/npm.vfile.67d48ddfdabda742.js' },
        { revision: null, url: '/_next/static/chunks/pages/_app-f3636a4d04e547a6.js' },
        { revision: null, url: '/_next/static/chunks/pages/_error-963cef5f83493350.js' },
        {
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
        },
        { revision: null, url: '/_next/static/chunks/runtime-5b8b6e184e242fcb.js' },
        { revision: null, url: '/_next/static/css/081a0afca5a9bd20.css' },
        { revision: null, url: '/_next/static/css/3561f2b654f6997e.css' },
        { revision: null, url: '/_next/static/css/59e882a6b4251a5a.css' },
        { revision: null, url: '/_next/static/css/8a38bb2669d7ed47.css' },
        {
          revision: '9dda5cfc9a46f256d0e131bb535e46f8',
          url: '/_next/static/media/19cfc7226ec3afaa-s.woff2',
        },
        {
          revision: '4e2553027f1d60eff32898367dd4d541',
          url: '/_next/static/media/21350d82a1f187e9-s.woff2',
        },
        {
          revision: '01ba6c2a184b8cba08b0d57167664d75',
          url: '/_next/static/media/8e9860b6e62d6359-s.woff2',
        },
        {
          revision: '9e494903d6b0ffec1a1e14d34427d44d',
          url: '/_next/static/media/ba9851c3c22cd980-s.woff2',
        },
        {
          revision: '027a89e9ab733a145db70f09b8a18b42',
          url: '/_next/static/media/c5fe6dc8356a8c31-s.woff2',
        },
        {
          revision: 'd54db44de5ccb18886ece2fda72bdfe0',
          url: '/_next/static/media/df0a9ae256c0569c-s.woff2',
        },
        {
          revision: '65850a373e258f1c897a2b3d75eb74de',
          url: '/_next/static/media/e4af272ccee01ff0-s.p.woff2',
        },
        { revision: '034a07c8d3ffb7ec41e056f2882b5905', url: '/agents/abaporu.png' },
        { revision: 'b4ad43fb8bb1f424b66073c467bf2338', url: '/agents/anita.png' },
        { revision: '9ffb17f4327de874233fadd1eaf78a92', url: '/agents/bonifacio.png' },
        { revision: 'baac0af4633720837f195a1c1102f22c', url: '/agents/ceuci.png' },
        { revision: 'da313e5d68cbfdee35257e25551ebb49', url: '/agents/dandara.png' },
        { revision: '81169571748984015960cefe953c1efa', url: '/agents/deodoro.png' },
        { revision: 'afaa7dcad48da5c380ff0efcd698fe54', url: '/agents/drummond.png' },
        { revision: '6cbcd2320b4e3f08da6c250dc8f6d343', url: '/agents/lampiao.png' },
        { revision: '4e3940b2e8c6e09d702941417c7287b5', url: '/agents/machado.png' },
        { revision: '776fb0a2dd718ef388692a458f68efb7', url: '/agents/nana.png' },
        { revision: '460e3f6c0e25a5d234fade3b4fc0304d', url: '/agents/niemeyer.png' },
        { revision: '7554770e0e6ac50796a5de88aee852a3', url: '/agents/obaluaie.png' },
        { revision: '7554770e0e6ac50796a5de88aee852a3', url: '/agents/oxossi.png' },
        { revision: 'bfa8ddb24283bab0a8149d8a6b3fed0c', url: '/agents/quiteria.png' },
        { revision: 'a2ec1bab4bb0a1e245130f83ba72ad8e', url: '/agents/senna.png' },
        { revision: 'afaa7dcad48da5c380ff0efcd698fe54', url: '/agents/system.png' },
        { revision: '4dcf49e42bf3b7eb56ab62f90c726862', url: '/agents/tiradentes.png' },
        { revision: '66f2b418c5c36590a113ea69e3fe1f19', url: '/agents/zumbi.png' },
        { revision: 'b493d4a37571499fd637895a729cc998', url: '/app-icon-base.png' },
        { revision: 'b493d4a37571499fd637895a729cc998', url: '/apple-touch-icon.png' },
        { revision: '29dee257874f2a3e406cb438cfd7d87f', url: '/brazil-states.json' },
        { revision: 'e6171c88d4e4f1fbee322f88056edbf7', url: '/docs/notas-de-pesquisa.pdf' },
        { revision: 'f217a86561269dee433faad08d450ba9', url: '/favicon.ico' },
        { revision: 'b493d4a37571499fd637895a729cc998', url: '/forum-icon.png' },
        { revision: 'b493d4a37571499fd637895a729cc998', url: '/icons/icon-128x128.png' },
        { revision: 'b493d4a37571499fd637895a729cc998', url: '/icons/icon-144x144.png' },
        { revision: 'b493d4a37571499fd637895a729cc998', url: '/icons/icon-152x152.png' },
        { revision: 'b493d4a37571499fd637895a729cc998', url: '/icons/icon-192x192.png' },
        { revision: 'b493d4a37571499fd637895a729cc998', url: '/icons/icon-384x384.png' },
        { revision: 'b493d4a37571499fd637895a729cc998', url: '/icons/icon-512x512.png' },
        { revision: 'b493d4a37571499fd637895a729cc998', url: '/icons/icon-72x72.png' },
        { revision: 'b493d4a37571499fd637895a729cc998', url: '/icons/icon-96x96.png' },
        { revision: 'e9b83ba14be5a390810d513321f218b3', url: '/images/Tarsila_Antropofagia.jpg' },
        { revision: '2064cf635f35b7da8deb625160a1db50', url: '/manifest.json' },
        { revision: '35b0c7f1c53c7460c1d572401d6f106c', url: '/operarios.png' },
        { revision: '96a769e34e6c9e373eecd1d828e14dfe', url: '/splash/apple-splash-1125-2436.png' },
        { revision: 'cf3f8c8cdbabc7c4f5d25ac60241c2e2', url: '/splash/apple-splash-1170-2532.png' },
        { revision: '6997668511fd926081a9aa6682ebede3', url: '/splash/apple-splash-1179-2556.png' },
        { revision: '298a9fcdb867c9978374a39626d2c391', url: '/splash/apple-splash-1284-2778.png' },
        { revision: 'b98ab4c120e54b1b54995e3d9cf258e2', url: '/splash/apple-splash-1290-2796.png' },
        { revision: '44cb8f47ce4ec81e0146e686434e4e02', url: '/splash/apple-splash-1536-2048.png' },
        { revision: 'b7d438bff41cd4056b6e8caae5a09270', url: '/splash/apple-splash-1640-2360.png' },
        { revision: 'd9bf30dd580a8356b83d16b9a1981f7b', url: '/splash/apple-splash-1668-2388.png' },
        { revision: '834bb9958eae62147fa270b0696d97ee', url: '/splash/apple-splash-2048-2732.png' },
        { revision: '1e0086c8f356f683105eeaa903f08739', url: '/splash/apple-splash-750-1334.png' },
        { revision: '1666c6f1e8ae3b302483082700dd1822', url: '/swe-worker-ab00d3c7d2d59769.js' },
      ],
      skipWaiting: !0,
      clientsClaim: !0,
      navigationPreload: !0,
      runtimeCaching: eq.map((e) => ({
        ...e,
        handler: {
          ...e.handler,
          handle: async (t) => {
            let a = await e.handler.handle(t)
            return (a && a.status >= 300 && a.status, a)
          },
        },
      })),
    })
  ;(self.addEventListener('install', (e) => {
    e.waitUntil(self.skipWaiting())
  }),
    self.addEventListener('activate', (e) => {
      e.waitUntil(
        Promise.all([
          caches
            .keys()
            .then((e) =>
              Promise.all(e.filter((e) => e.startsWith('serwist-')).map((e) => caches.delete(e)))
            ),
          self.clients.claim(),
        ])
      )
    }),
    self.addEventListener('fetch', (e) => {
      let t = new URL(e.request.url)
      if ('cidadao-api-production.up.railway.app' !== t.hostname) {
        if ('http:' === t.protocol && 'localhost' !== t.hostname)
          return void e.respondWith(
            new Response('Mixed Content: This request has been blocked', {
              status: 400,
              statusText: 'Bad Request - HTTP not allowed',
            })
          )
        if (
          'us.i.posthog.com' === t.hostname ||
          'us-assets.i.posthog.com' === t.hostname ||
          t.hostname.includes('sentry.io')
        )
          return void e.respondWith(
            fetch(e.request).catch(() => new Response(null, { status: 200 }))
          )
      }
    }),
    self.addEventListener('message', (e) => {
      e.data && 'SKIP_WAITING' === e.data.type && self.skipWaiting()
    }),
    eS.addEventListeners())
})()
