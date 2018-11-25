export default () => {
    let blogSearch = document.getElementById('blogSearch');
    if (blogSearch) {
        blogSearch.addEventListener('keypress', function (e) {
            var key = e.which || e.keyCode;
            if (key === 13) { // 13 is enter
                window.location.href = window.location.pathname+'?search='+blogSearch.value;
            }
        });
    }
};
