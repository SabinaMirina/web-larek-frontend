import { IEvents } from '../events';
import { createElement } from '../../../utils/utils';
import { Component } from './Component';

interface IBasketView {
	items: HTMLElement[];
	price: number | null;
	selected: string[];
}

export class BasketView extends Component<IBasketView> {
	list: HTMLElement;
	protected _priceElement: HTMLElement;
	price = 0;
	protected _buttonT: HTMLElement;
	protected _items: HTMLElement[] = [];

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);
		this.events = events;

		this.list = this.container.querySelector('.basket__list');
		this._priceElement = this.container.querySelector('.basket__price');
		this._buttonT = this.container.querySelector('.basket__button');

		this._buttonT.addEventListener('click', () =>
			this.events.emit('order:open', { basket: this })
		);
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this.list.replaceChildren(...items);
		} else {
			this.list.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
		}
		this.updateButtonState();
	}

	set selected(items: string[]) {
		if (items.length) {
			this.setDisabled(this._buttonT, false);
		} else {
			this.setDisabled(this._buttonT, true);
		}
	}

	set totalNumber(value: number) {
		this.price = value; // Обновляем числовое значение цены
		if (this._priceElement) {
			this.setText(this._priceElement, String(value));
		}
	}

	renderI(options: { content?: HTMLElement } = {}): HTMLElement {
		if (options.content) {
			this._items.push(options.content); // Добавляем новый элемент в массив
			this.list.appendChild(options.content);
		}
		this.updateButtonState();
		return this.container;
	}

	updateButtonState(): void {
		if (this.list.children.length === 0) {
			this.setDisabled(this._buttonT, true);
		} else {
			this.setDisabled(this._buttonT, false);
		}
	}

	public getItems(): HTMLCollection {
		return this.list.children;
	}

	public getContainer(): HTMLElement {
		return this.container;
	}

	//Метод для очистки всех товаров из корзины
	clearItems(): void {
		this._items = []; // Очищаем массив элементов
		while (this.list.firstChild) {
			this.list.removeChild(this.list.firstChild); // Удаляем все элементы из DOM
		}
		this.updateButtonState(); // Обновляем состояние кнопок после очистки
	}
}
