(function () {
  var BUBBLE_ID = 'ultra-fast-widget-bubble-54722168';
  var KEY = 'aidDemoWidgetAutoOpened';
  try { if (sessionStorage.getItem(KEY)) return; } catch (e) {}
  var userTouched = false;
  document.addEventListener('click', function (e) {
    if (e.isTrusted && e.target && e.target.closest && e.target.closest('#' + BUBBLE_ID)) { userTouched = true; }
  }, true);
  var tries = 0;
  var t = setInterval(function () {
    tries += 1;
    var b = document.getElementById(BUBBLE_ID);
    if (b && tries >= 7) {
      clearInterval(t);
      if (!userTouched) { b.click(); }
      try { sessionStorage.setItem(KEY, '1'); } catch (e) {}
    }
    if (tries > 30) { clearInterval(t); }
  }, 1000);
})();

(function(){
  'use strict';

  // ---- prefers-reduced-motion check ----
  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- SMS Sequencer ----
  var bubbles = ['b1','b2','b3','b4'];
  var typings = ['typing1','typing2','typing3','typing4'];
  var timers = [];
  var demoRunning = false;
  var demoGeneration = 0;

  function resetThread(){
    timers.forEach(function(t){clearTimeout(t)});
    timers = [];
    demoRunning = false;
    demoGeneration++;
    bubbles.forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.classList.remove('visible');
    });
    typings.forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.classList.remove('active');
    });
  }

  function playThread(){
    if(demoRunning) return;
    resetThread();
    demoRunning = true;
    var gen = demoGeneration;

    if(prefersReduced){
      bubbles.forEach(function(id){
        var el = document.getElementById(id);
        if(el) el.classList.add('visible');
      });
      demoRunning = false;
      return;
    }

    // sequence: typing -> bubble -> typing -> bubble -> ...
    var seq = [
      {typing:'typing1', bubble:null, delay:400},
      {typing:null, bubble:'b1', delay:1200},
      {typing:'typing2', bubble:null, delay:600},
      {typing:null, bubble:'b2', delay:1800},
      {typing:'typing3', bubble:null, delay:500},
      {typing:null, bubble:'b3', delay:1000},
      {typing:'typing4', bubble:null, delay:700},
      {typing:null, bubble:'b4', delay:1200},
    ];

    var elapsed = 0;
    seq.forEach(function(step){
      elapsed += step.delay;
      (function(e,s,g){
        timers.push(setTimeout(function(){
          if(demoGeneration !== g) return;
          if(s.typing){
            var t = document.getElementById(s.typing);
            if(t) t.classList.add('active');
          }
          if(s.bubble){
            // hide previous typing
            var prevIdx = bubbles.indexOf(s.bubble);
            if(prevIdx >= 0){
              var tId = typings[prevIdx];
              var tt = document.getElementById(tId);
              if(tt) tt.classList.remove('active');
            }
            var b = document.getElementById(s.bubble);
            if(b) b.classList.add('visible');
          }
        }, e));
      })(elapsed, step, gen);
    });

    var totalDur = elapsed + 200;
    timers.push(setTimeout(function(){
      if(demoGeneration !== gen) return;
      demoRunning = false;
    }, totalDur));
  }

  // IntersectionObserver: re-arm on every scroll entry
  var demoObserver;
  var demoPanel = document.getElementById('demo-panel');
  if(demoPanel && 'IntersectionObserver' in window){
    demoObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          playThread();
        } else {
          // reset on exit so re-entry starts clean
          resetThread();
        }
      });
    },{threshold:0.3});
    demoObserver.observe(demoPanel);
  } else {
    // fallback: just show all
    bubbles.forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.classList.add('visible');
    });
  }

  // Replay button
  var replayBtn = document.getElementById('replay-btn');
  if(replayBtn){
    replayBtn.addEventListener('click', function(){
      resetThread();
      setTimeout(playThread, 80);
    });
  }

  // ---- Stat Counter ----
  var countTarget = 12000;
  var countDuration = 1800;
  var countRunning = false;
  var countGeneration = 0;
  var countEl = document.getElementById('stat-counter');

  function runCount(){
    if(countRunning) return;
    countRunning = true;
    countGeneration++;
    var gen = countGeneration;
    var start = null;
    var startVal = 0;

    if(prefersReduced){
      if(countEl) countEl.textContent = countTarget.toLocaleString();
      countRunning = false;
      return;
    }

    function step(ts){
      if(countGeneration !== gen){ countRunning = false; return; }
      if(!start) start = ts;
      var prog = Math.min((ts - start) / countDuration, 1);
      var ease = 1 - Math.pow(1 - prog, 3);
      var val = Math.round(startVal + (countTarget - startVal) * ease);
      if(countEl) countEl.textContent = val.toLocaleString();
      if(prog < 1){
        requestAnimationFrame(step);
      } else {
        if(countEl) countEl.textContent = countTarget.toLocaleString();
        countRunning = false;
      }
    }
    if(countEl) countEl.textContent = '0';
    requestAnimationFrame(step);
  }

  function resetCount(){
    countRunning = false;
    countGeneration++;
    if(countEl) countEl.textContent = '0';
  }

  // prefers-reduced-motion listener
  if(window.matchMedia){
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function(e){
      prefersReduced = e.matches;
      if(prefersReduced){
        // snap to final states
        bubbles.forEach(function(id){
          var el = document.getElementById(id);
          if(el) el.classList.add('visible');
        });
        if(countEl) countEl.textContent = countTarget.toLocaleString();
      }
    });
  }

  var mathSection = document.querySelector('.math-section');
  if(mathSection && 'IntersectionObserver' in window){
    var mathObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          runCount();
        } else {
          resetCount();
        }
      });
    },{threshold:0.3});
    mathObserver.observe(mathSection);
  } else {
    if(countEl) countEl.textContent = countTarget.toLocaleString();
  }

  // Stat replay button
  var statReplayBtn = document.getElementById('stat-replay-btn');
  if(statReplayBtn){
    statReplayBtn.addEventListener('click', function(){
      resetCount();
      setTimeout(runCount, 80);
    });
  }

  // ---- Scroll Reveals ----
  var revealEls = document.querySelectorAll('.reveal');
  if('IntersectionObserver' in window){
    var revealObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('in');
          // one-time reveal: unobserve after reveal
          revealObserver.unobserve(entry.target);
        }
      });
    },{threshold:0.15});
    revealEls.forEach(function(el){ revealObserver.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('in'); });
  }

  // ---- Mobile sticky CTA: hide when real CTA is in view ----
  var mobileCta = document.getElementById('mobile-cta-bar');
  var ctaSection = document.getElementById('cta-section');
  if(mobileCta && ctaSection && 'IntersectionObserver' in window){
    var ctaObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          mobileCta.classList.add('hidden');
        } else {
          mobileCta.classList.remove('hidden');
        }
      });
    },{threshold:0.1});
    ctaObserver.observe(ctaSection);
  }

})();
// ── 7/16 sequencer contract override (patched 2026-07-21) ──
// play at ~15% visible; re-arm ONLY after full viewport exit; replay hard-resets.
;(function(){
  // Locate the SMS thread element (try common IDs in priority order)
  var threadIds = ['thread','thread-mobile','thread-desktop','sms-thread','sms-thread-desktop','demo-thread'];
  var threadEl = null;
  for (var _i = 0; _i < threadIds.length; _i++){
    threadEl = document.getElementById(threadIds[_i]);
    if (threadEl) break;
  }
  if (!threadEl) return; // no thread found — bail

  // Locate replay buttons (use the FIRST one if multiple)
  var replayBtns = Array.prototype.slice.call(document.querySelectorAll('[id*="replay"],[data-replay]'));

  function hardReset(){
    // Simulate a replay button click to let the existing implementation reset+play.
    // If no replay button exists, try firing a custom event the sequencer may listen for.
    if (replayBtns.length > 0){ replayBtns[0].click(); }
  }

  var _armed = true;
  function _autoplay(){
    if (!_armed) return;
    _armed = false;
    hardReset();
  }

  // playIO: fires when >= 15% of the thread is visible
  var playIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting && e.intersectionRatio >= 0.15){ _autoplay(); }
    });
  }, { threshold: 0.18 });
  playIO.observe(threadEl);

  // rearmIO: fires when thread fully exits the viewport (threshold:0 + !isIntersecting)
  var rearmIO = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting){ _armed = true; }
    });
  }, { threshold: 0 });
  rearmIO.observe(threadEl);

  // Check already-visible case at init time
  var _rect = threadEl.getBoundingClientRect();
  var _vh = window.innerHeight || document.documentElement.clientHeight;
  var _vis = Math.min(_rect.bottom, _vh) - Math.max(_rect.top, 0);
  if (_rect.height > 0 && _vis / _rect.height >= 0.15){ _autoplay(); }
})();
