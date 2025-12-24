const navButtons = document.querySelectorAll('.bottom-nav__item');
const screens = document.querySelectorAll('.screen');

const setActiveScreen = (name) => {
  screens.forEach((screen) => {
    screen.classList.toggle('screen--active', screen.dataset.screen === name);
  });

  navButtons.forEach((button) => {
    button.classList.toggle('bottom-nav__item--active', button.dataset.target === name);
  });
};

navButtons.forEach((button) => {
  button.addEventListener('click', () => {
    setActiveScreen(button.dataset.target);
  });
});

setActiveScreen('recovery');
