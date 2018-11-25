const initSearchToggle = toggle =>
    toggle.addEventListener('click', () =>
        toggle.classList.toggle('active')
    );

export default () =>  Array.from(document.querySelectorAll('.search-bar-toggle')).forEach(toggle => initSearchToggle(toggle));
