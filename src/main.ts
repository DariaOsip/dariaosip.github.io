import './style.css';
import Scene from './controllers/Scene';

const changeAvatarButton = document.getElementById('change-avatar__button');

if (changeAvatarButton) {
  changeAvatarButton.onclick = () => {
    const changeAvatarPopover = document.getElementById('change-avatar__popover');
    if (changeAvatarPopover) changeAvatarPopover.classList.toggle("hidden");
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Scene();
});
