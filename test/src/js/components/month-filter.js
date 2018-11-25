function monthChange() {
    let month = document.getElementById('monthFilter');
    if(month.options[month.selectedIndex].value === 'month') {
        window.location.href = window.location.pathname;
        return;
    }
    window.location.href = window.location.pathname+'?month='+month.options[month.selectedIndex].value;
}

export default () => {
    let month = document.getElementById('monthFilter');
    if (month) {
        month.addEventListener('change', monthChange, false);
    }
};
