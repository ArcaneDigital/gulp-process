import throttle from 'lodash/throttle';

const activeClass = 'active';
const scrollClass = 'noScroll';

const initMobileMenuToggle = trigger => {
    trigger.addEventListener('click', () => {
        trigger.classList.toggle(activeClass);
        document.body.classList.toggle(scrollClass);
    });
    window.addEventListener('resize', () =>  throttle(() => {
        trigger.classList.contains(activeClass) && trigger.classList.remove(activeClass);
        document.body.classList.contains(scrollClass) && document.body.classList.remove(scrollClass);
    }, 100, {'leading': true}));
};

const mobileNavDropdowns = item => {
    let span = document.createElement('span');
    span.classList.add('mobile-toggle');
    item.appendChild(span);
    span.addEventListener('click', () => item.classList.toggle(activeClass));
};

export default () =>{
    const nav = document.querySelector('#navigation');
    nav && Array.from(nav.querySelectorAll('.mobile-menu-toggle')).forEach(btn => initMobileMenuToggle(btn, nav));
    nav && Array.from(nav.querySelectorAll('.menu-item-has-children')).forEach(item => mobileNavDropdowns(item));
}

