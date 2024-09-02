import { ensureElement } from '../../utils/utils';
import { Component } from './base/Component';
import { PaymentCategory } from '../../types';
import { IEvents } from './base/EventEmitter';

interface IFormState {
	valid: boolean;
	errors: string[];
}

export abstract class Form<T> extends Component<IFormState> {
	protected _submit: HTMLButtonElement;
	protected _errors: HTMLElement;

	constructor(protected container: HTMLFormElement, protected events: IEvents) {
		super(container);

		this._errors = ensureElement<HTMLElement>('.form__errors', this.container);
		this._submit = ensureElement<HTMLButtonElement>(
			'.order__button',
			this.container
		);

		this.container.addEventListener('input', (e: Event) => {
			const target = e.target as HTMLInputElement;
			const field = target.name as keyof T;
			const value = target.value;
			this.onInputChange(field, value);
		});

		this.container.addEventListener('submit', (e: Event) => {
			e.preventDefault();
			this.events.emit(`${this.container.name}:submit`);
		});
	}

	protected onInputChange(field: keyof T, value: string) {
		this.events.emit(`${this.container.name}.${String(field)}:change`, {
			field,
			value,
		});
	}

	set valid(value: boolean) {
		this.setDisabled(this._submit, !value);
	}

	set errors(value: string[]) {
		this.setText(this._errors, value.join('\n'));
	}

	render(state: Partial<T> & IFormState) {
		const { valid, errors, ...inputs } = state;
		super.render({ valid, errors });
		Object.assign(this, inputs);
		return this.container;
	}
}

export interface IFormPaymentAddress {
	payment: PaymentCategory;
	address: string;
}

export interface IItemBehaviour {
	onClick?: (event: MouseEvent) => void;
}

export class FormPaymentAddress extends Form<IFormPaymentAddress> {
	protected toggleButtons: NodeListOf<HTMLButtonElement>;
	private _addressField: HTMLInputElement;
	private _addressError: HTMLElement;
	private _selectedPaymentMethod: PaymentCategory | null = null; // Храним выбранный метод оплаты

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this.toggleButtons = this.container.querySelectorAll(
			'button[data-toggle="toggle"]'
		);

		this._addressField = ensureElement<HTMLInputElement>(
			'input[name="address"]',

			this.container
		);

		this._addressError = ensureElement<HTMLElement>(
			'#address-error',

			this.container
		);

		this.initToggleButtons();

		const onlineButton = Array.from(this.toggleButtons).find(
			(button) => button.name === 'card'
		);

		if (onlineButton) {
			this.handleToggleButton(onlineButton as HTMLButtonElement);
		}

		this._addressField.addEventListener('input', () => this.validateAddress());
	}

	getFormData(): IFormPaymentAddress {
		return {
			payment: this._selectedPaymentMethod,

			address: this._addressField.value,
		};
	}

	initToggleButtons(): void {
		this.toggleButtons.forEach((button) => {
			button.addEventListener('click', () => this.handleToggleButton(button));
		});
	}

	handleToggleButton(clickedButton: HTMLButtonElement): void {
		this.toggleButtons.forEach((button) => {
			this.toggleClass(button, 'button_active', false);
		});

		this.toggleClass(clickedButton, 'button_active', true);

		// Сохраняем выбранный метод оплаты вместо сохранения ссылки на кнопку

		this._selectedPaymentMethod =
			clickedButton.name === 'card'
				? PaymentCategory.online
				: PaymentCategory.cash;

		this.onInputChange('payment', this._selectedPaymentMethod);
	}

	validateAddress(): void {
		const addressValue = this._addressField.value.trim();

		if (addressValue === '') {
			this.setText(this._addressError, 'Заполните поле адрес');

			this.setVisible(this._addressError);

			this.valid = false;
		} else {
			this.setText(this._addressError, '');

			this.setHidden(this._addressError);

			this.valid = true;
		}
	}
}

export interface IFormEmailPhone {
	email: string;
	phone: string;
}

export class FormEmailPhone extends Form<IFormEmailPhone> {
	private _emailField: HTMLInputElement;
	private _emailError: HTMLElement;
	private _phoneField: HTMLInputElement;
	private _phoneError: HTMLElement;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._emailField = ensureElement<HTMLInputElement>(
			'input[name="email"]',
			this.container
		);
		this._emailError = ensureElement<HTMLElement>(
			'#email-error',
			this.container
		);
		this._phoneField = ensureElement<HTMLInputElement>(
			'input[name="phone"]',
			this.container
		);
		this._phoneError = ensureElement<HTMLElement>(
			'#phone-error',
			this.container
		);

		this._emailField.addEventListener('input', () => this.validateEmail());
		this._phoneField.addEventListener('input', () => this.validatePhone());
	}

	getFormData(): IFormEmailPhone {
		return {
			email: this._emailField.value,
			phone: this._phoneField.value,
		};
	}

	validateEmail(): void {
		const emailValue = this._emailField.value.trim();
		if (emailValue === '') {
			this.setText(this._emailError, 'Заполните поле email');
			this.setVisible(this._emailError);
			this.valid = false;
		} else {
			this.setText(this._emailError, '');
			this.setHidden(this._emailError);
			this.valid = true;
		}
	}

	validatePhone(): void {
		const phoneValue = this._phoneField.value.trim();
		if (phoneValue === '') {
			this.setText(this._phoneError, 'Заполните поле телефон');
			this.setVisible(this._phoneError);
			this.valid = false;
		} else {
			this.setText(this._phoneError, '');
			this.setHidden(this._phoneError);
			this.valid = true;
		}
	}
}
