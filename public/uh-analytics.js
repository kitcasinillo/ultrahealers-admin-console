(function () {
  'use strict';

  if (window.__UH_ANALYTICS_INITIALIZED__) return;
  window.__UH_ANALYTICS_INITIALIZED__ = true;

  var API_ENDPOINT = (function () {
    var host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5001/api/v1/analytics/collect';
    }
    return 'https://api.ultrahealers.com/api/v1/analytics/collect';
  })();

  function getOrSetSessionId() {
    var sid = sessionStorage.getItem('uh_sid');
    if (!sid) {
      sid = 'uh_s_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      sessionStorage.setItem('uh_sid', sid);
    }
    return sid;
  }

  function getQueryParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      utmSource: params.get('utm_source') || '',
      utmMedium: params.get('utm_medium') || '',
      utmCampaign: params.get('utm_campaign') || ''
    };
  }

  function cleanElementDescriptor(el) {
    if (!el) return 'Interactive Element';

    var customTrack = el.getAttribute('data-uh-track');
    if (customTrack) return customTrack;

    var ariaLabel = el.getAttribute('aria-label') || el.getAttribute('aria-description');
    if (ariaLabel) return ariaLabel + ' Button';

    var title = el.getAttribute('title');
    if (title) return title;

    var alt = el.getAttribute('alt');
    if (alt) return 'Image: ' + alt;

    var placeholder = el.getAttribute('placeholder');
    if (placeholder) return 'Input ("' + placeholder + '")';

    var text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    if (text.length > 0 && text.length <= 40 && !/^\d+$/.test(text)) {
      var tag = el.tagName.toLowerCase();
      var tagLabel = tag === 'a' ? 'Link' : tag === 'button' ? 'Button' : tag;
      return '"' + text + '" (' + tagLabel + ')';
    }

    var svg = el.querySelector('svg');
    if (svg) {
      var svgClass = String((svg.getAttribute('class') || '') + ' ' + (svg.className || ''));
      var lucideMatch = svgClass.match(/lucide-([a-z0-9-]+)/i);
      if (lucideMatch && lucideMatch[1]) {
        var iconName = lucideMatch[1]
          .split('-')
          .map(function(w) { return w.charAt(0).toUpperCase() + w.slice(1); })
          .join(' ');
        return '"' + iconName + '" Icon Button';
      }
    }

    if (el.name) {
      return '"' + el.name + '" Field';
    }
    if (el.id) {
      return '#' + el.id + ' (' + el.tagName.toLowerCase() + ')';
    }
    if (el.type === 'submit') {
      return 'Submit Button';
    }

    var section = el.closest('[data-section], section, form, header, nav');
    if (section) {
      var secName = section.getAttribute('data-section') || section.id || section.tagName.toLowerCase();
      return '"' + secName + '" Action Button';
    }

    var tag = el.tagName.toLowerCase();
    return tag === 'a' ? 'Link Click' : 'Action Button';
  }

  var sessionId = getOrSetSessionId();
  var queryParams = getQueryParams();
  var pageStartTime = Date.now();
  var currentUserId = null;
  var currentUserRole = null;

  var state = {
    sessionId: sessionId,
    domain: window.location.hostname || 'admin.ultrahealers.com',
    path: window.location.pathname || '/',
    referrer: document.referrer ? new URL(document.referrer).hostname : 'direct',
    utmSource: queryParams.utmSource,
    utmMedium: queryParams.utmMedium,
    utmCampaign: queryParams.utmCampaign
  };

  function sendEvent(eventType, extraData) {
    var timeOnPage = Math.round((Date.now() - pageStartTime) / 1000);
    var payload = {
      sessionId: state.sessionId,
      domain: state.domain,
      path: state.path,
      referrer: state.referrer,
      utmSource: state.utmSource,
      utmMedium: state.utmMedium,
      utmCampaign: state.utmCampaign,
      userId: currentUserId,
      role: currentUserRole,
      eventType: eventType,
      timeOnPage: timeOnPage,
      timestamp: new Date().toISOString()
    };

    if (extraData) {
      if (extraData.targetElement) payload.targetElement = extraData.targetElement;
      if (extraData.vitals) payload.vitals = extraData.vitals;
      if (extraData.errorMessage) payload.errorMessage = extraData.errorMessage;
      if (extraData.source) payload.source = extraData.source;
      if (extraData.line) payload.line = extraData.line;
      if (extraData.col) payload.col = extraData.col;
      if (extraData.stack) payload.stack = extraData.stack;
      if (extraData.goalName) payload.goalName = extraData.goalName;
    }

    var payloadString = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      var blob = new Blob([payloadString], { type: 'text/plain;charset=UTF-8' });
      navigator.sendBeacon(API_ENDPOINT, blob);
    } else {
      fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadString,
        keepalive: true
      }).catch(function () {});
    }
  }

  window.UHAnalytics = {
    setUserId: function (userId, role) {
      if (userId) currentUserId = userId;
      if (role) currentUserRole = role;
    },
    trackEvent: function (eventType, metadata) {
      sendEvent(eventType || 'custom', metadata);
    },
    trackConversion: function (goalName, metadata) {
      var meta = metadata || {};
      meta.goalName = goalName || 'general_conversion';
      sendEvent('conversion', meta);
    },
    trackPageview: function (newPath) {
      if (newPath) state.path = newPath;
      pageStartTime = Date.now();
      sendEvent('pageview');
    }
  };

  sendEvent('pageview');

  // Performance & Web Vitals Metric Ingestion
  var vitalsSent = false;
  function reportWebVitals() {
    if (vitalsSent) return;
    var vitals = {};
    try {
      if ('PerformanceObserver' in window) {
        var lcpObserver = new PerformanceObserver(function (entryList) {
          var entries = entryList.getEntries();
          var lastEntry = entries[entries.length - 1];
          if (lastEntry) vitals.lcp = Math.round(lastEntry.startTime);
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

        var clsValue = 0;
        var clsObserver = new PerformanceObserver(function (entryList) {
          var entries = entryList.getEntries();
          for (var i = 0; i < entries.length; i++) {
            if (!entries[i].hadRecentInput) clsValue += entries[i].value;
          }
          vitals.cls = Number(clsValue.toFixed(3));
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });

        var fidObserver = new PerformanceObserver(function (entryList) {
          var firstInput = entryList.getEntries()[0];
          if (firstInput) vitals.fid = Math.round(firstInput.processingStart - firstInput.startTime);
        });
        fidObserver.observe({ type: 'first-input', buffered: true });
      }
    } catch (e) {}

    setTimeout(function () {
      if (Object.keys(vitals).length > 0) {
        vitalsSent = true;
        sendEvent('web_vitals', { vitals: vitals });
      }
    }, 4000);
  }
  reportWebVitals();

  // Client-Side Exception & Error Monitoring
  window.addEventListener('error', function (evt) {
    if (!evt) return;
    var errorMsg = evt.message || (evt.error && evt.error.message) || 'Unknown Script Error';
    var source = evt.filename || '';
    var line = evt.lineno || 0;
    var col = evt.colno || 0;
    sendEvent('error', {
      errorMessage: errorMsg,
      source: source ? source.split('/').pop() : 'inline',
      line: line,
      col: col,
      stack: evt.error && evt.error.stack ? evt.error.stack.substring(0, 300) : ''
    });
  }, true);

  window.addEventListener('unhandledrejection', function (evt) {
    if (!evt) return;
    var reason = evt.reason;
    var errorMsg = typeof reason === 'string' ? reason : (reason && reason.message) ? reason.message : 'Unhandled Promise Rejection';
    sendEvent('error', {
      errorMessage: errorMsg,
      source: 'Promise',
      stack: reason && reason.stack ? reason.stack.substring(0, 300) : ''
    });
  });

  // Frustration Signal Detection (Rage Clicks) & Click Tracking
  var clickHistory = [];
  document.addEventListener('click', function (evt) {
    var target = evt.target;
    var now = Date.now();

    // Rage Clicks: 3+ rapid clicks on the same location/element within 900ms
    var anyDescriptor = cleanElementDescriptor(target.closest('button, a, [role="button"], [data-uh-track]') || target);
    clickHistory.push({ time: now, target: anyDescriptor, x: evt.clientX, y: evt.clientY });
    clickHistory = clickHistory.filter(function (c) { return now - c.time <= 900; });

    if (clickHistory.length >= 3) {
      var first = clickHistory[0];
      var last = clickHistory[clickHistory.length - 1];
      var dist = Math.hypot(last.x - first.x, last.y - first.y);
      if (dist < 35) {
        sendEvent('rage_click', { targetElement: anyDescriptor });
        clickHistory = [];
      }
    }

    // Standard Click Tracking: ONLY for actual interactive elements
    var clickable = target.closest('button, a, [role="button"], [data-uh-track], input[type="submit"], select');
    if (clickable) {
      var descriptor = cleanElementDescriptor(clickable);
      sendEvent('click', { targetElement: descriptor });
    }
  }, true);

  function handleExit() {
    sendEvent('exit');
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      sendEvent('time_on_page');
    }
  });

  window.addEventListener('beforeunload', handleExit);
})();
