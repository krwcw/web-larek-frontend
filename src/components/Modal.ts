import { ensureElement } from "../utils/utils";
import { Component } from "./base/components";

export class Modal extends Component {
    protected closeButton: HTMLButtonElement;

    constructor(container: HTMLElement) {
        super(container);

        this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);

        this.closeButton.addEventListener('click', () => this.close());
        this.container.addEventListener('click', (event) => this.handleOutsideClick(event));
    }
    

    open() {
        this.container.classList.add('modal_active');
    }

    close() {
        this.container.classList.remove('modal_active');
    }

    setContent(content: HTMLElement) {
        const modalContent = ensureElement<HTMLElement>('.modal__content', this.container);
        modalContent.innerHTML = '';
        modalContent.appendChild(content);

        return this
    }

    protected handleOutsideClick(event: MouseEvent) {
        if (event.target === this.container) {
            this.close()
        }
        
    }

}