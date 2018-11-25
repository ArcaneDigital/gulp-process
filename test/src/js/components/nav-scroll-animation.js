import throttle from 'lodash/throttle';

const initScroll = nav =>
    window.addEventListener('scroll', () =>  throttle(() => {
        menuShrink(nav)
    }, 100, {'leading': true}));

const menuShrink = nav => {
    const scrollYPosition = window.pageYOffset || document.documentElement.scrollTop;
    scrollYPosition > 300
        ?  nav.classList.add('scrolled')
        :  nav.classList.remove('scrolled');
};

export default () => {
    const nav = document.getElementById('navigation');
    nav && initScroll(nav);
};
