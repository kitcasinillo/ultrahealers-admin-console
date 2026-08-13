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

  function isIgnoredControlClick(el) {
    if (!el) return false;

    if (el.closest && el.closest('[data-uh-no-track="true"], [data-uh-no-track="date-time"], [data-uh-no-track="filter"]')) {
      return true;
    }

    var container = el.closest && el.closest(
      '[class*="calendar"], [class*="Calendar"], [class*="popover"], [class*="Popover"], ' +
      '[class*="dropdown"], [class*="Dropdown"], [class*="time"], [class*="TimeSlot"], [class*="timeslot"], ' +
      '.rdp, .react-datepicker, select, option, input[type="date"]'
    );

    if (container) {
      var text = (container.innerText || container.textContent || '').toLowerCase();
      var isIgnoredControl = (
        text.includes('schedule your session') ||
        text.includes('pick a date') ||
        text.includes('select date') ||
        text.includes('available time slots') ||
        text.includes('time slots') ||
        text.includes('morning (am)') ||
        text.includes('afternoon/evening (pm)') ||
        text.includes('filter subdomains') ||
        text.includes('time horizon') ||
        text.includes('custom range') ||
        text.includes('apply custom range') ||
        text.includes('reset preset') ||
        text.includes('group by') ||
        text.includes('all subdomains') ||
        text.includes('select all') ||
        container.tagName === 'SELECT' ||
        container.tagName === 'OPTION' ||
        container.querySelector('svg[class*="lucide-chevron-left"], svg[class*="lucide-chevron-right"]') ||
        container.classList.contains('rdp')
      );
      if (isIgnoredControl) return true;
    }

    var rawText = (el.innerText || el.textContent || '').trim().toLowerCase();
    var ariaLabel = (el.getAttribute && (el.getAttribute('aria-label') || el.getAttribute('aria-description') || '')) || '';
    ariaLabel = ariaLabel.toLowerCase();

    if (/^\d{1,2}$/.test(rawText) && container) return true;
    if (/^\d{1,2}:\d{2}\s*(am|pm)?$/i.test(rawText) || /^\d{1,2}:\d{2}$/.test(rawText)) return true;

    if (
      rawText.includes('filter') ||
      rawText.includes('subdomains') ||
      rawText.includes('last 7 days') ||
      rawText.includes('last 30 days') ||
      rawText.includes('last 90 days') ||
      rawText.includes('year to date') ||
      rawText.includes('all time') ||
      rawText.includes('custom date range') ||
      rawText.includes('apply custom range') ||
      rawText.includes('group by') ||
      ariaLabel.includes('filter') ||
      ariaLabel.includes('select date') ||
      ariaLabel.includes('pick a date')
    ) {
      return true;
    }

    return false;
  }

  function toSnakeCase(str) {
    if (!str) return '';
    return str
      .replace(/[^a-zA-Z0-9\s-_]/g, '')
      .trim()
      .replace(/[\s-_]+/g, '_')
      .toLowerCase();
  }

  function getPageSectionPrefix() {
    var path = window.location.pathname || '/';

    if (path === '/' || path === '') return 'home';
    if (path.includes('/reports/analytics') || path.includes('/reports/web-analytics')) return 'reports_analytics';
    if (path.includes('/reports/overview')) return 'reports_overview';
    if (path.includes('/reports/financial')) return 'reports_financial';
    if (path.includes('/reports/users')) return 'reports_users';
    if (path.includes('/reports/bookings')) return 'reports_bookings';
    if (path.includes('/reports/retreats')) return 'reports_retreats';
    if (path.includes('/users/healers')) return 'users_healers';
    if (path.includes('/users/seekers')) return 'users_seekers';
    if (path.includes('/healers')) return 'healers';
    if (path.includes('/seekers')) return 'seekers';
    if (path.includes('/bookings/sessions')) return 'bookings_sessions';
    if (path.includes('/bookings/retreats')) return 'bookings_retreats';
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/retreats')) return 'retreats';
    if (path.includes('/listings')) return 'listings';
    if (path.includes('/disputes')) return 'disputes';
    if (path.includes('/finance')) return 'finance';
    if (path.includes('/campaigns')) return 'campaigns';
    if (path.includes('/modalities')) return 'modalities';
    if (path.includes('/settings')) return 'settings';
    if (path.includes('/login')) return 'auth_login';

    var cleanPath = path
      .replace(/\/[A-Za-z0-9_-]{20,36}(\/|$)/g, '/')
      .replace(/\/\d+(\/|$)/g, '/')
      .replace(/^\//, '')
      .replace(/[\/-]/g, '_');
    return cleanPath || 'page';
  }

  function cleanElementDescriptor(el) {
    if (!el) return 'global_page_interactive_element';

    // 1. Explicit tracking attribute override
    var customTrack = el.getAttribute('data-uh-track');
    if (customTrack) return toSnakeCase(customTrack);

    var prefix = getPageSectionPrefix();

    // Contextual section/container overrides
    var nav = el.closest('nav, header');
    if (nav) {
      prefix = 'nav';
    }

    var modal = el.closest('[role="dialog"], .modal, [class*="Modal"]');
    if (modal) {
      var modalHeader = modal.querySelector('h1, h2, h3, h4, [class*="title"]');
      var mTitle = modalHeader ? toSnakeCase(modalHeader.innerText || modalHeader.textContent || '') : '';
      prefix = mTitle ? 'modal_' + mTitle : 'modal';
    }

    // 2. Extract action/verb and object/context
    var actionObj = '';

    var ariaLabel = el.getAttribute('aria-label') || el.getAttribute('aria-description');
    if (ariaLabel) actionObj = toSnakeCase(ariaLabel);

    if (!actionObj) {
      var title = el.getAttribute('title');
      if (title) actionObj = toSnakeCase(title);
    }

    if (!actionObj) {
      var alt = el.getAttribute('alt');
      if (alt) actionObj = 'image_' + toSnakeCase(alt);
    }

    if (!actionObj) {
      var placeholder = el.getAttribute('placeholder');
      if (placeholder) actionObj = 'input_' + toSnakeCase(placeholder);
    }

    if (!actionObj) {
      var rawText = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
      if (rawText.length > 0 && rawText.length <= 45 && !/^\d+$/.test(rawText)) {
        actionObj = toSnakeCase(rawText);
      }
    }

    // 3. Smart SVG / Lucide Icon Detection
    if (!actionObj) {
      var svg = el.querySelector('svg');
      if (svg) {
        var svgClass = svg.getAttribute('class') || (typeof svg.className === 'string' ? svg.className : (svg.className && svg.className.baseVal) || '');
        var lucideMatch = String(svgClass).match(/lucide-([a-z0-9-]+)/i);

        var iconSlugMap = {
          'refresh-cw': 'refresh_data',
          'rotate-cw': 'reload_page',
          'download': 'export_report',
          'upload': 'upload_file',
          'file-text': 'view_report',
          'file-spreadsheet': 'export_excel',
          'plus': 'add_new_item',
          'user-plus': 'add_user',
          'search': 'search_query',
          'filter': 'filter_select',
          'x': 'close_modal',
          'x-circle': 'dismiss_alert',
          'trash': 'delete_item',
          'trash-2': 'delete_item',
          'edit': 'edit_details',
          'pencil': 'edit_field',
          'log-out': 'logout_submit',
          'calendar': 'select_date',
          'globe': 'select_subdomain',
          'eye': 'view_details',
          'check': 'confirm_action',
          'alert-triangle': 'warning_alert',
          'target': 'goal_target',
          'bar-chart-3': 'view_analytics'
        };

        if (lucideMatch && lucideMatch[1]) {
          var rawIcon = lucideMatch[1].toLowerCase();
          actionObj = iconSlugMap[rawIcon] || toSnakeCase(rawIcon);
        }
      }
    }

    if (!actionObj && el.name) {
      actionObj = 'field_' + toSnakeCase(el.name);
    }
    if (!actionObj && el.id) {
      actionObj = toSnakeCase(el.id);
    }
    if (!actionObj && el.type === 'submit') {
      actionObj = 'form_submit';
    }

    if (!actionObj) {
      var tag = el.tagName ? el.tagName.toLowerCase() : 'element';
      actionObj = tag === 'a' ? 'navigation_link' : 'action_button';
    }

    var fullKey = prefix + '_' + actionObj;
    var parts = fullKey.split('_').filter(Boolean);
    var reservedPrefixes = /^(healers|seekers|retreats|listings|bookings|users|nav|modal|reports|disputes|finance|campaigns|modalities|settings|home)$/i;
    var cleanParts = parts.filter(function (part) {
      return !(/^[A-Za-z0-9_-]{20,36}$/.test(part) && !reservedPrefixes.test(part));
    });
    fullKey = cleanParts.join('_').replace(/_+/g, '_').replace(/^_|_$/g, '');

    return fullKey;
  }

  var sessionId = getOrSetSessionId();
  var queryParams = getQueryParams();
  var pageStartTime = Date.now();
  var currentUserId = null;
  var currentUserRole = null;

  var state = {
    sessionId: sessionId,
    domain: (function () {
      var host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        var port = window.location.port;
        if (port === '5174' || port === '3001') return 'seekers.ultrahealers.com';
        if (port === '5175' || port === '3002') return 'healers.ultrahealers.com';
        return 'admin-console.ultrahealers.com';
      }
      return host || 'admin-console.ultrahealers.com';
    })(),
    path: window.location.pathname || '/',
    referrer: document.referrer ? new URL(document.referrer).hostname : 'direct',
    utmSource: queryParams.utmSource,
    utmMedium: queryParams.utmMedium,
    utmCampaign: queryParams.utmCampaign
  };

  function sendEvent(eventType, extraData) {
    var timeOnPage = Math.min(Math.max(0, Math.round((Date.now() - pageStartTime) / 1000)), 1800);
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
      if (isIgnoredControlClick(clickable)) {
        return;
      }
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
