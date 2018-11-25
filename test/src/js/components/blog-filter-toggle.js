const initToggle = filter =>
    filter.addEventListener('click', (e) =>
        filter.classList.toggle('active')
    );

export default () => Array.from(document.querySelectorAll('.blog-article-list-header-filters .filter-toggle')).forEach(filter => initToggle(filter));
