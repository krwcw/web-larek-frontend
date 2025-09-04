import { ensureElement } from "../utils/utils";
import { FormComponent } from "./base/Form";

export class ContactsForm extends FormComponent<{ email: string; phone: string }> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;

    constructor(container: HTMLElement) {
        super(container);
    }

    protected getInputs(): HTMLInputElement[] {
        if (!this.emailInput || !this.phoneInput) {
            return [];
        }
        return [this.emailInput, this.phoneInput];
    }

    protected validateSpecific(): string[] {
        return [];
    }

    render(): HTMLElement {
        this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.container);
        this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.container);
        this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);
        this.errorsContainer = ensureElement<HTMLElement>('.form__errors', this.container);
        
        this.setupPhoneMask();
        this.setupValidation();
        
        this.emailInput.value = '';
        this.phoneInput.value = '';
        
        this.validateForm();
        this.hideErrors();

        return this.container;
    }

    private setupPhoneMask() {
        this.phoneInput.addEventListener('input', (event) => {
            const input = event.target as HTMLInputElement;
            const value = input.value;
            
            const cleaned = value.replace(/\D/g, '');
            const formatted = this.formatPhone(cleaned);
            
            input.value = formatted;
            this.validateForm();
        });
    }

    private setupValidation() {
        this.container.addEventListener('input', () => this.validateForm());
    }

    private formatPhone(cleaned: string): string {
        const numbers = cleaned.startsWith('7') ? cleaned.slice(1) : cleaned;
    
        if (numbers.length === 0) return '+7';
        if (numbers.length <= 3) return `+7 (${numbers}`;
        if (numbers.length <= 6) return `+7 (${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
        if (numbers.length <= 8) return `+7 (${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
        return `+7 (${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6, 8)}-${numbers.slice(8, 10)}`;
    }

    getValues(): { email: string; phone: string } {
        if (!this.emailInput || !this.phoneInput) {
            return { email: '', phone: '' };
        }
        return {
            email: this.emailInput.value.trim(),
            phone: this.phoneInput.value.trim()
        };
    }
}