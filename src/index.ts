import './scss/styles.scss'
import { Api } from './components/base/api';
import { AppState } from './model/AppState';
import { App } from './presenter/App';

// Инициализация и запуск приложения
const api = new Api('https://larek-api.nomoreparties.co/api/weblarek');
const model = new AppState(api);
new App(model);

