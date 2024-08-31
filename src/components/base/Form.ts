import { IEvents } from '../base/events';
import { ensureElement } from '../../utils/utils';
import { Component } from './base/Component';
import { PaymentCategory } from '../../types';

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
		this._submit =
			this.container.querySelector<HTMLButtonElement>('.order__button');

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
		this._submit.disabled = !value;
	}

	set errors(value: string[]) {
		this.setText(this._errors, value.join('\n')); // Вывод ошибок через перенос строки
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

	constructor(
		container: HTMLFormElement,
		events: IEvents,
		actions?: IItemBehaviour
	) {
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

		// Инициализация кнопок переключения
		this.initToggleButtons();

		const onlineButton = Array.from(this.toggleButtons).find(
			(button) => button.name === 'card'
		);
		if (onlineButton) {
			this.handleToggleButton(onlineButton as HTMLButtonElement);
		}

		// обработчик изменения поля адреса для валидации
		this._addressField.addEventListener('input', () => this.validateAddress());

		// обработчик на кнопку submit, если он передан в actions
		if (this._submit && actions?.onClick) {
			this._submit.addEventListener('click', (event) => {
				event.preventDefault();
				actions.onClick(event); // Вызов переданного обработчика
			});
		} else {
			console.warn('Submit button or onClick action not provided.');
		}
	}

	getFormData(): IFormPaymentAddress {
		return {
			payment: this.container
				.querySelector('button.button_active')
				?.getAttribute('name') as PaymentCategory,
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
			button.classList.remove('button_active');
		});

		clickedButton.classList.add('button_active');

		const paymentMethod =
			clickedButton.name === 'card'
				? PaymentCategory.online
				: PaymentCategory.cash;
		this.onInputChange('payment', paymentMethod);
	}

	validateAddress(): void {
		const addressValue = this._addressField.value.trim();
		if (addressValue === '') {
			this._addressError.textContent = 'Заполните поле адрес';
			this._addressError.style.display = 'block';
			this.valid = false;
		} else {
			this._addressError.textContent = '';
			this._addressError.style.display = 'none';
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

	constructor(
		container: HTMLFormElement,
		events: IEvents,
		actions?: IItemBehaviour
	) {
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

		// обработчик изменения поля email для валидации
		this._emailField.addEventListener('input', () => this.validateEmail());

		// обработчик изменения поля адреса для валидации
		this._phoneField.addEventListener('input', () => this.validatePhone());

		// Навешиваем обработчик на кнопку submit, если он передан в actions
		if (this._submit && actions?.onClick) {
			this._submit.addEventListener('click', (event) => {
				event.preventDefault();
				actions.onClick(event); // Вызов переданного обработчика
			});
		} else {
			console.warn('Submit button or onClick action not provided.');
		}
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
			this._emailError.textContent = 'Заполните поле email';
			this._emailError.style.display = 'block';
			this.valid = false;
		} else {
			this._emailError.textContent = '';
			this._emailError.style.display = 'none';
			this.valid = true;
		}
	}

	validatePhone(): void {
		const phoneValue = this._phoneField.value.trim();
		if (phoneValue === '') {
			this._phoneError.textContent = 'Заполните поле телефон';
			this._phoneError.style.display = 'block';
			this.valid = false;
		} else {
			this._phoneError.textContent = '';
			this._phoneError.style.display = 'none';
			this.valid = true;
		}
	}
}
