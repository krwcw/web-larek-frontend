import { FormComponent } from "./base/Form";
import { IOrder } from "../types";
import { ensureElement } from "../utils/utils";

export class OrderForm extends FormComponent<Partial<IOrder>> {
    protected paymentButtons: NodeListOf<HTMLButtonElement>;
    protected addressInput: HTMLInputElement;

    constructor(container: HTMLElement) {
        super(container);
    }

    protected getInputs(): HTMLInputElement[] {
        if (!this.addressInput) {
            return [];
        }
        return [this.addressInput];
    }

    protected validateSpecific(): string[] {
        const errors: string[] = [];
        
        if (!this.paymentButtons) {
            errors.push('Выберите способ оплаты');
            return errors;
        }
        
        if (!Array.from(this.paymentButtons).some(btn => btn.classList.contains('button_active'))) {
            errors.push('Выберите способ оплаты');
        }
        
        return errors;
    }

    render(): HTMLElement {
        this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);
        this.errorsContainer = ensureElement<HTMLElement>('.form__errors', this.container);
        
        this.paymentButtons = this.container.querySelectorAll('.button_alt');
        this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);
        
        this.setupValidation();
        
        this.addressInput.value = '';
        this.paymentButtons.forEach(btn => {
            btn.classList.remove('button_active');
            btn.classList.remove('button_alt-active');
        });
        
        this.validateForm();
        this.hideErrors();

        return this.container;
    }

    setPaymentHandler(handler: (payment: 'online' | 'cash') => void) {
        if (!this.paymentButtons) {
            this.paymentButtons = this.container.querySelectorAll('.button_alt');
        }
        
        this.paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.paymentButtons.forEach(btn => {
                    btn.classList.remove('button_active');
                    btn.classList.remove('button_alt-active');
                });
                
                button.classList.add('button_active');
                button.classList.add('button_alt-active'); 
                
                handler(button.name as 'online' | 'cash');
                this.validateForm();
            });
        });
    }

    setAddressHandler(handler: (address: string) => void) {
        if (!this.addressInput) {
            this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);
        }
        
        this.addressInput.addEventListener('input', () => {
            handler(this.addressInput.value);
            this.validateForm();
        });
    }

    private setupValidation() {
        if (!this.addressInput) {
            this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);
        }
        
        this.addressInput.addEventListener('input', () => this.validateForm());
    }

    getValues(): Partial<IOrder> {
        if (!this.paymentButtons || !this.addressInput) {
            return { payment: undefined, address: '' };
        }
        
        const selectedPayment = Array.from(this.paymentButtons).find(btn => 
            btn.classList.contains('button_active')
        )?.name as 'online' | 'cash' | undefined;

        return {
            payment: selectedPayment,
            address: this.addressInput.value.trim()
        };
    }
}