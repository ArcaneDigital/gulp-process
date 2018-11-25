export default () => {
    let french = location.pathname.split('/')[1];
    let navSearch = document.getElementById('navSearch');
    if (navSearch) {
        navSearch.addEventListener('keypress', function (e) {
            var key = e.which || e.keyCode;
            if (key === 13) { // 13 is enter
                if(french === 'fr') {
                    window.location.href = '/fr/search/?search='+navSearch.value;
                }
                window.location.href = '/search/?search='+navSearch.value;
            }
        });
    }
    let navSearchButton = document.getElementById('navSearchButton');
    if (navSearchButton) {
        navSearchButton.addEventListener('click', function () {
            if(french === 'fr') {
                window.location.href = '/fr/search/?search='+navSearch.value;
            }
            window.location.href = '/search/?search='+navSearch.value;
        });
    }
};
