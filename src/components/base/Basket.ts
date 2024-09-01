import { createElement, ensureElement } from '../../utils/utils';
import { Component } from './base/Component';
import { IEvents } from './base/EventEmitter';

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

		this.list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._priceElement = ensureElement<HTMLElement>(
			'.basket__price',
			this.container
		);
		this._buttonT = ensureElement<HTMLButtonElement>(
			'.basket__button',
			this.container
		);

		this._buttonT.addEventListener('click', () =>
			this.events.emit('order:open', { basket: this })
		);
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this.list.replaceChildren(...items);
		} else {
			const emptyBasketText = createElement<HTMLParagraphElement>('p');
			this.setText(emptyBasketText, 'Корзина пуста');
			this.list.replaceChildren(emptyBasketText);
		}
		this.updateButtonState();
	}

	set selected(items: string[]) {
		this.setDisabled(this._buttonT, items.length === 0);
	}

	set totalNumber(value: number) {
		this.price = value; // Обновляем числовое значение цены
		this.setText(this._priceElement, `${value} синапсов`);
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
		this.setDisabled(this._buttonT, this.list.children.length === 0);
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
