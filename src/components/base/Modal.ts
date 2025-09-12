import { EventEmitter } from './events';
import { ensureElement } from '../../utils/utils';
import { Component } from './Component';

interface IModal {
    content: HTMLElement;
}

export class Modal extends Component<IModal> {
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement;
    private _currentContent: HTMLElement | null = null;

    constructor(container: HTMLElement, private events: EventEmitter) {
        super(container);

        this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', container);
        this._content = ensureElement<HTMLElement>('.modal__content', container);

        this._closeButton.addEventListener('click', this.close.bind(this));
        this.container.addEventListener('click', this.close.bind(this));
        this._content.addEventListener('click', (event) => event.stopPropagation());
    }

    set content(value: HTMLElement) {
        this._currentContent = value;
        this._content.replaceChildren(value);
    }

    get content(): HTMLElement | null {
        return this._currentContent;
    }

    open() {
        this.container.classList.add('modal_active');
        this.events.emit('modal:open');
    }

    close() {
        this.container.classList.remove('modal_active');
        this._currentContent = null;
        this._content.innerHTML = '';
        this.events.emit('modal:close');
    }

    render(data: IModal): HTMLElement {
        super.render(data);
        this.open();
        return this.container;
    }
}