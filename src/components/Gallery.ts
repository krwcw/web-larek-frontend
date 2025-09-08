import { Component } from './base/Component';
import { EventEmitter } from './base/events';

interface GalleryData {
    items: HTMLElement[];
}

export class Gallery extends Component<GalleryData> {
    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);
    }

    set items(items: HTMLElement[]) {
        // Очищаем контейнер перед добавлением новых элементов
        this.container.innerHTML = '';
        
        // Добавляем все элементы в галерею
        items.forEach(item => {
            this.container.appendChild(item);
        });
    }

    render(data: Partial<GalleryData>): HTMLElement {
        super.render(data);
        
        if (data.items) {
            this.items = data.items;
        }
        
        return this.container;
    }
}