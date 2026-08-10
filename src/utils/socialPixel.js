// Helper to initialize and track events across Meta (FB/IG), Snapchat, and TikTok pixels

let initialized = false;
let pixels = {
  meta: '',
  snap: '',
  tiktok: ''
};

export const initSocialPixels = async () => {
  if (initialized) return;
  try {
    const res = await fetch('/api/social-pixels');
    if (!res.ok) return;
    const data = await res.json();
    pixels = {
      meta: data.meta_pixel_id || '',
      snap: data.snap_pixel_id || '',
      tiktok: data.tiktok_pixel_id || ''
    };

    // Load Meta Pixel (FB + Instagram)
    if (pixels.meta && !window.fbq) {
      !(function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      window.fbq('init', pixels.meta);
      window.fbq('track', 'PageView');
    }

    // Load Snapchat Pixel
    if (pixels.snap && !window.snaptr) {
      (function (e, t, n) {
        if (e.snaptr) return;
        var a = (e.snaptr = function () {
          a.handleRequest ? a.handleRequest.apply(a, arguments) : a.queue.push(arguments);
        });
        a.queue = [];
        var s = 'script';
        var r = t.createElement(s);
        r.async = !0;
        r.src = n;
        var m = t.getElementsByTagName(s)[0];
        m.parentNode.insertBefore(r, m);
      })(window, document, 'https://sc-static.net/scevent.min.js');

      window.snaptr('init', pixels.snap);
      window.snaptr('track', 'PAGE_VIEW');
    }

    // Load TikTok Pixel
    if (pixels.tiktok && !window.ttq) {
      !(function (w, d, t) {
        w.TiktokAnalyticsObject = t;
        var ttq = (w[t] = w[t] || []);
        (ttq.methods = [
          'page',
          'track',
          'identify',
          'instances',
          'debug',
          'on',
          'off',
          'once',
          'ready',
          'alias',
          'group',
          'enableCookie',
          'disableCookie'
        ]),
          (ttq.setAndDefer = function (t, e) {
            t[e] = function () {
              t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
            };
          });
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        (ttq.instance = function (t) {
          for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]);
          return e;
        }),
          (ttq.load = function (e, n) {
            var i = 'https://analytics.tiktok.com/i18n/pixel/events.js';
            (ttq._i = ttq._i || {}),
              (ttq._i[e] = []),
              (ttq._i[e]._u = i),
              (ttq._t = ttq._t || {}),
              (ttq._t[e] = +new Date()),
              (ttq._o = ttq._o || {}),
              (ttq._o[e] = n || {});
            var o = document.createElement('script');
            (o.type = 'text/javascript'), (o.async = !0), (o.src = i + '?sdkid=' + e + '&lib=' + t);
            o.onerror = function () {
              console.warn('[SocialPixel] TikTok Analytics script connection blocked or unavailable.');
            };
            var a = document.getElementsByTagName('script')[0];
            if (a && a.parentNode) {
              a.parentNode.insertBefore(o, a);
            }

          });

        ttq.load(pixels.tiktok);
        ttq.page();
      })(window, document, 'ttq');
    }

    initialized = true;
  } catch (err) {
    console.error('Failed to initialize social pixels:', err);
  }
};

export const trackViewContent = (item) => {
  if (!item) return;
  const value = parseFloat(item.price) || 0;
  const currency = 'JOD';

  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [`PROD_${item.id}`],
      content_name: item.name,
      content_type: 'product',
      value: value,
      currency: currency
    });
  }
  if (window.snaptr) {
    window.snaptr('track', 'VIEW_CONTENT', {
      item_ids: [`PROD_${item.id}`],
      description: item.name,
      price: value,
      currency: currency
    });
  }
  if (window.ttq) {
    window.ttq.track('ViewContent', {
      content_id: `PROD_${item.id}`,
      content_name: item.name,
      value: value,
      currency: currency
    });
  }
};

export const trackAddToCart = (item) => {
  if (!item) return;
  const value = parseFloat(item.price) || 0;
  const currency = 'JOD';

  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [`PROD_${item.id}`],
      content_name: item.name,
      value: value,
      currency: currency
    });
  }
  if (window.snaptr) {
    window.snaptr('track', 'ADD_CART', {
      item_ids: [`PROD_${item.id}`],
      price: value,
      currency: currency
    });
  }
  if (window.ttq) {
    window.ttq.track('AddToCart', {
      content_id: `PROD_${item.id}`,
      content_name: item.name,
      value: value,
      currency: currency
    });
  }
};

export const trackPurchase = (orderId, totalValue, items = []) => {
  const value = parseFloat(totalValue) || 0;
  const currency = 'JOD';
  const itemIds = items.map((i) => `PROD_${i.id || i.product_id}`);

  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      content_ids: itemIds,
      value: value,
      currency: currency
    });
  }
  if (window.snaptr) {
    window.snaptr('track', 'PURCHASE', {
      transaction_id: orderId,
      price: value,
      currency: currency,
      item_ids: itemIds
    });
  }
  if (window.ttq) {
    window.ttq.track('CompletePayment', {
      content_id: itemIds[0] || 'ORDER_' + orderId,
      value: value,
      currency: currency
    });
  }
};
