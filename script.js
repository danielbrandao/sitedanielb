// Exemplo de tracking simples (futuro Google Analytics, etc.)
document.querySelectorAll('.link-card').forEach(link => {
  link.addEventListener('click', () => {
    console.log('Clique em:', link.innerText);
  });
});
