try {
  !(function () {
    var e =
        'undefined' != typeof window
          ? window
          : 'undefined' != typeof global
            ? global
            : 'undefined' != typeof globalThis
              ? globalThis
              : 'undefined' != typeof self
                ? self
                : {},
      t = new e.Error().stack
    t &&
      ((e._sentryDebugIds = e._sentryDebugIds || {}),
      (e._sentryDebugIds[t] = '8aab2375-782f-4546-8054-f5a0c9070695'),
      (e._sentryDebugIdIdentifier = 'sentry-dbid-8aab2375-782f-4546-8054-f5a0c9070695'))
  })()
} catch (e) {}
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
    i = (e) => [r.prefix, e, r.suffix].filter((e) => e && e.length > 0).join('-'),
    n = {
      updateDetails: (e) => {
        var t = (t) => {
          let a = e[t]
          'string' == typeof a && (r[t] = a)
        }
        for (let e of Object.keys(r)) t(e)
      },
      getGoogleAnalyticsName: (e) => e || i(r.googleAnalytics),
      getPrecacheName: (e) => e || i(r.precache),
      getRuntimeName: (e) => e || i(r.runtime),
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
    let i = { ...s, ignoreSearch: !0 }
    for (let n of await e.keys(t, i)) if (r === o(n.url, a)) return e.match(n, s)
  }
  let h = new Set(),
    u = async () => {
      for (let e of h) await e()
    }
  function d(e) {
    return new Promise((t) => setTimeout(t, e))
  }
  let f = '-precache-',
    p = async (e, t = f) => {
      let a = (await self.caches.keys()).filter(
        (a) => a.includes(t) && a.includes(self.registration.scope) && a !== e
      )
      return (await Promise.all(a.map((e) => self.caches.delete(e))), a)
    },
    m = (e, t) => {
      let a = t()
      return (e.waitUntil(a), a)
    },
    g = (e, t) => t.some((t) => e instanceof t),
    w = new WeakMap(),
    y = new WeakMap(),
    _ = new WeakMap(),
    b = {
      get(e, t, a) {
        if (e instanceof IDBTransaction) {
          if ('done' === t) return w.get(e)
          if ('store' === t)
            return a.objectStoreNames[1] ? void 0 : a.objectStore(a.objectStoreNames[0])
        }
        return R(e[t])
      },
      set: (e, t, a) => ((e[t] = a), !0),
      has: (e, t) => (e instanceof IDBTransaction && ('done' === t || 'store' === t)) || t in e,
    }
  function R(e) {
    if (e instanceof IDBRequest) {
      let t = new Promise((t, a) => {
        let s = () => {
            ;(e.removeEventListener('success', r), e.removeEventListener('error', i))
          },
          r = () => {
            ;(t(R(e.result)), s())
          },
          i = () => {
            ;(a(e.error), s())
          }
        ;(e.addEventListener('success', r), e.addEventListener('error', i))
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
              return (e.apply(q(this), t), R(this.request))
            }
          : function (...t) {
              return R(e.apply(q(this), t))
            }
      return (e instanceof IDBTransaction &&
        (function (e) {
          if (w.has(e)) return
          let t = new Promise((t, a) => {
            let s = () => {
                ;(e.removeEventListener('complete', r),
                  e.removeEventListener('error', i),
                  e.removeEventListener('abort', i))
              },
              r = () => {
                ;(t(), s())
              },
              i = () => {
                ;(a(e.error || new DOMException('AbortError', 'AbortError')), s())
              }
            ;(e.addEventListener('complete', r),
              e.addEventListener('error', i),
              e.addEventListener('abort', i))
          })
          w.set(e, t)
        })(e),
      g(e, t || (t = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction])))
        ? new Proxy(e, b)
        : e
    })(e)
    return (s !== e && (y.set(e, s), _.set(s, e)), s)
  }
  let q = (e) => _.get(e)
  function E(e, t, { blocked: a, upgrade: s, blocking: r, terminated: i } = {}) {
    let n = indexedDB.open(e, t),
      c = R(n)
    return (
      s &&
        n.addEventListener('upgradeneeded', (e) => {
          s(R(n.result), e.oldVersion, e.newVersion, R(n.transaction), e)
        }),
      a && n.addEventListener('blocked', (e) => a(e.oldVersion, e.newVersion, e)),
      c
        .then((e) => {
          ;(i && e.addEventListener('close', () => i()),
            r && e.addEventListener('versionchange', (e) => r(e.oldVersion, e.newVersion, e)))
        })
        .catch(() => {}),
      c
    )
  }
  let v = ['get', 'getKey', 'getAll', 'getAllKeys', 'count'],
    x = ['put', 'add', 'delete', 'clear'],
    D = new Map()
  function S(e, t) {
    if (!(e instanceof IDBDatabase && !(t in e) && 'string' == typeof t)) return
    if (D.get(t)) return D.get(t)
    let a = t.replace(/FromIndex$/, ''),
      s = t !== a,
      r = x.includes(a)
    if (!(a in (s ? IDBIndex : IDBObjectStore).prototype) || !(r || v.includes(a))) return
    let i = async function (e, ...t) {
      let i = this.transaction(e, r ? 'readwrite' : 'readonly'),
        n = i.store
      return (s && (n = n.index(t.shift())), (await Promise.all([n[a](...t), r && i.done]))[0])
    }
    return (D.set(t, i), i)
  }
  b = ((e) => ({
    ...e,
    get: (t, a, s) => S(t, a) || e.get(t, a, s),
    has: (t, a) => !!S(t, a) || e.has(t, a),
  }))(b)
  let P = ['continue', 'continuePrimaryKey', 'advance'],
    N = {},
    T = new WeakMap(),
    C = new WeakMap(),
    k = {
      get(e, t) {
        if (!P.includes(t)) return e[t]
        let a = N[t]
        return (
          a ||
            (a = N[t] =
              function (...e) {
                T.set(this, C.get(this)[t](...e))
              }),
          a
        )
      },
    }
  async function* I(...e) {
    let t = this
    if ((t instanceof IDBCursor || (t = await t.openCursor(...e)), !t)) return
    let a = new Proxy(t, k)
    for (C.set(a, t), _.set(a, q(t)); t; )
      (yield a, (t = await (T.get(a) || t.continue())), T.delete(a))
  }
  function U(e, t) {
    return (
      (t === Symbol.asyncIterator && g(e, [IDBIndex, IDBObjectStore, IDBCursor])) ||
      ('iterate' === t && g(e, [IDBIndex, IDBObjectStore]))
    )
  }
  b = ((e) => ({
    ...e,
    get: (t, a, s) => (U(t, a) ? I : e.get(t, a, s)),
    has: (t, a) => U(t, a) || e.has(t, a),
  }))(b)
  let L = (e) => (e && 'object' == typeof e ? e : { handle: e })
  class A {
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
  class M extends A {
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
  class O extends A {
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
  let B = async (e, t, a) => {
    let s = t.map((e, t) => ({ index: t, item: e })),
      r = async (e) => {
        let t = []
        for (;;) {
          let r = s.pop()
          if (!r) return e(t)
          let i = await a(r.item)
          t.push({ result: i, index: r.index })
        }
      },
      i = Array.from({ length: e }, () => new Promise(r))
    return (await Promise.all(i))
      .flat()
      .sort((e, t) => (e.index < t.index ? -1 : 1))
      .map((e) => e.result)
  }
  function K(e) {
    return 'string' == typeof e ? new Request(e) : e
  }
  class F {
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
        a = K(e),
        r = await this.getPreloadResponse()
      if (r) return r
      let i = this.hasCallback('fetchDidFail') ? a.clone() : null
      try {
        for (let e of this.iterateCallbacks('requestWillFetch'))
          a = await e({ request: a.clone(), event: t })
      } catch (e) {
        if (e instanceof Error)
          throw new s('plugin-error-request-will-fetch', { thrownErrorMessage: e.message })
      }
      let n = a.clone()
      try {
        let e
        for (let s of ((e = await fetch(
          a,
          'navigate' === a.mode ? void 0 : this._strategy.fetchOptions
        )),
        this.iterateCallbacks('fetchDidSucceed')))
          e = await s({ event: t, request: n, response: e })
        return e
      } catch (e) {
        throw (
          i &&
            (await this.runCallbacks('fetchDidFail', {
              error: e,
              event: t,
              originalRequest: i.clone(),
              request: n.clone(),
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
        a = K(e),
        { cacheName: s, matchOptions: r } = this._strategy,
        i = await this.getCacheKey(a, 'read'),
        n = { ...r, cacheName: s }
      for (let e of ((t = await caches.match(i, n)),
      this.iterateCallbacks('cachedResponseWillBeUsed')))
        t =
          (await e({
            cacheName: s,
            matchOptions: r,
            cachedResponse: t,
            request: i,
            event: this.event,
          })) || void 0
      return t
    }
    async cachePut(e, t) {
      let a = K(e)
      await d(0)
      let r = await this.getCacheKey(a, 'write')
      if (!t)
        throw new s('cache-put-with-no-response', {
          url: new URL(String(r.url), location.href).href.replace(
            RegExp(`^${location.origin}`),
            ''
          ),
        })
      let i = await this._ensureResponseSafeToCache(t)
      if (!i) return !1
      let { cacheName: n, matchOptions: c } = this._strategy,
        o = await self.caches.open(n),
        h = this.hasCallback('cacheDidUpdate'),
        f = h ? await l(o, r.clone(), ['__WB_REVISION__'], c) : null
      try {
        await o.put(r, h ? i.clone() : i)
      } catch (e) {
        if (e instanceof Error) throw ('QuotaExceededError' === e.name && (await u()), e)
      }
      for (let e of this.iterateCallbacks('cacheDidUpdate'))
        await e({
          cacheName: n,
          oldResponse: f,
          newResponse: i.clone(),
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
          s = K(await e({ mode: t, request: s, event: this.event, params: this.params }))
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
      ;((this.cacheName = n.getRuntimeName(e.cacheName)),
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
        s = new F(
          this,
          e.url ? { event: t, request: a, url: e.url, params: e.params } : { event: t, request: a }
        ),
        r = this._getResponse(s, a, t),
        i = this._awaitComplete(r, s, a, t)
      return [r, i]
    }
    async _getResponse(e, t, a) {
      let r
      await e.runCallbacks('handlerWillStart', { event: a, request: t })
      try {
        if (((r = await this._handle(t, e)), void 0 === r || 'error' === r.type))
          throw new s('no-response', { url: t.url })
      } catch (s) {
        if (s instanceof Error) {
          for (let i of e.iterateCallbacks('handlerDidError'))
            if (void 0 !== (r = await i({ error: s, event: a, request: t }))) break
        }
        if (!r) throw s
      }
      for (let s of e.iterateCallbacks('handlerWillRespond'))
        r = await s({ event: a, request: t, response: r })
      return r
    }
    async _awaitComplete(e, t, a, s) {
      let r, i
      try {
        r = await e
      } catch {}
      try {
        ;(await t.runCallbacks('handlerDidRespond', { event: s, request: a, response: r }),
          await t.doneWaiting())
      } catch (e) {
        e instanceof Error && (i = e)
      }
      if (
        (await t.runCallbacks('handlerDidComplete', {
          event: s,
          request: a,
          response: r,
          error: i,
        }),
        t.destroy(),
        i)
      )
        throw i
    }
  }
  let j = {
    cacheWillUpdate: async ({ response: e }) => (200 === e.status || 0 === e.status ? e : null),
  }
  class H extends W {
    _networkTimeoutSeconds
    constructor(e = {}) {
      ;(super(e),
        this.plugins.some((e) => 'cacheWillUpdate' in e) || this.plugins.unshift(j),
        (this._networkTimeoutSeconds = e.networkTimeoutSeconds || 0))
    }
    async _handle(e, t) {
      let a,
        r = [],
        i = []
      if (this._networkTimeoutSeconds) {
        let { id: s, promise: n } = this._getTimeoutPromise({ request: e, logs: r, handler: t })
        ;((a = s), i.push(n))
      }
      let n = this._getNetworkPromise({ timeoutId: a, request: e, logs: r, handler: t })
      i.push(n)
      let c = await t.waitUntil((async () => (await t.waitUntil(Promise.race(i))) || (await n))())
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
      let r, i
      try {
        i = await s.fetchAndCachePut(t)
      } catch (e) {
        e instanceof Error && (r = e)
      }
      return (e && clearTimeout(e), (r || !i) && (i = await s.cacheMatch(t)), i)
    }
  }
  class $ extends W {
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
    let i = t.clone(),
      n = { headers: new Headers(i.headers), status: i.status, statusText: i.statusText },
      c = a ? a(n) : n,
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
        ? await i.blob()
        : i.body
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
      ;((e.cacheName = n.getPrecacheName(e.cacheName)),
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
          i = e.integrity,
          n = !i || i === s
        ;((a = await t.fetch(
          new Request(e, { integrity: 'no-cors' !== e.mode ? i || s : void 0 })
        )),
          s &&
            n &&
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
  class ei {
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
  let en = (e) => {
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
      i = new URL(a, location.href)
    return (r.searchParams.set('__WB_REVISION__', t), { cacheKey: r.href, url: i.href })
  }
  class ec extends A {
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
          let i = new URL(e, location.href)
          ;((i.hash = ''), yield i.href)
          let n = ((e, t = []) => {
            for (let a of [...e.searchParams.keys()])
              t.some((e) => e.test(a)) && e.searchParams.delete(a)
            return e
          })(i, a)
          if ((yield n.href, t && n.pathname.endsWith('/'))) {
            let e = new URL(n.href)
            ;((e.pathname += t), yield e.href)
          }
          if (s) {
            let e = new URL(n.href)
            ;((e.pathname += '.html'), yield e.href)
          }
          if (r) for (let e of r({ url: i })) yield e.href
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
      let s = n.getGoogleAnalyticsName(t),
        r = new ea('serwist-google-analytics', {
          maxRetentionTime: 2880,
          onSync: (
            (e) =>
            async ({ queue: t }) => {
              let a
              for (; (a = await t.shiftRequest()); ) {
                let { request: s, timestamp: r } = a,
                  i = new URL(s.url)
                try {
                  let t =
                      'POST' === s.method
                        ? new URLSearchParams(await s.clone().text())
                        : i.searchParams,
                    a = r - (Number(t.get('qt')) || 0),
                    n = Date.now() - a
                  if ((t.set('qt', String(n)), e.parameterOverrides))
                    for (let a of Object.keys(e.parameterOverrides)) {
                      let s = e.parameterOverrides[a]
                      t.set(a, s)
                    }
                  ;('function' == typeof e.hitFilter && e.hitFilter.call(null, t),
                    await fetch(
                      new Request(i.origin + i.pathname, {
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
        new A(
          ({ url: e }) => e.hostname === el && '/gtm.js' === e.pathname,
          new H({ cacheName: s }),
          'GET'
        ),
        new A(
          ({ url: e }) => e.hostname === eo && '/analytics.js' === e.pathname,
          new H({ cacheName: s }),
          'GET'
        ),
        new A(
          ({ url: e }) => e.hostname === el && '/gtag/js' === e.pathname,
          new H({ cacheName: s }),
          'GET'
        ),
        ...((e) => {
          let t = ({ url: e }) => e.hostname === eo && eh.test(e.pathname),
            a = new $({ plugins: [e] })
          return [new A(t, a, 'GET'), new A(t, a, 'POST')]
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
  class ef {
    _precacheController
    constructor({ precacheController: e }) {
      this._precacheController = e
    }
    cacheKeyWillBeUsed = async ({ request: e, params: t }) => {
      let a = t?.cacheKey || this._precacheController.getPrecacheKeyForUrl(e.url)
      return a ? new Request(a, { headers: e.headers }) : e
    }
  }
  class ep {
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
      cacheId: i,
      clientsClaim: c = !1,
      runtimeCaching: o,
      offlineAnalyticsConfig: l,
      disableDevLogs: h = !1,
      fallbacks: u,
      requestRules: d,
    } = {}) {
      var f, m
      let {
        precacheStrategyOptions: g,
        precacheRouteOptions: w,
        precacheMiscOptions: y,
      } = ((e, t = {}) => {
        let {
          cacheName: a,
          plugins: s = [],
          fetchOptions: r,
          matchOptions: i,
          fallbackToNetwork: c,
          directoryIndex: o,
          ignoreURLParametersMatching: l,
          cleanURLs: h,
          urlManipulation: u,
          cleanupOutdatedCaches: d,
          concurrency: f = 10,
          navigateFallback: p,
          navigateFallbackAllowlist: m,
          navigateFallbackDenylist: g,
        } = t ?? {}
        return {
          precacheStrategyOptions: {
            cacheName: n.getPrecacheName(a),
            plugins: [...s, new ef({ precacheController: e })],
            fetchOptions: r,
            matchOptions: i,
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
            concurrency: f,
            navigateFallback: p,
            navigateFallbackAllowlist: m,
            navigateFallbackDenylist: g,
          },
        }
      })(this, t)
      if (
        ((this._concurrentPrecaching = y.concurrency),
        (this._precacheStrategy = new er(g)),
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
        void 0 !== i && ((f = { prefix: i }), n.updateDetails(f)),
        a
          ? self.skipWaiting()
          : self.addEventListener('message', (e) => {
              e.data && 'SKIP_WAITING' === e.data.type && self.skipWaiting()
            }),
        c && self.addEventListener('activate', () => self.clients.claim()),
        e && e.length > 0 && this.addToPrecacheList(e),
        y.cleanupOutdatedCaches &&
          ((m = g.cacheName),
          self.addEventListener('activate', (e) => {
            e.waitUntil(p(n.getPrecacheName(m)).then((e) => {}))
          })),
        this.registerRoute(new ec(this, w)),
        y.navigateFallback &&
          this.registerRoute(
            new M(this.createHandlerBoundToUrl(y.navigateFallback), {
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
        let { cacheKey: e, url: r } = en(a),
          i = 'string' != typeof a && a.revision ? 'reload' : 'default'
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
        ;(this._urlsToCacheKeys.set(r, e), this._urlsToCacheModes.set(r, i))
      }
      t.length > 0 &&
        console.warn(`Serwist is precaching URLs without revision info: ${t.join(', ')}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`)
    }
    handleInstall(e) {
      return (
        this.registerRequestRules(e),
        m(e, async () => {
          let t = new ei()
          ;(this.precacheStrategy.plugins.push(t),
            await B(
              this._concurrentPrecaching,
              Array.from(this._urlsToCacheKeys.entries()),
              async ([t, a]) => {
                let s = this._cacheKeysToIntegrities.get(a),
                  r = this._urlsToCacheModes.get(t),
                  i = new Request(t, { integrity: s, cache: r, credentials: 'same-origin' })
                await Promise.all(
                  this.precacheStrategy.handleAll({
                    event: e,
                    request: i,
                    url: new URL(i.url),
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
      return m(e, async () => {
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
          return new A(({ url: e }) => e.href === s.href, t, a)
        }
        if (e instanceof RegExp) return new O(e, t, a)
        if ('function' == typeof e) return new A(e, t, a)
        if (e instanceof A) return e
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
        { params: i, route: n } = this.findMatchingRoute({
          event: t,
          request: e,
          sameOrigin: r,
          url: s,
        }),
        c = n?.handler,
        o = e.method
      if ((!c && this._defaultHandlerMap.has(o) && (c = this._defaultHandlerMap.get(o)), !c)) return
      try {
        a = c.handle({ url: s, request: e, event: t, params: i })
      } catch (e) {
        a = Promise.reject(e)
      }
      let l = n?.catchHandler
      return (
        a instanceof Promise &&
          (this._catchHandler || l) &&
          (a = a.catch(async (a) => {
            if (l)
              try {
                return await l.handle({ url: s, request: e, event: t, params: i })
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
        let i,
          n = r.match({ url: e, sameOrigin: t, request: a, event: s })
        if (n)
          return (
            (Array.isArray((i = n)) && 0 === i.length) ||
            (n.constructor === Object && 0 === Object.keys(n).length)
              ? (i = void 0)
              : 'boolean' == typeof n && (i = void 0),
            { route: r, params: i }
          )
      }
      return {}
    }
  }
  'undefined' != typeof navigator && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  let em = 'cache-entries',
    eg = (e) => {
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
      return `${this._cacheName}|${eg(e)}`
    }
    _upgradeDb(e) {
      let t = e.createObjectStore(em, { keyPath: 'id' })
      ;(t.createIndex('cacheName', 'cacheName', { unique: !1 }),
        t.createIndex('timestamp', 'timestamp', { unique: !1 }))
    }
    _upgradeDbAndDeleteOldDbs(e) {
      ;(this._upgradeDb(e),
        this._cacheName &&
          (function (e, { blocked: t } = {}) {
            let a = indexedDB.deleteDatabase(e)
            ;(t && a.addEventListener('blocked', (e) => t(e.oldVersion, e)),
              R(a).then(() => void 0))
          })(this._cacheName))
    }
    async setTimestamp(e, t) {
      e = eg(e)
      let a = { id: this._getId(e), cacheName: this._cacheName, url: e, timestamp: t },
        s = (await this.getDb()).transaction(em, 'readwrite', { durability: 'relaxed' })
      ;(await s.store.put(a), await s.done)
    }
    async getTimestamp(e) {
      let t = await this.getDb(),
        a = await t.get(em, this._getId(e))
      return a?.timestamp
    }
    async expireEntries(e, t) {
      let a = await this.getDb(),
        s = await a.transaction(em, 'readwrite').store.index('timestamp').openCursor(null, 'prev'),
        r = [],
        i = 0
      for (; s; ) {
        let a = s.value
        ;(a.cacheName === this._cacheName &&
          ((e && a.timestamp < e) || (t && i >= t) ? (s.delete(), r.push(a.url)) : i++),
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
      if (e === n.getRuntimeName()) throw new s('expire-custom-caches-only')
      let t = this._cacheExpirations.get(e)
      return (t || ((t = new ey(e, this._config)), this._cacheExpirations.set(e, t)), t)
    }
    cachedResponseWillBeUsed({ event: e, cacheName: t, request: a, cachedResponse: s }) {
      if (!s) return null
      let r = this._isResponseDateFresh(s),
        i = this._getCacheExpiration(t),
        n = 'last-used' === this._config.maxAgeFrom,
        c = (async () => {
          ;(n && (await i.updateTimestamp(a.url)), await i.expireEntries())
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
  class eb extends W {
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
  class eR extends W {
    constructor(e = {}) {
      ;(super(e), this.plugins.some((e) => 'cacheWillUpdate' in e) || this.plugins.unshift(j))
    }
    async _handle(e, t) {
      let a,
        r = t.fetchAndCachePut(e).catch(() => {})
      t.waitUntil(r)
      let i = await t.cacheMatch(e)
      if (i);
      else
        try {
          i = await r
        } catch (e) {
          e instanceof Error && (a = e)
        }
      if (!i) throw new s('no-response', { url: e.url, error: a })
      return i
    }
  }
  let eq = new ep({
    precacheEntries: [
      { revision: null, url: '/_next/static/chunks/1091.964b9007c9e17c9f.js' },
      { revision: null, url: '/_next/static/chunks/1352.8bb71ae257167ff9.js' },
      { revision: null, url: '/_next/static/chunks/1555.fb34eec5771c8e1f.js' },
      { revision: null, url: '/_next/static/chunks/2399.62d9f99ac6af320a.js' },
      { revision: null, url: '/_next/static/chunks/2428.15b79d93b1623858.js' },
      { revision: null, url: '/_next/static/chunks/2936.a64e2af97df9b0b8.js' },
      { revision: null, url: '/_next/static/chunks/3520.c816dd0484346e6a.js' },
      { revision: null, url: '/_next/static/chunks/3838.56375f9b44d73b1e.js' },
      { revision: null, url: '/_next/static/chunks/4050.2f181abd4016cc57.js' },
      { revision: null, url: '/_next/static/chunks/413.7e074c297f1fdb66.js' },
      { revision: null, url: '/_next/static/chunks/4209.72756f37caeca406.js' },
      { revision: null, url: '/_next/static/chunks/4830.8e9bdf5acc562662.js' },
      { revision: null, url: '/_next/static/chunks/5061.6a99c4447eba24e4.js' },
      { revision: null, url: '/_next/static/chunks/5618.6f9e1e854373a80e.js' },
      { revision: null, url: '/_next/static/chunks/6076.20c5e6eed401a4a2.js' },
      { revision: null, url: '/_next/static/chunks/627.30562a8cc91c8bbb.js' },
      { revision: null, url: '/_next/static/chunks/6411.eeb5a3bbc76dad7e.js' },
      { revision: null, url: '/_next/static/chunks/6529.8ebddc9c38a43036.js' },
      { revision: null, url: '/_next/static/chunks/6762.81e08f35e1ebe1e3.js' },
      { revision: null, url: '/_next/static/chunks/7020.a173f84ae8c717f8.js' },
      { revision: null, url: '/_next/static/chunks/7155.5aac7301c453606e.js' },
      { revision: null, url: '/_next/static/chunks/7684.e121e39252e59e27.js' },
      { revision: null, url: '/_next/static/chunks/7736.7b435b195cea7514.js' },
      { revision: null, url: '/_next/static/chunks/7781.9348c806815a2b23.js' },
      { revision: null, url: '/_next/static/chunks/8163.40b62c695f65a46f.js' },
      { revision: null, url: '/_next/static/chunks/8173.6082d74f83948f00.js' },
      { revision: null, url: '/_next/static/chunks/827.30d9d15789c94524.js' },
      { revision: null, url: '/_next/static/chunks/8502.b3aec648db03299e.js' },
      { revision: null, url: '/_next/static/chunks/8798.4eb70636b4b5c527.js' },
      { revision: null, url: '/_next/static/chunks/9284.1bf22633b95126e6.js' },
      { revision: null, url: '/_next/static/chunks/966.94efc9b373ecc7ee.js' },
      { revision: null, url: '/_next/static/chunks/app/_not-found/page-08f640cbe08cd95e.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/agora/end-session/route-ddc2bc94fd0dcc8d.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/analytics/track/route-5648997a97ce194d.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/certificate/register/route-5b4abf0f68cde76b.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/dev/reset-user/route-f0c44d72cf738bf4.js',
      },
      { revision: null, url: '/_next/static/chunks/app/api/edge/chat/route-efc6a9d4b7926c53.js' },
      { revision: null, url: '/_next/static/chunks/app/api/edge/health/route-ccafc384539af6f6.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/kids/end-session/route-2eb7ac59f82bc78b.js',
      },
      { revision: null, url: '/_next/static/chunks/app/api/metrics/route-cba6c45599f34aad.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/monitoring/dashboard/route-464721117d428818.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/parental/chat-history/route-3f0579facfda66b2.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/parental/disable-kids/route-373249e99f1de7c6.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/parental/send-code/route-005e4a0926997cec.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/parental/stats/route-4c6f4a018c9623b5.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/parental/verify-code/route-c1755edf58a92857.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/security/csp-report/route-003c42a06c4cd2a1.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/test-backend/route-686f720b5063732c.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/user/delete-account/route-bf7c600a315a3bc7.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/user/export-data/route-c9feeb26a4b94d91.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/api/verify-certificate/route-e606d38dae652baa.js',
      },
      { revision: null, url: '/_next/static/chunks/app/api/web-vitals/route-cdc49d03d752442b.js' },
      { revision: null, url: '/_next/static/chunks/app/auth/callback/route-838b8c665b6c97e0.js' },
      { revision: null, url: '/_next/static/chunks/app/auth/error/page-004bb6cdf15eb96c.js' },
      { revision: null, url: '/_next/static/chunks/app/en/about/page-6fe7d16203a01d00.js' },
      { revision: null, url: '/_next/static/chunks/app/en/agents/page-389fbf718de3cf1d.js' },
      { revision: null, url: '/_next/static/chunks/app/en/cookies/page-81ac82de0c07c876.js' },
      { revision: null, url: '/_next/static/chunks/app/en/layout-0b86c01a439a0aa3.js' },
      { revision: null, url: '/_next/static/chunks/app/en/manifesto/page-732211382b02c1d0.js' },
      { revision: null, url: '/_next/static/chunks/app/en/page-fb71056732d95764.js' },
      { revision: null, url: '/_next/static/chunks/app/en/privacy/page-f7aa18d77209d4e2.js' },
      { revision: null, url: '/_next/static/chunks/app/en/system/page-c7437602f37c300a.js' },
      { revision: null, url: '/_next/static/chunks/app/en/terms/page-7462c704264c99cb.js' },
      { revision: null, url: '/_next/static/chunks/app/global-error-a721a739931ba94b.js' },
      { revision: null, url: '/_next/static/chunks/app/layout-5dfd0a1ecc179a90.js' },
      { revision: null, url: '/_next/static/chunks/app/not-found-c2ec13e992250e92.js' },
      { revision: null, url: '/_next/static/chunks/app/page-ccaec1833fae4559.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/about/page-7c93b8966a4e0c45.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/agents/page-05e114e069fa2e2e.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/ajuda/page-3ab22e8e495c99df.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/atividades/page-82f2035487506523.js',
      },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/chat/error-6bd75d25644cf1e8.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/chat/page-49a145cb632b2587.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/configuracoes/page-8f1de7f41df34e7f.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/contract/page-b0121f2355e144a6.js',
      },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/diario/page-c431aef6d69e1a84.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/error-755b0bbc3ca6d07a.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/kids/chat/page-e03988ae7170e616.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/kids/dashboard/page-51d890bcb69bee02.js',
      },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/kids/layout-7408092200ca9ec5.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/kids/loading-783011019fc47f20.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/kids/page-4e9d569ea42756b6.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/kids/termos/page-d35426cc4369611d.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/kids/videos/%5BvideoId%5D/page-ac21f4c0fbb5ebe6.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/kids/videos/page-e47c7960403ef6ae.js',
      },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/layout-409d3b5b99924aae.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/leituras/error-23bd021e68cb34d7.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/leituras/page-dbe837b9dacb5056.js',
      },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/loading-6f551ae377740e39.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/login/page-9852c0343e28a697.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/onboarding/page-ed03e4ee8e51d19f.js',
      },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/page-caabf69187479344.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/pais/dashboard/page-cf49ca5156ad9342.js',
      },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/pais/layout-a1bf944fb56afcce.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/pais/page-d4e79d7fb9086d3d.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/perfil/page-98d9c59e7e28f305.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/ranking/page-088aaf57f73d6beb.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/selecao/loading-e2f956b2348cedd0.js',
      },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/selecao/page-0aec2ef170360628.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/trilhas/%5BtrackId%5D/%5BmoduleId%5D/error-0b61d96cc63c6160.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/trilhas/%5BtrackId%5D/%5BmoduleId%5D/page-db404ec882c25602.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/trilhas/error-876b6e0d4138a8d0.js',
      },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/trilhas/page-22eeb46df0e5a9d2.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/agora/verificar/page-9db51ddc502d37ab.js',
      },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/videos/error-8a428ac9838a1566.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/agora/videos/page-587f2b6a53e774cd.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/app/ajuda/page-af197c7a5081f1a3.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/app/atividades/page-7669b125398ed33c.js',
      },
      { revision: null, url: '/_next/static/chunks/app/pt/app/chat/error-7e75c0eada015576.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/app/chat/layout-84046da77d0d37e6.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/app/chat/page-a5a0c50a2be9a739.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/app/configuracoes/page-6abb950aab31d469.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/app/dashboard/error-686c2edf415229d7.js',
      },
      { revision: null, url: '/_next/static/chunks/app/pt/app/dashboard/page-8ae9aeefb979f63c.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/app/investigacoes/%5Bid%5D/page-8c47f75181b27a44.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/app/investigacoes/error-0acc9d24566659ef.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/app/investigacoes/nova/page-2d0ae51caa95d286.js',
      },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/app/investigacoes/page-e0ee0bde0cb237ad.js',
      },
      { revision: null, url: '/_next/static/chunks/app/pt/app/layout-57d42facd22876fc.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/app/mapa/error-de226031bc7b46db.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/app/mapa/page-dc5af0cb58ea425c.js' },
      {
        revision: null,
        url: '/_next/static/chunks/app/pt/app/notificacoes/page-f579ab4bd5b6ce98.js',
      },
      { revision: null, url: '/_next/static/chunks/app/pt/app/page-b06d4a432020f225.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/app/perfil/page-692341f8ea6bdab1.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/cookies/page-0a05af3aaee9b757.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/debug/page-293efb4b0b2fd839.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/layout-cc5b021c93af8342.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/login/loading-5e154b4977c2fe2e.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/login/page-27681f008ec21a9d.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/manifesto/page-6f8836347df8fba2.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/page-a9c06f8a5e6946fb.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/privacy/page-c388e1ac7cf087ad.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/system/page-70d5b70889a42d3d.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/terms/page-1f61bf89e4be1fd6.js' },
      { revision: null, url: '/_next/static/chunks/app/pt/test-voice/page-132d5b715dad94b0.js' },
      { revision: null, url: '/_next/static/chunks/commons-d1d04cca7e137105.js' },
      { revision: null, url: '/_next/static/chunks/framework-fa82c54275ef0f9d.js' },
      { revision: null, url: '/_next/static/chunks/main-598dc5ea8d87ec28.js' },
      { revision: null, url: '/_next/static/chunks/main-app-67c4f222aa982489.js' },
      { revision: null, url: '/_next/static/chunks/npm.axios-acc15ae70b142bea.js' },
      { revision: null, url: '/_next/static/chunks/npm.buffer-3ff11ee7d4a27c44.js' },
      { revision: null, url: '/_next/static/chunks/npm.canvg.599854ef87135832.js' },
      { revision: null, url: '/_next/static/chunks/npm.core-js.35cf7cb4d6665956.js' },
      { revision: null, url: '/_next/static/chunks/npm.d3-scale.871d401a3bf94a91.js' },
      { revision: null, url: '/_next/static/chunks/npm.d3-shape.7d9de73abd0068b8.js' },
      { revision: null, url: '/_next/static/chunks/npm.date-fns-30b74e0ff7624c35.js' },
      { revision: null, url: '/_next/static/chunks/npm.decimal.js-light.d61926ae2d792783.js' },
      { revision: null, url: '/_next/static/chunks/npm.dompurify-5f9fb9d4afb509d5.js' },
      { revision: null, url: '/_next/static/chunks/npm.embla-carousel-9365b635c8c4c42c.js' },
      { revision: null, url: '/_next/static/chunks/npm.es-toolkit.9af84d7267793102.js' },
      { revision: null, url: '/_next/static/chunks/npm.fast-png.2ba5ec6d770f486f.js' },
      { revision: null, url: '/_next/static/chunks/npm.fflate.90cc2fecd43a11ed.js' },
      { revision: null, url: '/_next/static/chunks/npm.floating-ui-243a0dbc9ca954e2.js' },
      { revision: null, url: '/_next/static/chunks/npm.framer-motion-60957dfb6c32f1bb.js' },
      { revision: null, url: '/_next/static/chunks/npm.fullcalendar.14c071042f0e515e.js' },
      { revision: null, url: '/_next/static/chunks/npm.html2canvas.0df259802cbcb2e1.js' },
      { revision: null, url: '/_next/static/chunks/npm.immer.a2a4d34a904962b2.js' },
      { revision: null, url: '/_next/static/chunks/npm.jspdf.0b91c753f0a1bca1.js' },
      { revision: null, url: '/_next/static/chunks/npm.lucide-react-bb642f6408c3ca7c.js' },
      {
        revision: null,
        url: '/_next/static/chunks/npm.mdast-util-from-markdown.a45533b98ac57e68.js',
      },
      { revision: null, url: '/_next/static/chunks/npm.mdast-util-to-hast.eab3dac31947924d.js' },
      {
        revision: null,
        url: '/_next/static/chunks/npm.micromark-core-commonmark.e48505ef0737dc18.js',
      },
      { revision: null, url: '/_next/static/chunks/npm.micromark.667e1ea8a287983e.js' },
      { revision: null, url: '/_next/static/chunks/npm.motion-dom-79e757f9ff8ec94f.js' },
      { revision: null, url: '/_next/static/chunks/npm.next-445b1084a54389a2.js' },
      { revision: null, url: '/_next/static/chunks/npm.pako.280a8ef5de42c99e.js' },
      { revision: null, url: '/_next/static/chunks/npm.pdfjs-dist.0cbbaaed470838df.js' },
      { revision: null, url: '/_next/static/chunks/npm.posthog-js.d0a989448ed64ff7.js' },
      { revision: null, url: '/_next/static/chunks/npm.property-information.e0588dd84d528101.js' },
      { revision: null, url: '/_next/static/chunks/npm.radix-ui-18b07dc5cc7d65bb.js' },
      { revision: null, url: '/_next/static/chunks/npm.react-pdf-40ebe2f46e6d9d7f.js' },
      { revision: null, url: '/_next/static/chunks/npm.react-redux.a115cd41de0cd243.js' },
      { revision: null, url: '/_next/static/chunks/npm.recharts.ea6dc931526e0506.js' },
      { revision: null, url: '/_next/static/chunks/npm.reduxjs.9a9c3ab318b1fc1c.js' },
      { revision: null, url: '/_next/static/chunks/npm.reselect.d4bcf22f2e0295b1.js' },
      { revision: null, url: '/_next/static/chunks/npm.sentry-internal.9d303031b731dcba.js' },
      { revision: null, url: '/_next/static/chunks/npm.serwist-79a23afbc7cbe12b.js' },
      { revision: null, url: '/_next/static/chunks/npm.supabase-fb1cd99aea9c4ff5.js' },
      { revision: null, url: '/_next/static/chunks/npm.tailwind-merge-6d101897a1323516.js' },
      { revision: null, url: '/_next/static/chunks/npm.tanstack-c4cb4d6216f25bd9.js' },
      { revision: null, url: '/_next/static/chunks/npm.unified.4767ea9b54ef358f.js' },
      { revision: null, url: '/_next/static/chunks/npm.vfile.7be10ebaf3e2b8e8.js' },
      { revision: null, url: '/_next/static/chunks/pages/_app-3a4e77b72ae0711e.js' },
      { revision: null, url: '/_next/static/chunks/pages/_error-5dece47f3981b255.js' },
      {
        revision: '846118c33b2c0e922d7b3a7676f81f6f',
        url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
      },
      { revision: null, url: '/_next/static/chunks/runtime-7031a143c7c890bf.js' },
      { revision: null, url: '/_next/static/chunks/sentry-f262674b6789e362.js' },
      { revision: null, url: '/_next/static/css/59e882a6b4251a5a.css' },
      { revision: null, url: '/_next/static/css/889f017e7cd291f6.css' },
      { revision: null, url: '/_next/static/css/8a38bb2669d7ed47.css' },
      { revision: null, url: '/_next/static/css/9c9c242229f5ab44.css' },
      { revision: null, url: '/_next/static/css/b5ccccc69160d62d.css' },
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
      {
        revision: '9d795b4161b069fb5e81fed5304fbd6a',
        url: '/_next/static/xLAhDWJIJC7w4kev6azSy/_buildManifest.js',
      },
      {
        revision: 'b6652df95db52feb4daf4eca35380933',
        url: '/_next/static/xLAhDWJIJC7w4kev6azSy/_ssgManifest.js',
      },
      { revision: '7af88b226ac614dfdff6612ff4c4b23f', url: '/agents/Lina_Bo_Bardi.jpg' },
      { revision: '98a90691b0d5f6737dd29d641468c1d6', url: '/agents/abaporu.webp' },
      { revision: '582d86b70a14fc44fc757d2c250abd1b', url: '/agents/anita.webp' },
      { revision: '2f83ccf1554c78332bfc67980ca80ddb', url: '/agents/bonifacio.webp' },
      { revision: '9bebd18ed20ddf37fab72bb6faad7d3a', url: '/agents/ceuci.webp' },
      { revision: '9f7151b53ca807f1ce98b0d3472c79e7', url: '/agents/dandara.webp' },
      { revision: '40818afc20da37cd78d4fd73f221c12d', url: '/agents/deodoro.webp' },
      { revision: '6360e96df0dae1276d2275c04a4d0d17', url: '/agents/drummond.webp' },
      { revision: 'bf102c5ba0c49e00b9ebf711f701e97e', url: '/agents/lampiao.webp' },
      { revision: '9a7c73727d05f5d2786a3635f05821b9', url: '/agents/machado.webp' },
      { revision: '6504c314e2b77c438356358c483ee2f4', url: '/agents/monteiro_lobato.jpg' },
      { revision: '1c93f1771ff588220839d25c2f870b89', url: '/agents/nana.webp' },
      { revision: '56055010371d5448ff02f648ede680e0', url: '/agents/niemeyer.webp' },
      { revision: '5422fe2f5f54fd096041d06cd4a24d76', url: '/agents/obaluaie.webp' },
      { revision: 'bc4432cea072326d34df705e20e038f4', url: '/agents/optimized/abaporu-128.avif' },
      { revision: '28c130181df997d2dc7e6aa156dc97fd', url: '/agents/optimized/abaporu-128.webp' },
      { revision: 'ba7dafc984379849dd504d15c4952ffb', url: '/agents/optimized/abaporu-256.avif' },
      { revision: 'd005f46146df47379cfe80471f9deb15', url: '/agents/optimized/abaporu-256.webp' },
      { revision: '56b1e4b4c521d0f6eefcfe27b836a35a', url: '/agents/optimized/abaporu-64.avif' },
      { revision: '085df2148046b0a89e977590dacb3df0', url: '/agents/optimized/abaporu-64.webp' },
      {
        revision: 'a531899c29b4260ecf157233ee221582',
        url: '/agents/optimized/abaporu-placeholder.json',
      },
      { revision: '9c3409c849f794f967db92d4551fa147', url: '/agents/optimized/anita-128.avif' },
      { revision: 'edb63c3bc82afda3d19f585e00372c7e', url: '/agents/optimized/anita-128.webp' },
      { revision: '5c4600e04c42fe06ebe0d44f82bf0854', url: '/agents/optimized/anita-256.avif' },
      { revision: '2345ff7aefaf86de39545f087dce2392', url: '/agents/optimized/anita-256.webp' },
      { revision: '236977bdaf036be66b385a3fe2f6f043', url: '/agents/optimized/anita-64.avif' },
      { revision: 'be54cdce5d0c81e1503eaf8b978dc9f2', url: '/agents/optimized/anita-64.webp' },
      {
        revision: '16590bfefeed2aef816f99f67058723f',
        url: '/agents/optimized/anita-placeholder.json',
      },
      { revision: 'fc3b68e13a6daccde29e35811cc80a7b', url: '/agents/optimized/bonifacio-128.avif' },
      { revision: '24574dcbd28bc5ea823b2853289fe200', url: '/agents/optimized/bonifacio-128.webp' },
      { revision: 'dfc4f18c6554d2dd30afd7d5bef05ea6', url: '/agents/optimized/bonifacio-256.avif' },
      { revision: '3b85aac0bc89048a96b749492f38291b', url: '/agents/optimized/bonifacio-256.webp' },
      { revision: 'a0e067c33979fe6d79c3660c0f5edeee', url: '/agents/optimized/bonifacio-64.avif' },
      { revision: 'a29b93c6ad31736b56c210e455a56905', url: '/agents/optimized/bonifacio-64.webp' },
      {
        revision: 'a8d9c3cf37f120cc9331605b7c941e2a',
        url: '/agents/optimized/bonifacio-placeholder.json',
      },
      { revision: '4c83ffab00e82800d59a1ceac070f9ee', url: '/agents/optimized/ceuci-128.avif' },
      { revision: '22357e994c3af48a581b1da56c8d1933', url: '/agents/optimized/ceuci-128.webp' },
      { revision: 'adb7a328ea4589004179117799a589a6', url: '/agents/optimized/ceuci-256.avif' },
      { revision: 'c62d098b89112bfc0b2ff50b187c7220', url: '/agents/optimized/ceuci-256.webp' },
      { revision: '190e446a6827aeb1b8914121195a703f', url: '/agents/optimized/ceuci-64.avif' },
      { revision: '2e13aa84e0751d130667d9c1c60e0468', url: '/agents/optimized/ceuci-64.webp' },
      {
        revision: 'a2a84cdd570712ba10bbe75420a88d0f',
        url: '/agents/optimized/ceuci-placeholder.json',
      },
      { revision: '5ecae47610795ee83ebd4b1a3a2ca1ee', url: '/agents/optimized/dandara-128.avif' },
      { revision: 'af9995074f3cf616900581e55ed9a21e', url: '/agents/optimized/dandara-128.webp' },
      { revision: 'baec8b3088b6fe1528fd69e078bc2ac3', url: '/agents/optimized/dandara-256.avif' },
      { revision: 'd74c38abea8eb8d1aa3bacab875323e8', url: '/agents/optimized/dandara-256.webp' },
      { revision: '29e73648443daf2588c5c90d5e099ee2', url: '/agents/optimized/dandara-64.avif' },
      { revision: '4f03b6766186e104d2d28c4df0b2067f', url: '/agents/optimized/dandara-64.webp' },
      {
        revision: 'd6086bef7d432973088bb908046d4d8c',
        url: '/agents/optimized/dandara-placeholder.json',
      },
      { revision: 'cf9da62e30ffe89ad0fa4f6a70111590', url: '/agents/optimized/deodoro-128.avif' },
      { revision: '9eb4e64e7bcfe16550c23a537dc06eef', url: '/agents/optimized/deodoro-128.webp' },
      { revision: 'ca200b3fbc8fbb5d35f04e0bf81b6074', url: '/agents/optimized/deodoro-64.avif' },
      { revision: '3cddb8f2d388225bfce2dec661850a8a', url: '/agents/optimized/deodoro-64.webp' },
      {
        revision: '84af3c327dc66a95f5665c91aff6a17c',
        url: '/agents/optimized/deodoro-placeholder.json',
      },
      { revision: '98c0c409376b7d2a16a4b883663c2a44', url: '/agents/optimized/drummond-128.avif' },
      { revision: '8ad1c465215b7f77861c5b7f90c24855', url: '/agents/optimized/drummond-128.webp' },
      { revision: 'b753e265ebfd412d6d7f507dca62057b', url: '/agents/optimized/drummond-64.avif' },
      { revision: '60d95d60fb985c5162b9b9f4d1d1b707', url: '/agents/optimized/drummond-64.webp' },
      {
        revision: '80e7e381df623f9093afd0c55f53c7c9',
        url: '/agents/optimized/drummond-placeholder.json',
      },
      { revision: '166d34ee8d18d0f5c94603b7edda9527', url: '/agents/optimized/lampiao-128.avif' },
      { revision: 'a292ecca9738d32541fef3974c326848', url: '/agents/optimized/lampiao-128.webp' },
      { revision: '569df7f3bbb97df9775970c856bcaa6e', url: '/agents/optimized/lampiao-256.avif' },
      { revision: 'd7c24cbc2e14f1e6d0616f17b877d18c', url: '/agents/optimized/lampiao-256.webp' },
      { revision: 'f3f6447ad62bd956aa1f924b1ad441c4', url: '/agents/optimized/lampiao-64.avif' },
      { revision: '1814aa2b4cf58dd98c933d78cb192fbf', url: '/agents/optimized/lampiao-64.webp' },
      {
        revision: '6b7485c4b32fed9071d6ede03de3272e',
        url: '/agents/optimized/lampiao-placeholder.json',
      },
      { revision: 'eb2b0ff44c765767ce52d26fe524f59a', url: '/agents/optimized/machado-128.avif' },
      { revision: 'fd72e9a3d402a43659b199f6f1a2ead9', url: '/agents/optimized/machado-128.webp' },
      { revision: 'e0847a815cafd6d6ad91ec2a4713a215', url: '/agents/optimized/machado-256.avif' },
      { revision: 'd03a5c6989d4f4383074eb1ff3d85238', url: '/agents/optimized/machado-256.webp' },
      { revision: 'a2ea00722671f7fe082acabe23b1e216', url: '/agents/optimized/machado-64.avif' },
      { revision: 'b4206fc26df9f326eaa891bb35661fa9', url: '/agents/optimized/machado-64.webp' },
      {
        revision: '6cdd67b27fa0244d5b0725e5d3f3a409',
        url: '/agents/optimized/machado-placeholder.json',
      },
      { revision: '6700952dd2390165d76d20ec965c236e', url: '/agents/optimized/manifest.json' },
      { revision: 'a81bd835a2b95f2c8d0399b339fb78c0', url: '/agents/optimized/nana-128.avif' },
      { revision: 'e1cd664a3676ff3fbc42a0a08e8af6cb', url: '/agents/optimized/nana-128.webp' },
      { revision: 'a5f8b5819956c670bc64c944aa4e810e', url: '/agents/optimized/nana-64.avif' },
      { revision: 'a43af5b8177ef7d059dc77a210bdf9a4', url: '/agents/optimized/nana-64.webp' },
      {
        revision: '041919f6d4bd06d8e8d999bed5f0833d',
        url: '/agents/optimized/nana-placeholder.json',
      },
      { revision: '24d6306a2e0240c7deb4c3ee999e68ef', url: '/agents/optimized/niemeyer-128.avif' },
      { revision: '471a2a030650419a67bccb71bdba3552', url: '/agents/optimized/niemeyer-128.webp' },
      { revision: '5ea1aec9735fa2826727b754c7ff0dbd', url: '/agents/optimized/niemeyer-64.avif' },
      { revision: '0a02efb5729911834fbac666c6c10ef9', url: '/agents/optimized/niemeyer-64.webp' },
      {
        revision: '4f43f0a8864c0147e65cda12a2bb006c',
        url: '/agents/optimized/niemeyer-placeholder.json',
      },
      { revision: 'a21bba3e9e2d3314fb9ba85afebdc22b', url: '/agents/optimized/obaluaie-128.avif' },
      { revision: '8663785564081f8327681ca02e319ff6', url: '/agents/optimized/obaluaie-128.webp' },
      { revision: '02709b3f3545bd4225d458eb49dcbea9', url: '/agents/optimized/obaluaie-64.avif' },
      { revision: '5d0fbec2260573d5faa6678747fd711f', url: '/agents/optimized/obaluaie-64.webp' },
      {
        revision: 'a10bd6e46ecb3bc73cdfbd3f3124ef28',
        url: '/agents/optimized/obaluaie-placeholder.json',
      },
      { revision: 'a21bba3e9e2d3314fb9ba85afebdc22b', url: '/agents/optimized/oxossi-128.avif' },
      { revision: '8663785564081f8327681ca02e319ff6', url: '/agents/optimized/oxossi-128.webp' },
      { revision: '02709b3f3545bd4225d458eb49dcbea9', url: '/agents/optimized/oxossi-64.avif' },
      { revision: '5d0fbec2260573d5faa6678747fd711f', url: '/agents/optimized/oxossi-64.webp' },
      {
        revision: 'a10bd6e46ecb3bc73cdfbd3f3124ef28',
        url: '/agents/optimized/oxossi-placeholder.json',
      },
      { revision: '515b1ec1fe97a9e296f0895d49a74c2b', url: '/agents/optimized/quiteria-128.avif' },
      { revision: 'e5ff771a3d76d710cdf006f3c2e705df', url: '/agents/optimized/quiteria-128.webp' },
      { revision: '83678723e04e94a32b41a3997b1b24fa', url: '/agents/optimized/quiteria-64.avif' },
      { revision: 'f65af31746114053fea1bdae97cd7085', url: '/agents/optimized/quiteria-64.webp' },
      {
        revision: '21ae23d6c31eab5f6160d5159360018c',
        url: '/agents/optimized/quiteria-placeholder.json',
      },
      { revision: '9aea7a3447ba3359c2e2877bb5237b13', url: '/agents/optimized/senna-128.avif' },
      { revision: '32b566779bb66b74349dfbd8425db1fe', url: '/agents/optimized/senna-128.webp' },
      { revision: '81db43bbeb7c2505d1b7609f806e239b', url: '/agents/optimized/senna-256.avif' },
      { revision: '81e2f27e700be0d7ded54568f8dc3245', url: '/agents/optimized/senna-256.webp' },
      { revision: '58628d714ae4e788768dbba34cd58817', url: '/agents/optimized/senna-64.avif' },
      { revision: 'd4fcf998abaf8e420c2635dea8238bcc', url: '/agents/optimized/senna-64.webp' },
      {
        revision: '176ec2a059022cb4733890de8301af5d',
        url: '/agents/optimized/senna-placeholder.json',
      },
      { revision: '98c0c409376b7d2a16a4b883663c2a44', url: '/agents/optimized/system-128.avif' },
      { revision: '8ad1c465215b7f77861c5b7f90c24855', url: '/agents/optimized/system-128.webp' },
      { revision: 'b753e265ebfd412d6d7f507dca62057b', url: '/agents/optimized/system-64.avif' },
      { revision: '60d95d60fb985c5162b9b9f4d1d1b707', url: '/agents/optimized/system-64.webp' },
      {
        revision: '80e7e381df623f9093afd0c55f53c7c9',
        url: '/agents/optimized/system-placeholder.json',
      },
      {
        revision: '34d15ee7a06573bc5f9f40aa92287056',
        url: '/agents/optimized/tiradentes-128.avif',
      },
      {
        revision: '6dfc2cdc5d0902dad611391b7e826689',
        url: '/agents/optimized/tiradentes-128.webp',
      },
      {
        revision: '48fb813c629bb348d844392d1608abae',
        url: '/agents/optimized/tiradentes-256.avif',
      },
      {
        revision: '9b7227bcce76625c4c0b2445100b371e',
        url: '/agents/optimized/tiradentes-256.webp',
      },
      {
        revision: '9e09cd843f8439509a0fb977400b9937',
        url: '/agents/optimized/tiradentes-512.avif',
      },
      {
        revision: '82bde01c4cafe8e5234828c32dfaec2b',
        url: '/agents/optimized/tiradentes-512.webp',
      },
      { revision: '859bedb42e7b39b7573795913572bbd2', url: '/agents/optimized/tiradentes-64.avif' },
      { revision: '22583a560f8fdf95d366246e9a977247', url: '/agents/optimized/tiradentes-64.webp' },
      {
        revision: '91b3329993b80d3e8106434bc8d78645',
        url: '/agents/optimized/tiradentes-placeholder.json',
      },
      { revision: '6c836fba1aed93ffe354a7ed6cbb960d', url: '/agents/optimized/zumbi-128.avif' },
      { revision: '0614c5d715f9f0cdbd0c4d30d9988bad', url: '/agents/optimized/zumbi-128.webp' },
      { revision: 'c32ce191560128186481fc2821666f6f', url: '/agents/optimized/zumbi-256.avif' },
      { revision: '5394dff16394b8e89fb29f1a24bf1ace', url: '/agents/optimized/zumbi-256.webp' },
      { revision: 'a5978eb250db1662591ea62f1136988d', url: '/agents/optimized/zumbi-64.avif' },
      { revision: 'a24aea70312613c6805c39bd4f565bcb', url: '/agents/optimized/zumbi-64.webp' },
      {
        revision: '2705160aea35293dd5f064788cd6c790',
        url: '/agents/optimized/zumbi-placeholder.json',
      },
      { revision: '3c7c6920e7ca72e324dcc190ecc91d3c', url: '/agents/oxossi.webp' },
      { revision: 'a8f0f2893a28363646f318e066278d9d', url: '/agents/quiteria.webp' },
      { revision: '852010777bc851d474eaf780f01d42f2', url: '/agents/santos-dumont.webp' },
      { revision: '5037ea34b70039c8c5747cc6a03f1383', url: '/agents/senna.webp' },
      { revision: '6360e96df0dae1276d2275c04a4d0d17', url: '/agents/system.webp' },
      { revision: '4d64aa657614339e2bbc23b04623da19', url: '/agents/tarsila_a_musa.webp' },
      { revision: '47f0e3bb8aefa3a4b2236f1cf01b4f54', url: '/agents/tiradentes.webp' },
      { revision: '60de8603db5edbbfa7174455bd8a9b57', url: '/agents/zumbi.webp' },
      { revision: 'fb59180f4d326ce3c8e094e36f5ea3d7', url: '/agora/cidadao-democratizando.png' },
      { revision: '0f4ca4e82fb121df15915c3c2abb6edc', url: '/agora/cidadao-democratizando.webp' },
      { revision: '6a2bf5e4086cb00a715115c58415b750', url: '/agora/cidadao-slide-01.png' },
      { revision: '65058e26412eff504478ccb259f27513', url: '/agora/cidadao-slide-01.webp' },
      { revision: '2b0d7fb56ef1062e4e542cd2550c7658', url: '/agora/cidadao-slide-02.png' },
      { revision: '34a6b6da86ce94bc751fab593bf65618', url: '/agora/cidadao-slide-02.webp' },
      { revision: 'af0f17bb903b40305264f4c2e98079b6', url: '/agora/cidadao-slide-03.png' },
      { revision: '46149f27de9f5650b92b758f8e549008', url: '/agora/cidadao-slide-03.webp' },
      { revision: '3a6108ff59512d5a5ee5d3d0011fe0e4', url: '/agora/cidadao-slide-04.png' },
      { revision: 'c13d7a57a9bec391c2bdc9a21efba4ee', url: '/agora/cidadao-slide-04.webp' },
      { revision: 'adfe5bd5f618bf69d862721f37444f94', url: '/agora/cidadao-slide-05.png' },
      { revision: '7b1d99557006a2bd0fd8faf397e04999', url: '/agora/cidadao-slide-05.webp' },
      { revision: '03d64436b9b2f1548f0e06ea0d746358', url: '/agora/cidadao-slide-06.png' },
      { revision: 'c96667a58f5e8a63518bdffcfbff2c83', url: '/agora/cidadao-slide-06.webp' },
      { revision: '35b0c7f1c53c7460c1d572401d6f106c', url: '/agora/operarios.png' },
      { revision: '16345468328aaad4f8cb228d45ae63f1', url: '/agora/operarios.webp' },
      { revision: '4d5401849588df0b8f79d48cb33f5b7a', url: '/agora/slides/slide-01.png' },
      { revision: '06c516ffb5a5ad360d3a50af38373c73', url: '/agora/slides/slide-01.webp' },
      { revision: '8acca1af76e4b2a107112ab45472da3b', url: '/agora/slides/slide-02.png' },
      { revision: '853aa9e3fa01e8b00791b058ed8dd0f0', url: '/agora/slides/slide-02.webp' },
      { revision: '5368b14d26311fbef069a1592bd43738', url: '/agora/slides/slide-03.png' },
      { revision: 'a26150befba3ae52b637eb1fdf686c77', url: '/agora/slides/slide-03.webp' },
      { revision: 'e60b8ec7637c6c53447c1a23a529b601', url: '/agora/slides/slide-04.png' },
      { revision: 'fd56ef608b8006ad697a5f31c36ac89f', url: '/agora/slides/slide-04.webp' },
      { revision: '307b19b2088b83628e2f153a30963b6b', url: '/agora/slides/slide-05.png' },
      { revision: '63c28eecfe77721c3c0c4d8bcc335b67', url: '/agora/slides/slide-05.webp' },
      { revision: 'ee7c5f523dfbf3ea413e2d91ef581970', url: '/agora/slides/slide-06.png' },
      { revision: 'ca1cb67e8ac86cdc7d720764ef59d328', url: '/agora/slides/slide-06.webp' },
      { revision: 'fde90c95fe107efe75abb6f7f465f3c4', url: '/agora/slides/slide-07.png' },
      { revision: 'c2200a1ff8b24f7785fb11a655d4934d', url: '/agora/slides/slide-07.webp' },
      { revision: '239e2837ebfd5c38ef949838d934c77d', url: '/agora/slides/slide-08.png' },
      { revision: '2e1893a0a73ff46a6bc8150421bdef8a', url: '/agora/slides/slide-08.webp' },
      { revision: 'cfecb934f089d9e2b619676a879d4098', url: '/agora/slides/slide-09.png' },
      { revision: '4fa1ddea1d188f29eaf8d6ded60d4767', url: '/agora/slides/slide-09.webp' },
      { revision: 'd503db2287beca812baed983b9371e8e', url: '/agora/slides/slide-10.png' },
      { revision: 'afc29e99faf7807d4d1f00d4ef89d47e', url: '/agora/slides/slide-10.webp' },
      { revision: 'dd66017534ffc6a8a9d18ed4de672335', url: '/agora/slides/slide-11.png' },
      { revision: '865a475e40b51dd36b114f2bd4cfc6e8', url: '/agora/slides/slide-11.webp' },
      { revision: '03dbd7725490d4f3c06a26bc89107163', url: '/agora/slides/slide-12.png' },
      { revision: '05fdac1338bed592f4d0d2a32f4c14be', url: '/agora/slides/slide-12.webp' },
      { revision: '41c008ffe094a14ac174f5bbca5804ce', url: '/agora/slides/slide-13.png' },
      { revision: 'c5b4074e059de398a489dc54ea01fe7c', url: '/agora/slides/slide-13.webp' },
      { revision: 'f14abe439c0f44ef8a51fc489183ecb3', url: '/agora/slides/slide-14.png' },
      { revision: 'dc5f8a2d7003076933d01fa53bb93e77', url: '/agora/slides/slide-14.webp' },
      { revision: '8e70445e273c34b52c4704b8869965ce', url: '/agora/slides/slide-15.png' },
      { revision: '550e671c6ecfd42334aaadc1b245c04b', url: '/agora/slides/slide-15.webp' },
      { revision: '5df5a171cd4bee9a6aa95a304f3e9489', url: '/agora/slides/slide-16.png' },
      { revision: 'b7e4371dbf02ebd660c8d86c85ddbb76', url: '/agora/slides/slide-16.webp' },
      { revision: '4caa18cea8d753d3dd03fc26720964d5', url: '/agora/slides/slide-17.png' },
      { revision: '387541ad5c575f9d35356ce1f2688abb', url: '/agora/slides/slide-17.webp' },
      { revision: '8efa0c671bb261d8e9c8bb1a20c6edb9', url: '/agora/slides/slide-18.png' },
      { revision: '18d3bd670691159362c1abfeb3d080ee', url: '/agora/slides/slide-18.webp' },
      { revision: '09334e9a504a3b4a7363256fc5235511', url: '/agora/slides/slide-19.png' },
      { revision: 'a5450b88e5d9bf7240189c1a8a807141', url: '/agora/slides/slide-19.webp' },
      { revision: '5ecad592855f8fa7b6be6b19da990d8f', url: '/agora/slides/slide-20.png' },
      { revision: '1cb6593df9a6350a6fcd3ff6df54e96a', url: '/agora/slides/slide-20.webp' },
      { revision: 'da68c1530f669f8a4255bdd5d56df895', url: '/agora/slides/slide-21.png' },
      { revision: '7ff288069308b7760dbfecddfd6d8a4b', url: '/agora/slides/slide-21.webp' },
      { revision: 'cd3fe105214be80c066dabf5c393c601', url: '/agora/slides/slide-22.png' },
      { revision: '0b6d651eb2776fe88d826c519e6b86aa', url: '/agora/slides/slide-22.webp' },
      { revision: '5c413e1e111590152bbddd710ebca398', url: '/agora/slides/slide-23.png' },
      { revision: 'cbe134f53f67169f86d8501e113b155a', url: '/agora/slides/slide-23.webp' },
      { revision: '68365abb082b6399cb47f9ba9b956b3f', url: '/agora/slides/slide-24.png' },
      { revision: '119ff3e08ffc2f5e37e12d612c2089d6', url: '/agora/slides/slide-24.webp' },
      { revision: '203ac542925a310877b6f687913181c8', url: '/agora/slides/slide-25.png' },
      { revision: 'b2847e38eeb44ca027f4772150a8c551', url: '/agora/slides/slide-25.webp' },
      { revision: '2629cfff1b1bc8e66092dd9c1f5a37f6', url: '/agora/slides/slide-26.png' },
      { revision: '432b52fc0b83a1c62ec8374320db0327', url: '/agora/slides/slide-26.webp' },
      { revision: '84ea5e2735098252d82dd6eb5e1a2511', url: '/agora/slides/slide-27.png' },
      { revision: '2c6380f5a5fd85651312d53383e37036', url: '/agora/slides/slide-27.webp' },
      { revision: '1e52e98b6d196cc868111092f4bf07d7', url: '/agora/slides/slide-28.png' },
      { revision: '482224551d69e9c01107acf7af760280', url: '/agora/slides/slide-28.webp' },
      { revision: '7ac3fc27a8cb2f8f79081f44bcad39dd', url: '/agora/slides/slide-29.png' },
      { revision: '65d3c44f6569c0e5b2acc383756ad575', url: '/agora/slides/slide-29.webp' },
      { revision: '16cd6e49106e12a810bd3d2a0f686975', url: '/agora/slides/slide-30.png' },
      { revision: 'ae156bc39e1f6fe2422b6dc7fa01cd22', url: '/agora/slides/slide-30.webp' },
      { revision: '260023851acd5d2338475c552616cf2e', url: '/agora/slides/slide-31.png' },
      { revision: 'daa54a496ab13fba9a4590fea6187870', url: '/agora/slides/slide-31.webp' },
      { revision: '3537a88f3692d9ee60aefc94a0eb516f', url: '/agora/slides/slide-32.png' },
      { revision: '3ac61feaf4f69c6e40b985bd611176da', url: '/agora/slides/slide-32.webp' },
      { revision: '334016590fdebe6098a9bc180a63797d', url: '/agora/slides/slide-33.png' },
      { revision: '65f299141e9765ab6708f2cc95eb96c8', url: '/agora/slides/slide-33.webp' },
      { revision: '52a0fea6c80db176e7cd680c99e51a52', url: '/agora/slides/slide-34.png' },
      { revision: '93d2934032cdde72149adb4ed0ca81e7', url: '/agora/slides/slide-34.webp' },
      { revision: '946b768ec0c95d2589c136295d212db3', url: '/agora/slides/slide-35.png' },
      { revision: '3e6241c59b9d631edd03d2e98b5bce79', url: '/agora/slides/slide-35.webp' },
      { revision: '07f0b0e584da15069ff691035d41baf3', url: '/agora/slides/slide-36.png' },
      { revision: '1b8f6d90a98ba5283ac427cbf70dfbe7', url: '/agora/slides/slide-36.webp' },
      { revision: '316da9b78bdc6b0f1fb2bb69e63377b2', url: '/agora/slides/slide-37.png' },
      { revision: '50a99dba5cfb68ac8e193e6629906028', url: '/agora/slides/slide-37.webp' },
      { revision: '0e52f2f8d978f4fcb32886c73d903b70', url: '/agora/slides/slide-38.png' },
      { revision: '071d5564a945f733bfdae9421069aa12', url: '/agora/slides/slide-38.webp' },
      { revision: '6008f9b79d947a3b459c10c39087099d', url: '/agora/slides/slide-39.png' },
      { revision: '288e4907b5e20bbd9a3d34665d4adc70', url: '/agora/slides/slide-39.webp' },
      { revision: 'e4282c32fb6bf56c8e1b727d02d6770b', url: '/agora/slides/slide-40.png' },
      { revision: 'b69fb2d2e6c407526356e80088483a52', url: '/agora/slides/slide-40.webp' },
      { revision: 'dd097088157e17aabf34aa22d0edaf28', url: '/agora/tarsila-modernismo.png' },
      { revision: '46ae9be3695f45861dc33f96d4d67949', url: '/agora/tarsila-modernismo.webp' },
      { revision: '42c4349b611a739a8317f17ae74b7587', url: '/agora/videos/cat-coffee.gif' },
      { revision: 'fab3623ce05f8d1fd59b55f9327a28e7', url: '/agora/videos/cat-computer.gif' },
      { revision: '4ad4dc5c6cbfcc1f22e7c92f32e9abc6', url: '/agora/videos/cat-focus.gif' },
      { revision: '9fe18fbca13610632d0b30c07d351a38', url: '/agora/videos/cat-hacker.gif' },
      { revision: '42c4349b611a739a8317f17ae74b7587', url: '/agora/videos/cat-study.gif' },
      { revision: 'a4e4a17be63d294f14a10f31b7ad1660', url: '/agora/videos/cat-typing.gif' },
      { revision: '4d7374a206e6908075cc9a4b2a9c9539', url: '/agora/videos/cat-working.gif' },
      { revision: '26add4bd00843ad0c709389f4baf5e5a', url: '/agora/videos/dog-coding.gif' },
      { revision: '9c0310066ebbf0ab247618f720dfa502', url: '/agora/videos/dog-glasses.gif' },
      { revision: '42c4349b611a739a8317f17ae74b7587', url: '/agora/videos/dog-smart.gif' },
      { revision: 'dc95edbdd89a10ffb2527f44c3081be2', url: '/agora/videos/dog-typing.gif' },
      { revision: 'f81fafc3939e3cc55a3e6f854b17e83f', url: '/agora/videos/dog-work.gif' },
      { revision: '9bca7610dffef355a3187ca5a31a53c9', url: '/android-chrome-192x192.png' },
      { revision: '1e20529f2512fbca988db151c113c6c3', url: '/android-chrome-192x192.webp' },
      { revision: 'a11839c0724cd949f4ef6e3c78ae96f5', url: '/android-chrome-512x512.png' },
      { revision: 'c755a38fcb621332a9607523379b9273', url: '/android-chrome-512x512.webp' },
      { revision: 'b493d4a37571499fd637895a729cc998', url: '/app-icon-base.png' },
      { revision: '280875d6bb57ca35bdfc648bc33ff11a', url: '/app-icon-base.webp' },
      { revision: 'd022931e76a2b6d110640f01b97c0b2e', url: '/apple-touch-icon.png' },
      { revision: 'cdf24bd81158043029cfc66c2bb7423d', url: '/apple-touch-icon.webp' },
      { revision: '29dee257874f2a3e406cb438cfd7d87f', url: '/brazil-states.json' },
      { revision: 'e6171c88d4e4f1fbee322f88056edbf7', url: '/docs/notas-de-pesquisa.pdf' },
      { revision: 'b0a899a6ae2bc9a5efaf8b0971b0b067', url: '/favicon-16x16.png' },
      { revision: 'aae670be437d0109eb09a591e05248ec', url: '/favicon-16x16.webp' },
      { revision: '619911c64b98cb240ff07b29efe1465f', url: '/favicon-32x32.png' },
      { revision: '9afba5b441535ecdbab86538448ff992', url: '/favicon-32x32.webp' },
      { revision: 'f26331a1006264853358b0e83aa75f33', url: '/favicon.ico' },
      { revision: '3d237aafc8f3081b6a7b8cb8822302c5', url: '/favicon.svg' },
      { revision: 'b493d4a37571499fd637895a729cc998', url: '/forum-icon.png' },
      { revision: '280875d6bb57ca35bdfc648bc33ff11a', url: '/forum-icon.webp' },
      { revision: 'b493d4a37571499fd637895a729cc998', url: '/icons/icon-128x128.png' },
      { revision: '280875d6bb57ca35bdfc648bc33ff11a', url: '/icons/icon-128x128.webp' },
      { revision: 'b493d4a37571499fd637895a729cc998', url: '/icons/icon-144x144.png' },
      { revision: '280875d6bb57ca35bdfc648bc33ff11a', url: '/icons/icon-144x144.webp' },
      { revision: 'b493d4a37571499fd637895a729cc998', url: '/icons/icon-152x152.png' },
      { revision: '280875d6bb57ca35bdfc648bc33ff11a', url: '/icons/icon-152x152.webp' },
      { revision: 'b493d4a37571499fd637895a729cc998', url: '/icons/icon-192x192.png' },
      { revision: '280875d6bb57ca35bdfc648bc33ff11a', url: '/icons/icon-192x192.webp' },
      { revision: 'b493d4a37571499fd637895a729cc998', url: '/icons/icon-384x384.png' },
      { revision: '280875d6bb57ca35bdfc648bc33ff11a', url: '/icons/icon-384x384.webp' },
      { revision: 'b493d4a37571499fd637895a729cc998', url: '/icons/icon-512x512.png' },
      { revision: '280875d6bb57ca35bdfc648bc33ff11a', url: '/icons/icon-512x512.webp' },
      { revision: 'b493d4a37571499fd637895a729cc998', url: '/icons/icon-72x72.png' },
      { revision: '280875d6bb57ca35bdfc648bc33ff11a', url: '/icons/icon-72x72.webp' },
      { revision: 'b493d4a37571499fd637895a729cc998', url: '/icons/icon-96x96.png' },
      { revision: '280875d6bb57ca35bdfc648bc33ff11a', url: '/icons/icon-96x96.webp' },
      { revision: 'e9b83ba14be5a390810d513321f218b3', url: '/images/Tarsila_Antropofagia.jpg' },
      { revision: '04613ef52fc29aa305b06af5084551f9', url: '/kids/cocorico.jpg' },
      { revision: 'a12a9f2a78e6bc8a444e792b096ce49b', url: '/kids/jorel.png' },
      { revision: '3ab73a9ddac99d4ed20e18d1da004fd7', url: '/kids/jorel.webp' },
      { revision: '0bea35590e86bf699ea821a0a04f538d', url: '/kids/luluzinha.png' },
      { revision: '31ebc3a2adfb56efeca714212c65fcff', url: '/kids/luluzinha.webp' },
      { revision: 'a40af668d53ca6eab8d25fd288b57677', url: '/kids/luluzinha2.png' },
      { revision: '9e9d4cfac28daacd2c2b3c30dbd99b92', url: '/kids/luluzinha2.webp' },
      { revision: '88782dc1f25724ab601255c17ba36112', url: '/kids/menino_maluquim.jpg' },
      { revision: '9486a4df9e3b9973331411e14486e763', url: '/kids/monica.jpg' },
      { revision: 'eb93a3316a5d60fde75b766397c47ffb', url: '/kids/ze_carioca.png' },
      { revision: '34da58ee861968f486d8af6dd0c239ce', url: '/kids/ze_carioca.webp' },
      { revision: '294b110dd88c5c3fcba77882021c905c', url: '/logos/maritaca.png' },
      { revision: '5ae5473255d5fb2ae5f2d9096bcba17c', url: '/logos/maritaca.webp' },
      { revision: 'd03e5329acdeb45b362d16261c36b474', url: '/manifest.json' },
      { revision: 'fc32203e511dec8095b00f56ee9ffe36', url: '/maritaca_logo.avif' },
      { revision: '35b0c7f1c53c7460c1d572401d6f106c', url: '/operarios.png' },
      { revision: '16345468328aaad4f8cb228d45ae63f1', url: '/operarios.webp' },
      { revision: '302d3621cd5bea82d3b8ee193a93b79b', url: '/patterns/dots.svg' },
      { revision: 'daf3628f39bb3fd351408e2d4336ee58', url: '/pdf.worker.min.mjs' },
      { revision: '9ce3cd77d46cd93c49005448e3487b9d', url: '/sabia3.1.png' },
      { revision: '0346337cdf5c6dc44742937cd8621605', url: '/sabia3.1.webp' },
      { revision: '93c27e004fbce3c35e8c3e9de0fe1bcd', url: '/sabiazinho.png' },
      { revision: 'a644374a9d212a90d6a588e206fb4b5e', url: '/sabiazinho.webp' },
      { revision: '96a769e34e6c9e373eecd1d828e14dfe', url: '/splash/apple-splash-1125-2436.png' },
      { revision: '42683647120aaf6fff2d86a5b58f8ed8', url: '/splash/apple-splash-1125-2436.webp' },
      { revision: 'cf3f8c8cdbabc7c4f5d25ac60241c2e2', url: '/splash/apple-splash-1170-2532.png' },
      { revision: '352261681f0b9e66e4560a8e4861e27a', url: '/splash/apple-splash-1170-2532.webp' },
      { revision: '6997668511fd926081a9aa6682ebede3', url: '/splash/apple-splash-1179-2556.png' },
      { revision: 'd192c0776a3273bba3dff5b0843a8677', url: '/splash/apple-splash-1179-2556.webp' },
      { revision: '298a9fcdb867c9978374a39626d2c391', url: '/splash/apple-splash-1284-2778.png' },
      { revision: 'f10fa535e1f3ee2957f5d007e962e0ba', url: '/splash/apple-splash-1284-2778.webp' },
      { revision: 'b98ab4c120e54b1b54995e3d9cf258e2', url: '/splash/apple-splash-1290-2796.png' },
      { revision: '38394f1703f0a2660f53c2a4f8fba4a0', url: '/splash/apple-splash-1290-2796.webp' },
      { revision: '44cb8f47ce4ec81e0146e686434e4e02', url: '/splash/apple-splash-1536-2048.png' },
      { revision: '65535ef485bd619e8a443a8317617986', url: '/splash/apple-splash-1536-2048.webp' },
      { revision: 'b7d438bff41cd4056b6e8caae5a09270', url: '/splash/apple-splash-1640-2360.png' },
      { revision: '70de2efae6de3704ed786889df95fddf', url: '/splash/apple-splash-1640-2360.webp' },
      { revision: 'd9bf30dd580a8356b83d16b9a1981f7b', url: '/splash/apple-splash-1668-2388.png' },
      { revision: '9857565e06140cb0d1cf189b90ec20f0', url: '/splash/apple-splash-1668-2388.webp' },
      { revision: '834bb9958eae62147fa270b0696d97ee', url: '/splash/apple-splash-2048-2732.png' },
      { revision: 'a3ad69acf3700295998f8356ec243dda', url: '/splash/apple-splash-2048-2732.webp' },
      { revision: '1e0086c8f356f683105eeaa903f08739', url: '/splash/apple-splash-750-1334.png' },
      { revision: '13888fcdf1c6b13228b29921c51c1dad', url: '/splash/apple-splash-750-1334.webp' },
      { revision: 'b18f6c0b0320bcb9b3e51debde335008', url: '/swe-worker-ab00d3c7d2d59769.js' },
      { revision: 'fcb13e817ee9a119056506d64719c17b', url: '/swe-worker-ab00d3c7d2d59769.js.map' },
    ],
    skipWaiting: !0,
    clientsClaim: !0,
    navigationPreload: !0,
    runtimeCaching: [
      {
        matcher: /\.(?:js|css)$/i,
        handler: new eb({
          cacheName: 'static-js-css',
          plugins: [new e_({ maxEntries: 64, maxAgeSeconds: 2592e3 })],
        }),
      },
      {
        matcher: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
        handler: new eb({
          cacheName: 'static-images',
          plugins: [new e_({ maxEntries: 128, maxAgeSeconds: 5184e3 })],
        }),
      },
      {
        matcher: /\.(?:woff|woff2|ttf|otf|eot)$/i,
        handler: new eb({
          cacheName: 'static-fonts',
          plugins: [new e_({ maxEntries: 16, maxAgeSeconds: 31536e3 })],
        }),
      },
      {
        matcher: /\/agents\/.*\.(?:png|jpg|jpeg|webp)$/i,
        handler: new eb({
          cacheName: 'agent-avatars',
          plugins: [new e_({ maxEntries: 32, maxAgeSeconds: 2592e3 })],
        }),
      },
      {
        matcher: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: new eR({ cacheName: 'google-fonts-stylesheets' }),
      },
      {
        matcher: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: new eb({
          cacheName: 'google-fonts-webfonts',
          plugins: [new e_({ maxEntries: 16, maxAgeSeconds: 31536e3 })],
        }),
      },
      {
        matcher: /\/_next\/static\/.*/i,
        handler: new eb({
          cacheName: 'next-static',
          plugins: [new e_({ maxEntries: 256, maxAgeSeconds: 2592e3 })],
        }),
      },
      {
        matcher: /\/_next\/image\?.*/i,
        handler: new eR({
          cacheName: 'next-images',
          plugins: [new e_({ maxEntries: 64, maxAgeSeconds: 604800 })],
        }),
      },
      {
        matcher: (e) => {
          let { request: t } = e
          return 'document' === t.destination
        },
        handler: new H({
          cacheName: 'pages',
          networkTimeoutSeconds: 3,
          plugins: [new e_({ maxEntries: 32, maxAgeSeconds: 86400 })],
        }),
      },
    ],
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
      if ('cidadao-api-production.up.railway.app' !== t.hostname && !t.searchParams.has('_rsc')) {
        if ('http:' === t.protocol && 'localhost' !== t.hostname) {
          t.protocol = 'https:'
          let a = new Request(t.toString(), {
            method: e.request.method,
            headers: e.request.headers,
            body:
              'GET' !== e.request.method && 'HEAD' !== e.request.method ? e.request.body : void 0,
            mode: e.request.mode,
            credentials: e.request.credentials,
          })
          e.respondWith(
            fetch(a).catch(() => new Response('Failed to upgrade to HTTPS', { status: 400 }))
          )
          return
        }
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
    eq.addEventListeners())
})()
