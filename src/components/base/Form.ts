import { ensureAllElements, ensureElement } from "../../utils/utils";
import { Component } from "./Component";

export abstract class FormComponent<T> extends Component {
    protected submitButton: HTMLButtonElement;
    protected errorsContainer: HTMLElement;
    protected inputList: HTMLInputElement[]

    constructor(container: HTMLElement) {
        super(container);
        this.inputList = ensureAllElements<HTMLInputElement>('.form__input', this.container) 
        this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);
        this.errorsContainer = ensureElement<HTMLElement>('.form__errors', this.container);
    }

    protected abstract getInputs(): HTMLInputElement[];
    protected abstract validateSpecific(): string[];

    render(): HTMLElement {
        this.hideErrors();
        this.validateForm();
        return this.container;
    }

    setSubmitHandler(handler: (event: SubmitEvent) => void) {
        this.container.addEventListener('submit', (event) => {
            if (this.validateForm()) {
                handler(event);
            } else {
                event.preventDefault();
            }
        });
    }

    protected validateForm(): boolean {
        const specificErrors = this.validateSpecific();
        const inputErrors = this.validateInputs();
        
        const allErrors = [...specificErrors, ...inputErrors];
        const isValid = allErrors.length === 0;
        
        this.submitButton.disabled = !isValid;
        
        if (allErrors.length > 0) {
            this.showErrors(allErrors);
        } else {
            this.hideErrors();
        }
        
        return isValid;
    }

    protected validateInputs(): string[] {


        const errors: string[] = [];
        const inputs = this.getInputs();

        inputs.forEach(input => {

            const value = input.value.trim();

            if (value === '' || !input.validity.valid) {
                const customMessage = this.getCustomErrorMessage(input);
                errors.push(customMessage || input.validationMessage);
            }
        });

        return errors;
    }

    private getCustomErrorMessage(input: HTMLInputElement): string | null {
        const fieldName = input.name;
        
        const customMessages: Record<string, string> = {
            address: 'Необходимо указать адрес',
            phone: 'Укажите номер телефона в формате +7 (XXX) XXX-XX-XX',
            email: 'Укажите email в формате example@mail.com'
        };
        
        return customMessages[fieldName] || null;
    }

    protected showErrors(errors: string[]) {
        this.errorsContainer.textContent = errors.join(' ');
        this.errorsContainer.style.display = 'block';
    }

    protected hideErrors() {
        this.errorsContainer.textContent = '';
        this.errorsContainer.style.display = 'none';
    }

    abstract getValues(): T
}