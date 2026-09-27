/**
 * The body of the execution Worker, as a string.
 *
 * WHY A STRING, which is not the shape anyone would choose first.
 *
 * The intended approach was a real module — `new Worker(new URL('./exercise.worker.ts',
 * import.meta.url), { type: 'module' })` — and SDD §5.3 scheduled a spike precisely because it
 * was not certain to work here. It does not. On Next 16.2.12 with Turbopack the file is emitted
 * as a RAW ASSET (`.next/static/media/exercise.worker.<hash>.ts`, `import type` and all), so the
 * URL handed to `new Worker` points at TypeScript the browser cannot parse. Verified by
 * inspecting the build output, not assumed.
 *
 * WHAT THIS BODY IS ALLOWED TO CONTAIN, and why the string costs almost nothing:
 *
 * It executes and reports. It decides NOTHING. Every judgement — comparing output, comparing
 * values, formatting them for display, wording an error — happens on the main thread through the
 * same modules `runner-vm.ts` uses in Node. So the guarantee that the browser and the test suite
 * can never disagree is not weakened by this fallback; it is stronger than the original design,
 * where judging lived inside the Worker and was therefore a second copy waiting to drift.
 *
 * The only things here that are not pure transport are the cloneability triage below and the
 * splitting of an error into name and message. Both exist because `postMessage` structured-clones
 * its payload: a learner's answer can return a function or a `Symbol`, and an `Error` does not
 * arrive with its formatting intact. Sending a value that cannot be cloned would crash the
 * grader rather than fail the answer.
 */
export const WORKER_SOURCE = `
self.onmessage = function (event) {
  var id = event.data.id;
  var sources = event.data.sources;

  /* Values that cannot be structured-cloned are replaced by their text form. They are always
     wrong answers anyway — every expected value in the bank is plain data — so this turns a
     crash into an ordinary mismatch. */
  function aman(nilai) {
    try {
      structuredClone(nilai);
      return nilai;
    } catch (e) {
      return String(nilai);
    }
  }

  function uraiError(err) {
    if (err instanceof Error) {
      return { name: err.name, message: err.message };
    }
    return { name: '', message: String(err) };
  }

  function jalankanSatu(source) {
    var args = [];
    var tangkap = function () {
      args.push(Array.prototype.slice.call(arguments).map(aman));
    };
    var diam = function () {};
    var shim = {
      log: tangkap,
      info: tangkap,
      warn: tangkap,
      error: tangkap,
      debug: tangkap,
      dir: tangkap,
      table: diam,
      trace: diam,
      group: diam,
      groupEnd: diam,
    };

    /* new Function, not eval: the learner's code must not see this handler's scope. A SyntaxError
       is thrown while CONSTRUCTING, before anything runs, and is rethrown so the caller can report it
       as a crash rather than as a wrong answer — they are different problems. */
    var fn;
    try {
      fn = new Function('console', 'return ' + source + ';');
    } catch (err) {
      throw err;
    }

    try {
      var nilai = fn(shim);
      if (nilai && typeof nilai.then === 'function') {
        return nilai.then(
          function (hasil) {
            return { args: args, value: aman(hasil) };
          },
          function (err) {
            return { args: args, value: undefined, error: uraiError(err) };
          },
        );
      }
      return Promise.resolve({ args: args, value: aman(nilai) });
    } catch (err) {
      return Promise.resolve({ args: args, value: undefined, error: uraiError(err) });
    }
  }

  (async function () {
    var outcomes = [];
    try {
      for (var i = 0; i < sources.length; i++) {
        outcomes.push(await jalankanSatu(sources[i]));
      }
    } catch (err) {
      self.postMessage({ id: id, status: 'crash', error: uraiError(err) });
      return;
    }
    self.postMessage({ id: id, status: 'ok', outcomes: outcomes });
  })();
};
`;
