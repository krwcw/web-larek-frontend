import { EventEmitter, Events } from './base/events';
import { ensureElement } from '../utils/utils';
import { Form } from './base/Form';
import { IOrder } from '../types';

export class ContactsForm extends Form<IOrder> {
    protected _emailInput: HTMLInputElement;
    protected _phoneInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: EventEmitter) {
        super(container, events);

        this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', container);
        this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', container);

        // установка маски для телефона
        this._phoneInput.addEventListener('input', (e) => {
            const input = e.target as HTMLInputElement;
            let value = input.value.replace(/\D/g, '');
            
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            
            if (value.length > 0) {
                if (!value.startsWith('7')) {
                    value = '7' + value;
                    if (value.length > 11) value = value.substring(0, 11);
                }
                
                let formatted = '7';
                if (value.length > 1) formatted += ` (${value.substring(1, 4)}`;
                if (value.length > 4) formatted += `) ${value.substring(4, 7)}`;
                if (value.length > 7) formatted += `-${value.substring(7, 9)}`;
                if (value.length > 9) formatted += `-${value.substring(9, 11)}`;
                
                input.value = formatted;
            }
            
            this.validateForm();
        });
        
        this._emailInput.addEventListener('input', () => {
            this.validateForm();
        });

        this.container.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            if (this.validateForm()) {
                this.events.emit(Events.CONTACTS_SUBMIT);
            }
        });
    }

    validateForm(): boolean {
        const errors: string[] = [];
        const email = this.email;
        const phone = this.phone;
        
        // проверка email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            errors.push('Необходимо ввести email');
        }
        
        // проверка телефона
        const phoneDigits = phone.replace(/\D/g, '');
        if (!phone || phoneDigits.length !== 11 || !phoneDigits.startsWith('+7')) {
            errors.push('Введите телефон в формате +7 (XXX) XXX-XX-XX');
        }
        
        this.errors = errors.join('. ');
        this.valid = errors.length === 0;
        
        return this.valid;
    }

    get email(): string {
        return this._emailInput.value.trim();
    }

    set email(value: string) {
        this._emailInput.value = value;
    }

    get phone(): string {
        return this._phoneInput.value.replace(/\D/g, '');
    }

    set phone(value: string) {
        this._phoneInput.value = value;
    }

    getFormData(): Partial<IOrder> {
        return {
            email: this.email,
            phone: this.phone
        };
    }

    render(state: Partial<IOrder> & { valid: boolean; errors: string }): HTMLFormElement {
        super.render(state);

        if (state.email !== undefined) {
            this.email = state.email;
        }
        if (state.phone !== undefined) {
            this.phone = state.phone;
        }

        this.validateForm();

        return this.container;
    }
}