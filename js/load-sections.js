// load-sections.js
// load-sections.js

function loadSection(id, url) {
    return fetch(url)
      .then(response => response.text())
      .then(data => {
        document.getElementById(id).innerHTML = data;
      })
      .catch(error => console.error('Error loading section:', error));
}
  
window.loadAllSections = new Promise((resolve, reject) => {
  document.addEventListener("DOMContentLoaded", () => {
    Promise.all([
      loadSection("header-placeholder", "./parts/header.html"),
      loadSection("footer-placeholder", "./parts/footer.html")
    ]).then(resolve).catch(reject);
  });
});
  
