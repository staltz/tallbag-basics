(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = {
  forEach: require('tallbag-for-each'),
  fromObs: require('tallbag-from-obs'),
  fromIter: require('tallbag-from-iter'),
  fromEvent: require('tallbag-from-event'),
  fromPromise: require('tallbag-from-promise'),
  interval: require('tallbag-interval'),
  map: require('tallbag-map'),
  scan: require('tallbag-scan'),
  flatten: require('tallbag-flatten'),
  take: require('tallbag-take'),
  skip: require('tallbag-skip'),
  filter: require('tallbag-filter'),
  merge: require('tallbag-merge'),
  concat: require('tallbag-concat'),
  combine: require('tallbag-combine'),
  share: require('tallbag-share'),
  pipe: require('callbag-pipe'),
};

},{"callbag-pipe":2,"tallbag-combine":6,"tallbag-concat":7,"tallbag-filter":8,"tallbag-flatten":9,"tallbag-for-each":10,"tallbag-from-event":11,"tallbag-from-iter":12,"tallbag-from-obs":13,"tallbag-from-promise":14,"tallbag-interval":15,"tallbag-map":16,"tallbag-merge":17,"tallbag-scan":18,"tallbag-share":19,"tallbag-skip":20,"tallbag-take":21}],2:[function(require,module,exports){
/**
 * callbag-pipe
 * ------------
 *
 * Utility function for plugging callbags together in chain. This utility
 * actually doesn't rely on Callbag specifics, and is basically the same as
 * Ramda's `pipe` or lodash's `flow`. Anyway, this exists just to play nicely
 * with the ecosystem, and to facilitate the import of the function.
 *
 * `npm install callbag-pipe`
 *
 * Example:
 *
 * Create a source with `pipe`, then pass it to a `forEach`:
 *
 *     const interval = require('callbag-interval');
 *     const forEach = require('callbag-for-each');
 *     const combine = require('callbag-combine');
 *     const pipe = require('callbag-pipe');
 *     const take = require('callbag-take');
 *     const map = require('callbag-map');
 *
 *     const source = pipe(
 *       combine(interval(100), interval(350)),
 *       map(([x, y]) => `X${x},Y${y}`),
 *       take(10)
 *     );
 *
 *     forEach(x => console.log(x))(source); // X2,Y0
 *                                           // X3,Y0
 *                                           // X4,Y0
 *                                           // X5,Y0
 *                                           // X6,Y0
 *                                           // X6,Y1
 *                                           // X7,Y1
 *                                           // X8,Y1
 *                                           // X9,Y1
 *                                           // X9,Y2
 *
 *
 * Or use `pipe` to go all the way from source to sink:
 *
 *     const interval = require('callbag-interval');
 *     const forEach = require('callbag-for-each');
 *     const combine = require('callbag-combine');
 *     const pipe = require('callbag-pipe');
 *     const take = require('callbag-take');
 *     const map = require('callbag-map');
 *
 *     pipe(
 *       combine(interval(100), interval(350)),
 *       map(([x, y]) => `X${x},Y${y}`),
 *       take(10),
 *       forEach(x => console.log(x))
 *     );
 *     // X2,Y0
 *     // X3,Y0
 *     // X4,Y0
 *     // X5,Y0
 *     // X6,Y0
 *     // X6,Y1
 *     // X7,Y1
 *     // X8,Y1
 *     // X9,Y1
 *     // X9,Y2
 *
 *
 * Nesting
 * -------
 *
 * To use pipe inside another pipe, you need to give the inner pipe an
 * argument, e.g. `s => pipe(s, ...`:
 *
 *     const interval = require('callbag-interval');
 *     const forEach = require('callbag-for-each');
 *     const combine = require('callbag-combine');
 *     const pipe = require('callbag-pipe');
 *     const take = require('callbag-take');
 *     const map = require('callbag-map');
 *
 *     pipe(
 *       combine(interval(100), interval(350)),
 *       s => pipe(s,
 *         map(([x, y]) => `X${x},Y${y}`),
 *         take(10)
 *       ),
 *       forEach(x => console.log(x))
 *     );
 *
 *
 * This means you can use pipe to create a new operator:
 *
 *     const mapThenTake = (f, amount) =>
 *       s => pipe(s, map(f), take(amount));
 *
 *     pipe(
 *       combine(interval(100), interval(350)),
 *       mapThenTake(([x, y]) => `X${x},Y${y}`, 10),
 *       forEach(x => console.log(x))
 *     );
 *
 */

function pipe(...cbs) {
  let res = cbs[0];
  for (let i = 1, n = cbs.length; i < n; i++) res = cbs[i](res);
  return res;
}

module.exports = pipe;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function makeShadow(name, sourceOrSources) {
    var sink;
    var metadata = { name: name };
    var firstSent = false;
    var sourceMetadata;
    return function (type, data) {
        if (type === 0) {
            sink = data;
            sink(0, function (t) {
                if (t === 1 && !firstSent && !sourceOrSources) {
                    firstSent = true;
                    sink(1, metadata);
                }
                if (t === 2)
                    sink = undefined;
            });
            if (sourceOrSources && Array.isArray(sourceOrSources)) {
                var sources = sourceOrSources;
                var n = sources.length;
                var remaining_1 = n; // start counter
                sourceMetadata = new Array(n);
                sources.forEach(function (source, i) {
                    sourceMetadata[i] = undefined;
                    source(0, function (t, d) {
                        if (t === 0) {
                            var talkback = d;
                            if (!firstSent)
                                talkback(1);
                        }
                        if (t === 1) {
                            var _remaining = !remaining_1
                                ? 0
                                : !sourceMetadata[i]
                                    ? --remaining_1
                                    : remaining_1;
                            sourceMetadata[i] = d;
                            if (_remaining === 0) {
                                metadata = {
                                    source: sourceMetadata,
                                    name: name,
                                    data: metadata.data,
                                    timestamp: metadata.timestamp,
                                };
                                firstSent = true;
                                if (sink)
                                    sink(1, metadata);
                            }
                        }
                    });
                });
            }
            else if (sourceOrSources) {
                var source = sourceOrSources;
                source(0, function (t, d) {
                    if (t === 0) {
                        var talkback = d;
                        if (!firstSent)
                            talkback(1);
                    }
                    if (t === 1) {
                        sourceMetadata = d;
                        metadata = {
                            source: sourceMetadata,
                            name: name,
                            data: metadata.data,
                            timestamp: metadata.timestamp,
                        };
                        firstSent = true;
                        if (sink)
                            sink(1, metadata);
                    }
                });
            }
        }
        if (type === 1) {
            metadata = {
                source: sourceMetadata,
                name: name,
                data: typeof data === 'function' ? '[Function]' : data,
                timestamp: Date.now(),
            };
            if (sink)
                sink(1, metadata);
        }
    };
}
exports.default = makeShadow;

},{}],4:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ponyfill = require('./ponyfill.js');

var _ponyfill2 = _interopRequireDefault(_ponyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var root; /* global window */


if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (typeof module !== 'undefined') {
  root = module;
} else {
  root = Function('return this')();
}

var result = (0, _ponyfill2['default'])(root);
exports['default'] = result;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./ponyfill.js":5}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports['default'] = symbolObservablePonyfill;
function symbolObservablePonyfill(root) {
	var result;
	var _Symbol = root.Symbol;

	if (typeof _Symbol === 'function') {
		if (_Symbol.observable) {
			result = _Symbol.observable;
		} else {
			result = _Symbol('observable');
			_Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
};
},{}],6:[function(require,module,exports){
/**
 * tallbag-combine
 * ---------------
 *
 * Tallbag factory that combines the latest data points from multiple (2 or
 * more) tallbag sources. It delivers those latest values as an array. Works
 * with both pullable and listenable sources.
 *
 * `npm install tallbag-combine`
 *
 * Example:
 *
 *     const interval = require('callbag-interval');
 *     const observe = require('callbag-observe');
 *     const combine = require('tallbag-combine');
 *
 *     const source = combine(interval(100), interval(350));
 *
 *     observe(x => console.log(x))(source); // [2,0]
 *                                           // [3,0]
 *                                           // [4,0]
 *                                           // [5,0]
 *                                           // [6,0]
 *                                           // [6,1]
 *                                           // [7,1]
 *                                           // [8,1]
 *                                           // ...
 */

const makeShadow = require('shadow-callbag').default;

const EMPTY = {};

const combine = (...sources) => (start, sink) => {
  if (start !== 0) return;
  const n = sources.length;
  if (n === 0) {
    sink(0, () => {}, makeShadow('combine'));
    sink(1, []);
    sink(2);
    return;
  }
  let Ns = n; // start counter
  let Nd = n; // data counter
  let Ne = n; // end counter
  let shadow;
  const sourceTalkbacks = new Array(n);
  const sourceShadows = new Array(n);
  const vals = new Array(n);
  const talkback = (t, d) => {
    if (t === 0) return;
    for (let i = 0; i < n; i++) {
      sourceTalkbacks[i](t, d);
      t === 2 && sourceShadows[i] && sourceShadows[i](2);
    }
  };
  sources.forEach((source, i) => {
    vals[i] = EMPTY;
    source(0, (t, d, s) => {
      if (t === 0) {
        sourceTalkbacks[i] = d;
        sourceShadows[i] = s;
        if (--Ns === 0) {
          shadow = makeShadow('combine', sourceShadows);
          sink(0, talkback, shadow);
        }
      } else if (t === 1) {
        const _Nd = !Nd ? 0 : vals[i] === EMPTY ? --Nd : Nd;
        vals[i] = d;
        if (_Nd === 0) {
          const arr = new Array(n);
          for (let j = 0; j < n; ++j) arr[j] = vals[j];
          shadow(1, arr);
          sink(1, arr);
        }
      } else if (t === 2) {
        if (--Ne === 0) sink(2);
      } else {
        sink(t, d);
      }
    });
  });
};

module.exports = combine;

},{"shadow-callbag":3}],7:[function(require,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var makeShadow = _interopDefault(require('shadow-callbag'));

/**
 * tallbag-concat
 * --------------
 *
 * Tallbag factory that concatenates the data from multiple (2 or more)
 * tallbag sources. It starts each source at a time: waits for the previous
 * source to end before starting the next source. Works with both pullable
 * and listenable sources.
 *
 * `npm install tallbag-concat`
 *
 * Example:
 *
 *     const fromIter = require('callbag-from-iter');
 *     const iterate = require('callbag-iterate');
 *     const concat = require('tallbag-concat');
 *
 *     const source = concat(fromIter([10,20,30]), fromIter(['a','b']));
 *
 *     iterate(x => console.log(x))(source); // 10
 *                                           // 20
 *                                           // 30
 *                                           // a
 *                                           // b
 */
const UNIQUE = {};

const concat = (...sources) => (start, sink) => {
  if (start !== 0) return;
  const n = sources.length;
  if (n === 0) {
    sink(0, () => {}, makeShadow('concat'));
    sink(2);
    return;
  }
  let i = 0;
  let sourceTalkback;
  let lastPull = UNIQUE;
  const shadow = makeShadow('concat');
  const talkback = (t, d) => {
    if (t === 1) lastPull = d;
    sourceTalkback(t, d);
  };
  (function next() {
    if (i === n) {
      sink(2);
      return;
    }
    sources[i](0, (t, d, memberShadow) => {
      if (t === 0) {
        sourceTalkback = d;
        if (memberShadow) {
          memberShadow(0, (_t, _d) => {
            if (_t === 0) _d(1);
            if (_t === 1) shadow(1, _d);
          });
        }
        if (i === 0) sink(0, talkback);
        else if (lastPull !== UNIQUE) sourceTalkback(1, lastPull);
      } else if (t === 2 && d) {
        sink(2, d);
      } else if (t === 2) {
        i++;
        next();
      } else {
        sink(t, d);
      }
    });
  })();
};

module.exports = concat;

},{"shadow-callbag":3}],8:[function(require,module,exports){
/**
 * tallbag-filter
 * --------------
 *
 * Tallbag operator that conditionally lets data pass through. Works on either
 * pullable or listenable sources.
 *
 * `npm install tallbag-filter`
 *
 * Example:
 *
 *     const fromIter = require('callbag-from-iter');
 *     const iterate = require('callbag-iterate');
 *     const filter = require('tallbag-filter');
 *
 *     const source = filter(x => x % 2)(fromIter([1,2,3,4,5]));
 *
 *     iterate(x => console.log(x))(source); // 1
 *                                           // 3
 *                                           // 5
 */

const makeShadow = require('shadow-callbag').default;

const filter = condition => source => (start, sink) => {
  if (start !== 0) return;
  let talkback;
  let shadow;
  source(0, (t, d, s) => {
    if (t === 0) {
      shadow = makeShadow('filter', s);
      talkback = d;
      sink(0, talkback, shadow);
    } else if (t === 1) {
      if (condition(d)) {
        shadow(t, d);
        sink(t, d);
      } else talkback(1);
    } else sink(t, d);
  });
};

module.exports = filter;

},{"shadow-callbag":3}],9:[function(require,module,exports){
'use strict';

const makeShadow = require('shadow-callbag').default;

const flatten = source => (start, sink) => {
  if (start !== 0) return;
  let outerEnded = false;
  let outerTalkback;
  let innerTalkback;
  let innerShadow;
  let shadow;
  function talkback(t, d) {
    if (t === 1) (innerTalkback || outerTalkback)(1, d);
    if (t === 2) {
      innerTalkback && innerTalkback(2);
      innerShadow && innerShadow(2);
      outerTalkback(2);
    }
  }
  source(0, (T, D, S) => {
    if (T === 0) {
      outerTalkback = D;
      shadow = makeShadow('flatten', S);
      sink(0, talkback, shadow);
    } else if (T === 1) {
      const innerSource = D;
      innerTalkback && innerTalkback(2);
      innerShadow && innerShadow(2);
      innerSource(0, (t, d, s) => {
        if (t === 0) {
          innerTalkback = d;
          innerTalkback(1);
          innerShadow = s;
          innerShadow(0, (_t, _d) => {
            if (_t === 0) _d(1);
            if (_t === 1) shadow(1, _d);
          });
        } else if (t === 1) sink(1, d);
        else if (t === 2 && d) {
          outerTalkback(2);
          sink(2, d);
        } else if (t === 2) {
          if (outerEnded) sink(2);
          else {
            innerTalkback = void 0;
            innerShadow = void 0;
            outerTalkback(1);
          }
        }
      });
    } else if (T === 2 && D) {
      innerTalkback && innerTalkback(2);
      innerShadow && innerShadow(2);
      sink(2, D);
    } else if (T === 2) {
      if (!innerTalkback) sink(2);
      else outerEnded = true;
    }
  });
};

module.exports = flatten;

},{"shadow-callbag":3}],10:[function(require,module,exports){
/**
 * tallbag-for-each
 * ----------------
 *
 * Tallbag sink that consume both pullable and listenable sources. When called
 * on a pullable source, it will iterate through its data. When called on a
 * listenable source, it will observe its data.
 *
 * `npm install tallbag-for-each`
 *
 * The first argument is the consumer of data,
 * the second argument is the (optional) consumer of metadata from the shadow.
 *
 * Examples
 * --------
 *
 * Consume a pullable source:
 *
 *     const fromIter = require('callbag-from-iter');
 *     const forEach = require('tallbag-for-each');
 *
 *     const source = fromIter([10,20,30,40])
 *
 *     forEach(x => console.log(x))(source); // 10
 *                                           // 20
 *                                           // 30
 *                                           // 40
 *
 * Consume a listenable source:
 *
 *     const interval = require('tallbag-interval');
 *     const forEach = require('tallbag-for-each');
 *
 *     const source = interval(1000);
 *
 *     forEach(x => console.log(x))(source); // 0
 *                                           // 1
 *                                           // 2
 *                                           // 3
 *                                           // ...
 */

const makeShadow = require('shadow-callbag').default;

const forEach = (operation, shadowOperation) => source => {
  let talkback;
  let shadow;
  source(0, (t, d, s) => {
    if (t === 0) {
      talkback = d;
      if (shadowOperation) {
        shadow = makeShadow('forEach', s);
        shadow(0, (_t, _d) => {
          if (_t === 0) _d(1);
          if (_t === 1) shadowOperation(_d);
        });
      }
    }
    if (t === 1) {
      shadow && shadow(1, d);
      operation(d);
    }
    if (t === 1 || t === 0) talkback(1);
  });
};

module.exports = forEach;

},{"shadow-callbag":3}],11:[function(require,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var makeShadow = _interopDefault(require('shadow-callbag'));

const fromEvent = (node, name, options) => (start, sink) => {
  if (start !== 0) return;
  let disposed = false;
  const shadow = makeShadow('from-event');
  const handler = ev => {
    shadow(1, ev);
    sink(1, ev);
  };

  sink(0, t => {
    if (t !== 2) {
      return;
    }
    disposed = true;
    node.removeEventListener(name, handler, options);
  });

  if (disposed) {
    return;
  }

  node.addEventListener(name, handler, options);
};

module.exports = fromEvent;

},{"shadow-callbag":3}],12:[function(require,module,exports){
const makeShadow = require('shadow-callbag').default;

const fromIter = iter => (start, sink) => {
  if (start !== 0) return;
  const iterator =
    typeof Symbol !== 'undefined' && iter[Symbol.iterator]
      ? iter[Symbol.iterator]()
      : iter;
  const shadow = makeShadow('from-iter');
  let inloop = false;
  let got1 = false;
  let completed = false;
  let res;
  function loop() {
    inloop = true;
    while (got1 && !completed) {
      got1 = false;
      res = iterator.next();
      if (res.done) {
        sink(2);
        break;
      } else {
        shadow(1, res.value);
        sink(1, res.value);
      }
    }
    inloop = false;
  }
  function talkback(t) {
    if (completed) return;

    if (t === 1) {
      got1 = true;
      if (!inloop && !(res && res.done)) loop();
    } else if (t === 2) {
      completed = true;
    }
  }
  sink(0, talkback, shadow);
};

module.exports = fromIter;

},{"shadow-callbag":3}],13:[function(require,module,exports){
/**
 * tallbag-from-obs
 * --------------
 *
 * Convert an observable (or subscribable) to a tallbag listenable source.
 *
 * `npm install tallbag-from-obs`
 *
 * Example:
 *
 * Convert an RxJS Observable:
 *
 *     const Rx = require('rxjs');
 *     const fromObs = require('tallbag-from-obs');
 *     const observe = require('callbag-observe');
 *
 *     const source = fromObs(Rx.Observable.interval(1000).take(4));
 *
 *     observe(x => console.log(x)(source); // 0
 *                                          // 1
 *                                          // 2
 *                                          // 3
 *
 * Convert anything that has the `.subscribe` method:
 *
 *     const fromObs = require('tallbag-from-obs');
 *     const observe = require('callbag-observe');
 *
 *     const subscribable = {
 *       subscribe: (observer) => {
 *         let i = 0;
 *         setInterval(() => observer.next(i++), 1000);
 *       }
 *     };
 *
 *     const source = fromObs(subscribable);
 *
 *     observe(x => console.log(x))(source); // 0
 *                                           // 1
 *                                           // 2
 *                                           // 3
 *                                           // ...
 */

const makeShadow = require('shadow-callbag').default;
const $$observable = require('symbol-observable').default;

const fromObs = observable => (start, sink) => {
  if (start !== 0) return;
  let dispose;
  const shadow = makeShadow('from-obs');
  function talkback(t) {
    if (t === 2 && dispose) {
      if (dispose.unsubscribe) dispose.unsubscribe();
      else dispose();
    }
  }
  sink(0, talkback, shadow);
  observable = observable[$$observable]
    ? observable[$$observable]()
    : observable;
  dispose = observable.subscribe({
    next: x => {
      shadow(1, x);
      sink(1, x);
    },
    error: e => sink(2, e),
    complete: () => sink(2),
  });
};

module.exports = fromObs;

},{"shadow-callbag":3,"symbol-observable":4}],14:[function(require,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var makeShadow = _interopDefault(require('shadow-callbag'));

const fromPromise = promise => (start, sink) => {
  if (start !== 0) return;
  let ended = false;
  const shadow = makeShadow('from-promise');
  const onfulfilled = val => {
    if (ended) return;
    shadow(1, val);
    sink(1, val);
    if (ended) return;
    sink(2);
  };
  const onrejected = err => {
    if (ended) return;
    sink(2, err);
  };
  promise.then(onfulfilled, onrejected);
  function talkback(t) {
    if (t === 2) ended = true;
  }
  sink(0, talkback, shadow);
};

module.exports = fromPromise;

},{"shadow-callbag":3}],15:[function(require,module,exports){
'use strict';

const makeShadow = require('shadow-callbag').default;

const interval = period => (start, sink) => {
  if (start !== 0) return;
  let i = 0;
  const shadow = makeShadow('interval');
  const id = setInterval(() => {
    shadow(1, i);
    sink(1, i++);
  }, period);
  function talkback(t) {
    if (t === 2) clearInterval(id);
  }
  sink(0, talkback, shadow);
};

module.exports = interval;

},{"shadow-callbag":3}],16:[function(require,module,exports){
/**
 * tallbag-map
 * -----------
 *
 * Tallbag operator that applies a transformation on data passing through it.
 * Works on either pullable or listenable sources.
 *
 * `npm install tallbag-map`
 *
 * Example:
 *
 *     const fromIter = require('callbag-from-iter');
 *     const iterate = require('callbag-iterate');
 *     const map = require('tallbag-map');
 *
 *     const source = map(x => x * 0.1)(fromIter([10,20,30,40]));
 *
 *     iterate(x => console.log(x))(source); // 1
 *                                           // 2
 *                                           // 3
 *                                           // 4
 */

const makeShadow = require('shadow-callbag').default;

const map = f => source => (start, sink) => {
  if (start !== 0) return;
  let shadow;
  source(0, (t, d, s) => {
    if (t === 0) {
      shadow = makeShadow('map', s);
      sink(0, d, shadow);
    }
    if (t === 1) {
      const y = f(d);
      shadow && shadow(1, y);
      sink(t, y);
    }
    if (t === 2) sink(t, d);
  });
};

module.exports = map;

},{"shadow-callbag":3}],17:[function(require,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var makeShadow = _interopDefault(require('shadow-callbag'));

/**
 * tallbag-merge
 * -------------
 *
 * Tallbag factory that merges data from multiple tallbag sources. Works well
 * with listenable sources, and while it may work for some pullable sources,
 * it is only designed for listenable sources.
 *
 * `npm install tallbag-merge`
 *
 * Example:
 *
 *     const interval = require('callbag-interval');
 *     const forEach = require('callbag-for-each');
 *     const merge = require('tallbag-merge');
 *
 *     const source = merge(interval(100), interval(350));
 *
 *     forEach(x => console.log(x))(source); // 0
 *                                           // 1
 *                                           // 2
 *                                           // 0
 *                                           // 3
 *                                           // 4
 *                                           // 5
 *                                           // ...
 */

function merge(...sources) {
  return (start, sink) => {
    if (start !== 0) return;
    const n = sources.length;
    const sourceShadows = new Array(n);
    const sourceTalkbacks = new Array(n);
    let shadow;
    let startCount = 0;
    let endCount = 0;
    let ended = false;
    const talkback = (t, d) => {
      if (t === 2) ended = true;
      for (let i = 0; i < n; i++)
        sourceTalkbacks[i] && sourceTalkbacks[i](t, d);
    };
    for (let i = 0; i < n; i++) {
      if (ended) return;
      sources[i](0, (t, d, s) => {
        if (t === 0) {
          sourceShadows[i] = s;
          sourceTalkbacks[i] = d;
          if (++startCount === 1) {
            shadow = makeShadow('merge', sourceShadows);
            sink(0, talkback, shadow);
          }
        }

        if (t === 1) {
          shadow(1, d);
          sink(1, d);
        }

        if (t === 2) {
          if (!!d) {
            ended = true;
            for (let j = 0; j < n; j++) {
              if (j !== i) sourceTalkbacks[j] && sourceTalkbacks[j](2);
            }
            sink(2, d);
          } else {
            sourceTalkbacks[i] = void 0;
            if (++endCount === n) sink(2);
          }
        }
      });
    }
  };
}

module.exports = merge;

},{"shadow-callbag":3}],18:[function(require,module,exports){
/**
 * Tallbag-scan
 * ------------
 *
 * Tallbag operator that combines consecutive values from the same source.
 * It's essentially like array `.reduce`, but delivers a new accumulated value
 * for each value from the tallbag source. Works on either pullable or
 * listenable sources.
 *
 * `npm install tallbag-scan`
 *
 * Example:
 *
 *     const fromIter = require('callbag-from-iter');
 *     const iterate = require('callbag-iterate');
 *     const scan = require('tallbag-scan');
 *
 *     const iterSource = fromIter([1,2,3,4,5]);
 *     const scanned = scan((prev, x) => prev + x, 0)(iterSource);
 *
 *     scanned(0, iterate(x => console.log(x))); // 1
 *                                               // 3
 *                                               // 6
 *                                               // 10
 *                                               // 15
 */

const makeShadow = require('shadow-callbag').default;

function scan(reducer, seed) {
  let hasAcc = arguments.length === 2;
  return source => (start, sink) => {
    if (start !== 0) return;
    let acc = seed;
    let shadow;
    source(0, (t, d, s) => {
      if (t === 0) {
        shadow = makeShadow('scan', s);
        sink(t, d, shadow);
      }
      if (t === 1) {
        acc = hasAcc ? reducer(acc, d) : ((hasAcc = true), d);
        sink(1, acc);
      }
      if (t === 2) sink(t, d);
    });
  };
}

module.exports = scan;

},{"shadow-callbag":3}],19:[function(require,module,exports){
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var makeShadow = _interopDefault(require('shadow-callbag'));

const share = source => {
  let sinks = [];
  let sourceTalkback;

  return function shared(start, sink) {
    if (start !== 0) return;
    sinks.push(sink);

    let shadow;
    const talkback = (t, d) => {
      if (t === 2) {
        const i = sinks.indexOf(sink);
        if (i > -1) sinks.splice(i, 1);
        if (!sinks.length) sourceTalkback(2);
      } else {
        sourceTalkback(t, d);
      }
    };

    if (sinks.length === 1) {
      source(0, (t, d, s) => {
        if (t === 0) {
          sourceTalkback = d;
          shadow = makeShadow('share', s);
          sink(0, talkback, shadow);
        } else for (let _sink of sinks.slice(0)) _sink(t, d);
        if (t === 2) sinks = [];
      });
      return;
    }

    shadow = makeShadow('share');
    sink(0, talkback, share);
  };
};

module.exports = share;

},{"shadow-callbag":3}],20:[function(require,module,exports){
const makeShadow = require('shadow-callbag').default;

const skip = max => source => (start, sink) => {
  if (start !== 0) return;
  let skipped = 0;
  let talkback;
  let shadow;
  source(0, (t, d, s) => {
    if (t === 0) {
      shadow = makeShadow('skip', s);
      talkback = d;
      sink(0, talkback, shadow);
    } else if (t === 1) {
      if (skipped < max) {
        skipped++;
        talkback(1);
      } else {
        shadow(t, d);
        sink(t, d);
      }
    } else {
      sink(t, d);
    }
  });
};

module.exports = skip;

},{"shadow-callbag":3}],21:[function(require,module,exports){
const makeShadow = require('shadow-callbag').default;

const take = max => source => (start, sink) => {
  if (start !== 0) return;
  let taken = 0;
  let shadow;
  let sourceTalkback;
  function talkback(t, d) {
    if (taken < max) sourceTalkback(t, d);
  }
  source(0, (t, d, s) => {
    if (t === 0) {
      shadow = makeShadow('take', s);
      sourceTalkback = d;
      sink(0, talkback, shadow);
    } else if (t === 1) {
      if (taken < max) {
        taken++;
        shadow(t, d);
        sink(t, d);
        if (taken === max) {
          sink(2);
          sourceTalkback(2);
        }
      }
    } else {
      sink(t, d);
    }
  });
};

module.exports = take;

},{"shadow-callbag":3}]},{},[1]);
