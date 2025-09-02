// components/SuccessMessage.ts
import { ensureElement } from "../utils/utils";
import { Component } from "./base/components";

export class SuccessMessage extends Component {
    protected title: HTMLElement;
    protected description: HTMLElement;
    protected closeButton: HTMLButtonElement;

    constructor(container: HTMLElement) {
        super(container);
        
        this.title = ensureElement<HTMLElement>('.order-success__title', this.container);
        this.description = ensureElement<HTMLElement>('.order-success__description', this.container);
        this.closeButton = ensureElement<HTMLButtonElement>('.order-success__close', this.container);
    }

    render(total: number): HTMLElement {
        this.description.textContent = `Списано ${total} синапсов`;
        return this.container;
    }

    setCloseHandler(handler: () => void) {
        this.closeButton.addEventListener('click', handler);
    }
}