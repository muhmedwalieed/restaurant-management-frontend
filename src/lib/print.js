// Prints arbitrary HTML by rendering it into a hidden holder on the current page and
// calling window.print() — the most reliable path (popup blockers can't block it).
export const printHtml = (html, bodyClass) => {
  const holder = document.createElement('div');
  holder.className = 'printable-print';
  holder.innerHTML = html;
  document.body.appendChild(holder);
  document.body.classList.add(bodyClass);
  setTimeout(() => {
    window.print();
    document.body.classList.remove(bodyClass);
    setTimeout(() => {
      if (holder.parentNode) document.body.removeChild(holder);
    }, 400);
  }, 60);
};

export default printHtml;