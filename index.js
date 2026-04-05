(function () {
  'use strict';

  var CART_KEY = 'bearish_cart';

  var PRODUCT_CATALOG = [
    { name: 'Ngựa bông mềm mại', price: 1200000, keywords: 'ngựa jellycat' },
    { name: 'Túi trà bé nhỏ', price: 599000, keywords: 'trà túi' },
    { name: 'Chú vịt buồn bã', price: 899000, keywords: 'vịt jellycat' },
    { name: 'Thỏ xanh to', price: 3000000, keywords: 'thỏ limited' },
    { name: 'Hạt dẻ cười bé nhỏ', price: 699000, keywords: 'hạt dẻ' },
    { name: 'Rồng xanh đáng yêu', price: 1200000, keywords: 'rồng dragon' },
    { name: 'Gấu hươu', price: 699000, keywords: 'gấu hươu' },
    { name: 'Gấu ong béo', price: 799000, keywords: 'gấu ong' },
    { name: 'Fuggler đen sún răng', price: 450000, keywords: 'fuggler' },
    { name: 'Fuggler mix', price: 500000, keywords: 'fuggler' },
    { name: 'Fuggler xấu xí', price: 500000, keywords: 'fuggler' },
    { name: 'Fuggler mắt hí đi bơi', price: 550000, keywords: 'fuggler' }
  ];

  function formatPrice(n) {
    return n.toLocaleString('vi-VN') + 'đ';
  }

  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function setCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    renderCart();
    updateCartCount();
  }

  function updateCartCount() {
    var el = document.getElementById('cartCount');
    if (!el) return;
    var cart = getCart();
    var n = cart.reduce(function (s, i) {
      return s + (i.qty || 0);
    }, 0);
    el.textContent = n;
    if (n > 0) el.classList.add('is-visible');
    else el.classList.remove('is-visible');
  }

  function renderCart() {
    var list = document.getElementById('cartList');
    var empty = document.getElementById('cartEmpty');
    var footer = document.getElementById('cartFooter');
    var totalEl = document.getElementById('cartTotal');
    if (!list) return;

    var cart = getCart();
    if (cart.length === 0) {
      list.innerHTML = '';
      if (empty) empty.classList.remove('is-hidden');
      if (footer) footer.classList.remove('is-visible');
      return;
    }

    if (empty) empty.classList.add('is-hidden');
    if (footer) footer.classList.add('is-visible');

    var total = 0;
    list.innerHTML = cart
      .map(function (item, idx) {
        var line = item.price * item.qty;
        total += line;
        var imgHtml = item.img
          ? '<img src="' + item.img.replace(/"/g, '&quot;') + '" alt="" class="cart-item-thumb"/>'
          : '';
        return (
          '<li class="cart-item" data-idx="' +
          idx +
          '">' +
          '<div class="cart-item-row">' +
          imgHtml +
          '<div class="cart-item-info">' +
          '<strong>' +
          escapeHtml(item.name) +
          '</strong>' +
          '<span>' +
          formatPrice(item.price) +
          '</span>' +
          '</div></div>' +
          '<div class="cart-item-controls">' +
          '<button type="button" aria-label="Giảm" data-cart-delta="-1" data-idx="' +
          idx +
          '">−</button>' +
          '<span>' +
          item.qty +
          '</span>' +
          '<button type="button" aria-label="Tăng" data-cart-delta="1" data-idx="' +
          idx +
          '">+</button>' +
          '<button type="button" class="cart-remove" data-cart-remove="' +
          idx +
          '" aria-label="Xóa">×</button>' +
          '</div>' +
          '<div class="cart-line-subtotal">Tạm tính: ' +
          formatPrice(line) +
          '</div>' +
          '</li>'
        );
      })
      .join('');

    if (totalEl) totalEl.textContent = formatPrice(total);

    list.querySelectorAll('[data-cart-delta]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(btn.getAttribute('data-idx'), 10);
        var d = parseInt(btn.getAttribute('data-cart-delta'), 10);
        var c = getCart();
        if (!c[i]) return;
        c[i].qty += d;
        if (c[i].qty < 1) c.splice(i, 1);
        setCart(c);
      });
    });
    list.querySelectorAll('[data-cart-remove]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var i = parseInt(btn.getAttribute('data-cart-remove'), 10);
        var c = getCart();
        c.splice(i, 1);
        setCart(c);
      });
    });
  }

  function escapeHtml(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  window.addToCart = function (btn) {
    var card = btn.closest('.product');
    if (!card) return;
    var name = card.getAttribute('data-name');
    var price = parseInt(card.getAttribute('data-price'), 10);
    var imgEl = card.querySelector('.prod-img-wrap img');
    var img = imgEl ? imgEl.getAttribute('src') : '';

    var cart = getCart();
    var found = cart.find(function (i) {
      return i.name === name;
    });
    if (found) found.qty++;
    else cart.push({ name: name, price: price, img: img, qty: 1 });

    setCart(cart);
    showToast('Đã thêm vào giỏ hàng');
    openCart();
  };

  window.addToCartByData = function (name, price, img) {
    var cart = getCart();
    var found = cart.find(function (i) {
      return i.name === name;
    });
    if (found) found.qty++;
    else cart.push({ name: name, price: price, img: img || '', qty: 1 });
    setCart(cart);
    showToast('Đã thêm vào giỏ hàng');
    openCart();
  };

  function openCart() {
    var drawer = document.getElementById('cartDrawer');
    var overlay = document.getElementById('cartOverlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    var drawer = document.getElementById('cartDrawer');
    var overlay = document.getElementById('cartOverlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  window.closeCart = closeCart;

  function showToast(msg) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(showToast._tid);
    showToast._tid = setTimeout(function () {
      t.classList.remove('show');
    }, 2200);
  }

  window.showToast = showToast;

  window.doSearch = function (q) {
    var input = document.getElementById('searchInput');
    if (input) input.value = q || '';
    runSearch(q || (input && input.value) || '');
  };

  function runSearch(q) {
    var box = document.getElementById('searchResults');
    if (!box) return;
    q = (q || '').trim().toLowerCase();
    if (!q) {
      box.innerHTML = '<p class="no-result">Nhập từ khóa để tìm.</p>';
      return;
    }
    var hits = PRODUCT_CATALOG.filter(function (p) {
      return (
        p.name.toLowerCase().indexOf(q) !== -1 ||
        (p.keywords && p.keywords.toLowerCase().indexOf(q) !== -1)
      );
    });
    if (hits.length === 0) {
      box.innerHTML = '<p class="no-result">Không tìm thấy sản phẩm phù hợp.</p>';
      return;
    }
    box.innerHTML = hits
      .map(function (p) {
        return (
          '<a class="result-item" href="shop.html">' +
          escapeHtml(p.name) +
          ' — <strong>' +
          formatPrice(p.price) +
          '</strong></a>'
        );
      })
      .join('');
  }

  window.handleNLSubmit = function (e) {
    e.preventDefault();
    showToast('Cảm ơn bạn đã đăng ký!');
    var em = document.getElementById('nlEmail');
    if (em) em.value = '';
    return false;
  };

  window.handleContactSubmit = function (e) {
    e.preventDefault();
    showToast('Đã gửi tin nhắn (demo). Chúng tôi sẽ phản hồi sớm!');
    if (e.target && e.target.reset) e.target.reset();
    return false;
  };

  window.copyCode = function () {
    var code = 'BEARISH50';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(function () {
        showToast('Đã sao chép mã ' + code);
      });
    } else {
      showToast('Mã: ' + code);
    }
  };

  window.toggleChat = function () {
    var box = document.getElementById('chatBox');
    if (box) box.classList.toggle('open');
  };

  window.sendQuick = function (text) {
    var input = document.getElementById('chatInput');
    if (input) input.value = text;
    sendChat();
  };

  window.sendChat = function () {
    var input = document.getElementById('chatInput');
    var wrap = document.getElementById('chatMessages');
    if (!input || !wrap) return;
    var text = input.value.trim();
    if (!text) return;

    var userDiv = document.createElement('div');
    userDiv.className = 'chat-msg msg-user';
    userDiv.innerHTML =
      '<div class="msg-bubble">' +
      escapeHtml(text) +
      '</div><span class="msg-time">Vừa xong</span>';
    wrap.appendChild(userDiv);

    input.value = '';
    wrap.scrollTop = wrap.scrollHeight;

    setTimeout(function () {
      var bot = document.createElement('div');
      bot.className = 'chat-msg msg-agent';
      bot.innerHTML =
        '<div class="msg-bubble">Cảm ơn bạn! 🧸 Team Bearish sẽ phản hồi trong giây lát.</div><span class="msg-time">Vừa xong</span>';
      wrap.appendChild(bot);
      wrap.scrollTop = wrap.scrollHeight;
    }, 600);
  };

  function initSearchOverlay() {
    var toggle = document.getElementById('searchToggle');
    var overlay = document.getElementById('searchOverlay');
    var closeBtn = document.getElementById('searchClose');
    var input = document.getElementById('searchInput');

    if (toggle && overlay) {
      toggle.addEventListener('click', function () {
        overlay.classList.add('show');
        if (input) {
          setTimeout(function () {
            input.focus();
          }, 100);
        }
      });
    }
    if (closeBtn && overlay) {
      closeBtn.addEventListener('click', function () {
        overlay.classList.remove('show');
      });
    }
    if (overlay) {
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) overlay.classList.remove('show');
      });
    }
    if (input) {
      input.addEventListener('input', function () {
        runSearch(input.value);
      });
    }
  }

  function initCartUi() {
    var toggle = document.getElementById('cartToggle');
    var overlay = document.getElementById('cartOverlay');
    var closeBtn = document.getElementById('cartClose');

    if (toggle) {
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        openCart();
      });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeCart);
    if (overlay) {
      overlay.addEventListener('click', closeCart);
    }

    var checkout = document.querySelector('.btn-checkout');
    if (checkout) {
      checkout.addEventListener('click', function () {
        if (getCart().length === 0) {
          showToast('Giỏ hàng đang trống');
          return;
        }
        window.location.href = 'cart.html';
      });
    }

    renderCart();
    updateCartCount();
  }

  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 420) btn.classList.add('visible');
      else btn.classList.remove('visible');
    });
  }

  function initCountdown() {
    var hEl = document.getElementById('sbH');
    var mEl = document.getElementById('sbM');
    var sEl = document.getElementById('sbS');
    if (!hEl || !mEl || !sEl) return;

    var end = Date.now() + (5 * 60 * 60 + 59 * 60) * 1000;
    function tick() {
      var left = Math.max(0, end - Date.now());
      var s = Math.floor(left / 1000);
      var h = Math.floor(s / 3600);
      var m = Math.floor((s % 3600) / 60);
      var sec = s % 60;
      hEl.textContent = String(h).padStart(2, '0');
      mEl.textContent = String(m).padStart(2, '0');
      sEl.textContent = String(sec).padStart(2, '0');
    }
    tick();
    setInterval(tick, 1000);
  }

  function initMobileNav() {
    var btn = document.getElementById('navToggle');
    var nav = document.getElementById('siteNav');
    if (!btn || !nav) return;

    btn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nav-open', open);
    });

    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('nav-open');
      });
    });
  }

  function initShopFilters() {
    var grid = document.getElementById('shopGrid');
    if (!grid) return;

    var cat = document.getElementById('filterCategory');
    var sort = document.getElementById('sortSelect');

    function apply() {
      var cards = grid.querySelectorAll('.product');
      var catVal = cat ? cat.value : 'all';
      var arr = Array.prototype.slice.call(cards);

      arr.forEach(function (card) {
        var c = card.getAttribute('data-category') || '';
        var show = catVal === 'all' || c === catVal;
        card.style.display = show ? '' : 'none';
      });

      var visible = arr.filter(function (card) {
        return card.style.display !== 'none';
      });

      visible.sort(function (a, b) {
        var pa = parseInt(a.getAttribute('data-price'), 10);
        var pb = parseInt(b.getAttribute('data-price'), 10);
        if (!sort) return 0;
        if (sort.value === 'price-asc') return pa - pb;
        if (sort.value === 'price-desc') return pb - pa;
        if (sort.value === 'name-asc')
          return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name'), 'vi');
        return 0;
      });

      var hidden = arr.filter(function (card) {
        return card.style.display === 'none';
      });

      visible.forEach(function (card) {
        grid.appendChild(card);
      });
      hidden.forEach(function (card) {
        grid.appendChild(card);
      });
    }

    if (cat) cat.addEventListener('change', apply);
    if (sort) sort.addEventListener('change', apply);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initSearchOverlay();
    initCartUi();
    initBackToTop();
    initCountdown();
    initMobileNav();
    initShopFilters();

    var pdBtn = document.getElementById('pdAddBtn');
    if (pdBtn) {
      pdBtn.addEventListener('click', function () {
        addToCartByData(
          'Ngựa bông mềm mại',
          1200000,
          'images/sp-ngua.jpg'
        );
      });
    }
  });
})();
