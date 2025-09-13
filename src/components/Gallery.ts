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
        this.container.innerHTML = '';
        
        items.forEach(item => {
            this.container.appendChild(item);
        });
    }

    render(data: Partial<GalleryData>): HTMLElement {
        super.render(data);
        return this.container;
    }
}