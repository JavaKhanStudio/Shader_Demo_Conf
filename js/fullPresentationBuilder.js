function loadSection(id, url) {
    return fetch(url)
      .then(response => response.text())
      .then(data => {
        document.getElementById(id).innerHTML = data;
      })
      .catch(error => console.error('Error loading section:', error));
}

// TODO finish later
export function build() {
    window.loadAllSections = new Promise((resolve, reject) => {
        document.addEventListener("DOMContentLoaded", () => {
          Promise.all([
            loadSection("presentation-placeholder", "./parts/fullPresentation.html"),
          ]).then(resolve).catch(reject);
        });
      });
}
