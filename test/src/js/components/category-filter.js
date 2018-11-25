function categoryChange() {
    let category = document.getElementById('categoryFilter');
    if(category.options[category.selectedIndex].value === 'category') {
        window.location.href = window.location.pathname;
        return;
    }
    window.location.href = window.location.pathname+'?category='+category.options[category.selectedIndex].value;
}

export default () => {
    let category = document.getElementById('categoryFilter');
    if (category) {
        category.addEventListener('change', categoryChange, false);
    }
};
