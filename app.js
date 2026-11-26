(() => {
  const categories = [
    { id: 'ordinary-indoor', label: 'Indoor Grasping' },
    { id: 'ordinary-outdoor', label: 'Outdoor Grasping' },
    { id: 'navigation-grasp-place', label: 'Navigation-Based Pick-and-Place' },
    { id: 'follow-up', label: 'Follow up' },
    { id: 'long-navigation', label: 'Long-Horizon Tasks' },
    { id: 'extended-interaction', label: 'Extended Interaction Tasks' },
  ];

  const groups = document.querySelector('#video-groups');
  const plan = document.querySelector('#atlas-plan');
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#empty-state');
  const emptyMessage = document.querySelector('#empty-message');
  const search = document.querySelector('#search');
  const clearSearch = document.querySelector('#clear-search');
  const sortToggle = document.querySelector('#sort-toggle');
  const viewToggles = document.querySelectorAll('.view-toggle[data-view]');
  const modal = document.querySelector('#video-modal');
  const modalVideo = document.querySelector('#modal-video');
  const modalTitle = document.querySelector('#modal-title');
  const modalCategory = document.querySelector('#modal-category');
  const modalClose = modal.querySelector('.modal-close');

  let listView = false;
  let reverse = false;
  let activeCard;

  const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;',
  }[char]));

  const mediaUrl = (file) => file.split('/').map(encodeURIComponent).join('/');
  const clipLabel = (total) => `${total} ${total === 1 ? 'clip' : 'clips'}`;
  const clipsByCategory = categories.map((category) => ({
    ...category,
    clips: VIDEO_LIBRARY.filter((clip) => clip.category === category.id),
  }));

  plan.innerHTML = clipsByCategory.map(({ id, label, clips }) => {
    const summary = `<span>${escapeHtml(label)}</span>`;
    return clips.length
      ? `<a class="plan-card" href="#clips-${id}">${summary}</a>`
      : `<div class="plan-card plan-empty">${summary}</div>`;
  }).join('');

  plan.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (!search.value) return;
      search.value = '';
      renderCards();
    });
  });

  function renderCard(clip) {
    const title = escapeHtml(clip.title);
    return `
      <button class="video-card" type="button" data-id="${escapeHtml(clip.id)}" data-aspect="${escapeHtml(clip.aspect || '16:9')}" aria-label="Play ${title}">
        <span class="card-media">
          ${clip.poster ? `<img class="card-poster" src="${mediaUrl(clip.poster)}" alt="" loading="lazy" />` : ''}
          <video preload="none" muted playsinline src="${mediaUrl(clip.file)}" aria-hidden="true"></video>
          <span class="card-shade"></span><span class="play-icon" aria-hidden="true">▶</span>
        </span>
        <span class="card-copy"><span class="card-title">${title}</span></span>
      </button>`;
  }

  function renderCards() {
    const query = search.value.trim().toLowerCase();
    const categoriesInOrder = reverse ? [...clipsByCategory].reverse() : clipsByCategory;
    let total = 0;

    groups.classList.toggle('list-view', listView);
    groups.innerHTML = categoriesInOrder.map(({ id, label, clips }) => {
      const matching = clips.filter((clip) => {
        const terms = [label, clip.title, ...(clip.tags || [])];
        return terms.join(' ').toLowerCase().includes(query);
      });
      if (!matching.length) return '';
      total += matching.length;
      if (reverse) matching.reverse();
      const hasMixedAspects = new Set(matching.map((clip) => clip.aspect || '16:9')).size > 1;
      const isCarousel = id === 'ordinary-indoor' || id === 'ordinary-outdoor';
      return `
        <section class="video-group" id="clips-${id}" data-columns="${Math.min(matching.length, 3)}" aria-labelledby="heading-${id}">
          <div class="video-group-heading">
            <h3 id="heading-${id}">${escapeHtml(label)}</h3>
            ${isCarousel ? '<span class="carousel-hint"><span aria-hidden="true">↔</span><span class="drag-hint">Drag to explore</span><span class="swipe-hint">Swipe to explore</span></span>' : ''}
          </div>
          <div class="video-grid ${hasMixedAspects ? 'has-mixed-aspects' : ''} ${isCarousel ? 'is-carousel' : ''}" ${isCarousel ? `tabindex="0" role="region" aria-label="${escapeHtml(label)} videos"` : ''}>${matching.map(renderCard).join('')}</div>
        </section>`;
    }).join('');

    count.textContent = clipLabel(total);
    empty.hidden = total > 0;
    emptyMessage.textContent = query ? 'No videos match your search.' : 'No videos are available yet.';
    clearSearch.hidden = !query;

    groups.querySelectorAll('.video-card').forEach((card) => {
      const video = card.querySelector('video');
      card.addEventListener('click', () => openModal(card));
      card.addEventListener('mouseenter', () => video.play().catch(() => {}));
      video.addEventListener('playing', () => card.classList.add('is-playing'));
      card.addEventListener('mouseleave', () => {
        video.pause();
        if (video.readyState) video.currentTime = 0;
        card.classList.remove('is-playing');
      });
    });

    groups.querySelectorAll('.video-grid.is-carousel').forEach((carousel) => {
      let pointerStartX = 0;
      let scrollStart = 0;
      let isPointerDown = false;
      let isDragging = false;
      let suppressClick = false;

      carousel.addEventListener('wheel', (event) => {
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
        carousel.scrollLeft += event.deltaY;
        event.preventDefault();
      }, { passive: false });

      carousel.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        pointerStartX = event.clientX;
        scrollStart = carousel.scrollLeft;
        isPointerDown = true;
        isDragging = false;
        carousel.setPointerCapture(event.pointerId);
      });

      carousel.addEventListener('pointermove', (event) => {
        if (!isPointerDown) return;
        const distance = event.clientX - pointerStartX;
        if (!isDragging && Math.abs(distance) < 6) return;
        isDragging = true;
        carousel.classList.add('is-dragging');
        carousel.scrollLeft = scrollStart - distance;
        event.preventDefault();
      });

      const finishDragging = () => {
        if (!isPointerDown) return;
        isPointerDown = false;
        carousel.classList.remove('is-dragging');
        if (!isDragging) return;
        suppressClick = true;
        window.setTimeout(() => {
          suppressClick = false;
        }, 0);
      };

      carousel.addEventListener('pointerup', finishDragging);
      carousel.addEventListener('pointercancel', finishDragging);
      carousel.addEventListener('lostpointercapture', finishDragging);
      carousel.addEventListener('click', (event) => {
        if (!suppressClick) return;
        event.preventDefault();
        event.stopPropagation();
        suppressClick = false;
      }, true);
    });
  }

  function openModal(card) {
    const clip = VIDEO_LIBRARY.find((item) => item.id === card.dataset.id);
    const category = categories.find((item) => item.id === clip.category);
    activeCard = card;
    card.querySelector('video')?.pause();
    modalVideo.src = mediaUrl(clip.file);
    modalTitle.textContent = clip.title;
    modalCategory.textContent = category.label;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
    modalVideo.play().catch(() => {});
  }

  function closeModal() {
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.load();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    activeCard?.focus();
  }

  document.querySelectorAll('[data-close-modal]').forEach((element) => element.addEventListener('click', closeModal));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });
  search.addEventListener('input', renderCards);
  clearSearch.addEventListener('click', () => {
    search.value = '';
    renderCards();
    search.focus();
  });
  sortToggle.addEventListener('click', () => {
    reverse = !reverse;
    sortToggle.setAttribute('aria-pressed', String(reverse));
    renderCards();
  });
  viewToggles.forEach((button) => button.addEventListener('click', () => {
    listView = button.dataset.view === 'list';
    viewToggles.forEach((item) => {
      item.classList.toggle('active', item === button);
      item.setAttribute('aria-pressed', String(item === button));
    });
    groups.classList.toggle('list-view', listView);
  }));

  renderCards();
})();
