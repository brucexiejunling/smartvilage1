(function() {
    let pageName = document.getElementById('J_page_name').value
    let navLink = document.getElementById(pageName);
    if(navLink) {
        navLink.className += 'current';
    }
})()