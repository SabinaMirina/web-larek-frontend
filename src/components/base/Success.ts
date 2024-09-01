import { ensureElement } from '../../utils/utils';
import { Component } from './base/Component';
import { IEvents } from './base/EventEmitter';

export interface IOrderSuccess {
	title: string;
	totalAmount: string;
}
export class OrderSuccess extends Component<IOrderSuccess> {
	title: HTMLElement;
	totalAmount: HTMLElement;
	button: HTMLButtonElement;

	constructor(
		container: HTMLElement,
		protected events: IEvents,
		data: IOrderSuccess
	) {
		super(container);
		this.events = events;

		this.title = ensureElement<HTMLElement>(
			'.order-success__title',
			this.container
		);
		this.totalAmount = ensureElement<HTMLElement>(
			'.order-success__description',
			this.container
		);
		this.button = ensureElement<HTMLButtonElement>(
			'.order-success__close',
			this.container
		);

		// Установка значений через методы компонента
		this.setText(this.title, data.title);
		this.setText(this.totalAmount, data.totalAmount);

		// Обработчик события на кнопку закрытия
		this.button.addEventListener('click', () => {
			this.events.emit('order:success', { success: this });
		});
	}

	// Геттер для свойства content, который будет использоваться модальным окном
	get content(): HTMLElement {
		return this.container;
	}
}
