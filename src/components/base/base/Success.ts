import { Component } from '../base/Component';
import { IEvents } from '../events';

export interface IOrdersuccess {
	title: string;
	totalAmount: string;
}
export class Ordersuccess extends Component<IOrdersuccess> {
	title: HTMLElement;
	totalAmount: HTMLElement;
	button: HTMLButtonElement;

	constructor(
		container: HTMLElement,
		protected events: IEvents,
		data: IOrdersuccess
	) {
		super(container);
		this.events = events;

		this.title = this.container.querySelector('.order-success__title');
		this.totalAmount = this.container.querySelector(
			'.order-success__description'
		);
		this.button = this.container.querySelector('.order-success__close');

		if (this.title) {
			this.title.textContent = data.title;
		}
		if (this.totalAmount) {
			this.totalAmount.textContent = data.totalAmount;
		}

		if (this.button) {
			this.button.addEventListener('click', () =>
				this.events.emit('order:success', { success: this })
			);
		}
	}

	// Геттер для свойства content, который будет использоваться модальным окном
	get content(): HTMLElement {
		return this.container;
	}
}
