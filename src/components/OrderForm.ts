// components/OrderForm.ts
import { ensureElement } from "../utils/utils";
import { Component } from "./base/components";
import { IOrder } from "../types";

export class OrderForm extends Component {
    protected paymentButtons: NodeListOf<HTMLButtonElement>;
    protected addressInput: HTMLInputElement;
    protected submitButton: HTMLButtonElement;
    protected errorsContainer: HTMLElement;

    constructor(container: HTMLElement) {
        super(container);
        
        this.paymentButtons = this.container.querySelectorAll('.button_alt');
        this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);
        this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);
        this.errorsContainer = ensureElement<HTMLElement>('.form__errors', this.container);
    }

    render(data?: Partial<IOrder>): HTMLElement {
        if (data) {
            this.addressInput.value = data.address || '';
            // Установка выбранного способа оплаты
            this.paymentButtons.forEach(button => {
                const isActive = button.name === data.payment;
                button.classList.toggle('button_active', isActive);
            });
        }
        

        this.hideErrors();
        this.validateForm();
        return this.container;
    }

    setSubmitHandler(handler: (event: SubmitEvent) => void) {
        this.container.addEventListener('submit', handler);
    }

    setPaymentHandler(handler: (payment: 'online' | 'cash') => void) {
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
        this.addressInput.addEventListener('input', () => {
            handler(this.addressInput.value);
            this.validateForm();
        });
    }

    private validateForm() {
        const isAddressValid = this.addressInput.value.trim().length > 0;
        const isPaymentSelected = Array.from(this.paymentButtons).some(btn => 
            btn.classList.contains('button_active')
        );
        
        this.submitButton.disabled = !(isAddressValid && isPaymentSelected);
        
        if (this.addressInput.value.length > 0 || isPaymentSelected) {
        if (!isAddressValid || !isPaymentSelected) {
            const errors: string[] = [];
            if (!isAddressValid) errors.push('Введите адрес доставки');
            if (!isPaymentSelected) errors.push('Выберите способ оплаты');
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

    getValues(): Partial<IOrder> {
        const selectedPayment = Array.from(this.paymentButtons).find(btn => 
            btn.classList.contains('button_active')
        )?.name as 'online' | 'cash' | undefined;

        return {
            payment: selectedPayment,
            address: this.addressInput.value.trim()
        };
    }
}