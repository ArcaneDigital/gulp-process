function authorChange() {
    let author = document.getElementById('authorFilter');
    if(author.options[author.selectedIndex].value === 'user') {
        window.location.href = window.location.pathname;
        return;
    }
    window.location.href = window.location.pathname+'?user='+author.options[author.selectedIndex].value;
}

export default () => {
    let author = document.getElementById('authorFilter');
    if (author) {
        author.addEventListener('change', authorChange, false);
    }
};
