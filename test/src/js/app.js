import validation from './components/validation';
import mobileMenuToggle from './components/mobile-menu-toggle';
import navScroll from './components/nav-scroll-animation';
import blogFilterToggle from './components/blog-filter-toggle';
import navSearch from './components/nav-search';
import blogSearch from './components/blog-search';
import categoryFilter from './components/category-filter';
import authorFilter from './components/author-filter';
import monthFilter from './components/month-filter';
import navSearchToggle from './components/navigation-search-toggle';

const init = () => {
    navScroll();
    mobileMenuToggle();
    navSearchToggle();
    validation();
    blogFilterToggle();
    navSearch();
    blogSearch();
    categoryFilter();
    authorFilter();
    monthFilter();
};

document.addEventListener('readystatechange', () => {
    if (document.readyState === 'complete') {
        init();
    }
});
