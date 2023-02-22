// Custom function based on https://www.npmjs.com/package/throttleit
// It runs the function on both start and end but is throttled to be run at most every wait

export default function throttle(func, wait, callOnLead = false) {
  var ctx, args, rtn, timeoutID; // caching
  var last = 0;

  return function throttled() {
    ctx = this;
    args = arguments;
    var delta = new Date() - last;
    if (!timeoutID)
      if (delta >= wait) {
        if (callOnLead) {
          call();
        }
        timeoutID = setTimeout(call, wait);
      } else {
        timeoutID = setTimeout(call, wait - delta);
      }
    return rtn;
  };

  function call() {
    timeoutID = 0;
    last = +new Date();
    rtn = func.apply(ctx, args);
    ctx = null;
    args = null;
  }
}
