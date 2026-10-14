let installPrompt;
const installButton = document.querySelector("#install-app");

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPrompt = event;
  if (installButton) installButton.hidden = false;
});

installButton?.addEventListener("click", async () => {
  if (installPrompt) {
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.hidden = true;
    return;
  }

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  window.alert(isIOS
    ? "No Safari, toque em Compartilhar e depois em Adicionar à Tela de Início."
    : "No menu do navegador, escolha Instalar app ou Adicionar à tela inicial.");
});

window.addEventListener("appinstalled", () => {
  if (installButton) installButton.hidden = true;
  installPrompt = null;
});

if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(error => {
      console.error("Não foi possível preparar o uso offline do Magic Drinks.", error);
    });
  });
}
