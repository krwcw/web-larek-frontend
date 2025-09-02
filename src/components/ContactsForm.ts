// components/ContactsForm.ts
import { ensureElement } from "../utils/utils";
import { Component } from "./base/components";

export class ContactsForm extends Component {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;
    protected submitButton: HTMLButtonElement;
    protected errorsContainer: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);
        
        this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
        this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);
        this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);
        this.errorsContainer = ensureElement<HTMLElement>('.form__errors', this.container);

        this.setupPhoneMask();
        this.emailInput.addEventListener('input', () => this.validateForm());

    }

    render(data?: { email?: string; phone?: string }): HTMLElement {
        if (data) {
            this.emailInput.value = data.email || '';
            this.phoneInput.value = data.phone || '';
        }
        
        this.hideErrors();
        this.validateForm();
        return this.container;
    }

    setSubmitHandler(handler: (event: SubmitEvent) => void) {
        this.container.addEventListener('submit', handler);
    }

    setEmailHandler(handler: (email: string) => void) {
        this.emailInput.addEventListener('input', () => {
            handler(this.emailInput.value);
            this.validateForm();
        });
    }

    setPhoneHandler(handler: (phone: string) => void) {
        this.phoneInput.addEventListener('input', () => {
            handler(this.phoneInput.value);
            this.validateForm();
        });
    }

    private validateEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    private validatePhone(phone: string): boolean {
        const phoneRegex = /^\+7\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/;
        return phoneRegex.test(phone);
    }

    private setupPhoneMask() {
    this.phoneInput.addEventListener('input', (event) => {
        const input = event.target as HTMLInputElement;
        let value = input.value;
        
        if (value.length === 1 && ['+', '7', '8'].includes(value)) {
            input.value = '';
            return;
        }
        
        if (value.length === 0) {
            input.value = '+7';
            return;
        }
        
        const cleaned = value.replace(/\D/g, '');
        const formatted = this.formatPhone(cleaned);
        
        input.value = formatted;
        this.validateForm();
    });
}

private formatPhone(cleaned: string): string {
    let numbers = cleaned.startsWith('7') ? cleaned.slice(1) : cleaned;
    
    if (numbers.length === 0) return '+7';
    if (numbers.length <= 3) return `+7 (${numbers}`;
    if (numbers.length <= 6) return `+7 (${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    if (numbers.length <= 8) return `+7 (${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
    return `+7 (${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 8)}-${numbers.slice(8, 10)}`;
}

    private validateForm() {
        const email = this.emailInput.value.trim();
        const phone = this.phoneInput.value.trim();
        
        const isEmailValid = this.validateEmail(email);
        const isPhoneValid = this.validatePhone(phone);
        
        this.submitButton.disabled = !(isEmailValid && isPhoneValid);
        
        if (email.length > 0 || phone.length > 0) {
            if (!isEmailValid || !isPhoneValid) {
                const errors: string[] = [];
                if (!isEmailValid && email.length > 0) errors.push('Введите корректный email');
                if (!isPhoneValid && phone.length > 0) errors.push('Введите телефон в формате +7 (XXX) XXX-XX-XX');
                this.showErrors(errors);
            } else {
                this.hideErrors();
            }
        }
    }

    private showErrors(errors: string[]) {
        this.errorsContainer.textContent = errors.join(', ');
        this.errorsContainer.style.display = 'block';
    }

    private hideErrors() {
        this.errorsContainer.textContent = '';
        this.errorsContainer.style.display = 'none';
    }

    getValues(): { email: string; phone: string } {
        return {
            email: this.emailInput.value.trim(),
            phone: this.phoneInput.value.trim()
        };
    }
}