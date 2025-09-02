import { EventEmitter } from "./events";

export class Component {
    protected container: HTMLElement;
    protected events: EventEmitter;

    constructor (container: HTMLElement) {
        this.container = container;
    }

    setText(element: HTMLElement, text: string) {
        element.textContent = text;
    }

    setImage(element: HTMLImageElement, src: string, alt: string) {
        element.src = src;
        element.alt = alt;
    }

    setDisabled(element: HTMLElement, state: boolean) {
        if (state) {
            element.setAttribute('disabled', 'true')
        } else {
            element.removeAttribute('disabled')
        }
    }

    toggleClass(element: HTMLElement, className: string, state: boolean) {
        if (state) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    }
}